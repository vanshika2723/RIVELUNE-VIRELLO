
const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ==========================================
// GET ALL PRODUCTS WITH CATEGORY, IMAGE & VARIANTS
// ==========================================
router.get("/", (req, res) => {
  const sql = `
    SELECT
      p.id,
      p.sku,
      p.name,
      p.slug,
      p.description,
      p.fabric,
      p.fit,
      p.care_instructions,
      p.category_id,
      p.price,
      p.sale_price,
      p.stock,
      p.is_active,
      p.created_at,
      c.name AS category_name,
      c.gender AS category_gender,
      (
        SELECT pi.image_url
        FROM product_images pi
        WHERE pi.product_id = p.id
        ORDER BY pi.is_main DESC, pi.sort_order ASC, pi.id ASC
        LIMIT 1
      ) AS main_image,
      (
        SELECT pi.alt_text
        FROM product_images pi
        WHERE pi.product_id = p.id
        ORDER BY pi.is_main DESC, pi.sort_order ASC, pi.id ASC
        LIMIT 1
      ) AS image_alt
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ORDER BY p.id DESC
  `;

  db.query(sql, (err, products) => {
    if (err) {
      console.error("Products fetch error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch products",
      });
    }

    if (!products.length) {
      return res.json({
        success: true,
        products: [],
      });
    }

    const productIds = products.map((product) => product.id);
    const placeholders = productIds.map(() => "?").join(",");

    const variantSql = `
      SELECT
        id,
        product_id,
        size,
        color,
        variant_sku,
        price_override,
        stock_quantity,
        is_active
      FROM product_variants
      WHERE product_id IN (${placeholders})
      ORDER BY product_id ASC, size ASC, color ASC
    `;

    db.query(variantSql, productIds, (variantErr, variants) => {
      if (variantErr) {
        console.error("Product variants fetch error:", variantErr);
        return res.status(500).json({
          success: false,
          message: "Failed to fetch product variants",
        });
      }

      const variantMap = {};

      variants.forEach((variant) => {
        if (!variantMap[variant.product_id]) {
          variantMap[variant.product_id] = [];
        }

        variantMap[variant.product_id].push(variant);
      });

      return res.json({
        success: true,
        products: products.map((product) => ({
          ...product,
          variants: variantMap[product.id] || [],
        })),
      });
    });
  });
});

