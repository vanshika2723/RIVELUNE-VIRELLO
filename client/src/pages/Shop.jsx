
import { useState, useMemo } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import {
  Heart,
  Search,
  SlidersHorizontal,
  ShoppingBag,
  ArrowUpDown,
  X,
} from "lucide-react";

import products from "../data/products";
import { useCart } from "../context/CartContext";

export default function Shop() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const { addToCart } = useCart();

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [maxPrice, setMaxPrice] = useState(50000);
  const [wishlist, setWishlist] = useState([]);
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || searchParams.get("q") || ""
  );
  const [showFilters, setShowFilters] = useState(false);

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

  // Wishlist toggle
  const toggleWishlist = (id) => {
    setWishlist((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  };

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
    <main className="bg-white min-h-screen text-black">

      {/* PAGE HEADER */}
      <section className="bg-[#f8f7f5] px-5 md:px-10 py-16 md:py-24">
        <div className="max-w-7xl mx-auto">

          <p className="text-[10px] tracking-[0.35em] uppercase text-gray-500 mb-5">
            RIVELUNE COLLECTION
          </p>

          <h1 className="text-4xl md:text-6xl font-light tracking-tight">
            {pageTitle}
          </h1>

          <p className="text-gray-500 text-sm mt-5 max-w-xl leading-7">
            Discover timeless essentials designed for everyday elegance.
            Thoughtfully crafted pieces, made to become part of your wardrobe.
          </p>

          <div className="flex gap-3 mt-8 flex-wrap">
            <Link
              to="/shop"
              className="px-6 py-3 bg-black text-white text-[11px] tracking-[0.15em] uppercase hover:bg-gray-800 transition"
            >
              Shop All
            </Link>

            <Link
              to="/shop/men"
              className="px-6 py-3 border border-black text-[11px] tracking-[0.15em] uppercase hover:bg-black hover:text-white transition"
            >
              Men
            </Link>

            <Link
              to="/shop/women"
              className="px-6 py-3 border border-black text-[11px] tracking-[0.15em] uppercase hover:bg-black hover:text-white transition"
            >
              Women
            </Link>
          </div>

        </div>
      </section>

      {/* SHOP SECTION */}
      <section className="max-w-7xl mx-auto px-5 md:px-10 py-12">

        {/* TOOLBAR */}
        <div className="flex flex-col gap-5 border-b border-gray-200 pb-6">

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

            {/* PRODUCT COUNT */}
            <p className="text-sm text-gray-500">
              Showing{" "}
              <span className="text-black font-medium">
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
                className="w-full border-b border-gray-300 py-3 pl-7 pr-8 text-sm outline-none focus:border-black transition"
              />

              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-0 top-1/2 -translate-y-1/2"
                >
                  <X size={16} />
                </button>
              )}
            </div>

          </div>

          {/* FILTERS */}
          <div className="flex flex-wrap justify-between items-center gap-4">

            {/* CATEGORY */}
            <div className="flex flex-wrap gap-2">

              {["All", "Men", "Women"].map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-5 py-2 text-[11px] uppercase tracking-[0.15em] border transition ${
                    selectedCategory === category
                      ? "bg-black text-white border-black"
                      : "bg-white text-black border-gray-300 hover:border-black"
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
                className="bg-white text-xs border border-gray-200 px-3 py-2 outline-none cursor-pointer"
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
            <div className="flex justify-between items-center mb-2">
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
              className="w-full accent-black cursor-pointer"
            />
          </div>

        </div>

        {/* PRODUCT GRID */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 md:gap-x-6 gap-y-10 mt-10">

            {filteredProducts.map((product) => {
              const productId = getProductId(product);

              return (
                <article
                  key={productId}
                  className="group"
                >

                  {/* IMAGE */}
                  <div className="relative overflow-hidden bg-[#f5f5f3] aspect-[3/4]">

                    <Link to={`/product/${productId}`}>
                      <img
                        src={getImage(product)}
                        alt={product.name}
                        className="w-full h-full object-cover transition duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                    </Link>

                    {/* WISHLIST */}
                    <button
                      onClick={() => toggleWishlist(productId)}
                      className="absolute top-3 right-3 bg-white w-9 h-9 rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition"
                      aria-label="Add to wishlist"
                    >
                      <Heart
                        size={17}
                        className={
                          wishlist.includes(productId)
                            ? "fill-red-500 text-red-500"
                            : "text-black"
                        }
                      />
                    </button>

                    {/* QUICK ADD */}
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="absolute bottom-0 left-0 right-0 bg-white/95 py-4 text-[10px] uppercase tracking-[0.2em] translate-y-full group-hover:translate-y-0 transition duration-300 flex items-center justify-center gap-2"
                    >
                      <ShoppingBag size={14} />
                      Add to Bag
                    </button>

                  </div>

                  {/* PRODUCT INFO */}
                  <div className="pt-4">

                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2">
                      {product.category}
                    </p>

                    <Link
                      to={`/product/${productId}`}
                      className="block text-sm font-medium hover:text-gray-500 transition"
                    >
                      {product.name}
                    </Link>

                    <p className="text-xs text-gray-500 mt-2">
                      {product.color || ""}
                    </p>

                    <div className="flex items-center gap-2 mt-3 flex-wrap">

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
                      className="inline-block text-[10px] uppercase tracking-[0.15em] border-b border-black pb-1 mt-4 hover:text-gray-500 hover:border-gray-500 transition"
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
              className="mx-auto text-gray-300 mb-5"
            />

            <h2 className="text-2xl font-light">
              No products found
            </h2>

            <p className="text-sm text-gray-500 mt-3">
              Try adjusting your search or filters.
            </p>

            <button
              onClick={clearFilters}
              className="mt-6 px-8 py-3 bg-black text-white text-xs uppercase tracking-widest hover:bg-gray-800 transition"
            >
              Clear Filters
            </button>

          </div>
        )}

      </section>

    </main>
  );
}
