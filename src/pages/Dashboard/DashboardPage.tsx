// src/pages/Dashboard/DashboardPage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useGoods } from '@/hooks/useGoods';
import {
  Package,
  FileText,
  Image,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
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

// Данные для графиков (заглушки)
const weeklyActivity = [
  { day: 'Пн', seo: 4, infographics: 3 },
  { day: 'Вт', seo: 7, infographics: 5 },
  { day: 'Ср', seo: 5, infographics: 8 },
  { day: 'Чт', seo: 9, infographics: 6 },
  { day: 'Пт', seo: 12, infographics: 10 },
  { day: 'Сб', seo: 3, infographics: 4 },
  { day: 'Вс', seo: 2, infographics: 1 },
];

const contentDistribution = [
  { name: 'SEO-тексты', value: 45 },
  { name: 'Инфографика', value: 30 },
  { name: 'Отчёты', value: 25 },
];
const COLORS = ['#3b82f6', '#8b5cf6', '#10b981'];

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { goods, loading: goodsLoading, fetchGoods } = useGoods();
  const [loading, setLoading] = useState<boolean>(true);
  const [recentGoods, setRecentGoods] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalGoods: 0,
    totalSeo: 124,
    totalInfographics: 89,
    totalReports: 34,
    seoGrowth: 12,
    infographicsGrowth: 8,
  });

  // Загрузка данных
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await fetchGoods(1, 10);
        setStats((prev) => ({
          ...prev,
          totalGoods: goods?.length || 0,
        }));
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Обновляем последние товары
  useEffect(() => {
    if (goods && goods.length > 0) {
      setRecentGoods(goods.slice(0, 5));
    } else {
      setRecentGoods([]);
    }
  }, [goods]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' });
  };

  const metricCards = [
    {
      title: 'Всего товаров',
      value: stats.totalGoods,
      icon: Package,
      color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
      change: '+12%',
      trend: 'up',
    },
    {
      title: 'SEO-генераций',
      value: stats.totalSeo,
      icon: FileText,
      color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
      change: `+${stats.seoGrowth}%`,
      trend: 'up',
    },
    {
      title: 'Найдено инфографик',
      value: stats.totalInfographics,
      icon: Image,
      color: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
      change: `+${stats.infographicsGrowth}%`,
      trend: 'up',
    },
    {
      title: 'Сформировано отчётов',
      value: stats.totalReports,
      icon: BarChart3,
      color: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
      change: '+5%',
      trend: 'up',
    },
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Добро пожаловать, {user?.full_name || user?.email || 'пользователь'} 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Вот сводка по вашим товарам и контенту
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/goods"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Package size={18} />
            Управлять товарами
          </Link>
        </div>
      </div>

      {/* Карточки метрик */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5"
            >
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-xl ${card.color}`}>
                  <Icon size={22} />
                </div>
                <div className="flex items-center gap-1 text-sm font-medium">
                  {card.trend === 'up' ? (
                    <ArrowUpRight size={16} className="text-green-500" />
                  ) : (
                    <ArrowDownRight size={16} className="text-red-500" />
                  )}
                  <span className={card.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                    {card.change}
                  </span>
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {card.value}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{card.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Графики */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Активность за неделю
            </h3>
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
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Распределение контента
          </h3>
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
        </div>
      </div>

      {/* Последние товары и быстрые действия */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Список последних товаров */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Последние товары
            </h3>
            <Link
              to="/goods"
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              Все товары →
            </Link>
          </div>
          {!recentGoods || recentGoods.length === 0 ? (
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
                        {item.created_at && `Добавлен: ${formatDate(item.created_at)}`}
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
        </div>

        {/* Быстрые действия */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Быстрые действия
          </h3>
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
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;