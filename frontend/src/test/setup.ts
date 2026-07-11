import '@testing-library/jest-dom';
import { vi } from 'vitest';

vi.mock('../context/WishlistContext', () => ({
  useWishlist: () => ({
    wishlistIds: new Set(),
    wishlistCount: 0,
    toggleWishlist: vi.fn().mockResolvedValue('added'),
    isInWishlist: () => false,
    refreshWishlist: vi.fn().mockResolvedValue(undefined),
  }),
  WishlistProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('../context/CompareContext', () => ({
  useCompare: () => ({
    compareList: [],
    addToCompare: vi.fn().mockReturnValue(true),
    removeFromCompare: vi.fn(),
    isInCompare: () => false,
    clearCompare: vi.fn(),
  }),
  CompareProvider: ({ children }: { children: React.ReactNode }) => children,
}));
