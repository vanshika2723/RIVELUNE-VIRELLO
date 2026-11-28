
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Package,
  ArrowLeft,
  LoaderCircle,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
  Truck,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const formatPrice = (price) =>
  `PKR ${Number(price || 0).toLocaleString("en-PK")}`;
const formatHistoryDate = (date) => {
  if (!date) return "Awaiting update";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Awaiting update";
  }

  return parsedDate.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
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

  // Return / Exchange states
const [returnType, setReturnType] = useState("Return");
const [returnReason, setReturnReason] = useState("");
const [returnSubmitting, setReturnSubmitting] = useState(false);
const [returnMessage, setReturnMessage] = useState("");

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

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Order not found.");
    }

    return data.order;
  };

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

  const handleRefreshOrder = async () => {
    if (!order) return;

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
const handleReturnRequest = async (e) => {
  e.preventDefault();

  if (!order) return;

  setReturnSubmitting(true);
  setReturnMessage("");

  try {
    const response = await fetch(`${API_URL}/orders/return-request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        order_id: order.id,
        order_number: order.order_number,
        customer_name: order.customer_name,
        phone,
        request_type: returnType,
        reason: returnReason.trim(),
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Unable to submit request.");
    }

   setReturnMessage(data.message || "Your request has been submitted successfully.");
setReturnReason("");

const latestOrder = await fetchOrder(order.order_number, phone);
setOrder(latestOrder);
  } catch (err) {
    setReturnMessage(err.message || "Something went wrong.");
  } finally {
    setReturnSubmitting(false);
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

  const isCancelled =
    ["cancelled", "returned"].includes(
      order?.order_status?.toLowerCase()
    );
// Return / Exchange eligibility
const isDelivered =
  order?.order_status?.toLowerCase().trim() === "delivered";

const existingActiveReturnRequest =
  order?.return_requests?.some((request) =>
    ["pending", "approved"].includes(
      request.request_status?.toLowerCase()
    )
  );

const canRequestReturn =
  isDelivered && !isCancelled && !existingActiveReturnRequest;
  return (
    <main className="min-h-screen bg-[#faf9f6] px-4 py-10 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-3xl">

        {/* BACK BUTTON */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-gray-500 transition hover:text-[#a58b65]"
        >
          <ArrowLeft size={16} />
          BACK TO SHOPPING
        </Link>

        {/* HEADER */}
        <div className="mb-10 mt-12 text-center">

          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#f0e9de] text-[#a58b65]">
            <Package size={30} strokeWidth={1.4} />
          </div>

          <span className="text-xs font-semibold tracking-[0.35em] text-[#a58b65]">
            RIVELUNE ORDER CARE
          </span>

          <h1 className="mt-4 font-serif text-4xl text-[#25231f] sm:text-5xl">
            Track Your Order
          </h1>

          <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-gray-500">
            Your wardrobe journey, just a little closer.
            Enter your order details below to check your order status.
          </p>

          <div className="mx-auto mt-7 h-px w-20 bg-[#c3ad8d]" />

        </div>

        {/* TRACKING FORM */}
        <form
          onSubmit={handleTrackOrder}
          className="rounded-2xl border border-[#eeeae3] bg-white p-5 shadow-sm sm:p-8"
        >

          <div className="mb-7 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f3eee5] text-[#a58b65]">
              <Search size={20} />
            </div>

            <div>
              <h2 className="font-serif text-2xl text-[#25231f]">
                Find Your Order
              </h2>

              <p className="mt-1 text-xs text-gray-400">
                Enter your order details below.
              </p>
            </div>
          </div>

          <div className="space-y-5">

            {/* ORDER NUMBER */}
            <div>
              <label className="mb-2 block text-xs font-semibold tracking-wider text-gray-700">
                ORDER NUMBER
              </label>

              <input
                type="text"
                placeholder="e.g. RVL-123456"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                required
                className="w-full rounded-lg border border-[#e8e4dc] bg-[#fdfcfb] px-4 py-3.5 text-sm text-[#25231f] outline-none transition placeholder:text-gray-400 focus:border-[#a58b65] focus:ring-2 focus:ring-[#a58b65]/10"
              />
            </div>

            {/* PHONE NUMBER */}
            <div>
              <label className="mb-2 block text-xs font-semibold tracking-wider text-gray-700">
                PHONE NUMBER
              </label>

              <input
                type="tel"
                placeholder="Enter phone used at checkout"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full rounded-lg border border-[#e8e4dc] bg-[#fdfcfb] px-4 py-3.5 text-sm text-[#25231f] outline-none transition placeholder:text-gray-400 focus:border-[#a58b65] focus:ring-2 focus:ring-[#a58b65]/10"
              />
            </div>

            {/* ERROR */}
            {error && (
              <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-full bg-[#25231f] px-6 py-4 text-xs font-semibold tracking-[0.2em] text-white transition duration-300 hover:bg-[#a58b65] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <LoaderCircle size={17} className="animate-spin" />
                  LOOKING UP...
                </>
              ) : (
                <>
                  <Search size={17} />
                  TRACK ORDER
                </>
              )}
            </button>

          </div>
        </form>

        {/* ORDER RESULT */}
        {order && (
          <section className="mt-8 overflow-hidden rounded-2xl border border-[#eeeae3] bg-white shadow-sm">

            {/* ORDER HEADER */}
            <div className="border-b border-[#eeeae3] bg-[#faf8f4] p-5 sm:p-7">

              <div className="flex flex-wrap items-center justify-between gap-4">

                <div>
                  <span className="text-[10px] font-semibold tracking-[0.25em] text-[#a58b65]">
                    ORDER FOUND
                  </span>

                  <h2 className="mt-2 text-xl font-bold tracking-wider text-[#25231f]">
                    {order.order_number}
                  </h2>
                </div>

                <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#54785b]">
                  <CheckCircle2 size={15} />
                  ORDER DETAILS
                </div>

              </div>

              <button
                type="button"
                onClick={handleRefreshOrder}
                disabled={loading}
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#dcd3c5] bg-white px-4 py-2.5 text-[10px] font-semibold tracking-widest text-[#25231f] transition hover:border-[#a58b65] hover:text-[#a58b65] disabled:opacity-50"
              >
                <RefreshCw
                  size={14}
                  className={loading ? "animate-spin" : ""}
                />
                {loading ? "REFRESHING..." : "REFRESH STATUS"}
              </button>

            </div>

            {/* ORDER INFORMATION */}
            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:p-7">

              {[
                {
                  label: "ORDER STATUS",
                  value: order.order_status,
                },
                {
                  label: "PAYMENT STATUS",
                  value: order.payment_status,
                },
                {
                  label: "PAYMENT METHOD",
                  value: order.payment_method?.toUpperCase(),
                },
                {
                  label: "ORDER TOTAL",
                  value: formatPrice(order.total_amount),
                },
              ].map((detail) => (
                <div
                  key={detail.label}
                  className="rounded-xl border border-[#eeeae3] bg-[#fdfcfb] p-4"
                >
                  <p className="text-[10px] font-semibold tracking-widest text-gray-400">
                    {detail.label}
                  </p>

                  <p className="mt-2 break-words text-sm font-semibold text-[#25231f]">
                    {detail.value || "N/A"}
                  </p>
                </div>
              ))}

            </div>

            {/* ORDER TIMELINE */}
          {/* ORDER TIMELINE */}
<div className="border-t border-[#eeeae3] p-5 sm:p-7">

  <div className="mb-7 flex items-center gap-3">
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f3eee5] text-[#a58b65]">
      <Truck size={20} />
    </div>

    <div>
      <h3 className="font-serif text-2xl text-[#25231f]">
        Order Progress
      </h3>
      <p className="mt-1 text-xs text-gray-400">
        Follow your order journey with real-time status history.
      </p>
    </div>
  </div>

  {isCancelled ? (
    <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-center">
      <p className="text-sm font-semibold text-red-600">
        {order.order_status}
      </p>
      <p className="mt-1 text-xs text-red-500">
        This order is no longer progressing.
      </p>
    </div>
  ) : (
    <div className="space-y-0">
      {activeStatusSteps.map((step, index) => {
        const completed =
          currentStatusIndex >= 0 &&
          index <= currentStatusIndex;

        const active = index === currentStatusIndex;

        // Find actual history record for this status
        const historyEntry = order.status_history?.find(
          (entry) =>
            entry.status?.toLowerCase().trim() ===
            step.toLowerCase().trim()
        );

        return (
          <div className="flex gap-4" key={step}>
            {/* ICON + CONNECTOR */}
            <div className="flex flex-col items-center">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${
                  completed
                    ? "border-[#a58b65] bg-[#a58b65] text-white"
                    : "border-[#e8e4dc] bg-white text-gray-400"
                }`}
              >
                {completed ? (
                  <CheckCircle2 size={17} />
                ) : (
                  index + 1
                )}
              </div>

              {index !== activeStatusSteps.length - 1 && (
                <div
                  className={`my-1 min-h-9 w-px ${
                    completed
                      ? "bg-[#a58b65]"
                      : "bg-[#e8e4dc]"
                  }`}
                />
              )}
            </div>

            {/* STATUS + DATE */}
            <div className="pb-8 pt-2">
              <p
                className={`text-sm ${
                  active
                    ? "font-bold text-[#a58b65]"
                    : completed
                    ? "font-semibold text-[#25231f]"
                    : "text-gray-400"
                }`}
              >
                {step}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                {historyEntry
                  ? formatHistoryDate(historyEntry.changed_at)
                  : completed
                  ? "Date unavailable"
                  : "Awaiting update"}
              </p>

              {active && (
                <span className="mt-2 inline-block rounded-full bg-[#f3eee5] px-3 py-1 text-[10px] font-semibold tracking-wider text-[#a58b65]">
                  CURRENT STATUS
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  )}

  {currentStatusIndex === -1 && !isCancelled && (
    <p className="mt-3 rounded-lg bg-[#faf8f4] p-3 text-xs text-gray-500">
      Your order status has not yet matched a timeline step.
      Please refresh later.
    </p>
  )}

</div>
            {/* COURIER TRACKING DETAILS */}
            {order.courier_name && order.tracking_number && (
              <div className="border-t border-[#eeeae3] bg-[#faf8f4] p-5 sm:p-7">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f3eee5] text-[#a58b65]">
                    <Truck size={20} />
                  </div>

                  <div>
                    <h3 className="font-serif text-2xl text-[#25231f]">
                      Shipment Details
                    </h3>
                    <p className="mt-1 text-xs text-gray-400">
                      Your order is on its delivery journey.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* COURIER NAME */}
                  <div className="rounded-xl border border-[#eeeae3] bg-white p-4">
                    <p className="text-[10px] font-semibold tracking-widest text-gray-400">
                      COURIER PARTNER
                    </p>

                    <p className="mt-2 text-sm font-semibold text-[#25231f]">
                      {order.courier_name}
                    </p>
                  </div>

                  {/* TRACKING NUMBER */}
                  <div className="rounded-xl border border-[#eeeae3] bg-white p-4">
                    <p className="text-[10px] font-semibold tracking-widest text-gray-400">
                      TRACKING NUMBER
                    </p>

                    <p className="mt-2 break-all text-sm font-semibold text-[#25231f]">
                      {order.tracking_number}
                    </p>
                  </div>
                </div>

                {/* TRACK SHIPMENT BUTTON */}
                {order.tracking_url &&
                  /^https?:\/\/.+/i.test(order.tracking_url.trim()) && (
                    <a
                      href={order.tracking_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 flex w-full items-center justify-center gap-3 rounded-full bg-[#25231f] px-6 py-4 text-xs font-semibold tracking-[0.2em] text-white transition duration-300 hover:bg-[#a58b65]"
                    >
                      <Truck size={17} />
                      TRACK SHIPMENT
                    </a>
                  )}
              </div>
            )}

            {/* RETURN / EXCHANGE SECTION */}
{isDelivered && !isCancelled && (
  <div className="border-t border-[#eeeae3] bg-[#faf8f4] p-5 sm:p-7">
    <div className="mb-6">
      <span className="text-[10px] font-semibold tracking-[0.25em] text-[#a58b65]">
        ORDER CARE
      </span>

      <h3 className="mt-2 font-serif text-2xl text-[#25231f]">
        Returns & Exchanges
      </h3>

      <p className="mt-2 text-sm leading-6 text-gray-500">
        If something isn't quite right, you can request a return
        or exchange for your delivered order.
      </p>
    </div>

    {/* EXISTING REQUESTS */}
    {order.return_requests?.length > 0 && (
      <div className="mb-6 space-y-3">
        <h4 className="text-sm font-semibold text-[#25231f]">
          Your Previous Requests
        </h4>

        {order.return_requests.map((request) => (
          <div
            key={request.id}
            className="rounded-xl border border-[#eeeae3] bg-white p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-semibold text-[#25231f]">
                {request.request_type}
              </span>

              <span className="rounded-full bg-[#f3eee5] px-3 py-1 text-xs font-semibold text-[#a58b65]">
                {request.request_status}
              </span>
            </div>

            <p className="mt-2 text-sm text-gray-500">
              {request.reason}
            </p>

            {request.admin_notes && (
              <p className="mt-3 border-t border-[#eeeae3] pt-3 text-xs text-gray-500">
                Admin note: {request.admin_notes}
              </p>
            )}
          </div>
        ))}
      </div>
    )}

    {/* REQUEST FORM */}
    {canRequestReturn ? (
      <form onSubmit={handleReturnRequest} className="space-y-5">
        {/* REQUEST TYPE */}
        <div>
          <label className="mb-2 block text-xs font-semibold tracking-wider text-gray-700">
            REQUEST TYPE
          </label>

          <select
            value={returnType}
            onChange={(e) => setReturnType(e.target.value)}
            className="w-full rounded-lg border border-[#e8e4dc] bg-white px-4 py-3.5 text-sm text-[#25231f] outline-none focus:border-[#a58b65]"
          >
            <option value="Return">Return</option>
            <option value="Exchange">Exchange</option>
          </select>
        </div>

        {/* REASON */}
        <div>
          <label className="mb-2 block text-xs font-semibold tracking-wider text-gray-700">
            REASON
          </label>

          <textarea
            value={returnReason}
            onChange={(e) => setReturnReason(e.target.value)}
            placeholder="Please explain why you want to return or exchange this order..."
            rows={4}
            maxLength={1000}
            required
            className="w-full resize-y rounded-lg border border-[#e8e4dc] bg-white px-4 py-3.5 text-sm text-[#25231f] outline-none placeholder:text-gray-400 focus:border-[#a58b65]"
          />

          <p className="mt-1 text-right text-xs text-gray-400">
            {returnReason.length}/1000
          </p>
        </div>

        {/* RESPONSE MESSAGE */}
        {returnMessage && (
          <div className="rounded-lg border border-[#eeeae3] bg-white p-4 text-sm text-[#78664e]">
            {returnMessage}
          </div>
        )}

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={returnSubmitting || !returnReason.trim()}
          className="flex w-full items-center justify-center gap-3 rounded-full bg-[#25231f] px-6 py-4 text-xs font-semibold tracking-[0.2em] text-white transition hover:bg-[#a58b65] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {returnSubmitting ? (
            <>
              <LoaderCircle size={17} className="animate-spin" />
              SUBMITTING...
            </>
          ) : (
            `SUBMIT ${returnType.toUpperCase()} REQUEST`
          )}
        </button>
      </form>
    ) : (
      !existingActiveReturnRequest &&
      order.return_requests?.length === 0 && (
        <div className="rounded-xl border border-[#eeeae3] bg-white p-4 text-sm text-gray-500">
          Return or exchange request is not available for this order.
        </div>
      )
    )}

    {/* SUCCESS / ERROR MESSAGE AFTER SUBMISSION */}
    {returnMessage && !canRequestReturn && (
      <div className="mt-4 rounded-lg border border-[#eeeae3] bg-white p-4 text-sm text-[#78664e]">
        {returnMessage}
      </div>
    )}
  </div>
)}
            {/* ORDERED ITEMS */}
            <div className="border-t border-[#eeeae3] p-5 sm:p-7">

              <h3 className="mb-6 font-serif text-2xl text-[#25231f]">
                Items in Your Order
              </h3>

              <div className="space-y-5">

                {order.items?.map((item, index) => (
                  <div
                    className="flex gap-4 rounded-xl border border-[#eeeae3] bg-[#fdfcfb] p-3 sm:p-4"
                    key={index}
                  >

                    <div className="h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-[#f3eee5]">
                      <img
                        src={
                          item.product_image ||
                          "https://placehold.co/100"
                        }
                        alt={item.product_name}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">

                      <h4 className="text-sm font-semibold text-[#25231f]">
                        {item.product_name}
                      </h4>

                      <p className="mt-2 text-xs text-gray-500">
                        Size: {item.size}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Color: {item.color || "N/A"}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Quantity: {item.quantity}
                      </p>

                      <p className="mt-3 text-sm font-semibold text-[#a58b65]">
                        {formatPrice(item.total_price)}
                      </p>

                    </div>

                  </div>
                ))}

              </div>

            </div>

            {/* FOOTER */}
            <div className="border-t border-[#eeeae3] bg-[#faf8f4] p-5 text-center sm:p-6">

              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <ShieldCheck size={17} className="text-[#a58b65]" />
                Secure RIVELUNE order tracking
              </div>

              <Link
                to="/"
                className="mt-5 inline-flex items-center justify-center rounded-full bg-[#25231f] px-8 py-3.5 text-xs font-semibold tracking-[0.2em] text-white transition hover:bg-[#a58b65]"
              >
                CONTINUE SHOPPING
              </Link>

            </div>

          </section>
        )}

        {/* SUPPORT */}
        <div className="mt-8 rounded-xl border border-[#eeeae3] bg-white p-5 text-center">

          <p className="text-sm font-medium text-[#25231f]">
            Need help with your order?
          </p>

          <p className="mt-2 text-xs leading-6 text-gray-500">
            Contact our customer support for assistance with your delivery or payment.
          </p>

        </div>

      </div>
    </main>
  );
}

export default OrderTracking;
