// src/pages/Dashboard/ReportsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGoods } from '@/hooks/useGoods';
import {
  getReports,
  generateReport,
  downloadReportPdf,
  deleteReport,
} from '@/api/reports';
import type { Report } from '@/api/types';
import {
  BarChart3,
  Plus,
  Download,
  Trash2,
  Eye,
  Loader2,
  AlertCircle,
  CheckCircle,
  Package,
  FileText,
  RefreshCw,
  X,
} from 'lucide-react';

const ReportsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const goodsIdFromUrl = searchParams.get('goods_id');

  const { goods, loading: goodsLoading, fetchGoods } = useGoods();

  // Состояние фильтра
  const [selectedGoodsId, setSelectedGoodsId] = useState<string>(goodsIdFromUrl || '');

  // Состояние отчетов
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Состояние создания отчета
  const [generating, setGenerating] = useState<boolean>(false);

  // Состояние удаления
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Состояние скачивания
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Загрузка списка товаров при монтировании
  useEffect(() => {
    fetchGoods(1, 100);
  }, [fetchGoods]);

  // Загрузка отчетов при изменении фильтра
  const loadReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getReports(1, 100); // пагинация пока не требуется
      // Если есть фильтр по товару, фильтруем локально (можно было бы передать параметр в API)
      let items = result.items;
      if (selectedGoodsId) {
        items = items.filter(r => r.goods_id === selectedGoodsId);
      }
      setReports(items);
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки отчетов');
    } finally {
      setLoading(false);
    }
  }, [selectedGoodsId]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  // Генерация нового отчета
  const handleGenerateReport = useCallback(async () => {
    if (!selectedGoodsId) {
      setError('Выберите товар для генерации отчета');
      return;
    }
    setGenerating(true);
    setError(null);
    setSuccess(null);
    try {
      const newReport = await generateReport(selectedGoodsId);
      setReports(prev => [newReport, ...prev]);
      setSuccess('Отчет успешно сгенерирован');
    } catch (err: any) {
      setError(err.message || 'Ошибка генерации отчета');
    } finally {
      setGenerating(false);
    }
  }, [selectedGoodsId]);

  // Удаление отчета
  const handleDelete = useCallback(async (id: string) => {
    setDeletingId(id);
    setError(null);
    setSuccess(null);
    try {
      await deleteReport(id);
      setReports(prev => prev.filter(r => r.id !== id));
      setSuccess('Отчет удален');
    } catch (err: any) {
      setError(err.message || 'Ошибка удаления отчета');
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  }, []);

  // Скачивание отчета в PDF
  const handleDownload = useCallback(async (id: string) => {
    setDownloadingId(id);
    setError(null);
    try {
      const blob = await downloadReportPdf(id);
      // Создаем ссылку для скачивания
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setSuccess('Отчет скачан');
    } catch (err: any) {
      setError(err.message || 'Ошибка скачивания отчета');
    } finally {
      setDownloadingId(null);
    }
  }, []);

  // Форматирование даты
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Получение названия товара по его ID
  const getGoodsName = (id: string) => {
    const item = goods.find(g => g.id === id);
    return item ? item.name : id;
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Отчеты</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Управляйте отчетами по оптимизации карточек товаров
        </p>
      </div>

      {/* Фильтр и кнопка создания */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1">
            <label htmlFor="filterGoods" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Фильтр по товару
            </label>
            <select
              id="filterGoods"
              value={selectedGoodsId}
              onChange={(e) => setSelectedGoodsId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              disabled={goodsLoading}
            >
              <option value="">Все товары</option>
              {goods.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} {item.article ? `(${item.article})` : ''}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleGenerateReport}
            disabled={!selectedGoodsId || generating}
            className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {generating ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Генерация...
              </>
            ) : (
              <>
                <Plus size={18} />
                Создать отчет
              </>
            )}
          </button>
        </div>
        {!selectedGoodsId && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Выберите товар, чтобы создать отчет
          </p>
        )}
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

      {/* Список отчетов */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={32} className="animate-spin text-blue-500" />
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <BarChart3 size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">
            {selectedGoodsId ? 'Нет отчетов для этого товара' : 'Нет отчетов'}
          </p>
          {selectedGoodsId && (
            <button
              onClick={handleGenerateReport}
              disabled={generating}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {generating ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Генерация...
                </>
              ) : (
                <>
                  <Plus size={18} />
                  Создать первый отчет
                </>
              )}
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Товар
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Дата создания
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    SEO
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Инфографика
                  </th>
                  <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Package size={16} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {getGoodsName(report.goods_id)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">
                      {formatDate(report.created_at)}
                    </td>
                    <td className="py-3 px-4">
                      {report.seo_text ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs">
                          <CheckCircle size={12} />
                          есть
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full text-xs">
                          <X size={12} />
                          нет
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {report.infographics && report.infographics.length > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs">
                          <CheckCircle size={12} />
                          {report.infographics.length} шт.
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full text-xs">
                          <X size={12} />
                          нет
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDownload(report.id)}
                          disabled={downloadingId === report.id}
                          className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors disabled:opacity-50"
                          title="Скачать PDF"
                        >
                          {downloadingId === report.id ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <Download size={18} />
                          )}
                        </button>
                        <button
                          onClick={() => setConfirmDelete(report.id)}
                          disabled={deletingId === report.id}
                          className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                          title="Удалить"
                        >
                          {deletingId === report.id ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <Trash2 size={18} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Модальное окно подтверждения удаления */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 mx-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                <Trash2 size={24} className="text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Удалить отчет?
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
                  Это действие невозможно отменить. Отчет будет удален безвозвратно.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                disabled={deletingId !== null}
              >
                Отмена
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={deletingId !== null}
              >
                {deletingId === confirmDelete ? (
                  <>
                    <Loader2 size={16} className="animate-spin inline mr-1" />
                    Удаление...
                  </>
                ) : (
                  'Удалить'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;