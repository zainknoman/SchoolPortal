import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from './auth';
import { api, ApiError } from '../lib/api';

vi.mock('../lib/api', () => ({
  api: { login: vi.fn() },
  ApiError: class ApiError extends Error {
    constructor(
      message: string,
      public status: number,
    ) {
      super(message);
    }
  },
}));

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.mocked(api.login).mockReset();
  });

  it('starts logged out with no token', () => {
    const store = useAuthStore();
    expect(store.isAuthenticated).toBe(false);
    expect(store.role).toBeNull();
  });

  it('logs in, stores the token + role, and marks the session authenticated', async () => {
    vi.mocked(api.login).mockResolvedValue({
      accessToken: 'token-abc',
      refreshToken: 'refresh-abc',
      role: 'TEACHER',
    });

    const store = useAuthStore();
    await store.login('teacher@seeds.edu.pk', 'ChangeMe123!');

    expect(store.isAuthenticated).toBe(true);
    expect(store.role).toBe('TEACHER');
    expect(store.accessToken).toBe('token-abc');
  });

  it('persists the session across a page reload (new store instance) via localStorage', async () => {
    vi.mocked(api.login).mockResolvedValue({
      accessToken: 'token-abc',
      refreshToken: 'refresh-abc',
      role: 'SCHOOL_ADMIN',
    });

    const store = useAuthStore();
    await store.login('admin@seeds.edu.pk', 'ChangeMe123!');

    // Simulate a fresh page load: new Pinia instance, store re-reads from localStorage.
    setActivePinia(createPinia());
    const reloadedStore = useAuthStore();

    expect(reloadedStore.isAuthenticated).toBe(true);
    expect(reloadedStore.role).toBe('SCHOOL_ADMIN');
  });

  it('surfaces the generic auth error from the API without modification', async () => {
    vi.mocked(api.login).mockRejectedValue(new ApiError('Invalid credentials', 401));

    const store = useAuthStore();
    await expect(store.login('teacher@seeds.edu.pk', 'wrong')).rejects.toThrow('Invalid credentials');
    expect(store.isAuthenticated).toBe(false);
  });

  it('clears the stored session on logout', async () => {
    vi.mocked(api.login).mockResolvedValue({
      accessToken: 'token-abc',
      refreshToken: 'refresh-abc',
      role: 'TEACHER',
    });

    const store = useAuthStore();
    await store.login('teacher@seeds.edu.pk', 'ChangeMe123!');
    store.logout();

    expect(store.isAuthenticated).toBe(false);
    expect(store.role).toBeNull();
    expect(localStorage.getItem('seeds.auth')).toBeNull();
  });
});
