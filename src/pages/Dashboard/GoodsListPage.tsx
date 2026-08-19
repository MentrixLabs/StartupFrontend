// src/pages/Dashboard/GoodsListPage.tsx
import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoods } from '@/hooks/useGoods';
import {
  Alert,
  Button,
  Card,
  ConfirmDialog,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  Package,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';

const GoodsListPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    goods,
    loading,
    error,
    total,
    page,
    size,
    pages,
    fetchGoods,
    removeGoods,
  } = useGoods();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(page);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Фильтрация товаров по поисковому запросу (локальная)
  const filteredGoods = useMemo(() => {
    if (!searchQuery.trim()) return goods;
    const query = searchQuery.toLowerCase().trim();
    return goods.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        (item.product_id && item.product_id.toLowerCase().includes(query)) ||
        (item.category && item.category.toLowerCase().includes(query))
    );
  }, [goods, searchQuery]);

  // Обработчик смены страницы
  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage < 1 || newPage > pages) return;
      setCurrentPage(newPage);
      fetchGoods(newPage, size);
    },
    [fetchGoods, pages, size]
  );

  // Удаление товара
  const handleDelete = useCallback(
    async (id: string) => {
      if (isDeleting) return;
      setIsDeleting(true);
      try {
        await removeGoods(id);
        setDeleteConfirm(null);
        // Если после удаления на странице нет товаров и это не первая страница, переходим на предыдущую
        if (goods.length === 1 && currentPage > 1) {
          handlePageChange(currentPage - 1);
        }
      } catch (err) {
        console.error('Ошибка удаления:', err);
      } finally {
        setIsDeleting(false);
      }
    },
    [removeGoods, goods.length, currentPage, handlePageChange, isDeleting]
  );

  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Состояние загрузки
  if (loading && goods.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4" role="status">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" aria-hidden="true" />
          <p className="text-gray-500 dark:text-gray-400">Загрузка товаров...</p>
        </div>
      </div>
    );
  }

  // Ошибка
  if (error && goods.length === 0) {
    return (
      <div className="max-w-2xl">
        <Alert variant="error">
          <p className="font-medium">Не удалось загрузить товары</p>
          <p className="mt-1">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => fetchGoods(currentPage, size)}
          >
            Повторить
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок и кнопка добавления */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Товары</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Управляйте карточками товаров для оптимизации
          </p>
        </div>
        <Button onClick={() => navigate('/goods/new')}>
          <Plus size={18} className="mr-2" aria-hidden="true" />
          Добавить товар
        </Button>
      </div>

      {/* Поиск и информация */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            size={18}
            aria-hidden="true"
          />
          <Input
            type="text"
            aria-label="Поиск товаров"
            placeholder="Поиск по названию, артикулу или категории..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Всего: <span className="font-medium">{total}</span> товаров
          {searchQuery && (
            <span className="ml-1">
              (найдено: <span className="font-medium">{filteredGoods.length}</span>)
            </span>
          )}
        </div>
      </div>

      {/* Таблица товаров */}
      <Card>
        {filteredGoods.length === 0 ? (
          <div className="py-16 text-center">
            <Package
              size={48}
              className="text-gray-300 dark:text-gray-600 mx-auto mb-3"
              aria-hidden="true"
            />
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery ? 'Товары не найдены' : 'Нет добавленных товаров'}
            </p>
            {!searchQuery && (
              <Button className="mt-3" onClick={() => navigate('/goods/new')}>
                <Plus size={18} className="mr-2" aria-hidden="true" />
                Добавить первый товар
              </Button>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Артикул</TableHead>
                <TableHead>Цена</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGoods.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center text-gray-600 dark:text-gray-300 flex-shrink-0">
                        <Package size={16} aria-hidden="true" />
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-300">
                    {item.id || '—'}
                  </TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-300">
                    {item.price ? `${item.price} ₽` : '—'}
                  </TableCell>
                  <TableCell className="text-gray-500 dark:text-gray-400">
                    {formatDate(item.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-gray-500 dark:text-gray-400"
                        onClick={() => navigate(`/goods/${item.id}`)}
                        title="Просмотр"
                        aria-label="Просмотр"
                      >
                        <Eye size={18} aria-hidden="true" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-gray-500 dark:text-gray-400"
                        onClick={() => navigate(`/goods/${item.id}/edit`)}
                        title="Редактировать"
                        aria-label="Редактировать"
                      >
                        <Pencil size={18} aria-hidden="true" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                        onClick={() => setDeleteConfirm(item.id)}
                        title="Удалить"
                        aria-label="Удалить"
                        disabled={isDeleting}
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

        {/* Пагинация */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Страница {currentPage} из {pages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Предыдущая страница"
              >
                <ChevronLeft size={18} aria-hidden="true" />
              </Button>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {currentPage} / {pages}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pages}
                aria-label="Следующая страница"
              >
                <ChevronRight size={18} aria-hidden="true" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Подтверждение удаления */}
      <ConfirmDialog
        open={deleteConfirm !== null}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setDeleteConfirm(null);
        }}
        title="Удалить товар?"
        description="Это действие невозможно отменить. Все связанные данные (SEO, инфографика, отчёты) будут удалены."
        confirmLabel={isDeleting ? 'Удаление...' : 'Удалить'}
        isDestructive
        isLoading={isDeleting}
        onConfirm={() => {
          if (deleteConfirm) void handleDelete(deleteConfirm);
        }}
      />
    </div>
  );
};

export default GoodsListPage;