
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Trash2,
  ShoppingBag,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import "../index.css";

export default function Cart() {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    cartTotal,
  } = useCart();

  const formatPrice = (price) => `PKR ${price.toLocaleString("en-PK")}`;

  const shipping = cartTotal >= 10000 ? 0 : 500;
  const grandTotal = cartTotal + shipping;

  if (cartItems.length === 0) {
    return (
      <main className="cart-page empty-cart-page">
        <div className="empty-cart-content">
          <ShoppingBag size={35} strokeWidth={1.2} />

          <span className="section-label">YOUR SHOPPING BAG</span>

          <h1>Your bag is waiting.</h1>

          <p>
            Looks like you haven't found your favorites yet.
            Discover something that feels like you.
          </p>

          <Link to="/" className="cart-dark-btn">
            EXPLORE COLLECTION <ArrowRight size={16} />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="cart-page">
      <div className="cart-breadcrumb">HOME / YOUR SHOPPING BAG</div>

      <div className="cart-heading">
        <div>
          <span className="section-label">RIVELUNE COLLECTION</span>
          <h1>Your Shopping Bag</h1>
        </div>

        <span className="cart-item-count">
          {cartItems.reduce((sum, item) => sum + item.quantity, 0)} ITEMS
        </span>
      </div>

      <div className="cart-layout">
        <section className="cart-items-section">
          <div className="cart-table-heading">
            <span>PRODUCT</span>
            <span>QUANTITY</span>
            <span>TOTAL</span>
          </div>

          {cartItems.map((item) => (
            <article className="cart-item" key={`${item.id}-${item.size}`}>
              <Link to={`/product/${item.id}`} className="cart-item-image">
                <img src={item.image} alt={item.name} />
              </Link>

              <div className="cart-item-details">
                <span className="cart-item-category">RIVELUNE ESSENTIALS</span>

                <Link to={`/product/${item.id}`} className="cart-item-name">
                  {item.name}
                </Link>

                <p>Color: {item.color}</p>
                <p>Size: {item.size}</p>

                <span className="cart-item-price">
                  {formatPrice(item.price)}
                </span>

                <button
                  className="cart-remove-btn"
                  onClick={() => removeFromCart(item.id, item.size)}
                >
                  <Trash2 size={14} /> REMOVE
                </button>
              </div>

              <div className="cart-quantity">
                <button
                  onClick={() =>
                    updateQuantity(item.id, item.size, item.quantity - 1)
                  }
                  aria-label="Decrease quantity"
                >
                  −
                </button>

                <span>{item.quantity}</span>

                <button
                  onClick={() =>
                    updateQuantity(item.id, item.size, item.quantity + 1)
                  }
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <div className="cart-item-total">
                {formatPrice(item.price * item.quantity)}
              </div>
            </article>
          ))}

          <Link to="/" className="continue-shopping">
            <ArrowLeft size={15} /> CONTINUE SHOPPING
          </Link>
        </section>

        <aside className="cart-summary">
          <h2>Order Summary</h2>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>{formatPrice(cartTotal)}</span>
          </div>

          <div className="summary-row">
            <span>Shipping</span>
            <span>{shipping === 0 ? "FREE" : formatPrice(shipping)}</span>
          </div>

          {shipping > 0 && (
            <p className="shipping-hint">
              Add {formatPrice(10000 - cartTotal)} more for complimentary shipping.
            </p>
          )}

          <div className="summary-divider" />

          <div className="summary-total-row">
            <span>Total</span>
            <span>{formatPrice(grandTotal)}</span>
          </div>

          <p className="summary-tax-note">
            Inclusive of applicable taxes.
          </p>

          <Link to="/checkout" className="checkout-btn">
            PROCEED TO CHECKOUT <ArrowRight size={16} />
          </Link>

          <div className="cart-trust-note">
            <ShoppingBag size={16} />
            <span>Secure checkout · Easy shopping</span>
          </div>
        </aside>
      </div>
    </main>
  );
}