// ==========================================
// CREATE PRODUCT WITH IMAGE & VARIANTS
// ==========================================
router.post("/", (req, res) => {
  const {
    sku,
    name,
    description,
    fabric,
    fit,
    care_instructions,
    category_id,
    price,
    sale_price,
    stock,
    image_url,
    image_alt,
    variants,
    is_active,
  } = req.body;

  if (!sku || !name || price === undefined || price === "") {
    return res.status(400).json({
      success: false,
      message: "SKU, product name and price are required",
    });
  }

  if (variants !== undefined && !Array.isArray(variants)) {
    return res.status(400).json({
      success: false,
      message: "Variants must be an array",
    });
  }

  const cleanSku = String(sku).trim();
  const cleanName = String(name).trim();
  const numericPrice = Number(price);

  const numericSalePrice =
    sale_price === "" || sale_price === null || sale_price === undefined
      ? null
      : Number(sale_price);

  const numericStock = Number(stock ?? 0);
  const productStatus = is_active === undefined ? 1 : Number(is_active);

  const productCategoryId =
    category_id === "" || category_id === null || category_id === undefined
      ? null
      : Number(category_id);

  if (!cleanSku || !cleanName) {
    return res.status(400).json({
      success: false,
      message: "SKU and product name cannot be empty",
    });
  }

  if (!Number.isFinite(numericPrice) || numericPrice < 0) {
    return res.status(400).json({
      success: false,
      message: "Enter a valid product price",
    });
  }

  if (
    numericSalePrice !== null &&
    (!Number.isFinite(numericSalePrice) ||
      numericSalePrice < 0 ||
      numericSalePrice > numericPrice)
  ) {
    return res.status(400).json({
      success: false,
      message: "Sale price must be valid and cannot exceed regular price",
    });
  }

  if (!Number.isInteger(numericStock) || numericStock < 0) {
    return res.status(400).json({
      success: false,
      message: "Stock must be a non-negative integer",
    });
  }

  if (![0, 1].includes(productStatus)) {
    return res.status(400).json({
      success: false,
      message: "Invalid product status",
    });
  }

  if (
    productCategoryId !== null &&
    (!Number.isInteger(productCategoryId) || productCategoryId <= 0)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid category ID",
    });
  }

  const productVariants = Array.isArray(variants) ? variants : [];
  const variantCombinations = new Set();

  for (const variant of productVariants) {
    if (!variant || typeof variant !== "object") {
      return res.status(400).json({
        success: false,
        message: "Invalid product variant",
      });
    }

    const size = String(variant.size || "").trim();
    const color = String(variant.color || "").trim();

    if (!size || !color) {
      return res.status(400).json({
        success: false,
        message: "Every variant must have a size and color",
      });
    }

    const combination = `${size.toLowerCase()}-${color.toLowerCase()}`;

    if (variantCombinations.has(combination)) {
      return res.status(400).json({
        success: false,
        message: "Duplicate size and color combinations are not allowed",
      });
    }

    variantCombinations.add(combination);

    const variantStock = Number(variant.stock_quantity ?? 0);

    if (!Number.isInteger(variantStock) || variantStock < 0) {
      return res.status(400).json({
        success: false,
        message: "Variant stock must be a non-negative integer",
      });
    }

    if (
      variant.price_override !== undefined &&
      variant.price_override !== null &&
      variant.price_override !== "" &&
      (!Number.isFinite(Number(variant.price_override)) ||
        Number(variant.price_override) < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid variant price",
      });
    }

    if (
      variant.is_active !== undefined &&
      ![0, 1].includes(Number(variant.is_active))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid variant status",
      });
    }
  }

  const slugBase = cleanName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const skuSlug = cleanSku
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const generatedSlug = `${slugBase}-${skuSlug}`;

  // ==========================================
  // DATABASE TRANSACTION
  // ==========================================
  db.getConnection((connectionError, connection) => {
    if (connectionError) {
      console.error("Product connection error:", connectionError);
      return res.status(500).json({
        success: false,
        message: "Database connection failed",
      });
    }

    connection.beginTransaction((transactionError) => {
      if (transactionError) {
        connection.release();

        return res.status(500).json({
          success: false,
          message: "Failed to start product transaction",
        });
      }

      const rollback = (statusCode, message, error = null) => {
        connection.rollback(() => {
          connection.release();

          if (error) {
            console.error("Create product error:", error);
          }

          if (!res.headersSent) {
            res.status(statusCode).json({
              success: false,
              message,
            });
          }
        });
      };

      const productSql = `
        INSERT INTO products (
          sku,
          name,
          slug,
          description,
          fabric,
          fit,
          care_instructions,
          category_id,
          price,
          sale_price,
          stock,
          is_active
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const productValues = [
        cleanSku,
        cleanName,
        generatedSlug,
        description || null,
        fabric || null,
        fit || null,
        care_instructions || null,
        productCategoryId,
        numericPrice,
        numericSalePrice,
        numericStock,
        productStatus,
      ];

      connection.query(productSql, productValues, (productError, productResult) => {
        if (productError) {
          const duplicate = productError.code === "ER_DUP_ENTRY";
          const invalidCategory =
            productError.code === "ER_NO_REFERENCED_ROW_2";

          return rollback(
            duplicate ? 409 : invalidCategory ? 400 : 500,
            duplicate
              ? "SKU or product slug already exists"
              : invalidCategory
                ? "Selected category does not exist"
                : "Failed to create product",
            productError
          );
        }

        const productId = productResult.insertId;

        // SAVE IMAGE
        const saveImage = (callback) => {
          if (!image_url || !String(image_url).trim()) {
            return callback(null);
          }

          const imageSql = `
            INSERT INTO product_images (
              product_id,
              image_url,
              alt_text,
              sort_order,
              is_main
            )
            VALUES (?, ?, ?, 0, 1)
          `;

          connection.query(
            imageSql,
            [
              productId,
              String(image_url).trim(),
              image_alt || cleanName,
            ],
            (imageError) => callback(imageError || null)
          );
        };

        // SAVE VARIANTS
        const saveVariants = (callback) => {
          if (!productVariants.length) {
            return callback(null);
          }

          const variantSql = `
            INSERT INTO product_variants (
              product_id,
              size,
              color,
              variant_sku,
              price_override,
              stock_quantity,
              is_active
            )
            VALUES ?
          `;

          const variantValues = productVariants.map((variant) => [
            productId,
            String(variant.size).trim(),
            String(variant.color).trim(),
            variant.variant_sku
              ? String(variant.variant_sku).trim()
              : null,
            variant.price_override === "" ||
            variant.price_override === null ||
            variant.price_override === undefined
              ? null
              : Number(variant.price_override),
            Number(variant.stock_quantity ?? 0),
            variant.is_active === undefined
              ? 1
              : Number(variant.is_active),
          ]);

          connection.query(
            variantSql,
            [variantValues],
            (variantError) => callback(variantError || null)
          );
        };

        saveImage((imageError) => {
          if (imageError) {
            return rollback(500, "Failed to save product image", imageError);
          }

          saveVariants((variantError) => {
            if (variantError) {
              return rollback(
                500,
                "Failed to save product variants",
                variantError
              );
            }

            connection.commit((commitError) => {
              if (commitError) {
                return rollback(500, "Failed to save product", commitError);
              }

              connection.release();

              return res.status(201).json({
                success: true,
                message: "Product created successfully",
                productId,
              });
            });
          });
        });
      });
    });
  });
});

// ==========================================
// UPDATE COMPLETE PRODUCT
// ==========================================
router.put("/:id", (req, res) => {
  const productId = Number(req.params.id);

  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid product ID",
    });
  }

  const {
    sku,
    name,
    description,
    fabric,
    fit,
    care_instructions,
    category_id,
    price,
    sale_price,
    stock,
    image_url,
    image_alt,
    variants,
    is_active,
  } = req.body;

  if (!sku || !name || price === undefined || price === "") {
    return res.status(400).json({
      success: false,
      message: "SKU, product name and price are required",
    });
  }

  if (variants !== undefined && !Array.isArray(variants)) {
    return res.status(400).json({
      success: false,
      message: "Variants must be an array",
    });
  }

  const cleanSku = String(sku).trim();
  const cleanName = String(name).trim();
  const numericPrice = Number(price);
  const numericSalePrice =
    sale_price === "" || sale_price === null || sale_price === undefined
      ? null
      : Number(sale_price);
  const numericStock = Number(stock ?? 0);
  const productStatus = Number(is_active ?? 1);

  const categoryId =
    category_id === "" || category_id === null || category_id === undefined
      ? null
      : Number(category_id);

  if (!cleanSku || !cleanName) {
    return res.status(400).json({
      success: false,
      message: "SKU and name cannot be empty",
    });
  }

  if (!Number.isFinite(numericPrice) || numericPrice < 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid product price",
    });
  }

  if (
    numericSalePrice !== null &&
    (!Number.isFinite(numericSalePrice) ||
      numericSalePrice < 0 ||
      numericSalePrice > numericPrice)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid sale price",
    });
  }

  if (!Number.isInteger(numericStock) || numericStock < 0) {
    return res.status(400).json({
      success: false,
      message: "Stock must be a non-negative integer",
    });
  }

  if (![0, 1].includes(productStatus)) {
    return res.status(400).json({
      success: false,
      message: "Invalid product status",
    });
  }

  if (
    categoryId !== null &&
    (!Number.isInteger(categoryId) || categoryId <= 0)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid category ID",
    });
  }

  const productVariants = variants === undefined ? null : variants;
  const combinations = new Set();

  if (productVariants) {
    for (const variant of productVariants) {
      const size = String(variant?.size || "").trim();
      const color = String(variant?.color || "").trim();
      const variantStock = Number(variant?.stock_quantity ?? 0);

      if (!size || !color) {
        return res.status(400).json({
          success: false,
          message: "Every variant needs size and color",
        });
      }

      const combination = `${size.toLowerCase()}-${color.toLowerCase()}`;

      if (combinations.has(combination)) {
        return res.status(400).json({
          success: false,
          message: "Duplicate size and color combinations",
        });
      }

      combinations.add(combination);

      if (!Number.isInteger(variantStock) || variantStock < 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid variant stock",
        });
      }

      if (
        variant.price_override !== undefined &&
        variant.price_override !== null &&
        variant.price_override !== "" &&
        (!Number.isFinite(Number(variant.price_override)) ||
          Number(variant.price_override) < 0)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid variant price",
        });
      }

      if (
        variant.is_active !== undefined &&
        ![0, 1].includes(Number(variant.is_active))
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid variant status",
        });
      }
    }
  }

  const slugBase = cleanName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const skuSlug = cleanSku
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const generatedSlug = `${slugBase}-${skuSlug}`;

  db.getConnection((connectionError, connection) => {
    if (connectionError) {
      return res.status(500).json({
        success: false,
        message: "Database connection failed",
      });
    }

    connection.beginTransaction((transactionError) => {
      if (transactionError) {
        connection.release();
        return res.status(500).json({
          success: false,
          message: "Failed to start transaction",
        });
      }

      const rollback = (status, message, error) => {
        connection.rollback(() => {
          connection.release();

          if (error) {
            console.error("Update product error:", error);
          }

          if (!res.headersSent) {
            res.status(status).json({
              success: false,
              message,
            });
          }
        });
      };

      const updateSql = `
        UPDATE products SET
          sku = ?,
          name = ?,
          slug = ?,
          description = ?,
          fabric = ?,
          fit = ?,
          care_instructions = ?,
          category_id = ?,
          price = ?,
          sale_price = ?,
          stock = ?,
          is_active = ?
        WHERE id = ?
      `;

      const updateValues = [
        cleanSku,
        cleanName,
        generatedSlug,
        description || null,
        fabric || null,
        fit || null,
        care_instructions || null,
        categoryId,
        numericPrice,
        numericSalePrice,
        numericStock,
        productStatus,
        productId,
      ];

      connection.query(updateSql, updateValues, (updateError, result) => {
        if (updateError) {
          const duplicate = updateError.code === "ER_DUP_ENTRY";

          return rollback(
            duplicate ? 409 : 500,
            duplicate
              ? "SKU or product slug already exists"
              : "Failed to update product",
            updateError
          );
        }

        if (result.affectedRows === 0) {
          connection.query(
            "SELECT id FROM products WHERE id = ?",
            [productId],
            (checkError, rows) => {
              if (checkError) {
                return rollback(500, "Failed to verify product", checkError);
              }

              if (!rows.length) {
                return rollback(404, "Product not found");
              }

              saveRelatedData();
            }
          );
        } else {
          saveRelatedData();
        }
      });

      const saveRelatedData = () => {
        const saveImage = (callback) => {
          if (!image_url || !String(image_url).trim()) {
            return callback(null);
          }

          const imageSql = `
            UPDATE product_images
            SET image_url = ?, alt_text = ?, is_main = 1
            WHERE product_id = ? AND is_main = 1
          `;

          connection.query(
            imageSql,
            [String(image_url).trim(), image_alt || cleanName, productId],
            (imageError, imageResult) => {
              if (imageError) return callback(imageError);

              if (imageResult.affectedRows > 0) {
                return callback(null);
              }

              connection.query(
                `INSERT INTO product_images
                  (product_id, image_url, alt_text, sort_order, is_main)
                 VALUES (?, ?, ?, 0, 1)`,
                [productId, String(image_url).trim(), image_alt || cleanName],
                callback
              );
            }
          );
        };

        const saveVariants = (callback) => {
          if (productVariants === null) {
            return callback(null);
          }

          connection.query(
            "DELETE FROM product_variants WHERE product_id = ?",
            [productId],
            (deleteError) => {
              if (deleteError) return callback(deleteError);

              if (!productVariants.length) return callback(null);

              const values = productVariants.map((variant) => [
                productId,
                String(variant.size).trim(),
                String(variant.color).trim(),
                variant.variant_sku
                  ? String(variant.variant_sku).trim()
                  : null,
                variant.price_override === "" ||
                variant.price_override === null ||
                variant.price_override === undefined
                  ? null
                  : Number(variant.price_override),
                Number(variant.stock_quantity ?? 0),
                Number(variant.is_active ?? 1),
              ]);

              connection.query(
                `INSERT INTO product_variants
                  (product_id, size, color, variant_sku,
                   price_override, stock_quantity, is_active)
                 VALUES ?`,
                [values],
                callback
              );
            }
          );
        };

        saveImage((imageError) => {
          if (imageError) {
            return rollback(500, "Failed to update product image", imageError);
          }

          saveVariants((variantError) => {
            if (variantError) {
              return rollback(500, "Failed to update product variants", variantError);
            }

            connection.commit((commitError) => {
              if (commitError) {
                return rollback(500, "Failed to save product changes", commitError);
              }

              connection.release();

              return res.json({
                success: true,
                message: "Product updated successfully",
                productId,
              });
            });
          });
        });
      };
    });
  });
});

// ==========================================
// DELETE PRODUCT WITH IMAGES & VARIANTS
// ==========================================
router.delete("/:id", (req, res) => {
  const productId = Number(req.params.id);

  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid product ID",
    });
  }

  db.getConnection((connectionError, connection) => {
    if (connectionError) {
      console.error("Delete product connection error:", connectionError);

      return res.status(500).json({
        success: false,
        message: "Database connection failed",
      });
    }

    connection.beginTransaction((transactionError) => {
      if (transactionError) {
        connection.release();

        return res.status(500).json({
          success: false,
          message: "Failed to start delete transaction",
        });
      }

      const rollback = (status, message, error = null) => {
        connection.rollback(() => {
          connection.release();

          if (error) {
            console.error("Delete product error:", error);
          }

          if (!res.headersSent) {
            res.status(status).json({
              success: false,
              message,
            });
          }
        });
      };

      // First verify product exists
      connection.query(
        "SELECT id FROM products WHERE id = ?",
        [productId],
        (checkError, rows) => {
          if (checkError) {
            return rollback(
              500,
              "Failed to verify product",
              checkError
            );
          }

          if (!rows.length) {
            return rollback(404, "Product not found");
          }

          // Delete product variants
          connection.query(
            "DELETE FROM product_variants WHERE product_id = ?",
            [productId],
            (variantError) => {
              if (variantError) {
                return rollback(
                  500,
                  "Failed to delete product variants",
                  variantError
                );
              }

              // Delete product images
              connection.query(
                "DELETE FROM product_images WHERE product_id = ?",
                [productId],
                (imageError) => {
                  if (imageError) {
                    return rollback(
                      500,
                      "Failed to delete product images",
                      imageError
                    );
                  }

                  // Finally delete product
                  connection.query(
                    "DELETE FROM products WHERE id = ?",
                    [productId],
                    (deleteError, result) => {
                      if (deleteError) {
                        const foreignKeyError =
                          deleteError.code === "ER_ROW_IS_REFERENCED_2";

                        return rollback(
                          foreignKeyError ? 409 : 500,
                          foreignKeyError
                            ? "This product is linked to existing records and cannot be deleted."
                            : "Failed to delete product",
                          deleteError
                        );
                      }

                      connection.commit((commitError) => {
                        if (commitError) {
                          return rollback(
                            500,
                            "Failed to complete product deletion",
                            commitError
                          );
                        }

                        connection.release();

                        return res.json({
                          success: true,
                          message: "Product deleted successfully",
                          productId,
                        });
                      });
                    }
                  );
                }
              );
            }
          );
        }
      );
    });
  });
});

// ==========================================
// GET ACTIVE CATEGORIES
// ==========================================
router.get("/categories", (req, res) => {
  const sql = `
    SELECT
      id,
      name,
      slug,
      gender,
      parent_id,
      display_order
    FROM categories
    WHERE is_active = 1
    ORDER BY
      parent_id IS NULL DESC,
      parent_id ASC,
      display_order ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Get categories error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch categories",
      });
    }

    return res.json({
      success: true,
      categories: results,
    });
  });
});

// ==========================================
// UPDATE PRODUCT STOCK
// ==========================================
router.put("/:id/stock", (req, res) => {
  const { stock } = req.body;
  const productId = Number(req.params.id);

  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid product ID",
    });
  }

  if (stock === undefined || stock === null || stock === "") {
    return res.status(400).json({
      success: false,
      message: "Stock quantity is required",
    });
  }

  const quantity = Number(stock);

  if (!Number.isInteger(quantity) || quantity < 0) {
    return res.status(400).json({
      success: false,
      message: "Stock must be a non-negative integer",
    });
  }

  const sql = "UPDATE products SET stock = ? WHERE id = ?";

  db.query(sql, [quantity, productId], (err, result) => {
    if (err) {
      console.error("Stock update error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to update stock",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.json({
      success: true,
      message: "Stock updated successfully",
      productId,
      stock: quantity,
    });
  });
});

module.exports = router;
