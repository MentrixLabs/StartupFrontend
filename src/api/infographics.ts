import client from './client';
import { InfographicsSearchRequest, InfographicsSearchResponse } from './types';

// Поиск релевантных изображений для товара
export const searchInfographics = async (
  request: InfographicsSearchRequest,
): Promise<InfographicsSearchResponse> => {
  const response = await client.post<InfographicsSearchResponse>(
    '/infographics/search',
    request,
  );
  return response.data;
};

// Получить сохранённые инфографики для товара
export const getGoodsInfographics = async (goodsId: string): Promise<string[]> => {
  const response = await client.get<string[]>(`/goods/${goodsId}/infographics`);
  return response.data;
};

// Сохранить выбранные изображения в карточку товара
export const saveInfographicsToGoods = async (
  goodsId: string,
  imageUrls: string[],
): Promise<void> => {
  await client.post(`/goods/${goodsId}/infographics`, { images: imageUrls });
};