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
  Store,
  Boxes,
  ChevronRight,
  ArrowUpRight,
  ArrowLeft,
  Search,
  RefreshCw,
  Download,
  AlertTriangle,
  CheckCircle,
  Filter,
  RotateCcw,
  CalendarDays,
  XCircle,
  TrendingDown,
  Warehouse,
  History,
  Clock,
  ArrowDownRight,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const LOW_STOCK_THRESHOLD = 5;

const formatNumber = (value) => Number(value || 0).toLocaleString("en-PK");
const formatCurrency = (value) =>
  `PKR ${Number(value || 0).toLocaleString("en-PK")}`;

const formatDate = (date) => {
  if (!date) return "—";
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "—";
  return parsedDate.toLocaleString("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const Inventory = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [inventorySummary, setInventorySummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // Stock update states
  const [editingId, setEditingId] = useState(null);
  const [stockDraft, setStockDraft] = useState("");
  const [updatingStock, setUpdatingStock] = useState(false);
  const [stockMessage, setStockMessage] = useState("");
  const [stockError, setStockError] = useState("");

  // Stock history states
  const [stockHistory, setStockHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [historySearch, setHistorySearch] = useState("");

  // Step 8: Analytics and filters
  const [movementFilter, setMovementFilter] = useState("all");
  const [historyStartDate, setHistoryStartDate] = useState("");
  const [historyEndDate, setHistoryEndDate] = useState("");

  const getToken = () => sessionStorage.getItem("rivelune_admin_token");

  const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
    { label: "Orders", icon: ShoppingBag, path: "/admin/orders" },
    { label: "Payments", icon: CreditCard, path: "/admin/payments" },
    { label: "Products", icon: Package, path: "/admin/products" },
    { label: "Inventory", icon: Boxes, path: "/admin/inventory" },
    { label: "Customers", icon: Users, path: "/admin/customers" },
    { label: "Coupons", icon: Ticket, path: "/admin/coupons" },
    { label: "Settings", icon: Settings, path: "/admin/settings" },
  ];

  // Fetch Inventory
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const token = getToken();

      if (!token) {
        navigate("/admin/login", { replace: true });
        return;
      }

      const response = await fetch(`${API_URL}/admin/inventory`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("rivelune_admin_token");
        navigate("/admin/login", { replace: true });
        return;
      }

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to fetch inventory");

      const inventoryList = (data.inventory || [])
        .filter((item) => item.variant_id !== null)
        .map((item) => ({
          id: item.variant_id,
          productId: item.product_id,
          name: item.product_name,
          sku: item.variant_sku || item.product_sku || "—",
          size: item.size || "—",
          color: item.color || "—",
          stock: Number(item.stock_quantity || 0),
          price: Number(
            item.price_override ?? item.sale_price ?? item.product_price ?? 0,
          ),
        }));

      setProducts(inventoryList);
      setInventorySummary(data.summary || {});
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Stock History
  const fetchStockHistory = async () => {
    try {
      setHistoryLoading(true);
      setHistoryError("");
      const token = getToken();

      if (!token) {
        navigate("/admin/login", { replace: true });
        return;
      }

      const response = await fetch(`${API_URL}/admin/inventory/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("rivelune_admin_token");
        navigate("/admin/login", { replace: true });
        return;
      }

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to fetch stock history.");
      setStockHistory(data.history || []);
    } catch (err) {
      setHistoryError(err.message || "Unable to load stock history.");
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchStockHistory();
  }, []);

  // Update stock
  const updateStock = async (variantId) => {
    const quantity = Number(stockDraft);

    if (stockDraft === "" || !Number.isInteger(quantity) || quantity < 0) {
      setStockError("Please enter a valid non-negative stock quantity.");
      return;
    }

    try {
      setUpdatingStock(true);
      setStockError("");
      setStockMessage("");
      const token = getToken();

      if (!token) {
        navigate("/admin/login", { replace: true });
        return;
      }

      const response = await fetch(
        `${API_URL}/admin/inventory/${variantId}/stock`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ stock_quantity: quantity }),
        },
      );

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("rivelune_admin_token");
        navigate("/admin/login", { replace: true });
        return;
      }

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to update stock.");

      setStockMessage(data.message || "Stock updated successfully!");
      setEditingId(null);
      setStockDraft("");

      await Promise.all([fetchProducts(), fetchStockHistory()]);
    } catch (err) {
      setStockError(err.message || "Stock update failed.");
    } finally {
      setUpdatingStock(false);
    }
  };

  // Product search
  const filteredProducts = products.filter((product) => {
    const term = search.toLowerCase().trim();
    return (
      product.name?.toLowerCase().includes(term) ||
      product.sku?.toLowerCase().includes(term) ||
      product.size?.toLowerCase().includes(term) ||
      product.color?.toLowerCase().includes(term)
    );
  });
// Step 9: Low Stock Alerts
const lowStockProducts = products
  .filter((product) => product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD)
  .sort((a, b) => a.stock - b.stock);

const outOfStockProducts = products.filter(
  (product) => product.stock <= 0,
);

const restockAlerts = [...outOfStockProducts, ...lowStockProducts];

// Step 10: Export Inventory to CSV
const exportInventoryCSV = () => {
  const headers = [
    "Product Name",
    "Product ID",
    "SKU",
    "Size",
    "Color",
    "Price (PKR)",
    "Stock Quantity",
    "Stock Status",
  ];

  const rows = filteredProducts.map((product) => [
    product.name,
    product.productId,
    product.sku,
    product.size,
    product.color,
    product.price,
    product.stock,
    getStockStatus(product.stock).label,
  ]);

  const csvContent = [
    headers,
    ...rows,
  ]
    .map((row) =>
      row
        .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
        .join(","),
    )
    .join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `Rivelune-Inventory-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
};
  // History search + movement + date filtering
  const filteredHistory = stockHistory.filter((item) => {
    const term = historySearch.toLowerCase().trim();

    const matchesSearch =
      item.product_name?.toLowerCase().includes(term) ||
      item.product_sku?.toLowerCase().includes(term) ||
      item.variant_sku?.toLowerCase().includes(term) ||
      String(item.size || "")
        .toLowerCase()
        .includes(term) ||
      item.color?.toLowerCase().includes(term) ||
      item.note?.toLowerCase().includes(term);

    const change = Number(item.change_amount || 0);

    const matchesMovement =
      movementFilter === "all" ||
      (movementFilter === "added" && change > 0) ||
      (movementFilter === "removed" && change < 0);

    const itemDate = item.created_at ? new Date(item.created_at) : null;

    const formattedDate =
      itemDate && !Number.isNaN(itemDate.getTime())
        ? [
            itemDate.getFullYear(),
            String(itemDate.getMonth() + 1).padStart(2, "0"),
            String(itemDate.getDate()).padStart(2, "0"),
          ].join("-")
        : "";

    const matchesStartDate =
      !historyStartDate || (formattedDate && formattedDate >= historyStartDate);

    const matchesEndDate =
      !historyEndDate || (formattedDate && formattedDate <= historyEndDate);

    return (
      matchesSearch && matchesMovement && matchesStartDate && matchesEndDate
    );
  });

  // Analytics based on currently filtered history
  const stockAdded = filteredHistory.reduce((total, item) => {
    const change = Number(item.change_amount || 0);
    return total + (change > 0 ? change : 0);
  }, 0);

  const stockRemoved = filteredHistory.reduce((total, item) => {
    const change = Number(item.change_amount || 0);
    return total + (change < 0 ? Math.abs(change) : 0);
  }, 0);

  const netStockChange = stockAdded - stockRemoved;

  const additionRecords = filteredHistory.filter(
    (item) => Number(item.change_amount || 0) > 0,
  ).length;

  const removalRecords = filteredHistory.filter(
    (item) => Number(item.change_amount || 0) < 0,
  ).length;

  const resetHistoryFilters = () => {
    setHistorySearch("");
    setMovementFilter("all");
    setHistoryStartDate("");
    setHistoryEndDate("");
  };

  // Inventory summary
  const totalProducts = Number(inventorySummary.totalProducts || 0);
  const totalVariants = Number(inventorySummary.totalVariants || 0);
  const totalUnits = Number(inventorySummary.totalStock || 0);
  const lowStockCount = Number(inventorySummary.lowStockCount || 0);
  const outOfStockCount = Number(inventorySummary.outOfStockCount || 0);

  // Stock status
  const getStockStatus = (stock) => {
    const quantity = Number(stock);
    if (quantity <= 0)
      return {
        label: "Out of Stock",
        className: "bg-rose-50 text-rose-600 border-rose-100",
        icon: XCircle,
      };
    if (quantity <= LOW_STOCK_THRESHOLD)
      return {
        label: "Low Stock",
        className: "bg-amber-50 text-amber-600 border-amber-100",
        icon: AlertTriangle,
      };
    return {
      label: "In Stock",
      className: "bg-emerald-50 text-emerald-600 border-emerald-100",
      icon: CheckCircle,
    };
  };

  // Reusable overview card
  const overviewCards = [
    {
      title: "Total Products",
      value: totalProducts,
      subtitle: "Active products in catalog",
      icon: Package,
      iconStyle: "bg-blue-50 text-blue-600",
    },
    {
      title: "Total Variants",
      value: totalVariants,
      subtitle: "Size and color combinations",
      icon: Boxes,
      iconStyle: "bg-violet-50 text-violet-600",
    },
    {
      title: "Total Units",
      value: totalUnits,
      subtitle: "Total inventory quantity",
      icon: Warehouse,
      iconStyle: "bg-cyan-50 text-cyan-600",
    },
    {
      title: "Low Stock",
      value: lowStockCount,
      subtitle: `1–${LOW_STOCK_THRESHOLD} units remaining`,
      icon: TrendingDown,
      iconStyle: "bg-amber-50 text-amber-600",
    },
    {
      title: "Out of Stock",
      value: outOfStockCount,
      subtitle: "Variants unavailable",
      icon: XCircle,
      iconStyle: "bg-rose-50 text-rose-600",
    },
  ];

  const analyticsCards = [
    {
      title: "Stock Added",
      value: `+${formatNumber(stockAdded)}`,
      subtitle: `${additionRecords} addition records`,
      icon: ArrowUpRight,
      style: "text-emerald-600",
      iconStyle: "bg-emerald-50 text-emerald-600",
      border: "border-emerald-100",
    },
    {
      title: "Stock Removed",
      value: `-${formatNumber(stockRemoved)}`,
      subtitle: `${removalRecords} removal records`,
      icon: ArrowDownRight,
      style: "text-rose-600",
      iconStyle: "bg-rose-50 text-rose-600",
      border: "border-rose-100",
    },
    {
      title: "Net Stock Change",
      value: `${netStockChange > 0 ? "+" : ""}${formatNumber(netStockChange)}`,
      subtitle: "Net movement in selected records",
      icon: TrendingDown,
      style: netStockChange >= 0 ? "text-emerald-600" : "text-rose-600",
      iconStyle: "bg-blue-50 text-blue-600",
      border: "border-slate-200",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-800 md:flex">
      {/* SIDEBAR */}
      <aside className="flex w-full flex-col border-r border-slate-200 bg-white md:fixed md:inset-y-0 md:left-0 md:w-[255px] md:overflow-y-auto">
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

        <div className="px-4 pt-7">
          <p className="mb-3 px-3 text-[10px] font-bold tracking-[0.18em] text-slate-400">
            WORKSPACE
          </p>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = item.path === "/admin/inventory";
              return (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all ${active ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
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

      {/* MAIN */}
      <main className="min-w-0 flex-1 md:ml-[255px]">
        {/* TOPBAR */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 sm:px-8">
          <div>
            <p className="text-xs text-slate-400">
              Workspace <span className="mx-1">/</span> Inventory
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Inventory Management
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                fetchProducts();
                fetchStockHistory();
              }}
              disabled={loading || updatingStock || historyLoading}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                className={loading || historyLoading ? "animate-spin" : ""}
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

        <div className="mx-auto max-w-[1500px] space-y-8 p-5 sm:p-8">
          {/* Intro */}
          <section>
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
              <ArrowLeft size={17} />
              Back to Dashboard
            </button>
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <Warehouse size={21} className="text-slate-700" />
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Stock Control
                  </h1>
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  Manage product quantities and monitor stock availability.
                </p>
              </div>
            </div>
          </section>

          {/* Alerts */}
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              <AlertTriangle size={17} />
              {error}
            </div>
          )}
          {stockMessage && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <CheckCircle size={17} />
              {stockMessage}
            </div>
          )}
          {stockError && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              <AlertTriangle size={17} />
              {stockError}
            </div>
          )}

          {/* Inventory Overview */}
          <section>
            <div className="mb-4">
              <h3 className="text-base font-bold text-slate-900">
                Inventory Overview
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Current stock summary for your catalog
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {overviewCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.title}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-medium text-slate-500">
                          {card.title}
                        </p>
                        <h3 className="mt-3 text-2xl font-bold text-slate-900">
                          {loading ? "..." : formatNumber(card.value)}
                        </h3>
                        <p className="mt-2 text-xs text-slate-400">
                          {card.subtitle}
                        </p>
                      </div>
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.iconStyle}`}
                      >
                        <Icon size={20} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
{/* LOW STOCK ALERTS */}
<section>
  <div className="mb-4 flex items-center gap-2">
    <AlertTriangle size={20} className="text-amber-500" />
    <div>
      <h3 className="text-base font-bold text-slate-900">
        Restock Alerts
      </h3>
      <p className="mt-1 text-xs text-slate-400">
        Products that need attention before they run out
      </p>
    </div>
  </div>

  {restockAlerts.length === 0 ? (
    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-6">
      <div className="flex items-center gap-2 text-emerald-700">
        <CheckCircle size={20} />
        <p className="text-sm font-semibold">
          All inventory levels are healthy
        </p>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        No products currently need restocking.
      </p>
    </div>
  ) : (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid grid-cols-1 gap-3 border-b border-slate-100 bg-slate-50/70 p-4 sm:grid-cols-3">
        <div className="rounded-xl border border-rose-100 bg-rose-50 p-4">
          <p className="text-xs font-medium text-rose-600">
            Out of Stock
          </p>
          <h4 className="mt-2 text-2xl font-bold text-rose-700">
            {outOfStockProducts.length}
          </h4>
          <p className="mt-1 text-xs text-rose-500">
            Immediate restocking needed
          </p>
        </div>

        <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
          <p className="text-xs font-medium text-amber-600">
            Low Stock
          </p>
          <h4 className="mt-2 text-2xl font-bold text-amber-700">
            {lowStockProducts.length}
          </h4>
          <p className="mt-1 text-xs text-amber-500">
            {`Only ${LOW_STOCK_THRESHOLD} units or fewer`}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">
            Total Alerts
          </p>
          <h4 className="mt-2 text-2xl font-bold text-slate-900">
            {restockAlerts.length}
          </h4>
          <p className="mt-1 text-xs text-slate-400">
            Variants requiring attention
          </p>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {restockAlerts.map((product) => {
          const isOut = product.stock <= 0;

          return (
            <div
              key={product.id}
              className="flex flex-col gap-3 p-4 transition hover:bg-slate-50/70 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-semibold text-slate-800">
                  {product.name}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  SKU: {product.sku} · Size: {product.size} · Color: {product.color}
                </p>
              </div>

              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                    isOut
                      ? "border-rose-100 bg-rose-50 text-rose-600"
                      : "border-amber-100 bg-amber-50 text-amber-600"
                  }`}
                >
                  <AlertTriangle size={13} />
                  {isOut ? "Out of Stock" : "Low Stock"}
                </span>

                <div className="text-right">
                  <p
                    className={`text-xl font-bold ${
                      isOut ? "text-rose-600" : "text-amber-600"
                    }`}
                  >
                    {formatNumber(product.stock)}
                  </p>
                  <p className="text-[10px] text-slate-400">units left</p>
                </div>

                <button
                  onClick={() => {
                    setEditingId(product.id);
                    setStockDraft(String(product.stock));
                    setStockError("");
                    setStockMessage("");
                  }}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Restock
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )}
</section>
          {/* PRODUCT INVENTORY */}
          <section>
            <div className="mb-4">
              <h3 className="text-base font-bold text-slate-900">
                Product Inventory
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Search products, check stock status and manage variants
              </p>
            </div>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Stock List
                  </h4>
                  <p className="mt-1 text-xs text-slate-400">
                    Inventory fetched directly from your database
                  </p>
                </div>
             <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
  {/* Export CSV Button */}
  <button
    onClick={exportInventoryCSV}
    disabled={loading || filteredProducts.length === 0}
    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
  >
    <Download size={16} />
    Export CSV
  </button>

  {/* Search */}
  <div className="relative w-full sm:max-w-xs">
    <Search
      size={17}
      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
    />

    <input
      type="text"
      placeholder="Search product, SKU, size, color..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
    />
  </div>
