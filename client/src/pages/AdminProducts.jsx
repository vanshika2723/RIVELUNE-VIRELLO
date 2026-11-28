
import { Fragment, useEffect, useMemo, useState } from "react";
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
  Search,
  RefreshCw,
  AlertTriangle,
  CircleDollarSign,
  Tag,
  SlidersHorizontal,
  ChevronDown,
  ImageOff,
  Layers,
  X,
  Plus,
  Pencil,
   CheckCircle2,
  Trash2,
} from "lucide-react";
import AdminAddProductModal from "../components/AdminAddProductModal";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const formatPrice = (value) =>
  `PKR ${Number(value || 0).toLocaleString("en-PK", {
    maximumFractionDigits: 0,
  })}`;

const getStockStatus = (stock) => {
  const quantity = Number(stock || 0);

  if (quantity <= 0) {
    return {
      label: "Out of stock",
      color: "bg-rose-50 text-rose-700",
    };
  }

  if (quantity <= 5) {
    return {
      label: "Low stock",
      color: "bg-amber-50 text-amber-700",
    };
  }

  return {
    label: "In stock",
    color: "bg-emerald-50 text-emerald-700",
  };
};

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

const AdminProducts = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [stockFilter, setStockFilter] = useState("All Stock");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [expandedProduct, setExpandedProduct] = useState(null);

  // ADD / EDIT PRODUCT MODAL
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // STOCK UPDATE
  const [stockDrafts, setStockDrafts] = useState({});
  const [updatingStock, setUpdatingStock] = useState(null);
  // DELETE PRODUCT
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [actionError, setActionError] = useState("");
  // ==========================================
  // FETCH PRODUCTS
  // ==========================================
  const fetchProducts = async () => {
    setRefreshing(true);
    setError("");

    try {
      const token = sessionStorage.getItem("rivelune_admin_token");

      if (!token) {
        navigate("/admin/login", { replace: true });
        return;
      }

      const response = await fetch(`${API_URL}/products`, {
        method: "GET",
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache",
        },
      });

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("rivelune_admin_token");
        navigate("/admin/login", { replace: true });
        return;
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load products.");
      }

      const fetchedProducts = Array.isArray(data.products)
        ? data.products
        : [];

      setProducts(fetchedProducts);
    } catch (err) {
      console.error("Admin products fetch error:", err);
      setError(err.message || "Unable to load products.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ==========================================
  // SUCCESS MESSAGE AUTO HIDE
  // ==========================================
  useEffect(() => {
    if (!successMessage) return;

    const timer = setTimeout(() => {
      setSuccessMessage("");
    }, 4000);

    return () => clearTimeout(timer);
  }, [successMessage]);

  // ==========================================
  // CATEGORIES
  // ==========================================
  const categories = useMemo(() => {
    return [
      ...new Set(
        products.map((product) => product.category_name).filter(Boolean)
      ),
    ].sort();
  }, [products]);

  // ==========================================
  // PRODUCT STATISTICS
  // ==========================================
  const stats = useMemo(() => {
    const totalStock = products.reduce(
      (sum, product) => sum + Number(product.stock || 0),
      0
    );

    const lowStock = products.filter((product) => {
      const stock = Number(product.stock || 0);
      return stock > 0 && stock <= 5;
    }).length;

    const outOfStock = products.filter(
      (product) => Number(product.stock || 0) <= 0
    ).length;

    const activeProducts = products.filter(
      (product) => Number(product.is_active) === 1
    ).length;

    return {
      total: products.length,
      totalStock,
      lowStock,
      outOfStock,
      activeProducts,
    };
  }, [products]);

  // ==========================================
  // FILTER PRODUCTS
  // ==========================================
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const query = search.trim().toLowerCase();

      const matchesSearch =
        !query ||
        String(product.name || "").toLowerCase().includes(query) ||
        String(product.sku || "").toLowerCase().includes(query) ||
        String(product.category_name || "").toLowerCase().includes(query);

      const matchesCategory =
        categoryFilter === "All Categories" ||
        product.category_name === categoryFilter;

      const stock = Number(product.stock || 0);

      const matchesStock =
        stockFilter === "All Stock" ||
        (stockFilter === "In Stock" && stock > 5) ||
        (stockFilter === "Low Stock" && stock > 0 && stock <= 5) ||
        (stockFilter === "Out of Stock" && stock <= 0);

      const matchesStatus =
        statusFilter === "All Status" ||
        (statusFilter === "Active" && Number(product.is_active) === 1) ||
        (statusFilter === "Inactive" && Number(product.is_active) !== 1);

      return matchesSearch && matchesCategory && matchesStock && matchesStatus;
    });
  }, [products, search, categoryFilter, stockFilter, statusFilter]);

  const resetFilters = () => {
    setSearch("");
    setCategoryFilter("All Categories");
    setStockFilter("All Stock");
    setStatusFilter("All Status");
  };

  // ==========================================
  // OPEN ADD / EDIT MODAL
  // ==========================================
  const openAddProduct = () => {
    setSelectedProduct(null);
    setShowAddProduct(true);
  };

  const openEditProduct = (product) => {
    setSelectedProduct(product);
    setShowAddProduct(true);
  };

  const closeProductModal = () => {
    setShowAddProduct(false);
    setSelectedProduct(null);
  };

  // ==========================================
  // HANDLE PRODUCT SAVED
  // ==========================================
  const handleProductSaved = async () => {
    const isEditing = Boolean(selectedProduct);

    closeProductModal();

    setSearch("");
    setCategoryFilter("All Categories");
    setStockFilter("All Stock");
    setStatusFilter("All Status");
    setExpandedProduct(null);

    await fetchProducts();

    setSuccessMessage(
      isEditing
        ? "Product updated successfully!"
        : "Product created successfully!"
    );
  };
  // ==========================================
  // DELETE PRODUCT
  // ==========================================
  const handleDeleteProduct = async (product) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?\n\nThis will permanently remove the product and its variants and images.`
    );

    if (!confirmed) return;

    try {
      setDeletingProduct(product.id);
      setActionError("");
      setError("");
      setSuccessMessage("");

      const token = sessionStorage.getItem("rivelune_admin_token");

      if (!token) {
        navigate("/admin/login", { replace: true });
        return;
      }

      const response = await fetch(
        `${API_URL}/products/${product.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("rivelune_admin_token");
        navigate("/admin/login", { replace: true });
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete product.");
      }

      // Remove deleted product from the current list
      setProducts((previous) =>
        previous.filter((item) => item.id !== product.id)
      );

      // Remove its stock draft
      setStockDrafts((previous) => {
        const updated = { ...previous };
        delete updated[product.id];
        return updated;
      });

      // Close expanded details if this product was expanded
      setExpandedProduct((previous) =>
        previous === product.id ? null : previous
      );

      setSuccessMessage("Product deleted successfully!");
    } catch (err) {
      console.error("Delete product error:", err);
      setActionError(err.message || "Unable to delete product.");
    } finally {
      setDeletingProduct(null);
    }
  };
  // ==========================================
  // UPDATE PRODUCT STOCK
  // ==========================================
  const handleStockUpdate = async (product) => {
    const stockValue = stockDrafts[product.id] ?? product.stock;
    const quantity = Number(stockValue);

    if (!Number.isInteger(quantity) || quantity < 0) {
      setError("Stock must be a valid non-negative integer.");
      return;
    }

    try {
      setUpdatingStock(product.id);
      setError("");

      const token = sessionStorage.getItem("rivelune_admin_token");

      const response = await fetch(
        `${API_URL}/products/${product.id}/stock`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ stock: quantity }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update stock.");
      }

      setProducts((previous) =>
        previous.map((item) =>
          item.id === product.id
            ? { ...item, stock: quantity }
            : item
        )
      );

      setStockDrafts((previous) => {
        const updated = { ...previous };
        delete updated[product.id];
        return updated;
      });

      setSuccessMessage("Stock updated successfully!");
    } catch (err) {
      setError(err.message || "Unable to update stock.");
    } finally {
      setUpdatingStock(null);
    }
  };

  // ==========================================
  // SUMMARY CARDS
  // ==========================================
  const statCards = [
    {
      label: "Total Products",
      value: stats.total,
      note: `${stats.activeProducts} active products`,
      icon: Package,
      color: "bg-violet-50 text-violet-600",
    },
    {
      label: "Units in Stock",
      value: stats.totalStock.toLocaleString(),
      note: "Total available inventory",
      icon: Layers,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Low Stock",
      value: stats.lowStock,
      note: "Products needing attention",
      icon: AlertTriangle,
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "Out of Stock",
      value: stats.outOfStock,
      note: "Products unavailable",
      icon: CircleDollarSign,
      color: "bg-rose-50 text-rose-600",
    },
  ];

  // ==========================================
  // SIDEBAR
  // ==========================================
  const Sidebar = () => (
    <aside className="flex w-full shrink-0 flex-col border-r border-slate-200 bg-white md:fixed md:inset-y-0 md:left-0 md:w-[255px] md:overflow-y-auto">
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
            const active = item.path === "/admin/products";

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
  );

  // ==========================================
  // PRODUCT DETAILS
  // ==========================================
  const ProductDetails = ({ product }) => {
    const variants = product.variants || [];

    return (
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Product Details
          </p>

          <p className="mt-3 text-sm text-slate-700">
            <span className="font-medium">Fabric:</span> {product.fabric || "—"}
          </p>

          <p className="mt-2 text-sm text-slate-700">
            <span className="font-medium">Fit:</span> {product.fit || "—"}
          </p>

          <p className="mt-2 text-sm text-slate-700">
            <span className="font-medium">Gender:</span>{" "}
            {product.category_gender || "—"}
          </p>

          {product.description && (
            <p className="mt-3 text-sm leading-6 text-slate-500">
              {product.description}
            </p>
          )}

          {product.care_instructions && (
            <p className="mt-3 text-sm leading-6 text-slate-500">
              <span className="font-medium">Care:</span>{" "}
              {product.care_instructions}
            </p>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 lg:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Product Variants
          </p>

          {variants.length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">
              No variants available for this product.
            </p>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              {variants.map((variant) => (
                <div
                  key={variant.id}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
                >
                  <div className="font-semibold text-slate-700">
                    {variant.size} / {variant.color}
                  </div>

                  <div className="mt-1 text-slate-500">
                    Stock: {variant.stock_quantity ?? 0}
                  </div>

                  {variant.variant_sku && (
                    <div className="mt-1 text-slate-400">
                      SKU: {variant.variant_sku}
                    </div>
                  )}

                  {variant.price_override && (
                    <div className="mt-1 text-slate-500">
                      Price: {formatPrice(variant.price_override)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ==========================================
  // MAIN PAGE
  // ==========================================
  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-800 md:flex">
      <Sidebar />

      <main className="min-w-0 flex-1 md:ml-[255px]">
        {/* TOPBAR */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 sm:px-8">
          <div>
            <p className="text-xs text-slate-400">
              Workspace <span className="mx-1">/</span> Products
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Product Management
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchProducts}
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

        {/* PAGE CONTENT */}
        <div className="mx-auto max-w-[1500px] space-y-6 p-5 sm:p-8">
          {/* PAGE HEADING */}
          <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Product Catalog
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Manage your catalog, pricing, variants and inventory overview.
              </p>
            </div>

            <button
              onClick={openAddProduct}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700"
            >
              <Plus size={17} />
              Add Product
            </button>
          </section>

          {/* SUCCESS MESSAGE */}
          {successMessage && (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              <CheckCircle2 size={18} />
              {successMessage}

              <button
                onClick={() => setSuccessMessage("")}
                className="ml-auto rounded-md p-1 hover:bg-emerald-100"
              >
                <X size={15} />
              </button>
            </div>
          )}
          {/* DELETE / ACTION ERROR */}
          {actionError && (
            <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              <AlertTriangle size={18} />
              <span>{actionError}</span>

              <button
                onClick={() => setActionError("")}
                className="ml-auto rounded-md p-1 hover:bg-rose-100"
              >
                <X size={15} />
              </button>
            </div>
          )}
          {/* STATS */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-500">
                        {stat.label}
                      </p>

                      <h3 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
                        {loading ? "..." : stat.value}
                      </h3>
                    </div>

                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.color}`}
                    >
                      <Icon size={20} />
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-slate-400">{stat.note}</p>
                </div>
              );
            })}
          </section>

          {/* CATALOG */}
          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            {/* CATALOG HEADER */}
            <div className="border-b border-slate-100 p-5 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    All Products
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    Search and filter your store catalog.
                  </p>
                </div>

                <p className="text-xs text-slate-400">
                  {loading
                    ? "Loading..."
                    : `${filteredProducts.length} products found`}
                </p>
              </div>

              {/* FILTERS */}
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="relative sm:col-span-2 xl:col-span-1">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search product or SKU..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                  />
                </div>

                <div className="relative">
                  <Tag
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-9 text-sm text-slate-700 outline-none focus:border-slate-400"
                  >
                    <option>All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>

                <div className="relative">
                  <SlidersHorizontal
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <select
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-9 text-sm text-slate-700 outline-none focus:border-slate-400"
                  >
                    <option>All Stock</option>
                    <option>In Stock</option>
                    <option>Low Stock</option>
                    <option>Out of Stock</option>
                  </select>

                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>

                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 pr-9 text-sm text-slate-700 outline-none focus:border-slate-400"
                  >
                    <option>All Status</option>
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>

                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>

              {(search ||
                categoryFilter !== "All Categories" ||
                stockFilter !== "All Stock" ||
                statusFilter !== "All Status") && (
                <button
                  onClick={resetFilters}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
                >
                  <X size={13} />
                  Clear filters
                </button>
              )}
            </div>

            {/* ERROR */}
            {error && (
              <div className="m-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                <p className="font-semibold">Products couldn't be loaded.</p>
                <p className="mt-1">{error}</p>

                <button
                  onClick={fetchProducts}
                  className="mt-3 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold hover:bg-rose-100"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* LOADING / EMPTY / PRODUCTS */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <RefreshCw
                  size={24}
                  className="animate-spin text-slate-400"
                />
                <p className="mt-3 text-sm text-slate-500">
                  Loading product catalog...
                </p>
              </div>
            ) : !error && filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
                <div className="rounded-2xl bg-slate-100 p-4">
                  <Package size={28} className="text-slate-400" />
                </div>

                <h3 className="mt-4 font-semibold text-slate-700">
                  No products found
                </h3>

                <p className="mt-1 max-w-sm text-sm text-slate-500">
                  Try changing your search or filters.
                </p>

                <button
                  onClick={resetFilters}
                  className="mt-4 text-sm font-semibold text-slate-700 underline underline-offset-4"
                >
                  Clear Filters
                </button>
              </div>
            ) : !error ? (
              <>
                {/* DESKTOP TABLE */}
                <div className="block overflow-x-auto">
                  <table className="w-full min-w-[1050px] text-left">
                    <thead className="bg-slate-50/80">
                      <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400">
                        <th className="px-6 py-4 font-semibold">Product</th>
                        <th className="px-4 py-4 font-semibold">Category</th>
                        <th className="px-4 py-4 font-semibold">Price</th>
                        <th className="px-4 py-4 font-semibold">Stock</th>
                        <th className="px-4 py-4 font-semibold">Variants</th>
                        <th className="px-4 py-4 font-semibold">Status</th>
                        <th className="px-4 py-4 font-semibold">Actions</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {filteredProducts.map((product) => {
                        const stockStatus = getStockStatus(product.stock);
                        const variants = product.variants || [];
                        const isExpanded = expandedProduct === product.id;

                        return (
                          <Fragment key={product.id}>
                            <tr className="transition hover:bg-slate-50/70">
                              <td className="px-6 py-4">
                                <div className="flex min-w-[230px] items-center gap-3">
                                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                                    {product.main_image ? (
                                      <img
                                        src={product.main_image}
                                        alt={product.image_alt || product.name}
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                          e.currentTarget.style.display = "none";
                                        }}
                                      />
                                    ) : (
                                      <div className="flex h-full w-full items-center justify-center">
                                        <ImageOff
                                          size={18}
                                          className="text-slate-300"
                                        />
                                      </div>
                                    )}
                                  </div>

                                  <div className="min-w-0">
                                    <p className="max-w-[230px] truncate text-sm font-semibold text-slate-800">
                                      {product.name}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-400">
                                      SKU: {product.sku || "—"}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-4 py-4">
                                <p className="text-sm font-medium text-slate-700">
                                  {product.category_name || "Uncategorized"}
                                </p>
                                <p className="mt-1 text-xs text-slate-400">
                                  {product.category_gender || "—"}
                                </p>
                              </td>

                              <td className="px-4 py-4">
                                <p className="text-sm font-semibold text-slate-800">
                                  {formatPrice(
                                    product.sale_price || product.price
                                  )}
                                </p>

                                {product.sale_price &&
                                  Number(product.sale_price) <
                                    Number(product.price) && (
                                    <p className="mt-1 text-xs text-slate-400 line-through">
                                      {formatPrice(product.price)}
                                    </p>
                                  )}
                              </td>

                              {/* STOCK */}
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={
                                      stockDrafts[product.id] ??
                                      product.stock ??
                                      0
                                    }
                                    onChange={(e) =>
                                      setStockDrafts((previous) => ({
                                        ...previous,
                                        [product.id]: e.target.value,
                                      }))
                                    }
                                    className="w-20 rounded-lg border border-slate-200 px-2 py-2 text-sm outline-none focus:border-slate-500"
                                  />

                                  <button
                                    onClick={() => handleStockUpdate(product)}
                                    disabled={
                                      updatingStock === product.id ||
                                      Number(
                                        stockDrafts[product.id] ??
                                          product.stock
                                      ) === Number(product.stock)
                                    }
                                    className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                                  >
                                    {updatingStock === product.id
                                      ? "Saving..."
                                      : "Save"}
                                  </button>
                                </div>

                                <span
                                  className={`mt-2 inline-flex rounded-full px-2 py-1 text-[10px] font-medium ${stockStatus.color}`}
                                >
                                  {stockStatus.label}
                                </span>
                              </td>

                              <td className="px-4 py-4">
                                <p className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                                  <Boxes
                                    size={15}
                                    className="text-slate-400"
                                  />
                                  {variants.length}
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                  {new Set(variants.map((v) => v.size)).size} sizes
                                </p>
                              </td>

                              <td className="px-4 py-4">
                                <span
                                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                                    Number(product.is_active) === 1
                                      ? "bg-emerald-50 text-emerald-700"
                                      : "bg-slate-100 text-slate-500"
                                  }`}
                                >
                                  <span
                                    className={`h-1.5 w-1.5 rounded-full ${
                                      Number(product.is_active) === 1
                                        ? "bg-emerald-500"
                                        : "bg-slate-400"
                                    }`}
                                  />

                                  {Number(product.is_active) === 1
                                    ? "Active"
                                    : "Inactive"}
                                </span>
                              </td>

                              {/* EDIT AND DETAILS */}
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => openEditProduct(product)}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                                  >
                                    <Pencil size={13} />
                                    Edit
                                  </button>

                                  <button
                                    onClick={() =>
                                      setExpandedProduct(
                                        isExpanded ? null : product.id
                                      )
                                    }
                                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
                                  >
                                    {isExpanded ? "Hide" : "View"}
                                  </button>

                                                                    <button
                                    onClick={() => handleDeleteProduct(product)}
                                    disabled={deletingProduct === product.id}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    <Trash2 size={13} />
                                    {deletingProduct === product.id
                                      ? "Deleting..."
                                      : "Delete"}
                                  </button>
                                </div>
                              </td>
                            </tr>

                            {isExpanded && (
                              <tr className="bg-slate-50/70">
                                <td colSpan={7} className="px-6 py-5">
                                  <ProductDetails product={product} />
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* MOBILE CARDS */}
                <div className="space-y-3 p-4 md:hidden">
                  {filteredProducts.map((product) => {
                    const stockStatus = getStockStatus(product.stock);
                    const variants = product.variants || [];
                    const isExpanded = expandedProduct === product.id;

                    return (
                      <div
                        key={product.id}
                        className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                      >
                        <div className="flex gap-3 p-3">
                          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                            {product.main_image ? (
                              <img
                                src={product.main_image}
                                alt={product.image_alt || product.name}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <ImageOff
                                  size={20}
                                  className="text-slate-300"
                                />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <h3 className="truncate text-sm font-semibold text-slate-800">
                              {product.name}
                            </h3>

                            <p className="mt-1 text-xs text-slate-400">
                              SKU: {product.sku || "—"}
                            </p>

                            <p className="mt-2 text-sm font-bold text-slate-800">
                              {formatPrice(
                                product.sale_price || product.price
                              )}
                            </p>

                            {product.sale_price &&
                              Number(product.sale_price) <
                                Number(product.price) && (
                                <p className="text-xs text-slate-400 line-through">
                                  {formatPrice(product.price)}
                                </p>
                              )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 border-t border-slate-100 bg-slate-50/70 p-3 text-xs">
                          <div>
                            <p className="text-slate-400">Category</p>
                            <p className="mt-1 font-medium text-slate-700">
                              {product.category_name || "Uncategorized"}
                            </p>
                          </div>

                          <div>
                            <p className="text-slate-400">Stock</p>

                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={
                                stockDrafts[product.id] ??
                                product.stock ??
                                0
                              }
                              onChange={(e) =>
                                setStockDrafts((previous) => ({
                                  ...previous,
                                  [product.id]: e.target.value,
                                }))
                              }
                              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-slate-500"
                            />

                            <button
                              onClick={() => handleStockUpdate(product)}
                              disabled={
                                updatingStock === product.id ||
                                Number(
                                  stockDrafts[product.id] ?? product.stock
                                ) === Number(product.stock)
                              }
                              className="mt-2 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
                            >
                              {updatingStock === product.id
                                ? "Saving..."
                                : "Save Stock"}
                            </button>
                          </div>

                          <div>
                            <p className="text-slate-400">Variants</p>
                            <p className="mt-1 font-medium text-slate-700">
                              {variants.length}
                            </p>
                          </div>

                          <div>
                            <p className="text-slate-400">Status</p>
                            <p
                              className={`mt-1 font-medium ${
                                Number(product.is_active) === 1
                                  ? "text-emerald-600"
                                  : "text-slate-500"
                              }`}
                            >
                              {Number(product.is_active) === 1
                                ? "Active"
                                : "Inactive"}
                            </p>
                          </div>
                        </div>

                        {/* MOBILE ACTIONS */}
                        <div className="flex items-center justify-between border-t border-slate-100 px-3 py-2.5">
                          <span
                            className={`rounded-full px-2 py-1 text-[11px] font-medium ${stockStatus.color}`}
                          >
                            {stockStatus.label}
                          </span>

                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => openEditProduct(product)}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700"
                            >
                              <Pencil size={13} />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product)}
                              disabled={deletingProduct === product.id}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 disabled:opacity-50"
                            >
                              <Trash2 size={13} />
                              {deletingProduct === product.id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                            <button
                              onClick={() =>
                                setExpandedProduct(
                                  isExpanded ? null : product.id
                                )
                              }
                              className="text-xs font-semibold text-slate-600 underline underline-offset-4"
                            >
                              {isExpanded ? "Hide Details" : "View Details"}
                            </button>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="border-t border-slate-100 p-3">
                            <ProductDetails product={product} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : null}

            {/* FOOTER */}
            {!loading && !error && filteredProducts.length > 0 && (
              <div className="flex flex-col gap-2 border-t border-slate-100 px-5 py-4 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  Showing {filteredProducts.length} of {products.length} products
                </span>
                <span>RIVELUNE Product Catalog</span>
              </div>
            )}
          </section>

          {/* PAGE FOOTER */}
          <footer className="flex flex-col gap-2 border-t border-slate-200 pt-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 RIVELUNE Admin Workspace</p>
            <p>Made for effortless store management.</p>
          </footer>
        </div>
      </main>

      {/* ADD / EDIT PRODUCT MODAL */}
      {showAddProduct && (
        <AdminAddProductModal
          product={selectedProduct}
          onClose={closeProductModal}
          onSuccess={handleProductSaved}
        />
      )}
    </div>
  );
};

export default AdminProducts;
