'use client';

import { useState, useEffect } from 'react';
import { 
  HeartIcon, 
  TrashIcon, 
  PencilIcon,
  StarIcon,
  ClockIcon,
  ShoppingCartIcon,
  PlusIcon,
  MinusIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { Card, Button, Badge, Input } from './';
import { designTokens } from './tokens';

interface WishlistItem {
  boxId: number;
  addedAt: string;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  quantity?: number;
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

interface WishlistCardProps {
  item: WishlistItem;
  onRemove: (boxId: number) => void;
  onUpdatePriority: (boxId: number, priority: 'low' | 'medium' | 'high') => void;
  onUpdateNotes: (boxId: number, notes: string) => void;
  onUpdateQuantity?: (boxId: number, quantity: number) => void;
  onAddToCart: (boxId: number, quantity?: number) => void;
  showActions?: boolean;
  compact?: boolean;
}

export function WishlistCard({
  item,
  onRemove,
  onUpdatePriority,
  onUpdateNotes,
  onUpdateQuantity,
  onAddToCart,
  showActions = true,
  compact = false
}: WishlistCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editNotes, setEditNotes] = useState(item.notes || '');
  const [editPriority, setEditPriority] = useState(item.priority);
  const [localQuantity, setLocalQuantity] = useState(item.quantity || 1);

  // Update local quantity when item quantity changes
  useEffect(() => {
    setLocalQuantity(item.quantity || 1);
  }, [item.quantity]);

  const updateQuantity = (newQuantity: number) => {
    if (newQuantity < 1) return;
    
    // Don't exceed available stock
    const maxQuantity = item.box.quantity;
    const finalQuantity = Math.min(newQuantity, maxQuantity);
    
    setLocalQuantity(finalQuantity);
    
    if (onUpdateQuantity) {
      onUpdateQuantity(item.boxId, finalQuantity);
    }
  };

  const priorityConfig = {
    high: {
      color: 'bg-red-100 text-red-700',
      icon: '🔥',
      label: 'High Priority'
    },
    medium: {
      color: 'bg-amber-100 text-amber-700',
      icon: '⭐',
      label: 'Medium Priority'
    },
    low: {
      color: 'bg-gray-100 text-gray-600',
      icon: '📌',
      label: 'Low Priority'
    }
  };

  const handleSaveEdit = () => {
    if (editPriority !== item.priority) {
      onUpdatePriority(item.boxId, editPriority);
    }
    if (editNotes !== item.notes) {
      onUpdateNotes(item.boxId, editNotes);
    }
    setIsEditing(false);
  };

  const formatAddedDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Added today';
    if (diffDays <= 7) return `Added ${diffDays} days ago`;
    return `Added on ${date.toLocaleDateString()}`;
  };

  if (compact) {
    return (
      <Card variant="outlined" padding="sm" className="flex items-center space-x-3">
        {/* Compact Image */}
        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
          {item.box.image ? (
            <img
              src={item.box.image}
              alt={item.box.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <span className="text-2xl">🥘</span>
            </div>
          )}
        </div>

        {/* Compact Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 truncate">{item.box.title}</h4>
          <p className="text-sm text-gray-500 truncate">{item.box.restaurant.name}</p>
          <div className="flex items-center space-x-2 mt-1">
            <span className="font-semibold text-orange-600">${item.box.price.toFixed(2)}</span>
            <Badge 
              variant={item.box.isAvailable ? 'success' : 'danger'} 
              size="sm"
            >
              {item.box.isAvailable ? 'Available' : 'Sold Out'}
            </Badge>
          </div>
          {item.box.isAvailable && onUpdateQuantity && (
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-xs text-gray-600">Qty:</span>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateQuantity(localQuantity - 1)}
                  disabled={localQuantity <= 1}
                  className="w-6 h-6 p-0"
                >
                  <MinusIcon className="h-3 w-3" />
                </Button>
                <span className="w-6 text-center text-xs font-medium">
                  {localQuantity}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateQuantity(localQuantity + 1)}
                  disabled={localQuantity >= item.box.quantity}
                  className="w-6 h-6 p-0"
                >
                  <PlusIcon className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Compact Actions */}
        {showActions && (
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAddToCart(item.boxId, localQuantity)}
              disabled={!item.box.isAvailable}
            >
              <ShoppingCartIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(item.boxId)}
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        )}
      </Card>
    );
  }

  return (
    <Card variant="default" radius="lg" className="overflow-hidden">
      {/* Header with Priority Badge */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{priorityConfig[item.priority].icon}</span>
          <Badge 
            variant="outline" 
            size="sm" 
            className={priorityConfig[item.priority].color}
          >
            {priorityConfig[item.priority].label}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <ClockIcon className="h-4 w-4" />
          <span>{formatAddedDate(item.addedAt)}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        <div className="flex space-x-4">
          {/* Image */}
          <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
            {item.box.image ? (
              <img
                src={item.box.image}
                alt={item.box.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <span className="text-3xl">🥘</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 mb-1">{item.box.title}</h3>
            <p className="text-sm text-gray-600 mb-2">{item.box.restaurant.name}</p>
            
            <div className="flex items-center space-x-3 mb-3">
              <span className="text-lg font-bold text-orange-600">
                ${item.box.price.toFixed(2)}
              </span>
              <Badge 
                variant={item.box.isAvailable ? 'success' : 'danger'} 
                size="sm"
              >
                {item.box.isAvailable ? `${item.box.quantity} left` : 'Sold Out'}
              </Badge>
            </div>

            {/* Notes Section */}
            {isEditing ? (
              <div className="space-y-2">
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value as 'low' | 'medium' | 'high')}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
                
                <Input
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Add notes..."
                  size="sm"
                  variant="default"
                />
              </div>
            ) : (
              item.notes && (
                <p className="text-sm text-gray-600 bg-gray-50 rounded p-2 mt-2">
                  {item.notes}
                </p>
              )
            )}

            {/* Quantity Controls */}
            {item.box.isAvailable && onUpdateQuantity && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">Quantity:</span>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateQuantity(localQuantity - 1)}
                      disabled={localQuantity <= 1}
                      className="w-8 h-8 p-0"
                    >
                      <MinusIcon className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">
                      {localQuantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateQuantity(localQuantity + 1)}
                      disabled={localQuantity >= item.box.quantity}
                      className="w-8 h-8 p-0"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex items-center justify-between p-4 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            {isEditing ? (
              <>
                <Button variant="primary" size="sm" onClick={handleSaveEdit}>
                  Save
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => {
                    setIsEditing(false);
                    setEditNotes(item.notes || '');
                    setEditPriority(item.priority);
                  }}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <PencilIcon className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant={item.box.isAvailable ? "primary" : "secondary"}
              size="sm"
              onClick={() => onAddToCart(item.boxId, localQuantity)}
              disabled={!item.box.isAvailable}
            >
              <ShoppingCartIcon className="h-4 w-4 mr-1" />
              {item.box.isAvailable ? 'Add to Cart' : 'Unavailable'}
            </Button>
            
            <Button
              variant="danger"
              size="sm"
              onClick={() => onRemove(item.boxId)}
            >
              <TrashIcon className="h-4 w-4 mr-1" />
              Remove
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

// Wishlist Summary Component
interface WishlistSummaryProps {
  itemCount: number;
  availableCount: number;
  unavailableCount: number;
  onClearAll: () => void;
}

export function WishlistSummary({
  itemCount,
  availableCount,
  unavailableCount,
  onClearAll
}: WishlistSummaryProps) {
  return (
    <Card variant="elevated" radius="lg" padding="lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <HeartSolidIcon className="h-8 w-8 text-red-500" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">My Wishlist</h2>
            <p className="text-sm text-gray-600">
              {itemCount} {itemCount === 1 ? 'item' : 'items'} saved
            </p>
          </div>
        </div>

        {itemCount > 0 && (
          <Button variant="secondary" size="sm" onClick={onClearAll}>
            Clear All
          </Button>
        )}
      </div>

      {itemCount > 0 && (
        <div className="flex items-center space-x-4 mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">
              {availableCount} available
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm text-gray-600">
              {unavailableCount} sold out
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}