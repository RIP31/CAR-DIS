import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AdminDashboard from '../pages/AdminDashboard';
import AddVehicle from '../pages/AddVehicle';
import EditVehicle from '../pages/EditVehicle';
import api from '../services/api';

// Mock api
vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
    },
  },
}));

// Mock useAuth
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { name: 'Admin User', role: 'ADMIN' },
    loading: false,
  }),
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
    make: 'Toyota',
    model: 'Supra',
    category: 'Sports',
    price: 55000,
    quantity: 4,
    year: 2023,
    fuel_type: 'Gasoline',
    transmission: 'Manual',
    description: 'Manual sports car',
    created_at: '2026-07-11T08:00:00Z',
    updated_at: '2026-07-11T08:00:00Z',
  },
];

describe('AdminDashboard Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders stats and registry records list', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockVehicles });

    await act(async () => {
      render(
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      );
    });

    // Verify API call was made
    expect(api.get).toHaveBeenCalledWith('/api/vehicles');

    // Verify dashboard title and stat labels render
    expect(await screen.findByText('Admin Dashboard')).toBeInTheDocument();
    expect(await screen.findByText(/Total Valuation/i)).toBeInTheDocument();
    expect(await screen.findByText(/Physical Stock/i)).toBeInTheDocument();
    expect(await screen.findByText(/Out of Stock/i)).toBeInTheDocument();

    // Verify vehicle record appears in the registry table
    expect(await screen.findByText('Toyota Supra')).toBeInTheDocument();
  });
});

describe('AddVehicle Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('submits registration data and routes back to dashboard', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: mockVehicles[0] });

    render(
      <MemoryRouter initialEntries={['/admin/add-vehicle']}>
        <Routes>
          <Route path="/admin/add-vehicle" element={<AddVehicle />} />
          <Route path="/admin" element={<div>Admin Dashboard Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    const makeInput = screen.getByPlaceholderText('e.g. Tesla');
    const modelInput = screen.getByPlaceholderText('e.g. Model Y');
    const priceInput = screen.getByPlaceholderText('e.g. 59900');
    const quantityInput = screen.getByPlaceholderText('e.g. 5');
    const submitButton = screen.getByRole('button', { name: /register vehicle/i });

    await act(async () => {
      await userEvent.type(makeInput, 'Tesla');
      await userEvent.type(modelInput, 'Model Y');
      await userEvent.type(priceInput, '60000');
      await userEvent.type(quantityInput, '3');
      await submitButton.click();
    });

    expect(api.post).toHaveBeenCalledWith('/api/vehicles', expect.objectContaining({
      make: 'Tesla',
      model: 'Model Y',
      price: 60000,
      quantity: 3,
    }));
    expect(screen.getByText('Admin Dashboard Page')).toBeInTheDocument();
  });
});

describe('EditVehicle Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('pre-populates current state and modifies successfully', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockVehicles[0] });
    vi.mocked(api.put).mockResolvedValue({ data: { ...mockVehicles[0], price: 56000 } });

    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/admin/edit-vehicle/v-1']}>
          <Routes>
            <Route path="/admin/edit-vehicle/:id" element={<EditVehicle />} />
            <Route path="/admin" element={<div>Admin Dashboard Page</div>} />
          </Routes>
        </MemoryRouter>
      );
    });

    expect(api.get).toHaveBeenCalledWith('/api/vehicles/v-1');
    const priceInput = screen.getByPlaceholderText('e.g. 59900');
    expect(priceInput).toHaveValue(55000);

    const submitButton = screen.getByRole('button', { name: /save modifications/i });
    await act(async () => {
      await userEvent.clear(priceInput);
      await userEvent.type(priceInput, '56000');
      await submitButton.click();
    });

    expect(api.put).toHaveBeenCalledWith('/api/vehicles/v-1', expect.objectContaining({
      price: 56000,
    }));
    expect(screen.getByText('Admin Dashboard Page')).toBeInTheDocument();
  });
});
