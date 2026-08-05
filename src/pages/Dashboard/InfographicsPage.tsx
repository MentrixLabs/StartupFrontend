// src/pages/Dashboard/InfographicsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGoods } from '@/hooks/useGoods';
import {
  searchInfographics,
  getGoodsInfographics,
  saveInfographicsToGoods,
} from '@/api/infographics';
import {
  Image,
  Search,
  Loader2,
  CheckCircle,
  AlertCircle,
  Package,
  Trash2,
  Save,
  Minus,
  Plus,
  Check,
  X,
} from 'lucide-react';

const InfographicsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const goodsIdFromUrl = searchParams.get('goods_id');

  const { goods, loading: goodsLoading, fetchGoods } = useGoods();

  // Состояние выбранного товара
  const [selectedGoodsId, setSelectedGoodsId] = useState<string>(goodsIdFromUrl || '');
  const [selectedGoods, setSelectedGoods] = useState<any>(null);

  // Состояние для количества изображений (по умолчанию 10)
  const [imageCount, setImageCount] = useState<number>(10);

  // Состояние для найденных и сохранённых изображений
  const [savedImages, setSavedImages] = useState<string[]>([]);
  const [foundImages, setFoundImages] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Загрузка списка товаров при монтировании
  useEffect(() => {
    fetchGoods(1, 100);
  }, [fetchGoods]);

  // При изменении selectedGoodsId находим товар
  useEffect(() => {
    if (selectedGoodsId && goods.length > 0) {
      const found = goods.find(g => g.id === selectedGoodsId);
      setSelectedGoods(found || null);
    } else {
      setSelectedGoods(null);
    }
  }, [selectedGoodsId, goods]);

  // Загружаем сохранённые изображения при выборе товара
  useEffect(() => {
    if (selectedGoodsId) {
      loadSavedImages(selectedGoodsId);
      // Сбрасываем найденные и выбранные
      setFoundImages([]);
      setSelectedImages([]);
    } else {
      setSavedImages([]);
      setFoundImages([]);
      setSelectedImages([]);
    }
  }, [selectedGoodsId]);

  const loadSavedImages = useCallback(async (goodsId: string) => {
    try {
      const images = await getGoodsInfographics(goodsId);
      setSavedImages(images);
    } catch (err) {
      console.error('Ошибка загрузки сохранённых изображений:', err);
    }
  }, []);

  // Поиск инфографики
  const handleSearch = useCallback(async () => {
    if (!selectedGoodsId) {
      setError('Выберите товар');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await searchInfographics({
        goods_id: selectedGoodsId,
        count: imageCount,
      });
      setFoundImages(result.images || []);
      setSelectedImages([]);
      if (result.images.length === 0) {
        setSuccess('Изображения не найдены. Попробуйте изменить параметры.');
      } else {
        setSuccess(`Найдено ${result.images.length} изображений`);
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка поиска инфографики');
    } finally {
      setLoading(false);
    }
  }, [selectedGoodsId, imageCount]);

  // Сохранение выбранных изображений
  const handleSaveSelected = useCallback(async () => {
    if (!selectedGoodsId || selectedImages.length === 0) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      // Объединяем с уже сохранёнными (можно добавить только новые)
      const merged = [...savedImages, ...selectedImages];
      // Убираем дубликаты
      const unique = Array.from(new Set(merged));
      await saveInfographicsToGoods(selectedGoodsId, unique);
      // Обновляем список сохранённых
      await loadSavedImages(selectedGoodsId);
      setFoundImages([]);
      setSelectedImages([]);
      setSuccess('Изображения успешно сохранены');
    } catch (err: any) {
      setError(err.message || 'Ошибка сохранения инфографики');
    } finally {
      setSaving(false);
    }
  }, [selectedGoodsId, selectedImages, savedImages, loadSavedImages]);

  // Удаление одного изображения из сохранённых
  const handleRemoveSaved = useCallback(async (url: string) => {
    if (!selectedGoodsId) return;
    const updated = savedImages.filter(u => u !== url);
    try {
      await saveInfographicsToGoods(selectedGoodsId, updated);
      setSavedImages(updated);
      setSuccess('Изображение удалено');
    } catch (err: any) {
      setError(err.message || 'Ошибка удаления изображения');
    }
  }, [selectedGoodsId, savedImages]);

  // Выбор/снятие выбора изображения в найденных
  const toggleImageSelection = (url: string) => {
    setSelectedImages(prev =>
      prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]
    );
  };

  // Выбрать все найденные
  const selectAllFound = () => {
    setSelectedImages(foundImages);
  };

  // Снять все выбранные
  const deselectAllFound = () => {
    setSelectedImages([]);
  };

  // Обработчик изменения количества
  const handleCountChange = (delta: number) => {
    setImageCount(prev => Math.min(20, Math.max(1, prev + delta)));
  };

  // Форматирование даты для заглушки (не используется)
  // Отрисовка placeholder для изображений
  const getImageAlt = (index: number) => `Инфографика ${index + 1}`;

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Поиск инфографики</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Найдите и сохраните релевантные изображения для карточек товаров
        </p>
      </div>

      {/* Выбор товара и параметры поиска */}
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
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
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
          <div className="flex items-center gap-2">
            <label htmlFor="count" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Количество:
            </label>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleCountChange(-1)}
                disabled={imageCount <= 1}
                className="p-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50"
                aria-label="Уменьшить"
              >
                <Minus size={16} />
              </button>
              <span className="w-10 text-center font-medium text-gray-900 dark:text-white">
                {imageCount}
              </span>
              <button
                onClick={() => handleCountChange(1)}
                disabled={imageCount >= 20}
                className="p-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50"
                aria-label="Увеличить"
              >
                <Plus size={16} />
              </button>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">(1–20)</span>
          </div>
          <button
            onClick={handleSearch}
            disabled={!selectedGoodsId || loading}
            className="inline-flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Поиск...
              </>
            ) : (
              <>
                <Search size={18} />
                Найти изображения
              </>
            )}
          </button>
        </div>
        {goodsLoading && <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Загрузка списка товаров...</p>}
      </div>

      {/* Уведомления */}
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

      {/* Сохранённые изображения */}
      {selectedGoodsId && savedImages.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Сохранённые изображения ({savedImages.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {savedImages.map((url, idx) => (
              <div key={idx} className="relative group">
                <img
                  src={url}
                  alt={getImageAlt(idx)}
                  className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                  onError={(e) => (e.currentTarget.src = '/placeholder-image.png')}
                />
                <button
                  onClick={() => handleRemoveSaved(url)}
                  className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                  title="Удалить"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Найденные изображения */}
      {foundImages.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Найденные изображения ({foundImages.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={selectAllFound}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Выбрать все
              </button>
              <button
                onClick={deselectAllFound}
                className="text-sm text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
              >
                Снять все
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {foundImages.map((url, idx) => {
              const isSelected = selectedImages.includes(url);
              return (
                <div
                  key={idx}
                  className={`relative cursor-pointer rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-purple-500 ring-2 ring-purple-300 dark:ring-purple-700'
                      : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                  }`}
                  onClick={() => toggleImageSelection(url)}
                >
                  <img
                    src={url}
                    alt={getImageAlt(idx)}
                    className="w-full h-32 object-cover rounded-lg"
                    onError={(e) => (e.currentTarget.src = '/placeholder-image.png')}
                  />
                  {isSelected && (
                    <div className="absolute top-1 right-1 bg-purple-600 text-white rounded-full p-0.5">
                      <Check size={16} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {selectedImages.length > 0 && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleSaveSelected}
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
                    Сохранить выбранные ({selectedImages.length})
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Если нет товаров */}
      {goods.length === 0 && !goodsLoading && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <Package size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">У вас нет товаров.</p>
          <button
            onClick={() => window.location.href = '/goods/new'}
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Добавить товар
          </button>
        </div>
      )}
    </div>
  );
};

export default InfographicsPage;