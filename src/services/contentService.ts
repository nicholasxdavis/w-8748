
import { WikipediaArticle, getRandomArticles as getWikiArticles, searchArticles as searchWikiArticles } from './wikipediaService';
import { NewsArticle, getBreakingNews, searchNews } from './newsService';
import { getUserInterests } from './userInterestsService';

export type ContentItem = WikipediaArticle | NewsArticle;

export const isNewsArticle = (item: ContentItem): item is NewsArticle => {
  return 'isBreakingNews' in item;
};

export const getMixedContent = async (count: number = 6, userId?: string): Promise<ContentItem[]> => {
  const wikiCount = Math.ceil(count * 0.7); // 70% wiki content
  const newsCount = Math.floor(count * 0.3); // 30% news content
  
  // For future enhancement: use user interests to personalize content
  let userTopics: string[] = [];
  if (userId) {
    try {
      const interests = await getUserInterests(userId);
      userTopics = interests.map(interest => interest.topic?.name || '').filter(Boolean);
      console.log('User topics for content personalization:', userTopics);
    } catch (error) {
      console.error('Error fetching user interests for content:', error);
      // Continue without personalization
    }
  }

  const [wikiArticles, newsArticles] = await Promise.all([
    getWikiArticles(wikiCount),
    getBreakingNews(newsCount)
  ]);

  // Mix the content randomly
  const mixedContent: ContentItem[] = [];
  let wikiIndex = 0;
  let newsIndex = 0;

  for (let i = 0; i < count; i++) {
    if (Math.random() < 0.3 && newsIndex < newsArticles.length) {
      mixedContent.push(newsArticles[newsIndex++]);
    } else if (wikiIndex < wikiArticles.length) {
      mixedContent.push(wikiArticles[wikiIndex++]);
    } else if (newsIndex < newsArticles.length) {
      mixedContent.push(newsArticles[newsIndex++]);
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

  // Mix search results
  const mixedResults: ContentItem[] = [];
  const maxResults = Math.max(wikiResults.length, newsResults.length);

  for (let i = 0; i < maxResults; i++) {
    if (i < newsResults.length) mixedResults.push(newsResults[i]);
    if (i < wikiResults.length) mixedResults.push(wikiResults[i]);
  }

  return mixedResults.slice(0, 20);
};
