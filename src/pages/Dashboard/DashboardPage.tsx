// src/pages/Dashboard/DashboardPage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useGoods } from '@/hooks/useGoods';
import type { GoodsItem } from '@/api/types';
import { Alert, Button, Card, CardContent, StatTile } from '@/components/ui';
import { Package, FileText, Image, BarChart3, Target, CheckCircle, Loader2 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  getWeeklyActivity,
  getContentDistribution,
  getRecommendation,
  type WeeklyActivityItem,
  type ContentDistribution,
  type Recommendation,
} from '@/api/stats';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981'];

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { goods, loading: goodsLoading, fetchGoods } = useGoods();

  // Состояния для данных
  const [weeklyActivity, setWeeklyActivity] = useState<WeeklyActivityItem[]>([]);
  const [contentDist, setContentDist] = useState<ContentDistribution>({ seo: 0, infographics: 0, reports: 0 });
  const [recommendation, setRecommendation] = useState<Recommendation>({ target_seo: 0, target_infographics: 0 });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [recentGoods, setRecentGoods] = useState<GoodsItem[]>([]);

  // Загрузка всех данных
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Загружаем товары (для последних добавленных)
        await fetchGoods(1, 10);
        // Загружаем статистику
        const [activity, distribution, rec] = await Promise.all([
          getWeeklyActivity(),
          getContentDistribution(),
          getRecommendation(),
        ]);
        setWeeklyActivity(activity);
        setContentDist(distribution);
        setRecommendation(rec);
      } catch (err) {
        console.error('Ошибка загрузки дашборда:', err);
        setError('Не удалось загрузить данные');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [fetchGoods]);

  // Обновляем последние товары
  useEffect(() => {
    if (goods.length > 0) {
      setRecentGoods(goods.slice(0, 5));
    } else {
      setRecentGoods([]);
    }
  }, [goods]);

  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' });
  };

  // Подготовка данных для круговой диаграммы
  const pieData = [
    { name: 'SEO-тексты', value: contentDist.seo },
    { name: 'Инфографика', value: contentDist.infographics },
    { name: 'Отчёты', value: contentDist.reports },
  ].filter(item => item.value > 0);

  // Метрики для StatTile
  const metricCards = [
    { label: 'Всего товаров', value: goods.length, icon: Package },
    { label: 'SEO-генераций', value: contentDist.seo, icon: FileText },
    { label: 'Инфографика', value: contentDist.infographics, icon: Image },
    { label: 'Отчёты', value: contentDist.reports, icon: BarChart3 },
  ];

  if (loading || goodsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4" role="status">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" aria-hidden="true" />
          <p className="text-gray-500 dark:text-gray-400">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Приветствие */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Добро пожаловать, {user?.username || user?.email || 'пользователь'} 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Вот сводка по вашим товарам и контенту
          </p>
        </div>
        <Button asChild>
          <Link to="/goods">
            <Package size={18} className="mr-2" aria-hidden="true" />
            Управлять товарами
          </Link>
        </Button>
      </div>

      {/* Ошибка */}
      {error && <Alert variant="error">{error}</Alert>}

      {/* Карточки метрик */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map(({ label, value, icon: Icon }) => (
          <StatTile key={label} label={label} value={value} icon={<Icon size={22} />} />
        ))}
      </div>

      {/* Графики */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Активность за неделю */}
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Активность за неделю</h2>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span className="text-gray-600 dark:text-gray-400">SEO</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-purple-500 rounded-full" />
                  <span className="text-gray-600 dark:text-gray-400">Инфографика</span>
                </div>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Bar dataKey="seo" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="infographics" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Распределение контента */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Распределение контента</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {pieData.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400">Нет данных для отображения</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Рекомендации и планка на неделю */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Target size={20} className="text-blue-600" />
              Планка на неделю
            </h2>
            <div className="mt-4 space-y-4">
              {/* SEO цель */}
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">SEO-генерации</span>
                  <span className="font-medium">
                    {contentDist.seo} / {recommendation.target_seo}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-1">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (contentDist.seo / recommendation.target_seo) * 100)}%` }}
                  />
                </div>
                {contentDist.seo >= recommendation.target_seo && (
                  <p className="text-green-600 dark:text-green-400 text-sm mt-1 flex items-center gap-1">
                    <CheckCircle size={14} /> Цель достигнута!
                  </p>
                )}
              </div>
              {/* Инфографика цель */}
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Инфографика (изображения)</span>
                  <span className="font-medium">
                    {contentDist.infographics} / {recommendation.target_infographics}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-1">
                  <div
                    className="bg-purple-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (contentDist.infographics / recommendation.target_infographics) * 100)}%` }}
                  />
                </div>
                {contentDist.infographics >= recommendation.target_infographics && (
                  <p className="text-green-600 dark:text-green-400 text-sm mt-1 flex items-center gap-1">
                    <CheckCircle size={14} /> Цель достигнута!
                  </p>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Цели обновляются каждую неделю и подбираются индивидуально.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Последние товары */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Последние товары</h2>
              <Link to="/goods" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                Все товары →
              </Link>
            </div>
            {recentGoods.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">Нет добавленных товаров</p>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                {recentGoods.map((item) => (
                  <li key={item.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-300">
                        <Package size={18} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Артикул: {item.id || '—'} • {formatDate(item.created_at)}
                        </p>
                      </div>
                    </div>
                    <Link to={`/goods/${item.id}`} className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                      Открыть
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;