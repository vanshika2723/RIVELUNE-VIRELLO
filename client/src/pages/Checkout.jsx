
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingBag,
  ShieldCheck,
  LoaderCircle,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import "../index.css";
import WalletPaymentProof from "../components/WalletPaymentProof";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const formatPrice = (price) =>
  `PKR ${Number(price || 0).toLocaleString("en-PK")}`;

export default function Checkout() {
  const { cartItems, cartTotal, cartCount, clearCart } = useCart();

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

  const shippingFee =
    cartTotal >= 10000 ? 0 : cartItems.length > 0 ? 500 : 0;

  const grandTotal = cartTotal + shippingFee;

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
    setLoading(true);

    if (!cartItems.length) {
      setOrderMessage("Your shopping bag is empty.");
      setLoading(false);
      return;
    }

    const payload = {
      customer,
      payment_method: paymentMethod,
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
      setOrderMessage("");
    } catch (error) {
      setOrderMessage(
        error.message || "Unable to place order. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Order Success Screen
  if (placedOrder) {
    return (
      <main className="checkout-page checkout-success-page">
        <div className="checkout-success-card">
          <ShieldCheck size={42} />

          <span className="checkout-label">
            RIVELUNE ORDER CONFIRMATION
          </span>

          <h1>Thank you for your order.</h1>

          <p>Your order has been submitted successfully.</p>

          <div className="success-order-number">
            <span>ORDER NUMBER</span>
            <strong>{placedOrder.order_number}</strong>
          </div>

          <div className="success-order-details">
            <div>
              <span>Payment</span>
              <strong>
                {placedOrder.payment_method === "cod"
                  ? "Cash on Delivery"
                  : placedOrder.payment_method === "easypaisa"
                  ? "Easypaisa"
                  : "JazzCash"}
              </strong>
            </div>

            <div>
              <span>Order Total</span>
              <strong>
                {formatPrice(placedOrder.total_amount)}
              </strong>
            </div>

            <div>
              <span>Status</span>
              <strong>{placedOrder.order_status}</strong>
            </div>
          </div>

          <p className="checkout-success-note">
            Please save your order number to track your order later.
          </p>
{["easypaisa", "jazzcash"].includes(
  placedOrder.payment_method
) && (
  <WalletPaymentProof
    order={placedOrder}
    phone={customer.phone}
  />
)}
          <Link to="/" className="checkout-home-btn">
            CONTINUE SHOPPING
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <div className="checkout-header">
        <span className="checkout-label">RIVELUNE CHECKOUT</span>

        <h1>Almost yours.</h1>

        <p>Complete your details to place your order.</p>
      </div>

      <div className="checkout-layout">
        {/* LEFT SECTION */}
        <div className="checkout-form-section">
          {/* Delivery Information */}
          <div className="checkout-section-heading">
            <span>01</span>
            <h2>Delivery Information</h2>
          </div>

          <form
            id="checkout-form"
            className="delivery-form"
            onSubmit={handlePlaceOrder}
          >
            <div className="checkout-field">
              <label>Full Name *</label>

              <input
                type="text"
                name="name"
                value={customer.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                autoComplete="name"
                required
              />
            </div>

            <div className="checkout-form-row">
              <div className="checkout-field">
                <label>Phone Number *</label>

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
                />
              </div>

              <div className="checkout-field">
                <label>Email Address</label>

                <input
                  type="email"
                  name="email"
                  value={customer.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="checkout-field">
              <label>Province *</label>

              <select
                name="province"
                value={customer.province}
                onChange={handleChange}
                required
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

            <div className="checkout-form-row">
              <div className="checkout-field">
                <label>City *</label>

                <input
                  type="text"
                  name="city"
                  value={customer.city}
                  onChange={handleChange}
                  placeholder="Your city"
                  autoComplete="address-level2"
                  required
                />
              </div>

              <div className="checkout-field">
                <label>Postal Code</label>

                <input
                  type="text"
                  name="postal_code"
                  value={customer.postal_code}
                  onChange={handleChange}
                  placeholder="Postal code"
                  autoComplete="postal-code"
                />
              </div>
            </div>

            <div className="checkout-field">
              <label>Complete Address *</label>

              <textarea
                name="address"
                value={customer.address}
                onChange={handleChange}
                rows="3"
                placeholder="House no., street, area, landmark..."
                autoComplete="street-address"
                required
              />
            </div>

            <div className="checkout-field">
              <label>Order Notes (Optional)</label>

              <textarea
                name="order_notes"
                value={customer.order_notes}
                onChange={handleChange}
                rows="2"
                placeholder="Any special delivery instructions?"
              />
            </div>
          </form>

          {/* Payment Method */}
          <div className="checkout-section-heading payment-heading">
            <span>02</span>
            <h2>Payment Method</h2>
          </div>

          <div className="payment-options">
            {/* Cash on Delivery */}
            <label className="payment-option">
              <input
                form="checkout-form"
                type="radio"
                name="payment"
                value="cod"
                checked={paymentMethod === "cod"}
                onChange={(e) =>
                  setPaymentMethod(e.target.value)
                }
              />

              <div>
                <strong>Cash on Delivery</strong>
                <p>
                  Pay when your order arrives at your doorstep.
                </p>
              </div>
            </label>

            {/* Easypaisa */}
            <label className="payment-option">
              <input
                form="checkout-form"
                type="radio"
                name="payment"
                value="easypaisa"
                checked={paymentMethod === "easypaisa"}
                onChange={(e) =>
                  setPaymentMethod(e.target.value)
                }
              />

              <div>
                <strong>Easypaisa</strong>
                <p>
                  Transfer payment using your Easypaisa account.
                </p>
              </div>
            </label>

            {/* JazzCash */}
            <label className="payment-option">
              <input
                form="checkout-form"
                type="radio"
                name="payment"
                value="jazzcash"
                checked={paymentMethod === "jazzcash"}
                onChange={(e) =>
                  setPaymentMethod(e.target.value)
                }
              />

              <div>
                <strong>JazzCash</strong>
                <p>Pay using your JazzCash wallet.</p>
              </div>
            </label>
          </div>

          {/* Wallet Payment Instructions */}
          {paymentMethod !== "cod" && (
            <div className="wallet-payment-instructions">
              <div className="wallet-instructions-header">
                <h3>
                  {paymentMethod === "easypaisa"
                    ? "Easypaisa Payment"
                    : "JazzCash Payment"}
                </h3>

                <p>
                  Transfer your order amount using the details below.
                </p>
              </div>

              <div className="wallet-detail-row">
                <span>Account / Wallet Number</span>
                <strong>+92 321 577 2078</strong>
              </div>

              <div className="wallet-detail-row">
                <span>Account Title</span>
                <strong>Confirm before payment</strong>
              </div>

              <div className="wallet-payment-amount">
                <span>TRANSFER EXACT AMOUNT</span>
                <strong>{formatPrice(grandTotal)}</strong>
              </div>

              <div className="wallet-payment-note">
                Please complete the transfer and keep your transaction
                receipt. You will submit your Transaction ID and payment
                screenshot in the next step.
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SECTION - ORDER SUMMARY */}
        <aside className="checkout-summary">
          <h2>Order Summary</h2>

          <div className="checkout-items-list">
            {cartItems.length === 0 ? (
              <div className="checkout-summary-placeholder">
                <ShoppingBag size={25} />

                <p>Your bag is currently empty.</p>

                <Link to="/">Continue shopping</Link>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  className="checkout-summary-item"
                  key={`${item.id}-${item.size}`}
                >
                  <div className="checkout-item-image">
                    <img src={item.image} alt={item.name} />

                    <span className="checkout-item-qty">
                      {item.quantity}
                    </span>
                  </div>

                  <div className="checkout-item-info">
                    <h3>{item.name}</h3>
                    <p>{item.color}</p>
                    <p>Size: {item.size}</p>
                    <p>Qty: {item.quantity}</p>
                  </div>

                  <span className="checkout-item-price">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Price Breakdown */}
          <div className="checkout-price-breakdown">
            <div>
              <span>Items ({cartCount})</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>

            <div>
              <span>Shipping</span>

              <span>
                {shippingFee === 0 && cartItems.length > 0
                  ? "FREE"
                  : formatPrice(shippingFee)}
              </span>
            </div>

            {cartTotal > 0 && cartTotal < 10000 && (
              <p className="checkout-shipping-hint">
                Add {formatPrice(10000 - cartTotal)} more for
                complimentary shipping.
              </p>
            )}

            <div className="checkout-grand-total">
              <span>Total</span>
              <strong>{formatPrice(grandTotal)}</strong>
            </div>
          </div>

          <div className="checkout-secure-note">
            <ShieldCheck size={17} />
            <span>Secure checkout experience</span>
          </div>

          {/* Place Order Button */}
          <button
            type="submit"
            form="checkout-form"
            className="place-order-btn"
            disabled={cartItems.length === 0 || loading}
          >
            {loading ? (
              <>
                <LoaderCircle
                  size={16}
                  className="checkout-loader"
                />
                PLACING ORDER...
              </>
            ) : (
              `PLACE ORDER — ${formatPrice(grandTotal)}`
            )}
          </button>

          {orderMessage && (
            <p className="checkout-order-message">
              {orderMessage}
            </p>
          )}

          <Link to="/cart" className="checkout-back-link">
            <ArrowLeft size={15} />
            Return to bag
          </Link>
        </aside>
      </div>
    </main>
  );
}
