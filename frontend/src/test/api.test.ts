import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import api from '../services/api';

describe('API Client Interceptor', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should not attach Authorization header if token is missing in localStorage', async () => {
    const config = { headers: {} as any };
    // Trigger request interceptor manually or test instance config
    const interceptor = (api.interceptors.request as any).handlers[0].fulfilled;
    const result = interceptor(config);
    expect(result.headers.Authorization).toBeUndefined();
  });

  it('should attach Authorization header with Bearer token if token exists in localStorage', async () => {
    localStorage.setItem('token', 'mocked_jwt_token_123');
    const config = { headers: {} as any };
    const interceptor = (api.interceptors.request as any).handlers[0].fulfilled;
    const result = interceptor(config);
    expect(result.headers.Authorization).toBe('Bearer mocked_jwt_token_123');
  });
});
