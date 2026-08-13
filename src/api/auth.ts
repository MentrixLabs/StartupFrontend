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

  const response = await client.post('/auth/login', formData.toString(), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  const { access_token } = response.data;
  localStorage.setItem('access_token', access_token);
  return response.data;
};

// Регистрация – отправляет JSON (как раньше)
export const register = async (data: RegisterData): Promise<User> => {
  const response = await client.post<User>('/auth/register', data);
  // Не сохраняем токен – регистрация не даёт токен
  return response.data;
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