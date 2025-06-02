
import { NewsArticle } from '../rssNewsService';

// Cache to store fetched articles and track views
export const articleCache = new Map<string, NewsArticle>();
export const viewedArticles = new Set<string>();
export const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes
export let lastCacheTime = 0;

export const updateCacheTime = () => {
  lastCacheTime = Date.now();
};

export const isCacheValid = (): boolean => {
  const now = Date.now();
  return now - lastCacheTime < CACHE_DURATION && articleCache.size > 0;
};

export const clearCache = () => {
  articleCache.clear();
  updateCacheTime();
};
