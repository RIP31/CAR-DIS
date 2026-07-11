import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import VehicleListing from '../pages/VehicleListing';
import VehicleDetails from '../pages/VehicleDetails';
import api from '../services/api';

// Mock api
vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
    },
  },
}));

// Mock useAuth
const mockUseAuth = vi.fn();
vi.mock('../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock useToast
const mockShowToast = vi.fn();
vi.mock('../context/ToastContext', () => ({
  useToast: () => ({
    showToast: mockShowToast,
  }),
  ToastProvider: ({ children }: any) => <div>{children}</div>,
}));

const mockVehicles = [
  {
    id: 'v-1',
    make: 'Ford',
    model: 'Explorer',
    category: 'SUV',
    price: 45000,
    quantity: 2,
    year: 2022,
    fuel_type: 'Gasoline',
    transmission: 'Automatic',
    description: 'A spacious family SUV.',
    created_at: '2026-07-11T08:00:00Z',
    updated_at: '2026-07-11T08:00:00Z',
  },
];

describe('VehicleListing Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: null });
  });

  it('renders title and showroom grid items', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockVehicles });

    await act(async () => {
      render(
        <MemoryRouter>
          <VehicleListing />
        </MemoryRouter>
      );
    });

    expect(screen.getByText('Vehicle Showroom')).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith('/api/vehicles');
    expect(screen.getByText('Ford Explorer')).toBeInTheDocument();
  });
});

describe('VehicleDetails Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches and renders vehicle specification properties', async () => {
    mockUseAuth.mockReturnValue({
      user: { name: 'Jane Doe', role: 'USER' },
    });
    vi.mocked(api.get).mockResolvedValue({ data: mockVehicles[0] });

    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/vehicles/v-1']}>
          <Routes>
            <Route path="/vehicles/:id" element={<VehicleDetails />} />
          </Routes>
        </MemoryRouter>
      );
    });

    expect(api.get).toHaveBeenCalledWith('/api/vehicles/v-1');
    expect(screen.getByRole('heading', { name: 'Ford Explorer' })).toBeInTheDocument();
    expect(screen.getByText('$45,000')).toBeInTheDocument();
    expect(screen.getByText('A spacious family SUV.')).toBeInTheDocument();
  });

  it('handles purchase transaction flow', async () => {
    mockUseAuth.mockReturnValue({
      user: { name: 'Jane Doe', role: 'USER' },
    });
    vi.mocked(api.get).mockResolvedValue({ data: mockVehicles[0] });
    // Successful purchase returns updated vehicle with decremented quantity
    const updatedVehicle = { ...mockVehicles[0], quantity: 1 };
    vi.mocked(api.post).mockResolvedValue({ data: updatedVehicle });

    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/vehicles/v-1']}>
          <Routes>
            <Route path="/vehicles/:id" element={<VehicleDetails />} />
          </Routes>
        </MemoryRouter>
      );
    });

    const purchaseBtn = screen.getByRole('button', { name: /secure purchase/i });
    await act(async () => {
      purchaseBtn.click();
    });

    expect(api.post).toHaveBeenCalledWith('/api/vehicles/v-1/purchase');
    expect(mockShowToast).toHaveBeenCalledWith(
      'Congratulations! You have purchased the Ford Explorer!',
      'success'
    );
  });
});
