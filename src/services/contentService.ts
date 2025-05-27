
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
  
  // Fetch with a smart strategy: 60% popular, 40% random for variety
  const popularCount = Math.ceil(targetWikiCount * 0.6);
  const randomCount = targetWikiCount - popularCount;
  
  // Fetch more content than needed to filter out cached items
  const fetchMultiplier = 4;
  
  const [popularWikiArticles, randomWikiArticles, newsArticles] = await Promise.all([
    getWikiArticles(popularCount * fetchMultiplier, "popular"),
    getWikiArticles(randomCount * fetchMultiplier, "random"), 
    getBreakingNews(targetNewsCount * fetchMultiplier)
  ]);

  // Combine wiki content with popular content appearing first
  const allWikiArticles = [...popularWikiArticles, ...randomWikiArticles];

  // Filter out cached content
  const freshWikiArticles = contentCache.filterUncached(allWikiArticles);
  const freshNewsArticles = contentCache.filterUncached(newsArticles);
  
  // If we have very few fresh articles, clear part of the cache
  if (freshWikiArticles.length < targetWikiCount * 0.3 || freshNewsArticles.length < targetNewsCount * 0.3) {
    console.log("Low fresh content, clearing some cache");
    contentCache.clearCache();
    
    // Retry with fresh cache
    const [retryWikiArticles, retryNewsArticles] = await Promise.all([
      getWikiArticles(targetWikiCount * 2, "mixed"),
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

  // Mix the content with bias toward popular content appearing earlier
  const mixedContent: ContentItem[] = [];
  let wikiIndex = 0;
  let newsIndex = 0;

  for (let i = 0; i < count; i++) {
    // 30% chance for news, but prioritize popular wiki content
    const shouldAddNews = Math.random() < 0.3 && newsIndex < freshNewsArticles.length;
    
    if (shouldAddNews) {
      mixedContent.push(freshNewsArticles[newsIndex++]);
    } else if (wikiIndex < freshWikiArticles.length) {
      mixedContent.push(freshWikiArticles[wikiIndex++]);
    } else if (newsIndex < freshNewsArticles.length) {
      mixedContent.push(freshNewsArticles[newsIndex++]);
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
