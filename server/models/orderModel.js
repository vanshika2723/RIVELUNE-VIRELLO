
const db = require("../config/db");

// Create a new order with its items using a transaction
const createOrder = (orderData, items) => {
  return new Promise((resolve, reject) => {
    db.getConnection((connectionError, connection) => {
      if (connectionError) {
        return reject(connectionError);
      }

      connection.beginTransaction((transactionError) => {
        if (transactionError) {
          connection.release();
          return reject(transactionError);
        }

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

        connection.query(orderQuery, orderValues, (orderError, result) => {
          if (orderError) {
            return connection.rollback(() => {
              connection.release();
              reject(orderError);
            });
          }

          const orderId = result.insertId;

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

          connection.query(itemQuery, [itemValues], (itemError) => {
            if (itemError) {
              return connection.rollback(() => {
                connection.release();
                reject(itemError);
              });
            }

            connection.commit((commitError) => {
              if (commitError) {
                return connection.rollback(() => {
                  connection.release();
                  reject(commitError);
                });
              }

              connection.release();

              resolve({
                id: orderId,
                order_number: orderData.order_number,
              });
            });
          });
        });
      });
    });
  });
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
module.exports = {
  createOrder,
  getOrderByOrderNumberAndPhone,
  getWalletPayments,
};