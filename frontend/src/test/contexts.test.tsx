import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ToastProvider, useToast } from '../context/ToastContext';
import { AuthProvider, useAuth } from '../context/AuthContext';
import api from '../services/api';

// Mock the API client
vi.mock('../services/api', () => {
  return {
    default: {
      get: vi.fn(),
      post: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
      },
    },
  };
});

// Helper component to test Toast
const ToastTestComponent = () => {
  const { showToast } = useToast();
  return (
    <button onClick={() => showToast('Test success toast', 'success')}>
      Trigger Toast
    </button>
  );
};

// Helper component to test Auth
const AuthTestComponent = () => {
  const { user, login, logout, token } = useAuth();
  return (
    <div>
      <span data-testid="user-name">{user ? user.name : 'Guest'}</span>
      <span data-testid="token">{token || 'No Token'}</span>
      <button onClick={() => login('test@example.com', 'password')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('ToastContext', () => {
  it('should render toast when triggered', async () => {
    render(
      <ToastProvider>
        <ToastTestComponent />
      </ToastProvider>
    );

    const button = screen.getByText('Trigger Toast');
    act(() => {
      button.click();
    });

    expect(screen.getByText('Test success toast')).toBeInTheDocument();
  });
});

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should login and retrieve profile successfully', async () => {
    const mockToken = { data: { access_token: 'mock_token' } };
    const mockProfile = { data: { name: 'John Doe', email: 'john@example.com', role: 'USER' } };
    
    vi.mocked(api.post).mockResolvedValue(mockToken);
    vi.mocked(api.get).mockResolvedValue(mockProfile);

    render(
      <AuthProvider>
        <AuthTestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('user-name')).toHaveTextContent('Guest');

    const loginButton = screen.getByText('Login');
    await act(async () => {
      loginButton.click();
    });

    expect(api.post).toHaveBeenCalledWith('/api/auth/login', {
      email: 'test@example.com',
      password: 'password',
    });
    expect(localStorage.getItem('token')).toBe('mock_token');
    expect(screen.getByTestId('user-name')).toHaveTextContent('John Doe');
  });

  it('should clear token and user on logout', async () => {
    localStorage.setItem('token', 'existing_token');
    const mockProfile = { data: { name: 'John Doe', email: 'john@example.com', role: 'USER' } };
    vi.mocked(api.get).mockResolvedValue(mockProfile);

    render(
      <AuthProvider>
        <AuthTestComponent />
      </AuthProvider>
    );

    // Wait for profile fetch
    await act(async () => {
      await Promise.resolve();
    });

    const logoutButton = screen.getByText('Logout');
    act(() => {
      logoutButton.click();
    });

    expect(localStorage.getItem('token')).toBeNull();
    expect(screen.getByTestId('user-name')).toHaveTextContent('Guest');
  });
});
