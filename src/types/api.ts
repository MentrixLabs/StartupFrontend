// src/types/api.ts

/**
 * Стандартный ответ сервера при ошибке
 */
export interface ApiError {
  detail: string;
  status_code: number;
  // Дополнительные поля для валидации
  errors?: Record<string, string[]>;
}

/**
 * Обёртка для успешного ответа (если используется)
 * Некоторые API используют { data: T, message?: string }
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: string;
}

/**
 * Параметры пагинации для запросов
 */
export interface PaginationParams {
  page?: number;  // номер страницы, начиная с 1
  size?: number;  // количество элементов на странице
}

/**
 * Параметры сортировки для запросов
 */
export interface SortParams {
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

/**
 * Стандартные коды ошибок, используемые в API
 */
export enum ApiErrorCode {
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  VALIDATION_ERROR = 422,
  INTERNAL_SERVER_ERROR = 500,
}

/**
 * Тип для токена аутентификации (JWT)
 */
export type AccessToken = string;

/**
 * Тип для заголовков с токеном
 */
export interface AuthHeaders {
  Authorization: `Bearer ${string}`;
}

/**
 * Базовый URL для API (из env)
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Базовые настройки для запросов
 */
export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
} as const;