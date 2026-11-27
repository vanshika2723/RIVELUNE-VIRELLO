
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";

import {
  Search,
  ShoppingBag,
  Menu,
  X,
  ArrowRight,
  Heart,
} from "lucide-react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { cartCount, wishlistCount } = useCart();

  const navigate = useNavigate();
  const location = useLocation();

  const closeMenu = () => setMenuOpen(false);

  const navLinks = [
    { name: "Men", path: "/shop/men" },
    { name: "Women", path: "/shop/women" },
    { name: "New Arrivals", path: "/shop/new-arrivals" },
    { name: "Shop All", path: "/shop" },
    { name: "Track Order", path: "/track-order" },
  ];

  const isActive = (path) => {
    if (path === "/shop") {
      return location.pathname === "/shop";
    }

    return location.pathname === path;
  };

  const handleSearch = (e) => {
    e.preventDefault();

    if (!searchQuery.trim()) return;

    navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);

    setSearchQuery("");
    setSearchOpen(false);
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white">

      {/* ANNOUNCEMENT BAR */}
      <div className="flex items-center justify-center bg-[#1c1c1c] px-3 py-2 text-center text-[9px] tracking-[2px] text-white sm:text-[11px] sm:tracking-[2.5px]">
        COMPLIMENTARY SHIPPING ON ORDERS OVER PKR 10,000
      </div>

      {/* MAIN NAVBAR */}
      <div className="relative border-b border-gray-100">

        <div className="mx-auto flex h-[72px] max-w-[1600px] items-center justify-between px-5 sm:px-8 lg:px-12">

          {/* LEFT SIDE */}
          <div className="flex items-center">

            {/* MOBILE MENU */}
            <button
              onClick={() => {
                setMenuOpen(!menuOpen);
                setSearchOpen(false);
              }}
              className="mr-4 flex items-center justify-center text-black lg:hidden"
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <X size={23} strokeWidth={1.5} />
              ) : (
                <Menu size={23} strokeWidth={1.5} />
              )}
            </button>

            {/* DESKTOP NAVIGATION */}
            <nav className="hidden items-center gap-6 lg:flex xl:gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative py-2 text-[10px] font-medium uppercase tracking-[1.5px] transition ${
                    isActive(link.path)
                      ? "text-black"
                      : "text-gray-600 hover:text-black"
                  }`}
                >
                  {link.name}

                  {isActive(link.path) && (
                    <span className="absolute bottom-0 left-0 h-[1px] w-full bg-black" />
                  )}
                </Link>
              ))}
            </nav>

          </div>

          {/* CENTER LOGO */}
          <Link
            to="/"
            onClick={() => {
              closeMenu();
              setSearchOpen(false);
            }}
            className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-xl font-semibold tracking-[5px] text-black sm:text-2xl sm:tracking-[7px]"
          >
            RIVELUNE
          </Link>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-4 sm:gap-6">

            {/* SEARCH */}
            <button
              onClick={() => {
                setSearchOpen(!searchOpen);
                setMenuOpen(false);
              }}
              className="flex items-center justify-center text-black transition hover:text-gray-500"
              aria-label="Search products"
            >
              {searchOpen ? (
                <X size={21} strokeWidth={1.5} />
              ) : (
                <Search size={21} strokeWidth={1.5} />
              )}
            </button>

            {/* WISHLIST */}
            <Link
              to="/wishlist"
              onClick={() => {
                closeMenu();
                setSearchOpen(false);
              }}
              className="relative flex items-center justify-center text-black transition hover:text-gray-500"
              aria-label={`Wishlist with ${wishlistCount} items`}
            >
              <Heart size={22} strokeWidth={1.5} />

              {wishlistCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-black px-1 text-[9px] font-medium text-white">
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </span>
              )}
            </Link>

            {/* CART */}
            <Link
              to="/cart"
              onClick={() => {
                closeMenu();
                setSearchOpen(false);
              }}
              className="relative flex items-center justify-center text-black transition hover:text-gray-500"
              aria-label={`Shopping cart with ${cartCount} items`}
            >
              <ShoppingBag size={22} strokeWidth={1.5} />

              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-black px-1 text-[9px] font-medium text-white">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

          </div>

        </div>

        {/* SEARCH PANEL */}
        {searchOpen && (
          <div className="absolute left-0 top-full z-50 w-full border-b border-gray-200 bg-white px-5 py-6 shadow-md sm:px-10">

            <form
              onSubmit={handleSearch}
              className="mx-auto flex max-w-3xl items-center gap-3 border-b border-gray-300 pb-3"
            >
              <Search size={19} className="shrink-0 text-gray-500" />

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search clothing, styles, products..."
                autoFocus
                className="w-full bg-transparent py-2 text-sm outline-none placeholder:text-gray-400"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-gray-400 hover:text-black"
                >
                  <X size={16} />
                </button>
              )}

              <button
                type="submit"
                className="flex shrink-0 items-center gap-2 text-[10px] font-medium uppercase tracking-[1.5px] text-black transition hover:text-gray-500 sm:text-xs"
              >
                Search
                <ArrowRight size={16} />
              </button>
            </form>

            <div className="mx-auto mt-4 max-w-3xl">
              <p className="text-[9px] uppercase tracking-[2px] text-gray-400">
                Explore
              </p>

              <div className="mt-3 flex flex-wrap gap-5">
                {[
                  { name: "Shop All", path: "/shop" },
                  { name: "Men", path: "/shop/men" },
                  { name: "Women", path: "/shop/women" },
                  { name: "New Arrivals", path: "/shop/new-arrivals" },
                ].map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSearchOpen(false)}
                    className="text-xs text-gray-600 transition hover:text-black"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* MOBILE MENU */}
        {menuOpen && (
          <div className="absolute left-0 top-full z-40 w-full border-b border-gray-200 bg-white shadow-md lg:hidden">

            <nav className="flex flex-col px-6 py-3">

              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={closeMenu}
                  className={`border-b border-gray-100 py-4 text-[11px] font-medium uppercase tracking-[2px] transition ${
                    isActive(link.path)
                      ? "text-black"
                      : "text-gray-600 hover:text-black"
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              <Link
                to="/wishlist"
                onClick={closeMenu}
                className="flex items-center justify-between border-b border-gray-100 py-4 text-[11px] font-medium uppercase tracking-[2px] text-gray-600 hover:text-black"
              >
                Wishlist
                {wishlistCount > 0 && `(${wishlistCount})`}
              </Link>

              <Link
                to="/about"
                onClick={closeMenu}
                className="border-b border-gray-100 py-4 text-[11px] font-medium uppercase tracking-[2px] text-gray-600 hover:text-black"
              >
                About Us
              </Link>

              <Link
                to="/contact"
                onClick={closeMenu}
                className="border-b border-gray-100 py-4 text-[11px] font-medium uppercase tracking-[2px] text-gray-600 hover:text-black"
              >
                Contact
              </Link>

              <Link
                to="/faq"
                onClick={closeMenu}
                className="py-4 text-[11px] font-medium uppercase tracking-[2px] text-gray-600 hover:text-black"
              >
                FAQ
              </Link>

            </nav>

          </div>
        )}

      </div>

    </header>
  );
}
