import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import VehicleCard from '../components/VehicleCard';
import { ToastProvider } from '../context/ToastContext';
import type { Vehicle } from '../types';

// Mock useAuth
const mockUseAuth = vi.fn();
vi.mock('../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

const mockVehicle: Vehicle = {
  id: 'v-123',
  make: 'Honda',
  model: 'Civic',
  category: 'Sedan',
  price: 22000,
  quantity: 3,
  year: 2023,
  fuel_type: 'Gasoline',
  transmission: 'Automatic',
  description: 'Reliable sedan',
  image_url: 'http://example.com/civic.jpg',
  created_at: '2026-07-11T08:00:00Z',
  updated_at: '2026-07-11T08:00:00Z',
};

describe('Footer Component', () => {
  it('renders copyright text', () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );
    expect(screen.getByText(/CAR-DIS Systems Inc/i)).toBeInTheDocument();
  });
});

describe('Navbar Component', () => {
  it('renders login link when user is Guest', () => {
    mockUseAuth.mockReturnValue({ user: null, logout: vi.fn() });
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.queryByText('Admin Portal')).not.toBeInTheDocument();
  });

  it('renders dashboard link when user is Admin', () => {
    mockUseAuth.mockReturnValue({
      user: { name: 'Admin User', role: 'ADMIN' },
      logout: vi.fn(),
    });
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
    expect(screen.getByText('Admin Portal')).toBeInTheDocument();
    expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
  });
});

describe('VehicleCard Component', () => {
  it('renders vehicle specs and price', () => {
    render(
      <BrowserRouter>
        <ToastProvider>
          <VehicleCard vehicle={mockVehicle} />
        </ToastProvider>
      </BrowserRouter>
    );
    expect(screen.getByText('Honda Civic')).toBeInTheDocument();
    expect(screen.getByText('$22,000')).toBeInTheDocument();
    expect(screen.getByText('Sedan')).toBeInTheDocument();
    expect(screen.getByText('3 available')).toBeInTheDocument();
  });
});
