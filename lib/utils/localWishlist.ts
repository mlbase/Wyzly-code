'use client';

// Local wishlist item structure (simplified for localStorage)
export interface LocalWishlistItem {
  boxId: number;
  addedAt: string;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  quantity: number;
}

const LOCAL_WISHLIST_KEY = 'wyzly_local_wishlist';

export class LocalWishlistStorage {
  // Get all items from localStorage
  static getItems(): LocalWishlistItem[] {
    try {
      if (typeof window === 'undefined') return [];
      
      const stored = localStorage.getItem(LOCAL_WISHLIST_KEY);
      if (!stored) return [];
      
      const items = JSON.parse(stored) as LocalWishlistItem[];
      return Array.isArray(items) ? items : [];
    } catch (error) {
      console.error('Error reading local wishlist:', error);
      return [];
    }
  }

  // Save items to localStorage
  static setItems(items: LocalWishlistItem[]): void {
    try {
      if (typeof window === 'undefined') return;
      
      localStorage.setItem(LOCAL_WISHLIST_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving local wishlist:', error);
    }
  }

  // Add item to local wishlist
  static addItem(
    boxId: number, 
    priority: 'low' | 'medium' | 'high' = 'medium', 
    notes?: string, 
    quantity: number = 1
  ): LocalWishlistItem[] {
    const items = this.getItems();
    const existingIndex = items.findIndex(item => item.boxId === boxId);
    
    if (existingIndex !== -1) {
      // Update existing item
      items[existingIndex] = {
        ...items[existingIndex],
        priority,
        notes,
        quantity,
        addedAt: new Date().toISOString() // Update timestamp
      };
    } else {
      // Add new item
      items.push({
        boxId,
        addedAt: new Date().toISOString(),
        priority,
        notes,
        quantity
      });
    }
    
    this.setItems(items);
    return items;
  }

  // Remove item from local wishlist
  static removeItem(boxId: number): LocalWishlistItem[] {
    const items = this.getItems();
    const filteredItems = items.filter(item => item.boxId !== boxId);
    this.setItems(filteredItems);
    return filteredItems;
  }

  // Update item in local wishlist
  static updateItem(
    boxId: number, 
    updates: Partial<Pick<LocalWishlistItem, 'priority' | 'notes' | 'quantity'>>
  ): LocalWishlistItem[] {
    const items = this.getItems();
    const itemIndex = items.findIndex(item => item.boxId === boxId);
    
    if (itemIndex !== -1) {
      items[itemIndex] = {
        ...items[itemIndex],
        ...updates
      };
      this.setItems(items);
    }
    
    return items;
  }

  // Clear all local wishlist items
  static clearItems(): void {
    try {
      if (typeof window === 'undefined') return;
      localStorage.removeItem(LOCAL_WISHLIST_KEY);
    } catch (error) {
      console.error('Error clearing local wishlist:', error);
    }
  }

  // Check if item exists in local wishlist
  static hasItem(boxId: number): boolean {
    const items = this.getItems();
    return items.some(item => item.boxId === boxId);
  }

  // Get item count
  static getItemCount(): number {
    return this.getItems().length;
  }

  // Get total quantity
  static getTotalQuantity(): number {
    const items = this.getItems();
    return items.reduce((total, item) => total + item.quantity, 0);
  }

  // Convert local items to API format for syncing
  static toSyncFormat(): Array<{
    boxId: number;
    priority: 'low' | 'medium' | 'high';
    notes?: string;
    quantity: number;
  }> {
    const items = this.getItems();
    return items.map(item => ({
      boxId: item.boxId,
      priority: item.priority,
      notes: item.notes,
      quantity: item.quantity
    }));
  }

  // Import items from server format
  static importFromServer(serverItems: Array<{
    boxId: number;
    priority: 'low' | 'medium' | 'high';
    notes?: string;
    quantity: number;
    addedAt: string;
  }>): void {
    const localItems: LocalWishlistItem[] = serverItems.map(item => ({
      boxId: item.boxId,
      addedAt: item.addedAt,
      priority: item.priority,
      notes: item.notes,
      quantity: item.quantity
    }));
    
    this.setItems(localItems);
  }

  // Merge local items with server items (local takes precedence for conflicts)
  static mergeWithServer(serverItems: Array<{
    boxId: number;
    priority: 'low' | 'medium' | 'high';
    notes?: string;
    quantity: number;
    addedAt: string;
  }>): LocalWishlistItem[] {
    const localItems = this.getItems();
    const localBoxIds = new Set(localItems.map(item => item.boxId));
    
    // Start with local items (they take precedence)
    const mergedItems = [...localItems];
    
    // Add server items that don't exist locally
    serverItems.forEach(serverItem => {
      if (!localBoxIds.has(serverItem.boxId)) {
        mergedItems.push({
          boxId: serverItem.boxId,
          addedAt: serverItem.addedAt,
          priority: serverItem.priority,
          notes: serverItem.notes,
          quantity: serverItem.quantity
        });
      }
    });
    
    // Sort by addedAt (most recent first)
    mergedItems.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
    
    this.setItems(mergedItems);
    return mergedItems;
  }
}