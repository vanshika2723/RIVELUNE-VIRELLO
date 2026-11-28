
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  CreditCard,
  Package,
  Users,
  Ticket,
  Settings,
  Store,
  Search,
  RefreshCw,
  Plus,
  Pencil,
  Trash2,
  X,
  LoaderCircle,
  ChevronRight,
  Tag,
  Percent,
  IndianRupee,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  Menu,
  Copy,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const initialForm = {
  coupon_code: "",
  discount_type: "percentage",
  discount_value: "",
  min_order_amount: "0",
  max_discount: "",
  usage_limit: "",
  start_date: "",
  expiry_date: "",
  status: "active",
};

const money = (value) =>
  `Rs. ${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

const formatDate = (value) => {
  if (!value) return "No date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getCouponState = (coupon) => {
  if (coupon.status !== "active") return "Inactive";

  const now = new Date();
  const start = coupon.start_date ? new Date(coupon.start_date) : null;
  const expiry = coupon.expiry_date ? new Date(coupon.expiry_date) : null;

  if (start && start > now) return "Scheduled";
  if (expiry && expiry < now) return "Expired";

  if (
    coupon.usage_limit !== null &&
    coupon.usage_limit !== "" &&
    Number(coupon.used_count) >= Number(coupon.usage_limit)
  ) {
    return "Limit Reached";
  }

  return "Active";
};

export default function AdminCoupons() {
  const navigate = useNavigate();

  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const token = sessionStorage.getItem("rivelune_admin_token");

  const handleAuthError = (response) => {
    if (response.status === 401 || response.status === 403) {
      sessionStorage.removeItem("rivelune_admin_token");
      navigate("/admin/login");
      return true;
    }
    return false;
  };

  const fetchCoupons = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    setError("");

    try {
      const response = await fetch(`${API_URL}/admin/coupons`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (handleAuthError(response)) return;

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load coupons.");
      }

      setCoupons(Array.isArray(data.coupons) ? data.coupons : []);
    } catch (err) {
      setError(err.message || "Something went wrong while loading coupons.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const filteredCoupons = useMemo(() => {
    return coupons.filter((coupon) => {
      const matchesSearch = [
        coupon.coupon_code,
        coupon.discount_type,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());

      const state = getCouponState(coupon);

      let matchesFilter = true;
      if (filter === "Active") matchesFilter = state === "Active";
      if (filter === "Inactive") matchesFilter = state === "Inactive";
      if (filter === "Expired") matchesFilter = state === "Expired";
      if (filter === "Scheduled") matchesFilter = state === "Scheduled";

      return matchesSearch && matchesFilter;
    });
  }, [coupons, search, filter]);

  const stats = useMemo(() => {
    const active = coupons.filter((c) => getCouponState(c) === "Active").length;
    const inactive = coupons.filter((c) => c.status === "inactive").length;
    const totalUsage = coupons.reduce(
      (sum, c) => sum + Number(c.used_count || 0),
      0
    );

    return {
      total: coupons.length,
      active,
      inactive,
      totalUsage,
    };
  }, [coupons]);

  const openCreateModal = () => {
    setEditingCoupon(null);
    setForm(initialForm);
    setError("");
    setSuccess("");
    setModalOpen(true);
  };

  const openEditModal = (coupon) => {
    setEditingCoupon(coupon);
    setForm({
      coupon_code: coupon.coupon_code || "",
      discount_type: coupon.discount_type || "percentage",
      discount_value: coupon.discount_value ?? "",
      min_order_amount: coupon.min_order_amount ?? "0",
      max_discount: coupon.max_discount ?? "",
      usage_limit: coupon.usage_limit ?? "",
      start_date: coupon.start_date
        ? new Date(coupon.start_date).toISOString().slice(0, 16)
        : "",
      expiry_date: coupon.expiry_date
        ? new Date(coupon.expiry_date).toISOString().slice(0, 16)
        : "",
      status: coupon.status || "active",
    });
    setError("");
    setSuccess("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditingCoupon(null);
    setForm(initialForm);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const code = form.coupon_code.trim().toUpperCase();
    const value = Number(form.discount_value);

    if (!code) {
      setError("Please enter a coupon code.");
      return;
    }

    if (!value || value <= 0) {
      setError("Discount value must be greater than zero.");
      return;
    }

    if (form.discount_type === "percentage" && value > 100) {
      setError("Percentage discount cannot exceed 100%.");
      return;
    }

    if (Number(form.min_order_amount || 0) < 0) {
      setError("Minimum order amount cannot be negative.");
      return;
    }

    if (
      form.max_discount &&
      Number(form.max_discount) < 0
    ) {
      setError("Maximum discount cannot be negative.");
      return;
    }

    if (form.usage_limit && Number(form.usage_limit) < 1) {
      setError("Usage limit must be at least 1.");
      return;
    }

    if (
      form.start_date &&
      form.expiry_date &&
      new Date(form.expiry_date) < new Date(form.start_date)
    ) {
      setError("Expiry date must be after the start date.");
      return;
    }

    const payload = {
      ...form,
      coupon_code: code,
      discount_value: value,
      min_order_amount: Number(form.min_order_amount || 0),
      max_discount: form.max_discount ? Number(form.max_discount) : null,
      usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
      start_date: form.start_date || null,
      expiry_date: form.expiry_date || null,
    };

    setSaving(true);

    try {
      const url = editingCoupon
        ? `${API_URL}/admin/coupons/${editingCoupon.id}`
        : `${API_URL}/admin/coupons`;

      const response = await fetch(url, {
        method: editingCoupon ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (handleAuthError(response)) return;

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to save coupon.");
      }

      setModalOpen(false);
      setEditingCoupon(null);
      setForm(initialForm);
      setSuccess(
        editingCoupon
          ? "Coupon updated successfully."
          : "Coupon created successfully."
      );

      await fetchCoupons(true);
    } catch (err) {
      setError(err.message || "Unable to save coupon.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (coupon) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete coupon "${coupon.coupon_code}"?`
    );

    if (!confirmed) return;

    setDeletingId(coupon.id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/admin/coupons/${coupon.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (handleAuthError(response)) return;

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to delete coupon.");
      }

      setSuccess("Coupon deleted successfully.");
      await fetchCoupons(true);
    } catch (err) {
      setError(err.message || "Unable to delete coupon.");
    } finally {
      setDeletingId(null);
    }
  };

  const copyCoupon = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setSuccess(`${code} copied to clipboard.`);
      setError("");
    } catch {
      setError("Unable to copy coupon code.");
    }
  };

  const sidebarItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
    { label: "Orders", icon: ShoppingBag, path: "/admin/orders" },
    { label: "Payments", icon: CreditCard, path: "/admin/payments" },
    { label: "Products", icon: Package, path: "/admin/products" },
    { label: "Inventory", icon: Store, path: "/admin/inventory" },
    { label: "Customers", icon: Users, path: "/admin/customers" },
    { label: "Coupons", icon: Ticket, path: "/admin/coupons" },
    { label: "Settings", icon: Settings, path: "/admin/settings" },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fc] text-slate-800">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[250px] flex-col border-r border-slate-200 bg-white transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex h-[82px] items-center gap-3 border-b border-slate-100 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#a58b65] text-white">
            <Store size={19} />
          </div>
          <div>
            <h1 className="text-[17px] font-bold tracking-[0.16em] text-slate-800">
              RIVELUNE
            </h1>
            <p className="text-[10px] font-medium tracking-[0.18em] text-slate-400">
              ADMIN WORKSPACE
            </p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto rounded-lg p-1 text-slate-400 hover:bg-slate-100 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 pt-7 pb-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Workspace
          </p>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const active = item.label === "Coupons";

            return (
              <button
                key={item.label}
                onClick={() => {
                  setSidebarOpen(false);
                  navigate(item.path);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-[13px] font-medium transition ${
                  active
                    ? "bg-[#f4efe8] text-[#95764d]"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <Icon size={17} />
                <span>{item.label}</span>
                {active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#a58b65]" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="m-4 rounded-2xl bg-[#faf8f5] p-4">
          <p className="text-xs font-semibold text-slate-700">RIVELUNE Store</p>
          <p className="mt-1 text-[11px] leading-5 text-slate-400">
            Manage your store operations from one place.
          </p>
        </div>
      </aside>

      {/* Main */}
      <main className="lg:ml-[250px]">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-md sm:px-7">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg border border-slate-200 p-2 text-slate-600 lg:hidden"
            >
              <Menu size={18} />
            </button>
            <div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <span>Admin</span>
                <ChevronRight size={12} />
                <span className="text-[#a58b65]">Coupons</span>
              </div>
              <h2 className="mt-1 text-[17px] font-semibold text-slate-800">
                Coupon Management
              </h2>
            </div>
          </div>

          <button
            onClick={() => fetchCoupons(true)}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-60 sm:px-4"
          >
            <RefreshCw
              size={14}
              className={refreshing ? "animate-spin" : ""}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </header>

        <div className="mx-auto max-w-[1500px] p-4 sm:p-7">
          {/* Page heading */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">
                Store promotions
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-800">
                Coupons
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Create and manage discount codes for your customers.
              </p>
            </div>

            <button
              onClick={openCreateModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#a58b65] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#927951]"
            >
              <Plus size={17} />
              Create Coupon
            </button>
          </div>

          {/* Notifications */}
          {success && (
            <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <CheckCircle2 size={17} />
              {success}
              <button
                onClick={() => setSuccess("")}
                className="ml-auto rounded p-1 hover:bg-emerald-100"
              >
                <X size={15} />
              </button>
            </div>
          )}

          {error && !modalOpen && (
            <div className="mb-5 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <AlertCircle size={17} />
              {error}
              <button
                onClick={() => setError("")}
                className="ml-auto rounded p-1 hover:bg-rose-100"
              >
                <X size={15} />
              </button>
            </div>
          )}

          {/* Stats */}
          <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Coupons"
              value={stats.total}
              icon={Ticket}
              subtitle="All created coupon codes"
            />
            <StatCard
              title="Active Coupons"
              value={stats.active}
              icon={CheckCircle2}
              subtitle="Currently available"
            />
            <StatCard
              title="Inactive Coupons"
              value={stats.inactive}
              icon={AlertCircle}
              subtitle="Disabled coupons"
            />
            <StatCard
              title="Total Redemptions"
              value={stats.totalUsage.toLocaleString("en-IN")}
              icon={Tag}
              subtitle="Total coupon usage"
            />
          </div>

          {/* Coupon list */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h3 className="font-semibold text-slate-800">All Coupons</h3>
                <p className="mt-1 text-xs text-slate-400">
                  {filteredCoupons.length} coupon
                  {filteredCoupons.length !== 1 ? "s" : ""} found
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative min-w-0 sm:w-[240px]">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search coupon code..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-[#c2a77e] focus:bg-white"
                  />
                </div>

                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-[#c2a77e]"
                >
                  <option value="All">All Coupons</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Expired">Expired</option>
                  <option value="Scheduled">Scheduled</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 text-slate-400">
                <LoaderCircle size={26} className="animate-spin text-[#a58b65]" />
                <p className="text-sm">Loading coupons...</p>
              </div>
            ) : filteredCoupons.length === 0 ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center px-5 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#faf7f2] text-[#a58b65]">
                  <Ticket size={25} />
                </div>
                <h3 className="font-semibold text-slate-700">
                  {search || filter !== "All"
                    ? "No coupons found"
                    : "No coupons created yet"}
                </h3>
                <p className="mt-1 max-w-sm text-sm text-slate-400">
                  {search || filter !== "All"
                    ? "Try changing your search or filter."
                    : "Create your first coupon code to offer discounts to customers."}
                </p>
                {!search && filter === "All" && (
                  <button
                    onClick={openCreateModal}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#a58b65] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#927951]"
                  >
                    <Plus size={16} />
                    Create your first coupon
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden overflow-x-auto lg:block">
                  <table className="w-full min-w-[950px]">
                    <thead>
                      <tr className="bg-slate-50/80 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                        <th className="px-5 py-4">Coupon</th>
                        <th className="px-5 py-4">Discount</th>
                        <th className="px-5 py-4">Minimum Order</th>
                        <th className="px-5 py-4">Usage</th>
                        <th className="px-5 py-4">Validity</th>
                        <th className="px-5 py-4">Status</th>
                        <th className="px-5 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredCoupons.map((coupon) => (
                        <CouponRow
                          key={coupon.id}
                          coupon={coupon}
                          onEdit={openEditModal}
                          onDelete={handleDelete}
                          onCopy={copyCoupon}
                          deleting={deletingId === coupon.id}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="divide-y divide-slate-100 lg:hidden">
                  {filteredCoupons.map((coupon) => (
                    <CouponMobileCard
                      key={coupon.id}
                      coupon={coupon}
                      onEdit={openEditModal}
                      onDelete={handleDelete}
                      onCopy={copyCoupon}
                      deleting={deletingId === coupon.id}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-3 backdrop-blur-sm sm:p-5">
          <div className="flex max-h-[92vh] w-full max-w-[650px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  {editingCoupon ? "Edit Coupon" : "Create Coupon"}
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Configure your discount code and its limits.
                </p>
              </div>
              <button
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto">
              <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:p-6">
                {error && (
                  <div className="col-span-full flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2.5 text-sm text-rose-600">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}

                {/* Coupon Code */}
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Coupon Code *
                  </label>
                  <div className="relative">
                    <Tag
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      name="coupon_code"
                      value={form.coupon_code}
                      onChange={handleFormChange}
                      placeholder="e.g. WELCOME10"
                      maxLength={50}
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-3 text-sm font-semibold uppercase tracking-wider outline-none focus:border-[#c2a77e] focus:bg-white"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Customers will enter this code at checkout.
                  </p>
                </div>

                {/* Discount Type */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Discount Type *
                  </label>
                  <select
                    name="discount_type"
                    value={form.discount_type}
                    onChange={handleFormChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-[#c2a77e]"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (Rs.)</option>
                  </select>
                </div>

                {/* Discount Value */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Discount Value *
                  </label>
                  <div className="relative">
                    {form.discount_type === "percentage" ? (
                      <Percent
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                    ) : (
                      <IndianRupee
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                    )}
                    <input
                      name="discount_value"
                      type="number"
                      value={form.discount_value}
                      onChange={handleFormChange}
                      min="0.01"
                      max={form.discount_type === "percentage" ? "100" : undefined}
                      step="0.01"
                      placeholder={form.discount_type === "percentage" ? "10" : "500"}
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-3 text-sm outline-none focus:border-[#c2a77e]"
                    />
                  </div>
                </div>

                {/* Minimum Order */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Minimum Order Amount (Rs.)
                  </label>
                  <input
                    name="min_order_amount"
                    type="number"
                    value={form.min_order_amount}
                    onChange={handleFormChange}
                    min="0"
                    step="0.01"
                    placeholder="0"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-[#c2a77e]"
                  />
                </div>

                {/* Max Discount */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Maximum Discount (Rs.)
                  </label>
                  <input
                    name="max_discount"
                    type="number"
                    value={form.max_discount}
                    onChange={handleFormChange}
                    min="0"
                    step="0.01"
                    placeholder="No limit"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-[#c2a77e]"
                  />
                </div>

                {/* Usage limit */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Usage Limit
                  </label>
                  <input
                    name="usage_limit"
                    type="number"
                    value={form.usage_limit}
                    onChange={handleFormChange}
                    min="1"
                    step="1"
                    placeholder="Unlimited"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-[#c2a77e]"
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Start Date
                  </label>
                  <input
                    name="start_date"
                    type="datetime-local"
                    value={form.start_date}
                    onChange={handleFormChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-[#c2a77e]"
                  />
                </div>

                {/* Expiry Date */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Expiry Date
                  </label>
                  <input
                    name="expiry_date"
                    type="datetime-local"
                    value={form.expiry_date}
                    onChange={handleFormChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-[#c2a77e]"
                  />
                </div>

                {/* Status */}
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Status
                  </label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleFormChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-[#c2a77e]"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#a58b65] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#927951] disabled:opacity-60"
                >
                  {saving ? (
                    <LoaderCircle size={16} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={16} />
                  )}
                  {saving
                    ? "Saving..."
                    : editingCoupon
                    ? "Save Changes"
                    : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, subtitle }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400">{title}</p>
          <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-800">
            {value}
          </h3>
          <p className="mt-1 text-[11px] text-slate-400">{subtitle}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f6f1eb] text-[#a58b65]">
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ state }) {
  const styles = {
    Active: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    Inactive: "bg-slate-100 text-slate-500 ring-slate-200",
    Expired: "bg-rose-50 text-rose-600 ring-rose-100",
    Scheduled: "bg-blue-50 text-blue-600 ring-blue-100",
    "Limit Reached": "bg-amber-50 text-amber-700 ring-amber-100",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ring-inset ${
        styles[state] || styles.Inactive
      }`}
    >
      {state}
    </span>
  );
}

function CouponRow({ coupon, onEdit, onDelete, onCopy, deleting }) {
  const state = getCouponState(coupon);

  return (
    <tr className="transition hover:bg-slate-50/60">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f7f2ec] text-[#a58b65]">
            <Tag size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-wide text-slate-700">
                {coupon.coupon_code}
              </span>
              <button
                onClick={() => onCopy(coupon.coupon_code)}
                title="Copy coupon code"
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-[#a58b65]"
              >
                <Copy size={13} />
              </button>
            </div>
            <p className="mt-1 text-[10px] text-slate-400">
              Created {formatDate(coupon.created_at)}
            </p>
          </div>
        </div>
      </td>

      <td className="px-5 py-4">
        <span className="text-sm font-semibold text-slate-700">
          {coupon.discount_type === "percentage"
            ? `${coupon.discount_value}% OFF`
            : `${money(coupon.discount_value)} OFF`}
        </span>
        {coupon.max_discount && coupon.discount_type === "percentage" && (
          <p className="mt-1 text-[10px] text-slate-400">
            Max {money(coupon.max_discount)}
          </p>
        )}
      </td>

      <td className="px-5 py-4 text-sm text-slate-600">
        {money(coupon.min_order_amount)}
      </td>

      <td className="px-5 py-4">
        <div className="text-sm font-medium text-slate-700">
          {Number(coupon.used_count || 0).toLocaleString("en-IN")}
          <span className="text-slate-400">
            {" "}
            / {coupon.usage_limit || "∞"}
          </span>
        </div>
        <div className="mt-1 h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-[#b49a74]"
            style={{
              width: coupon.usage_limit
                ? `${Math.min(
                    100,
                    (Number(coupon.used_count || 0) /
                      Number(coupon.usage_limit)) *
                      100
                  )}%`
                : "0%",
            }}
          />
        </div>
      </td>

      <td className="px-5 py-4 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <CalendarDays size={13} />
          {coupon.expiry_date ? formatDate(coupon.expiry_date) : "No expiry"}
        </div>
      </td>

      <td className="px-5 py-4">
        <StatusBadge state={state} />
      </td>

      <td className="px-5 py-4">
        <div className="flex justify-end gap-1.5">
          <button
            onClick={() => onEdit(coupon)}
            title="Edit coupon"
            className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-[#d7c3a4] hover:bg-[#faf7f2] hover:text-[#a58b65]"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete(coupon)}
            disabled={deleting}
            title="Delete coupon"
            className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
          >
            {deleting ? (
              <LoaderCircle size={14} className="animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
          </button>
        </div>
      </td>
    </tr>
  );
}

function CouponMobileCard({ coupon, onEdit, onDelete, onCopy, deleting }) {
  const state = getCouponState(coupon);

  return (
    <div className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f7f2ec] text-[#a58b65]">
            <Tag size={17} />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="break-all text-sm font-bold tracking-wide text-slate-700">
                {coupon.coupon_code}
              </span>
              <button
                onClick={() => onCopy(coupon.coupon_code)}
                title="Copy coupon code"
                className="rounded p-1 text-slate-400 hover:bg-slate-100"
              >
                <Copy size={13} />
              </button>
            </div>
            <p className="mt-1 text-xs font-semibold text-slate-600">
              {coupon.discount_type === "percentage"
                ? `${coupon.discount_value}% discount`
                : `${money(coupon.discount_value)} discount`}
            </p>
          </div>
        </div>
        <StatusBadge state={state} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3">
        <div>
          <p className="text-[10px] text-slate-400">Minimum order</p>
          <p className="mt-1 text-xs font-semibold text-slate-700">
            {money(coupon.min_order_amount)}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400">Usage</p>
          <p className="mt-1 text-xs font-semibold text-slate-700">
            {coupon.used_count || 0} / {coupon.usage_limit || "Unlimited"}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400">Expires</p>
          <p className="mt-1 text-xs font-semibold text-slate-700">
            {coupon.expiry_date ? formatDate(coupon.expiry_date) : "No expiry"}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400">Created</p>
          <p className="mt-1 text-xs font-semibold text-slate-700">
            {formatDate(coupon.created_at)}
          </p>
        </div>
      </div>

      <div className="mt-3 flex justify-end gap-2">
        <button
          onClick={() => onEdit(coupon)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
        >
          <Pencil size={13} />
          Edit
        </button>
        <button
          onClick={() => onDelete(coupon)}
          disabled={deleting}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-50"
        >
          {deleting ? (
            <LoaderCircle size={13} className="animate-spin" />
          ) : (
            <Trash2 size={13} />
          )}
          Delete
        </button>
      </div>
    </div>
  );
}
