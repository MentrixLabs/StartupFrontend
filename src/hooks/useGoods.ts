import { useState, useCallback, useEffect } from 'react';
import {
  getGoodsList,
  getGoodsById,
  createGoods,
  updateGoods,
  deleteGoods,
  // parseGoodsByArticle, // удалено
} from '@/api/goods';
import type { GoodsItem, PaginatedResponse } from '@/api/types';

interface UseGoodsReturn {
  goods: GoodsItem[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  size: number;
  pages: number;
  fetchGoods: (page?: number, size?: number) => Promise<void>;
  getGoods: (id: string) => Promise<GoodsItem>;
  addGoods: (data: Omit<GoodsItem, 'id' | 'created_at' | 'updated_at'>) => Promise<GoodsItem>;
  updateGoods: (id: string, data: Partial<Omit<GoodsItem, 'id' | 'created_at' | 'updated_at'>>) => Promise<GoodsItem>;
  removeGoods: (id: string) => Promise<void>;
  // parseByArticle: (article: string) => Promise<GoodsItem>; // удалено
}

export const useGoods = (initialPage = 1, initialSize = 20): UseGoodsReturn => {
  const [goods, setGoods] = useState<GoodsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: initialPage,
    size: initialSize,
    pages: 0,
  });

  const fetchGoods = useCallback(
    async (page: number = initialPage, size: number = initialSize) => {
      setLoading(true);
      setError(null);
      try {
        const response: PaginatedResponse<GoodsItem> = await getGoodsList(page, size);
        setGoods(response.items);
        setPagination({
          total: response.total,
          page: response.page,
          size: response.size,
          pages: response.pages,
        });
      } catch (err: any) {
        setError(err.message || 'Ошибка загрузки товаров');
        setGoods([]);
      } finally {
        setLoading(false);
      }
    },
    [initialPage, initialSize],
  );

  useEffect(() => {
    fetchGoods(initialPage, initialSize);
  }, []);

  const getGoods = useCallback(async (id: string): Promise<GoodsItem> => {
    setLoading(true);
    setError(null);
    try {
      const item = await getGoodsById(id);
      return item;
    } catch (err: any) {
      setError(err.message || 'Ошибка получения товара');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addGoods = useCallback(
    async (data: Omit<GoodsItem, 'id' | 'created_at' | 'updated_at'>): Promise<GoodsItem> => {
      setLoading(true);
      setError(null);
      try {
        const newItem = await createGoods(data);
        setGoods((prev) => [newItem, ...prev]);
        setPagination((prev) => ({ ...prev, total: prev.total + 1 }));
        return newItem;
      } catch (err: any) {
        setError(err.message || 'Ошибка создания товара');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const updateGoodsItem = useCallback(
    async (id: string, data: Partial<Omit<GoodsItem, 'id' | 'created_at' | 'updated_at'>>): Promise<GoodsItem> => {
      setLoading(true);
      setError(null);
      try {
        const updated = await updateGoods(id, data);
        setGoods((prev) => prev.map((item) => (item.id === id ? updated : item)));
        return updated;
      } catch (err: any) {
        setError(err.message || 'Ошибка обновления товара');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const removeGoods = useCallback(
    async (id: string): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        await deleteGoods(id);
        setGoods((prev) => prev.filter((item) => item.id !== id));
        setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
      } catch (err: any) {
        setError(err.message || 'Ошибка удаления товара');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // parseByArticle удалён

  return {
    goods,
    loading,
    error,
    total: pagination.total,
    page: pagination.page,
    size: pagination.size,
    pages: pagination.pages,
    fetchGoods,
    getGoods,
    addGoods,
    updateGoods: updateGoodsItem,
    removeGoods,
    // parseByArticle, // удалён
  };
};