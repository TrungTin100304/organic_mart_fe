/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderTracking from "./pages/OrderTracking";
import MealPlan from "./pages/MealPlan";
import Auth from "./pages/Auth";
import About from "./pages/About";
import UserInfo from "./pages/UserInfo";
import ForgotPassword from "./pages/ForgotPassword";
import AdminLayout from "./admin/components/AdminLayout";
import AdminGuard from "./admin/components/AdminGuard";
import { ADMIN_ROUTES } from "./admin/AdminRoutes";
import Navbar from "@/components/Header.tsx";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
          {ADMIN_ROUTES.map((route) => (
            <Route
              key={route.key}
              index={route.index}
              path={route.path}
              element={route.element}
            />
          ))}
        </Route>
        <Route path="/*" element={<StorefrontLayout />} />
      </Routes>
    </Router>
  );
}

function StorefrontLayout() {
  const location = useLocation();
  const hideChrome = ["/login", "/register", "/forgot-password"].includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col bg-surface overflow-x-hidden font-sans selection:bg-primary/20 selection:text-primary">
      {!hideChrome && <Navbar />}
      <main className={`flex-grow ${hideChrome ? "" : "pt-20"}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/tracking/:orderCode" element={<OrderTracking />} />
          <Route path="/meal-plan" element={<MealPlan />} />
          <Route path="/about" element={<About />} />
          <Route path="/register" element={<Auth />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/account" element={<UserInfo />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </main>
      {!hideChrome && <Footer />}
    </div>
  );
}
