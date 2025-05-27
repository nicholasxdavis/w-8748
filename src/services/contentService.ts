import { WikipediaArticle, getRandomArticles as getWikiArticles, searchArticles as searchWikiArticles } from './wikipediaService';
import { NewsArticle, getBreakingNews, searchNews } from './newsService';
import { DidYouKnowFact, getRandomFacts } from './factsService';
import { getUserInterests } from './userInterestsService';

export type ContentItem = WikipediaArticle | NewsArticle | DidYouKnowFact;

export const isNewsArticle = (item: ContentItem): item is NewsArticle => {
  return 'isBreakingNews' in item;
};

export const isDidYouKnowFact = (item: ContentItem): item is DidYouKnowFact => {
  return 'type' in item && item.type === 'fact';
};

// Cache for personalized content to reduce API calls
const personalizedContentCache = new Map<string, { content: WikipediaArticle[], timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper function to get personalized content based on user interests
const getPersonalizedContent = async (userTopics: string[], count: number): Promise<WikipediaArticle[]> => {
  if (!userTopics.length) return [];

  // Check cache first
  const cacheKey = userTopics.join(',');
  const cached = personalizedContentCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('Using cached personalized content');
    return cached.content.slice(0, count);
  }

  console.log('Fetching fresh personalized content for topics:', userTopics);
  
  const personalizedArticles: WikipediaArticle[] = [];
  const articlesPerTopic = Math.ceil(count * 1.5 / userTopics.length); // Get extra to filter out invalid ones

  // Fetch articles for each topic in parallel
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
  
  // Flatten and shuffle the results
  const allTopicArticles = topicResults.flat();
  const shuffled = allTopicArticles.sort(() => Math.random() - 0.5);
  personalizedArticles.push(...shuffled.slice(0, count));

  // Cache the results
  personalizedContentCache.set(cacheKey, {
    content: personalizedArticles,
    timestamp: Date.now()
  });

  return personalizedArticles;
};

export const getMixedContent = async (count: number = 8, userId?: string): Promise<ContentItem[]> => {
  const personalizedCount = Math.ceil(count * 0.4); // 40% personalized content
  const randomWikiCount = Math.ceil(count * 0.3); // 30% random wiki content  
  const newsCount = Math.ceil(count * 0.2); // 20% news content
  const factsCount = Math.ceil(count * 0.1); // 10% did you know facts
  
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

  // Fetch all content types in parallel for better performance
  const [randomWikiArticles, newsArticles, facts] = await Promise.all([
    getWikiArticles(remainingWikiCount).catch(error => {
      console.error('Error fetching random wiki articles:', error);
      return [];
    }),
    getBreakingNews(newsCount).catch(error => {
      console.error('Error fetching news:', error);
      return [];
    }),
    getRandomFacts(factsCount).catch(error => {
      console.error('Error fetching facts:', error);
      return [];
    })
  ]);

  // Combine all content
  const allWikiArticles = [...personalizedArticles, ...randomWikiArticles];
  
  // Create a more sophisticated mix algorithm
  const mixedContent: ContentItem[] = [];
  const contentPools = {
    wiki: [...allWikiArticles],
    news: [...newsArticles],
    facts: [...facts]
  };

  // Interleave content types for better variety
  for (let i = 0; i < count && (contentPools.wiki.length > 0 || contentPools.news.length > 0 || contentPools.facts.length > 0); i++) {
    let contentType: 'wiki' | 'news' | 'facts';
    
    // Every 6th item should be a fact if available
    if (i % 6 === 0 && contentPools.facts.length > 0) {
      contentType = 'facts';
    }
    // Every 4th item should be news if available
    else if (i % 4 === 0 && contentPools.news.length > 0) {
      contentType = 'news';
    } else if (contentPools.wiki.length > 0) {
      contentType = 'wiki';
    } else if (contentPools.news.length > 0) {
      contentType = 'news';
    } else if (contentPools.facts.length > 0) {
      contentType = 'facts';
    } else {
      break;
    }

    const item = contentPools[contentType].shift();
    if (item) {
      mixedContent.push(item);
    }
  }

  const finalContent = mixedContent.filter(item => item.image && !item.image.includes('placeholder'));

  console.log(`Mixed content generated: ${finalContent.length} total (${personalizedArticles.length} personalized, ${randomWikiArticles.length} random wiki, ${newsArticles.filter(article => finalContent.includes(article)).length} news, ${facts.filter(fact => finalContent.includes(fact)).length} facts)`);
  
  return finalContent;
};

export const searchMixedContent = async (query: string): Promise<ContentItem[]> => {
  if (!query || query.length < 3) return [];

  // Parallel search for better performance
  const [wikiResults, newsResults, facts] = await Promise.all([
    searchWikiArticles(query).catch(error => {
      console.error('Error searching wiki articles:', error);
      return [];
    }),
    searchNews(query).catch(error => {
      console.error('Error searching news:', error);
      return [];
    }),
    getRandomFacts(5).catch(error => {
      console.error('Error fetching facts:', error);
      return [];
    })
  ]);

  // Interleave search results with preference for relevance
  const mixedResults: ContentItem[] = [];
  const maxResults = Math.max(wikiResults.length, newsResults.length, facts.length);

  for (let i = 0; i < maxResults && mixedResults.length < 20; i++) {
    // Prioritize news for current events
    if (i < newsResults.length) mixedResults.push(newsResults[i]);
    if (i < wikiResults.length && mixedResults.length < 20) mixedResults.push(wikiResults[i]);
    if (i < facts.length && mixedResults.length < 20) mixedResults.push(facts[i]);
  }

  return mixedResults.filter(item => item.image && !item.image.includes('placeholder'));
};

// Clean up old cache entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of personalizedContentCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      personalizedContentCache.delete(key);
    }
  }
}, CACHE_DURATION);
