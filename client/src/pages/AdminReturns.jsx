
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  CreditCard,
  Package,
  Users,
  Ticket,
  Truck,
  Boxes,
  RefreshCw,
  Search,
  LoaderCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  RotateCcw,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const AdminReturns = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [notes, setNotes] = useState({});
  const [updatingId, setUpdatingId] = useState(null);

  const token = sessionStorage.getItem("rivelune_admin_token");

  // ========================================
  // FETCH RETURN REQUESTS
  // ========================================
  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/orders/admin/return-requests`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load return requests."
        );
      }

      setRequests(data.requests || []);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // ========================================
  // UPDATE REQUEST STATUS
  // ========================================
  const updateRequest = async (id, status) => {
    try {
      setUpdatingId(id);

      const response = await fetch(
        `${API_URL}/orders/admin/return-requests/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            request_status: status,
            admin_notes: notes[id] || "",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to update request."
        );
      }

      await fetchRequests();
      alert(`Request ${status.toLowerCase()} successfully.`);
    } catch (err) {
      alert(err.message || "Update failed.");
    } finally {
      setUpdatingId(null);
    }
  };

  // ========================================
  // FILTER AND SEARCH
  // ========================================
  const filteredRequests = requests.filter((request) => {
    const matchesFilter =
      filter === "All" || request.request_status === filter;

    const searchText = search.toLowerCase();

    const matchesSearch =
      String(request.order_number || "")
        .toLowerCase()
        .includes(searchText) ||
      String(request.customer_name || "")
        .toLowerCase()
        .includes(searchText) ||
      String(request.phone || "")
        .toLowerCase()
        .includes(searchText);

    return matchesFilter && matchesSearch;
  });

  // ========================================
  // STATUS COUNTS
  // ========================================
  const countStatus = (status) =>
    requests.filter((request) => request.request_status === status).length;

  // ========================================
  // STATUS STYLES
  // ========================================
  const getStatusStyle = (status) => {
    switch (status) {
      case "Pending":
        return "bg-amber-50 text-amber-700 border-amber-200";

      case "Approved":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "Rejected":
        return "bg-red-50 text-red-700 border-red-200";

      case "Completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  // ========================================
  // SIDEBAR MENU
  // ========================================
  const menuItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/admin/dashboard",
    },
    {
      label: "Orders",
      icon: ShoppingBag,
      path: "/admin/orders",
    },
    {
      label: "Payments",
      icon: CreditCard,
      path: "/admin/payments",
    },
    {
      label: "Products",
      icon: Package,
      path: "/admin/products",
    },
    {
      label: "Inventory",
      icon: Boxes,
      path: "/admin/inventory",
    },
    {
      label: "Customers",
      icon: Users,
      path: "/admin/customers",
    },
    {
      label: "Coupons",
      icon: Ticket,
      path: "/admin/coupons",
    },
    {
      label: "Shipping",
      icon: Truck,
      path: "/admin/shipping",
    },
    {
      label: "Returns",
      icon: RefreshCw,
      path: "/admin/returns",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f6f7f9] flex text-gray-800">

      {/* ========================================
          SIDEBAR
      ======================================== */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col fixed inset-y-0 left-0 z-20">
        <div className="h-20 flex items-center px-7 border-b border-gray-100">
          <h1 className="text-2xl font-bold tracking-[0.2em] text-gray-900">
            RIVELUNE
          </h1>
        </div>

        <div className="px-5 py-6">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.18em] mb-4 px-3">
            Main Menu
          </p>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = item.path === "/admin/returns";

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition ${
                    active
                      ? "bg-gray-900 text-white shadow-sm"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-5 border-t border-gray-100">
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs text-gray-500">Admin Panel</p>
            <p className="text-sm font-semibold mt-1">
              Rivelune Store
            </p>
          </div>
        </div>
      </aside>

      {/* ========================================
          MAIN CONTENT
      ======================================== */}
      <main className="flex-1 ml-64 w-[calc(100%-16rem)] min-w-0 overflow-x-hidden">

        {/* TOPBAR */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-5 md:px-8 sticky top-0 z-10">
          <div>
            <p className="text-xs text-gray-400">
              Admin / Returns
            </p>

            <h2 className="font-semibold text-lg text-gray-900">
              Returns & Exchanges
            </h2>
          </div>

          <button
            type="button"
            onClick={fetchRequests}
            disabled={loading}
            className="flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={loading ? "animate-spin" : ""}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </header>

        <div className="p-5 md:p-8 max-w-[1600px] mx-auto">

          {/* PAGE INTRO */}
          <div className="mb-7">
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
              Returns Management
            </h1>

            <p className="text-sm text-gray-500 mt-2">
              Review, manage and track customer return & exchange requests.
            </p>
          </div>

          {/* ========================================
              STATISTICS
          ======================================== */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-7">
            {[
              {
                label: "Total Requests",
                value: requests.length,
                icon: RotateCcw,
                color: "bg-gray-100 text-gray-700",
              },
              {
                label: "Pending",
                value: countStatus("Pending"),
                icon: Clock,
                color: "bg-amber-50 text-amber-600",
              },
              {
                label: "Approved",
                value: countStatus("Approved"),
                icon: CheckCircle2,
                color: "bg-blue-50 text-blue-600",
              },
              {
                label: "Completed",
                value: countStatus("Completed"),
                icon: CheckCircle2,
                color: "bg-emerald-50 text-emerald-600",
              },
            ].map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.label}
                  className="bg-white border border-gray-200 rounded-2xl p-5"
                >
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-gray-500">
                      {stat.label}
                    </p>

                    <div className={`p-2 rounded-lg ${stat.color}`}>
                      <Icon size={18} />
                    </div>
                  </div>

                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
              );
            })}
          </div>

          {/* ========================================
              SEARCH AND FILTERS
          ======================================== */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-5 mb-5 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">

            <div className="relative w-full md:max-w-sm">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                placeholder="Search order, customer or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-gray-400"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              {[
                "All",
                "Pending",
                "Approved",
                "Rejected",
                "Completed",
              ].map((status) => (
                <button
                  type="button"
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border transition ${
                    filter === status
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* ========================================
              REQUEST LIST
          ======================================== */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">
                Return Requests
              </h3>

              <span className="text-xs text-gray-400">
                {filteredRequests.length} results
              </span>
            </div>

            {/* LOADING */}
            {loading ? (
              <div className="flex items-center justify-center py-20 text-gray-400">
                <LoaderCircle
                  className="animate-spin mr-2"
                  size={20}
                />
                Loading requests...
              </div>

            ) : error ? (

              /* ERROR */
              <div className="py-16 px-5 text-center">
                <XCircle
                  className="mx-auto text-red-400 mb-3"
                  size={32}
                />

                <p className="text-sm text-red-500">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={fetchRequests}
                  className="mt-4 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm"
                >
                  Retry
                </button>
              </div>

            ) : filteredRequests.length === 0 ? (

              /* EMPTY STATE */
              <div className="py-16 text-center">
                <Eye
                  className="mx-auto text-gray-300 mb-3"
                  size={32}
                />

                <p className="text-sm text-gray-500">
                  No return requests found.
                </p>
              </div>

            ) : (

              /* REQUEST CARDS */
              <div className="divide-y divide-gray-100">
                {filteredRequests.map((request) => (
                  <div
                    key={request.id}
                    className="p-5 md:p-6"
                  >
                    <div className="flex flex-col xl:flex-row xl:justify-between gap-5">

                      {/* REQUEST DETAILS */}
                      <div className="flex-1 min-w-0">

                        <div className="flex items-center flex-wrap gap-2 mb-3">
                          <span className="font-semibold text-gray-900">
                            #{request.order_number}
                          </span>

                          <span
                            className={`text-[11px] px-2.5 py-1 rounded-full border ${getStatusStyle(
                              request.request_status
                            )}`}
                          >
                            {request.request_status}
                          </span>

                          <span className="text-[11px] px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                            {request.request_type}
                          </span>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">

                          <p>
                            <span className="text-gray-400">
                              Customer:{" "}
                            </span>

                            <span className="font-medium text-gray-700">
                              {request.customer_name}
                            </span>
                          </p>

                          <p>
                            <span className="text-gray-400">
                              Phone:{" "}
                            </span>

                            <span className="text-gray-700">
                              {request.phone}
                            </span>
                          </p>

                          <p>
                            <span className="text-gray-400">
                              Reason:{" "}
                            </span>

                            <span className="text-gray-700">
                              {request.reason}
                            </span>
                          </p>

                          <p>
                            <span className="text-gray-400">
                              Submitted:{" "}
                            </span>

                            <span className="text-gray-700">
                              {request.created_at
                                ? new Date(
                                    request.created_at
                                  ).toLocaleString()
                                : "N/A"}
                            </span>
                          </p>
                        </div>

                        {/* ADMIN NOTES */}
                        <div className="mt-4 max-w-xl">
                          <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                            Admin Notes
                          </label>

                          <textarea
                            rows={2}
                            value={
                              notes[request.id] ??
                              request.admin_notes ??
                              ""
                            }
                            onChange={(e) =>
                              setNotes((prev) => ({
                                ...prev,
                                [request.id]: e.target.value,
                              }))
                            }
                            placeholder="Add internal notes for this request..."
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-gray-400 resize-y"
                          />
                        </div>
                      </div>

                      {/* ========================================
                          ACTION BUTTONS
                      ======================================== */}
                      <div className="flex flex-col gap-2 xl:w-40 shrink-0 self-start">

                        {/* PENDING: APPROVE + REJECT */}
                        {request.request_status === "Pending" && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                updateRequest(
                                  request.id,
                                  "Approved"
                                )
                              }
                              disabled={updatingId === request.id}
                              className="w-full flex justify-center items-center gap-2 px-3 py-3 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 disabled:opacity-50"
                            >
                              <CheckCircle2 size={15} />
                              Approve
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                updateRequest(
                                  request.id,
                                  "Rejected"
                                )
                              }
                              disabled={updatingId === request.id}
                              className="w-full flex justify-center items-center gap-2 px-3 py-3 rounded-lg bg-white border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50 disabled:opacity-50"
                            >
                              <XCircle size={15} />
                              Reject
                            </button>
                          </>
                        )}

                        {/* APPROVED: COMPLETE */}
                        {request.request_status === "Approved" && (
                          <button
                            type="button"
                            onClick={() =>
                              updateRequest(
                                request.id,
                                "Completed"
                              )
                            }
                            disabled={updatingId === request.id}
                            className="w-full flex justify-center items-center gap-2 px-3 py-3 rounded-lg bg-gray-900 text-white text-xs font-medium hover:bg-gray-800 disabled:opacity-50"
                          >
                            <CheckCircle2 size={15} />
                            Complete
                          </button>
                        )}

                        {/* UPDATING */}
                        {updatingId === request.id && (
                          <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                            <LoaderCircle
                              size={13}
                              className="animate-spin"
                            />
                            Updating...
                          </p>
                        )}

                        {/* CLOSED */}
                        {[
                          "Rejected",
                          "Completed",
                        ].includes(request.request_status) && (
                          <p className="text-xs text-gray-400 text-center py-2">
                            Request closed
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminReturns;
