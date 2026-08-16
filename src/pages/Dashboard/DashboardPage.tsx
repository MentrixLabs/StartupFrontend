// src/pages/Dashboard/DashboardPage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useGoods } from '@/hooks/useGoods';
import type { GoodsItem } from '@/api/types';
import { Alert, Button, Card, CardContent, StatTile } from '@/components/ui';
import { Package, FileText, Image, BarChart3 } from 'lucide-react';
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

// Тип для статистики
interface DashboardStats {
  totalGoods: number;
  totalSeo: number;
  totalInfographics: number;
  totalReports: number;
  seoGrowth: number; // процент роста
  infographicsGrowth: number;
}

// Заглушка для данных графика (активность за неделю)
const weeklyActivity = [
  { day: 'Пн', seo: 4, infographics: 3 },
  { day: 'Вт', seo: 7, infographics: 5 },
  { day: 'Ср', seo: 5, infographics: 8 },
  { day: 'Чт', seo: 9, infographics: 6 },
  { day: 'Пт', seo: 12, infographics: 10 },
  { day: 'Сб', seo: 3, infographics: 4 },
  { day: 'Вс', seo: 2, infographics: 1 },
];

// Данные для круговой диаграммы (типы контента)
const contentDistribution = [
  { name: 'SEO-тексты', value: 45 },
  { name: 'Инфографика', value: 30 },
  { name: 'Отчёты', value: 25 },
];
const COLORS = ['#3b82f6', '#8b5cf6', '#10b981'];

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  // `error` is surfaced here as well as the local catch below: `useGoods.fetchGoods`
  // handles its own rejection internally (sets hook `error`, resets the list) and never
  // re-throws, so a failed goods request never reaches this page's `catch`. Reading the
  // hook's error is what actually makes a failed load visible; the local `loadError`
  // covers anything else thrown inside the effect.
  const { goods, loading: goodsLoading, error: goodsError, fetchGoods } = useGoods();
  const [stats, setStats] = useState<DashboardStats>({
    totalGoods: 0,
    totalSeo: 0,
    totalInfographics: 0,
    totalReports: 0,
    seoGrowth: 12,
    infographicsGrowth: 8,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [recentGoods, setRecentGoods] = useState<GoodsItem[]>([]);

  // Загрузка данных
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        // Получаем список товаров
        await fetchGoods(1, 10); // последние 10
        // Здесь можно было бы вызвать API для статистики, но пока заглушка
        // Имитация загрузки статистики
        setTimeout(() => {
          setStats({
            totalGoods: 47,
            totalSeo: 124,
            totalInfographics: 89,
            totalReports: 34,
            seoGrowth: 12,
            infographicsGrowth: 8,
          });
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setLoadError(
          error instanceof Error && error.message
            ? error.message
            : 'Не удалось загрузить данные дашборда',
        );
        setLoading(false);
      }
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Когда товары загружены, обновляем последние
  useEffect(() => {
    if (goods.length > 0) {
      // Берём первые 5 (или последние добавленные, если есть сортировка)
      setRecentGoods(goods.slice(0, 5));
    }
  }, [goods]);

  // Функция для форматирования даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' });
  };

  // Ошибка загрузки: локальная (throw внутри эффекта) или из хука useGoods
  const displayError = loadError ?? goodsError;

  // Карточки метрик
  const metricCards = [
    { label: 'Всего товаров', value: stats.totalGoods, icon: Package },
    { label: 'SEO-генераций', value: stats.totalSeo, icon: FileText },
    { label: 'Найдено инфографик', value: stats.totalInfographics, icon: Image },
    { label: 'Сформировано отчётов', value: stats.totalReports, icon: BarChart3 },
  ];

  if (loading || goodsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
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
            Добро пожаловать, {user?.full_name || user?.email || 'пользователь'} 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Вот сводка по вашим товарам и контенту
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild>
            <Link to="/goods">
              <Package size={18} className="mr-2" aria-hidden="true" />
              Управлять товарами
            </Link>
          </Button>
        </div>
      </div>

      {/* Ошибка загрузки данных */}
      {displayError && <Alert variant="error">{displayError}</Alert>}

      {/* Карточки метрик */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map(({ label, value, icon: Icon }) => (
          <StatTile
            key={label}
            label={label}
            value={value}
            icon={<Icon size={22} />}
          />
        ))}
      </div>

      {/* Графики */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Столбчатая диаграмма */}
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Активность за неделю
              </h2>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                  <span className="text-gray-600 dark:text-gray-400">SEO</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
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

        {/* Круговая диаграмма */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Распределение контента
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={contentDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {contentDistribution.map((entry, index) => (
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
          </CardContent>
        </Card>
      </div>

      {/* Последние товары и действия */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Список последних товаров */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Последние товары
              </h2>
              <Link
                to="/goods"
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                Все товары →
              </Link>
            </div>
            {recentGoods.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                Нет добавленных товаров
              </p>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                {recentGoods.map((item) => (
                  <li key={item.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-300">
                        <Package size={18} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {item.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Артикул: {item.article || '—'} • {formatDate(item.created_at)}
                        </p>
                      </div>
                    </div>
                    <Link
                      to={`/goods/${item.id}`}
                      className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Открыть
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Последние действия / быстрые ссылки */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Быстрые действия
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/goods/new"
                className="flex flex-col items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
              >
                <Package size={24} className="text-blue-600 dark:text-blue-400" />
                <span className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Добавить товар
                </span>
              </Link>
              <Link
                to="/seo"
                className="flex flex-col items-center justify-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
              >
                <FileText size={24} className="text-purple-600 dark:text-purple-400" />
                <span className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Генерация SEO
                </span>
              </Link>
              <Link
                to="/infographics"
                className="flex flex-col items-center justify-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
              >
                <Image size={24} className="text-green-600 dark:text-green-400" />
                <span className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Найти инфографику
                </span>
              </Link>
              <Link
                to="/reports"
                className="flex flex-col items-center justify-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors"
              >
                <BarChart3 size={24} className="text-orange-600 dark:text-orange-400" />
                <span className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Отчёты
                </span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
