// src/types/goods.ts

/**
 * Основная модель карточки товара
 */
export interface GoodsItem {
  id: string;
  name: string;
  description?: string;
  article?: string;
  price?: number;
  category?: string;
  created_at: string;
  updated_at?: string;
  // Дополнительные поля для маркетплейса
  brand?: string;
  weight?: number;
  dimensions?: string;
  images?: string[]; // URL-адреса изображений товара
}

/**
 * Данные для создания нового товара (без id и дат)
 */
export type CreateGoodsData = Omit<GoodsItem, 'id' | 'created_at' | 'updated_at'>;

/**
 * Данные для обновления товара (все поля необязательны)
 */
export type UpdateGoodsData = Partial<CreateGoodsData>;

/**
 * Запрос на генерацию SEO-оптимизации
 */
export interface SeoGenerationRequest {
  goods_id: string;
  // Дополнительные параметры для настройки генерации
  style?: string; // тон: 'formal', 'casual', 'promotional'
  keywords?: string[]; // дополнительные ключевые слова
}

/**
 * Ответ от генерации SEO
 */
export interface SeoGenerationResponse {
  title: string;
  description: string;
  keywords: string[];
  // Может быть несколько вариантов
  variants?: SeoGenerationResponse[];
}

/**
 * Запрос на поиск инфографики
 */
export interface InfographicsSearchRequest {
  goods_id: string;
  count?: number; // от 1 до 20, по умолчанию 10
}

/**
 * Ответ поиска инфографики
 */
export interface InfographicsSearchResponse {
  images: string[]; // URL-адреса найденных изображений
  // Можно добавить метаданные
  total_found?: number;
}

/**
 * Модель отчёта по оптимизации товара
 */
export interface Report {
  id: string;
  goods_id: string;
  created_at: string;
  seo_text?: string;
  infographics?: string[]; // URL-адреса
  // Дополнительная информация
  recommendations?: string[];
  score?: number; // Оценка оптимизации, например 0-100
}

/**
 * Ответ с пагинацией для списков
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

/**
 * Параметры фильтрации для списка товаров
 */
export interface GoodsFilterParams {
  search?: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  sort_by?: 'name' | 'price' | 'created_at';
  sort_order?: 'asc' | 'desc';
}