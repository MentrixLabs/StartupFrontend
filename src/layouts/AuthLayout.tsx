// src/layouts/AuthLayout.tsx
import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Логотип и заголовок */}
        <div className="text-center">
          <Link to="/" className="inline-block">
            <div className="mx-auto w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-4xl font-bold shadow-lg transform hover:scale-105 transition-transform duration-200">
              P
            </div>
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Proskladai
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Автоматизация SEO и инфографики для маркетплейсов
          </p>
        </div>

        {/* Основной контейнер для страниц аутентификации */}
        <div className="bg-white dark:bg-gray-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-gray-100 dark:border-gray-700">
          <Outlet />
        </div>

        {/* Нижний колонтитул */}
        <div className="text-center text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p>&copy; {new Date().getFullYear()} Proskladai. Все права защищены.</p>
          <p className="flex justify-center gap-4">
            <Link to="/privacy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Политика конфиденциальности
            </Link>
            <Link to="/terms" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Условия использования
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;