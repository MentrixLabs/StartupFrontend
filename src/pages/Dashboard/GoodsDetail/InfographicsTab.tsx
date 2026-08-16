// src/pages/Dashboard/GoodsDetail/InfographicsTab.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  searchInfographics,
  saveInfographicsToGoods,
  getGoodsInfographics,
} from '@/api/infographics';
import type { GoodsItem } from '@/api/types';
import { Alert, Button, ConfirmDialog, SelectableImageGrid } from '@/components/ui';
import { Loader2, Save, Search, Trash2 } from 'lucide-react';
import { getErrorMessage } from '@/utils/getErrorMessage';

interface InfographicsTabProps {
  goodsItem: GoodsItem;
}

/**
 * `SelectableImageGrid` использует `key={url}` во внутреннем .map (задача 11), поэтому
 * дублирующиеся URL в одном списке привели бы к конфликту ключей. Оба источника данных
 * (поиск по внешнему API и сохранённый список товара) могут вернуть повторы, а модель
 * выбора и так основана на URL (`selected.includes(url)`), то есть два одинаковых
 * тайла всё равно переключались бы вместе. Дедупликация на входе убирает и то, и другое.
 */
const dedupe = (urls: string[]): string[] => Array.from(new Set(urls));

const InfographicsTab: React.FC<InfographicsTabProps> = ({ goodsItem }) => {
  const goodsId = goodsItem.id;

  const [infographics, setInfographics] = useState<string[]>([]);
  const [foundImages, setFoundImages] = useState<string[]>([]);
  const [selectedFound, setSelectedFound] = useState<string[]>([]);
  const [selectedSaved, setSelectedSaved] = useState<string[]>([]);
  const [infographicsLoading, setInfographicsLoading] = useState<boolean>(false);
  const [infographicsError, setInfographicsError] = useState<string | null>(null);
  // Ошибка первичной загрузки сохранённой инфографики. Раньше она только уходила
  // в console.error, и сбой был неотличим от «у товара просто нет инфографики».
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  // Загрузка сохранённого списка при монтировании. Отдельно от infographicsLoading,
  // который выставляется только обработчиками поиска и сохранения: без своего флага
  // пустое состояние успевало мигнуть до ответа сервера, причём при каждом
  // переключении вкладок, ведь вкладка монтируется заново.
  const [initialLoading, setInitialLoading] = useState<boolean>(true);

  // Загрузка сохранённой инфографики при монтировании вкладки.
  // `getGoodsInfographics` — прямой axios-вызов без внутреннего catch, ошибка
  // действительно доходит сюда reject-ом (в отличие от useGoods.fetchGoods, задача 20).
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setInitialLoading(true);
      setLoadError(null);
      try {
        const images = await getGoodsInfographics(goodsId);
        if (cancelled) return;
        setInfographics(dedupe(images));
      } catch (err) {
        if (cancelled) return;
        setLoadError(getErrorMessage(err, 'Не удалось загрузить сохранённую инфографику'));
      } finally {
        if (!cancelled) setInitialLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [goodsId]);

  // Поиск инфографики
  const handleSearchInfographics = useCallback(async () => {
    setInfographicsLoading(true);
    setInfographicsError(null);
    try {
      const result = await searchInfographics({ goods_id: goodsId, count: 20 });
      setFoundImages(dedupe(result.images || []));
      setSelectedFound([]);
    } catch (err) {
      setInfographicsError(getErrorMessage(err, 'Ошибка поиска инфографики'));
    } finally {
      setInfographicsLoading(false);
    }
  }, [goodsId]);

  // Сохранение выбранных изображений.
  // ВНИМАНИЕ: сохраняется ровно выбранный набор, он ЗАМЕЩАЕТ ранее сохранённый список —
  // это дословно поведение исходной страницы, сохранено намеренно (рефакторинг
  // структурный). Расхождение с InfographicsPage, которая объединяет списки,
  // зафиксировано в отчёте как предсуществующий баг вне рамок задачи.
  const handleSaveInfographics = useCallback(async () => {
    if (selectedFound.length === 0) return;
    setInfographicsLoading(true);
    setInfographicsError(null);
    try {
      await saveInfographicsToGoods(goodsId, selectedFound);
      const updated = await getGoodsInfographics(goodsId);
      setInfographics(dedupe(updated));
      setFoundImages([]);
      setSelectedFound([]);
      setSelectedSaved([]);
    } catch (err) {
      setInfographicsError(getErrorMessage(err, 'Ошибка сохранения инфографики'));
    } finally {
      setInfographicsLoading(false);
    }
  }, [goodsId, selectedFound]);

  // Удаление выбранных сохранённых изображений
  const handleRemoveSelected = useCallback(async () => {
    if (selectedSaved.length === 0 || isDeleting) return;
    setIsDeleting(true);
    setInfographicsError(null);
    const remaining = infographics.filter((url) => !selectedSaved.includes(url));
    try {
      await saveInfographicsToGoods(goodsId, remaining);
      setInfographics(remaining);
      setSelectedSaved([]);
      setDeleteOpen(false);
    } catch (err) {
      setInfographicsError(getErrorMessage(err, 'Ошибка удаления инфографики'));
      setDeleteOpen(false);
    } finally {
      setIsDeleting(false);
    }
  }, [goodsId, infographics, selectedSaved, isDeleting]);

  const toggleFound = useCallback((url: string) => {
    setSelectedFound((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
    );
  }, []);

  const toggleSaved = useCallback((url: string) => {
    setSelectedSaved((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
    );
  }, []);

  // Пустое состояние — только когда сохранённый список действительно загружен и пуст.
  // `initialLoading` покрывает первичную загрузку, `infographicsLoading` — поиск.
  const showEmptyState =
    !initialLoading &&
    !loadError &&
    infographics.length === 0 &&
    foundImages.length === 0 &&
    !infographicsLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Инфографика</h2>
        <Button onClick={handleSearchInfographics} isLoading={infographicsLoading}>
          {!infographicsLoading && <Search size={18} className="mr-2" aria-hidden="true" />}
          {infographicsLoading ? 'Поиск...' : 'Найти изображения'}
        </Button>
      </div>

      {loadError && <Alert variant="error">{loadError}</Alert>}
      {infographicsError && <Alert variant="error">{infographicsError}</Alert>}

      {initialLoading && (
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400" role="status">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Загрузка сохранённой инфографики...
        </div>
      )}

      {/* Сохранённая инфографика */}
      {infographics.length > 0 && (
        <section>
          <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Сохранённые изображения ({infographics.length})
            </h3>
            {selectedSaved.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteOpen(true)}
                disabled={isDeleting}
              >
                <Trash2 size={16} className="mr-2" aria-hidden="true" />
                Удалить выбранные ({selectedSaved.length})
              </Button>
            )}
          </div>
          <SelectableImageGrid
            images={infographics}
            selected={selectedSaved}
            onToggle={toggleSaved}
            getAlt={(url) => `Инфографика ${infographics.indexOf(url) + 1}`}
          />
        </section>
      )}

      {/* Результаты поиска */}
      {foundImages.length > 0 && (
        <section className="mt-6">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Найдено изображений: {foundImages.length}
            </h3>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setSelectedFound(foundImages)}>
                Выбрать все
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setSelectedFound([])}>
                Снять все
              </Button>
            </div>
          </div>
          <SelectableImageGrid
            images={foundImages}
            selected={selectedFound}
            onToggle={toggleFound}
            getAlt={(url) => `Найденное изображение ${foundImages.indexOf(url) + 1}`}
          />
          {selectedFound.length > 0 && (
            <div className="mt-4 flex justify-end">
              <Button onClick={handleSaveInfographics} isLoading={infographicsLoading}>
                {!infographicsLoading && <Save size={18} className="mr-2" aria-hidden="true" />}
                {infographicsLoading
                  ? 'Сохранение...'
                  : `Сохранить выбранные (${selectedFound.length})`}
              </Button>
            </div>
          )}
        </section>
      )}

      {showEmptyState && (
        <p className="text-gray-500 dark:text-gray-400">
          Нет сохранённой инфографики. Используйте поиск, чтобы найти изображения.
        </p>
      )}

      {/*
        Диалог не закрывает себя сам (задача 21): закрытие происходит только после
        того, как запрос завершился, а isLoading блокирует обе кнопки, Escape и
        клик вне окна.
      */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setDeleteOpen(false);
        }}
        title="Удалить выбранные изображения?"
        description={`Будет удалено изображений: ${selectedSaved.length}. Действие нельзя отменить.`}
        confirmLabel={isDeleting ? 'Удаление...' : 'Удалить'}
        isDestructive
        isLoading={isDeleting}
        onConfirm={() => void handleRemoveSelected()}
      />
    </div>
  );
};

export default InfographicsTab;
