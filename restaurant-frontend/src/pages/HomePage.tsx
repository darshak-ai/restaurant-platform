import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Star, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useStore } from '../store/useStore';
import { restaurantApi, menuApi, cmsApi, locationApi } from '../services/api';
import { MenuItem, CMSContent } from '../types';

export function HomePage() {
  const navigate = useNavigate();
  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([]);
  const [heroBanners, setHeroBanners] = useState<CMSContent[]>([]);
  const [announcements, setAnnouncements] = useState<CMSContent[]>([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const {
    selectedRestaurant,
    setSelectedRestaurant,
    setUserLocation,
    setNearbyRestaurants,
    setLoading,
    setError
  } = useStore();

  useEffect(() => {
    loadInitialData();
    if (!selectedRestaurant) {
      detectLocationAndLoadRestaurants();
    }
  }, [selectedRestaurant]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      const [banners, announcements] = await Promise.all([
        cmsApi.getHeroBanners(),
        cmsApi.getAnnouncements()
      ]);
      
      setHeroBanners(banners);
      setAnnouncements(announcements);

      if (selectedRestaurant) {
        const featured = await menuApi.getFeaturedItems(selectedRestaurant.id);
        setFeaturedItems(featured);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      setError('Failed to load page content');
    } finally {
      setLoading(false);
    }
  };

  const detectLocationAndLoadRestaurants = async () => {
    try {
      setIsLoadingLocation(true);
      const location = await locationApi.getCurrentLocation();
      setUserLocation(location);
      
      const nearby = await restaurantApi.getNearbyRestaurants(
        location.latitude,
        location.longitude
      );
      setNearbyRestaurants(nearby);
      
      if (nearby.length > 0) {
        setSelectedRestaurant(nearby[0]);
      }
    } catch (error) {
      console.error('Error detecting location:', error);
      try {
        const allRestaurants = await restaurantApi.getRestaurants();
        setNearbyRestaurants(allRestaurants);
        if (allRestaurants.length > 0) {
          setSelectedRestaurant(allRestaurants[0]);
        }
      } catch (fallbackError) {
        console.error('Error loading restaurants:', fallbackError);
        setError('Unable to load restaurant information');
      }
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleOrderNow = () => {
    if (selectedRestaurant) {
      navigate('/menu');
    } else {
      navigate('/locations');
    }
  };

  const currentBanner = heroBanners.length > 0 ? heroBanners[0] : null;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative h-96 md:h-[500px] bg-gradient-to-r from-orange-600 to-red-600 flex items-center justify-center text-white"
        style={currentBanner?.featured_image ? {
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${currentBanner.featured_image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : {}}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            {currentBanner?.title || 'Welcome to Delicious Dining'}
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            {currentBanner?.content || 'Experience the finest cuisine with fresh, locally sourced ingredients'}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={handleOrderNow}
              className="bg-white text-orange-600 hover:bg-gray-100 font-semibold px-8 py-3"
            >
              Order Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/menu')}
              className="border-white text-white hover:bg-white hover:text-orange-600 font-semibold px-8 py-3"
            >
              View Menu
            </Button>
          </div>

          {isLoadingLocation && (
            <p className="mt-4 text-sm opacity-75">
              Detecting your location to find nearby restaurants...
            </p>
          )}
        </div>
      </section>

      {/* Restaurant Info */}
      {selectedRestaurant && (
        <section className="py-8 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="mb-4 md:mb-0">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedRestaurant.name}
                  </h2>
                  <div className="flex items-center space-x-4 text-gray-600">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">
                        {selectedRestaurant.address}, {selectedRestaurant.city}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">Open Today</span>
                    </div>
                  </div>
                </div>
                <Button onClick={() => navigate('/locations')} variant="outline">
                  Change Location
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Announcements */}
      {announcements.length > 0 && (
        <section className="py-4 bg-orange-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              {announcements.map((announcement) => (
                <p key={announcement.id} className="text-orange-800 font-medium">
                  {announcement.content}
                </p>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Items */}
      {featuredItems.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Featured Dishes
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover our chef's special selections and customer favorites
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredItems.slice(0, 6).map((item) => (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gray-200 relative">
                    {item.image_url ? (
                      <img 
                        src={item.image_url} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span className="text-4xl">🍽️</span>
                      </div>
                    )}
                    <Badge className="absolute top-2 right-2 bg-orange-500">
                      Featured
                    </Badge>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {item.name}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-orange-600">
                        ${item.price.toFixed(2)}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-600">4.8</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button onClick={() => navigate('/menu')} size="lg">
                View Full Menu
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Call to Action */}
      <section className="py-16 bg-orange-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Order?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Choose pickup or dine-in and enjoy our delicious meals
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={handleOrderNow}
              className="bg-white text-orange-600 hover:bg-gray-100 font-semibold px-8 py-3"
            >
              Start Your Order
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => navigate('/contact')}
              className="border-white text-white hover:bg-white hover:text-orange-600 font-semibold px-8 py-3"
            >
              Contact Us
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
