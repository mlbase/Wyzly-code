'use client';

import { useState } from 'react';
import { 
  ShoppingBagIcon,
  CreditCardIcon,
  CheckCircleIcon,
  UserIcon,
  HeartIcon,
  ReceiptRefundIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../lib/contexts/AuthContext';
import { usePopup } from '../../lib/contexts/PopupContext';
import { useWishlist } from '../../lib/hooks/useWishlist';
import { Button, Card, Badge } from '../../lib/design-system';


export default function OrderEntryPage() {
  const { user } = useAuth();
  const { showSuccessToast, showErrorToast } = usePopup();
  const { wishlist, clearWishlist } = useWishlist();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get items from wishlist
  const items = wishlist?.items || [];

  const getAuthHeaders = () => {
    const token = localStorage.getItem('wyzly_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      showErrorToast('Your cart is empty', 'Please add some items to your cart before placing an order');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Convert wishlist items to order format
      const orderItems = items.map(item => ({
        boxId: item.boxId,
        quantity: item.quantity
      }));

      const response = await fetch('/api/orders/bulk', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          items: orderItems,
          paymentMethod: 'mock'
        }),
      });

      const data = await response.json();

      if (data.success) {
        showSuccessToast('🎉 Order placed successfully!');
        // Clear the wishlist since items have been ordered
        await clearWishlist();
        // Redirect to orders page to show all orders
        window.location.href = `/orders/me`;
      } else {
        showErrorToast('Failed to place order', data.error || 'Something went wrong');
        setError(data.error || 'Failed to place order');
      }
    } catch (err) {
      showErrorToast('Network error occurred', 'Please check your connection and try again');
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card variant="elevated" radius="lg" padding="lg" className="max-w-md text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <UserIcon className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Ready to order? 🍽️</h2>
          <p className="text-gray-600 mb-6">Sign in to place your delicious order and track your delivery!</p>
          <Button 
            variant="primary" 
            size="lg"
            onClick={() => window.location.href = '/login'}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            fullWidth
          >
            <UserIcon className="h-5 w-5 mr-2" />
            Sign In to Continue
          </Button>
        </Card>
      </div>
    );
  }

  const totalAmount = items.reduce((sum, item) => sum + (item.box.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <ShoppingBagIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Complete Your Order</h1>
                <p className="text-sm text-gray-600">
                  Almost there! Just a few clicks to get your delicious boxes 🍽️
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Orders Button */}
              <button
                onClick={() => window.location.href = '/orders/me'}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-orange-600 transition-colors rounded-lg hover:bg-gray-100"
                title="My Orders"
              >
                <ReceiptRefundIcon className="h-5 w-5" />
                <span className="text-sm font-medium hidden sm:block">Orders</span>
              </button>
              
              <Badge variant="primary" size="lg">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {items.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🛒</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-600 mb-6">Add some delicious boxes to get started!</p>
            <Button 
              variant="primary" 
              size="lg"
              onClick={() => window.location.href = '/feed'}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              <HeartIcon className="h-5 w-5 mr-2" />
              Browse Food Boxes
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Order Items */}
            <Card variant="elevated" radius="lg" padding="lg">
              <div className="flex items-center space-x-3 mb-6">
                <ShoppingBagIcon className="h-6 w-6 text-orange-500" />
                <h2 className="text-xl font-semibold text-gray-900">Your Delicious Selection</h2>
              </div>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.boxId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.box.title}</h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <Badge variant="outline" size="sm">
                          Qty: {item.quantity}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          ${item.box.price.toFixed(2)} each
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-orange-600">
                        ${(item.box.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
                
                {/* Total */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-orange-600">
                      ${totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Payment Section */}
            <Card variant="elevated" radius="lg" padding="lg">
              <div className="flex items-center space-x-3 mb-6">
                <CreditCardIcon className="h-6 w-6 text-orange-500" />
                <h2 className="text-xl font-semibold text-gray-900">Payment Details</h2>
              </div>
              <div className="space-y-6">
                <div>
                  <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select 
                    id="paymentMethod" 
                    name="paymentMethod" 
                    className="w-full px-3 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option>💳 Mock Payment (Demo)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    This is a demo payment method for testing purposes
                  </p>
                </div>
                
                <Button 
                  onClick={handlePlaceOrder} 
                  disabled={loading} 
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  fullWidth
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing Your Order...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-5 w-5 mr-2" />
                      Place Order • ${totalAmount.toFixed(2)}
                    </>
                  )}
                </Button>
                
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}