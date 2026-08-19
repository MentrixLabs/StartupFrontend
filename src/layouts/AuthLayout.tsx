// src/layouts/AuthLayout.tsx
import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Outlet, Link } from 'react-router-dom';

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
    {/* Левая колонка – брендинг (скрывается на мобильных) */}
    <div className="hidden lg:flex flex-col justify-center items-center p-12 bg-white/10 dark:bg-gray-800/30 backdrop-blur-sm border-r border-white/20 dark:border-gray-700/30">
      <div className="max-w-sm text-center">
        <div className="w-24 h-24 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-5xl font-bold mx-auto shadow-lg">
          P
        </div>
        <h1 className="mt-8 text-4xl font-bold text-gray-900 dark:text-white">Proskladai</h1>
        <p className="mt-4 text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
          Автоматизация SEO и инфографики для маркетплейсов с помощью нейросетей.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Бесплатный пробный период
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Без карты
          </div>
        </div>
      </div>
    </div>

    {/* Правая колонка – форма */}
    <div className="flex items-center justify-center p-6 lg:p-12">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-apple dark:shadow-apple-dark p-8 border border-gray-100 dark:border-gray-700">
        <Outlet />
      </div>
    </div>
  </div>
  );
};

export default AuthLayout;