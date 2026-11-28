
const db = require("../config/db");

// ==========================================
// GET ADMIN INVENTORY
// ==========================================
const getAdminInventory = (req, res) => {
  const sql = `
    SELECT
      p.id AS product_id,
      p.name AS product_name,
      p.sku AS product_sku,
      p.price AS product_price,
      p.sale_price,
      p.is_active AS product_active,

      pv.id AS variant_id,
      pv.size,
      pv.color,
      pv.variant_sku,
      pv.price_override,
      pv.stock_quantity,
      pv.is_active AS variant_active

    FROM products p
    LEFT JOIN product_variants pv
      ON p.id = pv.product_id

    ORDER BY p.id DESC, pv.id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Inventory fetch error:", err.message);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch inventory",
      });
    }

    const inventory = results.map((item) => ({
      ...item,
      stock_quantity: Number(item.stock_quantity || 0),
      product_price: Number(item.product_price || 0),
      sale_price:
        item.sale_price !== null
          ? Number(item.sale_price)
          : null,
      price_override:
        item.price_override !== null
          ? Number(item.price_override)
          : null,
    }));

    const variantInventory = inventory.filter(
      (item) => item.variant_id !== null
    );

    const totalVariants = variantInventory.length;

    const totalStock = variantInventory.reduce(
      (sum, item) => sum + item.stock_quantity,
      0
    );

    const outOfStock = variantInventory.filter(
      (item) => item.stock_quantity === 0
    );

    const lowStock = variantInventory.filter(
      (item) =>
        item.stock_quantity > 0 &&
        item.stock_quantity <= 5
    );

    const activeProducts = [
      ...new Set(
        inventory
          .filter((item) => Number(item.product_active) === 1)
          .map((item) => item.product_id)
      ),
    ].length;

    return res.status(200).json({
      success: true,
      summary: {
        totalProducts: activeProducts,
        totalVariants,
        totalStock,
        lowStockCount: lowStock.length,
        outOfStockCount: outOfStock.length,
      },
      lowStock,
      outOfStock,
      inventory,
    });
  });
};

// ==========================================
// UPDATE VARIANT STOCK
// ==========================================

const updateVariantStock = (req, res) => {
  const variantId = Number(req.params.variantId);
  const { stock_quantity } = req.body;

  if (!Number.isInteger(variantId) || variantId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid variant ID.",
    });
  }

  if (
    stock_quantity === undefined ||
    stock_quantity === null ||
    stock_quantity === "" ||
    !Number.isInteger(Number(stock_quantity)) ||
    Number(stock_quantity) < 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Stock must be a non-negative integer.",
    });
  }

  const newStock = Number(stock_quantity);

  db.getConnection((connectionError, connection) => {
    if (connectionError) {
      console.error("Stock connection error:", connectionError.message);

      return res.status(500).json({
        success: false,
        message: "Database connection failed.",
      });
    }

    connection.beginTransaction((transactionError) => {
      if (transactionError) {
        connection.release();

        return res.status(500).json({
          success: false,
          message: "Failed to start stock transaction.",
        });
      }

      // Get current stock and lock the row
      connection.query(
        `SELECT stock_quantity
         FROM product_variants
         WHERE id = ?
         FOR UPDATE`,
        [variantId],
        (selectError, rows) => {
          if (selectError) {
            return connection.rollback(() => {
              connection.release();

              res.status(500).json({
                success: false,
                message: "Failed to fetch current stock.",
              });
            });
          }

          if (rows.length === 0) {
            return connection.rollback(() => {
              connection.release();

              res.status(404).json({
                success: false,
                message: "Inventory variant not found.",
              });
            });
          }

          const previousStock = Number(rows[0].stock_quantity || 0);
          const changeAmount = newStock - previousStock;

          // Update inventory stock
          connection.query(
            `UPDATE product_variants
             SET stock_quantity = ?
             WHERE id = ?`,
            [newStock, variantId],
            (updateError) => {
              if (updateError) {
                return connection.rollback(() => {
                  connection.release();

                  res.status(500).json({
                    success: false,
                    message: "Failed to update stock.",
                  });
                });
              }

              // Record stock history
              connection.query(
                `INSERT INTO stock_movements
                (variant_id, previous_stock, new_stock, change_amount, note)
                VALUES (?, ?, ?, ?, ?)`,
                [
                  variantId,
                  previousStock,
                  newStock,
                  changeAmount,
                  "Manual stock update",
                ],
                (historyError) => {
                  if (historyError) {
                    return connection.rollback(() => {
                      connection.release();

                      res.status(500).json({
                        success: false,
                        message: "Failed to save stock history.",
                      });
                    });
                  }

                  // Commit both changes
                  connection.commit((commitError) => {
                    if (commitError) {
                      return connection.rollback(() => {
                        connection.release();

                        res.status(500).json({
                          success: false,
                          message: "Failed to commit stock update.",
                        });
                      });
                    }

                    connection.release();

                    return res.status(200).json({
                      success: true,
                      message: "Stock updated and history recorded successfully.",
                      data: {
                        variantId,
                        previous_stock: previousStock,
                        stock_quantity: newStock,
                        change_amount: changeAmount,
                      },
                    });
                  });
                }
              );
            }
          );
        }
      );
    });
  });
};

const getStockHistory = (req, res) => {
  const sql = `
    SELECT
      sm.id,
      sm.variant_id,
      p.name AS product_name,
      p.sku AS product_sku,
      pv.size,
      pv.color,
      pv.variant_sku,
      sm.previous_stock,
      sm.new_stock,
      sm.change_amount,
      sm.note,
      sm.created_at
    FROM stock_movements sm
    INNER JOIN product_variants pv
      ON sm.variant_id = pv.id
    INNER JOIN products p
      ON pv.product_id = p.id
    ORDER BY sm.created_at DESC, sm.id DESC
    LIMIT 100
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Stock history fetch error:", err.message);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch stock history.",
      });
    }

    return res.status(200).json({
      success: true,
      total: results.length,
      history: results,
    });
  });
};

module.exports = {
  getAdminInventory,
  updateVariantStock,
  getStockHistory
};
