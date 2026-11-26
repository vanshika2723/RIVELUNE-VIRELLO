
const express = require("express");
const router = express.Router();

const adminAuth = require("../middleware/adminAuth");

const {
  getAdminPayments,
  viewPaymentProof,
  verifyPayment,
  rejectPayment,
  getAdminPaymentAnalyticsController,
  getMonthlyPaymentAnalyticsController,
} = require("../controllers/orderController");

// Protected admin payments list
router.get("/payments", adminAuth, getAdminPayments);

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

module.exports = router;
