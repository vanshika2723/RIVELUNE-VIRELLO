const db = require("../config/db");

// Get all shipping settings
const getShippingSettings = (callback) => {
  const sql = "SELECT * FROM shipping_settings ORDER BY id DESC";
  db.query(sql, callback);
};

// Add new shipping zone
const createShippingZone = (zoneData, callback) => {
  const {
    zone_name,
    city,
    shipping_fee,
    free_shipping_minimum,
    delivery_min_days,
    delivery_max_days,
    status,
  } = zoneData;

  const sql = `
    INSERT INTO shipping_settings
    (zone_name, city, shipping_fee, free_shipping_minimum,
     delivery_min_days, delivery_max_days, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      zone_name,
      city,
      shipping_fee,
      free_shipping_minimum,
      delivery_min_days,
      delivery_max_days,
      status || "active",
    ],
    callback
  );
};

// Update shipping zone
const updateShippingZone = (id, zoneData, callback) => {
  const {
    zone_name,
    city,
    shipping_fee,
    free_shipping_minimum,
    delivery_min_days,
    delivery_max_days,
    status,
  } = zoneData;

  const sql = `
    UPDATE shipping_settings
    SET zone_name = ?,
        city = ?,
        shipping_fee = ?,
        free_shipping_minimum = ?,
        delivery_min_days = ?,
        delivery_max_days = ?,
        status = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      zone_name,
      city,
      shipping_fee,
      free_shipping_minimum,
      delivery_min_days,
      delivery_max_days,
      status,
      id,
    ],
    callback
  );
};

// Delete shipping zone
const deleteShippingZone = (id, callback) => {
  const sql = "DELETE FROM shipping_settings WHERE id = ?";
  db.query(sql, [id], callback);
};

module.exports = {
  getShippingSettings,
  createShippingZone,
  updateShippingZone,
  deleteShippingZone,
};