'use client';

import { useState, useEffect } from 'react';
import { 
  HeartIcon, 
  ClockIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../../lib/contexts/AuthContext';
import { usePopup } from '../../lib/contexts/PopupContext';

interface Restaurant {
  id: number;
  name: string;
  phoneNumber?: string;
  description?: string;
}

interface Box {
  id: number;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  isAvailable: boolean;
  restaurant: Restaurant;
}

export default function RestaurantFeedPage() {
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  
  const { user, logout } = useAuth();
  const { showConfirm, showSuccessToast, showErrorToast } = usePopup();

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBoxes();
    }, searchQuery ? 500 : 0); // 500ms delay for search, immediate for category

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory]);

  const fetchBoxes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      
      const response = await fetch(`/api/feed?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setBoxes(data.data.boxes);
      } else {
        console.error('Failed to fetch boxes:', data.error);
        // Fallback to mock data
        setBoxes([
          {
            id: 1,
            title: 'Classic Spaghetti Carbonara Box',
            price: 15.99,
            quantity: 25,
            image: '/images/carbonara-box.jpg',
            isAvailable: true,
            restaurant: { id: 1, name: 'Pasta Palace', description: 'Authentic Italian cuisine' }
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching boxes:', error);
      // Fallback to mock data
      setBoxes([
        {
          id: 1,
          title: 'Classic Spaghetti Carbonara Box',
          price: 15.99,
          quantity: 25,
          image: '/images/carbonara-box.jpg',
          isAvailable: true,
          restaurant: { id: 1, name: 'Pasta Palace', description: 'Authentic Italian cuisine' }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (boxId: number) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(boxId)) {
        newFavorites.delete(boxId);
        showSuccessToast('Removed from favorites');
      } else {
        newFavorites.add(boxId);
        showSuccessToast('Added to favorites');
      }
      return newFavorites;
    });
  };

  const handleLogout = () => {
    showConfirm({
      title: 'Sign Out',
      message: 'Are you sure you want to sign out?',
      description: 'You will need to login again to access your account.',
      type: 'warning',
      confirmLabel: 'Sign Out',
      onConfirm: () => {
        logout();
        showSuccessToast('You have been signed out successfully.');
      }
    });
  };

  const handleAddToCart = (box: Box) => {
    if (!user) {
      showConfirm({
        title: 'Login Required',
        message: 'You need to be logged in to add items to cart.',
        description: 'Would you like to go to the login page?',
        confirmLabel: 'Go to Login',
        onConfirm: () => {
          window.location.href = '/login';
        }
      });
      return;
    }

    // TODO: Implement actual cart functionality
    showSuccessToast(`Added "${box.title}" to cart!`);
  };

  const filteredBoxes = boxes.filter(box => {
    const matchesSearch = box.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         box.restaurant.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           (selectedCategory === 'available' && box.isAvailable) ||
                           (selectedCategory === 'sold-out' && !box.isAvailable);
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'available', name: 'Available' },
    { id: 'sold-out', name: 'Sold Out' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading delicious boxes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <span className="text-lg font-bold text-white">W</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Wyzly Feed</h1>
                <p className="text-sm text-gray-600">
                  {user ? `Welcome back, ${user.username}!` : 'Discover amazing food boxes'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {user && (
                <button 
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-red-600 transition-colors rounded-lg hover:bg-gray-100"
                  title="Logout"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  <span className="text-sm font-medium hidden sm:block">Logout</span>
                </button>
              )}
              <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <FunnelIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-4 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search restaurants or food boxes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-100 border-0 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
            />
          </div>

          {/* Categories */}
          <div className="mt-4 flex space-x-2 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category.id
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {filteredBoxes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🍽️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No boxes found</h3>
            <p className="text-gray-600">Try adjusting your search or category filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBoxes.map((box) => (
              <div
                key={box.id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                {/* Image */}
                <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                  {box.image ? (
                    <img
                      src={box.image}
                      alt={box.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl">🥘</span>
                    </div>
                  )}
                  
                  {/* Favorite Button */}
                  <button
                    onClick={() => toggleFavorite(box.id)}
                    className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all"
                  >
                    {favorites.has(box.id) ? (
                      <HeartSolidIcon className="h-5 w-5 text-red-500" />
                    ) : (
                      <HeartIcon className="h-5 w-5 text-gray-600" />
                    )}
                  </button>

                  {/* Availability Badge */}
                  {!box.isAvailable && (
                    <div className="absolute top-3 left-3 px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
                      Sold Out
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  {/* Restaurant Info */}
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="h-6 w-6 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {box.restaurant.name.charAt(0)}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {box.restaurant.name}
                    </span>
                  </div>

                  {/* Box Title */}
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {box.title}
                  </h3>

                  {/* Price and Quantity */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-orange-600">
                      ${box.price.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {box.quantity > 0 ? `${box.quantity} left` : 'Out of stock'}
                    </span>
                  </div>

                  {/* Order Button */}
                  <button
                    onClick={() => handleAddToCart(box)}
                    disabled={!box.isAvailable}
                    className={`w-full py-3 px-4 rounded-xl font-medium transition-all ${
                      box.isAvailable
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {box.isAvailable ? 'Add to Cart' : 'Sold Out'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation Spacer */}
      <div className="h-20"></div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 sm:hidden">
        <div className="flex items-center justify-around">
          <button className="flex flex-col items-center space-y-1 text-orange-500">
            <div className="h-6 w-6 bg-orange-500 rounded-md"></div>
            <span className="text-xs font-medium">Feed</span>
          </button>
          <button className="flex flex-col items-center space-y-1 text-gray-400">
            <HeartIcon className="h-6 w-6" />
            <span className="text-xs">Favorites</span>
          </button>
          <button className="flex flex-col items-center space-y-1 text-gray-400">
            <ClockIcon className="h-6 w-6" />
            <span className="text-xs">Orders</span>
          </button>
          <button className="flex flex-col items-center space-y-1 text-gray-400">
            <div className="h-6 w-6 bg-gray-300 rounded-full"></div>
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}