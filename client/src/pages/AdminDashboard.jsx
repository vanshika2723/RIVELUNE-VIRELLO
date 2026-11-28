
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
  Clock,
  AlertTriangle,
  ArrowUpRight,
    Truck,
  Store,
  Boxes,
  ChevronRight,
  CircleDollarSign,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  BarChart3,
  LoaderCircle,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const LOW_STOCK_THRESHOLD = 5;

const formatNumber = (value) =>
  Number(value || 0).toLocaleString("en-PK");

const formatCurrency = (value) =>
  `PKR ${Number(value || 0).toLocaleString("en-PK", {
    maximumFractionDigits: 0,
  })}`;

const formatGrowth = (value) => {
  const number = Number(value || 0);
  return `${number > 0 ? "+" : ""}${number.toFixed(1)}%`;
};

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [monthlyAnalytics, setMonthlyAnalytics] = useState(null);

  // Inventory state
  const [inventoryProducts, setInventoryProducts] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [inventoryError, setInventoryError] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
    { label: "Orders", icon: ShoppingBag, path: "/admin/orders" },
    { label: "Payments", icon: CreditCard, path: "/admin/payments" },
    { label: "Products", icon: Package, path: "/admin/products" },
    { label: "Inventory", icon: Boxes, path: "/admin/inventory" },
    { label: "Customers", icon: Users, path: "/admin/customers" },
    { label: "Coupons", icon: Ticket, path: "/admin/coupons" },
    { label: "Shipping", icon: Truck, path: "/admin/shipping" },{
  label: "Returns",
  icon: RefreshCw,
  path: "/admin/returns",
},
    
  ];

  const quickActions = [
    {
      title: "Manage Products",
      description: "Add, edit and organize your collection.",
      icon: Package,
      color: "bg-violet-50 text-violet-600",
      path: "/admin/products",
    },
    {
      title: "Manage Orders",
      description: "Review and process customer orders.",
      icon: ShoppingBag,
      color: "bg-blue-50 text-blue-600",
      path: "/admin/orders",
    },
    {
      title: "Verify Payments",
      description: "Review wallet payment submissions.",
      icon: CreditCard,
      color: "bg-emerald-50 text-emerald-600",
      path: "/admin/payments",
    },
    {
      title: "Check Inventory",
      description: "Monitor stock and product variants.",
      icon: Boxes,
      color: "bg-amber-50 text-amber-600",
      path: "/admin/inventory",
    },
  ];

  const fetchDashboardData = async () => {
    const token = sessionStorage.getItem("rivelune_admin_token");

    if (!token) {
      navigate("/admin/login", { replace: true });
      return;
    }

    setRefreshing(true);
    setError("");
    setInventoryError("");
    setInventoryLoading(true);

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [
        analyticsResponse,
        monthlyResponse,
        productsResponse,
      ] = await Promise.all([
        fetch(`${API_URL}/admin/payments/analytics`, { headers }),
        fetch(`${API_URL}/admin/payments/monthly-analytics`, { headers }),
        fetch(`${API_URL}/products`, { headers }),
      ]);

      if (
        analyticsResponse.status === 401 ||
        analyticsResponse.status === 403 ||
        monthlyResponse.status === 401 ||
        monthlyResponse.status === 403
      ) {
        sessionStorage.removeItem("rivelune_admin_token");
        navigate("/admin/login", { replace: true });
        return;
      }

      if (!analyticsResponse.ok) {
        throw new Error("Unable to load dashboard analytics.");
      }

      const analyticsResult = await analyticsResponse.json();

      const monthlyResult = monthlyResponse.ok
        ? await monthlyResponse.json()
        : null;

      setAnalytics(analyticsResult.analytics || null);
      setMonthlyAnalytics(monthlyResult?.analytics || null);

      // Inventory API connection
      if (productsResponse.ok) {
        const productsResult = await productsResponse.json();

        // Support common API response structures
        const products =
          Array.isArray(productsResult)
            ? productsResult
            : productsResult.products ||
              productsResult.data?.products ||
              productsResult.data ||
              [];

        setInventoryProducts(Array.isArray(products) ? products : []);
      } else {
        setInventoryProducts([]);
        setInventoryError("Unable to load inventory data.");
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError(err.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
      setInventoryLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const summary = analytics?.summary || {};
  const dailyTrend = analytics?.dailyTrend || [];
  const topProducts = analytics?.topProducts || [];
  const paymentMethods = analytics?.paymentMethods || [];
  const couponAnalytics = analytics?.couponAnalytics || [];

  // Coupon analytics calculations
  const totalCouponUses = couponAnalytics.reduce(
    (total, coupon) => total + Number(coupon.total_uses || 0),
    0
  );

  const totalCouponDiscount = couponAnalytics.reduce(
    (total, coupon) => total + Number(coupon.total_discount || 0),
    0
  );

  const totalCouponRevenue = couponAnalytics.reduce(
    (total, coupon) => total + Number(coupon.total_revenue || 0),
    0
  );

  // Inventory calculations
  const lowStockProducts = inventoryProducts.filter((product) => {
    const stock = Number(product.stock || 0);
    return stock > 0 && stock <= LOW_STOCK_THRESHOLD;
  });

  const outOfStockProducts = inventoryProducts.filter((product) => {
    return Number(product.stock || 0) <= 0;
  });

  const lowStockCount = lowStockProducts.length;
  const outOfStockCount = outOfStockProducts.length;

  const currentMonth = monthlyAnalytics?.currentMonth || {};
  const previousMonth = monthlyAnalytics?.previousMonth || {};
  const growth = monthlyAnalytics?.growth || {};

  const stats = [
    {
      title: "Total Orders",
      value: loading ? "..." : formatNumber(summary.total_orders),
      subtitle: "All time orders",
      icon: ShoppingBag,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Total Revenue",
      value: loading ? "..." : formatCurrency(summary.total_order_value),
      subtitle: "Total order value",
      icon: CircleDollarSign,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Pending Payments",
      value: loading ? "..." : formatNumber(summary.pending_payments),
      subtitle: "Awaiting verification",
      icon: Clock,
      color: "bg-amber-50 text-amber-600",
    },
    {
      title: "Low Stock Items",
      value: inventoryLoading
        ? "..."
        : inventoryError
          ? "N/A"
          : formatNumber(lowStockCount),
      subtitle: inventoryLoading
        ? "Checking inventory..."
        : inventoryError
          ? "Inventory unavailable"
          : `${outOfStockCount} out of stock · Alert at ${LOW_STOCK_THRESHOLD} or less`,
      icon: AlertTriangle,
      color: "bg-rose-50 text-rose-600",
    },
    {
      title: "Total Customers",
      value: loading ? "..." : formatNumber(summary.total_customers),
      subtitle: "Unique store customers",
      icon: Users,
      color: "bg-violet-50 text-violet-600",
    },
  ];

  const maxTrendValue = Math.max(
    ...dailyTrend.map((item) => Number(item.total_amount || 0)),
    1
  );

  const getGrowthIcon = (value) => {
    return Number(value || 0) >= 0 ? TrendingUp : TrendingDown;
  };

  const getGrowthColor = (value) => {
    return Number(value || 0) >= 0
      ? "text-emerald-600"
      : "text-rose-600";
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-800 md:flex">
      {/* Sidebar */}
      <aside className="flex w-full flex-col border-r border-slate-200 bg-white md:fixed md:inset-y-0 md:left-0 md:w-[255px]">
        {/* Brand */}
        <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
            <Store size={21} />
          </div>

          <div>
            <h1 className="text-lg font-bold tracking-[0.18em] text-slate-900">
              RIVELUNE
            </h1>
            <p className="mt-0.5 text-[10px] font-semibold tracking-[0.2em] text-slate-400">
              ADMIN WORKSPACE
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="px-4 pt-7">
          <p className="mb-3 px-3 text-[10px] font-bold tracking-[0.18em] text-slate-400">
            WORKSPACE
          </p>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = item.path === "/admin/dashboard";

              return (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all ${
                    active
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>

                  {active && (
                    <ChevronRight size={15} className="ml-auto opacity-70" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar */}
        <div className="mt-auto p-4">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold text-emerald-700">
                Store is online
              </span>
            </div>

            <p className="text-xs leading-5 text-slate-500">
              Your storefront is ready and running smoothly.
            </p>

            <button
              onClick={() => navigate("/")}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-white py-2 text-xs font-semibold text-slate-700 transition hover:bg-emerald-100"
            >
              <Store size={14} />
              View Store
              <ArrowUpRight size={14} />
            </button>
          </div>

          <p className="mt-4 text-center text-[10px] text-slate-400">
            RIVELUNE ADMIN · 2026
          </p>
        </div>
      </aside>

      {/* Main Area */}
      <main className="min-w-0 flex-1 md:ml-[255px]">
        {/* Topbar */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 sm:px-8">
          <div>
            <p className="text-xs text-slate-400">
              Workspace <span className="mx-1">/</span> Dashboard
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Dashboard Overview
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboardData}
              disabled={refreshing}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <div className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-medium text-emerald-700">
                Admin Workspace
              </span>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
              A
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="mx-auto max-w-[1500px] space-y-8 p-5 sm:p-8">
          {/* Error State */}
          {error && (
            <div className="flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-rose-700">{error}</p>
              <button
                onClick={fetchDashboardData}
                className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Welcome */}
          <section className="relative overflow-hidden rounded-2xl bg-slate-900 p-6 text-white sm:p-8">
            <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full bg-white/[0.04]" />
            <div className="absolute -bottom-32 right-36 h-64 w-64 rounded-full bg-white/[0.04]" />

            <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
              <div className="max-w-xl">
                <span className="text-[10px] font-bold tracking-[0.22em] text-slate-400">
                  STORE OVERVIEW
                </span>

                <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                  Welcome back, Admin
                  <span className="ml-2">👋</span>
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Manage your store, track orders and keep everything running
                  smoothly from one place.
                </p>
              </div>

              <button
                onClick={() => navigate("/admin/payments")}
                className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Review Payments
                <ArrowUpRight size={16} />
              </button>
            </div>
          </section>

          {/* Stats */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Store Performance
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  Your key store metrics at a glance
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={stat.title}
                    className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-medium text-slate-500">
                          {stat.title}
                        </p>
                        <h3 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
                          {stat.value}
                        </h3>
                      </div>

                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.color}`}
                      >
                        <Icon size={20} />
                      </div>
                    </div>

                    <p className="mt-3 text-xs text-slate-400">
                      {stat.subtitle}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Inventory Alerts */}
          <section>
            <div className="mb-4">
              <h3 className="text-base font-bold text-slate-900">
                Inventory Alerts
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Monitor products that need stock attention
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Low Stock */}
              <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-amber-700">
                      Low Stock Products
                    </p>
                    <h3 className="mt-3 text-3xl font-bold text-amber-900">
                      {inventoryLoading
                        ? "..."
                        : inventoryError
                          ? "N/A"
                          : formatNumber(lowStockCount)}
                    </h3>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                    <AlertTriangle size={20} />
                  </div>
                </div>

                <p className="mt-3 text-xs text-amber-700/80">
                  Products with stock from 1 to {LOW_STOCK_THRESHOLD}
                </p>

                <button
                  onClick={() => navigate("/admin/inventory")}
                  className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-amber-800 hover:text-amber-950"
                >
                  Manage Inventory
                  <ArrowUpRight size={14} />
                </button>
              </div>

              {/* Out of Stock */}
              <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-rose-700">
                      Out of Stock
                    </p>
                    <h3 className="mt-3 text-3xl font-bold text-rose-900">
                      {inventoryLoading
                        ? "..."
                        : inventoryError
                          ? "N/A"
                          : formatNumber(outOfStockCount)}
                    </h3>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
                    <Package size={20} />
                  </div>
                </div>

                <p className="mt-3 text-xs text-rose-700/80">
                  Products with zero or negative stock
                </p>

                <button
                  onClick={() => navigate("/admin/inventory")}
                  className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-rose-800 hover:text-rose-950"
                >
                  Restock Products
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </div>

            {/* Inventory API error */}
            {inventoryError && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs text-amber-700">
                  {inventoryError} Please check the products API.
                </p>
              </div>
            )}
          </section>

          {/* Monthly Insights */}
          <section>
            <div className="mb-4">
              <h3 className="text-base font-bold text-slate-900">
                Monthly Insights
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Compare this month with the previous month
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[
                {
                  label: "Monthly Orders",
                  current: currentMonth.orders,
                  previous: previousMonth.orders,
                  growth: growth.orders,
                  icon: ShoppingBag,
                },
                {
                  label: "Monthly Order Value",
                  current: currentMonth.orderValue,
                  previous: previousMonth.orderValue,
                  growth: growth.orderValue,
                  icon: CircleDollarSign,
                  money: true,
                },
                {
                  label: "Wallet Revenue",
                  current: currentMonth.verifiedWalletRevenue,
                  previous: previousMonth.verifiedWalletRevenue,
                  growth: growth.verifiedWalletRevenue,
                  icon: CreditCard,
                  money: true,
                },
              ].map((item) => {
                const Icon = item.icon;
                const GrowthIcon = getGrowthIcon(item.growth);

                return (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-slate-500">
                        {item.label}
                      </p>
                      <Icon size={18} className="text-slate-400" />
                    </div>

                    <h4 className="mt-3 text-xl font-bold text-slate-900">
                      {loading
                        ? "..."
                        : item.money
                          ? formatCurrency(item.current)
                          : formatNumber(item.current)}
                    </h4>

                    <div
                      className={`mt-2 flex items-center gap-1.5 text-xs font-semibold ${getGrowthColor(item.growth)}`}
                    >
                      <GrowthIcon size={14} />
                      {loading ? "..." : formatGrowth(item.growth)}
                      <span className="font-normal text-slate-400">
                        vs previous month
                      </span>
                    </div>

                    <p className="mt-3 text-xs text-slate-400">
                      Previous:{" "}
                      {item.money
                        ? formatCurrency(item.previous)
                        : formatNumber(item.previous)}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 7-Day Sales Trend */}
          <section>
            <div className="mb-4">
              <h3 className="text-base font-bold text-slate-900">
                7-Day Sales Trend
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Daily order revenue over the last 7 days
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              {loading ? (
                <div className="flex h-48 items-center justify-center text-sm text-slate-400">
                  <LoaderCircle className="mr-2 animate-spin" size={18} />
                  Loading sales trend...
                </div>
              ) : dailyTrend.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center text-slate-400">
                  <BarChart3 size={28} />
                  <p className="mt-3 text-sm">No sales trend data available.</p>
                </div>
              ) : (
                <div className="flex h-64 items-end gap-2 sm:gap-4">
                  {dailyTrend.map((day, index) => {
                    const amount = Number(day.total_amount || 0);
                    const height = Math.max(
                      (amount / maxTrendValue) * 100,
                      amount > 0 ? 5 : 0
                    );

                    return (
                      <div
                        key={day.date || index}
                        className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
                      >
                        <span className="text-[10px] font-medium text-slate-500 sm:text-xs">
                          {amount > 0
                            ? amount.toLocaleString("en-PK", {
                                notation: "compact",
                                maximumFractionDigits: 1,
                              })
                            : "0"}
                        </span>

                        <div className="flex h-full w-full items-end justify-center">
                          <div
                            title={formatCurrency(amount)}
                            style={{ height: `${height}%` }}
                            className="w-full max-w-12 rounded-t-lg bg-slate-900 transition-all duration-500 hover:bg-slate-700"
                          />
                        </div>

                        <span className="truncate text-[10px] text-slate-400 sm:text-xs">
                          {new Date(day.date).toLocaleDateString("en", {
                            weekday: "short",
                          })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* Top Selling Products */}
          <section>
            <div className="mb-4">
              <h3 className="text-base font-bold text-slate-900">
                Top Selling Products
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Products performing best in your store
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {loading ? (
                <div className="p-8 text-center text-sm text-slate-400">
                  Loading products...
                </div>
              ) : topProducts.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-400">
                  No product sales data available yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px] text-left">
                    <thead className="border-b border-slate-100 bg-slate-50">
                      <tr>
                        <th className="px-5 py-4 text-xs font-semibold text-slate-500">
                          Product
                        </th>
                        <th className="px-5 py-4 text-xs font-semibold text-slate-500">
                          Units Sold
                        </th>
                        <th className="px-5 py-4 text-xs font-semibold text-slate-500">
                          Revenue
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProducts.map((product, index) => (
                        <tr
                          key={product.product_id || index}
                          className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
                                {index + 1}
                              </div>
                              <span className="text-sm font-semibold text-slate-800">
                                {product.product_name || "Unnamed Product"}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-600">
                            {formatNumber(product.total_sold)}
                          </td>
                          <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                            {formatCurrency(product.total_revenue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

          {/* Payment Methods */}
          <section>
            <div className="mb-4">
              <h3 className="text-base font-bold text-slate-900">
                Payment Methods
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Breakdown of orders by payment type
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {loading ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-400">
                  Loading payment methods...
                </div>
              ) : paymentMethods.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-400">
                  No payment method data available.
                </div>
              ) : (
                paymentMethods.map((method, index) => (
                  <div
                    key={method.payment_method || index}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                        <CreditCard size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold capitalize text-slate-800">
                          {(method.payment_method || "Unknown").replace(/_/g, " ")}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {formatNumber(method.total_orders)} orders
                        </p>
                      </div>
                    </div>
                    <p className="mt-4 text-lg font-bold text-slate-900">
                      {formatCurrency(method.total_amount)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Coupon Analytics */}
          <section>
            <div className="mb-4">
              <h3 className="text-base font-bold text-slate-900">
                Coupon Analytics
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Track discount campaigns and coupon performance
              </p>
            </div>

            {/* Coupon Summary Cards */}
            <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[
                {
                  title: "Coupons Used",
                  value: loading ? "..." : formatNumber(totalCouponUses),
                  subtitle: "Total coupon redemptions",
                  icon: Ticket,
                  color: "bg-violet-50 text-violet-600",
                },
                {
                  title: "Total Discounts",
                  value: loading ? "..." : formatCurrency(totalCouponDiscount),
                  subtitle: "Discount given to customers",
                  icon: CircleDollarSign,
                  color: "bg-amber-50 text-amber-600",
                },
                {
                  title: "Coupon Revenue",
                  value: loading ? "..." : formatCurrency(totalCouponRevenue),
                  subtitle: "Revenue from coupon orders",
                  icon: TrendingUp,
                  color: "bg-emerald-50 text-emerald-600",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-medium text-slate-500">
                          {item.title}
                        </p>
                        <h4 className="mt-3 text-xl font-bold text-slate-900">
                          {item.value}
                        </h4>
                      </div>

                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.color}`}
                      >
                        <Icon size={20} />
                      </div>
                    </div>

                    <p className="mt-3 text-xs text-slate-400">
                      {item.subtitle}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Coupon Table */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {loading ? (
                <div className="p-8 text-center text-sm text-slate-400">
                  Loading coupon analytics...
                </div>
              ) : couponAnalytics.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-400">
                  No coupon usage recorded yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[650px] text-left">
                    <thead className="border-b border-slate-100 bg-slate-50">
                      <tr>
                        <th className="px-5 py-4 text-xs font-semibold text-slate-500">
                          Coupon Code
                        </th>
                        <th className="px-5 py-4 text-xs font-semibold text-slate-500">
                          Uses
                        </th>
                        <th className="px-5 py-4 text-xs font-semibold text-slate-500">
                          Discount
                        </th>
                        <th className="px-5 py-4 text-xs font-semibold text-slate-500">
                          Revenue
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {couponAnalytics.map((coupon, index) => (
                        <tr
                          key={coupon.coupon_code || index}
                          className="border-b border-slate-100 last:border-0 transition hover:bg-slate-50"
                        >
                          <td className="px-5 py-4">
                            <span className="inline-flex rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-bold tracking-wide text-violet-700">
                              {coupon.coupon_code || "N/A"}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-sm font-medium text-slate-700">
                            {formatNumber(coupon.total_uses)}
                          </td>

                          <td className="px-5 py-4 text-sm text-amber-600">
                            {formatCurrency(coupon.total_discount)}
                          </td>

                          <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                            {formatCurrency(coupon.total_revenue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

          {/* Quick Actions */}
          <section>
            <div className="mb-4">
              <h3 className="text-base font-bold text-slate-900">
                Quick Actions
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Jump into your frequently used store tools
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {quickActions.map((action) => {
                const Icon = action.icon;

                return (
                  <button
                    key={action.title}
                    onClick={() => navigate(action.path)}
                    className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-slate-300 hover:shadow-md"
                  >
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${action.color}`}
                    >
                      <Icon size={20} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-semibold text-slate-800">
                        {action.title}
                      </h4>
                      <p className="mt-1 text-xs leading-5 text-slate-400">
                        {action.description}
                      </p>
                    </div>

                    <ArrowUpRight
                      size={16}
                      className="mt-1 text-slate-300 transition group-hover:text-slate-700"
                    />
                  </button>
                );
              })}
            </div>
          </section>

          {/* Management Grid */}
          <section>
            <div className="mb-4">
              <h3 className="text-base font-bold text-slate-900">
                Store Management
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Everything you need to run your store
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {[
                {
                  icon: ShoppingBag,
                  title: "Orders & Fulfillment",
                  description:
                    "Manage customer orders, delivery progress and order status.",
                  path: "/admin/orders",
                  color: "text-blue-600",
                },
                {
                  icon: CreditCard,
                  title: "Payment Verification",
                  description:
                    "Review payment proofs and approve or reject transactions.",
                  path: "/admin/payments",
                  color: "text-emerald-600",
                },
                {
                  icon: Package,
                  title: "Product Catalog",
                  description:
                    "Manage products, prices, sizes, colors and product images.",
                  path: "/admin/products",
                  color: "text-violet-600",
                },
                {
                  icon: AlertTriangle,
                  title: "Inventory Control",
                  description:
                    "Track stock, manage variants and monitor low-stock alerts.",
                  path: "/admin/inventory",
                  color: "text-amber-600",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"
                  >
                    <Icon size={21} className={item.color} />

                    <h4 className="mt-4 text-sm font-bold text-slate-900">
                      {item.title}
                    </h4>

                    <p className="mt-2 text-xs leading-6 text-slate-500">
                      {item.description}
                    </p>

                    <button
                      onClick={() => navigate(item.path)}
                      className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-700 transition hover:text-black"
                    >
                      Open Section
                      <ArrowUpRight size={15} />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Footer */}
          <footer className="flex flex-col gap-2 border-t border-slate-200 pt-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 RIVELUNE Admin Workspace</p>
            <p>Made for effortless store management.</p>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
