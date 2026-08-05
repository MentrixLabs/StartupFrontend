// src/pages/Dashboard/SeoGenerationPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGoods } from '@/hooks/useGoods';
import {
  generateSeo,
  saveSeoToGoods,
  getSeoHistory,
} from '@/api/seo';
import type { SeoGenerationResponse } from '@/api/types';
import {
  Sparkles,
  Save,
  RefreshCw,
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
  Package,
  Search,
} from 'lucide-react';

const SeoGenerationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const goodsIdFromUrl = searchParams.get('goods_id');

  const { goods, loading: goodsLoading, fetchGoods } = useGoods();

  const [selectedGoodsId, setSelectedGoodsId] = useState<string>(goodsIdFromUrl || '');
  const [selectedGoods, setSelectedGoods] = useState<any>(null);

  const [generatedSeo, setGeneratedSeo] = useState<SeoGenerationResponse | null>(null);
  const [seoHistory, setSeoHistory] = useState<SeoGenerationResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Загрузка списка товаров при монтировании
  useEffect(() => {
    fetchGoods(1, 100); // загружаем достаточно для выбора
  }, [fetchGoods]);

  // При изменении selectedGoodsId или загрузке списка, находим товар
  useEffect(() => {
    if (selectedGoodsId && goods.length > 0) {
      const found = goods.find(g => g.id === selectedGoodsId);
      setSelectedGoods(found || null);
    } else {
      setSelectedGoods(null);
    }
  }, [selectedGoodsId, goods]);

  // При изменении выбранного товара загружаем его историю SEO
  useEffect(() => {
    if (selectedGoodsId) {
      loadSeoHistory(selectedGoodsId);
    } else {
      setSeoHistory([]);
      setGeneratedSeo(null);
    }
  }, [selectedGoodsId]);

  const loadSeoHistory = useCallback(async (goodsId: string) => {
    try {
      const history = await getSeoHistory(goodsId);
      setSeoHistory(history);
      if (history.length > 0) {
        setGeneratedSeo(history[0]); // последний
      } else {
        setGeneratedSeo(null);
      }
    } catch (err) {
      console.error('Ошибка загрузки истории SEO:', err);
    }
  }, []);

  // Генерация SEO
  const handleGenerate = useCallback(async () => {
    if (!selectedGoodsId) {
      setError('Выберите товар');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await generateSeo({ goods_id: selectedGoodsId });
      setGeneratedSeo(result);
      // Обновляем историю
      const history = await getSeoHistory(selectedGoodsId);
      setSeoHistory(history);
      setSuccess('SEO успешно сгенерировано');
    } catch (err: any) {
      setError(err.message || 'Ошибка генерации SEO');
    } finally {
      setLoading(false);
    }
  }, [selectedGoodsId]);

  // Сохранение SEO
  const handleSave = useCallback(async () => {
    if (!selectedGoodsId || !generatedSeo) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await saveSeoToGoods(selectedGoodsId, generatedSeo);
      // Обновляем историю
      const history = await getSeoHistory(selectedGoodsId);
      setSeoHistory(history);
      setSuccess('SEO сохранено в карточку товара');
    } catch (err: any) {
      setError(err.message || 'Ошибка сохранения SEO');
    } finally {
      setSaving(false);
    }
  }, [selectedGoodsId, generatedSeo]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Генерация SEO</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Создание заголовков, описаний и ключевых слов для карточек товаров с помощью AI
        </p>
      </div>

      {/* Выбор товара */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1">
            <label htmlFor="goodsSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Выберите товар
            </label>
            <select
              id="goodsSelect"
              value={selectedGoodsId}
              onChange={(e) => setSelectedGoodsId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              disabled={goodsLoading}
            >
              <option value="">-- Выберите товар --</option>
              {goods.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} {item.article ? `(${item.article})` : ''}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleGenerate}
            disabled={!selectedGoodsId || loading}
            className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Генерация...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Сгенерировать
              </>
            )}
          </button>
        </div>
        {goodsLoading && <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Загрузка списка товаров...</p>}
      </div>

      {/* Ошибки и успехи */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 flex items-start gap-3">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 flex items-start gap-3">
          <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* Результат генерации */}
      {selectedGoodsId && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Сгенерированный SEO
            </h3>
            {generatedSeo && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Сохранить
                  </>
                )}
              </button>
            )}
          </div>

          {generatedSeo ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Заголовок</label>
                <p className="mt-1 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-gray-900 dark:text-white">
                  {generatedSeo.title}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Описание</label>
                <p className="mt-1 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-gray-900 dark:text-white whitespace-pre-wrap">
                  {generatedSeo.description}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ключевые слова</label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {generatedSeo.keywords.map((kw, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              {loading ? 'Генерация...' : 'SEO не сгенерировано. Нажмите "Сгенерировать".'}
            </p>
          )}
        </div>
      )}

      {/* История генераций */}
      {selectedGoodsId && seoHistory.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            История генераций ({seoHistory.length})
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {seoHistory.map((item, index) => (
              <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{item.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{item.description}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.keywords.slice(0, 3).map((kw, idx) => (
                        <span key={idx} className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full">
                          {kw}
                        </span>
                      ))}
                      {item.keywords.length > 3 && (
                        <span className="text-xs text-gray-500">+{item.keywords.length - 3}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                    {formatDate(new Date().toISOString())} {/* В реальности нужно брать дату из item, если есть */}
                  </div>
                </div>
                {index === 0 && (
                  <span className="inline-block mt-1 text-xs font-medium text-green-600 dark:text-green-400">
                    Последний
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Если нет товаров */}
      {goods.length === 0 && !goodsLoading && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <Package size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">У вас нет товаров.</p>
          <button
            onClick={() => window.location.href = '/goods/new'}
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Добавить товар
          </button>
        </div>
      )}
    </div>
  );
};

export default SeoGenerationPage;