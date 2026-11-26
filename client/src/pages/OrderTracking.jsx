
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Package,
  ArrowLeft,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";
import "../index.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const formatPrice = (price) =>
  `PKR ${Number(price || 0).toLocaleString("en-PK")}`;


const walletStatusSteps = [
  "Payment Verification Pending",
  "Pending Confirmation",
  "Confirmed",
  "Processing",
  "Dispatched",
  "Out for Delivery",
  "Delivered",
];

const codStatusSteps = [
  "Pending Confirmation",
  "Confirmed",
  "Processing",
  "Dispatched",
  "Out for Delivery",
  "Delivered",
];
const getStatusIndex = (status, steps) => {
  const normalizedStatus = (status || "").toLowerCase().trim();

  if (
    normalizedStatus === "cancelled" ||
    normalizedStatus === "returned"
  ) {
    return -1;
  }

  return steps.findIndex(
    (step) => step.toLowerCase() === normalizedStatus
  );
};

function OrderTracking() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch Order API
  const fetchOrder = async (orderNo, customerPhone) => {
    const response = await fetch(`${API_URL}/orders/lookup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        order_number: orderNo.trim(),
        phone: customerPhone.trim(),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Order not found.");
    }

    return data.order;
  };

  // Track Order
  const handleTrackOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const data = await fetchOrder(orderNumber, phone);
      setOrder(data);
    } catch (err) {
      setError(err.message || "Unable to find order.");
    } finally {
      setLoading(false);
    }
  };

  // Refresh Order Status
  const handleRefreshOrder = async () => {
    setLoading(true);
    setError("");

    try {
      const latestOrder = await fetchOrder(
        order.order_number,
        phone
      );

      setOrder(latestOrder);
    } catch (err) {
      setError(err.message || "Unable to refresh order.");
    } finally {
      setLoading(false);
    }
  };

const isWalletOrder =
  order &&
  ["easypaisa", "jazzcash"].includes(
    order.payment_method?.toLowerCase()
  );

const activeStatusSteps = isWalletOrder
  ? walletStatusSteps
  : codStatusSteps;

const currentStatusIndex = order
  ? getStatusIndex(order.order_status, activeStatusSteps)
  : -1;

  return (
    <main className="tracking-page">
      <div className="tracking-container">

        <Link to="/" className="tracking-back">
          <ArrowLeft size={16} />
          Back to Shopping
        </Link>

        <div className="tracking-header">
          <Package size={30} strokeWidth={1.4} />
          <span>RIVELUNE ORDER CARE</span>
          <h1>Track Your Order</h1>
          <p>
            Your wardrobe journey, just a little closer.
            Enter your order details below to check your order status.
          </p>
        </div>

        <form className="tracking-form" onSubmit={handleTrackOrder}>
          <label>ORDER NUMBER</label>

          <input
            type="text"
            placeholder="e.g. RVL-123456"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            required
          />

          <label>PHONE NUMBER</label>

          <input
            type="tel"
            placeholder="Enter phone used at checkout"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? (
              <>
                <LoaderCircle
                  className="tracking-loader"
                  size={17}
                />
                LOOKING UP...
              </>
            ) : (
              <>
                <Search size={17} />
                TRACK ORDER
              </>
            )}
          </button>

          {error && (
            <div className="tracking-error">
              {error}
            </div>
          )}
        </form>

        {order && (
          <section className="tracking-result">

            <div className="tracking-result-top">
              <span>ORDER FOUND</span>
              <strong>{order.order_number}</strong>
            </div>

            {/* Refresh Status Button */}
            <button
              type="button"
              className="tracking-refresh-btn"
              onClick={handleRefreshOrder}
              disabled={loading}
            >
              <RefreshCw
                size={15}
                className={loading ? "tracking-loader" : ""}
              />
              {loading ? "REFRESHING..." : "REFRESH STATUS"}
            </button>

            <div className="tracking-status">
              <span>Current Order Status</span>
              <strong>{order.order_status}</strong>
            </div>

            <div className="tracking-status">
              <span>Payment Status</span>
              <strong>{order.payment_status}</strong>
            </div>

            <div className="tracking-status">
              <span>Payment Method</span>
              <strong>
                {order.payment_method?.toUpperCase()}
              </strong>
            </div>

            <div className="tracking-status">
              <span>Order Total</span>
              <strong>
                {formatPrice(order.total_amount)}
              </strong>
            </div>

            {/* Order Progress Timeline */}
            <div className="tracking-timeline">
              <h3>Order Progress</h3>

              {["Cancelled", "Returned"].includes(
                order.order_status
              ) ? (
                <div className="tracking-cancelled">
                  {order.order_status}
                </div>
              ) : (
                <div className="timeline-steps">
               {activeStatusSteps.map((step, index) => {
                    const completed =
                      index <= currentStatusIndex;

                    const active =
                      index === currentStatusIndex;

                    return (
                      <div
                        className={`timeline-step ${
                          completed ? "completed" : ""
                        } ${
                          active ? "active" : ""
                        }`}
                        key={step}
                      >
                        <div className="timeline-marker">
                          {completed ? "✓" : index + 1}
                        </div>

                        <div className="timeline-step-text">
                          <strong>{step}</strong>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <h3>Items in your order</h3>

            {order.items?.map((item, index) => (
              <div className="tracking-item" key={index}>
                <img
                  src={
                    item.product_image ||
                    "https://placehold.co/100"
                  }
                  alt={item.product_name}
                />

                <div>
                  <strong>{item.product_name}</strong>

                  <span>
                    Size: {item.size} | Qty: {item.quantity}
                  </span>

                  <span>
                    {formatPrice(item.total_price)}
                  </span>
                </div>
              </div>
            ))}

          </section>
        )}

        {error && order && (
          <div className="tracking-error">
            {error}
          </div>
        )}

        <div className="tracking-help">
          Need help with your order? Contact our customer support.
        </div>

      </div>
    </main>
  );
}

export default OrderTracking;
