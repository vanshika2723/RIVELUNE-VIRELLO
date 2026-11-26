
import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Clock,
  CheckCircle,
  XCircle,
  CreditCard,
  LogOut,
  Eye,
  Image,
  X,
} from "lucide-react";
import "../index.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function AdminPayments() {
  const [activeTab, setActiveTab] = useState("pending");

  const [payments, setPayments] = useState({
    pending: [],
    verified: [],
    rejected: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [actionLoading, setActionLoading] = useState(null);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  const [rejectPayment, setRejectPayment] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  

  // Payment proof viewer state
  const [proofUrl, setProofUrl] = useState(null);
  const [proofLoading, setProofLoading] = useState(false);
  const [proofError, setProofError] = useState("");
  const [proofOrderNumber, setProofOrderNumber] = useState("");

  // Clean up image URL when modal closes or component unmounts
  useEffect(() => {
    return () => {
      if (proofUrl) {
        URL.revokeObjectURL(proofUrl);
      }
    };
  }, [proofUrl]);

  const closeProofViewer = () => {
    setProofUrl(null);
    setProofError("");
    setProofOrderNumber("");
  };

  // Fetch protected payment proof
  const handleViewProof = async (payment) => {
    const token = sessionStorage.getItem("rivelune_admin_token");

    if (!token) {
      window.location.href = "/admin/login";
      return;
    }

    setProofLoading(true);
    setProofError("");
    setProofUrl(null);
    setProofOrderNumber(payment.order_number);

    try {
      const response = await fetch(
        `${API_URL}/admin/payments/${payment.id}/proof`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        sessionStorage.removeItem("rivelune_admin_token");
        sessionStorage.removeItem("rivelune_admin");
        window.location.href = "/admin/login";
        return;
      }

      if (!response.ok) {
        throw new Error("Unable to load payment proof image.");
      }

      const blob = await response.blob();

      if (!blob.type.startsWith("image/")) {
        throw new Error("The uploaded proof is not a valid image.");
      }

      const objectUrl = URL.createObjectURL(blob);
      setProofUrl(objectUrl);
    } catch (err) {
      setProofError(err.message || "Failed to load payment proof.");
    } finally {
      setProofLoading(false);
    }
  };

  // Verify wallet payment
  const handleVerifyPayment = async (payment) => {
    const confirmed = window.confirm(
      `Verify payment for Order #${payment.order_number}?`
    );

    if (!confirmed) return;

    const token = sessionStorage.getItem("rivelune_admin_token");

    if (!token) {
      window.location.href = "/admin/login";
      return;
    }

    setActionLoading(payment.id);
    setActionError("");
    setActionSuccess("");

    try {
      const response = await fetch(`${API_URL}/admin/payments/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          order_id: payment.id,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        sessionStorage.removeItem("rivelune_admin_token");
        sessionStorage.removeItem("rivelune_admin");
        window.location.href = "/admin/login";
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Payment verification failed.");
      }

      setActionSuccess("Payment verified successfully!");

      setPayments((prev) => ({
        ...prev,
        pending: prev.pending.filter(
          (item) => item.id !== payment.id
        ),
        verified: [
          {
            ...payment,
            payment_status: "Payment Verified",
            order_status: "Payment Verified",
            payment_review_notes: null,
          },
          ...prev.verified,
        ],
      }));
    } catch (err) {
      setActionError(err.message || "Unable to verify payment.");
      setActionSuccess("");
    } finally {
      setActionLoading(null);
    }
  };

  // Open rejection modal
  const handleRejectPayment = (payment) => {
    setRejectPayment(payment);
    setRejectionReason("");
    setActionError("");
    setActionSuccess("");
  };

  // Close rejection modal
  const closeRejectModal = () => {
    if (actionLoading === rejectPayment?.id) return;

    setRejectPayment(null);
    setRejectionReason("");
    setActionError("");
  };

  // Submit payment rejection
  const submitRejectPayment = async () => {
    if (!rejectPayment) return;

    const trimmedReason = rejectionReason.trim();

    if (!trimmedReason) {
      setActionError("Rejection reason is required.");
      return;
    }

    const token = sessionStorage.getItem("rivelune_admin_token");

    if (!token) {
      window.location.href = "/admin/login";
      return;
    }

    setActionLoading(rejectPayment.id);
    setActionError("");
    setActionSuccess("");

    try {
      const response = await fetch(`${API_URL}/admin/payments/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          order_id: rejectPayment.id,
          rejection_reason: trimmedReason,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        sessionStorage.removeItem("rivelune_admin_token");
        sessionStorage.removeItem("rivelune_admin");
        window.location.href = "/admin/login";
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Payment rejection failed.");
      }

      setActionSuccess("Payment rejected successfully!");

      setPayments((prev) => ({
        ...prev,
        pending: prev.pending.filter(
          (item) => item.id !== rejectPayment.id
        ),
        rejected: [
          {
            ...rejectPayment,
            payment_status: "Payment Rejected",
            order_status: "Payment Rejected",
            payment_review_notes: trimmedReason,
          },
          ...prev.rejected,
        ],
      }));

      setRejectPayment(null);
      setRejectionReason("");
    } catch (err) {
      setActionError(err.message || "Unable to reject payment.");
      setActionSuccess("");
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("rivelune_admin_token");
    sessionStorage.removeItem("rivelune_admin");

    window.location.href = "/admin/login";
  };

  // Fetch payments
  useEffect(() => {
    const fetchPayments = async () => {
      const token = sessionStorage.getItem("rivelune_admin_token");

      if (!token) {
        window.location.href = "/admin/login";
        return;
      }

      try {
        setLoading(true);
        setError("");

        const statuses = [
          {
            key: "pending",
            status: "Payment Verification Pending",
          },
          {
            key: "verified",
            status: "Payment Verified",
          },
          {
            key: "rejected",
            status: "Payment Rejected",
          },
        ];

        const results = await Promise.all(
          statuses.map(async ({ key, status }) => {
            const response = await fetch(
              `${API_URL}/admin/payments?status=${encodeURIComponent(status)}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            const data = await response.json();

            if (response.status === 401) {
              sessionStorage.removeItem("rivelune_admin_token");
              sessionStorage.removeItem("rivelune_admin");
              window.location.href = "/admin/login";
              throw new Error("Session expired. Please login again.");
            }

            if (!response.ok || !data.success) {
              throw new Error(data.message || "Failed to load payments.");
            }

            return [key, data.payments || []];
          })
        );

        setPayments(Object.fromEntries(results));
      } catch (err) {
        setError(err.message || "Unable to fetch payment records.");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const pendingCount = payments.pending.length;
  const verifiedCount = payments.verified.length;
  const rejectedCount = payments.rejected.length;

  const currentPayments = payments[activeTab];

  // Payment Search
const [paymentSearch, setPaymentSearch] = useState("");

// Payment Date Filters
const [startDate, setStartDate] = useState("");
const [endDate, setEndDate] = useState("");

const filteredPayments = currentPayments.filter((payment) => {
  const search = paymentSearch.trim().toLowerCase();

  const matchesSearch =
    !search ||
    String(payment.order_number || "").toLowerCase().includes(search) ||
    String(payment.customer_name || "").toLowerCase().includes(search) ||
    String(payment.phone || "").toLowerCase().includes(search) ||
    String(payment.transaction_id || "").toLowerCase().includes(search) ||
    String(payment.payment_method || "").toLowerCase().includes(search);

  const paymentDate = payment.created_at
    ? new Date(payment.created_at)
    : null;

  const matchesStartDate =
    !startDate ||
    (paymentDate &&
      paymentDate >= new Date(`${startDate}T00:00:00`));

  const matchesEndDate =
    !endDate ||
    (paymentDate &&
      paymentDate <= new Date(`${endDate}T23:59:59.999`));

  return matchesSearch && matchesStartDate && matchesEndDate;
});

// Payment Sorting
const [paymentSort, setPaymentSort] = useState("newest");

const sortedPayments = [...filteredPayments].sort((a, b) => {
  switch (paymentSort) {
    case "oldest":
      return Number(a.id) - Number(b.id);

    case "highest":
      return Number(b.total_amount || 0) - Number(a.total_amount || 0);

    case "lowest":
      return Number(a.total_amount || 0) - Number(b.total_amount || 0);

    case "newest":
    default:
      return Number(b.id) - Number(a.id);
  }
});

  return (
    <main className="admin-payments-page">
      <div className="admin-payments-container">
        {/* Header */}
        <header className="admin-payments-header">
          <div>
            <span className="admin-eyebrow">
              RIVELUNE ADMINISTRATION
            </span>
            <h1>Payment Review</h1>
            <p>
              Review customer wallet payments and manage verification.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              flexWrap: "wrap",
            }}
          >
            <div className="admin-secure-label">
              <ShieldCheck size={18} />
              Payment Management
            </div>

            <button
              onClick={handleLogout}
              type="button"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "11px 16px",
                background: "#28251f",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "500",
              }}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </header>

        {/* Payment Statistics */}
        <div className="admin-payment-stats">
          <div className="admin-payment-stat">
            <Clock size={20} />
            <span>Pending Reviews</span>
            <strong>{pendingCount}</strong>
          </div>

          <div className="admin-payment-stat">
            <CheckCircle size={20} />
            <span>Verified Payments</span>
            <strong>{verifiedCount}</strong>
          </div>

          <div className="admin-payment-stat">
            <XCircle size={20} />
            <span>Rejected Payments</span>
            <strong>{rejectedCount}</strong>
          </div>
        </div>

        {/* Payment Panel */}
        <section className="admin-payment-panel">
          {/* Tabs */}
          <div className="admin-payment-tabs">
            <button
              className={activeTab === "pending" ? "active" : ""}
              onClick={() => setActiveTab("pending")}
            >
              <Clock size={16} />
              Pending ({pendingCount})
            </button>

            <button
              className={activeTab === "verified" ? "active" : ""}
              onClick={() => setActiveTab("verified")}
            >
              <CheckCircle size={16} />
              Verified ({verifiedCount})
            </button>

            <button
              className={activeTab === "rejected" ? "active" : ""}
              onClick={() => setActiveTab("rejected")}
            >
              <XCircle size={16} />
              Rejected ({rejectedCount})
            </button>
          </div>

          {/* Payment List */}
          <div className="admin-payment-list">


{/* Payment Search Bar */}
<div className="admin-payment-search">
  <div className="admin-payment-search-input">
    <Eye size={18} />
    <input
      type="text"
      placeholder="Search order, customer, phone or transaction ID..."
      value={paymentSearch}
      onChange={(e) => setPaymentSearch(e.target.value)}
    />

    {paymentSearch && (
      <button
        type="button"
        onClick={() => setPaymentSearch("")}
        aria-label="Clear search"
      >
        <X size={16} />
      </button>
    )}
  </div>

  <span className="admin-payment-search-count">
    {filteredPayments.length} result
    {filteredPayments.length !== 1 ? "s" : ""}
  </span>
</div>
{/* Payment Sorting */}
<div className="admin-payment-sort">
  <label htmlFor="payment-sort">Sort by</label>

  <select
    id="payment-sort"
    value={paymentSort}
    onChange={(e) => setPaymentSort(e.target.value)}
  >
    <option value="newest">Newest First</option>
    <option value="oldest">Oldest First</option>
    <option value="highest">Highest Amount</option>
    <option value="lowest">Lowest Amount</option>
  </select>
</div>

{/* Payment Date Filters */}
<div className="admin-payment-date-filters">
  <div className="admin-payment-date-field">
    <label htmlFor="payment-start-date">From</label>
    <input
      id="payment-start-date"
      type="date"
      value={startDate}
      max={endDate || undefined}
      onChange={(e) => setStartDate(e.target.value)}
    />
  </div>

  <div className="admin-payment-date-field">
    <label htmlFor="payment-end-date">To</label>
    <input
      id="payment-end-date"
      type="date"
      value={endDate}
      min={startDate || undefined}
      onChange={(e) => setEndDate(e.target.value)}
    />
  </div>

  {(startDate || endDate) && (
  <button
    type="button"
    className="admin-payment-clear-date-btn"
    onClick={() => {
      setStartDate("");
      setEndDate("");
    }}
  >
    <X size={15} />
    Clear Dates
  </button>
)}
</div>
            {/* Action Error */}
            {actionError && !rejectPayment && (
              <div
                style={{
                  margin: "16px",
                  padding: "14px",
                  background: "#fff0ed",
                  border: "1px solid #f0c5bb",
                  borderRadius: "8px",
                  color: "#a83232",
                }}
              >
                {actionError}
              </div>
            )}

            {/* Action Success */}
            {actionSuccess && (
              <div
                style={{
                  margin: "16px",
                  padding: "14px 18px",
                  background: "#edf7ef",
                  border: "1px solid #b9ddc2",
                  borderRadius: "8px",
                  color: "#25653a",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                ✓ {actionSuccess}
              </div>
            )}

            {/* Loading */}
            {loading ? (
              <div className="admin-payment-empty">
                <Clock size={34} />
                <h3>Loading payments...</h3>
                <p>Please wait while payment records are fetched.</p>
              </div>
            ) : error ? (
              /* Fetch Error */
              <div className="admin-payment-empty">
                <XCircle size={34} />
                <h3>Unable to load payments</h3>
                <p>{error}</p>
              </div>
         ) : filteredPayments.length === 0 ? (
              /* Empty State */
             
<div className="admin-payment-empty">
  {paymentSearch.trim() ? (
    <>
      <div className="admin-payment-empty-icon">
        <Eye size={28} />
      </div>

      <h3>No Search Results</h3>

      <p>
        No payments found matching
        {" "}
        <strong>"{paymentSearch}"</strong>
      </p>

      <button
        type="button"
        className="admin-payment-clear-search"
        onClick={() => setPaymentSearch("")}
      >
        <X size={16} />
        Clear Search
      </button>
    </>
  ) : (
    <>
      <div className="admin-payment-empty-icon">
        <CreditCard size={28} />
      </div>

      <h3>
        {activeTab === "pending" && "Pending Payments"}
        {activeTab === "verified" && "Verified Payments"}
        {activeTab === "rejected" && "Rejected Payments"}
      </h3>

      <p>No payment records found in this category.</p>
    </>
  )}
</div>

            ) : (
            
<div className="admin-payment-cards">
{sortedPayments.map((payment) => (
    <article key={payment.id} className="admin-payment-card">
      {/* Order Header */}
      <div className="admin-payment-card-header">
        <div>
          <span className="admin-payment-order-label">ORDER</span>
          <strong>#{payment.order_number}</strong>
        </div>

        <div className="admin-payment-amount">
          PKR {Number(payment.total_amount || 0).toLocaleString()}
        </div>
      </div>

      {/* Customer Details */}
      <div className="admin-payment-card-details">
        <p>
          <strong>Customer</strong>
          <span>{payment.customer_name}</span>
        </p>

        <p>
          <strong>Phone</strong>
          <span>{payment.phone}</span>
        </p>

        <p>
          <strong>Payment Method</strong>
          <span>{payment.payment_method?.toUpperCase()}</span>
        </p>

        <p>
          <strong>Transaction ID</strong>
          <span>{payment.transaction_id || "Not provided"}</span>
        </p>

        <p>
          <strong>Payment Status</strong>
          <span>{payment.payment_status}</span>
        </p>

        {payment.payment_review_notes && (
          <p className="admin-payment-review-notes">
            <strong>Review Notes</strong>
            <span>{payment.payment_review_notes}</span>
          </p>
        )}

        <p>
          <strong>Order Status</strong>
          <span>{payment.order_status}</span>
        </p>
      </div>

      {/* View Payment Proof */}
      {payment.payment_proof && (
        <button
          type="button"
          className="admin-payment-proof-btn"
          onClick={() => handleViewProof(payment)}
        >
          <Eye size={16} />
          View Payment Proof
        </button>
      )}

      {/* Verify & Reject Actions */}
      {activeTab === "pending" && (
        <div className="admin-payment-card-actions">
          <button
            type="button"
            className="admin-payment-verify-btn"
            onClick={() => handleVerifyPayment(payment)}
            disabled={actionLoading === payment.id}
          >
            <CheckCircle size={16} />
            {actionLoading === payment.id
              ? "Processing..."
              : "Verify Payment"}
          </button>

          <button
            type="button"
            className="admin-payment-reject-btn"
            onClick={() => handleRejectPayment(payment)}
            disabled={actionLoading === payment.id}
          >
            <XCircle size={16} />
            Reject Payment
          </button>
        </div>
      )}
    </article>
  ))}
</div>

            )}
          </div>
        </section>
      </div>

      {/* Payment Proof Modal */}
      {(proofLoading || proofUrl || proofError) && (
        <div
          onClick={closeProofViewer}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(20, 18, 15, 0.78)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "760px",
              maxHeight: "90vh",
              overflow: "auto",
              background: "#f8f5ef",
              borderRadius: "14px",
              padding: "20px",
              boxShadow: "0 20px 70px rgba(0,0,0,0.3)",
            }}
          >
            {/* Proof Modal Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
                marginBottom: "18px",
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: "19px" }}>
                  Payment Proof
                </h2>
                <p style={{ margin: "6px 0 0", fontSize: "13px" }}>
                  Order #{proofOrderNumber}
                </p>
              </div>

              <button
                type="button"
                onClick={closeProofViewer}
                aria-label="Close payment proof"
                style={{
                  width: "38px",
                  height: "38px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid #ded6ca",
                  borderRadius: "50%",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Proof Loading */}
            {proofLoading && (
              <div
                style={{
                  padding: "45px 20px",
                  textAlign: "center",
                }}
              >
                <Clock size={32} />
                <p>Loading payment proof...</p>
              </div>
            )}

            {/* Proof Error */}
            {proofError && (
              <div
                style={{
                  padding: "25px",
                  textAlign: "center",
                  color: "#a52e25",
                }}
              >
                <XCircle size={32} />
                <p>{proofError}</p>
              </div>
            )}

            {/* Proof Image */}
            {proofUrl && (
              <div style={{ textAlign: "center" }}>
                <img
                  src={proofUrl}
                  alt="Customer payment proof"
                  style={{
                    display: "block",
                    maxWidth: "100%",
                    maxHeight: "65vh",
                    height: "auto",
                    margin: "0 auto",
                    objectFit: "contain",
                    borderRadius: "8px",
                    background: "#fff",
                    border: "1px solid #e9e2d8",
                  }}
                />

                <p
                  style={{
                    marginTop: "14px",
                    color: "#6d675e",
                    fontSize: "12px",
                  }}
                >
                  <Image
                    size={14}
                    style={{ verticalAlign: "middle" }}
                  />{" "}
                  Securely loaded payment image
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reject Payment Modal */}
      {rejectPayment && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(20, 20, 20, 0.55)",
            backdropFilter: "blur(5px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: "20px",
          }}
          onClick={closeRejectModal}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "460px",
              background: "#fff",
              borderRadius: "18px",
              padding: "28px",
              boxShadow: "0 25px 70px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "22px",
                  color: "#252525",
                }}
              >
                Reject Payment
              </h2>

              <button
                type="button"
                onClick={closeRejectModal}
                disabled={actionLoading === rejectPayment.id}
                aria-label="Close rejection modal"
                style={{
                  border: "none",
                  background: "#f4f4f4",
                  borderRadius: "50%",
                  width: "36px",
                  height: "36px",
                  cursor:
                    actionLoading === rejectPayment.id
                      ? "not-allowed"
                      : "pointer",
                  fontSize: "20px",
                  opacity:
                    actionLoading === rejectPayment.id ? 0.5 : 1,
                }}
              >
                ×
              </button>
            </div>

            {/* Order Information */}
            <p
              style={{
                color: "#666",
                fontSize: "14px",
                marginBottom: "18px",
              }}
            >
              Order #{rejectPayment.order_number}
            </p>

            {/* Rejection Reason Label */}
            <label
              htmlFor="payment-rejection-reason"
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#333",
                marginBottom: "8px",
              }}
            >
              Rejection Reason
            </label>

            {/* Rejection Reason Textarea */}
            <textarea
              id="payment-rejection-reason"
              value={rejectionReason}
              onChange={(e) => {
                setRejectionReason(e.target.value);
                if (actionError) setActionError("");
              }}
              disabled={actionLoading === rejectPayment.id}
              placeholder="Enter the reason for rejecting this payment..."
              rows={4}
              style={{
                width: "100%",
                padding: "13px",
                border: "1px solid #ddd",
                borderRadius: "10px",
                resize: "vertical",
                outline: "none",
                fontSize: "14px",
                fontFamily: "inherit",
                boxSizing: "border-box",
                opacity:
                  actionLoading === rejectPayment.id ? 0.7 : 1,
              }}
            />

            {/* Modal Error Message */}
            {actionError && (
              <div
                style={{
                  marginTop: "12px",
                  padding: "12px",
                  background: "#fff0ed",
                  border: "1px solid #f0c5bb",
                  borderRadius: "8px",
                  color: "#a83232",
                  fontSize: "13px",
                }}
              >
                {actionError}
              </div>
            )}

            {/* Modal Actions */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
                marginTop: "22px",
                flexWrap: "wrap",
              }}
            >
              {/* Cancel */}
              <button
                type="button"
                onClick={closeRejectModal}
                disabled={actionLoading === rejectPayment.id}
                style={{
                  padding: "11px 20px",
                  border: "1px solid #ddd",
                  borderRadius: "9px",
                  background: "#fff",
                  color: "#444",
                  cursor:
                    actionLoading === rejectPayment.id
                      ? "not-allowed"
                      : "pointer",
                  opacity:
                    actionLoading === rejectPayment.id ? 0.6 : 1,
                }}
              >
                Cancel
              </button>

              {/* Confirm Rejection - Connected */}
              <button
                type="button"
                onClick={submitRejectPayment}
                disabled={
                  !rejectionReason.trim() ||
                  actionLoading === rejectPayment.id
                }
                style={{
                  padding: "11px 20px",
                  border: "none",
                  borderRadius: "9px",
                  background:
                    rejectionReason.trim() &&
                    actionLoading !== rejectPayment.id
                      ? "#b83232"
                      : "#ccc",
                  color: "#fff",
                  cursor:
                    rejectionReason.trim() &&
                    actionLoading !== rejectPayment.id
                      ? "pointer"
                      : "not-allowed",
                  fontWeight: "600",
                  opacity:
                    actionLoading === rejectPayment.id ? 0.7 : 1,
                }}
              >
                {actionLoading === rejectPayment.id
                  ? "Processing..."
                  : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default AdminPayments;
