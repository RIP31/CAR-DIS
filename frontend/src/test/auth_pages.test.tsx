import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';

// Mock useAuth
const mockLogin = vi.fn();
const mockRegister = vi.fn();
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    login: mockLogin,
    register: mockRegister,
  }),
}));

// Mock useToast
const mockShowToast = vi.fn();
vi.mock('../context/ToastContext', () => ({
  useToast: () => ({
    showToast: mockShowToast,
  }),
}));

// Mock MainLayout
vi.mock('../layouts/MainLayout', () => ({
  default: ({ children }: any) => <div data-testid="layout">{children}</div>,
}));

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders input fields and submits successfully', async () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<div>Home Catalog</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText(/name@example.com/i)).toBeInTheDocument();
    
    const emailInput = screen.getByPlaceholderText(/name@example.com/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await act(async () => {
      await userEvent.type(emailInput, 'john@example.com');
      await userEvent.type(passwordInput, 'Password123!');
      await submitButton.click();
    });

    expect(mockLogin).toHaveBeenCalledWith('john@example.com', 'Password123!');
    expect(screen.getByText('Home Catalog')).toBeInTheDocument();
  });
});

describe('Register Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders inputs and registers user successfully', async () => {
    render(
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<div>Home Catalog</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText(/john doe/i)).toBeInTheDocument();

    const nameInput = screen.getByPlaceholderText(/john doe/i);
    const emailInput = screen.getByPlaceholderText(/name@example.com/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    await act(async () => {
      await userEvent.type(nameInput, 'John Doe');
      await userEvent.type(emailInput, 'john@example.com');
      await userEvent.type(passwordInput, 'Password123!');
      await submitButton.click();
    });

    expect(mockRegister).toHaveBeenCalledWith('John Doe', 'john@example.com', 'Password123!', 'USER');
    expect(screen.getByText('Home Catalog')).toBeInTheDocument();
  });
});
