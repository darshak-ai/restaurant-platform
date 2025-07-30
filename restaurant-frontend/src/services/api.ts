import axios from 'axios';
import { Restaurant, Menu, MenuItem, Order, User, CMSContent } from '../types';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (credentials: { username: string; password: string }) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  register: async (userData: {
    email: string;
    username: string;
    password: string;
    full_name: string;
  }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export const restaurantApi = {
  getRestaurants: async (): Promise<Restaurant[]> => {
    const response = await api.get('/restaurants/');
    return response.data;
  },
  
  getRestaurant: async (id: number): Promise<Restaurant> => {
    const response = await api.get(`/restaurants/${id}`);
    return response.data;
  },
  
  getNearbyRestaurants: async (latitude: number, longitude: number, radius: number = 10): Promise<Restaurant[]> => {
    const response = await api.get('/restaurants/nearby', {
      params: { latitude, longitude, radius }
    });
    return response.data;
  },
  
  createRestaurant: async (restaurantData: Partial<Restaurant>): Promise<Restaurant> => {
    const response = await api.post('/restaurants/', restaurantData);
    return response.data;
  },
  
  updateRestaurant: async (id: number, restaurantData: Partial<Restaurant>): Promise<Restaurant> => {
    const response = await api.put(`/restaurants/${id}`, restaurantData);
    return response.data;
  },
  
  deleteRestaurant: async (id: number): Promise<void> => {
    await api.delete(`/restaurants/${id}`);
  },
};

export const menuApi = {
  getRestaurantMenus: async (restaurantId: number): Promise<Menu[]> => {
    const response = await api.get(`/menus/restaurant/${restaurantId}`);
    return response.data;
  },
  
  getMenuWithItems: async (menuId: number): Promise<Menu> => {
    const response = await api.get(`/menus/${menuId}`);
    return response.data;
  },
  
  getFeaturedItems: async (restaurantId: number): Promise<MenuItem[]> => {
    const response = await api.get(`/menus/restaurant/${restaurantId}/featured`);
    return response.data;
  },
  
  searchMenuItems: async (restaurantId: number, query: string): Promise<MenuItem[]> => {
    const response = await api.get(`/menus/restaurant/${restaurantId}/search`, {
      params: { q: query }
    });
    return response.data;
  },
  
  createMenu: async (menuData: Partial<Menu>): Promise<Menu> => {
    const response = await api.post('/menus/', menuData);
    return response.data;
  },
  
  updateMenu: async (id: number, menuData: Partial<Menu>): Promise<Menu> => {
    const response = await api.put(`/menus/${id}`, menuData);
    return response.data;
  },
  
  deleteMenu: async (id: number): Promise<void> => {
    await api.delete(`/menus/${id}`);
  },
};

export const orderApi = {
  createOrder: async (orderData: Partial<Order>): Promise<Order> => {
    const response = await api.post('/orders/', orderData);
    return response.data;
  },
  
  getOrder: async (id: number): Promise<Order> => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },
  
  getOrderByNumber: async (orderNumber: string): Promise<Order> => {
    const response = await api.get(`/orders/number/${orderNumber}`);
    return response.data;
  },
  
  verifyOTP: async (orderId: number, phoneNumber: string, otpCode: string): Promise<{ verified: boolean }> => {
    const response = await api.post(`/orders/${orderId}/verify-otp`, {
      phone_number: phoneNumber,
      otp_code: otpCode
    });
    return response.data;
  },
  
  getOrders: async (restaurantId?: number): Promise<Order[]> => {
    const response = await api.get('/orders/', {
      params: restaurantId ? { restaurant_id: restaurantId } : {}
    });
    return response.data;
  },
  
  getAllOrders: async (): Promise<Order[]> => {
    const response = await api.get('/orders/');
    return response.data;
  },
  
  updateOrder: async (id: number, orderData: Partial<Order>): Promise<Order> => {
    const response = await api.put(`/orders/${id}`, orderData);
    return response.data;
  },
  
  updateOrderStatus: async (id: number, status: string): Promise<Order> => {
    const response = await api.put(`/orders/${id}`, { status });
    return response.data;
  },
  
  getAnalytics: async (restaurantId?: number): Promise<any> => {
    if (restaurantId) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30); // Last 30 days
      const endDate = new Date();
      
      const response = await api.get(`/orders/restaurant/${restaurantId}/analytics`, {
        params: {
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString()
        }
      });
      return response.data;
    } else {
      const orders = await api.get('/orders/');
      const orderData = orders.data;
      
      const totalOrders = orderData.length;
      const totalRevenue = orderData.reduce((sum: number, order: any) => sum + order.total_amount, 0);
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      
      const pendingOrders = orderData.filter((order: any) => order.status === 'pending').length;
      const completedOrders = orderData.filter((order: any) => order.status === 'completed').length;
      const cancelledOrders = orderData.filter((order: any) => order.status === 'cancelled').length;
      
      return {
        total_orders: totalOrders,
        total_revenue: totalRevenue,
        average_order_value: averageOrderValue,
        pending_orders: pendingOrders,
        completed_orders: completedOrders,
        cancelled_orders: cancelledOrders
      };
    }
  },
  
  cancelOrder: async (id: number): Promise<void> => {
    await api.delete(`/orders/${id}`);
  },
};

export const cmsApi = {
  getPublishedPages: async (): Promise<CMSContent[]> => {
    const response = await api.get('/cms/pages');
    return response.data;
  },
  
  getGalleryImages: async (): Promise<CMSContent[]> => {
    const response = await api.get('/cms/gallery');
    return response.data;
  },
  
  getHeroBanners: async (): Promise<CMSContent[]> => {
    const response = await api.get('/cms/banners');
    return response.data;
  },
  
  getAnnouncements: async (): Promise<CMSContent[]> => {
    const response = await api.get('/cms/announcements');
    return response.data;
  },
  
  getContactInfo: async (): Promise<CMSContent> => {
    const response = await api.get('/cms/contact');
    return response.data;
  },
  
  getContentBySlug: async (slug: string): Promise<CMSContent> => {
    const response = await api.get(`/cms/slug/${slug}`);
    return response.data;
  },
  
  searchContent: async (query: string): Promise<CMSContent[]> => {
    const response = await api.get('/cms/search', {
      params: { q: query }
    });
    return response.data;
  },
  
  createContent: async (contentData: Partial<CMSContent>): Promise<CMSContent> => {
    const response = await api.post('/cms/', contentData);
    return response.data;
  },
  
  updateContent: async (id: number, contentData: Partial<CMSContent>): Promise<CMSContent> => {
    const response = await api.put(`/cms/${id}`, contentData);
    return response.data;
  },
  
  deleteContent: async (id: number): Promise<void> => {
    await api.delete(`/cms/${id}`);
  },
};

export const locationApi = {
  getCurrentLocation: (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  },
};

export default api;
