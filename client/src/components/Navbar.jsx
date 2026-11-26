
import { useCart } from "../context/CartContext";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  ShoppingBag,
  Menu,
  X,
} from "lucide-react";
import "../index.css";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { cartCount } = useCart();

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <div className="announcement-bar">
        Complimentary shipping on orders over PKR 10,000
      </div>

      <header className="navbar">

        {/* Left Navigation */}
        <div className="nav-left">

          <button
            className="menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <X size={22} />
            ) : (
              <Menu size={22} />
            )}
          </button>

          {/* Desktop Menu */}
          <nav className="desktop-links">
            <Link to="/men">Men</Link>

            <Link to="/women">Women</Link>

            <Link to="/new-arrivals">
              New Arrivals
            </Link>

            <Link to="/track-order" className="nav-link">
              Track Order
            </Link>
          </nav>

        </div>

        {/* Brand Logo */}
        <Link to="/" className="brand-logo">
          RIVELUNE
        </Link>

        {/* Right Navigation */}
        <div className="nav-right">

          <button
            className="nav-icon"
            aria-label="Search"
          >
            <Search size={21} strokeWidth={1.6} />
          </button>

          {/* Shopping Bag */}
          <Link to="/cart" className="nav-bag-link">
            <ShoppingBag
              size={21}
              strokeWidth={1.5}
            />

            {cartCount > 0 && (
              <span className="nav-cart-count">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="mobile-menu">

            <Link to="/men" onClick={closeMenu}>
              Men
            </Link>

            <Link to="/women" onClick={closeMenu}>
              Women
            </Link>

            <Link
              to="/new-arrivals"
              onClick={closeMenu}
            >
              New Arrivals
            </Link>

            <Link
              to="/track-order"
              onClick={closeMenu}
            >
              Track Order
            </Link>

          </div>
        )}

      </header>
    </>
  );
}
