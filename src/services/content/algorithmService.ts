
import { ContentItem, isNewsArticle } from '../contentService';
import { WikipediaArticle } from '../wikipediaService';
import { NewsArticle } from '../rssNewsService';
import { getUserInterests } from '../userInterestsService';
import { getWikipediaCategories } from './categoryMapping';
import { getRecommendedContent } from './recommendationService';

export interface ContentDistribution {
  regular: number;
  topicBased: number;
  recommended: number;
  news: number;
}

export const calculateContentDistribution = (totalCount: number, position: number): ContentDistribution => {
  // Every 15-20 posts should be topic-based
  const isTopicPosition = position > 0 && (position % 17 === 0); // Average of 15-20
  
  // News should be 15% but actually distributed
  const newsCount = Math.floor(totalCount * 0.15);
  
  // Recommended content based on saved articles (10%)
  const recommendedCount = Math.floor(totalCount * 0.1);
  
  // Topic-based content when at topic position
  const topicCount = isTopicPosition ? Math.min(2, totalCount * 0.2) : 0;
  
  // Regular content fills the rest
  const regularCount = Math.max(1, totalCount - newsCount - recommendedCount - topicCount);

  return {
    regular: regularCount,
    topicBased: topicCount,
    recommended: recommendedCount,
    news: newsCount
  };
};

export const getAlgorithmicContent = async (
  count: number, 
  userId?: string, 
  position: number = 0
): Promise<ContentItem[]> => {
  const distribution = calculateContentDistribution(count, position);
  
  console.log('Content distribution:', distribution);

  const contentPromises: Promise<ContentItem[]>[] = [];

  // Get news articles
  if (distribution.news > 0) {
    const { getBreakingNews } = await import('../rssNewsService');
    contentPromises.push(
      getBreakingNews(distribution.news + 1).catch(() => [])
    );
  }

  // Get recommended content based on saved articles
  if (distribution.recommended > 0 && userId) {
    contentPromises.push(
      getRecommendedContent(userId, distribution.recommended + 1).catch(() => [])
    );
  }

  // Get topic-based content
  if (distribution.topicBased > 0 && userId) {
    try {
      const interests = await getUserInterests(userId);
      const userTopics = interests.map(interest => interest.topic?.name || '').filter(Boolean);
      
      if (userTopics.length > 0) {
        const { getRandomArticles } = await import('../wikipediaService');
        const wikiCategories = getWikipediaCategories(userTopics);
        const randomCategory = wikiCategories[Math.floor(Math.random() * wikiCategories.length)];
        
        contentPromises.push(
          getRandomArticles(distribution.topicBased + 1, randomCategory).catch(() => [])
        );
      }
    } catch (error) {
      console.error('Error fetching topic-based content:', error);
    }
  }

  // Get regular content
  if (distribution.regular > 0) {
    const { getRandomArticles } = await import('../wikipediaService');
    contentPromises.push(
      getRandomArticles(distribution.regular + 2).catch(() => [])
    );
  }

  try {
    const results = await Promise.all(contentPromises);
    const allContent = results.flat();
    
    // Filter valid content
    const validContent = allContent.filter(item => 
      item.image && !item.image.includes('placeholder')
    );

    // Mix content strategically
    return mixContentStrategically(validContent, distribution);
  } catch (error) {
    console.error('Error in getAlgorithmicContent:', error);
    
    // Fallback to regular content
    const { getRandomArticles } = await import('../wikipediaService');
    const fallback = await getRandomArticles(count).catch(() => []);
    return fallback.slice(0, count);
  }
};

const mixContentStrategically = (
  content: ContentItem[], 
  distribution: ContentDistribution
): ContentItem[] => {
  const news = content.filter(isNewsArticle);
  const wiki = content.filter(item => !isNewsArticle(item));
  
  const mixed: ContentItem[] = [];
  const totalItems = Object.values(distribution).reduce((a, b) => a + b, 0);
  
  // Create positions for news (spread them out)
  const newsPositions = new Set<number>();
  if (news.length > 0 && distribution.news > 0) {
    const spacing = Math.floor(totalItems / (distribution.news + 1));
    for (let i = 0; i < Math.min(distribution.news, news.length); i++) {
      const position = spacing * (i + 1) + Math.floor(Math.random() * Math.max(1, spacing / 2));
      newsPositions.add(Math.min(position, totalItems - 1));
    }
  }
  
  // Fill content with strategic placement
  let newsIndex = 0;
  let wikiIndex = 0;
  
  for (let i = 0; i < totalItems && (newsIndex < news.length || wikiIndex < wiki.length); i++) {
    if (newsPositions.has(i) && newsIndex < news.length) {
      mixed.push(news[newsIndex++]);
    } else if (wikiIndex < wiki.length) {
      mixed.push(wiki[wikiIndex++]);
    }
  }
  
  console.log(`Strategic mix: ${mixed.filter(isNewsArticle).length} news, ${mixed.filter(item => !isNewsArticle(item)).length} wiki`);
  
  return mixed.slice(0, totalItems);
};
