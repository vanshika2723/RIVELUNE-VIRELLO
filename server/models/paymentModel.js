
const db = require("../config/db");

const submitPaymentProof = (orderId, transactionId, proofFilename) => {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE orders
      SET
        transaction_id = ?,
        payment_proof = ?,
        payment_status = 'Payment Verification Pending',
        order_status = 'Payment Verification Pending',
        payment_review_notes = NULL
      WHERE id = ?
        AND payment_method IN ('easypaisa', 'jazzcash')
        AND (
          (
            payment_status NOT IN (
              'Payment Verified',
              'Payment Verification Pending',
              'Payment Rejected'
            )
            AND transaction_id IS NULL
            AND payment_proof IS NULL
          )
          OR payment_status = 'Payment Rejected'
        )
    `;

    db.query(query, [transactionId, proofFilename, orderId], (err, result) => {
      if (err) return reject(err);
      resolve(result.affectedRows > 0);
    });
  });
};

// Reject pending wallet payment
const rejectPaymentProof = (orderId, rejectionReason) => {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE orders
      SET
        payment_status = 'Payment Rejected',
        order_status = 'Payment Rejected',
        payment_review_notes = ?
      WHERE id = ?
        AND payment_status = 'Payment Verification Pending'
        AND payment_method IN ('easypaisa', 'jazzcash')
    `;

    db.query(query, [rejectionReason, orderId], (err, result) => {
      if (err) return reject(err);
      resolve(result.affectedRows > 0);
    });
  });
};

// Verify pending wallet payment
const verifyPaymentProof = (orderId) => {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE orders
      SET
        payment_status = 'Payment Verified',
        order_status = 'Payment Verified',
        payment_verified_at = NOW(),
        payment_review_notes = NULL
      WHERE id = ?
        AND payment_status = 'Payment Verification Pending'
        AND payment_method IN ('easypaisa', 'jazzcash')
    `;

    db.query(query, [orderId], (err, result) => {
      if (err) return reject(err);
      resolve(result.affectedRows > 0);
    });
  });
};

// Fetch payment proof filename for wallet payments only
const getPaymentProofByOrderId = (orderId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT id, payment_proof
      FROM orders
      WHERE id = ?
        AND payment_method IN ('easypaisa', 'jazzcash')
        AND payment_proof IS NOT NULL
      LIMIT 1
    `;

    db.query(query, [orderId], (err, results) => {
      if (err) return reject(err);
      resolve(results[0] || null);
    });
  });
};

module.exports = {
  submitPaymentProof,
  rejectPaymentProof,
  verifyPaymentProof,
  getPaymentProofByOrderId,
};
