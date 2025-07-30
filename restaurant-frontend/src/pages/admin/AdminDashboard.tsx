import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  ShoppingBag, 
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useStore } from '../../store/useStore';
import { orderApi } from '../../services/api';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useStore();
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin/login');
      return;
    }
    
    loadDashboardStats();
  }, [user, navigate]);

  const loadDashboardStats = async () => {
    try {
      setIsLoading(true);
      const analytics = await orderApi.getAnalytics();
      
      setStats({
        totalOrders: analytics.total_orders || 0,
        totalRevenue: analytics.total_revenue || 0,
        averageOrderValue: analytics.average_order_value || 0,
        pendingOrders: analytics.pending_orders || 0,
        completedOrders: analytics.completed_orders || 0,
        cancelledOrders: analytics.cancelled_orders || 0
      });
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, {user.full_name}</p>
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
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Button
            onClick={() => navigate('/admin/orders')}
            className="h-20 flex flex-col items-center justify-center"
          >
            <ShoppingBag className="h-6 w-6 mb-2" />
            Manage Orders
          </Button>
          <Button
            onClick={() => navigate('/admin/menu')}
            className="h-20 flex flex-col items-center justify-center"
            variant="outline"
          >
            <BarChart3 className="h-6 w-6 mb-2" />
            Manage Menu
          </Button>
          <Button
            onClick={() => navigate('/admin/restaurant')}
            className="h-20 flex flex-col items-center justify-center"
            variant="outline"
          >
            <Users className="h-6 w-6 mb-2" />
            Restaurant Info
          </Button>
          <Button
            onClick={() => navigate('/admin/cms')}
            className="h-20 flex flex-col items-center justify-center"
            variant="outline"
          >
            <AlertCircle className="h-6 w-6 mb-2" />
            Content Management
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900">
                  {isLoading ? '...' : stats.totalOrders}
                </p>
              </div>
              <ShoppingBag className="h-8 w-8 text-orange-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">
                  {isLoading ? '...' : `$${stats.totalRevenue.toFixed(2)}`}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Order</p>
                <p className="text-3xl font-bold text-gray-900">
                  {isLoading ? '...' : `$${stats.averageOrderValue.toFixed(2)}`}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-3xl font-bold text-gray-900">
                  {isLoading ? '...' : stats.pendingOrders}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </Card>
        </div>

        {/* Order Status Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Pending Orders</h3>
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-yellow-600">
              {isLoading ? '...' : stats.pendingOrders}
            </p>
            <p className="text-sm text-gray-600 mt-2">Orders awaiting processing</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Completed Orders</h3>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-600">
              {isLoading ? '...' : stats.completedOrders}
            </p>
            <p className="text-sm text-gray-600 mt-2">Successfully completed orders</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Cancelled Orders</h3>
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <p className="text-3xl font-bold text-red-600">
              {isLoading ? '...' : stats.cancelledOrders}
            </p>
            <p className="text-sm text-gray-600 mt-2">Orders that were cancelled</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
