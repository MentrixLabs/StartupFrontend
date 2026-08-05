// src/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/api/types';
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  getCurrentUser,
} from '@/api/auth';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  // Действия
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  clearError: () => void;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const user = await apiLogin({ email, password });
          set({
            user,
            isLoading: false,
            error: null,
            isAuthenticated: true,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Ошибка входа',
            isAuthenticated: false,
          });
          throw error;
        }
      },

      register: async (email, password, fullName) => {
        set({ isLoading: true, error: null });
        try {
          const user = await apiRegister({
            email,
            password,
            full_name: fullName,
          });
          set({
            user,
            isLoading: false,
            error: null,
            isAuthenticated: true,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Ошибка регистрации',
            isAuthenticated: false,
          });
          throw error;
        }
      },

      logout: () => {
        apiLogout();
        set({
          user: null,
          error: null,
          isAuthenticated: false,
        });
      },

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      clearError: () => set({ error: null }),

      loadUser: async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
          set({ user: null, error: null, isAuthenticated: false });
          return;
        }
        set({ isLoading: true });
        try {
          const user = await getCurrentUser();
          set({
            user,
            isLoading: false,
            error: null,
            isAuthenticated: true,
          });
        } catch (error) {
          // Токен недействителен
          localStorage.removeItem('access_token');
          set({
            user: null,
            isLoading: false,
            error: null,
            isAuthenticated: false,
          });
        }
      },
    }),
    {
      name: 'auth-storage', // ключ для localStorage
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }), // сохраняем только эти поля
    }
  )
);