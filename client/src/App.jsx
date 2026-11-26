import { Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Collections from "./components/Collections";
import NewArrivals from "./components/NewArrivals";
import BrandBenefits from "./components/BrandBenefits";
import Footer from "./components/Footer";
import Checkout from "./pages/Checkout";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import OrderTracking from "./pages/OrderTracking";
import AdminPayments from "./pages/AdminPayments";
import AdminLogin from "./pages/AdminLogin";

function Home() {
  return (
    <>
      <Hero />
      <Collections />
      <NewArrivals />
      <BrandBenefits />
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <>
    <CartProvider>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/track-order" element={<OrderTracking />} />
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
      </Routes>
      </CartProvider>
    </>
  );
}