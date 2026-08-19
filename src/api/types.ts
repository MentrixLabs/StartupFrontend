
// Данные пользователя
export interface User {
  id: string;
  username: string;
  email: string;
  full_name?: string;
  created_at: string;
}

// Данные товара (карточка) – соответствует новой схеме
export interface GoodsItem {
  id: string;
  name: string;
  description?: string;
  url: string;
  created_at: string;
  updated_at?: string;

  // Новые поля из парсера (сохраняются в ozon_items)
  product_id?: string;
  provider?: string;
  brand?: string;
  original_price?: number;
  currency?: string;
  rating?: number;
  reviews_count?: number;
  main_imgs?: string[];
  desc_imgs?: string[];

  // Поля из связанных таблиц
  category?: string;
  price?: number;
}

// Остальные типы остаются без изменений
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Данные для генерации SEO
export interface SeoGenerationRequest {
  goods_id: string;
  // дополнительные параметры (ключевые слова, стиль и т.п.)
}

export interface SeoGenerationResponse {
  title: string;
  description: string;
  keywords: string[];
  // возможно, другие текстовые блоки
}

export interface SeoDataResponse {
  title: string;
  description: string;
  keywords: string[];
}

export interface SeoCompetitorResponse {
  title: string;
  description: string;
  keywords: string[];
  url?: string;
}

export interface SeoHistoryResponse {
  generated: SeoDataResponse | null;
  summary: string | null;
  competitors: SeoCompetitorResponse[];
}

// Данные для поиска инфографики
export interface InfographicsSearchRequest {
  goods_id: string;
  count?: number; // от 1 до 20
}

export interface InfographicsSearchResponse {
  images: string[]; // URL-адреса изображений
}

// Данные отчёта
export interface Report {
  id: string;
  goods_id: string;
  created_at: string;
  seo_text?: string;
  infographics?: string[];
  // другие поля
}