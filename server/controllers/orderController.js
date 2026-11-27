
const crypto = require("crypto");


const {
  getOrderByOrderNumberAndPhone,
  getWalletPayments,
  getAdminPaymentAnalytics,
  getMonthlyPaymentAnalytics,
  
} = require("../models/orderModel");
const {
  createOrder,
  validateOrderItems,
} = require("../models/orderModel");

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
    const { customer, items, payment_method } = req.body;

    // 1. Validate customer details
    const requiredFields = [
      "name",
      "phone",
      "province",
      "city",
      "address",
    ];

    for (const field of requiredFields) {
      if (
        !customer ||
        !customer[field] ||
        !String(customer[field]).trim()
      ) {
        return res.status(400).json({
          success: false,
          message: `Customer ${field} is required.`,
        });
      }
    }

    // 2. Validate phone number
    const phone = String(customer.phone).replace(/[\s-]/g, "");

    const phoneRegex = /^(?:\+92|0)?3\d{9}$/;

    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid Pakistan mobile number.",
      });
    }

    // 3. Validate email
    const email = String(customer.email || "").trim();

    if (
      email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    // 4. Validate payment method
    const allowedPayments = [
      "cod",
      "easypaisa",
      "jazzcash",
    ];

    if (!allowedPayments.includes(payment_method)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method.",
      });
    }

    // 5. Validate cart
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your order must contain at least one item.",
      });
    }

    // 6. Validate products using database prices and variants
    const orderItems = await validateOrderItems(items);
console.log("========== ORDER DEBUG ==========");
console.log(JSON.stringify(items, null, 2));

items.forEach((item, index) => {
  console.log(`ITEM ${index + 1}:`, {
    product_id: item.product_id,
    quantity: item.quantity,
    size: item.size,
    color: item.color,
    product_id_type: typeof item.product_id,
    quantity_type: typeof item.quantity,
  });
});

console.log("=================================");
    // 7. Calculate subtotal
    const subtotal = orderItems.reduce(
      (total, item) => total + item.total_price,
      0
    );

    // 8. Calculate shipping
    const shipping_fee = subtotal >= 10000 ? 0 : 500;

    const total_amount = subtotal + shipping_fee;

    // 9. Generate unique order number
    const orderNumber =
      `RIV-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

    // 10. Prepare order data
    const orderData = {
      order_number: orderNumber,
      customer_name: String(customer.name).trim(),
      phone,
      email: email || null,
      province: String(customer.province).trim(),
      city: String(customer.city).trim(),
      postal_code: String(customer.postal_code || "").trim(),
      address: String(customer.address).trim(),
      order_notes: String(customer.order_notes || "").trim(),
      payment_method,
      subtotal,
      shipping_fee,
      total_amount,
    };

    // 11. Save order and update stock atomically
    const savedOrder = await createOrder(orderData, orderItems);

    // 12. Return successful response
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
    console.error("Place order error:", error);

    const validationErrors = [
      "Invalid product",
      "Invalid product variant",
      "variant",
      "unavailable",
      "insufficient stock",
      "inactive",
      "Invalid product price",
      "selected size or color",
      "Stock update failed",
    ];

    const isValidationError = validationErrors.some(
      (message) =>
        error.message.toLowerCase().includes(message.toLowerCase())
    );

    return res.status(isValidationError ? 409 : 500).json({
      success: false,
      message: isValidationError
        ? error.message
        : "Unable to place your order. Please try again.",
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
// Get payment analytics for admin dashboard
const getAdminPaymentAnalyticsController = async (req, res) => {
  try {
    const analytics = await getAdminPaymentAnalytics();

    return res.status(200).json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error("Admin payment analytics error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch payment analytics.",
    });
  }
};
// Get monthly payment comparison analytics for admin
const getMonthlyPaymentAnalyticsController = async (req, res) => {
  try {
    const analytics = await getMonthlyPaymentAnalytics();

    return res.status(200).json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error("Monthly payment analytics error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch monthly payment analytics.",
    });
  }
};
// Fetch and validate product price from database
const getValidatedOrderItems = async (items) => {
  const validatedItems = [];

  for (const item of items) {
    const productId = Number(item.product_id);
    const quantity = Number(item.quantity);

    // Get active product
    const product = await new Promise((resolve, reject) => {
      db.query(
        `SELECT id, name, price, sale_price, is_active
         FROM products
         WHERE id = ?`,
        [productId],
        (error, results) => {
          if (error) return reject(error);
          resolve(results[0]);
        }
      );
    });

    if (!product || Number(product.is_active) !== 1) {
      throw new Error(`Product ${productId} is unavailable.`);
    }

    // Validate selected size and color against active variant
    const variant = await new Promise((resolve, reject) => {
      db.query(
        `SELECT id, size, color, price_override, stock_quantity, is_active
         FROM product_variants
         WHERE product_id = ?
           AND size = ?
           AND color = ?
         LIMIT 1`,
        [productId, item.size, item.color],
        (error, results) => {
          if (error) return reject(error);
          resolve(results[0]);
        }
      );
    });

    if (!variant || Number(variant.is_active) !== 1) {
      throw new Error(
        `${product.name} is unavailable in the selected size/color.`
      );
    }

    if (Number(variant.stock_quantity || 0) < quantity) {
      throw new Error(
        `Insufficient stock for ${product.name} (${item.size}, ${item.color}).`
      );
    }

    const basePrice =
      product.sale_price !== null &&
      product.sale_price !== undefined &&
      Number(product.sale_price) > 0
        ? Number(product.sale_price)
        : Number(product.price);

    const unitPrice =
      variant.price_override !== null &&
      variant.price_override !== undefined &&
      Number(variant.price_override) > 0
        ? Number(variant.price_override)
        : basePrice;

    validatedItems.push({
      product_id: product.id,
      product_name: product.name,
      product_image: null,
      size: variant.size,
      color: variant.color,
      quantity,
      unit_price: unitPrice,
      total_price: unitPrice * quantity,
    });
  }

  return validatedItems;
};
module.exports = {
  placeOrder,
  lookupOrder,
  submitPayment,
  rejectPayment,
  verifyPayment,
  getAdminPayments,
  viewPaymentProof,
  getAdminPaymentAnalyticsController,
  getMonthlyPaymentAnalyticsController,
};