// src/layouts/MainLayout.tsx
import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

// Иконки (можно заменить на библиотеку lucide-react или heroicons)
import {
  LayoutDashboard,
  Package,
  FileText,
  Image,
  BarChart3,
  User,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

// Компоненты из shadcn/ui (если используются)
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const MainLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Функция выхода
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Навигационные пункты меню
  const navItems = [
    { to: '/dashboard', label: 'Дашборд', icon: LayoutDashboard },
    { to: '/goods', label: 'Товары', icon: Package },
    { to: '/seo', label: 'SEO-генерация', icon: FileText },
    { to: '/infographics', label: 'Инфографика', icon: Image },
    { to: '/reports', label: 'Отчёты', icon: BarChart3 },
    { to: '/profile', label: 'Профиль', icon: User },
  ];

  // Получаем инициалы пользователя для аватара
  const userInitials = user?.full_name
    ? user.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || '?';

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Мобильная кнопка-гамбургер для открытия сайдбара */}
      <button
        className="fixed top-4 left-4 z-50 p-2 rounded bg-white shadow-sm lg:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Сайдбар (навигационное меню) */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
          transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Логотип и название */}
          <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold">
              P
            </div>
            <span className="text-xl font-semibold text-gray-800 dark:text-white">
              Proskladai
            </span>
          </div>

          {/* Навигация */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                  }`
                }
                onClick={() => setSidebarOpen(false)} // закрываем на мобильных
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Нижняя часть сайдбара с кнопкой выхода */}
          <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
            >
              <LogOut size={20} />
              <span>Выйти</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Основной контент */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Шапка (header) */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Заглушка для отступа на мобильных (чтобы контент не перекрывался гамбургером) */}
            <div className="w-10 lg:hidden" />
            <h1 className="text-lg font-medium text-gray-800 dark:text-white">
              Добро пожаловать!
            </h1>
          </div>

          {/* Профиль пользователя (аватар с меню) */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:inline">
              {user?.full_name || user?.email}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarImage src={undefined} alt={user?.full_name || 'User'} />
                    <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Мой аккаунт</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Профиль
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Выйти
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Область контента */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
          <Outlet /> {/* Вложенные маршруты рендерятся здесь */}
        </main>
      </div>

      {/* Затемнение фона для мобильного сайдбара */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default MainLayout;