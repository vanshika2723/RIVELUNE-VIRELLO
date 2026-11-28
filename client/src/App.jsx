
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import { CartProvider } from "./context/CartContext";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import Collections from "./components/Collections";
import NewArrivals from "./components/NewArrivals";
import BrandBenefits from "./components/BrandBenefits";

import About from "./pages/About";
import Contact from "./pages/Contact";
import Shop from "./pages/Shop";
import Terms from "./pages/Terms";
import Checkout from "./pages/Checkout";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import OrderTracking from "./pages/OrderTracking";
import FAQ from "./pages/FAQ";
import SizeGuide from "./pages/SizeGuide";
import Wishlist from "./pages/Wishlist";
import Returns from "./pages/Returns";
import Shipping from "./pages/Shipping";
import Privacy from "./pages/Privacy";

import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProducts from "./pages/AdminProducts";
import AdminShipping from "./pages/AdminShipping";
import AdminCoupons from "./pages/AdminCoupons";
import AdminCustomers from "./pages/AdminCustomers";
import AdminReturns from "./pages/AdminReturns";
import AdminOrders from "./pages/AdminOrders";
import AdminPayments from "./pages/AdminPayments";
import Inventory from "./pages/Inventory";

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

function ProtectedAdminRoute({ children }) {
  const token = sessionStorage.getItem("rivelune_admin_token");

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

export default function App() {
  const location = useLocation();

  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <CartProvider>
      {!isAdminPage && <Navbar />}

      <Routes>
        {/* Customer Homepage */}
        <Route path="/" element={<Home />} />

        {/* Customer Pages */}
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/size-guide" element={<SizeGuide />} />
        <Route path="/shipping" element={<Shipping />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/returns" element={<Returns />} />
        <Route path="/privacy" element={<Privacy />} />

        {/* Shopping */}
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/men" element={<Shop />} />
        <Route path="/shop/women" element={<Shop />} />
        <Route path="/shop/new-arrivals" element={<Shop />} />

        {/* Product */}
        <Route path="/product/:id" element={<ProductDetails />} />

        {/* Cart and Checkout */}
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/checkout" element={<Checkout />} />

        {/* Order Tracking */}
        <Route path="/track-order" element={<OrderTracking />} />

        {/* Admin Login */}
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Admin Pages */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/products"
          element={
            <ProtectedAdminRoute>
              <AdminProducts />
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/orders"
          element={
            <ProtectedAdminRoute>
              <AdminOrders />
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/payments"
          element={
            <ProtectedAdminRoute>
              <AdminPayments />
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/shipping"
          element={
            <ProtectedAdminRoute>
              <AdminShipping />
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/returns"
          element={
            <ProtectedAdminRoute>
              <AdminReturns />
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/customers"
          element={
            <ProtectedAdminRoute>
              <AdminCustomers />
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/coupons"
          element={
            <ProtectedAdminRoute>
              <AdminCoupons />
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/inventory"
          element={
            <ProtectedAdminRoute>
              <Inventory />
            </ProtectedAdminRoute>
          }
        />

        {/* Unknown Routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {!isAdminPage && <Footer />}
    </CartProvider>
  );
}
