import client from './client';
import { SeoGenerationRequest, SeoGenerationResponse, SeoHistoryResponse,  SeoCompetitorResponse, SeoDataResponse} from './types';

// Генерация SEO-текстов для товара
export const generateSeo = async (
  request: SeoGenerationRequest,
): Promise<SeoGenerationResponse> => {
  const response = await client.post<SeoGenerationResponse>('/seo/generate', request);
  return response.data;
};

//// Сохранение сгенерированного SEO в карточку товара (опционально)
//export const saveSeoToGoods = async (
//  goodsId: string,
//  seoData: SeoGenerationResponse,
//): Promise<void> => {
//  await client.post(`/goods/${goodsId}/seo`, seoData);
//};

export const getSeoHistory = async (goodsId: string): Promise<SeoHistoryResponse> => {
  const response = await client.get(`/seo/history/${goodsId}`);
  return response.data;
};