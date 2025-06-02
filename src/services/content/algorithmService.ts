
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
  const isTopicPosition = position > 0 && (position % 17 === 0);
  
  // News should be 20% and actually guaranteed
  const newsCount = Math.max(1, Math.floor(totalCount * 0.20));
  
  // Recommended content based on saved articles (10%)
  const recommendedCount = Math.floor(totalCount * 0.1);
  
  // Topic-based content when at topic position
  const topicCount = isTopicPosition ? Math.min(2, Math.floor(totalCount * 0.2)) : 0;
  
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

  try {
    // Always fetch news first to ensure we get them
    const { getBreakingNews } = await import('../rssNewsService');
    const newsArticles = await getBreakingNews(distribution.news + 3).catch(error => {
      console.error('Failed to fetch news:', error);
      return [];
    });
    
    console.log(`Fetched ${newsArticles.length} news articles`);

    // Get regular content
    const { getRandomArticles } = await import('../wikipediaService');
    const regularArticles = await getRandomArticles(distribution.regular + 2).catch(() => []);

    // Get recommended content if user exists
    let recommendedArticles: WikipediaArticle[] = [];
    if (distribution.recommended > 0 && userId) {
      recommendedArticles = await getRecommendedContent(userId, distribution.recommended + 1).catch(() => []);
    }

    // Get topic-based content if needed
    let topicArticles: WikipediaArticle[] = [];
    if (distribution.topicBased > 0 && userId) {
      try {
        const interests = await getUserInterests(userId);
        const userTopics = interests.map(interest => interest.topic?.name || '').filter(Boolean);
        
        if (userTopics.length > 0) {
          const wikiCategories = getWikipediaCategories(userTopics);
          const randomCategory = wikiCategories[Math.floor(Math.random() * wikiCategories.length)];
          topicArticles = await getRandomArticles(distribution.topicBased + 1, randomCategory).catch(() => []);
        }
      } catch (error) {
        console.error('Error fetching topic-based content:', error);
      }
    }

    // Combine all content
    const allContent = [
      ...newsArticles.slice(0, distribution.news),
      ...regularArticles.slice(0, distribution.regular),
      ...recommendedArticles.slice(0, distribution.recommended),
      ...topicArticles.slice(0, distribution.topicBased)
    ];
    
    // Filter valid content
    const validContent = allContent.filter(item => 
      item.image && !item.image.includes('placeholder')
    );

    console.log(`Valid content breakdown: ${validContent.filter(isNewsArticle).length} news, ${validContent.filter(item => !isNewsArticle(item)).length} wiki`);

    // Mix content strategically to ensure news is distributed
    return mixContentStrategically(validContent, distribution, count);
    
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
  distribution: ContentDistribution,
  targetCount: number
): ContentItem[] => {
  const news = content.filter(isNewsArticle);
  const wiki = content.filter(item => !isNewsArticle(item));
  
  console.log(`Mixing: ${news.length} news articles available, need ${distribution.news}`);
  
  const mixed: ContentItem[] = [];
  
  // Ensure we have news articles to place
  if (news.length === 0 || distribution.news === 0) {
    // If no news, just return wiki articles
    return wiki.slice(0, targetCount);
  }
  
  // Calculate positions for news articles (spread them evenly)
  const newsPositions = new Set<number>();
  const spacing = Math.floor(targetCount / distribution.news);
  
  for (let i = 0; i < Math.min(distribution.news, news.length); i++) {
    const position = (i + 1) * spacing - 1;
    if (position < targetCount) {
      newsPositions.add(position);
    }
  }
  
  console.log('News positions:', Array.from(newsPositions));
  
  // Fill content array
  let newsIndex = 0;
  let wikiIndex = 0;
  
  for (let i = 0; i < targetCount && (newsIndex < news.length || wikiIndex < wiki.length); i++) {
    if (newsPositions.has(i) && newsIndex < news.length) {
      mixed.push(news[newsIndex++]);
      console.log(`Placed news at position ${i}: ${news[newsIndex-1]?.title?.substring(0, 50)}`);
    } else if (wikiIndex < wiki.length) {
      mixed.push(wiki[wikiIndex++]);
    } else if (newsIndex < news.length) {
      // Fill remaining with news if wiki is exhausted
      mixed.push(news[newsIndex++]);
    }
  }
  
  console.log(`Final strategic mix: ${mixed.filter(isNewsArticle).length} news, ${mixed.filter(item => !isNewsArticle(item)).length} wiki out of ${mixed.length} total`);
  
  return mixed.slice(0, targetCount);
};
