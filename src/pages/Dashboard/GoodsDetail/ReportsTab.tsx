// src/pages/Dashboard/GoodsDetail/ReportsTab.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSeoHistory } from '@/api/seo';
import { getGoodsInfographics } from '@/api/infographics';
import type { GoodsItem } from '@/api/types';
import { Alert, Badge, Button } from '@/components/ui';
import { BarChart3, Loader2 } from 'lucide-react';
import { getErrorMessage } from '@/utils/getErrorMessage';

interface ReportsTabProps {
  goodsItem: GoodsItem;
}

/**
 * Вкладка «Отчёты». Счётчики SEO-генераций и инфографики раньше читались из
 * состояния родителя, которое загружалось независимо от активной вкладки. После
 * разделения состояние живёт в своих вкладках, поэтому эта вкладка запрашивает
 * два счётчика сама — так сводка остаётся такой же, как до рефакторинга.
 */
const ReportsTab: React.FC<ReportsTabProps> = ({ goodsItem }) => {
  const navigate = useNavigate();
  const goodsId = goodsItem.id;

  const [seoCount, setSeoCount] = useState<number | null>(null);
  const [infographicsCount, setInfographicsCount] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  // Без этого флага сводка печатала «—», что одинаково читалось и как «ещё грузим»,
  // и как «действительно ноль».
  const [initialLoading, setInitialLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setInitialLoading(true);
      setLoadError(null);
      try {
        const [history, images] = await Promise.all([
          getSeoHistory(goodsId),
          getGoodsInfographics(goodsId),
        ]);
        if (cancelled) return;
        setSeoCount(history.length);
        setInfographicsCount(images.length);
      } catch (err) {
        if (cancelled) return;
        setLoadError(getErrorMessage(err, 'Не удалось загрузить сводку по товару'));
      } finally {
        if (!cancelled) setInitialLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [goodsId]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Отчёты по товару</h2>
        <Button onClick={() => navigate(`/reports?goods_id=${goodsId}`)}>
          <BarChart3 size={18} className="mr-2" aria-hidden="true" />
          Перейти к отчётам
        </Button>
      </div>

      {loadError && <Alert variant="error">{loadError}</Alert>}

      <p className="text-gray-500 dark:text-gray-400">
        Здесь будут отображаться сгенерированные отчёты для данного товара. Перейдите в раздел
        «Отчёты» для просмотра и создания новых.
      </p>

      {initialLoading ? (
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400" role="status">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Загрузка сводки...
        </div>
      ) : (
        // Счётчики рендерятся только после успешной загрузки, поэтому число здесь
        // всегда настоящее — «0» означает ноль, а не «ещё не знаем».
        !loadError && (
          <div className="flex flex-wrap gap-2">
            <Badge variant="neutral">SEO-генераций: {seoCount ?? 0}</Badge>
            <Badge variant="neutral">Инфографики: {infographicsCount ?? 0}</Badge>
          </div>
        )
      )}
    </div>
  );
};

export default ReportsTab;
