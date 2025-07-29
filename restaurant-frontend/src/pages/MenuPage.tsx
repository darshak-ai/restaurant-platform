import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Star, Filter } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useStore } from '../store/useStore';
import { menuApi } from '../services/api';
import { Menu, MenuItem } from '../types';

export function MenuPage() {
  const navigate = useNavigate();
  const [menu, setMenu] = useState<Menu | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);

  const {
    selectedRestaurant,
    addToCart,
    setLoading,
    setError
  } = useStore();

  useEffect(() => {
    if (!selectedRestaurant) {
      navigate('/locations');
      return;
    }
    loadMenu();
  }, [selectedRestaurant]);

  useEffect(() => {
    filterItems();
  }, [menu, searchQuery, selectedCategory]);

  const loadMenu = async () => {
    if (!selectedRestaurant) return;

    try {
      setLoading(true);
      const menus = await menuApi.getRestaurantMenus(selectedRestaurant.id);
      
      if (menus.length > 0) {
        const defaultMenu = menus.find(m => m.is_default) || menus[0];
        setMenu(defaultMenu);
      }
    } catch (error) {
      console.error('Error loading menu:', error);
      setError('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    if (!menu) return;

    let items = menu.items;

    if (selectedCategory !== 'all') {
      items = items.filter(item => item.category_id.toString() === selectedCategory);
    }

    if (searchQuery) {
      items = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    items.sort((a, b) => a.display_order - b.display_order);

    setFilteredItems(items);
  };

  const handleAddToCart = (item: MenuItem) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image_url: item.image_url
    });
  };


  if (!selectedRestaurant) {
    return null;
  }

  if (!menu) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {menu.name}
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              {menu.description || `Menu for ${selectedRestaurant.name}`}
            </p>

            {/* Search */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Categories Sidebar */}
          <div className="lg:w-64">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Categories
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-orange-100 text-orange-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  All Items ({menu.items.length})
                </button>
                {menu.categories
                  .sort((a, b) => a.display_order - b.display_order)
                  .map((category) => {
                    const itemCount = menu.items.filter(item => item.category_id === category.id).length;
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id.toString())}
                        className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                          selectedCategory === category.id.toString()
                            ? 'bg-orange-100 text-orange-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {category.name} ({itemCount})
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="flex-1">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  {searchQuery ? 'No items found matching your search.' : 'No items available.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="flex">
                      <div className="flex-1 p-6">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {item.name}
                          </h3>
                          {item.is_featured && (
                            <Badge variant="secondary" className="ml-2">
                              Featured
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-gray-600 mb-3 line-clamp-2">
                          {item.description}
                        </p>

                        <div className="flex items-center justify-between mb-4">
                          <span className="text-2xl font-bold text-orange-600">
                            ${item.price.toFixed(2)}
                          </span>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            {item.calories && (
                              <span>{item.calories} cal</span>
                            )}
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span>4.8</span>
                            </div>
                          </div>
                        </div>

                        {/* Dietary Info */}
                        {item.dietary_info && item.dietary_info.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {item.dietary_info.map((info, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {info}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <Button
                          onClick={() => handleAddToCart(item)}
                          disabled={!item.is_available}
                          className="w-full"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          {item.is_available ? 'Add to Cart' : 'Unavailable'}
                        </Button>
                      </div>

                      {/* Item Image */}
                      <div className="w-32 h-32 bg-gray-200 flex-shrink-0">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <span className="text-2xl">🍽️</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
