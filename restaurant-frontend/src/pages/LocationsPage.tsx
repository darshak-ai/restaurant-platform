import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Phone, Star, Navigation } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { useStore } from '../store/useStore';
import { restaurantApi, locationApi } from '../services/api';
import { Restaurant } from '../types';

export function LocationsPage() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);

  const {
    selectedRestaurant,
    setSelectedRestaurant,
    userLocation,
    setUserLocation,
    setNearbyRestaurants,
    setLoading,
    setError
  } = useStore();

  useEffect(() => {
    loadRestaurants();
  }, []);

  useEffect(() => {
    filterRestaurants();
  }, [restaurants, searchQuery]);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      const allRestaurants = await restaurantApi.getRestaurants();
      setRestaurants(allRestaurants);
      setNearbyRestaurants(allRestaurants);
    } catch (error) {
      console.error('Error loading restaurants:', error);
      setError('Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  };

  const filterRestaurants = () => {
    let filtered = restaurants;

    if (searchQuery) {
      filtered = restaurants.filter(restaurant =>
        restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredRestaurants(filtered);
  };

  const detectLocation = async () => {
    try {
      setIsDetectingLocation(true);
      const location = await locationApi.getCurrentLocation();
      setUserLocation(location);
      
      const nearby = await restaurantApi.getNearbyRestaurants(
        location.latitude,
        location.longitude
      );
      setRestaurants(nearby);
      setNearbyRestaurants(nearby);
    } catch (error) {
      console.error('Error detecting location:', error);
      setError('Unable to detect your location. Please select a restaurant manually.');
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const selectRestaurant = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    navigate('/menu');
  };

  const calculateDistance = (restaurant: Restaurant): string => {
    if (!userLocation) return '';
    
    const R = 3959; // Earth's radius in miles
    const dLat = (restaurant.latitude - userLocation.latitude) * Math.PI / 180;
    const dLon = (restaurant.longitude - userLocation.longitude) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(userLocation.latitude * Math.PI / 180) * Math.cos(restaurant.latitude * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return `${distance.toFixed(1)} mi`;
  };

  const getRestaurantHours = (restaurant: Restaurant): string => {
    if (!restaurant.opening_hours) return 'Hours not available';
    
    const today = new Date().toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
    const todayHours = restaurant.opening_hours[today];
    
    if (!todayHours) return 'Closed today';
    
    return `${todayHours.open} - ${todayHours.close}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Choose Your Location
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Select a restaurant location to view the menu and place your order
            </p>

            {/* Search and Location Detection */}
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Search by restaurant name, city, or address..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Button
                  onClick={detectLocation}
                  disabled={isDetectingLocation}
                  className="flex items-center space-x-2"
                >
                  <Navigation className="w-4 h-4" />
                  <span>
                    {isDetectingLocation ? 'Detecting...' : 'Use My Location'}
                  </span>
                </Button>
              </div>

              {userLocation && (
                <p className="text-sm text-gray-600">
                  Showing restaurants near your location
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredRestaurants.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {searchQuery ? 'No restaurants found matching your search.' : 'No restaurants available.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <Card 
                key={restaurant.id} 
                className={`overflow-hidden hover:shadow-lg transition-shadow cursor-pointer ${
                  selectedRestaurant?.id === restaurant.id ? 'ring-2 ring-orange-500' : ''
                }`}
                onClick={() => selectRestaurant(restaurant)}
              >
                <div className="aspect-video bg-gray-200 relative">
                  {restaurant.image_url ? (
                    <img 
                      src={restaurant.image_url} 
                      alt={restaurant.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span className="text-4xl">🏪</span>
                    </div>
                  )}
                  {userLocation && (
                    <Badge className="absolute top-2 right-2 bg-orange-500">
                      {calculateDistance(restaurant)}
                    </Badge>
                  )}
                  {selectedRestaurant?.id === restaurant.id && (
                    <Badge className="absolute top-2 left-2 bg-green-500">
                      Selected
                    </Badge>
                  )}
                </div>

                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {restaurant.name}
                  </h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">
                        {restaurant.address}, {restaurant.city}, {restaurant.state} {restaurant.zip_code}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm">{restaurant.phone_number}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{getRestaurantHours(restaurant)}</span>
                    </div>
                  </div>

                  {restaurant.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {restaurant.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-gray-600">4.8 (120+ reviews)</span>
                    </div>
                    <Badge 
                      variant={restaurant.is_active ? "default" : "secondary"}
                      className={restaurant.is_active ? "bg-green-100 text-green-800" : ""}
                    >
                      {restaurant.is_active ? 'Open' : 'Closed'}
                    </Badge>
                  </div>

                  <Button 
                    className="w-full mt-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      selectRestaurant(restaurant);
                    }}
                    disabled={!restaurant.is_active}
                  >
                    {restaurant.is_active ? 'Select & View Menu' : 'Currently Closed'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
