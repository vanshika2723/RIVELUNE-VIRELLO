
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { useCart } from "../context/CartContext";

export default function Wishlist() {
  const {
    wishlistItems,
    removeFromWishlist,
    clearWishlist,
  } = useCart();

  const formatPrice = (price) =>
    `PKR ${Number(price).toLocaleString("en-PK")}`;

  return (
    <main className="min-h-screen bg-white px-4 py-12 text-stone-900 sm:px-8 lg:px-12">

      <div className="mx-auto max-w-[1300px]">

        <div className="mb-10 text-center">
          <p className="text-[10px] tracking-[4px] text-[#9a7651]">
            YOUR PERSONAL COLLECTION
          </p>

          <h1 className="mt-4 font-serif text-4xl sm:text-5xl">
            My Wishlist
          </h1>

          <p className="mt-4 text-sm text-stone-500">
            Your favorite pieces, all in one place.
          </p>

          <div className="mx-auto mt-6 h-px w-16 bg-[#9a7651]" />
        </div>

        {wishlistItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">

            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#f5f2ed]">
              <Heart size={32} strokeWidth={1.2} className="text-stone-500" />
            </div>

            <h2 className="mt-7 font-serif text-2xl">
              Your wishlist is empty
            </h2>

            <p className="mt-3 max-w-sm text-sm leading-6 text-stone-500">
              You haven't saved any pieces yet. Explore our collection
              and save the styles you love.
            </p>

            <Link
              to="/shop"
              className="mt-8 inline-flex items-center gap-3 bg-stone-900 px-8 py-4 text-[10px] tracking-[2px] text-white transition hover:bg-stone-700"
            >
              EXPLORE COLLECTION
              <ArrowRight size={15} />
            </Link>

          </div>
        ) : (
          <>
            <div className="mb-7 flex items-center justify-between border-b border-stone-200 pb-5">

              <p className="text-xs tracking-[1px] text-stone-500">
                {wishlistItems.length} SAVED{" "}
                {wishlistItems.length === 1 ? "ITEM" : "ITEMS"}
              </p>

              <button
                type="button"
                onClick={clearWishlist}
                className="text-[10px] tracking-[1px] text-stone-500 underline underline-offset-4 transition hover:text-red-600"
              >
                CLEAR WISHLIST
              </button>

            </div>

            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

              {wishlistItems.map((product) => {
                const productId = product.id ?? product._id;
                const image = product.images?.[0] || product.image;

                return (
                  <div key={productId} className="group">

                    <div className="relative overflow-hidden bg-[#f4f1ec]">

                      <Link to={`/product/${productId}`}>
                        <img
                          src={image}
                          alt={product.name}
                          className="h-[340px] w-full object-cover transition duration-700 group-hover:scale-105"
                        />
                      </Link>

                      <button
                        type="button"
                        onClick={() => removeFromWishlist(productId)}
                        aria-label="Remove from wishlist"
                        title="Remove from wishlist"
                        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-red-600 shadow-sm transition hover:bg-stone-900 hover:text-white"
                      >
                        <Trash2 size={16} />
                      </button>

                    </div>

                    <div className="pt-5">

                      <p className="text-[9px] tracking-[2px] text-stone-400">
                        {product.category}
                      </p>

                      <Link
                        to={`/product/${productId}`}
                        className="mt-2 block font-serif text-lg transition hover:text-[#9a7651]"
                      >
                        {product.name}
                      </Link>

                      <div className="mt-3 flex items-center justify-between">

                        <span className="text-sm font-medium">
                          {formatPrice(product.price)}
                        </span>

                        {product.color && (
                          <span className="text-xs text-stone-500">
                            {product.color}
                          </span>
                        )}

                      </div>

                      <Link
                        to={`/product/${productId}`}
                        className="mt-5 flex w-full items-center justify-center gap-2 border border-stone-300 py-3 text-[10px] tracking-[2px] transition hover:border-stone-900 hover:bg-stone-900 hover:text-white"
                      >
                        <ShoppingBag size={14} />
                        VIEW PRODUCT
                      </Link>

                    </div>

                  </div>
                );
              })}

            </div>
          </>
        )}

      </div>
    </main>
  );
}
