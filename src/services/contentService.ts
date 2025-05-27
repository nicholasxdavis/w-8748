
import { WikipediaArticle, getRandomArticles as getWikiArticles, searchArticles as searchWikiArticles } from './wikipediaService';
import { NewsArticle, getBreakingNews, searchNews } from './newsService';
import { getUserInterests } from './userInterestsService';

export type ContentItem = WikipediaArticle | NewsArticle;

export const isNewsArticle = (item: ContentItem): item is NewsArticle => {
  return 'isBreakingNews' in item;
};

// Helper function to get personalized content based on user interests
const getPersonalizedContent = async (userTopics: string[], count: number): Promise<WikipediaArticle[]> => {
  if (!userTopics.length) return [];

  console.log('Fetching personalized content for topics:', userTopics);
  
  const personalizedArticles: WikipediaArticle[] = [];
  const articlesPerTopic = Math.ceil(count / userTopics.length);

  for (const topic of userTopics) {
    try {
      // Search for articles related to user's interests
      const topicArticles = await searchWikiArticles(topic);
      personalizedArticles.push(...topicArticles.slice(0, articlesPerTopic));
    } catch (error) {
      console.error(`Error fetching articles for topic ${topic}:`, error);
    }
  }

  return personalizedArticles.slice(0, count);
};

export const getMixedContent = async (count: number = 6, userId?: string): Promise<ContentItem[]> => {
  const personalizedCount = Math.ceil(count * 0.4); // 40% personalized content
  const randomWikiCount = Math.ceil(count * 0.4); // 40% random wiki content  
  const newsCount = Math.floor(count * 0.2); // 20% news content
  
  let userTopics: string[] = [];
  let personalizedArticles: WikipediaArticle[] = [];

  // Fetch user interests for personalization
  if (userId) {
    try {
      const interests = await getUserInterests(userId);
      userTopics = interests.map(interest => interest.topic?.name || '').filter(Boolean);
      console.log('User topics for content personalization:', userTopics);
      
      if (userTopics.length > 0) {
        personalizedArticles = await getPersonalizedContent(userTopics, personalizedCount);
        console.log('Fetched personalized articles:', personalizedArticles.length);
      }
    } catch (error) {
      console.error('Error fetching user interests for content:', error);
    }
  }

  // Fill remaining slots with random content
  const remainingWikiCount = Math.max(0, randomWikiCount + (personalizedCount - personalizedArticles.length));

  const [randomWikiArticles, newsArticles] = await Promise.all([
    getWikiArticles(remainingWikiCount),
    getBreakingNews(newsCount)
  ]);

  // Combine all content
  const allWikiArticles = [...personalizedArticles, ...randomWikiArticles];
  
  // Mix the content randomly but ensure variety
  const mixedContent: ContentItem[] = [];
  let wikiIndex = 0;
  let newsIndex = 0;

  for (let i = 0; i < count; i++) {
    // Alternate between content types for variety
    if (i % 5 === 0 && newsIndex < newsArticles.length) {
      mixedContent.push(newsArticles[newsIndex++]);
    } else if (wikiIndex < allWikiArticles.length) {
      mixedContent.push(allWikiArticles[wikiIndex++]);
    } else if (newsIndex < newsArticles.length) {
      mixedContent.push(newsArticles[newsIndex++]);
    }
  }

  console.log(`Mixed content generated: ${mixedContent.length} total (${personalizedArticles.length} personalized, ${randomWikiArticles.length} random wiki, ${newsArticles.filter((_, i) => i < newsIndex).length} news)`);
  
  return mixedContent.filter(item => item.image);
};

export const searchMixedContent = async (query: string): Promise<ContentItem[]> => {
  if (!query || query.length < 3) return [];

  const [wikiResults, newsResults] = await Promise.all([
    searchWikiArticles(query),
    searchNews(query)
  ]);

  // Mix search results with preference for more relevant content
  const mixedResults: ContentItem[] = [];
  const maxResults = Math.max(wikiResults.length, newsResults.length);

  for (let i = 0; i < maxResults; i++) {
    if (i < newsResults.length) mixedResults.push(newsResults[i]);
    if (i < wikiResults.length) mixedResults.push(wikiResults[i]);
  }

  return mixedResults.slice(0, 20);
};
