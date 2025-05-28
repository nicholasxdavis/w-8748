
import { WikipediaArticle, getRandomArticles as getWikiArticles, searchArticles as searchWikiArticles } from './wikipediaService';
import { NewsArticle, getBreakingNews, searchNews } from './newsService';
import { getUserInterests } from './userInterestsService';

export type ContentItem = WikipediaArticle | NewsArticle;

export const isNewsArticle = (item: ContentItem): item is NewsArticle => {
  return 'isBreakingNews' in item;
};

const personalizedContentCache = new Map<string, { content: WikipediaArticle[], timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getPersonalizedContent = async (userTopics: string[], count: number): Promise<WikipediaArticle[]> => {
  if (!userTopics.length) return [];

  const cacheKey = userTopics.join(',');
  const cached = personalizedContentCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.content.slice(0, count);
  }

  const personalizedArticles: WikipediaArticle[] = [];
  const articlesPerTopic = Math.ceil(count * 1.5 / userTopics.length);

  const topicPromises = userTopics.map(async (topic) => {
    try {
      const topicArticles = await searchWikiArticles(topic);
      return topicArticles.slice(0, articlesPerTopic);
    } catch (error) {
      console.error(`Error fetching articles for topic ${topic}:`, error);
      return [];
    }
  });

  const topicResults = await Promise.all(topicPromises);
  const allTopicArticles = topicResults.flat();
  const shuffled = allTopicArticles.sort(() => Math.random() - 0.5);
  personalizedArticles.push(...shuffled.slice(0, count));

  personalizedContentCache.set(cacheKey, {
    content: personalizedArticles,
    timestamp: Date.now()
  });

  return personalizedArticles;
};

export const getMixedContent = async (count: number = 8, userId?: string): Promise<ContentItem[]> => {
  // Reduced to 20% chance: only 1 news article per 10 content items max
  const personalizedCount = Math.ceil(count * 0.7);
  const randomWikiCount = Math.ceil(count * 0.3);
  const newsCount = Math.random() < 0.2 ? 1 : 0; // 20% chance to show 1 news article
  
  let userTopics: string[] = [];
  let personalizedArticles: WikipediaArticle[] = [];

  if (userId) {
    try {
      const interests = await getUserInterests(userId);
      userTopics = interests.map(interest => interest.topic?.name || '').filter(Boolean);
      
      if (userTopics.length > 0) {
        personalizedArticles = await getPersonalizedContent(userTopics, personalizedCount);
      }
    } catch (error) {
      console.error('Error fetching user interests for content:', error);
    }
  }

  const remainingWikiCount = Math.max(0, randomWikiCount + (personalizedCount - personalizedArticles.length));

  const [randomWikiArticles, newsArticles] = await Promise.all([
    getWikiArticles(remainingWikiCount).catch(() => []),
    newsCount > 0 ? getBreakingNews(newsCount).catch(() => []) : Promise.resolve([])
  ]);

  const allWikiArticles = [...personalizedArticles, ...randomWikiArticles];
  const mixedContent: ContentItem[] = [];
  const contentPools = { wiki: [...allWikiArticles], news: [...newsArticles] };

  // Only show news if we have any and randomly (20% chance)
  for (let i = 0; i < count && (contentPools.wiki.length > 0 || contentPools.news.length > 0); i++) {
    let contentType: 'wiki' | 'news';
    
    // Show news only if available and at random positions
    if (contentPools.news.length > 0 && Math.random() < 0.2) {
      contentType = 'news';
    } else if (contentPools.wiki.length > 0) {
      contentType = 'wiki';
    } else if (contentPools.news.length > 0) {
      contentType = 'news';
    } else {
      break;
    }

    const item = contentPools[contentType].shift();
    if (item) mixedContent.push(item);
  }

  return mixedContent.filter(item => item.image && !item.image.includes('placeholder'));
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

// Cache cleanup
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of personalizedContentCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      personalizedContentCache.delete(key);
    }
  }
}, CACHE_DURATION);
