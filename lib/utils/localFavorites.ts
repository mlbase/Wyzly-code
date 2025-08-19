'use client';

const LOCAL_FAVORITES_KEY = 'wyzly_local_favorites';

export class LocalFavoritesStorage {
  // Get all favorite box IDs from localStorage
  static getFavorites(): number[] {
    try {
      if (typeof window === 'undefined') return [];
      
      const stored = localStorage.getItem(LOCAL_FAVORITES_KEY);
      if (!stored) return [];
      
      const favorites = JSON.parse(stored) as number[];
      return Array.isArray(favorites) ? favorites : [];
    } catch (error) {
      console.error('Error reading local favorites:', error);
      return [];
    }
  }

  // Save favorites to localStorage
  static setFavorites(favorites: number[]): void {
    try {
      if (typeof window === 'undefined') return;
      
      localStorage.setItem(LOCAL_FAVORITES_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving local favorites:', error);
    }
  }

  // Add item to favorites
  static addFavorite(boxId: number): number[] {
    const favorites = this.getFavorites();
    if (!favorites.includes(boxId)) {
      favorites.push(boxId);
      this.setFavorites(favorites);
    }
    return favorites;
  }

  // Remove item from favorites
  static removeFavorite(boxId: number): number[] {
    const favorites = this.getFavorites();
    const filteredFavorites = favorites.filter(id => id !== boxId);
    this.setFavorites(filteredFavorites);
    return filteredFavorites;
  }

  // Toggle favorite status
  static toggleFavorite(boxId: number): { isFavorite: boolean; favorites: number[] } {
    const favorites = this.getFavorites();
    const isFavorite = favorites.includes(boxId);
    
    if (isFavorite) {
      const newFavorites = this.removeFavorite(boxId);
      return { isFavorite: false, favorites: newFavorites };
    } else {
      const newFavorites = this.addFavorite(boxId);
      return { isFavorite: true, favorites: newFavorites };
    }
  }

  // Check if item is favorite
  static isFavorite(boxId: number): boolean {
    const favorites = this.getFavorites();
    return favorites.includes(boxId);
  }

  // Get favorites count
  static getFavoritesCount(): number {
    return this.getFavorites().length;
  }

  // Clear all favorites
  static clearFavorites(): void {
    try {
      if (typeof window === 'undefined') return;
      localStorage.removeItem(LOCAL_FAVORITES_KEY);
    } catch (error) {
      console.error('Error clearing local favorites:', error);
    }
  }
}