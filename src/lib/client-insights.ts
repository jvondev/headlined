'use client';

import { getAllInsights as fetchAllInsights } from './insights';
import type { Insight } from '@/types';

// This is a client-side wrapper to fetch insights for the search index.
// It allows the useSearch hook to remain a client component while fetching
// data from a server component.
// Note: This no longer fetches RSS articles for search indexing to keep it lightweight.
export const getAllInsightsForSearch = async (): Promise<Insight[]> => {
  return await fetchAllInsights();
};

export const getPreferences = () => {
  // Placeholder for preferences, will be implemented later
  return {};
};