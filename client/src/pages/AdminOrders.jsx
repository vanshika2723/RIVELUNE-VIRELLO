
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  CreditCard,
  Package,
  Users,
  Ticket,
  Settings,
  Boxes,
  Search,
  RefreshCw,
  ArrowLeft,
  ChevronRight,
  Eye,
  X,
  Clock,
  CheckCircle2,
  Truck,
  LoaderCircle,
  Save,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const formatPrice = (price) =>
  `PKR ${Number(price || 0).toLocaleString("en-PK")}`;

const formatDate = (date) => {
  if (!date) return "N/A";

  return new Date(date).toLocaleDateString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const statusStyles = {
  "Pending Confirmation": "bg-amber-50 text-amber-700 border-amber-200",
  Confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  Processing: "bg-violet-50 text-violet-700 border-violet-200",
  Dispatched: "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Out for Delivery": "bg-orange-50 text-orange-700 border-orange-200",
  Delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Cancelled: "bg-red-50 text-red-700 border-red-200",
  Returned: "bg-rose-50 text-rose-700 border-rose-200",
  "Payment Verification Pending": "bg-amber-50 text-amber-700 border-amber-200",
  "Payment Verified": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Payment Rejected": "bg-red-50 text-red-700 border-red-200",
};

const orderStatuses = [
  "Pending Confirmation",
  "Confirmed",
  "Processing",
  "Dispatched",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
  "Returned",
];

function AdminOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [error, setError] = useState("");



  // Status update states
  const [newStatus, setNewStatus] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusError, setStatusError] = useState("");

  // Courier tracking states
const [courierName, setCourierName] = useState("");
const [trackingNumber, setTrackingNumber] = useState("");
const [trackingUrl, setTrackingUrl] = useState("");
const [savingTracking, setSavingTracking] = useState(false);
const [trackingMessage, setTrackingMessage] = useState("");
const [trackingError, setTrackingError] = useState("");

  const getToken = () =>
    sessionStorage.getItem("rivelune_admin_token");

  // ==========================================
  // FETCH ORDERS
  // ==========================================
  const fetchOrders = async () => {
    try {
      setError("");

      const token = getToken();

      const response = await fetch(`${API_URL}/admin/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("rivelune_admin_token");
        navigate("/admin/login");
        return [];
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load orders.");
      }

      const fetchedOrders = data.orders || [];
      setOrders(fetchedOrders);

      return fetchedOrders;
    } catch (err) {
      setError(err.message || "Unable to fetch orders.");
      return [];
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Update dropdown when selected order changes
// Update dropdown and courier tracking form when selected order changes
useEffect(() => {
  if (selectedOrder) {
    setNewStatus(selectedOrder.order_status || "Pending Confirmation");

    setCourierName(selectedOrder.courier_name || "");
    setTrackingNumber(selectedOrder.tracking_number || "");
    setTrackingUrl(selectedOrder.tracking_url || "");

    setStatusMessage("");
    setStatusError("");
    setTrackingMessage("");
    setTrackingError("");
  }
}, [selectedOrder?.id, selectedOrder?.order_status]);

  // ==========================================
  // UPDATE ORDER STATUS
  // ==========================================
  const handleStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) return;

    if (newStatus === selectedOrder.order_status) {
      setStatusError("Please select a different status.");
      return;
    }

    try {
      setUpdatingStatus(true);
      setStatusMessage("");
      setStatusError("");

      const token = getToken();

      const response = await fetch(`${API_URL}/admin/orders/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          status: newStatus,
        }),
      });

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("rivelune_admin_token");
        navigate("/admin/login");
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update order status.");
      }

      // Refresh orders after successful update
      const updatedOrders = await fetchOrders();

      const updatedOrder = updatedOrders.find(
        (order) => order.id === selectedOrder.id
      );

      if (updatedOrder) {
        setSelectedOrder(updatedOrder);
        setNewStatus(updatedOrder.order_status);
      } else {
        // Keep modal state updated in case order is not in refreshed list
        setSelectedOrder((prev) => ({
          ...prev,
          order_status: newStatus,
        }));
      }

      setStatusMessage(data.message || "Order status updated successfully!");
    } catch (err) {
      setStatusError(err.message || "Unable to update order status.");
    } finally {
      setUpdatingStatus(false);
    }
  };
