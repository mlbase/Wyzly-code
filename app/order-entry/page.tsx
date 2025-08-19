'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/contexts/AuthContext';
import { Button, Card, Badge } from '../../lib/design-system';

interface WishlistItem {
  boxId: number;
  quantity: number;
  box: {
    title: string;
    price: number;
  };
}

export default function OrderEntryPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedItems = localStorage.getItem('wyzly_wishlist_items');
    if (storedItems) {
      setItems(JSON.parse(storedItems));
    }
  }, []);

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to order confirmation page
        window.location.href = `/orders/${data.data.id}`;
      } else {
        setError(data.error || 'Failed to place order');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card variant="elevated" radius="lg" padding="lg" className="max-w-md text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Sign In Required</h2>
          <p className="text-gray-600 mb-4">Please sign in to place an order.</p>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Entry</h1>
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.boxId} variant="outlined" padding="lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{item.box.title}</p>
                  <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                </div>
                <p className="text-lg font-semibold">${(item.box.price * item.quantity).toFixed(2)}</p>
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-6">
          <Card variant="elevated" padding="lg">
            <h2 className="text-xl font-semibold mb-4">Payment</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">Payment Method</label>
                <select id="paymentMethod" name="paymentMethod" className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md">
                  <option>Mock Payment</option>
                </select>
              </div>
              <Button onClick={handlePlaceOrder} disabled={loading} fullWidth>
                {loading ? 'Placing Order...' : 'Place Order'}
              </Button>
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}