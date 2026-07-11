import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  wishlistIds: Set<string>;
  wishlistCount: number;
  toggleWishlist: (vehicleId: string) => Promise<'added' | 'removed'>;
  isInWishlist: (vehicleId: string) => boolean;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());

  const refreshWishlist = useCallback(async () => {
    if (!user) {
      setWishlistIds(new Set());
      return;
    }
    try {
      const response = await api.get<{ id: string; vehicle_id: string }[]>('/api/wishlist');
      setWishlistIds(new Set(response.data.map(item => item.vehicle_id)));
    } catch (err) {
      console.error('Failed to fetch wishlist', err);
    }
  }, [user]);

  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  const toggleWishlist = useCallback(async (vehicleId: string): Promise<'added' | 'removed'> => {
    const response = await api.post<{ action: string }>(`/api/wishlist/${vehicleId}`);
    const action = response.data.action as 'added' | 'removed';
    setWishlistIds(prev => {
      const next = new Set(prev);
      if (action === 'added') {
        next.add(vehicleId);
      } else {
        next.delete(vehicleId);
      }
      return next;
    });
    return action;
  }, []);

  const isInWishlist = useCallback((vehicleId: string) => wishlistIds.has(vehicleId), [wishlistIds]);

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        wishlistCount: wishlistIds.size,
        toggleWishlist,
        isInWishlist,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
