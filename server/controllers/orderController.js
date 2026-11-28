
const crypto = require("crypto");
const {
  getOrderByOrderNumberAndPhone,
  getWalletPayments,
  getAdminPaymentAnalytics,
  getMonthlyPaymentAnalytics,
  getAllAdminOrders,
  updateAdminOrderStatus,
  updateCourierTracking,
  getAllReturnRequests,
updateReturnRequestStatus,
} = require("../models/orderModel");
const {
  createOrder,
  validateOrderItems,
  createReturnRequest,
  checkExistingReturnRequest,
getReturnRequestsByOrderId,

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
    const { customer, items, payment_method, coupon_code } = req.body;

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

    // 2. Validate phone
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
    const allowedPayments = ["cod", "easypaisa", "jazzcash"];

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

    // 7. Calculate subtotal using database prices
    const subtotal = Number(
      orderItems
        .reduce((total, item) => total + item.total_price, 0)
        .toFixed(2)
    );

    // 8. Server-side coupon validation
    const coupons = {
      WELCOME10: {
        type: "percentage",
        value: 10,
        minOrder: 2000,
      },
      RIVELUNE15: {
        type: "percentage",
        value: 15,
        minOrder: 5000,
      },
      SAVE500: {
        type: "fixed",
        value: 500,
        minOrder: 3000,
      },
    };

    const normalizedCoupon = String(coupon_code || "")
      .trim()
      .toUpperCase();

    let validCoupon = null;
    let discount_amount = 0;

    if (normalizedCoupon) {
      validCoupon = coupons[normalizedCoupon];

      if (!validCoupon) {
        return res.status(400).json({
          success: false,
          message: "Invalid coupon code.",
        });
      }

      if (subtotal < validCoupon.minOrder) {
        return res.status(400).json({
          success: false,
          message: `Minimum order of PKR ${validCoupon.minOrder.toLocaleString("en-PK")} required for ${normalizedCoupon}.`,
        });
      }

      discount_amount =
        validCoupon.type === "percentage"
          ? Math.round((subtotal * validCoupon.value) / 100)
          : Math.min(validCoupon.value, subtotal);
    }

    // 9. Calculate shipping
    const shipping_fee = subtotal >= 10000 ? 0 : 500;

    // 10. Calculate final total
    const total_amount = Number(
      Math.max(0, subtotal - discount_amount + shipping_fee).toFixed(2)
    );

    // 11. Generate unique order number
    const orderNumber =
      `RIV-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

    // 12. Prepare order data
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
      coupon_code: validCoupon ? normalizedCoupon : null,
      discount_amount,
      shipping_fee,
      total_amount,
    };

    // 13. Save order and update stock atomically
    const savedOrder = await createOrder(orderData, orderItems);

    // 14. Return successful response
    return res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      order: {
        id: savedOrder.id,
        order_number: savedOrder.order_number,
        payment_method,
        subtotal,
        coupon_code: validCoupon ? normalizedCoupon : null,
        discount_amount,
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
      "Invalid order item",
      "missing",
    ];

    const isValidationError = validationErrors.some((message) =>
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

    // Fetch existing Return / Exchange requests
    const returnRequests = await getReturnRequestsByOrderId(order.id);

    return res.status(200).json({
      success: true,
      message: "Order found successfully.",
      order: {
        ...order,
        return_requests: returnRequests,
      },
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
// ========================================
// GET ALL ORDERS FOR ADMIN
// ========================================
const getAllAdminOrdersController = async (req, res) => {
  try {
    const orders = await getAllAdminOrders();

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Admin orders fetch error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders.",
    });
  }
};
// ========================================
// UPDATE ADMIN ORDER STATUS
// ========================================
const updateAdminOrderStatusController = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    const allowedStatuses = [
      "Pending Confirmation",
      "Confirmed",
      "Processing",
      "Dispatched",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
      "Returned",
    ];

    if (!orderId || !status) {
      return res.status(400).json({
        success: false,
        message: "Order ID and status are required.",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status.",
      });
    }

    const result = await updateAdminOrderStatus(orderId, status);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully.",
    });
  } catch (error) {
    console.error("Order status update error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update order status.",
    });
  }
};

// ========================================
// UPDATE COURIER TRACKING DETAILS (ADMIN)
// ========================================
const updateCourierTrackingController = async (req, res) => {
  try {
    const { orderId, courier_name, tracking_number, tracking_url } = req.body;

    const id = Number(orderId);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid order ID is required.",
      });
    }

    if (!courier_name?.trim() || !tracking_number?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Courier name and tracking number are required.",
      });
    }

    if (tracking_url && !/^https?:\/\/.+/i.test(tracking_url.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid tracking URL.",
      });
    }

    const result = await updateCourierTracking(id, {
      courier_name: courier_name.trim(),
      tracking_number: tracking_number.trim(),
      tracking_url: tracking_url?.trim() || null,
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Courier tracking details updated successfully.",
    });
  } catch (error) {
    console.error("Courier tracking update error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update courier tracking details.",
    });
  }
};

// ========================================
// CUSTOMER RETURN / EXCHANGE REQUEST
// ========================================
// ========================================
// CUSTOMER RETURN / EXCHANGE REQUEST
// SECURE ORDER VERIFICATION
// ========================================
const submitReturnRequestController = async (req, res) => {
  try {
    const {
      order_number,
      phone,
      request_type,
      reason,
    } = req.body;

    // Required fields validation
    if (
      !order_number?.trim() ||
      !phone?.trim() ||
      !request_type ||
      !reason?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Order number, phone, request type and reason are required.",
      });
    }

    // Request type validation
    if (!["Return", "Exchange"].includes(request_type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request type. Choose Return or Exchange.",
      });
    }

    // Verify order using order number + phone
    const order = await getOrderByOrderNumberAndPhone(
      order_number.trim(),
      phone.trim()
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found. Please check your order number and phone.",
      });
    }

    // Only Delivered orders are eligible
    if (order.order_status?.toLowerCase().trim() !== "delivered") {
      return res.status(400).json({
        success: false,
        message: "Return or Exchange is only available for delivered orders.",
      });
    }
// Prevent duplicate active return / exchange requests
const existingRequest = await checkExistingReturnRequest(order.id);

if (existingRequest) {
  return res.status(409).json({
    success: false,
    message: `You already have an active ${existingRequest.request_type} request for this order.`,
  });
}
    // Save verified server-side order information
    const result = await createReturnRequest({
      order_id: order.id,
      order_number: order.order_number,
      customer_name: order.customer_name,
      phone: order.phone,
      request_type,
      reason: reason.trim(),
    });

    return res.status(201).json({
      success: true,
      message: `${request_type} request submitted successfully.`,
      requestId: result.insertId,
    });
  } catch (error) {
    console.error("Return request error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit return request.",
    });
  }
};

const getAdminReturnRequestsController = async (req, res) => {
  try {
    const requests = await getAllReturnRequests();

    res.status(200).json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error("Get Admin Return Requests Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch return requests.",
    });
  }
};

const updateAdminReturnRequestController = async (req, res) => {
  try {
    const { id } = req.params;
    const { request_status, admin_notes } = req.body;

    const allowedStatuses = ["Approved", "Rejected", "Completed"];

    if (!allowedStatuses.includes(request_status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid return request status.",
      });
    }

    const result = await updateReturnRequestStatus(
      id,
      request_status,
      admin_notes || ""
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Return request not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Return request updated successfully.",
    });
  } catch (error) {
    console.error("Update Admin Return Request Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update return request.",
    });
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
  getAdminPaymentAnalyticsController,
  getMonthlyPaymentAnalyticsController,
  getAllAdminOrdersController,
  updateAdminOrderStatusController,
  updateCourierTrackingController,
  submitReturnRequestController,
  getAdminReturnRequestsController,
updateAdminReturnRequestController,
};