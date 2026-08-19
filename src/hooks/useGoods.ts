// src/hooks/useGoods.ts
import { useGoodsStore } from '@/store/goodsStore';
import type { GoodsItem } from '@/api/types';

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
}

export const useGoods = (initialPage?: number, initialSize?: number): UseGoodsReturn => {
  // Параметры игнорируются – состояние полностью управляется стором
  const goods = useGoodsStore((state) => state.goods);
  const loading = useGoodsStore((state) => state.isLoading);
  const error = useGoodsStore((state) => state.error);
  const total = useGoodsStore((state) => state.total);
  const page = useGoodsStore((state) => state.page);
  const size = useGoodsStore((state) => state.size);
  const pages = useGoodsStore((state) => state.pages);
  const fetchGoods = useGoodsStore((state) => state.fetchGoods);
  const getGoods = useGoodsStore((state) => state.getGoods);
  const addGoods = useGoodsStore((state) => state.addGoods);
  const updateGoods = useGoodsStore((state) => state.updateGoods);
  const removeGoods = useGoodsStore((state) => state.removeGoods);

  return {
    goods,
    loading,
    error,
    total,
    page,
    size,
    pages,
    fetchGoods,
    getGoods,
    addGoods,
    updateGoods,
    removeGoods,
  };
};