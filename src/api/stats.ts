import client from './client';

export interface WeeklyActivityItem {
  day: string;
  seo: number;
  infographics: number;
}

export interface ContentDistribution {
  seo: number;
  infographics: number;
  reports: number;
}

export interface Recommendation {
  target_seo: number;
  target_infographics: number;
}

export const getWeeklyActivity = async (): Promise<WeeklyActivityItem[]> => {
  const response = await client.get('/stats/weekly-activity');
  return response.data;
};

export const getContentDistribution = async (): Promise<ContentDistribution> => {
  const response = await client.get('/stats/content-distribution');
  return response.data;
};

export const getRecommendation = async (): Promise<Recommendation> => {
  const response = await client.get('/stats/recommendation');
  return response.data;
};