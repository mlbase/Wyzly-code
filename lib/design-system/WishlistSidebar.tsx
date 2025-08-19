'use client';

import { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  HeartIcon,
  ShoppingCartIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { Button, Badge, Card } from './';
import { designTokens } from './tokens';

interface WishlistItem {
  boxId: number;
  addedAt: string;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  quantity?: number; // Added quantity for wishlist items
  box: {
    id: number;
    title: string;
    price: number;
    quantity: number;
    image?: string;
    isAvailable: boolean;
    restaurant: {
      id: number;
      name: string;
      description?: string;
      phoneNumber?: string;
    };
  };
}

interface WishlistSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: WishlistItem[];
  onRemoveItem: (boxId: number) => void;
  onUpdateQuantity: (boxId: number, quantity: number) => void;
  onAddToCart: (boxId: number, quantity: number) => void;
  onClearAll: () => void;
  loading?: boolean;
}

export function WishlistSidebar({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onUpdateQuantity,
  onAddToCart,
  onClearAll,
  loading = false
}: WishlistSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    // Force re-render when items change
  }, [items]);

  const updateQuantity = (boxId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const item = items.find(item => item.boxId === boxId);
    if (!item) return;
    
    // Don't exceed available stock
    const maxQuantity = item.box.quantity;
    const finalQuantity = Math.min(newQuantity, maxQuantity);
    
    onUpdateQuantity(boxId, finalQuantity);
  };

  const getTotalItems = () => {
    return items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => {
      const qty = item.quantity || 1;
      return total + (item.box.price * qty);
    }, 0);
  };

  const priorityConfig = {
    high: { color: 'bg-red-100 text-red-700', icon: '🔥' },
    medium: { color: 'bg-amber-100 text-amber-700', icon: '⭐' },
    low: { color: 'bg-gray-100 text-gray-600', icon: '📌' }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 right-0 h-full bg-white shadow-xl z-50 
        transform transition-all duration-300 ease-in-out overflow-hidden
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        ${isCollapsed ? 'w-16' : 'w-full max-w-md'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
            {isCollapsed ? (
              /* Collapsed Header */
              <div className="flex flex-col items-center space-y-2 w-full">
                <HeartSolidIcon className="h-6 w-6 text-red-500" />
                <span className="text-xs font-medium text-gray-600">
                  {items.length}
                </span>
              </div>
            ) : (
              /* Expanded Header */
              <>
                <div className="flex items-center space-x-3">
                  <HeartSolidIcon className="h-6 w-6 text-red-500" />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">My Wishlist</h2>
                    <p className="text-sm text-gray-500">
                      {items.length} {items.length === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsCollapsed(true)}
                    title="Collapse"
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={onClose} title="Close">
                    <XMarkIcon className="h-5 w-5" />
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Collapsed State Controls */}
          {isCollapsed && (
            <div className="p-2 border-b border-gray-200">
              <div className="flex flex-col space-y-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsCollapsed(false)}
                  title="Expand"
                  className="w-full p-2"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onClose}
                  title="Close"
                  className="w-full p-2"
                >
                  <XMarkIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Items List */}
          <div className={`flex-1 overflow-y-auto ${isCollapsed ? 'p-2' : 'p-4'} space-y-3`}>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-8">
                {isCollapsed ? (
                  <HeartIcon className="h-8 w-8 text-gray-300 mx-auto" />
                ) : (
                  <>
                    <HeartIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
                    <p className="text-gray-500">Add items you love to save them for later!</p>
                  </>
                )}
              </div>
            ) : (
              items.map((item) => (
                <Card key={item.boxId} variant="outlined" padding="none" className="overflow-hidden">
                  <div className={isCollapsed ? "p-1" : "p-3"}>
                    {isCollapsed ? (
                      /* Collapsed Item View */
                      <div className="flex flex-col items-center space-y-1">
                        {/* Priority Indicator */}
                        <div className="text-lg" title={`${item.priority} priority`}>
                          {priorityConfig[item.priority].icon}
                        </div>
                        
                        {/* Image */}
                        <div className="w-10 h-10 rounded-md overflow-hidden">
                          {item.box.image ? (
                            <img
                              src={item.box.image}
                              alt={item.box.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                              <span className="text-sm">🥘</span>
                            </div>
                          )}
                        </div>

                        {/* Price */}
                        <span className="text-xs font-medium text-orange-600">
                          ${item.box.price.toFixed(2)}
                        </span>

                        {/* Quantity */}
                        <div className="flex flex-col items-center space-y-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item.boxId, (item.quantity || 1) + 1)}
                            disabled={!item.box.isAvailable || (item.quantity || 1) >= item.box.quantity}
                            className="w-6 h-6 p-0"
                          >
                            <PlusIcon className="h-3 w-3" />
                          </Button>
                          
                          <span className="text-xs font-medium">
                            {item.quantity || 1}
                          </span>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item.boxId, (item.quantity || 1) - 1)}
                            disabled={(item.quantity || 1) <= 1}
                            className="w-6 h-6 p-0"
                          >
                            <MinusIcon className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col space-y-1">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => onAddToCart(item.boxId, item.quantity || 1)}
                            disabled={!item.box.isAvailable}
                            className="w-6 h-6 p-0"
                            title="Add to cart"
                          >
                            <ShoppingCartIcon className="h-3 w-3" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemoveItem(item.boxId)}
                            className="w-6 h-6 p-0 text-gray-400 hover:text-red-500"
                            title="Remove"
                          >
                            <TrashIcon className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      /* Expanded Item View */
                      <>
                        {/* Priority Badge */}
                        <div className="flex items-center justify-between mb-2">
                          <Badge 
                            variant="outline" 
                            size="sm" 
                            className={priorityConfig[item.priority].color}
                          >
                            {priorityConfig[item.priority].icon} {item.priority}
                          </Badge>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemoveItem(item.boxId)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex space-x-3">
                          {/* Image */}
                          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                            {item.box.image ? (
                              <img
                                src={item.box.image}
                                alt={item.box.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                <span className="text-xl">🥘</span>
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                              {item.box.title}
                            </h4>
                            <p className="text-xs text-gray-500 mb-2">
                              {item.box.restaurant.name}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-orange-600">
                                ${item.box.price.toFixed(2)}
                              </span>
                              <Badge 
                                variant={item.box.isAvailable ? 'success' : 'danger'} 
                                size="sm"
                              >
                                {item.box.isAvailable ? `${item.box.quantity} left` : 'Sold Out'}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        {item.box.isAvailable && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <span className="text-sm text-gray-600">Qty:</span>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => updateQuantity(item.boxId, (item.quantity || 1) - 1)}
                                    disabled={(item.quantity || 1) <= 1}
                                    className="w-8 h-8 p-0"
                                  >
                                    <MinusIcon className="h-3 w-3" />
                                  </Button>
                                  
                                  <span className="w-8 text-center text-sm font-medium">
                                    {item.quantity || 1}
                                  </span>
                                  
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => updateQuantity(item.boxId, (item.quantity || 1) + 1)}
                                    disabled={(item.quantity || 1) >= item.box.quantity}
                                    className="w-8 h-8 p-0"
                                  >
                                    <PlusIcon className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>

                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => onAddToCart(item.boxId, item.quantity || 1)}
                                className="text-xs px-3"
                              >
                                <ShoppingCartIcon className="h-3 w-3 mr-1" />
                                Add
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Notes */}
                        {item.notes && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                            {item.notes}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && !isCollapsed && (
            <div className="border-t border-gray-200 p-4 bg-white">
              {/* Summary */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Total Items:</span>
                  <span className="font-medium">{getTotalItems()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Price:</span>
                  <span className="font-bold text-lg text-orange-600">
                    ${getTotalPrice().toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={() => {
                    localStorage.setItem('wyzly_wishlist_items', JSON.stringify(items));
                    window.location.href = '/order-entry';
                  }}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                >
                  <ShoppingCartIcon className="h-4 w-4 mr-2" />
                  Add All to Cart
                </Button>
                
                <Button
                  variant="secondary"
                  size="md"
                  fullWidth
                  onClick={onClearAll}
                >
                  Clear Wishlist
                </Button>
              </div>
            </div>
          )}

          {/* Collapsed Footer */}
          {items.length > 0 && isCollapsed && (
            <div className="border-t border-gray-200 p-2 bg-white">
              <div className="flex flex-col space-y-2">
                <div className="text-center">
                  <div className="text-xs text-gray-600">{getTotalItems()} items</div>
                  <div className="text-sm font-bold text-orange-600">
                    ${getTotalPrice().toFixed(2)}
                  </div>
                </div>
                
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    localStorage.setItem('wyzly_wishlist_items', JSON.stringify(items));
                    window.location.href = '/order-entry';
                  }}
                  className="w-full p-2 text-xs"
                  title="Add All to Cart"
                >
                  <ShoppingCartIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Wishlist Toggle Button Component
interface WishlistToggleProps {
  itemCount: number;
  onClick: () => void;
}

export function WishlistToggle({ itemCount, onClick }: WishlistToggleProps) {
  return (
    <button
      onClick={onClick}
      className="relative p-2 text-gray-600 hover:text-red-500 transition-colors"
    >
      <HeartIcon className="h-6 w-6" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  );
}