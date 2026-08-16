// src/pages/Dashboard/SeoGenerationPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useGoods } from '@/hooks/useGoods';
import {
  generateSeo,
  saveSeoToGoods,
  getSeoHistory,
} from '@/api/seo';
import type { SeoGenerationResponse } from '@/api/types';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardContent,
  FormField,
  Select,
} from '@/components/ui';
import { Sparkles, Save, Loader2, Package } from 'lucide-react';
import { getErrorMessage } from '@/utils/getErrorMessage';

const SeoGenerationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const goodsIdFromUrl = searchParams.get('goods_id');

  // Размер страницы задаётся здесь, а не отдельным вызовом fetchGoods: хук уже
  // загружает первую страницу при монтировании, и второй вызов с другим size
  // создавал гонку — победивший последним ответ определял длину списка.
  const { goods, loading: goodsLoading, error: goodsLoadError } = useGoods(1, 100);

  const [selectedGoodsId, setSelectedGoodsId] = useState<string>(goodsIdFromUrl || '');

  const [generatedSeo, setGeneratedSeo] = useState<SeoGenerationResponse | null>(null);
  const [seoHistory, setSeoHistory] = useState<SeoGenerationResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  // Ошибка загрузки истории. Раньше она уходила только в console.error, поэтому
  // упавший запрос выглядел ровно как «истории ещё нет».
  const [historyLoadError, setHistoryLoadError] = useState<string | null>(null);
  // Отдельный от `loading` флаг: тот относится к генерации по кнопке.
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);

  // При изменении выбранного товара загружаем его историю SEO.
  // `getSeoHistory` — тонкая обёртка над axios-клиентом без внутреннего catch
  // (src/api/seo.ts), а перехватчик ответа завершается Promise.reject
  // (src/api/client.ts), поэтому сетевая ошибка действительно доходит сюда.
  useEffect(() => {
    if (!selectedGoodsId) {
      setSeoHistory([]);
      setGeneratedSeo(null);
      setHistoryLoadError(null);
      setHistoryLoading(false);
      return;
    }

    let cancelled = false;
    const load = async () => {
      setHistoryLoading(true);
      setHistoryLoadError(null);
      try {
        const history = await getSeoHistory(selectedGoodsId);
        if (cancelled) return;
        setSeoHistory(history);
        setGeneratedSeo(history.length > 0 ? history[0] : null); // последний
      } catch (err) {
        if (cancelled) return;
        setSeoHistory([]);
        setGeneratedSeo(null);
        setHistoryLoadError(getErrorMessage(err, 'Не удалось загрузить историю SEO'));
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [selectedGoodsId]);

  // Генерация SEO
  const handleGenerate = useCallback(async () => {
    if (!selectedGoodsId) {
      setError('Выберите товар');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await generateSeo({ goods_id: selectedGoodsId });
      setGeneratedSeo(result);
      // Обновляем историю
      const history = await getSeoHistory(selectedGoodsId);
      setSeoHistory(history);
      setSuccess('SEO успешно сгенерировано');
    } catch (err) {
      setError(getErrorMessage(err, 'Ошибка генерации SEO'));
    } finally {
      setLoading(false);
    }
  }, [selectedGoodsId]);

  // Сохранение SEO
  const handleSave = useCallback(async () => {
    if (!selectedGoodsId || !generatedSeo) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await saveSeoToGoods(selectedGoodsId, generatedSeo);
      // Обновляем историю
      const history = await getSeoHistory(selectedGoodsId);
      setSeoHistory(history);
      setSuccess('SEO сохранено в карточку товара');
    } catch (err) {
      setError(getErrorMessage(err, 'Ошибка сохранения SEO'));
    } finally {
      setSaving(false);
    }
  }, [selectedGoodsId, generatedSeo]);

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Генерация SEO</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Создание заголовков, описаний и ключевых слов для карточек товаров с помощью AI
        </p>
      </div>

      {/* Выбор товара */}
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
            <Button
              onClick={handleGenerate}
              disabled={!selectedGoodsId}
              isLoading={loading}
              className="whitespace-nowrap"
            >
              {!loading && <Sparkles size={18} className="mr-2" aria-hidden="true" />}
              {loading ? 'Генерация...' : 'Сгенерировать'}
            </Button>
          </div>
          {goodsLoading && (
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500 dark:text-gray-400" role="status">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Загрузка списка товаров...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ошибка загрузки списка товаров: useGoods глушит её внутри себя и только
          выставляет `error`, поэтому без этого блока сбой выглядел бы как «у вас
          нет товаров» (см. задачу 20). */}
      {goodsLoadError && <Alert variant="error">{goodsLoadError}</Alert>}

      {/* Ошибки и успехи */}
      {error && <Alert variant="error">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {/* Результат генерации */}
      {selectedGoodsId && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Сгенерированный SEO
              </h2>
              {generatedSeo && (
                <Button onClick={handleSave} isLoading={saving}>
                  {!saving && <Save size={18} className="mr-2" aria-hidden="true" />}
                  {saving ? 'Сохранение...' : 'Сохранить'}
                </Button>
              )}
            </div>

            {historyLoadError && <Alert variant="error">{historyLoadError}</Alert>}

            {generatedSeo ? (
              /*
                Раньше эти три подписи были <label>, хотя размечали не поля ввода,
                а статичный вывод, и ни на что не ссылались. Теперь это честный
                список описаний <dl>/<dt>/<dd> — как во вкладке «SEO» карточки
                товара (задача 22).
              */
              <dl className="space-y-4">
                <div>
                  <dt className="block text-sm font-medium text-gray-700 dark:text-gray-300">Заголовок</dt>
                  <dd className="mt-1 p-3 bg-gray-50 dark:bg-gray-700/50 rounded text-gray-900 dark:text-white">
                    {generatedSeo.title}
                  </dd>
                </div>
                <div>
                  <dt className="block text-sm font-medium text-gray-700 dark:text-gray-300">Описание</dt>
                  <dd className="mt-1 p-3 bg-gray-50 dark:bg-gray-700/50 rounded text-gray-900 dark:text-white whitespace-pre-wrap">
                    {generatedSeo.description}
                  </dd>
                </div>
                <div>
                  <dt className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ключевые слова</dt>
                  <dd className="mt-1 flex flex-wrap gap-2">
                    {generatedSeo.keywords.map((kw, idx) => (
                      <Badge key={`${kw}-${idx}`}>{kw}</Badge>
                    ))}
                  </dd>
                </div>
              </dl>
            ) : loading ? (
              <p className="text-gray-500 dark:text-gray-400">Генерация...</p>
            ) : historyLoading ? (
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400" role="status">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Загрузка истории SEO...
              </div>
            ) : (
              // При ошибке загрузки пустое состояние не показываем: выше уже стоит
              // Alert, а «SEO не сгенерировано» утверждало бы то, чего мы не знаем.
              !historyLoadError && (
                <p className="text-gray-500 dark:text-gray-400">
                  SEO не сгенерировано. Нажмите «Сгенерировать».
                </p>
              )
            )}
          </CardContent>
        </Card>
      )}

      {/* История генераций */}
      {selectedGoodsId && seoHistory.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              История генераций ({seoHistory.length})
            </h2>
            {/*
              В каждой записи раньше печаталась дата formatDate(new Date().toISOString()) —
              то есть всегда текущий момент, а не момент генерации. У
              SeoGenerationResponse нет поля со временем, поэтому дата убрана целиком:
              вернуть её можно только после появления created_at на бэкенде.
            */}
            <ul className="space-y-3 max-h-80 overflow-y-auto">
              {seoHistory.map((item, index) => (
                <li
                  key={`${item.title}-${index}`}
                  className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded border border-gray-200 dark:border-gray-600"
                >
                  <p className="font-medium text-gray-900 dark:text-white">{item.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{item.description}</p>
                  <div className="flex flex-wrap items-center gap-1 mt-1">
                    {item.keywords.slice(0, 3).map((kw, idx) => (
                      <Badge key={`${kw}-${idx}`}>{kw}</Badge>
                    ))}
                    {item.keywords.length > 3 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        +{item.keywords.length - 3}
                      </span>
                    )}
                  </div>
                  {index === 0 && (
                    <Badge variant="success" className="mt-2">
                      Последний
                    </Badge>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Если нет товаров. Не показываем, когда список не загрузился: пустота
          из-за ошибки — это не «товаров нет». */}
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
    </div>
  );
};

export default SeoGenerationPage;
