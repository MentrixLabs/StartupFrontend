import client from './client';
import { User } from './types';

// Ответ после логина/регистрации
interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// Параметры регистрации (отправляются как JSON)
interface RegisterData {
  username: string;
  email: string;
  password: string;
  full_name?: string;
}

// Параметры логина (отправляются как x-www-form-urlencoded)
interface LoginData {
  username: string;   // вместо email – бэкенд ожидает username
  password: string;
}

// Логин – отправляет form-urlencoded
export const login = async (data: LoginData): Promise<void> => {
  const formData = new URLSearchParams();
  formData.append('username', data.username);
  formData.append('password', data.password);

  const response = await client.post<{ access_token: string; token_type: string }>(
    '/auth/login',
    formData,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );
  localStorage.setItem('access_token', response.data.access_token);
};

// Регистрация – отправляет JSON (как раньше)
export const register = async (data: RegisterData): Promise<User> => {
  const response = await client.post<AuthResponse>('/auth/register', data);
  const { access_token, user } = response.data;
  localStorage.setItem('access_token', access_token);
  return user;
};

// Выход – удаляем токен
export const logout = (): void => {
  localStorage.removeItem('access_token');
};

// Получение текущего пользователя (по токену)
export const getCurrentUser = async (): Promise<User> => {
  const response = await client.get<User>('/auth/me');
  return response.data;
};

// Проверка, авторизован ли пользователь
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('access_token');
};