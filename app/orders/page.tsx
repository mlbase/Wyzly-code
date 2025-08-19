'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/contexts/AuthContext';
import { Button, Card, Badge } from '../../lib/design-system';

interface Order {
  id: number;
  createdAt: string;
  total: number;
  status: string;
  items: any[];
}

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const fetchOrders = async () => {
        try {
          const response = await fetch('/api/orders');
          const data = await response.json();
          if (data.success) {
            setOrders(data.data);
          } else {
            setError(data.error || 'Failed to fetch orders');
          }
        } catch (err) {
          setError('Network error occurred');
        } finally {
          setLoading(false);
        }
      };

      fetchOrders();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card variant="elevated" radius="lg" padding="lg" className="max-w-md text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Sign In Required</h2>
          <p className="text-gray-600 mb-4">Please sign in to view your orders.</p>
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
        <h1 className="text-2xl font-bold text-gray-900 mb-4">My Orders</h1>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>{error}</p>
        ) : orders.length === 0 ? (
          <p>You have no orders.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} variant="outlined" padding="lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Order #{order.id}</p>
                    <p className="text-sm text-gray-500">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">${order.total.toFixed(2)}</p>
                    <Badge variant={order.status === 'COMPLETED' ? 'success' : 'default'}>{order.status}</Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}