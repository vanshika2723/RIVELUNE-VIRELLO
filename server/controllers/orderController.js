
const crypto = require("crypto");
const {
  getOrderByOrderNumberAndPhone,
  getWalletPayments,
} = require("../models/orderModel");
const { createOrder } = require("../models/orderModel");

const fs = require("fs");
const path = require("path");
const {
  submitPaymentProof,
  rejectPaymentProof,
  verifyPaymentProof,
  getPaymentProofByOrderId,
} = require("../models/paymentModel");


const placeOrder = async (req, res) => {
  try {
    const {
      customer,
      items,
      payment_method,
    } = req.body;

    // Validate customer details
    const requiredFields = [
      "name",
      "phone",
      "province",
      "city",
      "address",
    ];

    for (const field of requiredFields) {
      if (!customer || !customer[field] || !String(customer[field]).trim()) {
        return res.status(400).json({
          success: false,
          message: `Customer ${field} is required.`,
        });
      }
    }

    // Validate phone number
    const phoneRegex = /^\+?[\d\s-]{10,20}$/;

    if (!phoneRegex.test(customer.phone.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid phone number.",
      });
    }

    // Validate email if provided
    if (customer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    // Validate payment method
    const allowedPayments = ["cod", "easypaisa", "jazzcash"];

    if (!allowedPayments.includes(payment_method)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method.",
      });
    }

    // Validate items
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your order must contain at least one item.",
      });
    }

    for (const item of items) {
      if (
        !Number.isInteger(Number(item.product_id)) ||
        Number(item.product_id) <= 0 ||
        !item.product_name ||
        !item.size ||
        !Number.isInteger(Number(item.quantity)) ||
        Number(item.quantity) < 1 ||
        !Number.isFinite(Number(item.unit_price)) ||
        Number(item.unit_price) <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "One or more order items are invalid.",
        });
      }
    }

    // Calculate totals
    const subtotal = items.reduce(
      (total, item) =>
        total + Number(item.unit_price) * Number(item.quantity),
      0
    );

    const shipping_fee = subtotal >= 10000 ? 0 : 500;
    const total_amount = subtotal + shipping_fee;

    // Generate unique order number
    const order_number = `RVL-${Date.now()}-${crypto
      .randomBytes(3)
      .toString("hex")
      .toUpperCase()}`;

    // Prepare customer/order data
    const orderData = {
      order_number,
      customer_name: customer.name.trim(),
      phone: customer.phone.trim(),
      email: customer.email?.trim() || null,
      province: customer.province.trim(),
      city: customer.city.trim(),
      postal_code: customer.postal_code?.trim() || null,
      address: customer.address.trim(),
      order_notes: customer.order_notes?.trim() || null,
      payment_method,
      subtotal,
      shipping_fee,
      total_amount,
    };

    // Prepare order items
    const orderItems = items.map((item) => ({
      product_id: Number(item.product_id),
      product_name: item.product_name,
      product_image: item.product_image || null,
      size: item.size,
      color: item.color || null,
      quantity: Number(item.quantity),
      unit_price: Number(item.unit_price),
      total_price: Number(item.unit_price) * Number(item.quantity),
    }));

    // Save order to database
    const savedOrder = await createOrder(orderData, orderItems);

    return res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      order: {
        id: savedOrder.id,
        order_number: savedOrder.order_number,
        payment_method,
        subtotal,
        shipping_fee,
        total_amount,
        order_status: "Pending Confirmation",
        payment_status:
          payment_method === "cod"
            ? "Pending"
            : "Payment Verification Pending",
      },
    });
  } catch (error) {
    console.error("Place order error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to place your order. Please try again.",
    });
  }
};

const lookupOrder = async (req, res) => {
  try {
    const { order_number, phone } = req.body;

    if (!order_number || !phone) {
      return res.status(400).json({
        success: false,
        message: "Order number and phone number are required.",
      });
    }

    const order = await getOrderByOrderNumberAndPhone(
      order_number.trim(),
      phone.trim()
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "No order found. Please check your order number and phone.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order found successfully.",
      order,
    });
  } catch (error) {
    console.error("Order lookup error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve order. Please try again.",
    });
  }
};

