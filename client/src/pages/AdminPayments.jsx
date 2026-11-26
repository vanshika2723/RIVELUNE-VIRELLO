
import { useState, useEffect, useMemo } from "react";
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
  Download,
  TrendingUp,
  ShoppingBag,
  Wallet,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import "../index.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const formatPKR = (amount) =>
  `PKR ${Number(amount || 0).toLocaleString("en-PK", {
    maximumFractionDigits: 0,
  })}`;

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Simple SVG chart - no external chart package required
function RevenueTrendChart({ data = [] }) {
  const chartData = useMemo(() => {
    const last7Days = [...data];

    return last7Days;
  }, [data]);

  if (!chartData.length) {
    return (
      <div className="analytics-chart-empty">
        No order activity found for the last 7 days.
      </div>
    );
  }

  const width = 700;
  const height = 260;
  const paddingLeft = 48;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 42;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxValue = Math.max(
    ...chartData.map((item) => Number(item.total_amount || 0)),
    1
  );

  const points = chartData.map((item, index) => {
    const x =
      chartData.length === 1
        ? paddingLeft + chartWidth / 2
        : paddingLeft +
          (index / (chartData.length - 1)) * chartWidth;

    const y =
      paddingTop +
      chartHeight -
      (Number(item.total_amount || 0) / maxValue) * chartHeight;

    return {
      x,
      y,
      amount: Number(item.total_amount || 0),
      orders: Number(item.total_orders || 0),
      date: item.date,
    };
  });

  const linePath = points
    .map((point, index) =>
      `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`
    )
    .join(" ");

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${
    paddingTop + chartHeight
  } L ${points[0].x} ${paddingTop + chartHeight} Z`;

  return (
    <div className="analytics-chart-wrapper">
      <div className="analytics-chart-legend">
        <span className="analytics-legend-dot" />
        <span>Order Value</span>
      </div>

      <div className="analytics-chart-scroll">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="analytics-chart-svg"
          role="img"
          aria-label="Daily order value trend for the last seven days"
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = paddingTop + chartHeight * ratio;
            const value = Math.round(maxValue * (1 - ratio));

            return (
              <g key={ratio}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#ebe6df"
                  strokeDasharray="4 5"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="10"
                  fill="#8b8176"
                >
                  {value.toLocaleString()}
                </text>
              </g>
            );
          })}

          {/* Area */}
          <path d={areaPath} fill="rgba(184, 139, 82, 0.12)" />

          {/* Trend line */}
          <path
            d={linePath}
            fill="none"
            stroke="#b88b52"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points and labels */}
          {points.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r="5"
                fill="#b88b52"
                stroke="#fff"
                strokeWidth="2"
              />

              <text
                x={point.x}
                y={height - 12}
                textAnchor="middle"
                fontSize="11"
                fill="#80776c"
              >
                {point.date
                  ? new Date(point.date).toLocaleDateString("en", {
                      day: "numeric",
                      month: "short",
                    })
                  : ""}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="analytics-chart-summary">
        <div>
          <span>Total orders (7 days)</span>
          <strong>
            {chartData.reduce(
              (total, item) => total + Number(item.total_orders || 0),
              0
            )}
          </strong>
        </div>

        <div>
          <span>Order value (7 days)</span>
          <strong>
            {formatPKR(
              chartData.reduce(
                (total, item) => total + Number(item.total_amount || 0),
                0
              )
            )}
          </strong>
        </div>
      </div>
    </div>
  );
}

function AdminPayments() {
  const [activeTab, setActiveTab] = useState("pending");
const [monthlyAnalytics, setMonthlyAnalytics] = useState(null);
const [monthlyLoading, setMonthlyLoading] = useState(true);
const [monthlyError, setMonthlyError] = useState("");
  const [payments, setPayments] = useState({
    pending: [],
    verified: [],
    rejected: [],
  });

  // Analytics state
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState("");
  const [analyticsRefresh, setAnalyticsRefresh] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [actionLoading, setActionLoading] = useState(null);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  const [rejectPayment, setRejectPayment] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Payment proof viewer
  const [proofUrl, setProofUrl] = useState(null);
  const [proofLoading, setProofLoading] = useState(false);
  const [proofError, setProofError] = useState("");
  const [proofOrderNumber, setProofOrderNumber] = useState("");

  // Search, dates and sorting
  const [paymentSearch, setPaymentSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [paymentSort, setPaymentSort] = useState("newest");

  // Clean up proof image object URL
  useEffect(() => {
    return () => {
      if (proofUrl) URL.revokeObjectURL(proofUrl);
    };
  }, [proofUrl]);

  // Close proof viewer
  const closeProofViewer = () => {
    setProofUrl(null);
    setProofError("");
    setProofOrderNumber("");
  };

  // Fetch analytics
  useEffect(() => {
    const fetchAnalytics = async () => {
      const token = sessionStorage.getItem("rivelune_admin_token");

      if (!token) {
        window.location.href = "/admin/login";
        return;
      }

      setAnalyticsLoading(true);
      setAnalyticsError("");

      try {
        const response = await fetch(
          `${API_URL}/admin/payments/analytics`,
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
          return;
        }

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to load analytics."
          );
        }

        setAnalytics(data.analytics);
      } catch (err) {
        setAnalyticsError(
          err.message || "Unable to load analytics data."
        );
      } finally {
        setAnalyticsLoading(false);
      }
    };

    fetchAnalytics();
  }, [analyticsRefresh]);
// Fetch monthly comparison analytics
useEffect(() => {
  const fetchMonthlyAnalytics = async () => {
    const token = sessionStorage.getItem("rivelune_admin_token");

    if (!token) {
      window.location.href = "/admin/login";
      return;
    }

    setMonthlyLoading(true);
    setMonthlyError("");

    try {
      const response = await fetch(
        `${API_URL}/admin/payments/monthly-analytics`,
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
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load monthly analytics."
        );
      }

      setMonthlyAnalytics(data.analytics);
    } catch (err) {
      setMonthlyError(
        err.message || "Unable to load monthly analytics."
      );
    } finally {
      setMonthlyLoading(false);
    }
  };

  fetchMonthlyAnalytics();
}, [analyticsRefresh]);
  // View protected payment proof
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

      setProofUrl(URL.createObjectURL(blob));
    } catch (err) {
      setProofError(err.message || "Failed to load payment proof.");
    } finally {
      setProofLoading(false);
    }
  };

  // Verify payment
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
        body: JSON.stringify({ order_id: payment.id }),
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
        pending: prev.pending.filter((item) => item.id !== payment.id),
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

      setAnalyticsRefresh((prev) => prev + 1);
    } catch (err) {
      setActionError(err.message || "Unable to verify payment.");
      setActionSuccess("");
    } finally {
      setActionLoading(null);
    }
  };

  // Open reject modal
  const handleRejectPayment = (payment) => {
    setRejectPayment(payment);
    setRejectionReason("");
    setActionError("");
    setActionSuccess("");
  };

  // Close reject modal
  const closeRejectModal = () => {
    if (actionLoading === rejectPayment?.id) return;

    setRejectPayment(null);
    setRejectionReason("");
    setActionError("");
  };

  // Submit rejection
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
      setAnalyticsRefresh((prev) => prev + 1);
    } catch (err) {
      setActionError(err.message || "Unable to reject payment.");
      setActionSuccess("");
    } finally {
      setActionLoading(null);
    }
  };

  // Admin logout
  const handleLogout = () => {
    sessionStorage.removeItem("rivelune_admin_token");
    sessionStorage.removeItem("rivelune_admin");
    window.location.href = "/admin/login";
  };

  // Fetch payment records
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
          { key: "pending", status: "Payment Verification Pending" },
          { key: "verified", status: "Payment Verified" },
          { key: "rejected", status: "Payment Rejected" },
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

  // Counts
  const pendingCount = payments.pending.length;
  const verifiedCount = payments.verified.length;
  const rejectedCount = payments.rejected.length;

  const currentPayments = payments[activeTab];

  // Search and date filtering
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
      (paymentDate && paymentDate >= new Date(`${startDate}T00:00:00`));

    const matchesEndDate =
      !endDate ||
      (paymentDate &&
        paymentDate <= new Date(`${endDate}T23:59:59.999`));

    return matchesSearch && matchesStartDate && matchesEndDate;
  });

  // Sort payments
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

  // Export filtered and sorted payments to CSV
  const handleExportPayments = () => {
    if (!sortedPayments.length) return;

    const headers = [
      "Order Number",
      "Customer Name",
      "Phone",
      "Amount",
      "Payment Method",
      "Transaction ID",
      "Payment Status",
      "Order Status",
      "Date",
    ];

    const escapeCSV = (value) => {
      let text = String(value ?? "");

      if (/^[=+\-@\t\r]/.test(text)) {
        text = "'" + text;
      }

      return `"${text.replace(/"/g, '""')}"`;
    };

    const rows = sortedPayments.map((payment) => [
      payment.order_number,
      payment.customer_name,
      payment.phone,
      payment.total_amount,
      payment.payment_method,
      payment.transaction_id,
      payment.payment_status,
      payment.order_status,
      payment.created_at
        ? new Date(payment.created_at).toLocaleString()
        : "",
    ]);

    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `RIVELUNE-${activeTab}-payments-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const summary = analytics?.summary || {};
  const methods = analytics?.paymentMethods || [];
  const trend = analytics?.dailyTrend || [];

  const monthlyCurrent = monthlyAnalytics?.currentMonth || {};
const monthlyPrevious = monthlyAnalytics?.previousMonth || {};
const monthlyGrowth = monthlyAnalytics?.growth || {};

const getGrowthLabel = (current, previous, growth) => {
  const currentValue = Number(current || 0);
  const previousValue = Number(previous || 0);

  if (previousValue === 0 && currentValue > 0) {
    return "New";
  }

  if (previousValue === 0 && currentValue === 0) {
    return "0%";
  }

  const growthValue = Number(growth || 0);

  return `${growthValue > 0 ? "+" : ""}${growthValue.toFixed(1)}%`;
};

const getGrowthColor = (current, previous) => {
  const currentValue = Number(current || 0);
  const previousValue = Number(previous || 0);

  if (currentValue > previousValue) return "positive";
  if (currentValue < previousValue) return "negative";
  return "neutral";
};

const getBestPerformingMetric = () => {
  const metrics = [
    {
      key: "orders",
      value: Number(monthlyGrowth.orders || 0),
      current: Number(monthlyCurrent.orders || 0),
      previous: Number(monthlyPrevious.orders || 0),
    },
    {
      key: "orderValue",
      value: Number(monthlyGrowth.orderValue || 0),
      current: Number(monthlyCurrent.orderValue || 0),
      previous: Number(monthlyPrevious.orderValue || 0),
    },
    {
      key: "verifiedWalletRevenue",
      value: Number(monthlyGrowth.verifiedWalletRevenue || 0),
      current: Number(monthlyCurrent.verifiedWalletRevenue || 0),
      previous: Number(monthlyPrevious.verifiedWalletRevenue || 0),
    },
  ];

  const eligibleMetrics = metrics.filter(
    (metric) => metric.current > metric.previous
  );

  if (eligibleMetrics.length === 0) return null;

  return eligibleMetrics.reduce((best, metric) =>
    metric.value > best.value ? metric : best
  );
};

const bestPerformingMetric = getBestPerformingMetric();
const getGrowthIcon = (current, previous) => {
  const currentValue = Number(current || 0);
  const previousValue = Number(previous || 0);

  if (currentValue > previousValue) return ArrowUpRight;
  if (currentValue < previousValue) return ArrowDownRight;

  return null;
};
const currentMonthName = new Date().toLocaleString("en", {
  month: "long",
  year: "numeric",
});

const previousMonthName = new Date(
  new Date().getFullYear(),
  new Date().getMonth() - 1,
  1
).toLocaleString("en", {
  month: "long",
  year: "numeric",
});

  const totalMethodOrders = methods.reduce(
    (total, item) => total + Number(item.total_orders || 0),
    0
  );

  const paymentMethodName = (method) => {
    const names = {
      cod: "Cash on Delivery",
      easypaisa: "Easypaisa",
      jazzcash: "JazzCash",
    };

    return names[method] || method?.toUpperCase() || "Unknown";
  };

  const methodColor = (method) => {
    const colors = {
      cod: "#9c7a48",
      easypaisa: "#4a8b64",
      jazzcash: "#7c68b1",
    };

    return colors[method] || "#a18c76";
  };

  return (
    <main className="admin-payments-page">
      <div className="admin-payments-container">
        {/* Header */}
        <header className="admin-payments-header">
          <div>
            <span className="admin-eyebrow">RIVELUNE ADMINISTRATION</span>
            <h1>Payment Review</h1>
            <p>Review customer wallet payments and manage verification.</p>
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

        {/* ================= ANALYTICS DASHBOARD ================= */}
        <section className="admin-payment-analytics">
          <div className="admin-analytics-header">
            <div>
              <span className="admin-eyebrow">PAYMENT OVERVIEW</span>
              <h2>Analytics Dashboard</h2>
              <p>Monitor orders, payment activity and revenue trends.</p>
            </div>

            <button
              type="button"
              className="admin-analytics-refresh-btn"
              onClick={() => setAnalyticsRefresh((prev) => prev + 1)}
              disabled={analyticsLoading}
            >
              <RefreshCw
                size={16}
                className={analyticsLoading ? "analytics-spin" : ""}
              />
              {analyticsLoading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {analyticsError && (
            <div className="admin-analytics-error">
              <XCircle size={17} />
              <span>{analyticsError}</span>
              <button
                type="button"
                onClick={() => setAnalyticsRefresh((prev) => prev + 1)}
              >
                Retry
              </button>
            </div>
          )}

          {/* Analytics Cards */}
          <div className="admin-analytics-cards">
            <article className="admin-analytics-card analytics-card-orders">
              <div className="admin-analytics-card-top">
                <span className="admin-analytics-icon">
                  <ShoppingBag size={20} />
                </span>
                <span className="admin-analytics-label">Total Orders</span>
              </div>

              <strong className="admin-analytics-value">
                {analyticsLoading
                  ? "..."
                  : Number(summary.total_orders || 0).toLocaleString()}
              </strong>

              <span className="admin-analytics-footnote">
                All orders placed
              </span>
            </article>

            <article className="admin-analytics-card analytics-card-value">
              <div className="admin-analytics-card-top">
                <span className="admin-analytics-icon">
                  <TrendingUp size={20} />
                </span>
                <span className="admin-analytics-label">Total Order Value</span>
              </div>

              <strong className="admin-analytics-value">
                {analyticsLoading
                  ? "..."
                  : formatPKR(summary.total_order_value)}
              </strong>

              <span className="admin-analytics-footnote">
                All order amounts combined
              </span>
            </article>

            <article className="admin-analytics-card analytics-card-verified">
              <div className="admin-analytics-card-top">
                <span className="admin-analytics-icon">
                  <Wallet size={20} />
                </span>
                <span className="admin-analytics-label">Verified Wallet</span>
              </div>

              <strong className="admin-analytics-value">
                {analyticsLoading
                  ? "..."
                  : formatPKR(summary.verified_wallet_revenue)}
              </strong>

              <span className="admin-analytics-footnote">
                Confirmed wallet payments
              </span>
            </article>

            <article className="admin-analytics-card analytics-card-pending">
              <div className="admin-analytics-card-top">
                <span className="admin-analytics-icon">
                  <Clock size={20} />
                </span>
                <span className="admin-analytics-label">Pending Reviews</span>
              </div>

              <strong className="admin-analytics-value">
                {analyticsLoading
                  ? "..."
                  : Number(summary.pending_payments || 0).toLocaleString()}
              </strong>

              <span className="admin-analytics-footnote">
                Awaiting payment verification
              </span>
            </article>
          </div>

{/* Monthly Insights */}
<section className="monthly-insights-section">
  <div className="monthly-insights-header">
    <div>
      <h2>Monthly Insights</h2>
      <p>Compare this month with the previous month</p>
    </div>

    <div className="monthly-insights-period">
      <span>{currentMonthName}</span>
      <span className="monthly-period-arrow">→</span>
      <span>{previousMonthName}</span>
    </div>
  </div>

  {monthlyLoading ? (
    <div className="monthly-insights-loading">
      <RefreshCw size={20} className="analytics-spin" />
      <span>Loading monthly insights...</span>
    </div>
  ) : monthlyError ? (
    <div className="monthly-insights-error">
      {monthlyError}
    </div>
  ) : monthlyAnalytics ? (
    <div className="monthly-insights-grid">

      {/* Monthly Orders */}
      <div
        className={`monthly-insight-card ${
          bestPerformingMetric?.key === "orders"
            ? "best-performing"
            : ""
        }`}
      >
        <div className="monthly-insight-top">
          <div className="monthly-insight-icon orders">
            <ShoppingBag size={20} />
          </div>

          <span
            className={`monthly-growth-badge ${getGrowthColor(
              monthlyCurrent.orders,
              monthlyPrevious.orders
            )}`}
          >
            {(() => {
              const GrowthIcon = getGrowthIcon(
                monthlyCurrent.orders,
                monthlyPrevious.orders
              );

              return (
                <>
                  {GrowthIcon && <GrowthIcon size={14} />}
                  {getGrowthLabel(
                    monthlyCurrent.orders,
                    monthlyPrevious.orders,
                    monthlyGrowth.orders
                  )}
                </>
              );
            })()}
          </span>
        </div>

        {bestPerformingMetric?.key === "orders" && (
          <div className="best-performance-label">
            <TrendingUp size={13} />
            Best Performance
          </div>
        )}

        <h3>Monthly Orders</h3>

        <div className="monthly-comparison-values">
          <div>
            <strong>{monthlyCurrent.orders ?? 0}</strong>
            <span>This Month</span>
          </div>

          <div className="monthly-comparison-divider">vs</div>

          <div>
            <strong>{monthlyPrevious.orders ?? 0}</strong>
            <span>Last Month</span>
          </div>
        </div>
      </div>

      {/* Order Value */}
      <div
        className={`monthly-insight-card ${
          bestPerformingMetric?.key === "orderValue"
            ? "best-performing"
            : ""
        }`}
      >
        <div className="monthly-insight-top">
          <div className="monthly-insight-icon value">
            <TrendingUp size={20} />
          </div>

          <span
            className={`monthly-growth-badge ${getGrowthColor(
              monthlyCurrent.orderValue,
              monthlyPrevious.orderValue
            )}`}
          >
            {(() => {
              const GrowthIcon = getGrowthIcon(
                monthlyCurrent.orderValue,
                monthlyPrevious.orderValue
              );

              return (
                <>
                  {GrowthIcon && <GrowthIcon size={14} />}
                  {getGrowthLabel(
                    monthlyCurrent.orderValue,
                    monthlyPrevious.orderValue,
                    monthlyGrowth.orderValue
                  )}
                </>
              );
            })()}
          </span>
        </div>

        {bestPerformingMetric?.key === "orderValue" && (
          <div className="best-performance-label">
            <TrendingUp size={13} />
            Best Performance
          </div>
        )}

        <h3>Order Value</h3>

        <div className="monthly-comparison-values">
          <div>
            <strong>{formatPKR(monthlyCurrent.orderValue)}</strong>
            <span>This Month</span>
          </div>

          <div className="monthly-comparison-divider">vs</div>

          <div>
            <strong>{formatPKR(monthlyPrevious.orderValue)}</strong>
            <span>Last Month</span>
          </div>
        </div>
      </div>

      {/* Verified Wallet Revenue */}
      <div
        className={`monthly-insight-card ${
          bestPerformingMetric?.key === "verifiedWalletRevenue"
            ? "best-performing"
            : ""
        }`}
      >
        <div className="monthly-insight-top">
          <div className="monthly-insight-icon wallet">
            <Wallet size={20} />
          </div>

          <span
            className={`monthly-growth-badge ${getGrowthColor(
              monthlyCurrent.verifiedWalletRevenue,
              monthlyPrevious.verifiedWalletRevenue
            )}`}
          >
            {(() => {
              const GrowthIcon = getGrowthIcon(
                monthlyCurrent.verifiedWalletRevenue,
                monthlyPrevious.verifiedWalletRevenue
              );

              return (
                <>
                  {GrowthIcon && <GrowthIcon size={14} />}
                  {getGrowthLabel(
                    monthlyCurrent.verifiedWalletRevenue,
                    monthlyPrevious.verifiedWalletRevenue,
                    monthlyGrowth.verifiedWalletRevenue
                  )}
                </>
              );
            })()}
          </span>
        </div>

        {bestPerformingMetric?.key === "verifiedWalletRevenue" && (
          <div className="best-performance-label">
            <TrendingUp size={13} />
            Best Performance
          </div>
        )}

        <h3>Verified Wallet Revenue</h3>

        <div className="monthly-comparison-values">
          <div>
            <strong>
              {formatPKR(monthlyCurrent.verifiedWalletRevenue)}
            </strong>
            <span>This Month</span>
          </div>

          <div className="monthly-comparison-divider">vs</div>

          <div>
            <strong>
              {formatPKR(monthlyPrevious.verifiedWalletRevenue)}
            </strong>
            <span>Last Month</span>
          </div>
        </div>
      </div>

    </div>
  ) : (
    <div className="monthly-insights-empty">
      Monthly comparison data is not available.
    </div>
  )}
</section>

          {/* Wallet Payment Status */}
          <div className="admin-analytics-status-row">
            <div className="admin-analytics-status-item">
              <span className="analytics-status-indicator status-pending" />
              <span>Pending Wallet</span>
              <strong>
                {analyticsLoading ? "..." : summary.pending_payments || 0}
              </strong>
            </div>

            <div className="admin-analytics-status-item">
              <span className="analytics-status-indicator status-verified" />
              <span>Verified Wallet</span>
              <strong>
                {analyticsLoading ? "..." : summary.verified_payments || 0}
              </strong>
            </div>

            <div className="admin-analytics-status-item">
              <span className="analytics-status-indicator status-rejected" />
              <span>Rejected Wallet</span>
              <strong>
                {analyticsLoading ? "..." : summary.rejected_payments || 0}
              </strong>
            </div>
          </div>

          {/* Chart + Payment Methods */}
          <div className="admin-analytics-content-grid">
            <section className="admin-analytics-box admin-analytics-trend">
              <div className="admin-analytics-box-heading">
                <div>
                  <h3>7-Day Order Trend</h3>
                  <p>Daily order value based on order date</p>
                </div>
                <TrendingUp size={19} />
              </div>

              {analyticsLoading ? (
                <div className="analytics-chart-empty">
                  Loading chart data...
                </div>
              ) : (
                <RevenueTrendChart data={trend} />
              )}
            </section>

            <section className="admin-analytics-box admin-analytics-methods">
              <div className="admin-analytics-box-heading">
                <div>
                  <h3>Payment Methods</h3>
                  <p>Order distribution by payment type</p>
                </div>
                <CreditCard size={19} />
              </div>

              {analyticsLoading ? (
                <div className="analytics-chart-empty">
                  Loading payment methods...
                </div>
              ) : methods.length === 0 ? (
                <div className="analytics-chart-empty">
                  No payment method data available.
                </div>
              ) : (
                <div className="analytics-method-list">
                  {methods.map((method) => {
                    const count = Number(method.total_orders || 0);
                    const percentage = totalMethodOrders
                      ? (count / totalMethodOrders) * 100
                      : 0;

                    return (
                      <div
                        className="analytics-method-item"
                        key={method.payment_method}
                      >
                        <div className="analytics-method-top">
                          <span className="analytics-method-name">
                            <span
                              className="analytics-method-dot"
                              style={{
                                background: methodColor(method.payment_method),
                              }}
                            />
                            {paymentMethodName(method.payment_method)}
                          </span>
                          <strong>{count} orders</strong>
                        </div>

                        <div className="analytics-method-track">
                          <div
                            className="analytics-method-progress"
                            style={{
                              width: `${percentage}%`,
                              background: methodColor(method.payment_method),
                            }}
                          />
                        </div>

                        <div className="analytics-method-bottom">
                          <span>{percentage.toFixed(1)}% of orders</span>
                          <span>{formatPKR(method.total_amount)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </section>

        {/* Existing Payment Statistics */}
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
          <div className="admin-payment-tabs">
            <button
              className={activeTab === "pending" ? "active" : ""}
              onClick={() => setActiveTab("pending")}
              type="button"
            >
              <Clock size={16} />
              Pending ({pendingCount})
            </button>

            <button
              className={activeTab === "verified" ? "active" : ""}
              onClick={() => setActiveTab("verified")}
              type="button"
            >
              <CheckCircle size={16} />
              Verified ({verifiedCount})
            </button>

            <button
              className={activeTab === "rejected" ? "active" : ""}
              onClick={() => setActiveTab("rejected")}
              type="button"
            >
              <XCircle size={16} />
              Rejected ({rejectedCount})
            </button>
          </div>

          {/* Payment List */}
          <div className="admin-payment-list">
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

              <button
                type="button"
                className="admin-payment-export-btn"
                onClick={handleExportPayments}
                disabled={sortedPayments.length === 0}
              >
                <Download size={16} />
                Export CSV
              </button>

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
            </div>

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

            {loading ? (
              <div className="admin-payment-empty">
                <Clock size={34} />
                <h3>Loading payments...</h3>
                <p>Please wait while payment records are fetched.</p>
              </div>
            ) : error ? (
              <div className="admin-payment-empty">
                <XCircle size={34} />
                <h3>Unable to load payments</h3>
                <p>{error}</p>
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="admin-payment-empty">
                {paymentSearch.trim() || startDate || endDate ? (
                  <>
                    <div className="admin-payment-empty-icon">
                      <Eye size={28} />
                    </div>
                    <h3>No Matching Payments</h3>
                    <p>
                      No payments found with the current search or date filters.
                    </p>
                    <button
                      type="button"
                      className="admin-payment-clear-search"
                      onClick={() => {
                        setPaymentSearch("");
                        setStartDate("");
                        setEndDate("");
                      }}
                    >
                      <X size={16} />
                      Clear Filters
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
                  <article
                    key={payment.id}
                    className="admin-payment-card"
                  >
                    <div className="admin-payment-card-header">
                      <div>
                        <span className="admin-payment-order-label">
                          ORDER
                        </span>
                        <strong>#{payment.order_number}</strong>
                      </div>

                      <div className="admin-payment-amount">
                        PKR{" "}
                        {Number(payment.total_amount || 0).toLocaleString()}
                      </div>
                    </div>

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

                      <p>
                        <strong>Date</strong>
                        <span>{formatDate(payment.created_at)}</span>
                      </p>
                    </div>

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

            {proofLoading && (
              <div style={{ padding: "45px 20px", textAlign: "center" }}>
                <Clock size={32} />
                <p>Loading payment proof...</p>
              </div>
            )}

            {proofError && (
              <div style={{ padding: "25px", textAlign: "center", color: "#a52e25" }}>
                <XCircle size={32} />
                <p>{proofError}</p>
              </div>
            )}

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
                  <Image size={14} style={{ verticalAlign: "middle" }} /> Securely
                  loaded payment image
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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <h2 style={{ margin: 0, fontSize: "22px", color: "#252525" }}>
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
                  cursor: actionLoading === rejectPayment.id ? "not-allowed" : "pointer",
                  fontSize: "20px",
                  opacity: actionLoading === rejectPayment.id ? 0.5 : 1,
                }}
              >
                ×
              </button>
            </div>

            <p style={{ color: "#666", fontSize: "14px", marginBottom: "18px" }}>
              Order #{rejectPayment.order_number}
            </p>

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
                opacity: actionLoading === rejectPayment.id ? 0.7 : 1,
              }}
            />

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

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
                marginTop: "22px",
                flexWrap: "wrap",
              }}
            >
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
                  cursor: actionLoading === rejectPayment.id ? "not-allowed" : "pointer",
                  opacity: actionLoading === rejectPayment.id ? 0.6 : 1,
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={submitRejectPayment}
                disabled={!rejectionReason.trim() || actionLoading === rejectPayment.id}
                style={{
                  padding: "11px 20px",
                  border: "none",
                  borderRadius: "9px",
                  background:
                    rejectionReason.trim() && actionLoading !== rejectPayment.id
                      ? "#b83232"
                      : "#ccc",
                  color: "#fff",
                  cursor:
                    rejectionReason.trim() && actionLoading !== rejectPayment.id
                      ? "pointer"
                      : "not-allowed",
                  fontWeight: "600",
                  opacity: actionLoading === rejectPayment.id ? 0.7 : 1,
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
