
const express = require("express");
const router = express.Router();

const adminAuth = require("../middleware/adminAuth");
const {
  getAllCustomersController,
  getCustomerByIdController,
} = require("../controllers/customerController");

const shippingController = require("../controllers/shippingController");
const {
  getAdminPayments,
  viewPaymentProof,
  verifyPayment,
  rejectPayment,
  getAdminPaymentAnalyticsController,
  getMonthlyPaymentAnalyticsController,
  getAllAdminOrdersController,
  updateAdminOrderStatusController,
  
  
} = require("../controllers/orderController");

const {
  getCouponsController,
  createCouponController,
  updateCouponController,
  deleteCouponController,
} = require("../controllers/couponController");
const {
  getAdminInventory,
  updateVariantStock,
  getStockHistory
} = require("../controllers/inventoryController");
// Protected admin payments list
router.get("/payments", adminAuth, getAdminPayments);
// GET ALL ADMIN ORDERS
router.get("/orders", adminAuth, getAllAdminOrdersController);
// Protected payment proof image
router.get(
  "/payments/:orderId/proof",
  adminAuth,
  viewPaymentProof
);

// Verify wallet payment
router.post(
  "/payments/verify",
  adminAuth,
  verifyPayment
);

// Reject wallet payment
router.post(
  "/payments/reject",
  adminAuth,
  rejectPayment
);
// UPDATE ADMIN ORDER STATUS
router.put("/orders/status", adminAuth, updateAdminOrderStatusController);

// Protected admin payment analytics
router.get(
  "/payments/analytics",
  adminAuth,
  getAdminPaymentAnalyticsController
);

// Protected monthly payment comparison analytics
router.get(
  "/payments/monthly-analytics",
  adminAuth,
  getMonthlyPaymentAnalyticsController
);
// Protected admin inventory
router.get("/inventory", adminAuth, getAdminInventory);
router.put(
  "/inventory/:variantId/stock",
  adminAuth,
  updateVariantStock
);
// Protected stock movement history
router.get(
  "/inventory/history",
  adminAuth,
  getStockHistory
);

// ========================================
// CUSTOMER MANAGEMENT
// ========================================
router.get("/customers", adminAuth, getAllCustomersController);
router.get("/customers/:id", adminAuth, getCustomerByIdController);


// ========================================
// COUPON MANAGEMENT
// ========================================
router.get("/coupons", adminAuth, getCouponsController);
router.post("/coupons", adminAuth, createCouponController);
router.put("/coupons/:id", adminAuth, updateCouponController);
router.delete("/coupons/:id", adminAuth, deleteCouponController);

// ================= SHIPPING SETTINGS =================

// Get all shipping zones
router.get("/shipping", adminAuth, shippingController.getShippingSettings);

// Create shipping zone
router.post("/shipping", adminAuth, shippingController.createShippingZone);

// Update shipping zone
router.put("/shipping/:id", adminAuth, shippingController.updateShippingZone);

// Delete shipping zone
router.delete("/shipping/:id", adminAuth, shippingController.deleteShippingZone);
module.exports = router;
