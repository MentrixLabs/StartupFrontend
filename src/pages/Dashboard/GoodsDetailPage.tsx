// src/pages/Dashboard/GoodsDetailPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGoods } from '@/hooks/useGoods';
import type { GoodsItem } from '@/api/types';
import { Alert, Button, Card, CardContent } from '@/components/ui';
import InfoTab from './GoodsDetail/InfoTab';
import SeoTab from './GoodsDetail/SeoTab';
import InfographicsTab from './GoodsDetail/InfographicsTab';
import ReportsTab from './GoodsDetail/ReportsTab';
import {
  ArrowLeft,
  Package,
  FileText,
  Image,
  BarChart3,
  Loader2,
} from 'lucide-react';
import { getErrorMessage } from '@/utils/getErrorMessage';

type TabType = 'info' | 'seo' | 'infographics' | 'reports';

const GoodsDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getGoods, loading: goodsLoading, error: goodsError } = useGoods();

  // Состояние товара
  const [goodsItem, setGoodsItem] = useState<GoodsItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Состояние вкладок. Данные каждой вкладки (история SEO, найденные/выбранные
  // изображения и т.д.) теперь принадлежат самой вкладке и существуют только пока
  // она смонтирована — см. GoodsDetail/*.tsx.
  const [activeTab, setActiveTab] = useState<TabType>('info');

  // Загрузка данных товара
  const loadGoods = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const item = await getGoods(id);
      setGoodsItem(item);
    } catch (err) {
      setError(getErrorMessage(err, 'Не удалось загрузить товар'));
    } finally {
      setLoading(false);
    }
  }, [id, getGoods]);

  useEffect(() => {
    loadGoods();
  }, [loadGoods]);

  // Вкладки
  const tabs: { key: TabType; label: string; icon: React.ReactNode }[] = [
    { key: 'info', label: 'Информация', icon: <Package size={18} aria-hidden="true" /> },
    { key: 'seo', label: 'SEO', icon: <FileText size={18} aria-hidden="true" /> },
    { key: 'infographics', label: 'Инфографика', icon: <Image size={18} aria-hidden="true" /> },
    { key: 'reports', label: 'Отчёты', icon: <BarChart3 size={18} aria-hidden="true" /> },
  ];

  if (loading || goodsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4" role="status">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" aria-hidden="true" />
          <p className="text-gray-500 dark:text-gray-400">Загрузка товара...</p>
        </div>
      </div>
    );
  }

  if (error || goodsError || !goodsItem) {
    return (
      <div className="max-w-2xl">
        <Alert variant="error">
          <p className="font-medium">Товар не найден</p>
          {(error || goodsError) && <p className="mt-1">{error || goodsError}</p>}
          <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate('/goods')}>
            <ArrowLeft size={18} className="mr-2" aria-hidden="true" />
            Назад к списку
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Навигация назад */}
      <button
        onClick={() => navigate('/goods')}
        className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        <ArrowLeft size={18} aria-hidden="true" />
        Назад к списку товаров
      </button>

      {/* Заголовок */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{goodsItem.name}</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Артикул: {goodsItem.article || '—'} • Категория: {goodsItem.category || '—'} • Цена:{' '}
            {goodsItem.price ? `${goodsItem.price} ₽` : '—'}
          </p>
        </div>
        <Button variant="secondary" onClick={() => navigate(`/goods/${goodsItem.id}/edit`)}>
          <FileText size={18} className="mr-2" aria-hidden="true" />
          Редактировать
        </Button>
      </div>

      {/* Вкладки */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-4 overflow-x-auto" aria-label="Разделы товара">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              aria-current={activeTab === tab.key ? 'true' : undefined}
              className={`
                flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                ${
                  activeTab === tab.key
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }
              `}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Содержимое вкладок */}
      <Card>
        <CardContent className="p-6">
          {activeTab === 'info' && <InfoTab goodsItem={goodsItem} />}
          {activeTab === 'seo' && <SeoTab goodsItem={goodsItem} />}
          {activeTab === 'infographics' && <InfographicsTab goodsItem={goodsItem} />}
          {activeTab === 'reports' && <ReportsTab goodsItem={goodsItem} />}
        </CardContent>
      </Card>
    </div>
  );
};

export default GoodsDetailPage;
