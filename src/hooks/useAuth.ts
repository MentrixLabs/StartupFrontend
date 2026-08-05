import { useState, useEffect, useCallback } from 'react';
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  getCurrentUser,
  isAuthenticated,
} from '@/api/auth';
import type { User } from '@/api/types';

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => void;
  isAuth: boolean;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Функция для загрузки текущего пользователя (при монтировании и после входа)
  const fetchUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (isAuthenticated()) {
        const userData = await getCurrentUser();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки пользователя');
      setUser(null);
      // Если токен невалиден, удаляем его
      localStorage.removeItem('access_token');
    } finally {
      setLoading(false);
    }
  }, []);

  // При монтировании проверяем аутентификацию
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Вход
  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      setError(null);
      try {
        const userData = await apiLogin({ email, password });
        setUser(userData);
      } catch (err: any) {
        setError(err.response?.data?.detail || err.message || 'Ошибка входа');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Регистрация
  const register = useCallback(
    async (email: string, password: string, fullName?: string) => {
      setLoading(true);
      setError(null);
      try {
        const userData = await apiRegister({ email, password, full_name: fullName });
        setUser(userData);
      } catch (err: any) {
        setError(err.response?.data?.detail || err.message || 'Ошибка регистрации');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Выход
  const logout = useCallback(() => {
    apiLogout();
    setUser(null);
    setError(null);
  }, []);

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuth: !!user,
  };
};