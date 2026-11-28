const {
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} = require("../models/couponModel");

// ========================================
// GET ALL COUPONS
// ========================================
const getCouponsController = async (req, res) => {
  try {
    const coupons = await getAllCoupons();

    res.status(200).json({
      success: true,
      count: coupons.length,
      coupons,
    });
  } catch (error) {
    console.error("Get Coupons Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch coupons",
    });
  }
};

// ========================================
// CREATE COUPON
// ========================================
const createCouponController = async (req, res) => {
  try {
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
    } = req.body;

    if (!coupon_code || !discount_type || !discount_value) {
      return res.status(400).json({
        success: false,
        message: "Coupon code, discount type and value are required",
      });
    }

    if (!["percentage", "fixed"].includes(discount_type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid discount type",
      });
    }

    if (Number(discount_value) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Discount value must be greater than 0",
      });
    }

    if (
      discount_type === "percentage" &&
      Number(discount_value) > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Percentage discount cannot exceed 100",
      });
    }

    const result = await createCoupon({
      coupon_code: coupon_code.trim(),
      discount_type,
      discount_value,
      min_order_amount,
      max_discount,
      usage_limit,
      start_date,
      expiry_date,
      status,
    });

    res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      couponId: result.insertId,
    });
  } catch (error) {
    console.error("Create Coupon Error:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "Coupon code already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create coupon",
    });
  }
};

// ========================================
// UPDATE COUPON
// ========================================
const updateCouponController = async (req, res) => {
  try {
    const { id } = req.params;

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
    } = req.body;

    if (!coupon_code || !discount_type || !discount_value) {
      return res.status(400).json({
        success: false,
        message: "Coupon code, discount type and value are required",
      });
    }

    if (!["percentage", "fixed"].includes(discount_type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid discount type",
      });
    }

    if (Number(discount_value) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Discount value must be greater than 0",
      });
    }

    if (
      discount_type === "percentage" &&
      Number(discount_value) > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Percentage discount cannot exceed 100",
      });
    }

    const result = await updateCoupon(id, {
      coupon_code: coupon_code.trim(),
      discount_type,
      discount_value,
      min_order_amount,
      max_discount,
      usage_limit,
      start_date,
      expiry_date,
      status,
    });

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Coupon updated successfully",
    });
  } catch (error) {
    console.error("Update Coupon Error:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "Coupon code already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update coupon",
    });
  }
};

// ========================================
// DELETE COUPON
// ========================================
const deleteCouponController = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await deleteCoupon(id);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    console.error("Delete Coupon Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete coupon",
    });
  }
};

// ========================================
// EXPORT
// ========================================
module.exports = {
  getCouponsController,
  createCouponController,
  updateCouponController,
  deleteCouponController,
};