// src/store/goodsStore.ts
import { create } from 'zustand';
import { GoodsItem, PaginatedResponse } from '@/api/types';
import {
  getGoodsList,
  getGoodsById,
  createGoods,
  updateGoods,
  deleteGoods,
} from '@/api/goods';

interface GoodsState {
  // Состояние
  goods: GoodsItem[];
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  size: number;
  pages: number;
  selectedGoods: GoodsItem | null;

  // Действия
  fetchGoods: (page?: number, size?: number) => Promise<void>;
  getGoods: (id: string) => Promise<GoodsItem>;
  addGoods: (data: Omit<GoodsItem, 'id' | 'created_at' | 'updated_at'>) => Promise<GoodsItem>;
  updateGoods: (id: string, data: Partial<Omit<GoodsItem, 'id' | 'created_at' | 'updated_at'>>) => Promise<GoodsItem>;
  removeGoods: (id: string) => Promise<void>;
  parseByArticle: (article: string) => Promise<GoodsItem>;
  setSelectedGoods: (goods: GoodsItem | null) => void;
  clearError: () => void;
}

export const useGoodsStore = create<GoodsState>((set) => ({
  goods: [],
  isLoading: false,
  error: null,
  total: 0,
  page: 1,
  size: 20,
  pages: 0,
  selectedGoods: null,

  fetchGoods: async (page = 1, size = 20) => {
    set({ isLoading: true, error: null });
    try {
      const response: PaginatedResponse<GoodsItem> = await getGoodsList(page, size);
      set({
        goods: response.items,
        total: response.total,
        page: response.page,
        size: response.size,
        pages: response.pages,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Ошибка загрузки товаров',
        goods: [],
      });
    }
  },

  getGoods: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const item = await getGoodsById(id);
      set({ selectedGoods: item, isLoading: false });
      return item;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Ошибка получения товара',
        selectedGoods: null,
      });
      throw error;
    }
  },

  addGoods: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const newItem = await createGoods(data);
      set((state) => ({
        goods: [newItem, ...state.goods],
        total: state.total + 1,
        isLoading: false,
        error: null,
      }));
      return newItem;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Ошибка создания товара',
      });
      throw error;
    }
  },

  updateGoods: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await updateGoods(id, data);
      set((state) => ({
        goods: state.goods.map((item) => (item.id === id ? updated : item)),
        selectedGoods: state.selectedGoods?.id === id ? updated : state.selectedGoods,
        isLoading: false,
        error: null,
      }));
      return updated;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Ошибка обновления товара',
      });
      throw error;
    }
  },

  removeGoods: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await deleteGoods(id);
      set((state) => ({
        goods: state.goods.filter((item) => item.id !== id),
        total: state.total - 1,
        selectedGoods: state.selectedGoods?.id === id ? null : state.selectedGoods,
        isLoading: false,
        error: null,
      }));
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Ошибка удаления товара',
      });
      throw error;
    }
  },

  parseByArticle: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const parsed = await getGoodsById(id);
      set((state) => ({
        goods: [parsed, ...state.goods],
        total: state.total + 1,
        isLoading: false,
        error: null,
      }));
      return parsed;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Ошибка парсинга товара',
      });
      throw error;
    }
  },

  setSelectedGoods: (goods) => set({ selectedGoods: goods }),

  clearError: () => set({ error: null }),
}));