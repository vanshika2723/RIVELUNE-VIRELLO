const db = require("../config/db");

// ========================================
// GET ALL COUPONS
// ========================================
const getAllCoupons = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT *
      FROM coupons
      ORDER BY created_at DESC
    `;

    db.query(sql, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

// ========================================
// CREATE COUPON
// ========================================
const createCoupon = (couponData) => {
  return new Promise((resolve, reject) => {
    const {
      coupon_code,
      discount_type,
      discount_value,
      min_order_amount,
      max_discount,
      usage_limit,
      start_date,
      expiry_date,
      status,
    } = couponData;

    const sql = `
      INSERT INTO coupons (
        coupon_code,
        discount_type,
        discount_value,
        min_order_amount,
        max_discount,
        usage_limit,
        start_date,
        expiry_date,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [
        coupon_code.toUpperCase(),
        discount_type,
        discount_value,
        min_order_amount || 0,
        max_discount || null,
        usage_limit || null,
        start_date || null,
        expiry_date || null,
        status || "active",
      ],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
};

// ========================================
// UPDATE COUPON
// ========================================
const updateCoupon = (id, couponData) => {
  return new Promise((resolve, reject) => {
    const {
      coupon_code,
      discount_type,
      discount_value,
      min_order_amount,
      max_discount,
      usage_limit,
      start_date,
      expiry_date,
      status,
    } = couponData;

    const sql = `
      UPDATE coupons
      SET
        coupon_code = ?,
        discount_type = ?,
        discount_value = ?,
        min_order_amount = ?,
        max_discount = ?,
        usage_limit = ?,
        start_date = ?,
        expiry_date = ?,
        status = ?
      WHERE id = ?
    `;

    db.query(
      sql,
      [
        coupon_code.toUpperCase(),
        discount_type,
        discount_value,
        min_order_amount || 0,
        max_discount || null,
        usage_limit || null,
        start_date || null,
        expiry_date || null,
        status || "active",
        id,
      ],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
};

// ========================================
// DELETE COUPON
// ========================================
const deleteCoupon = (id) => {
  return new Promise((resolve, reject) => {
    const sql = `DELETE FROM coupons WHERE id = ?`;

    db.query(sql, [id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

// ========================================
// EXPORT
// ========================================
module.exports = {
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
};