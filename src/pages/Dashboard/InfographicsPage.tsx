// src/pages/Dashboard/InfographicsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useGoods } from '@/hooks/useGoods';
import {
  searchInfographics,
  getGoodsInfographics,
  saveInfographicsToGoods,
} from '@/api/infographics';
import {
  Alert,
  Button,
  Card,
  CardContent,
  ConfirmDialog,
  FormField,
  Select,
  SelectableImageGrid,
} from '@/components/ui';
import { Loader2, Minus, Package, Plus, Save, Search, Trash2 } from 'lucide-react';
import { getErrorMessage } from '@/utils/getErrorMessage';

/**
 * `SelectableImageGrid` использует `key={url}` во внутреннем .map (задача 11), поэтому
 * дублирующиеся URL в одном списке привели бы к конфликту ключей. Оба источника данных
 * (поиск по внешнему API и сохранённый список товара) могут вернуть повторы, а модель
 * выбора и так основана на URL (`selected.includes(url)`), то есть два одинаковых
 * тайла всё равно переключались бы вместе. Дедупликация на входе убирает и то, и другое.
 * Тот же приём применён в GoodsDetail/InfographicsTab.tsx (задача 22).
 */
const dedupe = (urls: string[]): string[] => Array.from(new Set(urls));

const InfographicsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const goodsIdFromUrl = searchParams.get('goods_id');

  // `useGoods` сам грузит первую страницу при монтировании, поэтому размер страницы
  // передаётся аргументом хука, а не вторым вызовом fetchGoods из этой страницы
  // (см. отчёт задачи 23: два параллельных запроса гонялись, и выигрывал тот, что
  // ответил последним — список молча обрезался до 20 позиций).
  const { goods, loading: goodsLoading, error: goodsLoadError } = useGoods(1, 100);

  // Состояние выбранного товара
  const [selectedGoodsId, setSelectedGoodsId] = useState<string>(goodsIdFromUrl || '');

  // Состояние для количества изображений (по умолчанию 10)
  const [imageCount, setImageCount] = useState<number>(10);

  // Состояние для найденных и сохранённых изображений
  const [savedImages, setSavedImages] = useState<string[]>([]);
  const [foundImages, setFoundImages] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedSaved, setSelectedSaved] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  // Ошибка загрузки сохранённых изображений. Раньше уходила только в console.error,
  // и сбой запроса был неотличим от «у товара просто нет инфографики» (аудит, п. 27).
  const [loadError, setLoadError] = useState<string | null>(null);
  // Отдельный флаг именно первичной загрузки: `loading` относится к кнопке поиска,
  // без своего флага пустое состояние мигало при каждой смене товара.
  const [savedLoading, setSavedLoading] = useState<boolean>(false);
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Загружаем сохранённые изображения при выборе товара.
  // `getGoodsInfographics` — прямой axios-вызов без внутреннего catch, ошибка
  // действительно доходит сюда reject-ом (в отличие от useGoods.fetchGoods, задача 20).
  // Загрузка вынесена внутрь эффекта с флагом `cancelled`: быстрое переключение
  // товаров иначе позволяло медленному раннему ответу перезаписать быстрый поздний.
  useEffect(() => {
    setFoundImages([]);
    setSelectedImages([]);
    setSelectedSaved([]);

    if (!selectedGoodsId) {
      setSavedImages([]);
      setLoadError(null);
      return;
    }

    let cancelled = false;
    const load = async () => {
      setSavedLoading(true);
      setLoadError(null);
      try {
        const images = await getGoodsInfographics(selectedGoodsId);
        if (cancelled) return;
        setSavedImages(dedupe(images));
      } catch (err) {
        if (cancelled) return;
        // Список чистится, иначе изображения предыдущего товара остались бы на экране
        // под баннером ошибки и выглядели бы как инфографика вновь выбранного товара.
        setSavedImages([]);
        setLoadError(getErrorMessage(err, 'Не удалось загрузить сохранённые изображения'));
      } finally {
        if (!cancelled) setSavedLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [selectedGoodsId]);

  // Поиск инфографики
  const handleSearch = useCallback(async () => {
    if (!selectedGoodsId) {
      setError('Выберите товар');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await searchInfographics({
        goods_id: selectedGoodsId,
        count: imageCount,
      });
      const images = dedupe(result.images || []);
      setFoundImages(images);
      setSelectedImages([]);
      if (images.length === 0) {
        setSuccess('Изображения не найдены. Попробуйте изменить параметры.');
      } else {
        setSuccess(`Найдено ${images.length} изображений`);
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Ошибка поиска инфографики'));
    } finally {
      setLoading(false);
    }
  }, [selectedGoodsId, imageCount]);

  // Сохранение выбранных изображений.
  // ВНИМАНИЕ: выбранные ДОБАВЛЯЮТСЯ к уже сохранённым — это дословное поведение этой
  // страницы, сохранено намеренно. GoodsDetail/InfographicsTab.tsx на тех же данных
  // ЗАМЕЩАЕТ список; расхождение предсуществующее и зафиксировано в отчётах задач 22/24.
  const handleSaveSelected = useCallback(async () => {
    if (!selectedGoodsId || selectedImages.length === 0) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const unique = dedupe([...savedImages, ...selectedImages]);
      await saveInfographicsToGoods(selectedGoodsId, unique);
      // Обновляем список сохранённых
      const updated = await getGoodsInfographics(selectedGoodsId);
      setSavedImages(dedupe(updated));
      setLoadError(null);
      setFoundImages([]);
      setSelectedImages([]);
      setSelectedSaved([]);
      setSuccess('Изображения успешно сохранены');
    } catch (err) {
      setError(getErrorMessage(err, 'Ошибка сохранения инфографики'));
    } finally {
      setSaving(false);
    }
  }, [selectedGoodsId, selectedImages, savedImages]);

  // Удаление выбранных сохранённых изображений.
  // Раньше на каждом тайле висела кнопка-корзина, появлявшаяся только при hover
  // (недоступна с клавиатуры и на тач-устройствах) и удалявшая без подтверждения.
  // Общий SelectableImageGrid не рендерит оверлеи, поэтому удаление переехало на
  // модель «выбрать → удалить выбранные», как в задаче 22.
  const handleRemoveSelected = useCallback(async () => {
    if (!selectedGoodsId || selectedSaved.length === 0 || isDeleting) return;
    setIsDeleting(true);
    setError(null);
    setSuccess(null);
    const removedCount = selectedSaved.length;
    const remaining = savedImages.filter((url) => !selectedSaved.includes(url));
    try {
      await saveInfographicsToGoods(selectedGoodsId, remaining);
      setSavedImages(remaining);
      setSelectedSaved([]);
      setDeleteOpen(false);
      setSuccess(`Удалено изображений: ${removedCount}`);
    } catch (err) {
      setError(getErrorMessage(err, 'Ошибка удаления изображения'));
      setDeleteOpen(false);
    } finally {
      setIsDeleting(false);
    }
  }, [selectedGoodsId, savedImages, selectedSaved, isDeleting]);

  // Выбор/снятие выбора изображения в найденных
  const toggleFound = useCallback((url: string) => {
    setSelectedImages((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
    );
  }, []);

  // Выбор/снятие выбора среди сохранённых
  const toggleSaved = useCallback((url: string) => {
    setSelectedSaved((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
    );
  }, []);

  // Обработчик изменения количества
  const handleCountChange = (delta: number) => {
    setImageCount((prev) => Math.min(20, Math.max(1, prev + delta)));
  };

  // Блок сохранённых показывается и когда список пуст из-за ошибки или ещё грузится —
  // иначе баннер ошибки было бы негде отрисовать и сбой снова выглядел бы как «пусто».
  const showSavedSection =
    !!selectedGoodsId && (savedImages.length > 0 || savedLoading || !!loadError);

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Поиск инфографики</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Найдите и сохраните релевантные изображения для карточек товаров
        </p>
      </div>

      {/* Выбор товара и параметры поиска */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="flex-1">
              <FormField id="goodsSelect" label="Выберите товар">
                {(fieldProps) => (
                  <Select
                    {...fieldProps}
                    value={selectedGoodsId}
                    onChange={(e) => setSelectedGoodsId(e.target.value)}
                    disabled={goodsLoading}
                  >
                    <option value="">-- Выберите товар --</option>
                    {goods.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} {item.article ? `(${item.article})` : ''}
                      </option>
                    ))}
                  </Select>
                )}
              </FormField>
            </div>

            {/*
              Раньше «Количество:» было <label htmlFor="count">, но элемента с id="count"
              на странице нет — счётчик собран из двух кнопок и текста. Ярлык, ни с чем не
              связанный, вспомогательным технологиям бесполезен, поэтому это группа с
              aria-labelledby (та же правка, что в задаче 23).
            */}
            <div className="flex items-center gap-2" role="group" aria-labelledby="imageCountLabel">
              <span
                id="imageCountLabel"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Количество:
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => handleCountChange(-1)}
                  disabled={imageCount <= 1}
                  aria-label="Уменьшить количество"
                >
                  <Minus size={16} aria-hidden="true" />
                </Button>
                <span
                  className="w-10 text-center font-medium text-gray-900 dark:text-white"
                  aria-live="polite"
                >
                  {imageCount}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => handleCountChange(1)}
                  disabled={imageCount >= 20}
                  aria-label="Увеличить количество"
                >
                  <Plus size={16} aria-hidden="true" />
                </Button>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">(1–20)</span>
            </div>

            <Button
              onClick={handleSearch}
              disabled={!selectedGoodsId}
              isLoading={loading}
              className="whitespace-nowrap"
            >
              {!loading && <Search size={18} className="mr-2" aria-hidden="true" />}
              {loading ? 'Поиск...' : 'Найти изображения'}
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
        </CardContent>
      </Card>

      {/* Уведомления */}
      {goodsLoadError && <Alert variant="error">{goodsLoadError}</Alert>}
      {error && <Alert variant="error">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {/* Сохранённые изображения */}
      {showSavedSection && (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Сохранённые изображения ({savedImages.length})
              </h2>
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

            {loadError && <Alert variant="error">{loadError}</Alert>}

            {savedLoading && (
              <div
                className="flex items-center gap-2 text-gray-500 dark:text-gray-400"
                role="status"
              >
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Загрузка сохранённых изображений...
              </div>
            )}

            {savedImages.length > 0 && (
              <SelectableImageGrid
                images={savedImages}
                selected={selectedSaved}
                onToggle={toggleSaved}
                getAlt={(url) => `Инфографика ${savedImages.indexOf(url) + 1}`}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Найденные изображения */}
      {foundImages.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Найденные изображения ({foundImages.length})
              </h2>
              <div className="flex flex-wrap gap-2">
                <Button variant="ghost" size="sm" onClick={() => setSelectedImages(foundImages)}>
                  Выбрать все
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSelectedImages([])}>
                  Снять все
                </Button>
              </div>
            </div>

            <SelectableImageGrid
              images={foundImages}
              selected={selectedImages}
              onToggle={toggleFound}
              getAlt={(url) => `Найденное изображение ${foundImages.indexOf(url) + 1}`}
            />

            {selectedImages.length > 0 && (
              <div className="mt-4 flex justify-end">
                <Button onClick={handleSaveSelected} isLoading={saving}>
                  {!saving && <Save size={18} className="mr-2" aria-hidden="true" />}
                  {saving ? 'Сохранение...' : `Сохранить выбранные (${selectedImages.length})`}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/*
        Пустое состояние гасится при ошибке загрузки товаров: иначе упавший запрос
        рендерился как «У вас нет товаров» и предлагал завести первый товар
        пользователю, у которого каталог на самом деле не пуст (задача 23).
      */}
      {goods.length === 0 && !goodsLoading && !goodsLoadError && (
        <Card>
          <CardContent className="p-12 text-center">
            <Package size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" aria-hidden="true" />
            <p className="text-gray-600 dark:text-gray-400">У вас нет товаров.</p>
            <Button className="mt-3" onClick={() => navigate('/goods/new')}>
              Добавить товар
            </Button>
          </CardContent>
        </Card>
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

export default InfographicsPage;
