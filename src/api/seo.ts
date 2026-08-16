import client from './client';
import { SeoGenerationRequest, SeoGenerationResponse } from './types';

// Генерация SEO-текстов для товара
export const generateSeo = async (
  request: SeoGenerationRequest,
): Promise<SeoGenerationResponse> => {
  const response = await client.post<SeoGenerationResponse>('/seo/generate', request);
  return response.data;
};

// Сохранение сгенерированного SEO в карточку товара (опционально)
export const saveSeoToGoods = async (
  goodsId: string,
  seoData: SeoGenerationResponse,
): Promise<void> => {
  await client.post(`/goods/${goodsId}/seo`, seoData);
};

// Получить историю генераций SEO для товара
export const getSeoHistory = async (goodsId: string): Promise<SeoGenerationResponse[]> => {
  const response = await client.get<SeoGenerationResponse[]>(`/goods/${goodsId}/seo-history`);
  return response.data;
};