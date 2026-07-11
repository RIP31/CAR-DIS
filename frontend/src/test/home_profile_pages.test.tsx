import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from '../pages/Home';
import Profile from '../pages/Profile';
import api from '../services/api';

// Mock api
vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

// Mock useAuth
const mockUseAuth = vi.fn();
vi.mock('../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
  AuthProvider: ({ children }: any) => <div>{children}</div>,
}));

// Mock useToast
vi.mock('../context/ToastContext', () => ({
  useToast: () => ({ showToast: vi.fn() }),
  ToastProvider: ({ children }: any) => <div>{children}</div>,
}));

const mockVehicles = [
  {
    id: 'v-1',
    make: 'Tesla',
    model: 'Model S',
    category: 'SUV',
    price: 89000,
    quantity: 5,
    year: 2023,
    fuel_type: 'Electric',
    transmission: 'Automatic',
    created_at: '2026-07-11T08:00:00Z',
    updated_at: '2026-07-11T08:00:00Z',
  },
];

describe('Home Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders hero title and fetches inventory items', async () => {
    mockUseAuth.mockReturnValue({ user: null, logout: vi.fn() });
    vi.mocked(api.get).mockResolvedValue({ data: mockVehicles });

    await act(async () => {
      render(
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      );
    });

    expect(screen.getByText(/Find Your Next/i)).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith('/api/vehicles');
    expect(screen.getAllByText('Tesla Model S').length).toBeGreaterThanOrEqual(1);
  });
});

describe('Profile Page', () => {
  it('renders user details when logged in', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: 'u-123',
        name: 'Jane Doe',
        email: 'jane@example.com',
        role: 'USER',
        created_at: '2026-07-11T00:00:00Z',
      },
    });

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    expect(screen.getAllByText('Jane Doe').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('USER Account')).toBeInTheDocument();
  });
});
