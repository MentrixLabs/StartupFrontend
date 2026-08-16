// src/pages/Dashboard/GoodsDetail/InfoTab.tsx
import React from 'react';
import type { GoodsItem } from '@/api/types';

// Форматирование даты (перенесено из GoodsDetailPage — теперь используется только здесь)
const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

interface InfoTabProps {
  goodsItem: GoodsItem;
}

/**
 * Вкладка «Информация» — чисто презентационная, собственного состояния нет.
 * Разметка <dl>/<dt>/<dd> сохранена без изменений: аудит назвал её эталонным
 * примером, на который равняются остальные вкладки.
 */
const InfoTab: React.FC<InfoTabProps> = ({ goodsItem }) => (
  <div className="space-y-4">
    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Основная информация</h2>
    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Название</dt>
        <dd className="mt-1 text-gray-900 dark:text-white">{goodsItem.name}</dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Артикул</dt>
        <dd className="mt-1 text-gray-900 dark:text-white">{goodsItem.article || '—'}</dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Категория</dt>
        <dd className="mt-1 text-gray-900 dark:text-white">{goodsItem.category || '—'}</dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Цена</dt>
        <dd className="mt-1 text-gray-900 dark:text-white">
          {goodsItem.price ? `${goodsItem.price} ₽` : '—'}
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
  </div>
);

export default InfoTab;
