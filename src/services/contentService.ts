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
  
  // Get truly random Wikipedia articles by making multiple separate random requests
  const randomRequests = [];
  const articlesPerRequest = Math.ceil(wikiCount / 3); // Split into 3 separate requests
  
  for (let i = 0; i < 3; i++) {
    randomRequests.push(getWikiArticles(articlesPerRequest + 2)); // Get extra to ensure variety
  }
  
  const [randomBatch1, randomBatch2, randomBatch3, newsArticles] = await Promise.all([
    ...randomRequests.map(req => req.catch(() => [])),
    newsCount > 0 ? getBreakingNews(newsCount).catch(() => []) : Promise.resolve([])
  ]);

  // Combine all random articles and shuffle aggressively
  const allRandomWiki = [...randomBatch1, ...randomBatch2, ...randomBatch3]
    .filter(article => article && article.image && !article.image.includes('placeholder'))
    .sort(() => Math.random() - 0.5) // First shuffle
    .sort(() => Math.random() - 0.5) // Second shuffle
    .sort(() => Math.random() - 0.5); // Third shuffle for maximum randomness

  // Create a completely random selection by picking random indices
  const selectedWiki = [];
  const usedIndices = new Set();
  
  while (selectedWiki.length < wikiCount && selectedWiki.length < allRandomWiki.length) {
    const randomIndex = Math.floor(Math.random() * allRandomWiki.length);
    if (!usedIndices.has(randomIndex)) {
      usedIndices.add(randomIndex);
      selectedWiki.push(allRandomWiki[randomIndex]);
    }
  }

  const mixedContent: ContentItem[] = [];
  
  // Create pools for random selection
  const wikiPool = [...selectedWiki];
  const newsPool = [...newsArticles];

  // Randomly distribute content with no pattern
  const positions = Array.from({ length: count }, (_, i) => i);
  positions.sort(() => Math.random() - 0.5); // Randomize positions

  for (let i = 0; i < count && (wikiPool.length > 0 || newsPool.length > 0); i++) {
    const useNews = newsPool.length > 0 && Math.random() < 0.2;
    
    if (useNews) {
      const randomNewsIndex = Math.floor(Math.random() * newsPool.length);
      const newsItem = newsPool.splice(randomNewsIndex, 1)[0];
      if (newsItem) mixedContent.push(newsItem);
    } else if (wikiPool.length > 0) {
      const randomWikiIndex = Math.floor(Math.random() * wikiPool.length);
      const wikiItem = wikiPool.splice(randomWikiIndex, 1)[0];
      if (wikiItem) mixedContent.push(wikiItem);
    } else if (newsPool.length > 0) {
      const randomNewsIndex = Math.floor(Math.random() * newsPool.length);
      const newsItem = newsPool.splice(randomNewsIndex, 1)[0];
      if (newsItem) mixedContent.push(newsItem);
    }
  }

  // Final aggressive shuffle to ensure no patterns
  const finalContent = mixedContent
    .sort(() => Math.random() - 0.5)
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
