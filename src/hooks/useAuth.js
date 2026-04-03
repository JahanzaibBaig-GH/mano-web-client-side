import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import * as authService from '../services/auth';
import { ROUTES, STORAGE_KEYS, MESSAGES } from '../constants';

// Module-level singleton — shared across all useAuth instances without Context API
let _user = null;
let _initialized = false;
let _initializing = false;
const _listeners = new Set();

function notifyListeners() {
  _listeners.forEach((fn) => fn(_user));
}

function subscribe(fn) {
  _listeners.add(fn);
  return () => _listeners.delete(fn);
}

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState(_user);
  const [loading, setLoading] = useState(!_initialized);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Keep this instance in sync with global state changes
    const unsubscribe = subscribe((newUser) => {
      setUser(newUser);
    });

    // Only run the token check once across all instances
    if (!_initialized && !_initializing) {
      _initializing = true;

      const token =
        typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.TOKEN) : null;

      if (token) {
        authService
          .getProfile()
          .then((response) => {
            const payload = response.data?.data || response.data;
            _user = payload.user || payload;
            _initialized = true;
            _initializing = false;
            notifyListeners();
            setLoading(false);
          })
          .catch(() => {
            if (typeof window !== 'undefined') {
              localStorage.removeItem(STORAGE_KEYS.TOKEN);
              localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
            }
            _user = null;
            _initialized = true;
            _initializing = false;
            notifyListeners();
            setLoading(false);
          });
      } else {
        _initialized = true;
        _initializing = false;
        setLoading(false);
      }
    } else if (_initialized) {
      setLoading(false);
    }

    return unsubscribe;
  }, []);

  const login = useCallback(async (credentials) => {
    setError(null);
    setLoading(true);
    try {
      const response = await authService.login(credentials);
      const payload = response.data?.data || response.data;

      const token = payload.tokens?.access_token || payload.token || payload.accessToken;
      const refreshToken = payload.tokens?.refresh_token || payload.refreshToken;
      const userData = payload.user || payload;

      if (token) localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      if (refreshToken) localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);

      _user = userData;
      _initialized = true;
      notifyListeners();
      setLoading(false);
      return { success: true };
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || MESSAGES.AUTH.LOGIN_FAILED;
      setError(message);
      setLoading(false);
      return { success: false, error: message };
    }
  }, []);

  const signup = useCallback(async (userData) => {
    setError(null);
    setLoading(true);
    try {
      const response = await authService.register(userData);
      setLoading(false);
      return { success: true, data: response.data };
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || MESSAGES.AUTH.REGISTRATION_FAILED;
      setError(message);
      setLoading(false);
      return { success: false, error: message };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Proceed with local logout even if server call fails
    }

    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    }

    _user = null;
    _initialized = true;
    notifyListeners();
    router.push(ROUTES.LOGIN);
  }, [router]);

  const refreshProfile = useCallback(async () => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (!token) return null;

    try {
      const response = await authService.getProfile();
      const payload = response.data?.data || response.data;
      _user = payload.user || payload;
      _initialized = true;
      notifyListeners();
      return _user;
    } catch {
      return null;
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { user, loading, error, login, signup, logout, refreshProfile, clearError };
}
