// src/types/user.ts

/**
 * Основная модель пользователя
 */
export interface User {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
  updated_at?: string;
  // Дополнительные поля, если появятся в будущем
  avatar_url?: string;
  role?: 'user' | 'admin';
}

/**
 * Расширенный профиль пользователя (может содержать дополнительные настройки)
 */
export interface UserProfile extends User {
  phone?: string;
  company?: string;
  website?: string;
  bio?: string;
  // Настройки уведомлений и предпочтения
  settings?: {
    theme?: 'light' | 'dark' | 'system';
    language?: 'ru' | 'en';
    email_notifications?: boolean;
  };
}

/**
 * Данные для входа
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Данные для регистрации
 */
export interface RegisterCredentials {
  email: string;
  password: string;
  full_name?: string;
}

/**
 * Ответ сервера при успешной аутентификации (логин/регистрация)
 */
export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

/**
 * Данные для обновления профиля (используется в запросе на обновление)
 */
export type UpdateProfileData = Partial<Pick<User, 'full_name' | 'email'>> & {
  avatar?: File | null;
};

/**
 * Данные для смены пароля
 */
export interface ChangePasswordData {
  current_password: string;
  new_password: string;
}