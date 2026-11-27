
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingBag,
  ShieldCheck,
  LoaderCircle,
  Truck,
  CreditCard,
  CheckCircle2,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import WalletPaymentProof from "../components/WalletPaymentProof";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const formatPrice = (price) =>
  `PKR ${Number(price || 0).toLocaleString("en-PK")}`;

export default function Checkout() {
const {
  cartItems,
  cartTotal,
  cartCount,
  clearCart,
  appliedCoupon,
  discountAmount,
  discountedTotal,
} = useCart();

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(false);
  const [orderMessage, setOrderMessage] = useState("");
  const [placedOrder, setPlacedOrder] = useState(null);

  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    province: "",
    city: "",
    postal_code: "",
    address: "",
    order_notes: "",
  });

 // SHIPPING
const shippingFee =
  cartTotal >= 10000 ? 0 : cartItems.length > 0 ? 500 : 0;

// FINAL TOTAL AFTER COUPON
const grandTotal = discountedTotal + shippingFee;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setCustomer((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    setOrderMessage("");

    if (!cartItems.length) {
      setOrderMessage("Your shopping bag is empty.");
      return;
    }

    setLoading(true);

  const payload = {
  customer,
  payment_method: paymentMethod,

  // PRICE DETAILS
  subtotal_amount: cartTotal,
  coupon_code: appliedCoupon?.code || null,
  discount_amount: discountAmount,
  shipping_fee: shippingFee,
  total_amount: grandTotal,

  items: cartItems.map((item) => ({
    product_id: item.id,
    product_name: item.name,
    product_image: item.image,
    size: item.size,
    color: item.color,
    quantity: item.quantity,
    unit_price: item.price,
  })),
};

console.log("ORDER PAYLOAD:", payload);
console.table(payload.items);
console.log("ORDER PAYLOAD:", payload);
console.table(payload.items);
    try {
      const response = await fetch(`${API_URL}/orders`, {

        
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Order could not be placed."
        );
      }

      setPlacedOrder(data.order);
      clearCart();
    } catch (error) {
      setOrderMessage(
        error.message || "Unable to place order. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // SUCCESS SCREEN
  if (placedOrder) {
    return (
      <main className="min-h-screen bg-[#faf9f6] px-4 py-12 flex items-center justify-center">
        <div className="w-full max-w-xl rounded-2xl bg-white p-6 sm:p-10 shadow-xl shadow-black/5 border border-[#eeeae3] text-center">

          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#edf5ed]">
            <CheckCircle2 size={42} className="text-[#54785b]" />
          </div>

          <span className="text-xs font-semibold tracking-[0.3em] text-[#a58b65]">
            RIVELUNE ORDER CONFIRMATION
          </span>

          <h1 className="mt-4 text-3xl sm:text-4xl font-serif text-[#25231f]">
            Thank you for your order.
          </h1>

          <p className="mt-3 text-sm text-gray-500">
            Your order has been submitted successfully.
          </p>

          <div className="mt-8 rounded-xl border border-[#e9e3d9] bg-[#faf9f6] p-5">
            <p className="text-xs tracking-widest text-gray-500">
              ORDER NUMBER
            </p>
            <h2 className="mt-2 text-xl font-bold tracking-wider">
              {placedOrder.order_number}
            </h2>
          </div>

          <div className="mt-6 space-y-4 text-left">
            <div className="flex justify-between gap-3 text-sm">
              <span className="text-gray-500">Payment</span>
              <strong>
                {placedOrder.payment_method === "cod"
                  ? "Cash on Delivery"
                  : placedOrder.payment_method === "easypaisa"
                  ? "Easypaisa"
                  : "JazzCash"}
              </strong>
            </div>

            <div className="flex justify-between gap-3 text-sm">
              <span className="text-gray-500">Order Total</span>
              <strong>
                {formatPrice(placedOrder.total_amount)}
              </strong>
            </div>

            <div className="flex justify-between gap-3 text-sm">
              <span className="text-gray-500">Status</span>
              <strong>{placedOrder.order_status}</strong>
            </div>
          </div>

          <p className="mt-6 text-xs leading-6 text-gray-500">
            Please save your order number to track your order later.
          </p>

          {["easypaisa", "jazzcash"].includes(
            placedOrder.payment_method
          ) && (
            <div className="mt-6 text-left">
              <WalletPaymentProof
                order={placedOrder}
                phone={customer.phone}
              />
            </div>
          )}

          <Link
            to="/"
            className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-[#25231f] px-6 py-4 text-xs font-semibold tracking-[0.2em] text-white transition hover:bg-[#a58b65]"
          >
            CONTINUE SHOPPING
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf9f6] px-4 py-10 sm:px-6 lg:px-10">

      {/* HEADER */}
      <div className="mx-auto mb-12 max-w-7xl text-center">
        <span className="text-xs font-semibold tracking-[0.35em] text-[#a58b65]">
          RIVELUNE CHECKOUT
        </span>

        <h1 className="mt-4 font-serif text-4xl sm:text-5xl text-[#25231f]">
          Almost yours.
        </h1>

        <p className="mt-3 text-sm text-gray-500">
          Complete your details to place your order.
        </p>

        <div className="mx-auto mt-7 h-px w-20 bg-[#c3ad8d]" />
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_410px]">

        {/* LEFT SECTION */}
        <div className="space-y-8">

          {/* DELIVERY INFORMATION */}
          <section className="rounded-2xl border border-[#eeeae3] bg-white p-5 sm:p-8">

            <div className="mb-8 flex items-center gap-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f3eee5] text-sm font-semibold text-[#a58b65]">
                01
              </span>

              <div>
                <h2 className="font-serif text-2xl text-[#25231f]">
                  Delivery Information
                </h2>
                <p className="mt-1 text-xs text-gray-400">
                  Where should we deliver your order?
                </p>
              </div>
            </div>

            <form
              id="checkout-form"
              onSubmit={handlePlaceOrder}
              className="space-y-5"
            >

              {/* NAME */}
              <div>
                <label className="mb-2 block text-xs font-semibold tracking-wide text-gray-700">
                  Full Name *
                </label>

                <input
                  type="text"
                  name="name"
                  value={customer.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  required
                  className="w-full rounded-lg border border-[#e8e4dc] bg-[#fdfcfb] px-4 py-3.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#a58b65] focus:ring-2 focus:ring-[#a58b65]/10"
                />
              </div>

              {/* PHONE AND EMAIL */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-semibold text-gray-700">
                    Phone Number *
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={customer.phone}
                    onChange={handleChange}
                    placeholder="+92 3XX XXXXXXX"
                    autoComplete="tel"
                    pattern="(\+92|0)?3[0-9]{9}"
                    title="Enter a valid Pakistan mobile number"
                    required
                    className="w-full rounded-lg border border-[#e8e4dc] bg-[#fdfcfb] px-4 py-3.5 text-sm outline-none focus:border-[#a58b65] focus:ring-2 focus:ring-[#a58b65]/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-gray-700">
                    Email Address
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={customer.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full rounded-lg border border-[#e8e4dc] bg-[#fdfcfb] px-4 py-3.5 text-sm outline-none focus:border-[#a58b65] focus:ring-2 focus:ring-[#a58b65]/10"
                  />
                </div>
              </div>

              {/* PROVINCE */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-gray-700">
                  Province *
                </label>

                <select
                  name="province"
                  value={customer.province}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-[#e8e4dc] bg-[#fdfcfb] px-4 py-3.5 text-sm outline-none focus:border-[#a58b65]"
                >
                  <option value="">Select province</option>
                  <option>Punjab</option>
                  <option>Sindh</option>
                  <option>Khyber Pakhtunkhwa</option>
                  <option>Balochistan</option>
                  <option>Islamabad Capital Territory</option>
                  <option>Gilgit-Baltistan</option>
                  <option>Azad Jammu & Kashmir</option>
                </select>
              </div>

              {/* CITY AND POSTAL CODE */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-semibold text-gray-700">
                    City *
                  </label>

                  <input
                    type="text"
                    name="city"
                    value={customer.city}
                    onChange={handleChange}
                    placeholder="Your city"
                    autoComplete="address-level2"
                    required
                    className="w-full rounded-lg border border-[#e8e4dc] bg-[#fdfcfb] px-4 py-3.5 text-sm outline-none focus:border-[#a58b65]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-gray-700">
                    Postal Code
                  </label>

                  <input
                    type="text"
                    name="postal_code"
                    value={customer.postal_code}
                    onChange={handleChange}
                    placeholder="Postal code"
                    autoComplete="postal-code"
                    className="w-full rounded-lg border border-[#e8e4dc] bg-[#fdfcfb] px-4 py-3.5 text-sm outline-none focus:border-[#a58b65]"
                  />
                </div>
              </div>

              {/* ADDRESS */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-gray-700">
                  Complete Address *
                </label>

                <textarea
                  name="address"
                  value={customer.address}
                  onChange={handleChange}
                  rows="3"
                  placeholder="House no., street, area, landmark..."
                  autoComplete="street-address"
                  required
                  className="w-full resize-none rounded-lg border border-[#e8e4dc] bg-[#fdfcfb] px-4 py-3.5 text-sm outline-none focus:border-[#a58b65]"
                />
              </div>

              {/* NOTES */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-gray-700">
                  Order Notes (Optional)
                </label>

                <textarea
                  name="order_notes"
                  value={customer.order_notes}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Any special delivery instructions?"
                  className="w-full resize-none rounded-lg border border-[#e8e4dc] bg-[#fdfcfb] px-4 py-3.5 text-sm outline-none focus:border-[#a58b65]"
                />
              </div>
            </form>
          </section>

          {/* PAYMENT METHOD */}
          <section className="rounded-2xl border border-[#eeeae3] bg-white p-5 sm:p-8">

            <div className="mb-7 flex items-center gap-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f3eee5] text-sm font-semibold text-[#a58b65]">
                02
              </span>

              <div>
                <h2 className="font-serif text-2xl text-[#25231f]">
                  Payment Method
                </h2>
                <p className="mt-1 text-xs text-gray-400">
                  Choose your preferred payment option.
                </p>
              </div>
            </div>

            <div className="space-y-3">

              {[
                {
                  id: "cod",
                  title: "Cash on Delivery",
                  description: "Pay when your order arrives.",
                  icon: Truck,
                },
                {
                  id: "easypaisa",
                  title: "Easypaisa",
                  description: "Transfer using your Easypaisa wallet.",
                  icon: CreditCard,
                },
                {
                  id: "jazzcash",
                  title: "JazzCash",
                  description: "Pay using your JazzCash wallet.",
                  icon: CreditCard,
                },
              ].map((method) => {
                const Icon = method.icon;

                return (
                  <label
                    key={method.id}
                    className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition ${
                      paymentMethod === method.id
                        ? "border-[#a58b65] bg-[#faf8f4] ring-1 ring-[#a58b65]"
                        : "border-[#eeeae3] hover:border-[#c9b79e]"
                    }`}
                  >
                    <input
                      form="checkout-form"
                      type="radio"
                      name="payment"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={(e) =>
                        setPaymentMethod(e.target.value)
                      }
                      className="h-4 w-4 accent-[#a58b65]"
                    />

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#f3eee5] text-[#a58b65]">
                      <Icon size={20} />
                    </div>

                    <div className="flex-1">
                      <strong className="text-sm text-[#25231f]">
                        {method.title}
                      </strong>
                      <p className="mt-1 text-xs text-gray-500">
                        {method.description}
                      </p>
                    </div>

                    {paymentMethod === method.id && (
                      <CheckCircle2
                        size={19}
                        className="text-[#a58b65]"
                      />
                    )}
                  </label>
                );
              })}
            </div>

            {/* WALLET INSTRUCTIONS */}
            {paymentMethod !== "cod" && (
              <div className="mt-6 rounded-xl border border-[#e9e1d4] bg-[#faf8f4] p-5">

                <h3 className="font-serif text-xl text-[#25231f]">
                  {paymentMethod === "easypaisa"
                    ? "Easypaisa Payment"
                    : "JazzCash Payment"}
                </h3>

                <p className="mt-2 text-xs leading-5 text-gray-500">
                  Transfer your order amount using the details below.
                </p>

                <div className="mt-5 space-y-4">
                  <div className="flex justify-between gap-3 border-b border-[#e9e1d4] pb-3">
                    <span className="text-xs text-gray-500">
                      Account / Wallet Number
                    </span>
                    <strong className="text-xs">
                      +92 321 577 2078
                    </strong>
                  </div>

                  <div className="flex justify-between gap-3 border-b border-[#e9e1d4] pb-3">
                    <span className="text-xs text-gray-500">
                      Account Title
                    </span>
                    <strong className="text-xs">
                      Confirm before payment
                    </strong>
                  </div>
                </div>

                <div className="mt-5 rounded-lg bg-white p-4">
                  <span className="text-[10px] font-semibold tracking-widest text-gray-400">
                    TRANSFER EXACT AMOUNT
                  </span>

                  <h3 className="mt-2 text-2xl font-semibold text-[#a58b65]">
                    {formatPrice(grandTotal)}
                  </h3>
                </div>

                <p className="mt-4 text-xs leading-6 text-gray-500">
                  Complete the transfer and keep your transaction
                  receipt. Submit your Transaction ID and payment
                  screenshot in the next step.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* RIGHT ORDER SUMMARY */}
        <aside className="lg:sticky lg:top-8">
          <div className="overflow-hidden rounded-2xl border border-[#eeeae3] bg-white shadow-sm">

            <div className="border-b border-[#eeeae3] p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-2xl text-[#25231f]">
                  Order Summary
                </h2>

                <ShoppingBag size={21} className="text-[#a58b65]" />
              </div>

              <p className="mt-2 text-xs text-gray-400">
                {cartCount} items in your shopping bag
              </p>
            </div>

            {/* PRODUCTS */}
            <div className="max-h-[350px] space-y-5 overflow-y-auto p-6">

              {cartItems.length === 0 ? (
                <div className="py-8 text-center">
                  <ShoppingBag
                    size={35}
                    className="mx-auto text-gray-300"
                  />

                  <p className="mt-4 text-sm text-gray-500">
                    Your bag is currently empty.
                  </p>

                  <Link
                    to="/"
                    className="mt-4 inline-block text-xs font-semibold text-[#a58b65] underline"
                  >
                    Continue shopping
                  </Link>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={`${item.id}-${item.size}-${item.color}`}
                    className="flex gap-4"
                  >
                    <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-[#f3eee5]">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />

                      <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#25231f] text-[10px] text-white">
                        {item.quantity}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-[#25231f]">
                        {item.name}
                      </h3>

                      <p className="mt-1 text-xs text-gray-500">
                        {item.color}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Size: {item.size}
                      </p>

                      <p className="mt-2 text-xs font-semibold">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* PRICE BREAKDOWN */}
           {/* PRICE BREAKDOWN */}
<div className="border-t border-[#eeeae3] p-6">
  <div className="space-y-4">

    {/* SUBTOTAL */}
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">
        Items ({cartCount})
      </span>
      <span className="font-medium">
        {formatPrice(cartTotal)}
      </span>
    </div>

    {/* APPLIED COUPON */}
    {appliedCoupon && discountAmount > 0 && (
      <div className="rounded-lg border border-[#e8e0d3] bg-[#faf8f4] p-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold text-[#987b53]">
              Coupon Applied
            </p>
            <p className="mt-1 text-xs font-bold tracking-wider text-[#25231f]">
              {appliedCoupon.code}
            </p>
          </div>

          <span className="text-sm font-semibold text-green-700">
            -{formatPrice(discountAmount)}
          </span>
        </div>
      </div>
    )}

    {/* DISCOUNT */}
    {discountAmount > 0 && (
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">
          Coupon Discount
        </span>
        <span className="font-medium text-green-700">
          -{formatPrice(discountAmount)}
        </span>
      </div>
    )}

    {/* SHIPPING */}
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">Shipping</span>
      <span className="font-medium">
        {shippingFee === 0 && cartItems.length > 0
          ? "FREE"
          : formatPrice(shippingFee)}
      </span>
    </div>

    {/* FREE SHIPPING MESSAGE */}
    {cartTotal > 0 && cartTotal < 10000 && (
      <div className="rounded-lg bg-[#faf8f4] p-3">
        <p className="text-xs leading-5 text-[#987b53]">
          Add {formatPrice(10000 - cartTotal)} more for
          complimentary shipping.
        </p>
      </div>
    )}

    {/* FINAL TOTAL */}
    <div className="border-t border-dashed border-[#e8e4dc] pt-5">
      <div className="flex items-center justify-between">
        <span className="font-serif text-xl text-[#25231f]">
          Total
        </span>

        <strong className="text-xl text-[#a58b65]">
          {formatPrice(grandTotal)}
        </strong>
      </div>
    </div>
  </div>

  {/* PLACE ORDER */}
  <button
    type="submit"
    form="checkout-form"
    disabled={cartItems.length === 0 || loading}
    className="mt-7 flex w-full items-center justify-center gap-3 rounded-full bg-[#25231f] px-5 py-4 text-xs font-semibold tracking-[0.2em] text-white transition duration-300 hover:bg-[#a58b65] disabled:cursor-not-allowed disabled:opacity-50"
  >
    {loading ? (
      <>
        <LoaderCircle size={17} className="animate-spin" />
        PLACING ORDER...
      </>
    ) : (
      `PLACE ORDER — ${formatPrice(grandTotal)}`
    )}
  </button>

  {orderMessage && (
    <p className="mt-4 rounded-lg bg-red-50 p-3 text-xs text-red-600">
      {orderMessage}
    </p>
  )}

  <div className="mt-5 flex items-center justify-center gap-2 text-xs text-gray-400">
    <ShieldCheck size={16} />
    Secure checkout experience
  </div>

  <Link
    to="/cart"
    className="mt-5 flex items-center justify-center gap-2 text-xs font-semibold tracking-wider text-gray-500 transition hover:text-[#a58b65]"
  >
    <ArrowLeft size={15} />
    RETURN TO BAG
  </Link>
</div>
          </div>

          <div className="mt-5 flex items-center justify-center gap-3 rounded-xl border border-[#eeeae3] bg-white p-4 text-xs text-gray-500">
            <Truck size={19} className="text-[#a58b65]" />
            Complimentary shipping on orders above PKR 10,000
          </div>
        </aside>
      </div>
    </main>
  );
}
