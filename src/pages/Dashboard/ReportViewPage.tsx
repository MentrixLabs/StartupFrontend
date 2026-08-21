import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getReport } from '@/api/reports';
import type { Report } from '@/api/types';
import { Alert, Button, Card, CardContent } from '@/components/ui';
import { Loader2, Download, ArrowLeft, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { getErrorMessage } from '@/utils/getErrorMessage';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const ReportViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getReport(Number(id));
        setReport(data);
      } catch (err) {
        setError(getErrorMessage(err, 'Не удалось загрузить отчёт'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleDownload = () => {
    if (!id) return;
    window.open(`/reports/${id}/download`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !report) {
    return <Alert variant="error">{error || 'Отчёт не найден'}</Alert>;
  }

  const forecast = report.forecast_data || {};
  const forecastData = forecast.forecast || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/reports')}>
          <ArrowLeft size={18} className="mr-2" />
          Назад к списку
        </Button>
        <Button onClick={handleDownload}>
          <Download size={18} className="mr-2" />
          Скачать PDF
        </Button>
      </div>

      <h1 className="text-2xl font-bold">Отчёт #{report.id}</h1>
      <p className="text-gray-500">Создан: {new Date(report.created_at).toLocaleString('ru-RU')}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold flex items-center gap-2"><TrendingUp size={18} /> Прогноз остатков</h3>
            <p>{forecast.days_to_out_of_stock || 'Нет данных'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold flex items-center gap-2"><TrendingDown size={18} /> Динамика цены</h3>
            <p>{forecast.price_dynamic || 'Нет данных'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold">Рекомендуемая цена</h3>
            <p className="text-2xl font-bold">{forecast.recommended_price?.toFixed(2) ?? '—'} RUB</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold">Ключевые метрики</h3>
            <div className="text-sm space-y-1">
              <div>Средняя цена: {forecast.key_metrics?.avg_price?.toFixed(2) ?? '—'}</div>
              <div>Волатильность: {forecast.key_metrics?.volatility?.toFixed(2) ?? '—'}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-2">Рекомендации</h3>
          <p className="text-gray-700">{forecast.recommendations || 'Нет рекомендаций'}</p>
        </CardContent>
      </Card>

      {forecastData.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-4">Прогноз по дням</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={forecastData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="price" stroke="#3b82f6" name="Цена" />
                  <Line type="monotone" dataKey="demand" stroke="#10b981" name="Спрос" />
                  <Line type="monotone" dataKey="stock" stroke="#f59e0b" name="Остаток" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReportViewPage;