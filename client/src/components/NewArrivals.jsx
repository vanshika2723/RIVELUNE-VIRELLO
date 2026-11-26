
import { ArrowRight, Heart, Eye, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

import products from "../data/products";
import { useCart } from "../context/CartContext";

const formatPrice = (price) =>
  `PKR ${Number(price).toLocaleString("en-PK")}`;

export default function NewArrivals() {
  const [wishlist, setWishlist] = useState([]);

  const { addToCart } = useCart();

  const handleWishlist = (id) => {
    setWishlist((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  return (
    <section className="bg-[#faf9f7] px-5 py-16 sm:px-8 md:px-12 md:py-24 lg:px-20">

      {/* SECTION HEADER */}
      <div className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end md:mb-14">

        <div>
          <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.35em] text-[#9a8170] md:text-xs">
            Freshly Released
          </p>

          <h2 className="font-serif text-4xl font-light tracking-tight text-[#25221f] sm:text-5xl md:text-6xl">
            New arrivals.
          </h2>

          <p className="mt-4 text-sm text-[#77716b] md:text-base">
            The latest additions to your everyday wardrobe.
          </p>
        </div>

        {/* VIEW ALL */}
        <Link
          to="/shop/new-arrivals"
          className="group flex w-fit items-center gap-3 border-b border-black pb-2 text-[10px] font-medium tracking-[0.2em] text-[#25221f] transition-colors hover:text-[#9a8170] md:text-xs"
        >
          VIEW ALL

          <ArrowRight
            size={16}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </Link>

      </div>

      {/* PRODUCTS GRID */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-7 lg:gap-y-12">

        {products.slice(0, 8).map((product, index) => {
          const productId = product.id || product._id;
          const isWishlisted = wishlist.includes(productId);

          const productImage =
            product.images?.[0] ||
            product.image ||
            "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80";

          return (
            <article
              key={productId}
              className="group min-w-0"
            >

              {/* PRODUCT IMAGE */}
              <div className="relative mb-4 aspect-[3/4] overflow-hidden bg-[#eeeae5]">

                <Link
                  to={`/product/${productId}`}
                  className="block h-full w-full"
                >
                  <img
                    src={productImage}
                    alt={product.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />

                  {/* IMAGE OVERLAY */}
                  <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
                </Link>

                {/* BADGES */}
                <div className="absolute left-3 top-3 flex flex-col gap-2">

                  {index < 2 && (
                    <span className="bg-white px-3 py-1.5 text-[9px] font-medium tracking-[0.15em] text-black">
                      NEW
                    </span>
                  )}

                  {product.oldPrice && (
                    <span className="bg-[#25221f] px-3 py-1.5 text-[9px] font-medium tracking-[0.15em] text-white">
                      SALE
                    </span>
                  )}

                </div>

                {/* WISHLIST */}
                <button
                  onClick={() => handleWishlist(productId)}
                  aria-label={
                    isWishlisted
                      ? "Remove from wishlist"
                      : "Add to wishlist"
                  }
                  className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white transition-all duration-300 hover:scale-110 ${
                    isWishlisted
                      ? "text-red-500"
                      : "text-[#25221f]"
                  }`}
                >
                  <Heart
                    size={17}
                    strokeWidth={1.5}
                    fill={isWishlisted ? "currentColor" : "none"}
                  />
                </button>

                {/* QUICK VIEW */}
                <Link
                  to={`/product/${productId}`}
                  className="absolute bottom-14 left-3 right-3 hidden translate-y-3 items-center justify-center gap-2 bg-white/95 py-3 text-[10px] font-medium tracking-[0.18em] text-black opacity-0 transition-all duration-300 hover:bg-black hover:text-white group-hover:flex group-hover:translate-y-0 group-hover:opacity-100"
                >
                  <Eye size={15} />
                  QUICK VIEW
                </Link>

                {/* QUICK ADD TO CART */}
                <button
                  onClick={() => handleAddToCart(product)}
                  className="absolute bottom-0 left-0 right-0 hidden translate-y-full items-center justify-center gap-2 bg-white py-3.5 text-[10px] font-medium tracking-[0.18em] text-black transition-all duration-300 hover:bg-black hover:text-white group-hover:flex group-hover:translate-y-0"
                >
                  <ShoppingBag size={15} />
                  ADD TO BAG
                </button>

              </div>

              {/* PRODUCT DETAILS */}
              <Link
                to={`/product/${productId}`}
                className="block"
              >

                <p className="mb-2 text-[9px] uppercase tracking-[0.18em] text-[#9a8170] sm:text-[10px]">
                  {product.category}
                </p>

                <h3 className="line-clamp-1 text-xs font-medium text-[#25221f] transition-colors group-hover:text-[#9a8170] sm:text-sm">
                  {product.name}
                </h3>

                <p className="mt-1.5 text-[10px] text-[#77716b] sm:text-xs">
                  {product.color}
                </p>

                {/* PRICE */}
                <div className="mt-3 flex flex-wrap items-center gap-2">

                  <span
                    className={`text-xs font-medium sm:text-sm ${
                      product.oldPrice
                        ? "text-[#a05242]"
                        : "text-[#25221f]"
                    }`}
                  >
                    {formatPrice(product.price)}
                  </span>

                  {product.oldPrice && (
                    <span className="text-[10px] text-[#999] line-through sm:text-xs">
                      {formatPrice(product.oldPrice)}
                    </span>
                  )}

                </div>

              </Link>

            </article>
          );
        })}

      </div>

      {/* BOTTOM CTA */}
      <div className="mt-14 flex justify-center md:mt-20">

        <Link
          to="/shop"
          className="group flex items-center gap-4 border border-[#25221f] px-8 py-4 text-[10px] font-medium tracking-[0.2em] text-[#25221f] transition-all duration-300 hover:bg-[#25221f] hover:text-white sm:px-10 sm:text-xs"
        >
          EXPLORE ALL COLLECTIONS

          <ArrowRight
            size={16}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </Link>

      </div>

    </section>
  );
}
