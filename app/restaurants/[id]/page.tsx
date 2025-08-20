'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeftIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  StarIcon,
  ReceiptRefundIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../../lib/contexts/AuthContext';
import { usePopup } from '../../../lib/contexts/PopupContext';
import { useWishlist } from '../../../lib/hooks/useWishlist';
import { useFavorites } from '../../../lib/hooks/useFavorites';
import { Button, Card, Badge, WishlistToggle, WishlistSidebar } from '../../../lib/design-system';
import { BoxCard } from '../../../lib/components/ui/BoxCard';

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
  price: number | string;
  quantity: number;
  image?: string;
  isAvailable: boolean;
  restaurant: Restaurant;
}

interface RestaurantWithBoxes extends Restaurant {
  boxes: Box[];
}

export default function RestaurantDetailPage() {
  const params: Record<string, string | string[]> | null = useParams();
  const router = useRouter();
  let restaurantId = '';
  if (params?.id) {
    if (typeof params.id === 'string') {
      restaurantId = params.id;
    } else if (Array.isArray(params.id)) {
      restaurantId = params.id[0] ?? '';
    }
  }
  
  const [restaurant, setRestaurant] = useState<RestaurantWithBoxes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wishlistSidebarOpen, setWishlistSidebarOpen] = useState(false);

  const { user } = useAuth();
  const { showSuccessToast, showErrorToast } = usePopup();
  const { 
    wishlist,
    isInWishlist, 
    addToWishlist, 
    removeFromWishlist,
    updateWishlistItem,
    clearWishlist,
    isOfflineMode 
  } = useWishlist();
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    fetchRestaurantDetails();
  }, [restaurantId]);

  const fetchRestaurantDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/restaurants/${restaurantId}`);
      const data = await response.json();

      if (data.success) {
        setRestaurant(data.data);
      } else {
        setError(data.error || 'Failed to fetch restaurant details');
      }
    } catch (err) {
      console.error('Error fetching restaurant details:', err);
      setError('Network error occurred');
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

  const handleAddToWishlist = async (box: Box) => {
    const inWishlist = isInWishlist(box.id);
    
    if (inWishlist) {
      const success = await removeFromWishlist(box.id);
      if (success) {
        if (isOfflineMode) {
          showSuccessToast(`Removed "${box.title}" from cart • Sign in to sync`);
        } else {
          showSuccessToast(`Removed "${box.title}" from cart`);
        }
      } else {
        showErrorToast('Failed to remove from cart');
      }
    } else {
      const success = await addToWishlist(box.id, 'medium', undefined, 1);
      if (success) {
        if (isOfflineMode) {
          showSuccessToast(`Added "${box.title}" to cart • Sign in to sync`);
        } else {
          showSuccessToast(`Added "${box.title}" to cart`);
        }
      } else {
        showErrorToast('Failed to add to cart');
      }
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleAddToCart = (quantity: number) => {
    // TODO: Implement actual cart functionality (this would be for final checkout)
    showSuccessToast(`Added ${quantity} item(s) to cart!`);
  };

  const handleWishlistRemove = async (boxId: number) => {
    const success = await removeFromWishlist(boxId);
    if (success) {
      showSuccessToast('Item removed from cart');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading restaurant details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">🍽️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Restaurant Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={handleGoBack} variant="primary">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return null;
  }

  const availableBoxes = restaurant.boxes.filter(box => box.isAvailable);
  const unavailableBoxes = restaurant.boxes.filter(box => !box.isAvailable);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleGoBack}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
                aria-label="Go back"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{restaurant.name}</h1>
                <p className="text-sm text-gray-600">Restaurant Details</p>
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
            </div>
          </div>
        </div>
      </div>

      {/* Restaurant Information */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card variant="default" radius="lg" className="mb-8">
          <div className="p-6">
            {/* Restaurant Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 bg-gradient-to-r from-orange-400 to-red-400 rounded-xl flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {restaurant.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">{restaurant.name}</h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <StarIcon className="h-4 w-4 text-yellow-400" />
                      <span>4.5 (123 reviews)</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="h-4 w-4" />
                      <span>30-45 min</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Contact Info */}
              <div className="text-right">
                {restaurant.phoneNumber && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                    <PhoneIcon className="h-4 w-4" />
                    <span>{restaurant.phoneNumber}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPinIcon className="h-4 w-4" />
                  <span>123 Food Street</span>
                </div>
              </div>
            </div>

            {/* Description */}
            {restaurant.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">About</h3>
                <p className="text-gray-600 leading-relaxed">{restaurant.description}</p>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{restaurant.boxes.length}</div>
                <div className="text-sm text-gray-600">Menu Items</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{availableBoxes.length}</div>
                <div className="text-sm text-gray-600">Available</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{unavailableBoxes.length}</div>
                <div className="text-sm text-gray-600">Sold Out</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Menu Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Menu</h2>
            {restaurant.boxes.length > 0 && (
              <Badge variant="primary" size="sm">
                {restaurant.boxes.length} items
              </Badge>
            )}
          </div>

          {restaurant.boxes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🍽️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No menu items available</h3>
              <p className="text-gray-600">This restaurant hasn't added any boxes yet</p>
            </div>
          ) : (
            <>
              {/* Available Items */}
              {availableBoxes.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Now</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {availableBoxes.map((box) => (
                      <BoxCard
                        key={box.id}
                        box={box}
                        onToggleFavorite={handleToggleFavorite}
                        onAddToWishlist={handleAddToWishlist}
                        isFavorite={isFavorite}
                        isInWishlist={isInWishlist}
                        showRestaurantInfo={false}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Sold Out Items */}
              {unavailableBoxes.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Currently Sold Out</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {unavailableBoxes.map((box) => (
                      <BoxCard
                        key={box.id}
                        box={box}
                        onToggleFavorite={handleToggleFavorite}
                        onAddToWishlist={handleAddToWishlist}
                        isFavorite={isFavorite}
                        isInWishlist={isInWishlist}
                        showRestaurantInfo={false}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Bottom Spacer for Mobile */}
      <div className="h-20"></div>

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
    </div>
  );
}