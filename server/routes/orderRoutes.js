const adminAuth = require("../middleware/adminAuth");
const express = require("express");
const router = express.Router();
const multer = require("multer");
const validatePaymentImage = require("../middleware/validatePaymentImage");
const {
  placeOrder,
  lookupOrder,
  submitPayment,
  rejectPayment,
  updateCourierTrackingController,
  submitReturnRequestController,
  getAdminReturnRequestsController,
updateAdminReturnRequestController,
} = require("../controllers/orderController");
const paymentUpload = require("../config/paymentUpload");

// Create order
router.post("/", placeOrder);

// Guest order lookup
router.post("/lookup", lookupOrder);

// Customer Return / Exchange Request
router.post("/return-request", submitReturnRequestController);

// Submit wallet payment proof

router.post(
  "/payment-proof",
  (req, res, next) => {
    paymentUpload.single("payment_proof")(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            message: "File too large. Maximum upload size is 5MB.",
          });
        }

        return res.status(400).json({
          success: false,
          message: err.message || "File upload failed.",
        });
      }

      next();
    });
  },
  validatePaymentImage,
  submitPayment
);

// Admin payment rejection route - disabled until authentication is implemented
router.post("/reject-payment", rejectPayment);
// Admin: Update courier tracking details
router.put("/admin/courier-tracking", adminAuth, updateCourierTrackingController);
router.get(
  "/admin/return-requests",
  adminAuth,
  getAdminReturnRequestsController
);

router.put(
  "/admin/return-requests/:id",
  adminAuth,
  updateAdminReturnRequestController
);
module.exports = router;
