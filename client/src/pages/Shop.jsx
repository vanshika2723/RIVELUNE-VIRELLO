
import { useState, useMemo } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import {
  Heart,
  Search,
  ShoppingBag,
  ArrowUpDown,
  X,
} from "lucide-react";

import products from "../data/products";
import { useCart } from "../context/CartContext";

export default function Shop() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const { addToCart, toggleWishlist, isInWishlist } = useCart();

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [maxPrice, setMaxPrice] = useState(50000);
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || searchParams.get("q") || ""
  );

  // Determine page category from URL
  const currentPath = location.pathname.toLowerCase();

  const pageTitle = currentPath.includes("/men")
    ? "Men's Collection"
    : currentPath.includes("/women")
    ? "Women's Collection"
    : currentPath.includes("/new-arrivals")
    ? "New Arrivals"
    : "Shop All";

  // Category selection from route
  const routeCategory = currentPath.includes("/men")
    ? "Men"
    : currentPath.includes("/women")
    ? "Women"
    : "All";

  // Normalize categories
  const normalizeCategory = (category = "") => {
    const value = category.toLowerCase();

    if (value.includes("men") && !value.includes("women")) {
      return "Men";
    }

    if (value.includes("women")) {
      return "Women";
    }

    return category;
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    const categoryToApply =
      selectedCategory !== "All" ? selectedCategory : routeCategory;

    if (categoryToApply !== "All") {
      result = result.filter(
        (product) =>
          normalizeCategory(product.category) === categoryToApply
      );
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();

      result = result.filter((product) => {
        return (
          product.name?.toLowerCase().includes(query) ||
          product.category?.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query) ||
          product.color?.toLowerCase().includes(query) ||
          product.fabric?.toLowerCase().includes(query)
        );
      });
    }

    // Price filter
    result = result.filter(
      (product) => Number(product.price) <= maxPrice
    );

    // Sorting
    if (sortBy === "price-low") {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    }

    if (sortBy === "price-high") {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    }

    if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    if (sortBy === "newest") {
      result.reverse();
    }

    return result;
  }, [
    selectedCategory,
    routeCategory,
    searchQuery,
    maxPrice,
    sortBy,
  ]);

  // Add to cart
  const handleAddToCart = (product) => {
    addToCart(product);
  };

  // Price format
  const formatPrice = (price) => {
    return `PKR ${Number(price).toLocaleString("en-PK")}`;
  };

  // Product image helper
  const getImage = (product) => {
    return (
      product.images?.[0] ||
      product.image ||
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80"
    );
  };

  // Product ID helper
  const getProductId = (product) => {
    return product.id || product._id;
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedCategory("All");
    setSearchQuery("");
    setMaxPrice(50000);
    setSortBy("featured");
    setSearchParams({});
  };

  return (
    <main className="min-h-screen bg-white text-black">

      {/* PAGE HEADER */}
      <section className="bg-[#f8f7f5] px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-7xl">

          <p className="mb-5 text-[10px] uppercase tracking-[0.35em] text-gray-500">
            RIVELUNE COLLECTION
          </p>

          <h1 className="text-4xl font-light tracking-tight md:text-6xl">
            {pageTitle}
          </h1>

          <p className="mt-5 max-w-xl text-sm leading-7 text-gray-500">
            Discover timeless essentials designed for everyday elegance.
            Thoughtfully crafted pieces, made to become part of your wardrobe.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/shop"
              className="bg-black px-6 py-3 text-[11px] uppercase tracking-[0.15em] text-white transition hover:bg-gray-800"
            >
              Shop All
            </Link>

            <Link
              to="/shop/men"
              className="border border-black px-6 py-3 text-[11px] uppercase tracking-[0.15em] transition hover:bg-black hover:text-white"
            >
              Men
            </Link>

            <Link
              to="/shop/women"
              className="border border-black px-6 py-3 text-[11px] uppercase tracking-[0.15em] transition hover:bg-black hover:text-white"
            >
              Women
            </Link>
          </div>

        </div>
      </section>

      {/* SHOP SECTION */}
      <section className="mx-auto max-w-7xl px-5 py-12 md:px-10">

        {/* TOOLBAR */}
        <div className="flex flex-col gap-5 border-b border-gray-200 pb-6">

          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">

            <p className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-medium text-black">
                {filteredProducts.length}
              </span>{" "}
              products
            </p>

            {/* SEARCH */}
            <div className="relative w-full md:w-80">
              <Search
                size={17}
                className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border-b border-gray-300 py-3 pl-7 pr-8 text-sm outline-none transition focus:border-black"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-0 top-1/2 -translate-y-1/2"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

          </div>

          {/* FILTERS */}
          <div className="flex flex-wrap items-center justify-between gap-4">

            {/* CATEGORY */}
            <div className="flex flex-wrap gap-2">
              {["All", "Men", "Women"].map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`border px-5 py-2 text-[11px] uppercase tracking-[0.15em] transition ${
                    selectedCategory === category
                      ? "border-black bg-black text-white"
                      : "border-gray-300 bg-white text-black hover:border-black"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* SORT */}
            <div className="flex items-center gap-3">
              <ArrowUpDown size={15} className="text-gray-500" />

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="cursor-pointer border border-gray-200 bg-white px-3 py-2 text-xs outline-none"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>

          </div>

          {/* PRICE FILTER */}
          <div className="max-w-xs">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-[11px] uppercase tracking-wider text-gray-500">
                Maximum Price
              </label>

              <span className="text-xs font-medium">
                PKR {maxPrice.toLocaleString("en-PK")}
              </span>
            </div>

            <input
              type="range"
              min="1000"
              max="50000"
              step="500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full cursor-pointer accent-black"
            />
          </div>

        </div>

        {/* PRODUCT GRID */}
        {filteredProducts.length > 0 ? (
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">

            {filteredProducts.map((product) => {
              const productId = getProductId(product);
              const saved = isInWishlist(productId);

              return (
                <article key={productId} className="group">

                  {/* IMAGE */}
                  <div className="relative aspect-[3/4] overflow-hidden bg-[#f5f5f3]">

                    <Link to={`/product/${productId}`}>
                      <img
                        src={getImage(product)}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                    </Link>

                    {/* WISHLIST */}
                    <button
                      type="button"
                      onClick={() => toggleWishlist(product)}
                      className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm transition hover:scale-110"
                      aria-label={
                        saved
                          ? `Remove ${product.name} from wishlist`
                          : `Add ${product.name} to wishlist`
                      }
                      title={saved ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      <Heart
                        size={17}
                        className={
                          saved
                            ? "fill-red-500 text-red-500"
                            : "text-black"
                        }
                      />
                    </button>

                    {/* QUICK ADD */}
                    <button
                      type="button"
                      onClick={() => handleAddToCart(product)}
                      className="absolute bottom-0 left-0 right-0 flex translate-y-full items-center justify-center gap-2 bg-white/95 py-4 text-[10px] uppercase tracking-[0.2em] transition duration-300 group-hover:translate-y-0"
                    >
                      <ShoppingBag size={14} />
                      Add to Bag
                    </button>

                  </div>

                  {/* PRODUCT INFO */}
                  <div className="pt-4">

                    <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-gray-400">
                      {product.category}
                    </p>

                    <Link
                      to={`/product/${productId}`}
                      className="block text-sm font-medium transition hover:text-gray-500"
                    >
                      {product.name}
                    </Link>

                    <p className="mt-2 text-xs text-gray-500">
                      {product.color || ""}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2">

                      <span className="text-sm font-medium">
                        {formatPrice(product.price)}
                      </span>

                      {product.oldPrice && (
                        <span className="text-xs text-gray-400 line-through">
                          {formatPrice(product.oldPrice)}
                        </span>
                      )}

                    </div>

                    {/* VIEW PRODUCT */}
                    <Link
                      to={`/product/${productId}`}
                      className="mt-4 inline-block border-b border-black pb-1 text-[10px] uppercase tracking-[0.15em] transition hover:border-gray-500 hover:text-gray-500"
                    >
                      View Product
                    </Link>

                  </div>

                </article>
              );
            })}

          </div>
        ) : (

          /* EMPTY STATE */
          <div className="py-24 text-center">

            <Search
              size={32}
              className="mx-auto mb-5 text-gray-300"
            />

            <h2 className="text-2xl font-light">
              No products found
            </h2>

            <p className="mt-3 text-sm text-gray-500">
              Try adjusting your search or filters.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-6 bg-black px-8 py-3 text-xs uppercase tracking-widest text-white transition hover:bg-gray-800"
            >
              Clear Filters
            </button>

          </div>
        )}

      </section>

    </main>
  );
}
