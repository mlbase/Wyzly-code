'use client';

import { useState, useEffect } from 'react';
import { 
  HeartIcon, 
  ClockIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  ReceiptRefundIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../../lib/contexts/AuthContext';
import { usePopup } from '../../lib/contexts/PopupContext';
import { useWishlist } from '../../lib/hooks/useWishlist';
import { useFavorites } from '../../lib/hooks/useFavorites';
import { Button, Card, Input, Badge, WishlistToggle, WishlistSidebar } from '../../lib/design-system';
import { LoginPopup } from '../../lib/components/ui/LoginPopup';
import { BoxCard } from '../../lib/components/ui/BoxCard';

interface Restaurant {
  id: number;
  name: string;
  phoneNumber?: string;
  description?: string;
  ownerId: number;
  createdAt: string;
  updatedAt: string;
}

interface Box {
  id: number;
  title: string;
  price: number | string; // Can be Decimal from Prisma
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
  const [wishlistSidebarOpen, setWishlistSidebarOpen] = useState(false);
  const [loginPopupOpen, setLoginPopupOpen] = useState(false);
  
  const { user, logout } = useAuth();
  const { showConfirm, showSuccessToast, showErrorToast } = usePopup();
  const { 
    wishlist, 
    isInWishlist, 
    addToWishlist, 
    removeFromWishlist,
    updateWishlistItem,
    clearWishlist,
    forceSyncWithServer,
    isOfflineMode,
    syncStatus 
  } = useWishlist();

  const { 
    isFavorite, 
    toggleFavorite
  } = useFavorites();

  // Check for sync on mount when user is logged in
  useEffect(() => {
    if (user && !isOfflineMode) {
      // Check if there's local wishlist data that needs syncing
      const hasLocalData = typeof window !== 'undefined' && 
        (localStorage.getItem('wyzly_local_wishlist')?.length ?? 0) > 2; // More than just "[]"
      
      if (hasLocalData) {
        forceSyncWithServer();
      }
    }
  }, [user, isOfflineMode, forceSyncWithServer]);

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
      
      const response = await fetch(`/api/boxes?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setBoxes(data.data.boxes);
      } else {
        console.error('Failed to fetch boxes:', data.error);
        showErrorToast('Failed to fetch boxes', data.error);
        setBoxes([]); // Clear boxes on error
      }
    } catch (error) {
      console.error('Error fetching boxes:', error);
      showErrorToast('Failed to fetch boxes', 'Network error');
      setBoxes([]); // Clear boxes on error
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = (boxId: number) => {
    const newStatus = toggleFavorite(boxId);
    if (newStatus) {
      showSuccessToast('Added to favorites');
    } else {
      showSuccessToast('Removed from favorites');
    }
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

  const handleAddToCart = (quantity: number) => {
    // TODO: Implement actual cart functionality (this would be for final checkout)
    showSuccessToast(`Added ${quantity} item(s) to cart!`);
  };

  const handleAddToWishlist = async (box: Box) => {
    const inWishlist = isInWishlist(box.id);
    
    if (inWishlist) {
      const success = await removeFromWishlist(box.id);
      if (success) {
        if (isOfflineMode) {
          showSuccessToast(`Removed "${box.title}" from wishlist • Sign in to sync`);
        } else {
          showSuccessToast(`Removed "${box.title}" from wishlist`);
        }
      } else {
        showErrorToast('Failed to remove from wishlist');
      }
    } else {
      const success = await addToWishlist(box.id, 'medium', undefined, 1);
      if (success) {
        if (isOfflineMode) {
          showSuccessToast(`Added "${box.title}" to wishlist • Sign in to sync`);
        } else {
          showSuccessToast(`Added "${box.title}" to wishlist`);
        }
      } else {
        showErrorToast('Failed to add to wishlist');
      }
    }
  };


  const handleWishlistRemove = async (boxId: number) => {
    const success = await removeFromWishlist(boxId);
    if (success) {
      showSuccessToast('Item removed from wishlist');
    } else {
      showErrorToast('Failed to remove item');
    }
  };

  const handleWishlistUpdateQuantity = async (boxId: number, quantity: number) => {
    const success = await updateWishlistItem(boxId, undefined, undefined, quantity);
    if (!success) {
      showErrorToast('Failed to update quantity');
    }
  };

  const handleWishlistClearAll = async () => {
    const success = await clearWishlist();
    if (success) {
      if (isOfflineMode) {
        showSuccessToast('Cart cleared • Sign in to sync');
      } else {
        showSuccessToast('Cart cleared');
      }
    } else {
      showErrorToast('Failed to clear cart');
    }
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
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-bold text-gray-900">Wyzly Feed</h1>
                  {isOfflineMode && (
                    <Badge variant="warning" size="sm">
                      Offline
                    </Badge>
                  )}
                  {syncStatus === 'syncing' && (
                    <Badge variant="primary" size="sm">
                      Syncing...
                    </Badge>
                  )}
                  {syncStatus === 'synced' && (
                    <Badge variant="success" size="sm">
                      Synced
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {user ? `Welcome back, ${user.username}!` : 'Discover amazing food boxes'}
                  {isOfflineMode && (
                    <span className="text-amber-600"> • Cart saved locally</span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* Orders Button */}
              {user && (
                <button
                  onClick={() => window.location.href = '/orders/me'}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-orange-600 transition-colors rounded-lg hover:bg-gray-100"
                  title="My Orders"
                >
                  <ReceiptRefundIcon className="h-5 w-5" />
                  <span className="text-sm font-medium hidden sm:block">Orders</span>
                </button>
              )}
              
              {/* Cart Toggle */}
              <WishlistToggle 
                itemCount={wishlist?.itemCount || 0}
                onClick={() => setWishlistSidebarOpen(true)}
              />
              
              {user ? (
                <button 
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-red-600 transition-colors rounded-lg hover:bg-gray-100"
                  title="Logout"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  <span className="text-sm font-medium hidden sm:block">Logout</span>
                </button>
              ) : (
                <button 
                  onClick={() => setLoginPopupOpen(true)}
                  className="flex items-center space-x-2 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white transition-colors rounded-lg"
                  title="Login"
                >
                  <UserIcon className="h-5 w-5" />
                  <span className="text-sm font-medium hidden sm:block">Login</span>
                </button>
              )}
              <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <FunnelIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-4">
            <Input
              type="text"
              placeholder="Search restaurants or food boxes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              variant="filled"
              size="lg"
              leftIcon={<MagnifyingGlassIcon className="h-5 w-5" />}
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
              <BoxCard
                key={box.id}
                box={box}
                onToggleFavorite={handleToggleFavorite}
                onAddToWishlist={handleAddToWishlist}
                isFavorite={isFavorite}
                isInWishlist={isInWishlist}
                showRestaurantInfo={true}
              />
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
          <button 
            onClick={() => window.location.href = '/orders/me'}
            className="flex flex-col items-center space-y-1 text-gray-400"
          >
            <ClockIcon className="h-6 w-6" />
            <span className="text-xs">Orders</span>
          </button>
          <button className="flex flex-col items-center space-y-1 text-gray-400">
            <div className="h-6 w-6 bg-gray-300 rounded-full"></div>
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </div>

      {/* Cart Sidebar */}
      <WishlistSidebar
        isOpen={wishlistSidebarOpen}
        onClose={() => setWishlistSidebarOpen(false)}
        items={wishlist?.items || []}
        onRemoveItem={handleWishlistRemove}
        onUpdateQuantity={handleWishlistUpdateQuantity}
        onAddToCart={handleAddToCart}
        onClearAll={handleWishlistClearAll}
        loading={false}
      />

      {/* Login Popup */}
      <LoginPopup
        isOpen={loginPopupOpen}
        onClose={() => setLoginPopupOpen(false)}
        onSuccess={() => {
          // Login successful, local data will be automatically synced by useWishlist hook
          showSuccessToast('Login successful! Your cart will sync automatically.');
        }}
      />
    </div>
  );
}