</div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center gap-3 py-16 text-sm text-slate-500">
                  <RefreshCw size={18} className="animate-spin" />
                  Loading inventory...
                </div>
              ) : error ? (
                <div className="py-16 text-center">
                  <AlertTriangle size={35} className="mx-auto text-rose-300" />
                  <p className="mt-3 font-medium text-rose-600">
                    Unable to load inventory
                  </p>
                  <button
                    onClick={fetchProducts}
                    className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700"
                  >
                    Try Again
                  </button>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="py-16 text-center">
                  <Package size={35} className="mx-auto text-slate-300" />
                  <p className="mt-3 font-medium text-slate-600">
                    No inventory variants found
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Try a different search.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1100px] text-left">
                    <thead className="bg-slate-50">
                      <tr className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        <th className="px-5 py-4">Product</th>
                        <th className="px-5 py-4">SKU</th>
                        <th className="px-5 py-4">Variant</th>
                        <th className="px-5 py-4">Price</th>
                        <th className="px-5 py-4">Stock</th>
                        <th className="px-5 py-4">Status</th>
                        <th className="px-5 py-4">Stock Update</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredProducts.map((product) => {
                        const status = getStockStatus(product.stock);
                        const StatusIcon = status.icon;
                        return (
                          <tr
                            key={product.id}
                            className="transition hover:bg-slate-50/70"
                          >
                            <td className="px-5 py-4">
                              <div className="font-semibold text-slate-800">
                                {product.name}
                              </div>
                              <div className="mt-1 text-xs text-slate-400">
                                Product ID: #{product.productId}
                              </div>
                            </td>
                            <td className="px-5 py-4 text-sm text-slate-500">
                              {product.sku || "—"}
                            </td>
                            <td className="px-5 py-4 text-sm text-slate-500">
                              <div>{product.size}</div>
                              <div className="mt-1 text-xs text-slate-400">
                                {product.color}
                              </div>
                            </td>
                            <td className="px-5 py-4 text-sm font-medium text-slate-700">
                              {formatCurrency(product.price)}
                            </td>
                            <td className="px-5 py-4">
                              <span className="text-lg font-bold text-slate-800">
                                {formatNumber(product.stock)}
                              </span>
                              <span className="ml-1 text-xs text-slate-400">
                                units
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${status.className}`}
                              >
                                <StatusIcon size={13} />
                                {status.label}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              {editingId === product.id ? (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={stockDraft}
                                    disabled={updatingStock}
                                    onChange={(e) => {
                                      setStockDraft(e.target.value);
                                      setStockError("");
                                      setStockMessage("");
                                    }}
                                    className="w-20 rounded-lg border border-slate-300 px-2 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                                  />
                                  <button
                                    onClick={() => updateStock(product.id)}
                                    disabled={updatingStock}
                                    className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
                                  >
                                    {updatingStock ? "Saving..." : "Save"}
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingId(null);
                                      setStockDraft("");
                                      setStockError("");
                                    }}
                                    disabled={updatingStock}
                                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setEditingId(product.id);
                                    setStockDraft(String(product.stock));
                                    setStockError("");
                                    setStockMessage("");
                                  }}
                                  className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                                >
                                  Update Stock
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {!loading && !error && (
                <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-slate-500">
                    Showing{" "}
                    <span className="font-semibold text-slate-700">
                      {filteredProducts.length}
                    </span>{" "}
                    variants across{" "}
                    <span className="font-semibold text-slate-700">
                      {totalProducts}
                    </span>{" "}
                    products
                  </p>
                  <p className="text-xs text-slate-400">
                    Low stock threshold: {LOW_STOCK_THRESHOLD} units
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* STOCK HISTORY */}
          <section>
            <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <History size={19} className="text-slate-700" />
                  <h3 className="text-base font-bold text-slate-900">
                    Stock History
                  </h3>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  Track all stock quantity changes and previous updates
                </p>
              </div>
              <button
                onClick={fetchStockHistory}
                disabled={historyLoading}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                <RefreshCw
                  size={14}
                  className={historyLoading ? "animate-spin" : ""}
                />
                Refresh History
              </button>
            </div>

            {/* Analytics cards */}
            <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {analyticsCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.title}
                    className={`rounded-2xl border ${card.border} bg-white p-5 shadow-sm transition hover:shadow-md`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-medium text-slate-500">
                          {card.title}
                        </p>
                        <h3 className={`mt-3 text-2xl font-bold ${card.style}`}>
                          {card.value}
                        </h3>
                        <p className="mt-2 text-xs text-slate-400">
                          {card.subtitle}
                        </p>
                      </div>
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.iconStyle}`}
                      >
                        <Icon size={20} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {/* History header + search */}
              <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Stock Movement Records
                  </h4>
                  <p className="mt-1 text-xs text-slate-400">
                    {filteredHistory.length} matching records ·{" "}
                    {stockHistory.length} loaded
                  </p>
                </div>
                <div className="relative w-full sm:max-w-xs">
                  <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="Search stock history..."
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
                  />
                </div>
              </div>

              {/* History Filters */}
              <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/70 p-5">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <Filter size={15} />
                  History Filters
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-500">
                      Movement Type
                    </label>
                    <select
                      value={movementFilter}
                      onChange={(e) => setMovementFilter(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    >
                      <option value="all">All Movements</option>
                      <option value="added">Stock Added</option>
                      <option value="removed">Stock Removed</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-500">
                      Start Date
                    </label>
                    <div className="relative">
                      <CalendarDays
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="date"
                        value={historyStartDate}
                        max={historyEndDate || undefined}
                        onChange={(e) => setHistoryStartDate(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-500">
                      End Date
                    </label>
                    <div className="relative">
                      <CalendarDays
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="date"
                        value={historyEndDate}
                        min={historyStartDate || undefined}
                        onChange={(e) => setHistoryEndDate(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                      />
                    </div>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={resetHistoryFilters}
                      disabled={
                        !historySearch &&
                        movementFilter === "all" &&
                        !historyStartDate &&
                        !historyEndDate
                      }
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <RotateCcw size={14} />
                      Reset Filters
                    </button>
                  </div>
                </div>

                {/* Active filter chips */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="font-medium">Active filters:</span>
                  {movementFilter !== "all" && (
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 font-medium text-blue-600">
                      {movementFilter === "added"
                        ? "Stock Added"
                        : "Stock Removed"}
                    </span>
                  )}
                  {historyStartDate && (
                    <span className="rounded-full bg-slate-100 px-2.5 py-1">
                      From: {historyStartDate}
                    </span>
                  )}
                  {historyEndDate && (
                    <span className="rounded-full bg-slate-100 px-2.5 py-1">
                      To: {historyEndDate}
                    </span>
                  )}
                  {!historyStartDate &&
                    !historyEndDate &&
                    movementFilter === "all" &&
                    !historySearch && <span>None</span>}
                  {historySearch && (
                    <span className="rounded-full bg-violet-50 px-2.5 py-1 text-violet-600">
                      Search: {historySearch}
                    </span>
                  )}
                </div>
              </div>

              {/* History table */}
              {historyLoading ? (
                <div className="flex items-center justify-center gap-3 py-14 text-sm text-slate-500">
                  <RefreshCw size={18} className="animate-spin" />
                  Loading stock history...
                </div>
              ) : historyError ? (
                <div className="py-14 text-center">
                  <AlertTriangle size={34} className="mx-auto text-rose-300" />
                  <p className="mt-3 font-medium text-rose-600">
                    Unable to load stock history
                  </p>
                  <p className="mt-1 text-sm text-slate-400">{historyError}</p>
                  <button
                    onClick={fetchStockHistory}
                    className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
                  >
                    Try Again
                  </button>
                </div>
              ) : filteredHistory.length === 0 ? (
                <div className="py-14 text-center">
                  <History size={36} className="mx-auto text-slate-300" />
                  <p className="mt-3 font-medium text-slate-600">
                    {stockHistory.length
                      ? "No matching history found"
                      : "No stock history available yet"}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    {stockHistory.length
                      ? "Try adjusting the search or filters."
                      : "Stock changes will appear here after you update inventory."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1050px] text-left">
                    <thead className="bg-slate-50">
                      <tr className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        <th className="px-5 py-4">Product</th>
                        <th className="px-5 py-4">Variant</th>
                        <th className="px-5 py-4">Previous</th>
                        <th className="px-5 py-4">New Stock</th>
                        <th className="px-5 py-4">Change</th>
                        <th className="px-5 py-4">Note</th>
                        <th className="px-5 py-4">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredHistory.map((item) => {
                        const change = Number(item.change_amount || 0);
                        const isIncrease = change > 0;
                        const isDecrease = change < 0;
                        return (
                          <tr
                            key={item.id}
                            className="transition hover:bg-slate-50/70"
                          >
                            <td className="px-5 py-4">
                              <div className="font-semibold text-slate-800">
                                {item.product_name || "Unknown Product"}
                              </div>
                              <div className="mt-1 text-xs text-slate-400">
                                {item.product_sku || "No product SKU"}
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <div className="text-sm text-slate-600">
                                Size: {item.size || "—"}
                              </div>
                              <div className="mt-1 text-xs text-slate-400">
                                {item.color || "—"}
                              </div>
                              {item.variant_sku && (
                                <div className="mt-1 text-xs text-slate-400">
                                  SKU: {item.variant_sku}
                                </div>
                              )}
                            </td>
                            <td className="px-5 py-4 text-sm font-medium text-slate-600">
                              {formatNumber(item.previous_stock)}
                            </td>
                            <td className="px-5 py-4">
                              <span className="text-sm font-bold text-slate-800">
                                {formatNumber(item.new_stock)}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${isIncrease ? "bg-emerald-50 text-emerald-600" : isDecrease ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-500"}`}
                              >
                                {isIncrease ? (
                                  <ArrowUpRight size={13} />
                                ) : isDecrease ? (
                                  <ArrowDownRight size={13} />
                                ) : (
                                  <span>•</span>
                                )}
                                {change > 0 ? "+" : ""}
                                {formatNumber(change)}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <span className="inline-flex items-center rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs text-slate-600">
                                {item.note || "No note"}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-1.5 whitespace-nowrap text-xs text-slate-500">
                                <Clock size={13} />
                                {formatDate(item.created_at)}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* History Footer */}
              {!historyLoading && !historyError && stockHistory.length > 0 && (
                <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-slate-500">
                    Showing{" "}
                    <span className="font-semibold text-slate-700">
                      {filteredHistory.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-slate-700">
                      {stockHistory.length}
                    </span>{" "}
                    stock movement records
                  </p>
                  <p className="text-xs text-slate-400">
                    Latest 100 database records · Filters applied locally
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* STOCK STATUS GUIDE */}
          <section>
            <div className="mb-4">
              <h3 className="text-base font-bold text-slate-900">
                Stock Status Guide
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Understand your inventory status indicators
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
                <div className="flex items-center gap-2 text-emerald-700">
                  <CheckCircle size={18} />
                  <h4 className="text-sm font-semibold">In Stock</h4>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Stock quantity is above {LOW_STOCK_THRESHOLD} units.
                </p>
              </div>
              <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-5">
                <div className="flex items-center gap-2 text-amber-700">
                  <AlertTriangle size={18} />
                  <h4 className="text-sm font-semibold">Low Stock</h4>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Stock is between 1 and {LOW_STOCK_THRESHOLD} units. Restock
                  soon.
                </p>
              </div>
              <div className="rounded-2xl border border-rose-100 bg-rose-50/60 p-5">
                <div className="flex items-center gap-2 text-rose-700">
                  <XCircle size={18} />
                  <h4 className="text-sm font-semibold">Out of Stock</h4>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Stock is zero. Restock to make it available.
                </p>
              </div>
            </div>
          </section>

          {/* FOOTER */}
          <footer className="flex flex-col gap-2 border-t border-slate-200 pt-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 RIVELUNE Admin Workspace</p>
            <p>Inventory Control · Stock Management</p>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default Inventory;
