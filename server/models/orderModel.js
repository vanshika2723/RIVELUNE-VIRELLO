
const db = require("../config/db");

// Create order and decrement stock atomically
const createOrder = async (orderData, items) => {
  const connection = await new Promise((resolve, reject) => {
    db.getConnection((err, conn) => {
      if (err) return reject(err);
      resolve(conn);
    });
  });

  const query = (sql, values = []) =>
    new Promise((resolve, reject) => {
      connection.query(sql, values, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

  try {
    await new Promise((resolve, reject) => {
      connection.beginTransaction((err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    // Combine duplicate cart lines for the same variant
    const stockRequirements = {};

    for (const item of items) {
      const variantId = Number(item.variant_id);
      const quantity = Number(item.quantity);

      if (!Number.isInteger(variantId) || variantId <= 0) {
        throw new Error("Invalid product variant.");
      }

      stockRequirements[variantId] =
        (stockRequirements[variantId] || 0) + quantity;
    }

    // Lock variant rows in a consistent order
    const variantIds = Object.keys(stockRequirements)
      .map(Number)
      .sort((a, b) => a - b);

    const placeholders = variantIds.map(() => "?").join(",");

    const variants = await query(
      `
        SELECT id, stock_quantity, is_active
        FROM product_variants
        WHERE id IN (${placeholders})
        ORDER BY id
        FOR UPDATE
      `,
      variantIds
    );

    // Ensure all variants still exist and are active
    if (variants.length !== variantIds.length) {
      throw new Error("One or more selected variants are unavailable.");
    }

    // Verify and decrement stock while rows are locked
    for (const variant of variants) {
      const required = stockRequirements[variant.id];
      const available = Number(variant.stock_quantity || 0);

      if (Number(variant.is_active) !== 1) {
        throw new Error("A selected product variant is inactive.");
      }

      if (available < required) {
        throw new Error("Insufficient stock for one or more products.");
      }

      const updateResult = await query(
        `
          UPDATE product_variants
          SET stock_quantity = stock_quantity - ?
          WHERE id = ?
            AND stock_quantity >= ?
            AND is_active = 1
        `,
        [required, variant.id, required]
      );

      if (updateResult.affectedRows !== 1) {
        throw new Error("Stock update failed. Please try again.");
      }
    }

    // Insert order
    const orderQuery = `
      INSERT INTO orders (
        order_number,
        customer_name,
        phone,
        email,
        province,
        city,
        postal_code,
        address,
        order_notes,
        payment_method,
        subtotal,
        shipping_fee,
        total_amount
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const orderValues = [
      orderData.order_number,
      orderData.customer_name,
      orderData.phone,
      orderData.email || null,
      orderData.province,
      orderData.city,
      orderData.postal_code || null,
      orderData.address,
      orderData.order_notes || null,
      orderData.payment_method,
      orderData.subtotal,
      orderData.shipping_fee,
      orderData.total_amount,
    ];

    const orderResult = await query(orderQuery, orderValues);
    const orderId = orderResult.insertId;

    // Insert order items
    const itemQuery = `
      INSERT INTO order_items (
        order_id,
        product_id,
        product_name,
        product_image,
        size,
        color,
        quantity,
        unit_price,
        total_price
      )
      VALUES ?
    `;

    const itemValues = items.map((item) => [
      orderId,
      item.product_id,
      item.product_name,
      item.product_image || null,
      item.size,
      item.color || null,
      item.quantity,
      item.unit_price,
      item.total_price,
    ]);

    await query(itemQuery, [itemValues]);

    // Commit order + stock together
    await new Promise((resolve, reject) => {
      connection.commit((err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    return {
      id: orderId,
      order_number: orderData.order_number,
    };
  } catch (error) {
    await new Promise((resolve) => {
      connection.rollback(() => resolve());
    });

    throw error;
  } finally {
    connection.release();
  }
};
// Find an order using order number and customer phone
const getOrderByOrderNumberAndPhone = (orderNumber, phone) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT *
      FROM orders
      WHERE order_number = ? AND phone = ?
      LIMIT 1
    `;

    db.query(query, [orderNumber, phone], (err, results) => {
      if (err) {
        return reject(err);
      }

      if (results.length === 0) {
        return resolve(null);
      }

      const order = results[0];

      // Fetch products belonging to this order
      const itemsQuery = `
        SELECT product_name, product_image, size, color,
               quantity, unit_price, total_price
        FROM order_items
        WHERE order_id = ?
      `;

      db.query(itemsQuery, [order.id], (itemsError, items) => {
        if (itemsError) {
          return reject(itemsError);
        }

        resolve({
          ...order,
          items,
        });
      });
    });
  });
};

// Get wallet payments for admin review
const getWalletPayments = (paymentStatus = null) => {
  return new Promise((resolve, reject) => {
    let query = `
      SELECT
        id,
        order_number,
        customer_name,
        phone,
        payment_method,
        transaction_id,
        payment_proof,
        payment_status,
        payment_review_notes,
        subtotal,
        shipping_fee,
        total_amount,
        order_status,
        created_at
      FROM orders
      WHERE payment_method IN ('easypaisa', 'jazzcash')
    `;

    const values = [];

    if (paymentStatus) {
      query += ` AND payment_status = ?`;
      values.push(paymentStatus);
    }

    query += ` ORDER BY created_at DESC`;

    db.query(query, values, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

// ========================================
// ADMIN PAYMENT ANALYTICS
// ========================================

// Get payment analytics summary
const getAdminPaymentAnalytics = () => {
  return new Promise((resolve, reject) => {
    const summaryQuery = `
      SELECT
        COUNT(*) AS total_orders,
        COALESCE(SUM(total_amount), 0) AS total_order_value,

        SUM(
          CASE
            WHEN payment_method IN ('easypaisa', 'jazzcash')
            AND payment_status = 'Payment Verified'
            THEN total_amount
            ELSE 0
          END
        ) AS verified_wallet_revenue,

        SUM(
          CASE
            WHEN payment_method IN ('easypaisa', 'jazzcash')
            AND payment_status = 'Payment Verification Pending'
            THEN 1
            ELSE 0
          END
        ) AS pending_payments,

        SUM(
          CASE
            WHEN payment_method IN ('easypaisa', 'jazzcash')
            AND payment_status = 'Payment Verified'
            THEN 1
            ELSE 0
          END
        ) AS verified_payments,

        SUM(
          CASE
            WHEN payment_method IN ('easypaisa', 'jazzcash')
            AND payment_status = 'Payment Rejected'
            THEN 1
            ELSE 0
          END
        ) AS rejected_payments

      FROM orders
    `;

    const methodsQuery = `
      SELECT
        payment_method,
        COUNT(*) AS total_orders,
        COALESCE(SUM(total_amount), 0) AS total_amount
      FROM orders
      GROUP BY payment_method
      ORDER BY total_orders DESC
    `;

    const trendQuery = `
      SELECT
        DATE(created_at) AS date,
        COUNT(*) AS total_orders,
        COALESCE(SUM(total_amount), 0) AS total_amount
      FROM orders
      WHERE created_at >= CURDATE() - INTERVAL 6 DAY
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    db.query(summaryQuery, (summaryError, summaryResults) => {
      if (summaryError) {
        return reject(summaryError);
      }

      db.query(methodsQuery, (methodsError, methodsResults) => {
        if (methodsError) {
          return reject(methodsError);
        }

        db.query(trendQuery, (trendError, trendResults) => {
          if (trendError) {
            return reject(trendError);
          }

          resolve({
            summary: summaryResults[0],
            paymentMethods: methodsResults,
            dailyTrend: trendResults,
          });
        });
      });
    });
  });
};

// ========================================
// MONTHLY PAYMENT ANALYTICS
// ========================================

// Calculate growth percentage safely
const calculateGrowth = (current, previous) => {
  const currentValue = Number(current || 0);
  const previousValue = Number(previous || 0);

  if (previousValue === 0) {
    return currentValue > 0 ? 100 : 0;
  }

  return Number(
    (((currentValue - previousValue) / previousValue) * 100).toFixed(2)
  );
};

// Get current month vs previous month analytics
const getMonthlyPaymentAnalytics = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT
        COALESCE(SUM(
          CASE
            WHEN created_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
             AND created_at < DATE_FORMAT(
               CURDATE() + INTERVAL 1 MONTH, '%Y-%m-01'
             )
            THEN 1
            ELSE 0
          END
        ), 0) AS current_month_orders,

        COALESCE(SUM(
          CASE
            WHEN created_at >= DATE_FORMAT(
              CURDATE() - INTERVAL 1 MONTH, '%Y-%m-01'
            )
             AND created_at < DATE_FORMAT(CURDATE(), '%Y-%m-01')
            THEN 1
            ELSE 0
          END
        ), 0) AS previous_month_orders,

        COALESCE(SUM(
          CASE
            WHEN created_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
             AND created_at < DATE_FORMAT(
               CURDATE() + INTERVAL 1 MONTH, '%Y-%m-01'
             )
            THEN total_amount
            ELSE 0
          END
        ), 0) AS current_month_order_value,

        COALESCE(SUM(
          CASE
            WHEN created_at >= DATE_FORMAT(
              CURDATE() - INTERVAL 1 MONTH, '%Y-%m-01'
            )
             AND created_at < DATE_FORMAT(CURDATE(), '%Y-%m-01')
            THEN total_amount
            ELSE 0
          END
        ), 0) AS previous_month_order_value,

        COALESCE(SUM(
          CASE
            WHEN created_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
             AND created_at < DATE_FORMAT(
               CURDATE() + INTERVAL 1 MONTH, '%Y-%m-01'
             )
             AND payment_method IN ('easypaisa', 'jazzcash')
             AND payment_status = 'Payment Verified'
            THEN total_amount
            ELSE 0
          END
        ), 0) AS current_month_verified_wallet_revenue,

        COALESCE(SUM(
          CASE
            WHEN created_at >= DATE_FORMAT(
              CURDATE() - INTERVAL 1 MONTH, '%Y-%m-01'
            )
             AND created_at < DATE_FORMAT(CURDATE(), '%Y-%m-01')
             AND payment_method IN ('easypaisa', 'jazzcash')
             AND payment_status = 'Payment Verified'
            THEN total_amount
            ELSE 0
          END
        ), 0) AS previous_month_verified_wallet_revenue

      FROM orders
      WHERE created_at >= DATE_FORMAT(
        CURDATE() - INTERVAL 1 MONTH, '%Y-%m-01'
      )
        AND created_at < DATE_FORMAT(
          CURDATE() + INTERVAL 1 MONTH, '%Y-%m-01'
        )
    `;

    db.query(query, (err, results) => {
      if (err) {
        return reject(err);
      }

      const data = results[0];

      const currentOrders = Number(data.current_month_orders || 0);
      const previousOrders = Number(data.previous_month_orders || 0);

      const currentOrderValue = Number(
        data.current_month_order_value || 0
      );
      const previousOrderValue = Number(
        data.previous_month_order_value || 0
      );

      const currentWalletRevenue = Number(
        data.current_month_verified_wallet_revenue || 0
      );
      const previousWalletRevenue = Number(
        data.previous_month_verified_wallet_revenue || 0
      );

      resolve({
        currentMonth: {
          orders: currentOrders,
          orderValue: currentOrderValue,
          verifiedWalletRevenue: currentWalletRevenue,
        },

        previousMonth: {
          orders: previousOrders,
          orderValue: previousOrderValue,
          verifiedWalletRevenue: previousWalletRevenue,
        },

        growth: {
          orders: calculateGrowth(currentOrders, previousOrders),
          orderValue: calculateGrowth(
            currentOrderValue,
            previousOrderValue
          ),
          verifiedWalletRevenue: calculateGrowth(
            currentWalletRevenue,
            previousWalletRevenue
          ),
        },
      });
    });
  });
};
// Validate products, variants, prices, and stock using database records

const validateOrderItems = async (items) => {
  const validatedItems = [];
  const requestedStock = {};

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Order items are missing or invalid.");
  }

  for (const [index, item] of items.entries()) {
    console.log(`ORDER ITEM ${index + 1} RECEIVED:`, item);

    const productId = Number(item.product_id);
    const quantity = Number(item.quantity);
    const size = String(item.size ?? "").trim();
    const color = String(item.color ?? "").trim();

    // Detailed input validation
    if (!Number.isInteger(productId) || productId <= 0) {
      throw new Error(`Item ${index + 1}: Invalid product ID (${item.product_id}).`);
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new Error(`Item ${index + 1}: Invalid quantity (${item.quantity}).`);
    }

    if (!size) {
      throw new Error(`Item ${index + 1}: Product size is missing.`);
    }

    if (!color) {
      throw new Error(`Item ${index + 1}: Product color is missing.`);
    }

    const query = `
      SELECT
        p.id AS product_id,
        p.name AS product_name,
        p.price AS product_price,
        p.sale_price,
        p.is_active AS product_active,
        v.id AS variant_id,
        v.size,
        v.color,
        v.price_override,
        v.stock_quantity,
        v.is_active AS variant_active
      FROM products p
      LEFT JOIN product_variants v
        ON v.product_id = p.id
        AND TRIM(v.size) = ?
        AND TRIM(v.color) = ?
      WHERE p.id = ?
      LIMIT 1
    `;

    const results = await new Promise((resolve, reject) => {
      db.query(query, [size, color, productId], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });

    const product = results[0];

    if (!product || Number(product.product_active) !== 1) {
      throw new Error(`Product ID ${productId} is unavailable.`);
    }

    if (!product.variant_id || Number(product.variant_active) !== 1) {
      throw new Error(
        `${product.product_name}: Variant not found for size "${size}" and color "${color}".`
      );
    }

    const unitPrice =
      product.price_override !== null
        ? Number(product.price_override)
        : product.sale_price !== null
        ? Number(product.sale_price)
        : Number(product.product_price);

    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
      throw new Error(`${product.product_name}: Invalid database price.`);
    }

    const stockKey = String(product.variant_id);

    requestedStock[stockKey] =
      (requestedStock[stockKey] || 0) + quantity;

    const availableStock = Number(product.stock_quantity || 0);

    if (requestedStock[stockKey] > availableStock) {
      throw new Error(
        `${product.product_name} (${size}, ${color}): Insufficient stock. Available: ${availableStock}.`
      );
    }

    validatedItems.push({
      product_id: product.product_id,
      variant_id: product.variant_id,
      product_name: product.product_name,
      product_image: item.product_image || null,
      size: product.size,
      color: product.color,
      quantity,
      unit_price: unitPrice,
      total_price: unitPrice * quantity,
    });
  }

  return validatedItems;
};

module.exports = {
  createOrder,
  validateOrderItems,
  getOrderByOrderNumberAndPhone,
  getWalletPayments,
  getAdminPaymentAnalytics,
  getMonthlyPaymentAnalytics,
};