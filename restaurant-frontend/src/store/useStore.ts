import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Restaurant, CartItem, Order, User, LocationCoords } from '../types';

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  
  selectedRestaurant: Restaurant | null;
  nearbyRestaurants: Restaurant[];
  userLocation: LocationCoords | null;
  
  cart: CartItem[];
  currentOrder: Order | null;
  orderHistory: Order[];
  
  isLoading: boolean;
  error: string | null;
  
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
  
  setSelectedRestaurant: (restaurant: Restaurant | null) => void;
  setNearbyRestaurants: (restaurants: Restaurant[]) => void;
  setUserLocation: (location: LocationCoords | null) => void;
  
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: number) => void;
  updateCartItem: (itemId: number, updates: Partial<CartItem>) => void;
  updateCartItemQuantity: (itemId: number, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartSubtotal: () => number;
  getTaxAmount: () => number;
  getCartItemCount: () => number;
  
  setCurrentOrder: (order: Order | null) => void;
  addToOrderHistory: (order: Order) => void;
  
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      token: null,
      
      selectedRestaurant: null,
      nearbyRestaurants: [],
      userLocation: null,
      
      cart: [],
      currentOrder: null,
      orderHistory: [],
      
      isLoading: false,
      error: null,
      
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
      logout: () => set({ 
        user: null, 
        isAuthenticated: false, 
        token: null,
        cart: [],
        currentOrder: null
      }),
      
      setSelectedRestaurant: (restaurant) => set({ selectedRestaurant: restaurant }),
      setNearbyRestaurants: (restaurants) => set({ nearbyRestaurants: restaurants }),
      setUserLocation: (location) => set({ userLocation: location }),
      
      addToCart: (item) => set((state) => {
        const existingItem = state.cart.find(cartItem => cartItem.id === item.id);
        if (existingItem) {
          return {
            cart: state.cart.map(cartItem =>
              cartItem.id === item.id
                ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
                : cartItem
            )
          };
        }
        return { cart: [...state.cart, item] };
      }),
      
      removeFromCart: (itemId) => set((state) => ({
        cart: state.cart.filter(item => item.id !== itemId)
      })),
      
      updateCartItem: (itemId, updates) => set((state) => ({
        cart: state.cart.map(item =>
          item.id === itemId ? { ...item, ...updates } : item
        )
      })),

      updateCartItemQuantity: (itemId, quantity) => set((state) => ({
        cart: state.cart.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        )
      })),
      
      clearCart: () => set({ cart: [] }),

      getCartTotal: () => {
        const { cart } = get();
        const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        const tax = subtotal * 0.0875; // 8.75% tax rate
        return subtotal + tax;
      },

      getCartSubtotal: () => {
        const { cart } = get();
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
      },

      getTaxAmount: () => {
        const { cart } = get();
        const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        return subtotal * 0.0875; // 8.75% tax rate
      },

      getCartItemCount: () => {
        const { cart } = get();
        return cart.reduce((count, item) => count + item.quantity, 0);
      },
      
      setCurrentOrder: (order) => set({ currentOrder: order }),
      addToOrderHistory: (order) => set((state) => ({
        orderHistory: [order, ...state.orderHistory]
      })),
      
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'restaurant-app-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        selectedRestaurant: state.selectedRestaurant,
        userLocation: state.userLocation,
        cart: state.cart,
        orderHistory: state.orderHistory,
      }),
    }
  )
);
