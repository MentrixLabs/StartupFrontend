import client from './client';
import { Report, PaginatedResponse } from './types';

// Получить список отчётов (с пагинацией)
export const getReports = async (
  page: number = 1,
  size: number = 20,
): Promise<PaginatedResponse<Report>> => {
  const response = await client.get<PaginatedResponse<Report>>('/reports', {
    params: { page, size },
  });
  return response.data;
};

// Получить один отчёт по ID
export const getReportById = async (id: string): Promise<Report> => {
  const response = await client.get<Report>(`/reports/${id}`);
  return response.data;
};

// Сгенерировать новый отчёт для товара (запустить комплексную оптимизацию)
export const generateReport = async (goodsId: string): Promise<Report> => {
  const response = await client.post<Report>('/reports/generate', { goods_id: goodsId });
  return response.data;
};

// Скачать отчёт в PDF (если бэкенд умеет отдавать файл)
export const downloadReportPdf = async (reportId: string): Promise<Blob> => {
  const response = await client.get(`/reports/${reportId}/download`, {
    responseType: 'blob',
  });
  return response.data;
};

// Удалить отчёт
export const deleteReport = async (id: string): Promise<void> => {
  await client.delete(`/reports/${id}`);
};