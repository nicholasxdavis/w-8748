
import { WikipediaArticle, getRandomArticles as getWikiArticles, searchArticles as searchWikiArticles } from './wikipediaService';
import { NewsArticle, getBreakingNews, searchNews } from './newsService';
import { contentCache } from './contentCache';

export type ContentItem = WikipediaArticle | NewsArticle;

export const isNewsArticle = (item: ContentItem): item is NewsArticle => {
  return 'isBreakingNews' in item;
};

export const getMixedContent = async (count: number = 10): Promise<ContentItem[]> => {
  const targetWikiCount = Math.ceil(count * 0.7); // 70% wiki content
  const targetNewsCount = Math.floor(count * 0.3); // 30% news content
  
  // Simple fetch strategy - just get random content
  const fetchMultiplier = 3;
  
  const [wikiArticles, newsArticles] = await Promise.all([
    getWikiArticles(targetWikiCount * fetchMultiplier),
    getBreakingNews(targetNewsCount * fetchMultiplier)
  ]);

  // Filter out cached content
  const freshWikiArticles = contentCache.filterUncached(wikiArticles);
  const freshNewsArticles = contentCache.filterUncached(newsArticles);
  
  // If we have very few fresh articles, clear part of the cache
  if (freshWikiArticles.length < targetWikiCount * 0.3 || freshNewsArticles.length < targetNewsCount * 0.3) {
    console.log("Low fresh content, clearing some cache");
    contentCache.clearCache();
    
    // Retry with fresh cache
    const [retryWikiArticles, retryNewsArticles] = await Promise.all([
      getWikiArticles(targetWikiCount * 2),
      getBreakingNews(targetNewsCount * 2)
    ]);
    
    return [...retryWikiArticles.slice(0, targetWikiCount), ...retryNewsArticles.slice(0, targetNewsCount)]
      .sort(() => 0.5 - Math.random())
      .slice(0, count);
  }

  // Add successful fetches to cache
  freshWikiArticles.slice(0, targetWikiCount).forEach(article => {
    contentCache.addToCache(String(article.id), 'wiki');
  });
  
  freshNewsArticles.slice(0, targetNewsCount).forEach(article => {
    contentCache.addToCache(String(article.id), 'news');
  });

  // Simple mixing - alternate between wiki and news
  const mixedContent: ContentItem[] = [];
  const selectedWiki = freshWikiArticles.slice(0, targetWikiCount);
  const selectedNews = freshNewsArticles.slice(0, targetNewsCount);
  
  let wikiIndex = 0;
  let newsIndex = 0;

  for (let i = 0; i < count; i++) {
    if (i % 3 === 0 && newsIndex < selectedNews.length) {
      // Every 3rd item is news if available
      mixedContent.push(selectedNews[newsIndex++]);
    } else if (wikiIndex < selectedWiki.length) {
      mixedContent.push(selectedWiki[wikiIndex++]);
    } else if (newsIndex < selectedNews.length) {
      mixedContent.push(selectedNews[newsIndex++]);
    }
  }

  return mixedContent;
};

export const searchMixedContent = async (query: string): Promise<ContentItem[]> => {
  if (!query || query.length < 3) return [];

  const [wikiResults, newsResults] = await Promise.all([
    searchWikiArticles(query),
    searchNews(query)
  ]);

  // Mix search results (don't filter search results by cache)
  const mixedResults: ContentItem[] = [];
  const maxResults = Math.max(wikiResults.length, newsResults.length);

  for (let i = 0; i < maxResults; i++) {
    if (i < newsResults.length) mixedResults.push(newsResults[i]);
    if (i < wikiResults.length) mixedResults.push(wikiResults[i]);
  }

  return mixedResults.slice(0, 20);
};
