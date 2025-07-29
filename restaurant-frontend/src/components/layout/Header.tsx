import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, MapPin, Menu, X, User } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useStore } from '../../store/useStore';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  const { 
    selectedRestaurant, 
    getCartItemCount, 
    user, 
    isAuthenticated 
  } = useStore();

  const cartItemCount = getCartItemCount();

  const handleCartClick = () => {
    navigate('/cart');
    setIsMenuOpen(false);
  };

  const handleLocationClick = () => {
    navigate('/locations');
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <span className="text-xl font-bold text-gray-900">
              {selectedRestaurant?.name || 'Restaurant'}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-orange-600 font-medium transition-colors"
            >
              Home
            </Link>
            <Link 
              to="/menu" 
              className="text-gray-700 hover:text-orange-600 font-medium transition-colors"
            >
              Menu
            </Link>
            <Link 
              to="/about" 
              className="text-gray-700 hover:text-orange-600 font-medium transition-colors"
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className="text-gray-700 hover:text-orange-600 font-medium transition-colors"
            >
              Contact
            </Link>
            <Link 
              to="/gallery" 
              className="text-gray-700 hover:text-orange-600 font-medium transition-colors"
            >
              Gallery
            </Link>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Location selector */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLocationClick}
              className="hidden sm:flex items-center space-x-1 text-gray-600 hover:text-orange-600"
            >
              <MapPin className="w-4 h-4" />
              <span className="text-sm">
                {selectedRestaurant ? 'Change Location' : 'Select Location'}
              </span>
            </Button>

            {/* Cart */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCartClick}
              className="relative flex items-center space-x-1 text-gray-600 hover:text-orange-600"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center p-0 text-xs"
                >
                  {cartItemCount}
                </Badge>
              )}
            </Button>

            {/* User menu */}
            {isAuthenticated ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin')}
                className="hidden sm:flex items-center space-x-1 text-gray-600 hover:text-orange-600"
              >
                <User className="w-4 h-4" />
                <span className="text-sm">{user?.full_name}</span>
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin/login')}
                className="hidden sm:flex items-center space-x-1 text-gray-600 hover:text-orange-600"
              >
                <User className="w-4 h-4" />
                <span className="text-sm">Admin</span>
              </Button>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/"
                className="block px-3 py-2 text-gray-700 hover:text-orange-600 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/menu"
                className="block px-3 py-2 text-gray-700 hover:text-orange-600 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Menu
              </Link>
              <Link
                to="/about"
                className="block px-3 py-2 text-gray-700 hover:text-orange-600 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link
                to="/contact"
                className="block px-3 py-2 text-gray-700 hover:text-orange-600 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <Link
                to="/gallery"
                className="block px-3 py-2 text-gray-700 hover:text-orange-600 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Gallery
              </Link>
              <button
                onClick={handleLocationClick}
                className="block w-full text-left px-3 py-2 text-gray-700 hover:text-orange-600 font-medium"
              >
                <MapPin className="w-4 h-4 inline mr-2" />
                {selectedRestaurant ? 'Change Location' : 'Select Location'}
              </button>
              {isAuthenticated ? (
                <Link
                  to="/admin"
                  className="block px-3 py-2 text-gray-700 hover:text-orange-600 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="w-4 h-4 inline mr-2" />
                  {user?.full_name}
                </Link>
              ) : (
                <Link
                  to="/admin/login"
                  className="block px-3 py-2 text-gray-700 hover:text-orange-600 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="w-4 h-4 inline mr-2" />
                  Admin Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
