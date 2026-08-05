// src/utils/formatters.ts

/**
 * Форматирует дату в локальный формат (ru-RU)
 * @param date - строка с датой или объект Date
 * @param options - опции Intl.DateTimeFormat
 * @returns отформатированная строка
 */
export const formatDate = (
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }
): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) {
    return '—';
  }
  return new Intl.DateTimeFormat('ru-RU', options).format(d);
};

/**
 * Форматирует дату и время (локальный формат)
 * @param date - строка с датой или объект Date
 * @returns строка вида "12 янв 2024, 14:30"
 */
export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Форматирует сумму в рубли (₽)
 * @param amount - число
 * @param currency - валюта (по умолчанию 'RUB')
 * @param locale - локаль (по умолчанию 'ru-RU')
 * @returns строка вида "1 234,56 ₽"
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'RUB',
  locale: string = 'ru-RU'
): string => {
  if (!isFinite(amount)) {
    return '—';
  }
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Форматирует число с разделителями тысяч
 * @param value - число
 * @param locale - локаль (по умолчанию 'ru-RU')
 * @returns строка с разделителями (например, "1 234")
 */
export const formatNumber = (value: number, locale: string = 'ru-RU'): string => {
  if (!isFinite(value)) {
    return '—';
  }
  return new Intl.NumberFormat(locale).format(value);
};

/**
 * Форматирует относительное время (например, "2 часа назад")
 * @param date - дата для сравнения с текущим моментом
 * @param locale - локаль (по умолчанию 'ru-RU')
 * @returns человекочитаемая строка
 */
export const formatRelativeTime = (date: string | Date, locale: string = 'ru-RU'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) {
    return '—';
  }

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

 const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (diffSec < 60) {
    return 'только что';
  }
  if (diffMin < 60) {
    return rtf.format(-diffMin, 'minute');
  }
  if (diffHour < 24) {
    return rtf.format(-diffHour, 'hour');
  }
  if (diffDay < 7) {
    return rtf.format(-diffDay, 'day');
  }
  if (diffWeek < 5) {
    return rtf.format(-diffWeek, 'week');
  }
  if (diffMonth < 12) {
    return rtf.format(-diffMonth, 'month');
  }
  return rtf.format(-diffYear, 'year');
};

/**
 * Обрезает текст до указанной длины и добавляет многоточие
 * @param text - исходный текст
 * @param maxLength - максимальная длина (по умолчанию 100)
 * @param suffix - суффикс для обрезанного текста (по умолчанию '…')
 * @returns обрезанная строка
 */
export const truncateText = (
  text: string,
  maxLength: number = 100,
  suffix: string = '…'
): string => {
  if (!text) return '';
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength).trim() + suffix;
};

/**
 * Форматирует размер файла в человекочитаемый вид (байты → КБ, МБ и т.д.)
 * @param bytes - размер в байтах
 * @param decimals - количество знаков после запятой (по умолчанию 2)
 * @returns строка с единицами измерения
 */
export const formatFileSize = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Б';
  const k = 1024;
  const sizes = ['Б', 'КБ', 'МБ', 'ГБ', 'ТБ'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const formatted = (bytes / Math.pow(k, i)).toFixed(decimals);
  return `${formatted} ${sizes[i]}`;
};

/**
 * Преобразует строку в читаемый URL-слаг (транслитерация + нижний регистр)
 * @param text - исходный текст
 * @param separator - разделитель слов (по умолчанию '-')
 * @returns слаг
 */
export const slugify = (text: string, separator: string = '-'): string => {
  if (!text) return '';
  // Транслитерация (простая)
  const translitMap: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '',
    'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
  };
  let result = text.toLowerCase();
  // Замена русских букв
  for (const [r, l] of Object.entries(translitMap)) {
    result = result.replace(new RegExp(r, 'g'), l);
  }
  // Убираем всё, кроме букв, цифр, пробелов и дефисов
  result = result.replace(/[^a-z0-9\s-]/g, '');
  // Заменяем пробелы и повторяющиеся дефисы на один разделитель
  result = result.replace(/[\s-]+/g, ' ');
  result = result.trim().replace(/\s/g, separator);
  return result;
};

/**
 * Преобразует первую букву строки в заглавную
 * @param text - исходный текст
 * @returns строка с заглавной первой буквой
 */
export const capitalizeFirstLetter = (text: string): string => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Форматирует телефонный номер в читаемый вид
 * @param phone - строка с номером
 * @returns отформатированный номер (например, "+7 (XXX) XXX-XX-XX")
 */
export const formatPhone = (phone: string): string => {
  if (!phone) return '';
  // Убираем все нецифровые символы
  const cleaned = phone.replace(/\D/g, '');
  // Проверяем длину
  if (cleaned.length === 11 && cleaned.startsWith('7')) {
    // +7 (XXX) XXX-XX-XX
    return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9, 11)}`;
  }
  // Возвращаем как есть, если не удалось отформатировать
  return phone;
};

/**
 * Парсит цену из строки (убирает валюту, пробелы, возвращает число)
 * @param value - строка с ценой (например, "1 234,56 ₽")
 * @returns число
 */
export const parseCurrency = (value: string): number => {
  const cleaned = value.replace(/[^\d.,-]/g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

/**
 * Генерирует случайный ID (используется для временных ключей в компонентах)
 * @param length - длина ID (по умолчанию 8)
 * @returns строка с случайным ID
 */
export const generateId = (length: number = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};