const submitPayment = async (req, res) => {
  try {
    const { order_number, phone, transaction_id } = req.body;

    if (!order_number || !phone || !transaction_id) {
      if (req.file) {
        fs.unlink(req.file.path, () => {});
      }

      return res.status(400).json({
        success: false,
        message: "Order number, phone and transaction ID are required.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload your payment screenshot.",
      });
    }

    const order = await getOrderByOrderNumberAndPhone(
      order_number.trim(),
      phone.trim()
    );

    if (!order) {
      fs.unlink(req.file.path, () => {});

      return res.status(404).json({
        success: false,
        message: "Order not found. Please verify your order details.",
      });
    }

    if (!["easypaisa", "jazzcash"].includes(order.payment_method)) {
      fs.unlink(req.file.path, () => {});

      return res.status(400).json({
        success: false,
        message: "This order is not a wallet payment order.",
      });
    }

    if (order.payment_status === "Payment Verified") {
      fs.unlink(req.file.path, () => {});

      return res.status(400).json({
        success: false,
        message: "Payment for this order has already been verified.",
      });
    }

    const saved = await submitPaymentProof(
      order.id,
      transaction_id.trim(),
      req.file.filename
    );
if (!saved) {
  if (req.file?.path) {
    fs.unlink(req.file.path, () => {});
  }

  return res.status(409).json({
    success: false,
    message:
      "This order is not eligible for payment proof submission. If your payment was rejected, please refresh your order and try again.",
  });
}
   

    return res.status(200).json({
      success: true,
      message: "Payment proof submitted successfully. Awaiting verification.",
      order_number: order.order_number,
      payment_status: "Payment Verification Pending",
    });
  } catch (error) {
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }

    console.error("Payment submission error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Payment submission failed. Please try again.",
    });
  }
};
const rejectPayment = async (req, res) => {
  try {
    const { order_id, rejection_reason } = req.body;

    if (!order_id || !rejection_reason?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Order ID and rejection reason are required.",
      });
    }

    const saved = await rejectPaymentProof(
      Number(order_id),
      rejection_reason.trim()
    );

    if (!saved) {
      return res.status(409).json({
        success: false,
        message:
          "This order cannot be rejected. It may no longer be awaiting payment verification.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment rejected successfully.",
      payment_status: "Payment Rejected",
      order_status: "Payment Rejected",
    });
  } catch (error) {
    console.error("Reject payment error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to reject payment. Please try again.",
    });
  }
};
// Verify wallet payment (admin only)
const verifyPayment = async (req, res) => {
  try {
    const { order_id } = req.body;

    const orderId = Number(order_id);

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return res.status(400).json({
        success: false,
        message: "A valid order ID is required.",
      });
    }

    const saved = await verifyPaymentProof(orderId);

    if (!saved) {
      return res.status(409).json({
        success: false,
        message:
          "This payment cannot be verified. It may no longer be awaiting verification.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully.",
      payment_status: "Payment Verified",
      order_status: "Payment Verified",
    });
  } catch (error) {
    console.error("Verify payment error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to verify payment. Please try again.",
    });
  }
};

// Get wallet payments for admin panel
const getAdminPayments = async (req, res) => {
  try {
    const { status } = req.query;

    const allowedStatuses = [
      "Payment Verification Pending",
      "Payment Verified",
      "Payment Rejected",
    ];

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid payment status",
      });
    }

    const payments = await getWalletPayments(status || null);

    res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    console.error("Admin payments fetch error:", error);

    res.status(500).json({
      message: "Failed to fetch payments",
    });
  }
};
// View payment proof securely (admin only)
const viewPaymentProof = async (req, res) => {
  try {
    const orderId = Number(req.params.orderId);

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID.",
      });
    }

    const proof = await getPaymentProofByOrderId(orderId);

    if (!proof || !proof.payment_proof) {
      return res.status(404).json({
        success: false,
        message: "Payment proof not found.",
      });
    }

    // Only allow a safe filename, never a user-supplied path
    const filename = path.basename(proof.payment_proof);

    if (filename !== proof.payment_proof) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment proof filename.",
      });
    }

    const uploadDirectory = path.resolve(
      __dirname,
      "../uploads/payment-proofs"
    );

    const filePath = path.resolve(uploadDirectory, filename);

    if (!filePath.startsWith(uploadDirectory + path.sep)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file path.",
      });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "Payment proof file is missing.",
      });
    }

    res.sendFile(filePath, (err) => {
      if (err && !res.headersSent) {
        console.error("Payment proof delivery error:", err.message);

        res.status(500).json({
          success: false,
          message: "Unable to display payment proof.",
        });
      }
    });
  } catch (error) {
    console.error("View payment proof error:", error.message);

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Unable to retrieve payment proof.",
      });
    }
  }
};
module.exports = {
  placeOrder,
  lookupOrder,
  submitPayment,
  rejectPayment,
  verifyPayment,
  getAdminPayments,
  viewPaymentProof,
};