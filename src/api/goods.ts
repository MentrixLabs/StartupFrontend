import client from './client';
import { GoodsItem, PaginatedResponse } from './types';

// Создание товара
interface CreateGoodsData {
  name: string;
  description?: string;
  article?: string;
  price?: number;
  category?: string;
}

// Обновление товара
interface UpdateGoodsData extends Partial<CreateGoodsData> {}

// Получить список товаров (с пагинацией)
export const getGoodsList = async (
  page: number = 1,
  size: number = 20,
): Promise<PaginatedResponse<GoodsItem>> => {
  const response = await client.get<PaginatedResponse<GoodsItem>>('/goods', {
    params: { page, size },
  });
  return response.data;
};

// Получить один товар по ID
export const getGoodsById = async (id: string): Promise<GoodsItem> => {
  const response = await client.get<GoodsItem>(`/goods/${id}`);
  return response.data;
};

// Создать новый товар
export const createGoods = async (data: CreateGoodsData): Promise<GoodsItem> => {
  const response = await client.post<GoodsItem>('/goods', data);
  return response.data;
};

// Обновить товар
export const updateGoods = async (
  id: string,
  data: UpdateGoodsData,
): Promise<GoodsItem> => {
  const response = await client.put<GoodsItem>(`/goods/${id}`, data);
  return response.data;
};

// Удалить товар
export const deleteGoods = async (id: string): Promise<void> => {
  await client.delete(`/goods/${id}`);
};

// Загрузка данных о товаре из парсинга (например, по артикулу)
export const parseGoodsByArticle = async (article: string): Promise<GoodsItem> => {
  const response = await client.post<GoodsItem>('/goods/parse', { article });
  return response.data;
};