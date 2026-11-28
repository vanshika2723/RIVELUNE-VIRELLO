
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
  UserRound,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  ShoppingCart,
  Wallet,
  LoaderCircle,
  Repeat,
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
};

function AdminCustomers() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [customerFilter, setCustomerFilter] = useState("All");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState("");
  const [detailsError, setDetailsError] = useState("");

  const getToken = () =>
    sessionStorage.getItem("rivelune_admin_token");

  // ==========================================
  // FETCH CUSTOMERS
  // ==========================================
  const fetchCustomers = async () => {
    try {
      setError("");

      const token = getToken();

      const response = await fetch(`${API_URL}/admin/customers`, {
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
        throw new Error(data.message || "Failed to load customers.");
      }

      const fetchedCustomers = data.customers || [];
      setCustomers(fetchedCustomers);

      return fetchedCustomers;
    } catch (err) {
      setError(err.message || "Unable to fetch customers.");
      return [];
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // ==========================================
  // FETCH CUSTOMER DETAILS
  // ==========================================
  const handleViewCustomer = async (customer) => {
    try {
      setSelectedCustomer(null);
      setDetailsError("");
      setDetailsLoading(true);

      const token = getToken();

      const response = await fetch(
        `${API_URL}/admin/customers/${customer.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("rivelune_admin_token");
        navigate("/admin/login");
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load customer details."
        );
      }

      setSelectedCustomer(data.customer);
    } catch (err) {
      setDetailsError(
        err.message || "Unable to load customer details."
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  // ==========================================
  // FILTER CUSTOMERS
  // ==========================================
  const filteredCustomers = customers.filter((customer) => {
    const searchValue = search.toLowerCase().trim();

    const matchesSearch =
      String(customer.customer_name || "")
        .toLowerCase()
        .includes(searchValue) ||
      String(customer.email || "")
        .toLowerCase()
        .includes(searchValue) ||
      String(customer.phone || "")
        .toLowerCase()
        .includes(searchValue) ||
      String(customer.city || "")
        .toLowerCase()
        .includes(searchValue);

    const orderCount = Number(customer.total_orders || 0);

    const matchesFilter =
      customerFilter === "All" ||
      (customerFilter === "Repeat" && orderCount > 1) ||
      (customerFilter === "Single" && orderCount === 1);

    return matchesSearch && matchesFilter;
  });

  // ==========================================
  // CUSTOMER STATISTICS
  // ==========================================
  const totalCustomers = customers.length;

  const totalOrders = customers.reduce(
    (total, customer) =>
      total + Number(customer.total_orders || 0),
    0
  );

  const totalSpent = customers.reduce(
    (total, customer) =>
      total + Number(customer.total_spent || 0),
    0
  );

  const repeatCustomers = customers.filter(
    (customer) => Number(customer.total_orders || 0) > 1
  ).length;

  const averageSpent =
    totalCustomers > 0 ? totalSpent / totalCustomers : 0;

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCustomers();
  };

  // ==========================================
  // STATUS BADGE
  // ==========================================
  const StatusBadge = ({ status }) => (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[10px] font-semibold ${
        statusStyles[status] ||
        "bg-gray-50 text-gray-600 border-gray-200"
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
                  item.label === "Customers"
                    ? "bg-[#f4eee6] font-semibold text-[#a58b65]"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <Icon size={18} />
                {item.label}

                {item.label === "Customers" && (
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
                Customer Management
              </p>
              <p className="text-xs text-slate-400">
                RIVELUNE / Customers
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
              STORE RELATIONSHIPS
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-800">
              Customers
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              View customer profiles, purchasing activity and order history.
            </p>
          </div>

          {/* STATS */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            {[
              {
                label: "Total Customers",
                value: totalCustomers,
                icon: Users,
                color: "bg-blue-50 text-blue-600",
              },
              {
                label: "Total Orders",
                value: totalOrders,
                icon: ShoppingCart,
                color: "bg-violet-50 text-violet-600",
              },
              {
                label: "Repeat Customers",
                value: repeatCustomers,
                icon: Repeat,
                color: "bg-emerald-50 text-emerald-600",
              },
              {
                label: "Total Customer Spend",
                value: formatPrice(totalSpent),
                icon: Wallet,
                color: "bg-amber-50 text-amber-600",
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

          {/* CUSTOMER TABLE */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            {/* TABLE HEADER */}
            <div className="border-b border-slate-100 p-5 sm:p-6">

              <div className="flex flex-wrap items-center justify-between gap-4">

                <div>
                  <h2 className="text-lg font-semibold text-slate-800">
                    All Customers
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    {filteredCustomers.length} customers found
                  </p>
                </div>

                <div className="relative w-full sm:max-w-xs">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    placeholder="Search name, email, phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs outline-none transition focus:border-[#a58b65] focus:bg-white"
                  />
                </div>

              </div>

              {/* FILTERS */}
              <div className="mt-5 flex flex-wrap gap-3">

                <select
                  value={customerFilter}
                  onChange={(e) => setCustomerFilter(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-600 outline-none focus:border-[#a58b65]"
                >
                  <option value="All">All Customers</option>
                  <option value="Repeat">Repeat Customers</option>
                  <option value="Single">Single Order Customers</option>
                </select>

                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-500">
                  <Wallet size={14} />
                  Average Spend: {formatPrice(averageSpent)}
                </div>

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
                <LoaderCircle
                  className="animate-spin text-[#a58b65]"
                  size={28}
                />
              </div>
            ) : (
              <div className="overflow-x-auto">

                <table className="w-full min-w-[900px] text-left">

                  <thead className="bg-slate-50">
                    <tr className="text-[10px] font-semibold tracking-wider text-slate-400">
                      <th className="px-6 py-4">CUSTOMER</th>
                      <th className="px-6 py-4">CONTACT</th>
                      <th className="px-6 py-4">LOCATION</th>
                      <th className="px-6 py-4">ORDERS</th>
                      <th className="px-6 py-4">TOTAL SPENT</th>
                      <th className="px-6 py-4">LAST ORDER</th>
                      <th className="px-6 py-4 text-right">ACTION</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {filteredCustomers.map((customer) => (
                      <tr
                        key={customer.id}
                        className="transition hover:bg-slate-50/70"
                      >

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f4eee6] text-[#a58b65]">
                              <UserRound size={19} />
                            </div>

                            <div>
                              <p className="text-xs font-semibold text-slate-800">
                                {customer.customer_name || "Unknown"}
                              </p>

                              <p className="mt-1 text-[10px] text-slate-400">
                                Customer ID: #{customer.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <p className="text-xs text-slate-700">
                            {customer.email || "No email"}
                          </p>

                          <p className="mt-1 text-[11px] text-slate-400">
                            {customer.phone || "No phone"}
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <p className="text-xs text-slate-700">
                            {customer.city || "N/A"}
                          </p>

                          <p className="mt-1 text-[11px] text-slate-400">
                            {customer.province || ""}
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <span className="inline-flex rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                            {customer.total_orders || 0}
                          </span>

                          {Number(customer.total_orders || 0) > 1 && (
                            <p className="mt-1 text-[10px] text-emerald-600">
                              Repeat customer
                            </p>
                          )}
                        </td>

                        <td className="px-6 py-5 text-xs font-semibold text-slate-800">
                          {formatPrice(customer.total_spent)}
                        </td>

                        <td className="px-6 py-5 text-xs text-slate-500">
                          {formatDate(customer.last_order_date)}
                        </td>

                        <td className="px-6 py-5 text-right">
                          <button
                            onClick={() => handleViewCustomer(customer)}
                            disabled={detailsLoading}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-[#a58b65] hover:text-[#a58b65] disabled:opacity-50"
                          >
                            <Eye size={14} />
                            View
                          </button>
                        </td>

                      </tr>
                    ))}

                    {filteredCustomers.length === 0 && !error && (
                      <tr>
                        <td colSpan="7" className="px-6 py-20 text-center">
                          <Users
                            size={35}
                            className="mx-auto text-slate-300"
                          />

                          <p className="mt-4 text-sm font-medium text-slate-600">
                            No customers found
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Customers will appear here when orders are placed.
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

      {/* CUSTOMER DETAILS MODAL */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">

          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* MODAL HEADER */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white p-5 sm:p-6">

              <div>
                <p className="text-[10px] font-semibold tracking-[0.2em] text-[#a58b65]">
                  CUSTOMER PROFILE
                </p>

                <h2 className="mt-2 text-xl font-bold text-slate-800">
                  {selectedCustomer.customer_name}
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Customer ID: #{selectedCustomer.id}
                </p>
              </div>

              <button
                onClick={() => setSelectedCustomer(null)}
                className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
              >
                <X size={18} />
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="space-y-6 p-5 sm:p-6">

              {/* CUSTOMER INFORMATION */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-slate-800">
                  Customer Information
                </h3>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                  {[
                    {
                      label: "Full Name",
                      value: selectedCustomer.customer_name,
                      icon: UserRound,
                    },
                    {
                      label: "Email Address",
                      value: selectedCustomer.email || "N/A",
                      icon: Mail,
                    },
                    {
                      label: "Phone Number",
                      value: selectedCustomer.phone,
                      icon: Phone,
                    },
                    {
                      label: "City",
                      value: selectedCustomer.city,
                      icon: MapPin,
                    },
                    {
                      label: "Province",
                      value: selectedCustomer.province,
                      icon: MapPin,
                    },
                    {
                      label: "Postal Code",
                      value: selectedCustomer.postal_code,
                      icon: MapPin,
                    },
                  ].map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.label}
                        className="flex items-start gap-3 rounded-xl bg-slate-50 p-4"
                      >
                        <div className="rounded-lg bg-white p-2 text-[#a58b65]">
                          <Icon size={16} />
                        </div>

                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold tracking-wider text-slate-400">
                            {item.label.toUpperCase()}
                          </p>

                          <p className="mt-1 break-words text-sm text-slate-700">
                            {item.value || "N/A"}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                </div>

                <div className="mt-3 rounded-xl bg-slate-50 p-4">
                  <p className="text-[10px] font-semibold tracking-wider text-slate-400">
                    DELIVERY ADDRESS
                  </p>

                  <p className="mt-2 text-sm text-slate-700">
                    {selectedCustomer.address || "N/A"}
                  </p>
                </div>
              </div>

              {/* CUSTOMER SUMMARY */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-slate-800">
                  Purchase Summary
                </h3>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

                  <div className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-500">
                        Total Orders
                      </p>
                      <ShoppingBag size={17} className="text-blue-500" />
                    </div>

                    <h3 className="mt-3 text-2xl font-bold text-slate-800">
                      {selectedCustomer.total_orders || 0}
                    </h3>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-500">
                        Total Spent
                      </p>
                      <Wallet size={17} className="text-emerald-500" />
                    </div>

                    <h3 className="mt-3 text-xl font-bold text-slate-800">
                      {formatPrice(selectedCustomer.total_spent)}
                    </h3>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-500">
                        Last Order
                      </p>
                      <CalendarDays size={17} className="text-violet-500" />
                    </div>

                    <h3 className="mt-3 text-sm font-bold text-slate-800">
                      {formatDate(selectedCustomer.last_order_date)}
                    </h3>
                  </div>

                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-[10px] font-semibold tracking-wider text-slate-400">
                      FIRST ORDER
                    </p>
                    <p className="mt-2 text-sm font-medium text-slate-700">
                      {formatDate(selectedCustomer.first_order_date)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-[10px] font-semibold tracking-wider text-slate-400">
                      CUSTOMER TYPE
                    </p>
                    <p className="mt-2 text-sm font-medium text-slate-700">
                      {Number(selectedCustomer.total_orders || 0) > 1
                        ? "Repeat Customer"
                        : "Single Order Customer"}
                    </p>
                  </div>
                </div>
              </div>

              {/* ORDER HISTORY */}
              <div>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">
                      Order History
                    </h3>

                    <p className="mt-1 text-xs text-slate-400">
                      {selectedCustomer.orders?.length || 0} orders found
                    </p>
                  </div>
                </div>

                <div className="space-y-4">

                  {(selectedCustomer.orders || []).map((order) => (
                    <div
                      key={order.id}
                      className="overflow-hidden rounded-xl border border-slate-200"
                    >

                      {/* ORDER HEADER */}
                      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-4">

                        <div>
                          <p className="text-xs font-semibold text-slate-800">
                            {order.order_number}
                          </p>

                          <p className="mt-1 text-[10px] text-slate-400">
                            {formatDate(order.created_at)}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <StatusBadge status={order.order_status} />
                          <span className="text-sm font-bold text-[#a58b65]">
                            {formatPrice(order.total_amount)}
                          </span>
                        </div>

                      </div>

                      {/* ORDER ITEMS */}
                      <div className="space-y-3 p-4">

                        {(order.items || []).map((item) => (
                          <div
                            key={item.id}
                            className="flex gap-3"
                          >
                            <div className="h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100">
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
                              <p className="text-xs font-semibold text-slate-800">
                                {item.product_name}
                              </p>

                              <p className="mt-1 text-[11px] text-slate-500">
                                Size: {item.size} · Color: {item.color || "N/A"}
                              </p>

                              <p className="mt-1 text-[11px] text-slate-500">
                                Quantity: {item.quantity}
                              </p>
                            </div>

                            <p className="shrink-0 text-xs font-semibold text-slate-700">
                              {formatPrice(item.total_price)}
                            </p>
                          </div>
                        ))}

                      </div>

                      {/* ORDER FOOTER */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-4 py-3">

                        <div>
                          <p className="text-[10px] text-slate-400">
                            PAYMENT METHOD
                          </p>

                          <p className="mt-1 text-xs font-medium capitalize text-slate-700">
                            {order.payment_method === "cod"
                              ? "Cash on Delivery"
                              : order.payment_method}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] text-slate-400">
                            PAYMENT STATUS
                          </p>

                          <p className="mt-1 text-xs font-medium text-slate-700">
                            {order.payment_status || "N/A"}
                          </p>
                        </div>

                      </div>

                    </div>
                  ))}

                  {(!selectedCustomer.orders ||
                    selectedCustomer.orders.length === 0) && (
                    <div className="rounded-xl bg-slate-50 py-12 text-center">
                      <ShoppingBag
                        size={30}
                        className="mx-auto text-slate-300"
                      />

                      <p className="mt-3 text-sm text-slate-500">
                        No order history available.
                      </p>
                    </div>
                  )}

                </div>
              </div>

            </div>

            {/* MODAL FOOTER */}
            <div className="border-t border-slate-100 bg-slate-50 p-5 text-right">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="rounded-lg bg-slate-800 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#a58b65]"
              >
                Close Details
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CUSTOMER DETAILS LOADING / ERROR */}
      {(detailsLoading || detailsError) && !selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl">

            {detailsLoading ? (
              <>
                <LoaderCircle
                  size={30}
                  className="mx-auto animate-spin text-[#a58b65]"
                />

                <p className="mt-4 text-sm font-semibold text-slate-700">
                  Loading customer details...
                </p>
              </>
            ) : (
              <>
                <X size={30} className="mx-auto text-red-500" />

                <p className="mt-4 text-sm font-semibold text-slate-700">
                  Unable to load customer
                </p>

                <p className="mt-2 text-xs text-red-500">
                  {detailsError}
                </p>

                <button
                  onClick={() => setDetailsError("")}
                  className="mt-5 rounded-lg bg-slate-800 px-5 py-2.5 text-xs font-semibold text-white"
                >
                  Close
                </button>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

export default AdminCustomers;
