'use client';

import { useState } from 'react';
import { 
  HeartIcon,
  ShoppingCartIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../lib/contexts/AuthContext';
import { usePopup } from '../../lib/contexts/PopupContext';
import { useWishlist } from '../../lib/hooks/useWishlist';
import { 
  Button, 
  Card, 
  Input, 
  Badge, 
  WishlistSidebar, 
  WishlistToggle,
  WishlistCard 
} from '../../lib/design-system';

export default function WishlistPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'available' | 'unavailable'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { user, logout } = useAuth();
  const { showConfirm, showSuccessToast, showErrorToast } = usePopup();
  const {
    wishlist,
    loading,
    error,
    removeFromWishlist,
    updateWishlistItem,
    clearWishlist
  } = useWishlist();

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

  const handleRemoveItem = async (boxId: number) => {
    const success = await removeFromWishlist(boxId);
    if (success) {
      showSuccessToast('Item removed from wishlist');
    } else {
      showErrorToast('Failed to remove item');
    }
  };

  const handleUpdateQuantity = async (boxId: number, quantity: number) => {
    const success = await updateWishlistItem(boxId, undefined, undefined, quantity);
    if (!success) {
      showErrorToast('Failed to update quantity');
    }
  };

  const handleAddToCart = (boxId: number, quantity: number = 1) => {
    // TODO: Implement actual cart functionality
    showSuccessToast(`Added ${quantity} item(s) to cart!`);
  };

  const handleClearAll = () => {
    showConfirm({
      title: 'Clear Wishlist',
      message: 'Are you sure you want to clear your entire wishlist?',
      description: 'This action cannot be undone.',
      type: 'danger',
      confirmLabel: 'Clear All',
      onConfirm: async () => {
        const success = await clearWishlist();
        if (success) {
          showSuccessToast('Wishlist cleared successfully');
        } else {
          showErrorToast('Failed to clear wishlist');
        }
      }
    });
  };

  // Filter and search logic
  const filteredItems = wishlist?.items.filter((item) => {
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'available' && item.box.isAvailable) ||
      (filter === 'unavailable' && !item.box.isAvailable);
    
    const matchesSearch = 
      !searchQuery ||
      item.box.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.box.restaurant.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  }) || [];

  const filters = [
    { id: 'all', name: 'All Items', count: wishlist?.itemCount || 0 },
    { id: 'available', name: 'Available', count: wishlist?.availableCount || 0 },
    { id: 'unavailable', name: 'Sold Out', count: wishlist?.unavailableCount || 0 }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card variant="elevated" radius="lg" padding="lg" className="max-w-md text-center">
          <HeartIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Sign In Required</h2>
          <p className="text-gray-600 mb-4">Please sign in to view your wishlist.</p>
          <Button 
            variant="primary" 
            onClick={() => window.location.href = '/login'}
            fullWidth
          >
            Sign In
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <span className="text-lg font-bold text-white">W</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">My Wishlist</h1>
                <p className="text-sm text-gray-600">
                  {user ? `Welcome back, ${user.username}!` : 'Manage your saved items'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Wishlist Sidebar Toggle */}
              <WishlistToggle 
                itemCount={wishlist?.itemCount || 0}
                onClick={() => setSidebarOpen(true)}
              />
              
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
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mt-4 space-y-4">
            <Input
              type="text"
              placeholder="Search your wishlist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              variant="filled"
              size="lg"
              leftIcon={<MagnifyingGlassIcon className="h-5 w-5" />}
            />

            <div className="flex space-x-2 overflow-x-auto">
              {filters.map((filterOption) => (
                <button
                  key={filterOption.id}
                  onClick={() => setFilter(filterOption.id as 'all' | 'available' | 'unavailable')}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center space-x-2 ${
                    filter === filterOption.id
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>{filterOption.name}</span>
                  <Badge variant={filter === filterOption.id ? 'outline' : 'default'} size="sm">
                    {filterOption.count}
                  </Badge>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600">Loading your wishlist...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading wishlist</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button variant="primary" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <HeartIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {wishlist?.itemCount === 0 ? 'Your wishlist is empty' : 'No items match your filter'}
            </h3>
            <p className="text-gray-600 mb-4">
              {wishlist?.itemCount === 0 
                ? 'Add items you love to save them for later!' 
                : 'Try adjusting your search or filter criteria'
              }
            </p>
            {wishlist?.itemCount === 0 && (
              <Button 
                variant="primary" 
                onClick={() => window.location.href = '/feed'}
              >
                Browse Food Boxes
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary */}
            <Card variant="elevated" radius="lg" padding="lg">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Showing {filteredItems.length} of {wishlist?.itemCount || 0} items
                  </h2>
                  <p className="text-sm text-gray-600">
                    {wishlist?.availableCount || 0} available, {wishlist?.unavailableCount || 0} sold out
                  </p>
                </div>
                
                {wishlist && wishlist.itemCount > 0 && (
                  <Button variant="secondary" size="sm" onClick={handleClearAll}>
                    Clear All
                  </Button>
                )}
              </div>
            </Card>

            {/* Items Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <WishlistCard
                  key={item.boxId}
                  item={item}
                  onRemove={handleRemoveItem}
                  onUpdatePriority={(boxId, priority) => updateWishlistItem(boxId, priority)}
                  onUpdateNotes={(boxId, notes) => updateWishlistItem(boxId, undefined, notes)}
                  onUpdateQuantity={(boxId, quantity) => handleUpdateQuantity(boxId, quantity)}
                  onAddToCart={(boxId, quantity) => handleAddToCart(boxId, quantity || item.quantity || 1)}
                  showActions={true}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Wishlist Sidebar */}
      <WishlistSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        items={wishlist?.items || []}
        onRemoveItem={handleRemoveItem}
        onUpdateQuantity={handleUpdateQuantity}
        onAddToCart={handleAddToCart}
        onClearAll={handleClearAll}
        loading={loading}
      />
    </div>
  );
}