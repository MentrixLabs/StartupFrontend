// src/pages/Dashboard/GoodsDetailPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGoods } from '@/hooks/useGoods';
import {
  generateSeo,
  getSeoHistory,
} from '@/api/seo';
import {
  searchInfographics,
  saveInfographicsToGoods,
  // getGoodsInfographics убираем – теперь используем данные из товара
} from '@/api/infographics';
import type { SeoHistoryResponse, SeoDataResponse } from '@/api/types';
import {
  ArrowLeft,
  Package,
  FileText,
  Image,
  BarChart3,
  Save,
  Search,
  CheckCircle,
  XCircle,
  Loader2,
  Sparkles,
  Trash2,
  ExternalLink,
  Star,
  Tag,
  Building,
  Hash,
  DollarSign,
} from 'lucide-react';

type TabType = 'info' | 'seo' | 'infographics' | 'reports';

const GoodsDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getGoods, loading: goodsLoading, error: goodsError } = useGoods();

  const [goodsItem, setGoodsItem] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('info');

  const [seoHistory, setSeoHistory] = useState<SeoHistoryResponse | null>(null);
  const [generatedSeo, setGeneratedSeo] = useState<SeoDataResponse | null>(null);
  const [seoLoading, setSeoLoading] = useState<boolean>(false);
  const [seoError, setSeoError] = useState<string | null>(null);

  const [foundImages, setFoundImages] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [infographicsLoading, setInfographicsLoading] = useState<boolean>(false);
  const [infographicsError, setInfographicsError] = useState<string | null>(null);

  const loadGoods = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const item = await getGoods(id);
      setGoodsItem(item);
    } catch (err: any) {
      setError(err.message || 'Не удалось загрузить товар');
    } finally {
      setLoading(false);
    }
  }, [id, getGoods]);

  const loadSeoAndInfographics = useCallback(async () => {
    if (!id) return;
    try {
      const history = await getSeoHistory(id);
      setSeoHistory(history);
      if (history.generated) {
        setGeneratedSeo(history.generated);
      } else {
        setGeneratedSeo(null);
      }
    } catch (err) {
      console.error('Ошибка загрузки SEO истории:', err);
    }
    // Инфографику больше не загружаем отдельно – она в goodsItem
  }, [id]);

  useEffect(() => {
    loadGoods();
    if (id) {
      loadSeoAndInfographics();
    }
  }, [id, loadGoods, loadSeoAndInfographics]);

  const handleGenerateSeo = useCallback(async () => {
    if (!id) return;
    setSeoLoading(true);
    setSeoError(null);
    try {
      const result = await generateSeo({ goods_id: id });
      setGeneratedSeo(result);
      const history = await getSeoHistory(id);
      setSeoHistory(history);
    } catch (err: any) {
      setSeoError(err.message || 'Ошибка генерации SEO');
    } finally {
      setSeoLoading(false);
    }
  }, [id]);

  const handleSearchInfographics = useCallback(async () => {
    if (!id) return;
    setInfographicsLoading(true);
    setInfographicsError(null);
    try {
      const result = await searchInfographics({ goods_id: id, count: 20 });
      setFoundImages(result.images || []);
      setSelectedImages([]);
    } catch (err: any) {
      setInfographicsError(err.message || 'Ошибка поиска инфографики');
    } finally {
      setInfographicsLoading(false);
    }
  }, [id]);

  const handleSaveInfographics = useCallback(async () => {
    if (!id || selectedImages.length === 0) return;
    setInfographicsLoading(true);
    try {
      // Сохраняем в БД (отдельная таблица infographics) – но мы не используем её, так как сохраняем main_imgs и desc_imgs.
      // Для простоты оставим этот механизм для дополнительных изображений.
      await saveInfographicsToGoods(id, selectedImages);
      // После сохранения обновляем товар, чтобы получить новые main_imgs или desc_imgs (если бэкенд их вернёт)
      await loadGoods();
      setFoundImages([]);
      setSelectedImages([]);
    } catch (err: any) {
      setInfographicsError(err.message || 'Ошибка сохранения инфографики');
    } finally {
      setInfographicsLoading(false);
    }
  }, [id, selectedImages, loadGoods]);

  const toggleImageSelection = (url: string) => {
    setSelectedImages(prev =>
      prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]
    );
  };

  // Удаление инфографики пока оставим через отдельный эндпоинт, но можно просто обновить товар
  // Пока не реализовано

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const tabs: { key: TabType; label: string; icon: React.ReactNode }[] = [
    { key: 'info', label: 'Информация', icon: <Package size={18} /> },
    { key: 'seo', label: 'SEO', icon: <FileText size={18} /> },
    { key: 'infographics', label: 'Инфографика', icon: <Image size={18} /> },
    { key: 'reports', label: 'Отчёты', icon: <BarChart3 size={18} /> },
  ];

  if (loading || goodsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 dark:text-gray-400">Загрузка товара...</p>
        </div>
      </div>
    );
  }

  if (error || goodsError || !goodsItem) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle size={32} className="text-red-600 dark:text-red-400" />
          </div>
          <p className="text-gray-700 dark:text-gray-300 font-medium">Товар не найден</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{error || goodsError}</p>
          <button
            onClick={() => navigate('/goods')}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft size={18} />
            Назад к списку
          </button>
        </div>
      </div>
    );
  }

  // Объединяем все изображения товара (main_imgs + desc_imgs)
  const allGoodsImages = [
    ...(goodsItem.main_imgs || []),
    ...(goodsItem.desc_imgs || []),
  ];

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/goods')}
        className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        <ArrowLeft size={18} />
        Назад к списку товаров
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {goodsItem.name}
          </h1>
          <div className="flex flex-wrap gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
            <span className="flex items-center gap-1">
              <Hash size={14} />
              Артикул: {goodsItem.product_id || '—'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Tag size={14} />
              {goodsItem.category || 'Без категории'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <DollarSign size={14} />
              {goodsItem.price ? `${goodsItem.price} ₽` : '—'}
            </span>
          </div>
        </div>
        <button
          onClick={() => navigate(`/goods/${id}/edit`)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors"
        >
          <FileText size={18} />
          Редактировать
        </button>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-4 overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        {activeTab === 'info' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Основная информация</h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Название</dt>
                <dd className="mt-1 text-gray-900 dark:text-white">{goodsItem.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Артикул (ID)</dt>
                <dd className="mt-1 text-gray-900 dark:text-white">{goodsItem.product_id || '—'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Бренд</dt>
                <dd className="mt-1 text-gray-900 dark:text-white">{goodsItem.brand || '—'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Продавец</dt>
                <dd className="mt-1 text-gray-900 dark:text-white">{goodsItem.provider || '—'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Категория</dt>
                <dd className="mt-1 text-gray-900 dark:text-white">{goodsItem.category || '—'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Цена</dt>
                <dd className="mt-1 text-gray-900 dark:text-white">{goodsItem.price ? `${goodsItem.price} ₽` : '—'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Оригинальная цена</dt>
                <dd className="mt-1 text-gray-900 dark:text-white">{goodsItem.original_price ? `${goodsItem.original_price} ${goodsItem.currency || '₽'}` : '—'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Рейтинг</dt>
                <dd className="mt-1 text-gray-900 dark:text-white">
                  {goodsItem.rating ? (
                    <span className="flex items-center gap-1">
                      <Star size={16} className="text-yellow-400 fill-yellow-400" />
                      {goodsItem.rating}
                    </span>
                  ) : (
                    '—'
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Количество отзывов</dt>
                <dd className="mt-1 text-gray-900 dark:text-white">{goodsItem.reviews_count || '—'}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">URL</dt>
                <dd className="mt-1">
                  <a
                    href={goodsItem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    {goodsItem.url}
                    <ExternalLink size={14} />
                  </a>
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Описание</dt>
                <dd className="mt-1 text-gray-900 dark:text-white whitespace-pre-wrap">
                  {goodsItem.description || 'Нет описания'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Создан</dt>
                <dd className="mt-1 text-gray-900 dark:text-white">{formatDate(goodsItem.created_at)}</dd>
              </div>
              {goodsItem.updated_at && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Обновлён</dt>
                  <dd className="mt-1 text-gray-900 dark:text-white">{formatDate(goodsItem.updated_at)}</dd>
                </div>
              )}
            </dl>

            {/* Галерея изображений */}
            {(goodsItem.main_imgs?.length > 0 || goodsItem.desc_imgs?.length > 0) && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Изображения товара</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {[...(goodsItem.main_imgs || []), ...(goodsItem.desc_imgs || [])].map((url, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={url}
                        alt={`Изображение ${idx + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                        onError={(e) => (e.currentTarget.src = '/placeholder-image.png')}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'seo' && (
          // ... (оставляем без изменений, он уже работает)
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">SEO-оптимизация</h3>
              <button
                onClick={handleGenerateSeo}
                disabled={seoLoading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {seoLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Генерация...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Сгенерировать SEO
                  </>
                )}
              </button>
            </div>
            {seoError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                {seoError}
              </div>
            )}
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
                {seoHistory?.summary && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Сводка</label>
                    <p className="mt-1 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-gray-900 dark:text-white">
                      {seoHistory.summary}
                    </p>
                  </div>
                )}
                {seoHistory?.competitors && seoHistory.competitors.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">SEO конкурентов</label>
                    <div className="mt-1 space-y-2">
                      {seoHistory.competitors.map((comp, idx) => (
                        <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                          <p className="text-sm font-medium">{comp.title}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{comp.description}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Ключевые слова: {comp.keywords.join(', ')}
                          </p>
                          {comp.url && (
                            <a
                              href={comp.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 text-xs hover:underline"
                            >
                              Ссылка на товар
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">SEO ещё не сгенерировано.</p>
            )}
            {seoHistory?.generated && (
              <div className="mt-8">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">История генераций</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg text-sm">
                    <div className="flex justify-between text-gray-500 dark:text-gray-400">
                      <span>Заголовок: {seoHistory.generated.title}</span>
                      <span>Создано: {formatDate(new Date().toISOString())}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'infographics' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Инфографика</h3>
              <div className="flex gap-2">
                <button
                  onClick={handleSearchInfographics}
                  disabled={infographicsLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {infographicsLoading ? (
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
            </div>

            {infographicsError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                {infographicsError}
              </div>
            )}

            {/* Сохранённые изображения из товара */}
            {allGoodsImages.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Сохранённые изображения ({allGoodsImages.length})</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {allGoodsImages.map((url, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={url}
                        alt={`Изображение ${idx + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                        onError={(e) => (e.currentTarget.src = '/placeholder-image.png')}
                      />
                      {/* Можно добавить кнопку удаления, если реализован эндпоинт */}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Результаты поиска (дополнительные изображения) */}
            {foundImages.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Найдено изображений: {foundImages.length}
                  </h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedImages(foundImages)}
                      className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                      Выбрать все
                    </button>
                    <button
                      onClick={() => setSelectedImages([])}
                      className="text-sm text-gray-500 hover:text-gray-600 dark:text-gray-400"
                    >
                      Снять все
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {foundImages.map((url, idx) => (
                    <div
                      key={idx}
                      className={`relative cursor-pointer rounded-lg border-2 transition-all ${
                        selectedImages.includes(url)
                          ? 'border-blue-500 ring-2 ring-blue-300 dark:ring-blue-700'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                      }`}
                      onClick={() => toggleImageSelection(url)}
                    >
                      <img
                        src={url}
                        alt={`Найденное ${idx + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                        onError={(e) => (e.currentTarget.src = '/placeholder-image.png')}
                      />
                      {selectedImages.includes(url) && (
                        <div className="absolute top-1 right-1 bg-blue-600 text-white rounded-full p-0.5">
                          <CheckCircle size={16} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {selectedImages.length > 0 && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={handleSaveInfographics}
                      disabled={infographicsLoading}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      {infographicsLoading ? (
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

            {allGoodsImages.length === 0 && foundImages.length === 0 && !infographicsLoading && (
              <p className="text-gray-500 dark:text-gray-400">Нет сохранённой инфографики. Используйте поиск, чтобы найти изображения.</p>
            )}
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Отчёты по товару</h3>
              <button
                onClick={() => navigate(`/reports?goods_id=${id}`)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <BarChart3 size={18} />
                Перейти к отчётам
              </button>
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              Здесь будут отображаться сгенерированные отчёты для данного товара. Перейдите в раздел «Отчёты» для просмотра и создания новых.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-600 dark:text-gray-300">
                SEO-генераций: {seoHistory ? 1 : 0}
              </span>
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-600 dark:text-gray-300">
                Изображений: {allGoodsImages.length}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoodsDetailPage;