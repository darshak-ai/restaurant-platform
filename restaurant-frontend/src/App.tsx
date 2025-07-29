import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { MenuPage } from './pages/MenuPage';
import { LocationsPage } from './pages/LocationsPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';

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
          <Route path="admin" element={<div className="p-8 text-center">Admin Dashboard - Coming Soon</div>} />
          <Route path="admin/login" element={<div className="p-8 text-center">Admin Login - Coming Soon</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
