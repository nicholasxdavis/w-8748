
import { WikipediaArticle, getRandomArticles as getWikiArticles, searchArticles as searchWikiArticles } from './wikipediaService';
import { NewsArticle, getBreakingNews, searchNews } from './newsService';
import { getUserInterests } from './userInterestsService';

export type ContentItem = WikipediaArticle | NewsArticle;

export const isNewsArticle = (item: ContentItem): item is NewsArticle => {
  return 'isBreakingNews' in item;
};

export const getMixedContent = async (count: number = 8, userId?: string): Promise<ContentItem[]> => {
  // 20% chance to show 1 news article
  const newsCount = Math.random() < 0.2 ? 1 : 0;
  const wikiCount = count - newsCount;
  
  // Get completely random Wikipedia articles - no personalization to avoid related content
  const [randomWikiArticles, newsArticles] = await Promise.all([
    getWikiArticles(wikiCount * 2).catch(() => []), // Get more than needed to ensure variety
    newsCount > 0 ? getBreakingNews(newsCount).catch(() => []) : Promise.resolve([])
  ]);

  // Shuffle Wikipedia articles multiple times to ensure randomness
  const shuffledWiki = randomWikiArticles
    .sort(() => Math.random() - 0.5)
    .sort(() => Math.random() - 0.5)
    .slice(0, wikiCount);

  const mixedContent: ContentItem[] = [];
  
  // Create pools for random selection
  const wikiPool = [...shuffledWiki];
  const newsPool = [...newsArticles];

  // Randomly distribute content
  for (let i = 0; i < count && (wikiPool.length > 0 || newsPool.length > 0); i++) {
    const useNews = newsPool.length > 0 && Math.random() < 0.2;
    
    if (useNews) {
      const newsItem = newsPool.shift();
      if (newsItem) mixedContent.push(newsItem);
    } else if (wikiPool.length > 0) {
      const wikiItem = wikiPool.shift();
      if (wikiItem) mixedContent.push(wikiItem);
    } else if (newsPool.length > 0) {
      const newsItem = newsPool.shift();
      if (newsItem) mixedContent.push(newsItem);
    }
  }

  // Final shuffle to ensure completely random order
  const finalContent = mixedContent
    .sort(() => Math.random() - 0.5)
    .sort(() => Math.random() - 0.5);

  return finalContent.filter(item => item.image && !item.image.includes('placeholder'));
};

export const searchMixedContent = async (query: string): Promise<ContentItem[]> => {
  if (!query || query.length < 3) return [];

  const [wikiResults, newsResults] = await Promise.all([
    searchWikiArticles(query).catch(() => []),
    searchNews(query).catch(() => [])
  ]);

  const mixedResults: ContentItem[] = [];
  const maxResults = Math.max(wikiResults.length, newsResults.length);

  // Prioritize Wikipedia results over news in search
  for (let i = 0; i < maxResults && mixedResults.length < 20; i++) {
    if (i < wikiResults.length) mixedResults.push(wikiResults[i]);
    if (i < newsResults.length && mixedResults.length < 20 && i % 3 === 0) {
      mixedResults.push(newsResults[i]);
    }
  }

  return mixedResults.filter(item => item.image && !item.image.includes('placeholder'));
};
