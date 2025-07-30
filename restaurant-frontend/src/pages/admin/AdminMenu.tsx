import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  ArrowLeft,
  Search,
} from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useStore } from '../../store/useStore';
import { menuApi, restaurantApi } from '../../services/api';
import { Menu, MenuItem, Restaurant } from '../../types';

export function AdminMenu() {
  const navigate = useNavigate();
  const { user, logout } = useStore();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<number | null>(null);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'menus' | 'items'>('menus');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin/login');
      return;
    }
    
    loadRestaurants();
  }, [user, navigate]);

  useEffect(() => {
    if (selectedRestaurant) {
      loadMenus();
      loadMenuItems();
    }
  }, [selectedRestaurant]);

  const loadRestaurants = async () => {
    try {
      const data = await restaurantApi.getRestaurants();
      setRestaurants(data);
      if (data.length > 0) {
        setSelectedRestaurant(data[0].id);
      }
    } catch (error) {
      console.error('Failed to load restaurants:', error);
    }
  };

  const loadMenus = async () => {
    if (!selectedRestaurant) return;
    
    try {
      setIsLoading(true);
      const data = await menuApi.getRestaurantMenus(selectedRestaurant);
      setMenus(data);
    } catch (error) {
      console.error('Failed to load menus:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMenuItems = async () => {
    if (!selectedRestaurant) return;
    
    try {
      const data = await menuApi.getFeaturedItems(selectedRestaurant);
      setMenuItems(data);
    } catch (error) {
      console.error('Failed to load menu items:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const filteredMenus = menus.filter(menu =>
    menu.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    menu.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMenuItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/admin/dashboard')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
                <p className="text-sm text-gray-600">Manage menus and menu items</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate('/')}
              >
                View Restaurant
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Restaurant Selector */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Select Restaurant</h3>
              <p className="text-sm text-gray-600">Choose a restaurant to manage its menu</p>
            </div>
            <select
              value={selectedRestaurant || ''}
              onChange={(e) => setSelectedRestaurant(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              {restaurants.map((restaurant) => (
                <option key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </option>
              ))}
            </select>
          </div>
        </Card>

        {selectedRestaurant && (
          <>
            {/* Tab Navigation */}
            <div className="flex space-x-1 mb-6">
              <Button
                variant={activeTab === 'menus' ? 'default' : 'outline'}
                onClick={() => setActiveTab('menus')}
              >
                Menus
              </Button>
              <Button
                variant={activeTab === 'items' ? 'default' : 'outline'}
                onClick={() => setActiveTab('items')}
              >
                Menu Items
              </Button>
            </div>

            {/* Search and Actions */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <Input
                    placeholder={`Search ${activeTab}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
              <Button className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Add {activeTab === 'menus' ? 'Menu' : 'Menu Item'}</span>
              </Button>
            </div>

            {/* Content */}
            {activeTab === 'menus' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                  <div className="col-span-full text-center py-8">
                    <p className="text-gray-600">Loading menus...</p>
                  </div>
                ) : filteredMenus.length === 0 ? (
                  <div className="col-span-full text-center py-8">
                    <p className="text-gray-600">No menus found</p>
                  </div>
                ) : (
                  filteredMenus.map((menu) => (
                    <Card key={menu.id} className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{menu.name}</h3>
                          <p className="text-sm text-gray-600">{menu.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {menu.is_active ? (
                            <Eye className="h-4 w-4 text-green-600" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          {menu.items?.length || 0} items
                        </span>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMenuItems.length === 0 ? (
                  <div className="col-span-full text-center py-8">
                    <p className="text-gray-600">No menu items found</p>
                  </div>
                ) : (
                  filteredMenuItems.map((item) => (
                    <Card key={item.id} className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-600">{item.description}</p>
                          <p className="text-lg font-bold text-orange-600 mt-2">
                            ${item.price.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {item.is_available ? (
                            <Eye className="h-4 w-4 text-green-600" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          Menu Item
                        </span>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
