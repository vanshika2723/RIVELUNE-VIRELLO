
import { Routes, Route, Navigate } from "react-router-dom";

import { CartProvider } from "./context/CartContext";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import About from "./pages/About";
import Hero from "./components/Hero";
import Collections from "./components/Collections";
import NewArrivals from "./components/NewArrivals";
import BrandBenefits from "./components/BrandBenefits";
import Contact from "./pages/Contact";
import Shop from "./pages/Shop";
import Checkout from "./pages/Checkout";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import OrderTracking from "./pages/OrderTracking";
import AdminPayments from "./pages/AdminPayments";
import AdminLogin from "./pages/AdminLogin";
import FAQ from "./pages/FAQ";
import SizeGuide from "./pages/SizeGuide";

function Home() {
  return (
    <>
      <Hero />
      <Collections />
      <NewArrivals />
      <BrandBenefits />
    </>
  );
}

export default function App() {
  return (
    <CartProvider>
      <Navbar />

      <Routes>
        {/* Homepage */}
        <Route path="/" element={<Home />} />
<Route path="/about" element={<About />} />
<Route path="/contact" element={<Contact />} />
<Route path="/faq" element={<FAQ />} />
<Route path="/size-guide" element={<SizeGuide />} />
        {/* Shopping Pages */}
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/men" element={<Shop />} />
        <Route path="/shop/women" element={<Shop />} />
        <Route path="/shop/new-arrivals" element={<Shop />} />

        {/* Product Details */}
        <Route path="/product/:id" element={<ProductDetails />} />

        {/* Cart & Checkout */}
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />

        {/* Order Tracking */}
        <Route path="/track-order" element={<OrderTracking />} />

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route
          path="/admin/payments"
          element={
            sessionStorage.getItem("rivelune_admin_token") ? (
              <AdminPayments />
            ) : (
              <Navigate to="/admin/login" replace />
            )
          }
        />

        {/* Unknown Page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Footer />
    </CartProvider>
  );
}
