import client from './client';
import { User } from './types';

// Ответ после логина/регистрации
interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// Параметры регистрации
interface RegisterData {
  email: string;
  password: string;
  full_name?: string;
}

// Параметры логина
interface LoginData {
  email: string;
  password: string;
}

// Логин – сохраняет токен и возвращает данные пользователя
export const login = async (data: LoginData): Promise<User> => {
  const response = await client.post<AuthResponse>('/auth/login', data);
  const { access_token, user } = response.data;
  localStorage.setItem('access_token', access_token);
  return user;
};

// Регистрация – аналогично
export const register = async (data: RegisterData): Promise<User> => {
  const response = await client.post<AuthResponse>('/auth/register', data);
  const { access_token, user } = response.data;
  localStorage.setItem('access_token', access_token);
  return user;
};

// Выход – удаляем токен
export const logout = (): void => {
  localStorage.removeItem('access_token');
  // Можно также сделать запрос на /auth/logout, если требуется
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