'use client';

import { useState, useEffect } from 'react';
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowRightOnRectangleIcon,
  BuildingStorefrontIcon,
  CubeIcon,
  CurrencyDollarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../lib/contexts/AuthContext';
import { usePopup } from '../../lib/contexts/PopupContext';
import { useRouter } from 'next/navigation';

interface Box {
  id: number;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  restaurant: {
    id: number;
    name: string;
  };
  _count?: {
    orders: number;
  };
}

interface Restaurant {
  id: number;
  name: string;
  phoneNumber?: string;
  description?: string;
}

export default function RestaurantDashboard() {
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBox, setEditingBox] = useState<Box | null>(null);

  const { user, logout, token } = useAuth();
  const { showConfirm, showSuccessToast, showErrorToast, showError } = usePopup();
  const router = useRouter();

  // Redirect if not restaurant user
  useEffect(() => {
    if (user && user.role !== 'restaurant') {
      router.push('/');
      return;
    }
    if (!user) {
      router.push('/login');
      return;
    }
  }, [user, router]);

  useEffect(() => {
    if (user && user.role === 'restaurant') {
      fetchBoxes();
    }
  }, [user]);

  const fetchBoxes = async () => {
    try {
      const response = await fetch('/api/restaurant/boxes', {
        headers: {
          'Authorization': `Bearer ${token || localStorage.getItem('wyzly_token')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setBoxes(data.data.boxes);
        setRestaurant(data.data.restaurant);
      } else {
        showErrorToast('Failed to fetch boxes', data.error);
      }
    } catch (error) {
      console.error('Error fetching boxes:', error);
      showErrorToast('Failed to fetch boxes', 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchBoxes();
    setRefreshing(false);
    showSuccessToast('Boxes refreshed');
  };

  const handleDeleteBox = (box: Box) => {
    showConfirm({
      title: 'Delete Box',
      message: `Are you sure you want to delete "${box.title}"?`,
      description: 'This action cannot be undone. Any pending orders for this box may be affected.',
      type: 'danger',
      confirmLabel: 'Delete Box',
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/restaurant/boxes/${box.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token || localStorage.getItem('wyzly_token')}`,
              'Content-Type': 'application/json',
            },
          });
          
          const data = await response.json();
          
          if (data.success) {
            await fetchBoxes(); // Refresh boxes
            showSuccessToast(`"${box.title}" has been deleted`);
          } else {
            showError({
              title: 'Failed to Delete Box',
              message: data.error || 'Unable to delete the box. Please try again.',
              type: 'error'
            });
          }
        } catch (error) {
          console.error('Error deleting box:', error);
          showError({
            title: 'Network Error',
            message: 'Unable to connect to the server. Please check your connection and try again.',
            type: 'error'
          });
        }
      }
    });
  };

  const handleToggleAvailability = async (box: Box) => {
    try {
      const response = await fetch(`/api/restaurant/boxes/${box.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token || localStorage.getItem('wyzly_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isAvailable: !box.isAvailable
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchBoxes(); // Refresh boxes
        showSuccessToast(
          box.isAvailable 
            ? `"${box.title}" is now unavailable` 
            : `"${box.title}" is now available`
        );
      } else {
        showError({
          title: 'Failed to Update Box',
          message: data.error || 'Unable to update the box availability.',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error updating box:', error);
      showError({
        title: 'Network Error',
        message: 'Unable to connect to the server. Please try again.',
        type: 'error'
      });
    }
  };

  const handleLogout = () => {
    showConfirm({
      title: 'Sign Out',
      message: 'Are you sure you want to sign out?',
      description: 'You will need to login again to access the restaurant dashboard.',
      type: 'warning',
      confirmLabel: 'Sign Out',
      onConfirm: () => {
        logout();
        showSuccessToast('You have been signed out successfully.');
      }
    });
  };

  const filteredBoxes = boxes.filter(box => {
    const matchesSearch = 
      box.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesAvailability = 
      availabilityFilter === 'all' ||
      (availabilityFilter === 'available' && box.isAvailable) ||
      (availabilityFilter === 'unavailable' && !box.isAvailable);
    
    return matchesSearch && matchesAvailability;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!user || user.role !== 'restaurant') {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading restaurant dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <BuildingStorefrontIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Restaurant Dashboard</h1>
                <p className="text-sm text-gray-600">
                  {restaurant?.name || 'Loading...'} • Box Management
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                <ChartBarIcon className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="text-sm font-medium hidden sm:block">
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </span>
              </button>
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-red-600 transition-colors rounded-lg hover:bg-gray-100"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                <span className="text-sm font-medium hidden sm:block">Logout</span>
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mt-6 space-y-4">
            {/* Search Bar */}
            <div className="flex space-x-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search boxes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-100 border-0 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                />
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all"
              >
                <PlusIcon className="h-5 w-5" />
                <span className="font-medium">Add Box</span>
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <FunnelIcon className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
              </div>
              
              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Boxes</option>
                <option value="available">Available Only</option>
                <option value="unavailable">Unavailable Only</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Boxes</p>
                <p className="text-2xl font-bold text-gray-900">{boxes.length}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CubeIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-gray-900">
                  {boxes.filter(b => b.isAvailable).length}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <EyeIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Stock</p>
                <p className="text-2xl font-bold text-gray-900">
                  {boxes.reduce((sum, b) => sum + b.quantity, 0)}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Price</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${boxes.length > 0 ? (boxes.reduce((sum, b) => sum + b.price, 0) / boxes.length).toFixed(2) : '0.00'}
                </p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <CurrencyDollarIcon className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Boxes Grid */}
        {filteredBoxes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {boxes.length === 0 ? 'No boxes yet' : 'No boxes found'}
            </h3>
            <p className="text-gray-600 mb-6">
              {boxes.length === 0 
                ? 'Create your first Wyzly Box to start selling delicious meals'
                : 'Try adjusting your search or filters'
              }
            </p>
            {boxes.length === 0 && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Create Your First Box</span>
              </button>
            )}
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
                  
                  {/* Availability Badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      box.isAvailable 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {box.isAvailable ? (
                        <>
                          <EyeIcon className="w-3 h-3 mr-1" />
                          Available
                        </>
                      ) : (
                        <>
                          <EyeSlashIcon className="w-3 h-3 mr-1" />
                          Hidden
                        </>
                      )}
                    </span>
                  </div>

                  {/* Stock Badge */}
                  <div className="absolute top-3 right-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-md">
                    <span className="text-xs font-medium text-gray-700">
                      Stock: {box.quantity}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  {/* Title */}
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {box.title}
                  </h3>

                  {/* Price */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-orange-600">
                      ${box.price.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500">
                      Created {formatDate(box.createdAt)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleToggleAvailability(box)}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                        box.isAvailable
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      {box.isAvailable ? 'Hide' : 'Show'}
                    </button>
                    <button
                      onClick={() => setEditingBox(box)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteBox(box)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TODO: Add Create/Edit Box Modal Components */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Create New Box</h3>
            <p className="text-gray-600 mb-4">Box creation form will be implemented in the next step.</p>
            <button
              onClick={() => setShowCreateModal(false)}
              className="w-full py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {editingBox && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Edit Box</h3>
            <p className="text-gray-600 mb-4">Box editing form will be implemented in the next step.</p>
            <button
              onClick={() => setEditingBox(null)}
              className="w-full py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}