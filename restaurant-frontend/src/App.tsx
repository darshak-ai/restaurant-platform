import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { MenuPage } from './pages/MenuPage';
import { LocationsPage } from './pages/LocationsPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminMenu } from './pages/admin/AdminMenu';
import { AdminRestaurant } from './pages/admin/AdminRestaurant';
import { AdminCMS } from './pages/admin/AdminCMS';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="menu" element={<MenuPage />} />
          <Route path="about" element={<div className="p-8 text-center">About Page - Coming Soon</div>} />
          <Route path="contact" element={<div className="p-8 text-center">Contact Page - Coming Soon</div>} />
          <Route path="gallery" element={<div className="p-8 text-center">Gallery Page - Coming Soon</div>} />
          <Route path="locations" element={<LocationsPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="admin/login" element={<AdminLogin />} />
          <Route path="admin/dashboard" element={<AdminDashboard />} />
          <Route path="admin/orders" element={<AdminOrders />} />
          <Route path="admin/menu" element={<AdminMenu />} />
          <Route path="admin/restaurant" element={<AdminRestaurant />} />
          <Route path="admin/cms" element={<AdminCMS />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
