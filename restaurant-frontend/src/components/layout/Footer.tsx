import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useStore } from '../../store/useStore';

export function Footer() {
  const { selectedRestaurant } = useStore();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Restaurant Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <span className="text-xl font-bold">
                {selectedRestaurant?.name || 'Restaurant'}
              </span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              {selectedRestaurant?.description || 
                'Experience the finest dining with fresh, locally sourced ingredients and exceptional service.'}
            </p>
            
            {selectedRestaurant && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-gray-300">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">
                    {selectedRestaurant.address}, {selectedRestaurant.city}, {selectedRestaurant.state} {selectedRestaurant.zip_code}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-gray-300">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">{selectedRestaurant.phone_number}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-300">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{selectedRestaurant.email}</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-orange-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/menu" className="text-gray-300 hover:text-orange-400 transition-colors">
                  Menu
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-orange-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-orange-400 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="text-gray-300 hover:text-orange-400 transition-colors">
                  Gallery
                </Link>
              </li>
              <li>
                <Link to="/locations" className="text-gray-300 hover:text-orange-400 transition-colors">
                  Locations
                </Link>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Hours</h3>
            {selectedRestaurant?.opening_hours ? (
              <div className="space-y-1 text-sm text-gray-300">
                {Object.entries(selectedRestaurant.opening_hours).map(([day, hours]) => (
                  <div key={day} className="flex justify-between">
                    <span className="capitalize">{day}:</span>
                    <span>{hours.open} - {hours.close}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-1 text-sm text-gray-300">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Mon-Thu: 11:00 AM - 10:00 PM</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Fri-Sat: 11:00 AM - 11:00 PM</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Sunday: 10:00 AM - 9:00 PM</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} {selectedRestaurant?.name || 'Restaurant'}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
