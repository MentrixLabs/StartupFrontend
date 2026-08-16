import { useState, useCallback, useEffect } from 'react';
import {
  getGoodsList,
  getGoodsById,
  createGoods,
  updateGoods,
  deleteGoods,
  parseGoodsByArticle,
} from '@/api/goods';
import type { GoodsItem, PaginatedResponse } from '@/api/types';
import { getErrorMessage } from '@/utils/getErrorMessage';

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
  parseByArticle: (article: string) => Promise<GoodsItem>;
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

  // Загрузка списка товаров
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
      } catch (err) {
        setError(getErrorMessage(err, 'Ошибка загрузки товаров'));
        setGoods([]);
      } finally {
        setLoading(false);
      }
    },
    [initialPage, initialSize],
  );

  // При монтировании загружаем первую страницу
  useEffect(() => {
    fetchGoods(initialPage, initialSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Получение одного товара
  const getGoods = useCallback(async (id: string): Promise<GoodsItem> => {
    setLoading(true);
    setError(null);
    try {
      const item = await getGoodsById(id);
      return item;
    } catch (err) {
      setError(getErrorMessage(err, 'Ошибка получения товара'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Добавление товара (обновляет список)
  const addGoods = useCallback(
    async (data: Omit<GoodsItem, 'id' | 'created_at' | 'updated_at'>): Promise<GoodsItem> => {
      setLoading(true);
      setError(null);
      try {
        const newItem = await createGoods(data);
        // Обновляем список (добавляем в начало)
        setGoods((prev) => [newItem, ...prev]);
        setPagination((prev) => ({ ...prev, total: prev.total + 1 }));
        return newItem;
      } catch (err) {
        setError(getErrorMessage(err, 'Ошибка создания товара'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Обновление товара
  const updateGoodsItem = useCallback(
    async (id: string, data: Partial<Omit<GoodsItem, 'id' | 'created_at' | 'updated_at'>>): Promise<GoodsItem> => {
      setLoading(true);
      setError(null);
      try {
        const updated = await updateGoods(id, data);
        // Обновляем элемент в списке
        setGoods((prev) => prev.map((item) => (item.id === id ? updated : item)));
        return updated;
      } catch (err) {
        setError(getErrorMessage(err, 'Ошибка обновления товара'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Удаление товара
  const removeGoods = useCallback(
    async (id: string): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        await deleteGoods(id);
        // Убираем из списка
        setGoods((prev) => prev.filter((item) => item.id !== id));
        setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
      } catch (err) {
        setError(getErrorMessage(err, 'Ошибка удаления товара'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Парсинг товара по артикулу (добавляет в список)
  const parseByArticle = useCallback(
    async (article: string): Promise<GoodsItem> => {
      setLoading(true);
      setError(null);
      try {
        const parsed = await parseGoodsByArticle(article);
        // Добавляем в список
        setGoods((prev) => [parsed, ...prev]);
        setPagination((prev) => ({ ...prev, total: prev.total + 1 }));
        return parsed;
      } catch (err) {
        setError(getErrorMessage(err, 'Ошибка парсинга товара'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

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
    parseByArticle,
  };
};