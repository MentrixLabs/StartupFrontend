// src/pages/Dashboard/GoodsDetail/SeoTab.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { generateSeo, saveSeoToGoods, getSeoHistory } from '@/api/seo';
import type { GoodsItem, SeoGenerationResponse } from '@/api/types';
import { Alert, Badge, Button } from '@/components/ui';
import { Loader2, Save, Sparkles } from 'lucide-react';
import { getErrorMessage } from '@/utils/getErrorMessage';

interface SeoTabProps {
  goodsItem: GoodsItem;
}

/**
 * Вкладка «SEO». Всё состояние генерации (история, текущий результат, ошибки)
 * живёт здесь, а не в родительской странице, поэтому существует только пока
 * вкладка смонтирована.
 */
const SeoTab: React.FC<SeoTabProps> = ({ goodsItem }) => {
  const goodsId = goodsItem.id;

  const [seoHistory, setSeoHistory] = useState<SeoGenerationResponse[]>([]);
  const [generatedSeo, setGeneratedSeo] = useState<SeoGenerationResponse | null>(null);
  const [seoLoading, setSeoLoading] = useState<boolean>(false);
  const [seoError, setSeoError] = useState<string | null>(null);
  // Загрузка истории при монтировании вкладки. Отдельный флаг от seoLoading:
  // тот относится к генерации/сохранению по кнопке. Стартует как true, иначе
  // пустое состояние успевает мигнуть до ответа сервера — а вкладка теперь
  // монтируется заново при каждом переключении, так что мигало бы часто.
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  // Ошибка первичной загрузки истории. Раньше она только писалась в console.error,
  // из-за чего упавший запрос выглядел точно так же, как «SEO ещё не генерировали».
  const [loadError, setLoadError] = useState<string | null>(null);

  // Загрузка истории генераций при монтировании вкладки.
  // `getSeoHistory` — тонкая обёртка над axios-клиентом без внутреннего catch,
  // поэтому сетевая ошибка действительно доходит сюда как reject (в отличие от
  // useGoods.fetchGoods, который глушит ошибки внутри себя — см. задачу 20).
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setInitialLoading(true);
      setLoadError(null);
      try {
        const history = await getSeoHistory(goodsId);
        if (cancelled) return;
        setSeoHistory(history);
        if (history.length > 0) {
          setGeneratedSeo(history[0]); // последний
        }
      } catch (err) {
        if (cancelled) return;
        setLoadError(getErrorMessage(err, 'Не удалось загрузить историю SEO'));
      } finally {
        if (!cancelled) setInitialLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [goodsId]);

  // Генерация SEO
  const handleGenerateSeo = useCallback(async () => {
    setSeoLoading(true);
    setSeoError(null);
    try {
      const result = await generateSeo({ goods_id: goodsId });
      setGeneratedSeo(result);
      // Автоматически сохраняем
      await saveSeoToGoods(goodsId, result);
      // Обновляем историю
      const history = await getSeoHistory(goodsId);
      setSeoHistory(history);
    } catch (err) {
      setSeoError(getErrorMessage(err, 'Ошибка генерации SEO'));
    } finally {
      setSeoLoading(false);
    }
  }, [goodsId]);

  // Сохранение SEO
  const handleSaveSeo = useCallback(async () => {
    if (!generatedSeo) return;
    setSeoLoading(true);
    setSeoError(null);
    try {
      await saveSeoToGoods(goodsId, generatedSeo);
      const history = await getSeoHistory(goodsId);
      setSeoHistory(history);
    } catch (err) {
      setSeoError(getErrorMessage(err, 'Ошибка сохранения SEO'));
    } finally {
      setSeoLoading(false);
    }
  }, [goodsId, generatedSeo]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">SEO-оптимизация</h2>
        <Button onClick={handleGenerateSeo} isLoading={seoLoading}>
          {!seoLoading && <Sparkles size={18} className="mr-2" aria-hidden="true" />}
          {seoLoading ? 'Генерация...' : 'Сгенерировать SEO'}
        </Button>
      </div>

      {loadError && <Alert variant="error">{loadError}</Alert>}
      {seoError && <Alert variant="error">{seoError}</Alert>}

      {initialLoading && (
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400" role="status">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Загрузка истории SEO...
        </div>
      )}

      {generatedSeo ? (
        <div className="space-y-4">
          {/*
            Раньше эти три подписи были <label>, хотя размечали не поля ввода, а
            статичный вывод. Теперь это честный список описаний <dl>/<dt>/<dd>,
            как во вкладке «Информация».
          */}
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
          <div className="flex gap-3">
            <Button onClick={handleSaveSeo} isLoading={seoLoading}>
              {!seoLoading && <Save size={18} className="mr-2" aria-hidden="true" />}
              Сохранить
            </Button>
          </div>
        </div>
      ) : (
        // Пустое состояние показываем только когда загрузка завершилась и не упала:
        // при ошибке оно выглядело бы как «данных просто нет», а во время загрузки —
        // утверждало бы, что SEO не генерировали, ещё не зная этого.
        !initialLoading &&
        !loadError && <p className="text-gray-500 dark:text-gray-400">SEO ещё не сгенерировано.</p>
      )}

      {/* История SEO */}
      {seoHistory.length > 1 && (
        <section className="mt-8">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">История генераций</h3>
          {/*
            Дата в каждой записи была фиктивной: formatDate(new Date().toISOString())
            всегда печатал текущий момент, а не момент генерации. У
            SeoGenerationResponse нет поля с временем, поэтому дата убрана целиком —
            вернуть её можно только после появления created_at на бэкенде.
          */}
          <ul className="space-y-2 max-h-60 overflow-y-auto">
            {seoHistory.slice(1).map((item, idx) => (
              <li
                key={`${item.title}-${idx}`}
                className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded text-sm text-gray-500 dark:text-gray-400"
              >
                Заголовок: {item.title}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default SeoTab;
