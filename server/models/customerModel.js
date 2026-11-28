
const db = require("../config/db");

// ========================================
// GET ALL UNIQUE CUSTOMERS
// ========================================
const getAllCustomers = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT
        MIN(id) AS id,
        COALESCE(
          NULLIF(LOWER(TRIM(email)), ''),
          CONCAT('phone:', TRIM(phone))
        ) AS customer_key,

        MAX(customer_name) AS customer_name,
        MAX(email) AS email,
        MAX(phone) AS phone,
        MAX(city) AS city,
        MAX(province) AS province,

        COUNT(*) AS total_orders,
        COALESCE(SUM(total_amount), 0) AS total_spent,
        MAX(created_at) AS last_order_date,
        MIN(created_at) AS first_order_date

      FROM orders

      GROUP BY customer_key

      ORDER BY last_order_date DESC
    `;

    db.query(query, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

// ========================================
// GET CUSTOMER DETAILS AND ORDER HISTORY
// ========================================
const getCustomerById = (customerId) => {
  return new Promise((resolve, reject) => {
    const customerQuery = `
      SELECT
        MIN(id) AS id,
        COALESCE(
          NULLIF(LOWER(TRIM(email)), ''),
          CONCAT('phone:', TRIM(phone))
        ) AS customer_key,

        MAX(customer_name) AS customer_name,
        MAX(email) AS email,
        MAX(phone) AS phone,
        MAX(city) AS city,
        MAX(province) AS province,
        MAX(postal_code) AS postal_code,
        MAX(address) AS address,

        COUNT(*) AS total_orders,
        COALESCE(SUM(total_amount), 0) AS total_spent,
        MAX(created_at) AS last_order_date,
        MIN(created_at) AS first_order_date

      FROM orders

      GROUP BY customer_key

      HAVING MIN(id) = ?
      LIMIT 1
    `;

    db.query(customerQuery, [customerId], (err, customers) => {
      if (err) return reject(err);

      if (!customers.length) {
        return resolve(null);
      }

      const customer = customers[0];

      const ordersQuery = `
        SELECT
          id,
          order_number,
          customer_name,
          phone,
          email,
          province,
          city,
          postal_code,
          address,
          payment_method,
          subtotal,
          discount_amount,
          shipping_fee,
          total_amount,
          payment_status,
          order_status,
          coupon_code,
          created_at

        FROM orders

        WHERE COALESCE(
          NULLIF(LOWER(TRIM(email)), ''),
          CONCAT('phone:', TRIM(phone))
        ) = ?

        ORDER BY created_at DESC
      `;

      db.query(
        ordersQuery,
        [customer.customer_key],
        (ordersError, orders) => {
          if (ordersError) return reject(ordersError);

          if (!orders.length) {
            return resolve({
              ...customer,
              orders: [],
            });
          }

          const orderIds = orders.map((order) => order.id);
          const placeholders = orderIds.map(() => "?").join(",");

          const itemsQuery = `
            SELECT
              id,
              order_id,
              product_id,
              product_name,
              product_image,
              size,
              color,
              quantity,
              unit_price,
              total_price

            FROM order_items

            WHERE order_id IN (${placeholders})

            ORDER BY id ASC
          `;

          db.query(itemsQuery, orderIds, (itemsError, items) => {
            if (itemsError) return reject(itemsError);

            const itemsMap = {};

            items.forEach((item) => {
              if (!itemsMap[item.order_id]) {
                itemsMap[item.order_id] = [];
              }

              itemsMap[item.order_id].push(item);
            });

            const ordersWithItems = orders.map((order) => ({
              ...order,
              items: itemsMap[order.id] || [],
            }));

            resolve({
              ...customer,
              orders: ordersWithItems,
            });
          });
        }
      );
    });
  });
};

module.exports = {
  getAllCustomers,
  getCustomerById,
};
