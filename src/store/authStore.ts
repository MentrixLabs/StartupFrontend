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

  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  clearError: () => void;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          // В api/login уже используется username, но мы передаём email как username
          // Если хотите использовать email как логин, адаптируйте
          const user = await apiLogin({ username: email, password });
          set({
            user,
            isLoading: false,
            error: null,
            isAuthenticated: true,
          });
        } catch (error: any) {
          const detail = error.response?.data?.detail || error.message || 'Ошибка входа';
          set({
            isLoading: false,
            error: typeof detail === 'string' ? detail : JSON.stringify(detail),
            isAuthenticated: false,
          });
          throw error;
        }
      },

      register: async (username, email, password, fullName) => {
        set({ isLoading: true, error: null });
        try {
          const user = await apiRegister({
            username,
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
          const detail = error.response?.data?.detail || error.message || 'Ошибка регистрации';
          set({
            isLoading: false,
            error: typeof detail === 'string' ? detail : JSON.stringify(detail),
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
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);