import client from './client';
import { GoodsItem, PaginatedResponse } from './types';

interface CreateGoodsData {
  name: string;
  description?: string;
  url: string;           // обязательно
}

interface UpdateGoodsData {
  name?: string;
  description?: string;
  url?: string;
}

export const getGoodsList = async (
  page: number = 1,
  size: number = 20,
): Promise<PaginatedResponse<GoodsItem>> => {
  const response = await client.get<PaginatedResponse<GoodsItem>>('/goods', {
    params: { page, size },
  });
  return response.data;
};

export const getGoodsById = async (id: string): Promise<GoodsItem> => {
  const response = await client.get<GoodsItem>(`/goods/${id}`);
  return response.data;
};

export const createGoods = async (data: CreateGoodsData): Promise<GoodsItem> => {
  const response = await client.post<GoodsItem>('/goods', data);
  return response.data;
};

export const updateGoods = async (
  id: string,
  data: UpdateGoodsData,
): Promise<GoodsItem> => {
  const response = await client.put<GoodsItem>(`/goods/${id}`, data);
  return response.data;
};

export const deleteGoods = async (id: string): Promise<void> => {
  await client.delete(`/goods/${id}`);
};

// Удаляем parseGoodsByArticle, если он не нужен, или адаптируем под новую структуру