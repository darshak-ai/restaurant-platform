import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Clock,
  Edit,
  Save,
  X
} from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useStore } from '../../store/useStore';
import { restaurantApi } from '../../services/api';
import { Restaurant } from '../../types';

export function AdminRestaurant() {
  const navigate = useNavigate();
  const { user, logout } = useStore();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin/login');
      return;
    }
    
    loadRestaurants();
  }, [user, navigate]);

  const loadRestaurants = async () => {
    try {
      const data = await restaurantApi.getRestaurants();
      setRestaurants(data);
      if (data.length > 0) {
        setSelectedRestaurant(data[0]);
      }
    } catch (error) {
      console.error('Failed to load restaurants:', error);
    }
  };

  const handleEdit = (restaurant: Restaurant) => {
    setEditingRestaurant({ ...restaurant });
  };

  const handleSave = async () => {
    if (!editingRestaurant) return;

    try {
      setIsSaving(true);
      const updatedRestaurant = await restaurantApi.updateRestaurant(
        editingRestaurant.id,
        editingRestaurant
      );
      
      setRestaurants(restaurants.map(r => 
        r.id === updatedRestaurant.id ? updatedRestaurant : r
      ));
      
      if (selectedRestaurant?.id === updatedRestaurant.id) {
        setSelectedRestaurant(updatedRestaurant);
      }
      
      setEditingRestaurant(null);
    } catch (error) {
      console.error('Failed to update restaurant:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingRestaurant(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const updateEditingField = (field: keyof Restaurant, value: any) => {
    if (editingRestaurant) {
      setEditingRestaurant({
        ...editingRestaurant,
        [field]: value
      });
    }
  };

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
                <h1 className="text-2xl font-bold text-gray-900">Restaurant Management</h1>
                <p className="text-sm text-gray-600">Manage restaurant information and settings</p>
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
              <p className="text-sm text-gray-600">Choose a restaurant to manage</p>
            </div>
            <select
              value={selectedRestaurant?.id || ''}
              onChange={(e) => {
                const restaurant = restaurants.find(r => r.id === Number(e.target.value));
                setSelectedRestaurant(restaurant || null);
                setEditingRestaurant(null);
              }}
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                {!editingRestaurant ? (
                  <Button
                    variant="outline"
                    onClick={() => handleEdit(selectedRestaurant)}
                    className="flex items-center space-x-2"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit</span>
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center space-x-2"
                    >
                      <Save className="h-4 w-4" />
                      <span>{isSaving ? 'Saving...' : 'Save'}</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      className="flex items-center space-x-2"
                    >
                      <X className="h-4 w-4" />
                      <span>Cancel</span>
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Restaurant Name
                  </label>
                  {editingRestaurant ? (
                    <Input
                      value={editingRestaurant.name}
                      onChange={(e) => updateEditingField('name', e.target.value)}
                    />
                  ) : (
                    <p className="text-gray-900">{selectedRestaurant.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  {editingRestaurant ? (
                    <textarea
                      value={editingRestaurant.description || ''}
                      onChange={(e) => updateEditingField('description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  ) : (
                    <p className="text-gray-900">{selectedRestaurant.description || 'No description'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  {editingRestaurant ? (
                    <Input
                      value={editingRestaurant.phone_number}
                      onChange={(e) => updateEditingField('phone_number', e.target.value)}
                    />
                  ) : (
                    <p className="text-gray-900">{selectedRestaurant.phone_number}</p>
                  )}
                </div>
              </div>
            </Card>

            {/* Contact Information */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Contact Information</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    {editingRestaurant ? (
                      <Input
                        value={editingRestaurant.address}
                        onChange={(e) => updateEditingField('address', e.target.value)}
                      />
                    ) : (
                      <p className="text-gray-900">{selectedRestaurant.address}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Info
                    </label>
                    {editingRestaurant ? (
                      <Input
                        value={editingRestaurant.phone_number}
                        onChange={(e) => updateEditingField('phone_number', e.target.value)}
                      />
                    ) : (
                      <p className="text-gray-900">{selectedRestaurant.phone_number}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    {editingRestaurant ? (
                      <Input
                        value={editingRestaurant.email || ''}
                        onChange={(e) => updateEditingField('email', e.target.value)}
                      />
                    ) : (
                      <p className="text-gray-900">{selectedRestaurant.email || 'Not provided'}</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Operating Hours */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Operating Hours</span>
              </h3>
              
              <div className="space-y-3">
                {editingRestaurant ? (
                  <textarea
                    value={typeof editingRestaurant.opening_hours === 'string' ? editingRestaurant.opening_hours : JSON.stringify(editingRestaurant.opening_hours) || ''}
                    onChange={(e) => updateEditingField('opening_hours', e.target.value)}
                    rows={4}
                    placeholder="e.g., Mon-Fri: 9:00 AM - 10:00 PM&#10;Sat-Sun: 10:00 AM - 11:00 PM"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                ) : (
                  <p className="text-gray-900 whitespace-pre-line">
                    {typeof selectedRestaurant.opening_hours === 'string' ? selectedRestaurant.opening_hours : JSON.stringify(selectedRestaurant.opening_hours) || 'Operating hours not specified'}
                  </p>
                )}
              </div>
            </Card>

            {/* Status & Settings */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Status & Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Restaurant Active
                    </label>
                    <p className="text-sm text-gray-500">
                      Controls if the restaurant appears in listings
                    </p>
                  </div>
                  {editingRestaurant ? (
                    <input
                      type="checkbox"
                      checked={editingRestaurant.is_active}
                      onChange={(e) => updateEditingField('is_active', e.target.checked)}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                  ) : (
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      selectedRestaurant.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedRestaurant.is_active ? 'Active' : 'Inactive'}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Currently Open
                    </label>
                    <p className="text-sm text-gray-500">
                      Controls if customers can place orders
                    </p>
                  </div>
                  {editingRestaurant ? (
                    <input
                      type="checkbox"
                      checked={editingRestaurant.is_active}
                      onChange={(e) => updateEditingField('is_active', e.target.checked)}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                  ) : (
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      selectedRestaurant.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedRestaurant.is_active ? 'Open' : 'Closed'}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
