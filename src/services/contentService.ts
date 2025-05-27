
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
  
  // Fetch more content than needed to filter out cached items
  const fetchMultiplier = 3;
  
  const [wikiArticles, newsArticles] = await Promise.all([
    getWikiArticles(targetWikiCount * fetchMultiplier),
    getBreakingNews(targetNewsCount * fetchMultiplier)
  ]);

  // Filter out cached content
  const freshWikiArticles = contentCache.filterUncached(wikiArticles);
  const freshNewsArticles = contentCache.filterUncached(newsArticles);
  
  // If we have very few fresh articles, clear part of the cache
  if (freshWikiArticles.length < targetWikiCount * 0.5 || freshNewsArticles.length < targetNewsCount * 0.5) {
    console.log("Very few fresh articles available, clearing cache");
    contentCache.clearCache();
  }

  // Add successful fetches to cache
  freshWikiArticles.slice(0, targetWikiCount).forEach(article => {
    contentCache.addToCache(String(article.id), 'wiki');
  });
  
  freshNewsArticles.slice(0, targetNewsCount).forEach(article => {
    contentCache.addToCache(String(article.id), 'news');
  });

  // Mix the content randomly
  const mixedContent: ContentItem[] = [];
  let wikiIndex = 0;
  let newsIndex = 0;

  for (let i = 0; i < count; i++) {
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
