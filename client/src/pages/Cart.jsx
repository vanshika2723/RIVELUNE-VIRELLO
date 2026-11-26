
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Trash2,
  ShoppingBag,
  ShieldCheck,
  Truck,
  Plus,
  Minus,
} from "lucide-react";
import { useCart } from "../context/CartContext";

const formatPrice = (price) =>
  `PKR ${Number(price || 0).toLocaleString("en-PK")}`;

export default function Cart() {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    cartTotal,
  } = useCart();

  const shipping = cartTotal >= 10000 ? 0 : 500;
  const grandTotal = cartTotal + shipping;

  const totalItems = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  // EMPTY CART
  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen bg-[#faf9f6] px-4 py-16 flex items-center justify-center">

        <div className="w-full max-w-lg rounded-2xl border border-[#eeeae3] bg-white px-6 py-14 text-center shadow-sm">

          <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-full bg-[#f3eee5]">
            <ShoppingBag
              size={35}
              strokeWidth={1.2}
              className="text-[#a58b65]"
            />
          </div>

          <span className="text-xs font-semibold tracking-[0.3em] text-[#a58b65]">
            YOUR SHOPPING BAG
          </span>

          <h1 className="mt-5 font-serif text-3xl sm:text-4xl text-[#25231f]">
            Your bag is waiting.
          </h1>

          <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-gray-500">
            Looks like you haven't found your favorites yet.
            Discover something that feels like you.
          </p>

          <Link
            to="/"
            className="mt-9 inline-flex items-center justify-center gap-3 rounded-full bg-[#25231f] px-8 py-4 text-xs font-semibold tracking-[0.2em] text-white transition duration-300 hover:bg-[#a58b65]"
          >
            EXPLORE COLLECTION
            <ArrowRight size={16} />
          </Link>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf9f6] px-4 py-10 sm:px-6 lg:px-10">

      <div className="mx-auto max-w-7xl">

        {/* BREADCRUMB */}
        <div className="mb-10 text-[10px] font-semibold tracking-[0.2em] text-gray-400">
          <Link to="/" className="transition hover:text-[#a58b65]">
            HOME
          </Link>
          <span className="mx-3">/</span>
          <span className="text-[#a58b65]">
            YOUR SHOPPING BAG
          </span>
        </div>

        {/* PAGE HEADING */}
        <div className="mb-10 flex flex-col justify-between gap-5 border-b border-[#e8e4dc] pb-8 sm:flex-row sm:items-end">

          <div>
            <span className="text-xs font-semibold tracking-[0.3em] text-[#a58b65]">
              RIVELUNE COLLECTION
            </span>

            <h1 className="mt-4 font-serif text-4xl text-[#25231f] sm:text-5xl">
              Your Shopping Bag
            </h1>

            <p className="mt-3 text-sm text-gray-500">
              Review your selections before checking out.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <ShoppingBag
              size={20}
              className="text-[#a58b65]"
            />

            <span className="text-xs font-semibold tracking-[0.15em] text-gray-500">
              {totalItems} {totalItems === 1 ? "ITEM" : "ITEMS"}
            </span>
          </div>

        </div>

        {/* MAIN LAYOUT */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_380px]">

          {/* CART ITEMS */}
          <section className="rounded-2xl border border-[#eeeae3] bg-white p-5 sm:p-8">

            {/* TABLE HEADING */}
            <div className="mb-6 hidden grid-cols-[1fr_130px_110px] gap-4 border-b border-[#eeeae3] pb-5 text-[10px] font-semibold tracking-[0.2em] text-gray-400 md:grid">
              <span>PRODUCT</span>
              <span className="text-center">QUANTITY</span>
              <span className="text-right">TOTAL</span>
            </div>

            {/* PRODUCT LIST */}
            <div className="divide-y divide-[#eeeae3]">

              {cartItems.map((item) => (
                <article
                  className="grid grid-cols-1 gap-5 py-7 first:pt-0 last:pb-0 sm:grid-cols-[1fr_auto] md:grid-cols-[1fr_130px_110px] md:items-center md:gap-4"
                  key={`${item.id}-${item.size}-${item.color}`}
                >

                  {/* PRODUCT DETAILS */}
                  <div className="flex min-w-0 gap-4">

                    <Link
                      to={`/product/${item.id}`}
                      className="h-32 w-24 shrink-0 overflow-hidden rounded-lg bg-[#f3eee5] sm:h-36 sm:w-28"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover transition duration-500 hover:scale-105"
                      />
                    </Link>

                    <div className="flex min-w-0 flex-col items-start py-1">

                      <span className="text-[9px] font-semibold tracking-[0.2em] text-[#a58b65]">
                        RIVELUNE ESSENTIALS
                      </span>

                      <Link
                        to={`/product/${item.id}`}
                        className="mt-2 font-serif text-lg text-[#25231f] transition hover:text-[#a58b65]"
                      >
                        {item.name}
                      </Link>

                      <p className="mt-2 text-xs text-gray-500">
                        Color: {item.color}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Size: {item.size}
                      </p>

                      <span className="mt-2 text-sm font-semibold text-[#25231f]">
                        {formatPrice(item.price)}
                      </span>

                      <button
                        onClick={() =>
                          removeFromCart(item.id, item.size)
                        }
                        className="mt-3 inline-flex items-center gap-2 text-[10px] font-semibold tracking-wider text-gray-400 transition hover:text-red-500"
                      >
                        <Trash2 size={13} />
                        REMOVE
                      </button>

                    </div>
                  </div>

                  {/* QUANTITY */}
                  <div className="flex items-center justify-between md:justify-center">

                    <span className="text-[10px] font-semibold tracking-wider text-gray-400 md:hidden">
                      QUANTITY
                    </span>

                    <div className="flex items-center rounded-full border border-[#e8e4dc] bg-[#fdfcfb]">

                      <button
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            item.size,
                            item.quantity - 1
                          )
                        }
                        disabled={item.quantity <= 1}
                        aria-label="Decrease quantity"
                        className="flex h-9 w-9 items-center justify-center text-gray-500 transition hover:text-[#a58b65] disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <Minus size={13} />
                      </button>

                      <span className="w-8 text-center text-sm font-semibold text-[#25231f]">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            item.size,
                            item.quantity + 1
                          )
                        }
                        aria-label="Increase quantity"
                        className="flex h-9 w-9 items-center justify-center text-gray-500 transition hover:text-[#a58b65]"
                      >
                        <Plus size={13} />
                      </button>

                    </div>
                  </div>

                  {/* ITEM TOTAL */}
                  <div className="flex items-center justify-between md:justify-end">

                    <span className="text-[10px] font-semibold tracking-wider text-gray-400 md:hidden">
                      TOTAL
                    </span>

                    <span className="text-sm font-semibold text-[#25231f]">
                      {formatPrice(item.price * item.quantity)}
                    </span>

                  </div>

                </article>
              ))}

            </div>

            {/* CONTINUE SHOPPING */}
            <div className="mt-8 border-t border-[#eeeae3] pt-6">

              <Link
                to="/"
                className="inline-flex items-center gap-3 text-xs font-semibold tracking-[0.15em] text-gray-500 transition hover:text-[#a58b65]"
              >
                <ArrowLeft size={15} />
                CONTINUE SHOPPING
              </Link>

            </div>

          </section>

          {/* ORDER SUMMARY */}
          <aside className="lg:sticky lg:top-8">

            <div className="overflow-hidden rounded-2xl border border-[#eeeae3] bg-white shadow-sm">

              <div className="border-b border-[#eeeae3] p-6">

                <h2 className="font-serif text-2xl text-[#25231f]">
                  Order Summary
                </h2>

                <p className="mt-2 text-xs text-gray-400">
                  Your order at a glance.
                </p>

              </div>

              <div className="space-y-5 p-6">

                {/* SUBTOTAL */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    Subtotal ({totalItems} items)
                  </span>

                  <span className="font-medium text-[#25231f]">
                    {formatPrice(cartTotal)}
                  </span>
                </div>

                {/* SHIPPING */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    Shipping
                  </span>

                  <span className="font-medium text-[#25231f]">
                    {shipping === 0 ? "FREE" : formatPrice(shipping)}
                  </span>
                </div>

                {/* SHIPPING HINT */}
                {shipping > 0 && (
                  <div className="rounded-lg bg-[#faf8f4] p-4">

                    <div className="flex items-start gap-3">
                      <Truck
                        size={17}
                        className="mt-0.5 shrink-0 text-[#a58b65]"
                      />

                      <p className="text-xs leading-6 text-[#987b53]">
                        Add {formatPrice(10000 - cartTotal)} more
                        for complimentary shipping.
                      </p>
                    </div>

                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#e9e1d4]">
                      <div
                        className="h-full rounded-full bg-[#a58b65] transition-all duration-300"
                        style={{
                          width: `${Math.min(
                            (cartTotal / 10000) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>

                  </div>
                )}

                {shipping === 0 && (
                  <div className="rounded-lg bg-[#f5f6f1] p-3">
                    <p className="text-xs font-medium text-[#66765c]">
                      Complimentary shipping unlocked!
                    </p>
                  </div>
                )}

                {/* DIVIDER */}
                <div className="border-t border-dashed border-[#e8e4dc]" />

                {/* GRAND TOTAL */}
                <div className="flex items-center justify-between">
                  <span className="font-serif text-xl text-[#25231f]">
                    Total
                  </span>

                  <strong className="text-xl text-[#a58b65]">
                    {formatPrice(grandTotal)}
                  </strong>
                </div>

                <p className="text-[10px] leading-5 text-gray-400">
                  Inclusive of applicable taxes.
                </p>

                {/* CHECKOUT BUTTON */}
                <Link
                  to="/checkout"
                  className="flex w-full items-center justify-center gap-3 rounded-full bg-[#25231f] px-5 py-4 text-xs font-semibold tracking-[0.15em] text-white transition duration-300 hover:bg-[#a58b65]"
                >
                  PROCEED TO CHECKOUT
                  <ArrowRight size={16} />
                </Link>

                {/* TRUST */}
                <div className="flex items-center justify-center gap-2 pt-2 text-xs text-gray-400">
                  <ShieldCheck size={16} className="text-[#a58b65]" />
                  Secure checkout · Easy shopping
                </div>

              </div>
            </div>

            {/* SHIPPING INFORMATION */}
            <div className="mt-5 flex items-center gap-3 rounded-xl border border-[#eeeae3] bg-white p-4">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f3eee5]">
                <Truck size={19} className="text-[#a58b65]" />
              </div>

              <div>
                <p className="text-xs font-semibold text-[#25231f]">
                  Complimentary Delivery
                </p>

                <p className="mt-1 text-[10px] text-gray-400">
                  On all orders above PKR 10,000.
                </p>
              </div>

            </div>

          </aside>

        </div>
      </div>
    </main>
  );
}