// ==========================================
// SAVE COURIER TRACKING
// ==========================================
const handleCourierTrackingUpdate = async () => {
  if (!selectedOrder) return;

  if (!courierName.trim() || !trackingNumber.trim()) {
    setTrackingError("Courier name and tracking number are required.");
    return;
  }

  if (
    trackingUrl.trim() &&
    !/^https?:\/\/.+/i.test(trackingUrl.trim())
  ) {
    setTrackingError("Please enter a valid tracking URL.");
    return;
  }

  try {
    setSavingTracking(true);
    setTrackingMessage("");
    setTrackingError("");

    const token = getToken();

    const response = await fetch(
      `${API_URL}/orders/admin/courier-tracking`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          courier_name: courierName.trim(),
          tracking_number: trackingNumber.trim(),
          tracking_url: trackingUrl.trim(),
        }),
      }
    );

    const data = await response.json();

    if (response.status === 401 || response.status === 403) {
      sessionStorage.removeItem("rivelune_admin_token");
      navigate("/admin/login");
      return;
    }

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Failed to save courier tracking.");
    }

    setOrders((prev) =>
      prev.map((order) =>
        order.id === selectedOrder.id
          ? {
              ...order,
              courier_name: courierName.trim(),
              tracking_number: trackingNumber.trim(),
              tracking_url: trackingUrl.trim(),
            }
          : order
      )
    );

    setSelectedOrder((prev) => ({
      ...prev,
      courier_name: courierName.trim(),
      tracking_number: trackingNumber.trim(),
      tracking_url: trackingUrl.trim(),
    }));

    setTrackingMessage(
      data.message || "Courier tracking details saved successfully!"
    );
  } catch (err) {
    setTrackingError(
      err.message || "Unable to save courier tracking details."
    );
  } finally {
    setSavingTracking(false);
  }
};
  // ==========================================
  // FILTER ORDERS
  // ==========================================
  const filteredOrders = orders.filter((order) => {
    const searchValue = search.toLowerCase();

    const matchesSearch =
      String(order.order_number || "").toLowerCase().includes(searchValue) ||
      String(order.customer_name || "").toLowerCase().includes(searchValue) ||
      String(order.phone || "").toLowerCase().includes(searchValue);

    const matchesStatus =
      statusFilter === "All" || order.order_status === statusFilter;

    const matchesPayment =
      paymentFilter === "All" || order.payment_method === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  // ==========================================
  // STATS
  // ==========================================
  const totalRevenue = orders.reduce(
    (total, order) => total + Number(order.total_amount || 0),
    0
  );

  const pendingOrders = orders.filter(
    (order) => order.order_status === "Pending Confirmation"
  ).length;

  const deliveredOrders = orders.filter(
    (order) => order.order_status === "Delivered"
  ).length;

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  // ==========================================
  // STATUS BADGE
  // ==========================================
  const StatusBadge = ({ status }) => (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[10px] font-semibold ${
        statusStyles[status] || "bg-gray-50 text-gray-600 border-gray-200"
      }`}
    >
      {status || "Unknown"}
    </span>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fc] text-slate-800">

      {/* SIDEBAR */}
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-[250px] border-r border-slate-200 bg-white lg:flex lg:flex-col">

        <div className="border-b border-slate-100 px-6 py-7">
          <h1 className="text-2xl font-serif tracking-[0.15em] text-[#a58b65]">
            RIVELUNE
          </h1>
          <p className="mt-1 text-[10px] tracking-[0.2em] text-slate-400">
            ADMIN WORKSPACE
          </p>
        </div>

        <div className="px-5 py-5">
          <p className="mb-3 text-[10px] font-semibold tracking-[0.15em] text-slate-400">
            MAIN MENU
          </p>

          {[
            { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
            { label: "Orders", icon: ShoppingBag, path: "/admin/orders" },
            { label: "Payments", icon: CreditCard, path: "/admin/payments" },
            { label: "Products", icon: Package, path: "/admin/products" },
            { label: "Inventory", icon: Boxes, path: "/admin/inventory" },
            { label: "Customers", icon: Users, path: "/admin/customers" },
            { label: "Coupons", icon: Ticket, path: "/admin/coupons" },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`mb-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                  item.label === "Orders"
                    ? "bg-[#f4eee6] font-semibold text-[#a58b65]"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <Icon size={18} />
                {item.label}
                {item.label === "Orders" && (
                  <ChevronRight size={15} className="ml-auto" />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-auto border-t border-slate-100 p-5">
          <button
            onClick={() => navigate("/admin/settings")}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-500 hover:bg-slate-50"
          >
            <Settings size={18} />
            Settings
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="lg:ml-[250px]">

        {/* TOPBAR */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/90 px-5 py-4 backdrop-blur sm:px-8">

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/admin")}
              className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
            >
              <ArrowLeft size={17} />
            </button>

            <div>
              <p className="text-sm font-semibold text-slate-800">
                Order Management
              </p>
              <p className="text-xs text-slate-400">
                RIVELUNE / Orders
              </p>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </header>

        <div className="p-5 sm:p-8">

          {/* PAGE TITLE */}
          <div className="mb-8">
            <p className="text-[10px] font-semibold tracking-[0.25em] text-[#a58b65]">
              STORE OPERATIONS
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-800">
              Orders
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage, monitor and track customer orders.
            </p>
          </div>

          {/* STATS */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            {[
              {
                label: "Total Orders",
                value: orders.length,
                icon: ShoppingBag,
                color: "bg-blue-50 text-blue-600",
              },
              {
                label: "Pending Orders",
                value: pendingOrders,
                icon: Clock,
                color: "bg-amber-50 text-amber-600",
              },
              {
                label: "Delivered Orders",
                value: deliveredOrders,
                icon: CheckCircle2,
                color: "bg-emerald-50 text-emerald-600",
              },
              {
                label: "Total Order Value",
                value: formatPrice(totalRevenue),
                icon: CreditCard,
                color: "bg-violet-50 text-violet-600",
              },
            ].map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-slate-500">
                      {stat.label}
                    </p>
                    <div className={`rounded-xl p-2.5 ${stat.color}`}>
                      <Icon size={18} />
                    </div>
                  </div>

                  <h3 className="mt-4 text-2xl font-bold text-slate-800">
                    {stat.value}
                  </h3>
                </div>
              );
            })}
          </div>

          {/* ORDERS TABLE */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            {/* TABLE HEADER */}
            <div className="border-b border-slate-100 p-5 sm:p-6">

              <div className="flex flex-wrap items-center justify-between gap-4">

                <div>
                  <h2 className="text-lg font-semibold text-slate-800">
                    All Orders
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    {filteredOrders.length} orders found
                  </p>
                </div>

                <div className="relative w-full sm:max-w-xs">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="Search order, customer, phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs outline-none transition focus:border-[#a58b65] focus:bg-white"
                  />
                </div>

              </div>

              {/* FILTERS */}
              <div className="mt-5 flex flex-wrap gap-3">

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-600 outline-none focus:border-[#a58b65]"
                >
                  <option value="All">All Order Status</option>
                  {orderStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>

                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-600 outline-none focus:border-[#a58b65]"
                >
                  <option value="All">All Payment Methods</option>
                  <option value="cod">Cash on Delivery</option>
                  <option value="easypaisa">Easypaisa</option>
                  <option value="jazzcash">JazzCash</option>
                </select>

              </div>
            </div>

            {/* ERROR */}
            {error && (
              <div className="m-5 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
                {error}
                <button
                  onClick={handleRefresh}
                  className="ml-3 font-semibold underline"
                >
                  Retry
                </button>
              </div>
            )}

            {/* LOADING */}
            {loading ? (
              <div className="flex min-h-[300px] items-center justify-center">
                <LoaderCircle className="animate-spin text-[#a58b65]" size={28} />
              </div>
            ) : (
              <div className="overflow-x-auto">

                <table className="w-full min-w-[950px] text-left">

                  <thead className="bg-slate-50">
                    <tr className="text-[10px] font-semibold tracking-wider text-slate-400">
                      <th className="px-6 py-4">ORDER</th>
                      <th className="px-6 py-4">CUSTOMER</th>
                      <th className="px-6 py-4">DATE</th>
                      <th className="px-6 py-4">PAYMENT</th>
                      <th className="px-6 py-4">TOTAL</th>
                      <th className="px-6 py-4">STATUS</th>
                      <th className="px-6 py-4 text-right">ACTION</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {filteredOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="transition hover:bg-slate-50/70"
                      >

                        <td className="px-6 py-5">
                          <p className="text-xs font-semibold text-slate-800">
                            {order.order_number}
                          </p>
                          <p className="mt-1 text-[10px] text-slate-400">
                            ID: #{order.id}
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <p className="text-xs font-semibold text-slate-700">
                            {order.customer_name}
                          </p>
                          <p className="mt-1 text-[11px] text-slate-400">
                            {order.phone}
                          </p>
                        </td>

                        <td className="px-6 py-5 text-xs text-slate-500">
                          {formatDate(order.created_at)}
                        </td>

                        <td className="px-6 py-5">
                          <p className="text-xs font-medium capitalize text-slate-700">
                            {order.payment_method === "cod"
                              ? "Cash on Delivery"
                              : order.payment_method}
                          </p>
                          <div className="mt-1">
                            <StatusBadge status={order.payment_status} />
                          </div>
                        </td>

                        <td className="px-6 py-5 text-xs font-semibold text-slate-800">
                          {formatPrice(order.total_amount)}
                        </td>

                        <td className="px-6 py-5">
                          <StatusBadge status={order.order_status} />
                        </td>

                        <td className="px-6 py-5 text-right">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-[#a58b65] hover:text-[#a58b65]"
                          >
                            <Eye size={14} />
                            View
                          </button>
                        </td>

                      </tr>
                    ))}

                    {filteredOrders.length === 0 && !error && (
                      <tr>
                        <td colSpan="7" className="px-6 py-20 text-center">
                          <ShoppingBag
                            size={35}
                            className="mx-auto text-slate-300"
                          />
                          <p className="mt-4 text-sm font-medium text-slate-600">
                            No orders found
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            Try changing your search or filters.
                          </p>
                        </td>
                      </tr>
                    )}

                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">

          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* MODAL HEADER */}
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white p-5 sm:p-6">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.2em] text-[#a58b65]">
                  ORDER DETAILS
                </p>
                <h2 className="mt-2 text-xl font-bold text-slate-800">
                  {selectedOrder.order_number}
                </h2>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
              >
                <X size={18} />
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="space-y-6 p-5 sm:p-6">

              {/* CUSTOMER INFO */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-slate-800">
                  Customer Information
                </h3>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {[
                    ["Name", selectedOrder.customer_name],
                    ["Phone", selectedOrder.phone],
                    ["Email", selectedOrder.email || "N/A"],
                    ["Address", selectedOrder.address],
                    ["City", selectedOrder.city],
                    ["Province", selectedOrder.province],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-xl bg-slate-50 p-4"
                    >
                      <p className="text-[10px] font-semibold tracking-wider text-slate-400">
                        {label.toUpperCase()}
                      </p>
                      <p className="mt-2 break-words text-sm text-slate-700">
                        {value || "N/A"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ITEMS */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-slate-800">
                  Ordered Items
                </h3>

                <div className="space-y-3">
                  {(selectedOrder.items || []).map((item, index) => (
                    <div
                      key={index}
                      className="flex gap-4 rounded-xl border border-slate-200 p-4"
                    >
                      <div className="h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        <img
                          src={item.product_image || "https://placehold.co/100"}
                          alt={item.product_name}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-800">
                          {item.product_name}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Size: {item.size} · Color: {item.color || "N/A"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Quantity: {item.quantity}
                        </p>
                        <p className="mt-2 text-sm font-semibold text-[#a58b65]">
                          {formatPrice(item.total_price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PAYMENT & TOTAL */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="mb-4 text-sm font-semibold text-slate-800">
                  Payment & Summary
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Payment Method</span>
                    <span className="font-medium text-slate-700 capitalize">
                      {selectedOrder.payment_method === "cod"
                        ? "Cash on Delivery"
                        : selectedOrder.payment_method}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Payment Status</span>
                    <StatusBadge status={selectedOrder.payment_status} />
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-medium text-slate-700">
                      {formatPrice(selectedOrder.subtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Discount</span>
                    <span className="font-medium text-emerald-600">
                      - {formatPrice(selectedOrder.discount_amount)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Shipping</span>
                    <span className="font-medium text-slate-700">
                      {formatPrice(selectedOrder.shipping_fee)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4 border-t border-slate-200 pt-3">
                    <span className="font-semibold text-slate-800">Total</span>
                    <span className="text-base font-bold text-[#a58b65]">
                      {formatPrice(selectedOrder.total_amount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* NOTES */}
              {selectedOrder.order_notes && (
                <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                  <p className="text-xs font-semibold text-amber-700">
                    Customer Notes
                  </p>
                  <p className="mt-2 text-sm text-amber-800">
                    {selectedOrder.order_notes}
                  </p>
                </div>
              )}

              {/* ORDER STATUS UPDATE */}
              <div className="rounded-2xl border border-[#e8dfd2] bg-[#fcfaf7] p-5">
                <h3 className="mb-1 text-sm font-semibold text-slate-800">
                  Update Order Status
                </h3>
                <p className="mb-4 text-xs text-slate-500">
                  Change the current order status from here.
                </p>

                <div className="mb-4">
                  <p className="mb-2 text-xs text-slate-500">
                    Current Status
                  </p>
                  <StatusBadge status={selectedOrder.order_status} />
                </div>

                <label className="mb-2 block text-xs font-medium text-slate-600">
                  New Status
                </label>

                <select
                  value={newStatus}
                  onChange={(e) => {
                    setNewStatus(e.target.value);
                    setStatusMessage("");
                    setStatusError("");
                  }}
                  disabled={updatingStatus}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#a58b65] disabled:opacity-60"
                >
                  {orderStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>

                {/* SUCCESS MESSAGE */}
                {statusMessage && (
                  <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-xs text-emerald-700">
                    {statusMessage}
                  </div>
                )}

                {/* ERROR MESSAGE */}
                {statusError && (
                  <div className="mt-3 rounded-xl border border-red-100 bg-red-50 p-3 text-xs text-red-600">
                    {statusError}
                  </div>
                )}

                <button
                  onClick={handleStatusUpdate}
                  disabled={
                    updatingStatus ||
                    !newStatus ||
                    newStatus === selectedOrder.order_status
                  }
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#a58b65] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#8f7550] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {updatingStatus ? (
                    <>
                      <LoaderCircle size={16} className="animate-spin" />
                      Updating Status...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Update Status
                    </>
                  )}
                </button>
              </div>
{/* COURIER TRACKING */}
<div className="rounded-2xl border border-slate-200 bg-white p-5">
  <div className="mb-4 flex items-center gap-3">
    <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
      <Truck size={20} />
    </div>
    <div>
      <h3 className="text-sm font-semibold text-slate-800">
        Courier Tracking Details
      </h3>
      <p className="mt-1 text-xs text-slate-500">
        Add shipment and tracking information for this order.
      </p>
    </div>
  </div>

  <div className="space-y-4">
    <div>
      <label className="mb-2 block text-xs font-medium text-slate-600">
        Courier Name *
      </label>
      <input
        type="text"
        placeholder="e.g. TCS, Leopards, Trax"
        value={courierName}
        onChange={(e) => {
          setCourierName(e.target.value);
          setTrackingError("");
          setTrackingMessage("");
        }}
        disabled={savingTracking}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#a58b65] focus:bg-white disabled:opacity-60"
      />
    </div>

    <div>
      <label className="mb-2 block text-xs font-medium text-slate-600">
        Tracking Number *
      </label>
      <input
        type="text"
        placeholder="Enter shipment tracking number"
        value={trackingNumber}
        onChange={(e) => {
          setTrackingNumber(e.target.value);
          setTrackingError("");
          setTrackingMessage("");
        }}
        disabled={savingTracking}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#a58b65] focus:bg-white disabled:opacity-60"
      />
    </div>

    <div>
      <label className="mb-2 block text-xs font-medium text-slate-600">
        Tracking URL
      </label>
      <input
        type="url"
        placeholder="https://courier.com/track"
        value={trackingUrl}
        onChange={(e) => {
          setTrackingUrl(e.target.value);
          setTrackingError("");
          setTrackingMessage("");
        }}
        disabled={savingTracking}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#a58b65] focus:bg-white disabled:opacity-60"
      />
      <p className="mt-1.5 text-[10px] text-slate-400">
        Optional · Customer can use this link to track their parcel.
      </p>
    </div>
  </div>

  {/* SUCCESS MESSAGE */}
  {trackingMessage && (
    <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-xs text-emerald-700">
      {trackingMessage}
    </div>
  )}

  {/* ERROR MESSAGE */}
  {trackingError && (
    <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-xs text-red-600">
      {trackingError}
    </div>
  )}

  <button
    onClick={handleCourierTrackingUpdate}
    disabled={
      savingTracking ||
      !courierName.trim() ||
      !trackingNumber.trim()
    }
    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#a58b65] disabled:cursor-not-allowed disabled:opacity-50"
  >
    {savingTracking ? (
      <>
        <LoaderCircle size={16} className="animate-spin" />
        Saving Tracking...
      </>
    ) : (
      <>
        <Truck size={16} />
        Save Courier Tracking
      </>
    )}
  </button>
</div>
              {/* ORDER STATUS */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-slate-800">
                  Current Order Status
                </h3>
                <StatusBadge status={selectedOrder.order_status} />
              </div>

            </div>

            {/* MODAL FOOTER */}
            <div className="border-t border-slate-100 bg-slate-50 p-5 text-right">
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg bg-slate-800 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#a58b65]"
              >
                Close Details
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default AdminOrders;
