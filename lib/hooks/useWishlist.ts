'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LocalWishlistStorage, LocalWishlistItem } from '../utils/localWishlist';

interface BoxAPIResponse {
  id: number;
  title: string;
  price: string | number;
  quantity: number;
  image?: string;
  isAvailable: boolean;
  restaurant: {
    id: number;
    name: string;
    description?: string;
    phoneNumber?: string;
  };
}

interface WishlistItem {
  boxId: number;
  addedAt: string;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  quantity: number;
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

interface WishlistData {
  userId: number;
  items: WishlistItem[];
  itemCount: number;
  availableCount: number;
  unavailableCount: number;
  groupedItems: {
    available: WishlistItem[];
    unavailable: WishlistItem[];
  };
  createdAt: string | null;
  updatedAt: string | null;
}

interface UseWishlistReturn {
  wishlist: WishlistData | null;
  loading: boolean;
  error: string | null;
  isInWishlist: (boxId: number) => boolean;
  addToWishlist: (boxId: number, priority?: 'low' | 'medium' | 'high', notes?: string, quantity?: number) => Promise<boolean>;
  removeFromWishlist: (boxId: number) => Promise<boolean>;
  updateWishlistItem: (boxId: number, priority?: 'low' | 'medium' | 'high', notes?: string, quantity?: number) => Promise<boolean>;
  clearWishlist: () => Promise<boolean>;
  refreshWishlist: () => Promise<void>;
  forceSyncWithServer: () => Promise<void>;
  isOfflineMode: boolean;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
}

export function useWishlist(): UseWishlistReturn {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<WishlistData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [previousUser, setPreviousUser] = useState<typeof user>(null);

  const isOfflineMode = !user;

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('wyzly_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }, []);

  // Load local wishlist data (for offline mode)
  const loadLocalWishlist = useCallback(async () => {
    const localItems = LocalWishlistStorage.getItems();
    
    if (localItems.length === 0) {
      const emptyWishlist: WishlistData = {
        userId: 0,
        items: [],
        itemCount: 0,
        availableCount: 0,
        unavailableCount: 0,
        groupedItems: {
          available: [],
          unavailable: []
        },
        createdAt: null,
        updatedAt: new Date().toISOString()
      };
      setWishlist(emptyWishlist);
      return;
    }

    try {
      // Fetch box data for local items
      const boxIds = localItems.map(item => item.boxId);
      const response = await fetch('/api/boxes/by-ids', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ boxIds })
      });

      const data = await response.json();
      
      if (data.success) {
        const boxes: BoxAPIResponse[] = data.data.boxes;
        const boxMap = new Map(boxes.map((box) => [box.id, box]));

        // Create wishlist items with populated box data
        const populatedItems: WishlistItem[] = localItems
          .map((localItem: LocalWishlistItem): WishlistItem | null => {
            const box = boxMap.get(localItem.boxId);
            if (!box) return null; // Box might have been deleted

            return {
              boxId: localItem.boxId,
              addedAt: localItem.addedAt,
              priority: localItem.priority,
              notes: localItem.notes,
              quantity: localItem.quantity,
              box: {
                id: box.id,
                title: box.title,
                price: Number(box.price),
                quantity: box.quantity,
                image: box.image,
                isAvailable: box.isAvailable,
                restaurant: {
                  id: box.restaurant.id,
                  name: box.restaurant.name,
                  description: box.restaurant.description,
                  phoneNumber: box.restaurant.phoneNumber
                }
              }
            };
          })
          .filter((item): item is WishlistItem => item !== null);

        // Group items by availability
        const availableItems = populatedItems.filter(item => item.box.isAvailable);
        const unavailableItems = populatedItems.filter(item => !item.box.isAvailable);

        const localWishlist: WishlistData = {
          userId: 0, // Placeholder for offline mode
          items: populatedItems,
          itemCount: populatedItems.length,
          availableCount: availableItems.length,
          unavailableCount: unavailableItems.length,
          groupedItems: {
            available: availableItems,
            unavailable: unavailableItems
          },
          createdAt: null,
          updatedAt: new Date().toISOString()
        };

        setWishlist(localWishlist);
      } else {
        // Fallback to basic data without box details
        const basicWishlist: WishlistData = {
          userId: 0,
          items: [],
          itemCount: localItems.length,
          availableCount: localItems.length,
          unavailableCount: 0,
          groupedItems: {
            available: [],
            unavailable: []
          },
          createdAt: null,
          updatedAt: new Date().toISOString()
        };
        setWishlist(basicWishlist);
      }
    } catch (error) {
      console.error('Error loading local wishlist:', error);
      // Fallback to basic data
      const basicWishlist: WishlistData = {
        userId: 0,
        items: [],
        itemCount: localItems.length,
        availableCount: localItems.length,
        unavailableCount: 0,
        groupedItems: {
          available: [],
          unavailable: []
        },
        createdAt: null,
        updatedAt: new Date().toISOString()
      };
      setWishlist(basicWishlist);
    }
  }, []);

  // Forward declaration for fetchWishlist
  const fetchWishlistRef = useCallback(async () => {
    if (!user) {
      // Offline mode - load from localStorage
      await loadLocalWishlist();
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/wishlist/populated', {
        method: 'GET',
        headers: getAuthHeaders()
      });

      const data = await response.json();

      if (data.success) {
        setWishlist(data.data.wishlist);
      } else {
        setError(data.error || 'Failed to fetch wishlist');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Wishlist fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [user, getAuthHeaders, loadLocalWishlist]);

  // Sync local wishlist with server after login
  const syncWithServer = useCallback(async () => {
    if (!user) return;

    const localItems = LocalWishlistStorage.toSyncFormat();
    
    if (localItems.length === 0) {
      // No local items to sync, just fetch server data
      return fetchWishlistRef();
    }

    try {
      setSyncStatus('syncing');
      setError(null);

      const response = await fetch('/api/wishlist/sync', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ localItems })
      });

      const data = await response.json();

      if (data.success) {
        // Clear local storage since it's now synced
        LocalWishlistStorage.clearItems();
        setSyncStatus('synced');
        
        // Fetch the complete populated wishlist
        return fetchWishlistRef();
      } else {
        setSyncStatus('error');
        setError(data.error || 'Failed to sync wishlist');
      }
    } catch (err) {
      setSyncStatus('error');
      setError('Network error during sync');
      console.error('Sync error:', err);
    }
  }, [user, getAuthHeaders, fetchWishlistRef]);

  // Detect user login and trigger sync
  useEffect(() => {
    const userJustLoggedIn = !previousUser && user;
    
    if (userJustLoggedIn) {
      // User just logged in, sync local wishlist
      syncWithServer();
    }
    
    setPreviousUser(user);
  }, [user, previousUser, syncWithServer]);

  // Alias for cleaner references
  const fetchWishlist = fetchWishlistRef;

  // Check for local data to sync on mount (for redirected users)
  useEffect(() => {
    const hasLocalData = LocalWishlistStorage.getItems().length > 0;
    
    if (user && hasLocalData && !previousUser) {
      // User is logged in on mount and has local data - likely redirected after login
      syncWithServer();
    } else {
      // Normal fetch
      fetchWishlist();
    }
  }, [user, fetchWishlist, syncWithServer, previousUser]);

  const isInWishlist = useCallback((boxId: number): boolean => {
    if (isOfflineMode) {
      return LocalWishlistStorage.hasItem(boxId);
    }
    return wishlist?.items.some(item => item.boxId === boxId) || false;
  }, [wishlist, isOfflineMode]);

  const addToWishlist = useCallback(async (
    boxId: number, 
    priority: 'low' | 'medium' | 'high' = 'medium', 
    notes?: string,
    quantity: number = 1
  ): Promise<boolean> => {
    try {
      setError(null);

      if (isOfflineMode) {
        // Offline mode - save to localStorage
        LocalWishlistStorage.addItem(boxId, priority, notes, quantity);
        await loadLocalWishlist(); // Refresh local data
        return true;
      }

      // Online mode - save to server
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ boxId, priority, notes, quantity })
      });

      const data = await response.json();

      if (data.success) {
        await fetchWishlist(); // Refresh the full data
        return true;
      } else {
        setError(data.error || 'Failed to add to wishlist');
        return false;
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Add to wishlist error:', err);
      return false;
    }
  }, [isOfflineMode, getAuthHeaders, fetchWishlist, loadLocalWishlist]);

  const removeFromWishlist = useCallback(async (boxId: number): Promise<boolean> => {
    try {
      setError(null);

      if (isOfflineMode) {
        // Offline mode - remove from localStorage
        LocalWishlistStorage.removeItem(boxId);
        await loadLocalWishlist(); // Refresh local data
        return true;
      }

      // Online mode - remove from server
      const response = await fetch(`/api/wishlist/${boxId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      const data = await response.json();

      if (data.success) {
        await fetchWishlist(); // Refresh the full data
        return true;
      } else {
        setError(data.error || 'Failed to remove from wishlist');
        return false;
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Remove from wishlist error:', err);
      return false;
    }
  }, [isOfflineMode, getAuthHeaders, fetchWishlist, loadLocalWishlist]);

  const updateWishlistItem = useCallback(async (
    boxId: number, 
    priority?: 'low' | 'medium' | 'high', 
    notes?: string,
    quantity?: number
  ): Promise<boolean> => {
    if (isOfflineMode) {
      // Offline mode - update in localStorage
      const updates: any = {};
      if (priority !== undefined) updates.priority = priority;
      if (notes !== undefined) updates.notes = notes;
      if (quantity !== undefined) updates.quantity = quantity;
      
      LocalWishlistStorage.updateItem(boxId, updates);
      await loadLocalWishlist(); // Refresh local data
      return true;
    }

    // Optimistic UI update
    const originalWishlist = wishlist;
    const newWishlist = JSON.parse(JSON.stringify(originalWishlist));
    const itemIndex = newWishlist.items.findIndex((item: any) => item.boxId === boxId);
    if (itemIndex !== -1) {
      if (priority !== undefined) newWishlist.items[itemIndex].priority = priority;
      if (notes !== undefined) newWishlist.items[itemIndex].notes = notes;
      if (quantity !== undefined) newWishlist.items[itemIndex].quantity = quantity;
      setWishlist(newWishlist);
    }

    try {
      setError(null);

      // Online mode - update on server
      const response = await fetch(`/api/wishlist/${boxId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ priority, notes, quantity })
      });

      const data = await response.json();

      if (data.success) {
        // The server response is the source of truth, so we update the state with it.
        setWishlist(data.data.wishlist);
        return true;
      } else {
        // If the server update fails, revert to the original state.
        if (originalWishlist) setWishlist(originalWishlist);
        setError(data.error || 'Failed to update wishlist item');
        return false;
      }
    } catch (err) {
      // If the network request itself fails, revert to the original state.
      if (originalWishlist) setWishlist(originalWishlist);
      setError('Network error occurred');
      console.error('Update wishlist item error:', err);
      return false;
    }
  }, [isOfflineMode, getAuthHeaders, wishlist, loadLocalWishlist]);

  const clearWishlist = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);

      if (isOfflineMode) {
        // Offline mode - clear localStorage
        LocalWishlistStorage.clearItems();
        await loadLocalWishlist(); // Refresh local data
        return true;
      }

      // Online mode - clear on server
      const response = await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      const data = await response.json();

      if (data.success) {
        await fetchWishlist(); // Refresh the full data
        return true;
      } else {
        setError(data.error || 'Failed to clear wishlist');
        return false;
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Clear wishlist error:', err);
      return false;
    }
  }, [isOfflineMode, getAuthHeaders, fetchWishlist, loadLocalWishlist]);

  const refreshWishlist = useCallback(async (): Promise<void> => {
    await fetchWishlist();
  }, [fetchWishlist]);

  const forceSyncWithServer = useCallback(async (): Promise<void> => {
    if (user) {
      await syncWithServer();
    }
  }, [user, syncWithServer]);

  return {
    wishlist,
    loading,
    error,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    updateWishlistItem,
    clearWishlist,
    refreshWishlist,
    forceSyncWithServer,
    isOfflineMode,
    syncStatus
  };
}