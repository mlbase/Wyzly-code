'use client';

import { useState, useEffect, useCallback } from 'react';
import { LocalFavoritesStorage } from '../utils/localFavorites';

interface UseFavoritesReturn {
  favorites: Set<number>;
  isFavorite: (boxId: number) => boolean;
  toggleFavorite: (boxId: number) => boolean; // Returns new favorite status
  favoritesCount: number;
}

export function useFavorites(): UseFavoritesReturn {
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  // Load favorites on mount
  useEffect(() => {
    const savedFavorites = LocalFavoritesStorage.getFavorites();
    setFavorites(new Set(savedFavorites));
  }, []);

  const isFavorite = useCallback((boxId: number): boolean => {
    return favorites.has(boxId);
  }, [favorites]);

  const toggleFavorite = useCallback((boxId: number): boolean => {
    const { isFavorite: newStatus, favorites: newFavorites } = LocalFavoritesStorage.toggleFavorite(boxId);
    setFavorites(new Set(newFavorites));
    return newStatus;
  }, []);

  const favoritesCount = favorites.size;

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    favoritesCount
  };
}