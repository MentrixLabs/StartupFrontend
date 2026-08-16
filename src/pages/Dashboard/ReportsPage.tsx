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
  Alert,
  Badge,
  Button,
  Card,
  CardContent,
  ConfirmDialog,
  FormField,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import {
  BarChart3,
  Plus,
  Download,
  Trash2,
  Loader2,
  CheckCircle,
  Package,
  X,
} from 'lucide-react';
import { getErrorMessage } from '@/utils/getErrorMessage';

const ReportsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const goodsIdFromUrl = searchParams.get('goods_id');

  // Размер страницы задаётся аргументом хука, а не отдельным вызовом fetchGoods:
  // хук уже загружает первую страницу при монтировании, поэтому дополнительный
  // `useEffect(() => fetchGoods(1, 100))` давал два запроса и гонку — победивший
  // последним ответ определял длину списка (тот же дефект, что в задачах 23/24).
  const { goods, loading: goodsLoading, error: goodsLoadError } = useGoods(1, 100);

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
  const isDeleting = deletingId !== null;

  // Состояние скачивания
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Загрузка отчетов при изменении фильтра.
  // `getReports` — тонкая обёртка над axios-клиентом без внутреннего catch
  // (src/api/reports.ts), а перехватчик ответа завершается Promise.reject
  // (src/api/client.ts), поэтому сетевая ошибка действительно доходит сюда.
  const loadReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getReports(1, 100); // пагинация пока не требуется
      // Если есть фильтр по товару, фильтруем локально (можно было бы передать параметр в API)
      let items = result.items;
      if (selectedGoodsId) {
        items = items.filter((r) => r.goods_id === selectedGoodsId);
      }
      setReports(items);
    } catch (err) {
      setError(getErrorMessage(err, 'Ошибка загрузки отчетов'));
    } finally {
      setLoading(false);
    }
  }, [selectedGoodsId]);

  useEffect(() => {
    void loadReports();
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
      setReports((prev) => [newReport, ...prev]);
      setSuccess('Отчет успешно сгенерирован');
    } catch (err) {
      setError(getErrorMessage(err, 'Ошибка генерации отчета'));
    } finally {
      setGenerating(false);
    }
  }, [selectedGoodsId]);

  // Удаление отчета.
  // Диалог остаётся открытым на всё время запроса: `ConfirmDialog` больше не
  // закрывает себя сам, а `confirmDelete` сбрасывается только после того, как
  // `deleteReport` завершился (в т.ч. ошибкой — тогда её показывает Alert).
  const handleDelete = useCallback(async (id: string) => {
    setDeletingId(id);
    setError(null);
    setSuccess(null);
    try {
      await deleteReport(id);
      setReports((prev) => prev.filter((r) => r.id !== id));
      setSuccess('Отчет удален');
    } catch (err) {
      setError(getErrorMessage(err, 'Ошибка удаления отчета'));
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
    } catch (err) {
      setError(getErrorMessage(err, 'Ошибка скачивания отчета'));
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
    const item = goods.find((g) => g.id === id);
    return item ? item.name : id;
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Отчеты</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Управляйте отчетами по оптимизации карточек товаров
        </p>
      </div>

      {/* Фильтр и кнопка создания */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="flex-1">
              <FormField id="filterGoods" label="Фильтр по товару">
                {(fieldProps) => (
                  <Select
                    {...fieldProps}
                    value={selectedGoodsId}
                    onChange={(e) => setSelectedGoodsId(e.target.value)}
                    disabled={goodsLoading}
                  >
                    <option value="">Все товары</option>
                    {goods.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} {item.article ? `(${item.article})` : ''}
                      </option>
                    ))}
                  </Select>
                )}
              </FormField>
            </div>
            <Button
              onClick={() => void handleGenerateReport()}
              disabled={!selectedGoodsId}
              isLoading={generating}
              className="whitespace-nowrap"
            >
              {!generating && <Plus size={18} className="mr-2" aria-hidden="true" />}
              {generating ? 'Генерация...' : 'Создать отчет'}
            </Button>
          </div>
          {goodsLoading && (
            <div
              className="flex items-center gap-2 mt-2 text-sm text-gray-500 dark:text-gray-400"
              role="status"
            >
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Загрузка списка товаров...
            </div>
          )}
          {!goodsLoading && !selectedGoodsId && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Выберите товар, чтобы создать отчет
            </p>
          )}
        </CardContent>
      </Card>

      {/* Ошибка загрузки списка товаров: useGoods глушит её внутри себя и только
          выставляет `error`, поэтому без этого блока сбой выглядел бы как «у вас
          нет товаров» (см. задачу 20). */}
      {goodsLoadError && <Alert variant="error">{goodsLoadError}</Alert>}

      {/* Уведомления */}
      {error && <Alert variant="error">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {/* Список отчетов */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="flex flex-col items-center gap-4" role="status">
            <Loader2 size={32} className="animate-spin text-blue-600" aria-hidden="true" />
            <p className="text-gray-500 dark:text-gray-400">Загрузка отчетов...</p>
          </div>
        </div>
      ) : (
        <Card>
          {reports.length === 0 ? (
            <div className="py-16 text-center">
              <BarChart3
                size={48}
                className="text-gray-300 dark:text-gray-600 mx-auto mb-3"
                aria-hidden="true"
              />
              <p className="text-gray-600 dark:text-gray-400">
                {selectedGoodsId ? 'Нет отчетов для этого товара' : 'Нет отчетов'}
              </p>
              {selectedGoodsId && (
                <Button
                  className="mt-3"
                  onClick={() => void handleGenerateReport()}
                  isLoading={generating}
                >
                  {!generating && <Plus size={18} className="mr-2" aria-hidden="true" />}
                  {generating ? 'Генерация...' : 'Создать первый отчет'}
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Товар</TableHead>
                  <TableHead>Дата создания</TableHead>
                  <TableHead>SEO</TableHead>
                  <TableHead>Инфографика</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Package size={16} className="text-gray-400" aria-hidden="true" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {getGoodsName(report.goods_id)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-300">
                      {formatDate(report.created_at)}
                    </TableCell>
                    <TableCell>
                      {report.seo_text ? (
                        <Badge variant="success">
                          <CheckCircle size={12} aria-hidden="true" />
                          есть
                        </Badge>
                      ) : (
                        <Badge variant="neutral">
                          <X size={12} aria-hidden="true" />
                          нет
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {report.infographics && report.infographics.length > 0 ? (
                        <Badge variant="success">
                          <CheckCircle size={12} aria-hidden="true" />
                          {report.infographics.length} шт.
                        </Badge>
                      ) : (
                        <Badge variant="neutral">
                          <X size={12} aria-hidden="true" />
                          нет
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                          onClick={() => void handleDownload(report.id)}
                          disabled={downloadingId === report.id}
                          title="Скачать PDF"
                          aria-label="Скачать PDF"
                        >
                          {downloadingId === report.id ? (
                            <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                          ) : (
                            <Download size={18} aria-hidden="true" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                          onClick={() => setConfirmDelete(report.id)}
                          disabled={isDeleting}
                          title="Удалить"
                          aria-label="Удалить"
                        >
                          <Trash2 size={18} aria-hidden="true" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      )}

      {/* Подтверждение удаления.
          `isLoading` держит спиннер на кнопке подтверждения и блокирует Escape /
          клик вне диалога, повторяя поведение прежней надписи «Удаление...». */}
      <ConfirmDialog
        open={confirmDelete !== null}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setConfirmDelete(null);
        }}
        title="Удалить отчет?"
        description="Это действие невозможно отменить. Отчет будет удален безвозвратно."
        confirmLabel={isDeleting ? 'Удаление...' : 'Удалить'}
        isDestructive
        isLoading={isDeleting}
        onConfirm={() => {
          if (confirmDelete) void handleDelete(confirmDelete);
        }}
      />
    </div>
  );
};

export default ReportsPage;
