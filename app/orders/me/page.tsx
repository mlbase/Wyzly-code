'use client';

import { useState, useEffect } from 'react';
import { 
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  TruckIcon,
  PhoneIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../../lib/contexts/AuthContext';
import { usePopup } from '../../../lib/contexts/PopupContext';
import { Button, Card, Badge } from '../../../lib/design-system';

interface OrderItem {
  id: number;
  boxId: number;
  boxTitle: string;
  boxImage?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  payment: {
    id: number;
    amount: number;
    status: string;
    method: string;
    transactionId: string;
    createdAt: string;
  } | null;
}

interface GroupedOrder {
  id: string;
  restaurantId: number;
  restaurantName: string;
  restaurantPhone?: string;
  orderDate: string;
  status: string;
  isCancelled: boolean;
  items: OrderItem[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

interface OrderSummary {
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  cancelledOrders: number;
}

export default function MyOrdersPage() {
  const { user } = useAuth();
  const { showSuccessToast, showErrorToast, showConfirm } = usePopup();
  const [orders, setOrders] = useState<GroupedOrder[]>([]);
  const [summary, setSummary] = useState<OrderSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('wyzly_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders/me', {
        method: 'GET',
        headers: getAuthHeaders()
      });

      const data = await response.json();

      if (data.success) {
        setOrders(data.data.orders);
        setSummary(data.data.summary);
      } else {
        showErrorToast('Failed to fetch orders', data.error);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      showErrorToast('Network error occurred', 'Please check your connection');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const handleCancelOrder = async (orderGroup: GroupedOrder) => {
    // Find the first item that can be cancelled
    const firstOrderId = orderGroup.items[0]?.id;
    
    if (!firstOrderId) return;

    showConfirm({
      title: 'Cancel Order',
      message: `Are you sure you want to cancel your order from ${orderGroup.restaurantName}?`,
      description: 'This action cannot be undone. Your payment will be refunded.',
      type: 'warning',
      confirmLabel: 'Cancel Order',
      onConfirm: async () => {
        try {
          setCancellingOrderId(orderGroup.id);
          
          // Cancel all items in the group (assuming they have same status)
          const cancelPromises = orderGroup.items.map(async (item) => {
            const response = await fetch(`/api/orders/${item.id}/cancel`, {
              method: 'POST',
              headers: getAuthHeaders(),
              body: JSON.stringify({
                reason: 'Customer requested cancellation'
              })
            });
            return response.json();
          });

          const results = await Promise.all(cancelPromises);
          const allSuccessful = results.every(result => result.success);

          if (allSuccessful) {
            showSuccessToast('Order cancelled successfully', 'Your refund is being processed');
            await fetchOrders(); // Refresh orders
          } else {
            showErrorToast('Failed to cancel some items', 'Please contact support');
          }
        } catch (error) {
          console.error('Error cancelling order:', error);
          showErrorToast('Network error occurred', 'Please try again later');
        } finally {
          setCancellingOrderId(null);
        }
      }
    });
  };

  const getStatusConfig = (status: string, isCancelled: boolean) => {
    if (isCancelled) {
      return {
        color: 'bg-red-100 text-red-700',
        icon: XCircleIcon,
        label: 'Cancelled'
      };
    }

    switch (status) {
      case 'pending':
        return {
          color: 'bg-yellow-100 text-yellow-700',
          icon: ClockIcon,
          label: 'Pending'
        };
      case 'confirmed':
        return {
          color: 'bg-blue-100 text-blue-700',
          icon: CheckCircleIcon,
          label: 'Confirmed'
        };
      case 'preparing':
        return {
          color: 'bg-orange-100 text-orange-700',
          icon: ClockIcon,
          label: 'Preparing'
        };
      case 'ready':
        return {
          color: 'bg-purple-100 text-purple-700',
          icon: CheckCircleIcon,
          label: 'Ready'
        };
      case 'delivered':
        return {
          color: 'bg-green-100 text-green-700',
          icon: TruckIcon,
          label: 'Delivered'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-700',
          icon: ClockIcon,
          label: status
        };
    }
  };

  const canCancelOrder = (order: GroupedOrder) => {
    return !order.isCancelled && ['pending', 'confirmed'].includes(order.status);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card variant="elevated" radius="lg" padding="lg" className="max-w-md text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <ClockIcon className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Sign in to view orders</h2>
          <p className="text-gray-600 mb-6">Please sign in to see your order history and track deliveries</p>
          <Button 
            variant="primary" 
            size="lg"
            onClick={() => window.location.href = '/login'}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            fullWidth
          >
            Sign In
          </Button>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.location.href = '/feed'}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
                title="Back to Feed"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </button>
              <div className="h-12 w-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <ClockIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
                <p className="text-sm text-gray-600">Track your delicious orders and delivery status</p>
              </div>
            </div>
            
            <Button
              variant="primary"
              size="sm"
              onClick={() => window.location.href = '/feed'}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              Browse More Food
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card variant="default" padding="lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <ClockIcon className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-semibold text-gray-900">{summary.totalOrders}</p>
                </div>
              </div>
            </Card>

            <Card variant="default" padding="lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <ClockIcon className="h-5 w-5 text-yellow-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-semibold text-gray-900">{summary.activeOrders}</p>
                </div>
              </div>
            </Card>

            <Card variant="default" padding="lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-semibold text-gray-900">{summary.completedOrders}</p>
                </div>
              </div>
            </Card>

            <Card variant="default" padding="lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <XCircleIcon className="h-5 w-5 text-red-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Cancelled</p>
                  <p className="text-2xl font-semibold text-gray-900">{summary.cancelledOrders}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600 mb-6">Start ordering some delicious food!</p>
            <Button 
              variant="primary" 
              size="lg"
              onClick={() => window.location.href = '/feed'}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Start Ordering
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusConfig = getStatusConfig(order.status, order.isCancelled);
              const StatusIcon = statusConfig.icon;

              return (
                <Card key={order.id} variant="elevated" radius="lg" padding="lg">
                  {/* Order Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 bg-gradient-to-r from-orange-400 to-red-400 rounded-lg flex items-center justify-center">
                        <span className="text-lg font-bold text-white">
                          {order.restaurantName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{order.restaurantName}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <CalendarIcon className="h-4 w-4" />
                            <span>{formatDate(order.createdAt)}</span>
                          </div>
                          {order.restaurantPhone && (
                            <div className="flex items-center space-x-1">
                              <PhoneIcon className="h-4 w-4" />
                              <span>{order.restaurantPhone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Badge 
                        variant="outline" 
                        size="sm" 
                        className={statusConfig.color}
                      >
                        <StatusIcon className="h-4 w-4 mr-1" />
                        {statusConfig.label}
                      </Badge>
                      <div className="text-right">
                        <div className="text-lg font-bold text-orange-600">
                          ${order.totalAmount.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-3 mb-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            {item.boxImage ? (
                              <img
                                src={item.boxImage}
                                alt={item.boxTitle}
                                className="h-full w-full object-cover rounded-lg"
                              />
                            ) : (
                              <span className="text-xl">🥘</span>
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{item.boxTitle}</h4>
                            <p className="text-sm text-gray-600">
                              ${item.unitPrice.toFixed(2)} × {item.quantity}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900">
                            ${item.totalPrice.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <CurrencyDollarIcon className="h-4 w-4" />
                      <span>
                        Payment: {order.items[0]?.payment?.method || 'Unknown'} • 
                        Status: {order.items[0]?.payment?.status || 'Unknown'}
                      </span>
                    </div>
                    
                    {canCancelOrder(order) && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleCancelOrder(order)}
                        disabled={cancellingOrderId === order.id}
                      >
                        {cancellingOrderId === order.id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Cancelling...
                          </>
                        ) : (
                          <>
                            <XCircleIcon className="h-4 w-4 mr-1" />
                            Cancel Order
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}