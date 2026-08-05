// src/utils/validators.ts

/**
 * Результат валидации: если поле валидно, возвращается null,
 * иначе строка с сообщением об ошибке.
 */
export type ValidationResult = string | null;

/**
 * Проверяет, что значение не пустое (для строк, массивов, чисел).
 */
export const validateRequired = (value: any, fieldName: string = 'Поле'): ValidationResult => {
  if (value === undefined || value === null) {
    return `${fieldName} обязательно для заполнения`;
  }
  if (typeof value === 'string' && value.trim() === '') {
    return `${fieldName} обязательно для заполнения`;
  }
  if (Array.isArray(value) && value.length === 0) {
    return `${fieldName} обязательно для заполнения`;
  }
  if (typeof value === 'number' && isNaN(value)) {
    return `${fieldName} обязательно для заполнения`;
  }
  return null;
};

/**
 * Проверяет корректность email-адреса.
 */
export const validateEmail = (value: string): ValidationResult => {
  const trimmed = value?.trim();
  if (!trimmed) {
    return 'Email обязателен для заполнения';
  }
  // Базовый RFC 5322-подобный regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return 'Введите корректный email адрес';
  }
  return null;
};

/**
 * Проверяет пароль на минимальную длину и сложность (буквы + цифры).
 */
export const validatePassword = (
  value: string,
  minLength: number = 6,
  requireDigits: boolean = true
): ValidationResult => {
  const trimmed = value?.trim();
  if (!trimmed) {
    return 'Пароль обязателен для заполнения';
  }
  if (trimmed.length < minLength) {
    return `Пароль должен содержать не менее ${minLength} символов`;
  }
  if (requireDigits && !/\d/.test(trimmed)) {
    return 'Пароль должен содержать хотя бы одну цифру';
  }
  if (requireDigits && !/[a-zA-Z]/.test(trimmed)) {
    return 'Пароль должен содержать хотя бы одну букву';
  }
  return null;
};

/**
 * Проверяет совпадение пароля и подтверждения.
 */
export const validateConfirmPassword = (password: string, confirm: string): ValidationResult => {
  if (!confirm) {
    return 'Подтверждение пароля обязательно';
  }
  if (password !== confirm) {
    return 'Пароли не совпадают';
  }
  return null;
};

/**
 * Проверяет номер телефона (российский формат).
 */
export const validatePhone = (value: string): ValidationResult => {
  const trimmed = value?.trim();
  if (!trimmed) {
    return 'Номер телефона обязателен для заполнения';
  }
  // Убираем все нецифровые символы
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length !== 11) {
    return 'Номер телефона должен содержать 11 цифр';
  }
  if (!digits.startsWith('7') && !digits.startsWith('8')) {
    return 'Номер телефона должен начинаться с 7 или 8';
  }
  return null;
};

/**
 * Проверяет корректность URL.
 */
export const validateUrl = (value: string): ValidationResult => {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null; // URL не обязателен, если не хотим требовать
  }
  try {
    const url = new URL(trimmed);
    if (!['http:', 'https:'].includes(url.protocol)) {
      return 'URL должен начинаться с http:// или https://';
    }
    return null;
  } catch {
    return 'Введите корректный URL';
  }
};

/**
 * Проверяет минимальную длину строки.
 */
export const validateMinLength = (value: string, min: number, fieldName: string = 'Поле'): ValidationResult => {
  const trimmed = value?.trim() || '';
  if (trimmed.length < min) {
    return `${fieldName} должно содержать не менее ${min} символов`;
  }
  return null;
};

/**
 * Проверяет максимальную длину строки.
 */
export const validateMaxLength = (value: string, max: number, fieldName: string = 'Поле'): ValidationResult => {
  const trimmed = value?.trim() || '';
  if (trimmed.length > max) {
    return `${fieldName} должно содержать не более ${max} символов`;
  }
  return null;
};

/**
 * Проверяет, что значение является числом.
 */
export const validateNumber = (value: any): ValidationResult => {
  if (value === undefined || value === null || value === '') {
    return 'Введите число';
  }
  const num = Number(value);
  if (isNaN(num)) {
    return 'Введите корректное число';
  }
  return null;
};

/**
 * Проверяет минимальное числовое значение.
 */
export const validateMin = (value: number, min: number, fieldName: string = 'Значение'): ValidationResult => {
  if (value < min) {
    return `${fieldName} должно быть не менее ${min}`;
  }
  return null;
};

/**
 * Проверяет максимальное числовое значение.
 */
export const validateMax = (value: number, max: number, fieldName: string = 'Значение'): ValidationResult => {
  if (value > max) {
    return `${fieldName} должно быть не более ${max}`;
  }
  return null;
};

/**
 * Проверяет артикул товара: только буквы, цифры, дефис, подчеркивание.
 */
export const validateArticle = (value: string): ValidationResult => {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null; // артикул не обязателен
  }
  const articleRegex = /^[a-zA-Z0-9_-]+$/;
  if (!articleRegex.test(trimmed)) {
    return 'Артикул может содержать только буквы, цифры, дефис и подчеркивание';
  }
  return null;
};

/**
 * Проверяет цену: положительное число.
 */
export const validatePrice = (value: number): ValidationResult => {
  if (value === undefined || value === null || isNaN(value)) {
    return 'Введите цену';
  }
  if (value < 0) {
    return 'Цена не может быть отрицательной';
  }
  return null;
};

/**
 * Проверяет, что значение является одним из допустимых вариантов (enum).
 */
export const validateEnum = <T extends string | number>(
  value: T,
  allowedValues: T[],
  fieldName: string = 'Поле'
): ValidationResult => {
  if (!allowedValues.includes(value)) {
    return `Недопустимое значение для ${fieldName}`;
  }
  return null;
};

/**
 * Проверяет, что строка не содержит специальных символов (безопасное имя).
 */
export const validateSafeName = (value: string, fieldName: string = 'Имя'): ValidationResult => {
  const trimmed = value?.trim();
  if (!trimmed) {
    return `${fieldName} обязательно для заполнения`;
  }
  const safeRegex = /^[a-zA-Zа-яА-ЯёЁ\s'-]+$/;
  if (!safeRegex.test(trimmed)) {
    return `${fieldName} может содержать только буквы, пробелы, дефис и апостроф`;
  }
  return null;
};

/**
 * Комбинированная проверка: применяет массив валидаторов последовательно.
 * Возвращает первую ошибку, если есть, иначе null.
 */
export const composeValidators = (
  ...validators: ((value: any) => ValidationResult)[]
): ((value: any) => ValidationResult) => {
  return (value: any): ValidationResult => {
    for (const validator of validators) {
      const result = validator(value);
      if (result !== null) {
        return result;
      }
    }
    return null;
  };
};