
import { ContentItem } from './contentService';
import { WikipediaArticle, getRandomArticles, searchArticles } from './wikipediaService';
import { getBreakingNews } from './rssNewsService';
import { getRandomFacts } from './factsService';
import { getUserInterests } from './userInterestsService';
import { getUserPreferences, getContentFilters, getUserContentScore, recordUserAction } from './userPreferencesService';
import { getPopularContent, updateContentPopularity } from './popularityService';
import { getWikipediaCategories } from './content/categoryMapping';

export interface AlgorithmConfig {
  userId?: string;
  count: number;
  includePopular: boolean;
  includeRelated: boolean;
  respectFilters: boolean;
}

export interface ContentScore {
  item: ContentItem;
  score: number;
  reason: string;
}

export const getAlgorithmicFeed = async (config: AlgorithmConfig): Promise<ContentItem[]> => {
  const { userId, count, includePopular, includeRelated, respectFilters } = config;
  
  console.log('Generating algorithmic feed with config:', config);

  try {
    // Get user data if available
    let userPreferences: any[] = [];
    let contentFilters: any[] = [];
    let userInterests: any[] = [];
    
    if (userId) {
      [userPreferences, contentFilters, userInterests] = await Promise.all([
        getUserPreferences(userId),
        getContentFilters(userId),
        getUserInterests(userId)
      ]);
    }

    // Calculate content distribution based on user preferences
    const distribution = calculateSmartDistribution(count, userPreferences, contentFilters);
    console.log('Content distribution:', distribution);

    // Fetch different types of content
    const [wikiArticles, newsArticles, facts, popularContent] = await Promise.all([
      getRandomArticles(distribution.wiki + 5), // Get extra for filtering
      getBreakingNews(distribution.news + 2),
      getRandomFacts(distribution.facts),
      includePopular ? getPopularContent('wiki', 5) : Promise.resolve([])
    ]);

    // Get related content based on user interests
    let relatedContent: WikipediaArticle[] = [];
    if (includeRelated && userInterests.length > 0) {
      const userTopics = userInterests.map(i => i.topic?.name || '').filter(Boolean);
      const categories = getWikipediaCategories(userTopics);
      
      if (categories.length > 0) {
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        relatedContent = await getRandomArticles(distribution.related, randomCategory);
      }
    }

    // Score and rank all content
    const scoredContent: ContentScore[] = [];
    
    // Score Wiki articles
    wikiArticles.forEach(article => {
      const baseScore = 0.5;
      const userScore = userId ? getUserContentScore(userPreferences, 'wiki', article.extract?.split(' ')[0]) : 0.5;
      const popularityBonus = popularContent.find(p => p.content_id === article.id.toString()) ? 0.2 : 0;
      
      scoredContent.push({
        item: article,
        score: (baseScore + userScore + popularityBonus) / 2,
        reason: 'wiki'
      });
    });

    // Score News articles
    newsArticles.forEach(article => {
      if (respectFilters && contentFilters.some(f => f.content_type === 'news' && f.blocked)) {
        return; // Skip if user blocked news
      }
      
      const baseScore = 0.7; // News gets higher base score for recency
      const userScore = userId ? getUserContentScore(userPreferences, 'news') : 0.5;
      
      scoredContent.push({
        item: article,
        score: (baseScore + userScore) / 2,
        reason: 'news'
      });
    });

    // Score Facts
    facts.forEach(fact => {
      if (respectFilters && contentFilters.some(f => f.content_type === 'facts' && f.blocked)) {
        return;
      }
      
      const baseScore = 0.6;
      const userScore = userId ? getUserContentScore(userPreferences, 'facts') : 0.5;
      
      scoredContent.push({
        item: fact,
        score: (baseScore + userScore) / 2,
        reason: 'fact'
      });
    });

    // Score Related content higher
    relatedContent.forEach(article => {
      const baseScore = 0.8; // Higher for personalized content
      const userScore = userId ? getUserContentScore(userPreferences, 'wiki') : 0.5;
      
      scoredContent.push({
        item: article,
        score: (baseScore + userScore) / 2,
        reason: 'related'
      });
    });

    // Sort by score and take top items
    const finalContent = scoredContent
      .sort((a, b) => b.score - a.score)
      .slice(0, count)
      .map(scored => scored.item)
      .filter(item => item.image && !item.image.includes('placeholder'));

    console.log(`Generated ${finalContent.length} algorithmic content items`);
    return finalContent;

  } catch (error) {
    console.error('Error in algorithmic feed generation:', error);
    // Fallback to basic content
    const fallback = await getRandomArticles(count);
    return fallback.slice(0, count);
  }
};

const calculateSmartDistribution = (
  totalCount: number, 
  userPreferences: any[], 
  contentFilters: any[]
): { wiki: number; news: number; facts: number; related: number } => {
  
  // Default distribution
  let distribution = {
    wiki: Math.floor(totalCount * 0.5),
    news: Math.floor(totalCount * 0.3),
    facts: Math.floor(totalCount * 0.1),
    related: Math.floor(totalCount * 0.1)
  };

  // Adjust based on user preferences
  if (userPreferences.length > 0) {
    const contentTypeCounts = userPreferences.reduce((acc, pref) => {
      if (pref.action === 'like' || pref.action === 'save') {
        acc[pref.content_type] = (acc[pref.content_type] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const totalLikes = Object.values(contentTypeCounts).reduce((sum, count) => sum + count, 0);
    
    if (totalLikes > 0) {
      // Redistribute based on user preferences
      const wikiRatio = (contentTypeCounts.wiki || 0) / totalLikes;
      const newsRatio = (contentTypeCounts.news || 0) / totalLikes;
      const factsRatio = (contentTypeCounts.facts || 0) / totalLikes;
      
      distribution.wiki = Math.max(1, Math.floor(totalCount * Math.max(0.3, wikiRatio)));
      distribution.news = Math.max(1, Math.floor(totalCount * Math.max(0.1, newsRatio)));
      distribution.facts = Math.max(0, Math.floor(totalCount * Math.max(0.05, factsRatio)));
      distribution.related = Math.max(1, totalCount - distribution.wiki - distribution.news - distribution.facts);
    }
  }

  // Apply content filters
  contentFilters.forEach(filter => {
    if (filter.blocked) {
      switch (filter.content_type) {
        case 'news':
          distribution.wiki += distribution.news;
          distribution.news = 0;
          break;
        case 'facts':
          distribution.wiki += distribution.facts;
          distribution.facts = 0;
          break;
      }
    }
  });

  return distribution;
};

// Helper function to track user interactions
export const trackUserInteraction = async (
  userId: string,
  contentItem: ContentItem,
  action: 'view' | 'like' | 'save' | 'share' | 'never_show'
): Promise<void> => {
  if (!userId) return;

  const contentType = getContentType(contentItem);
  const contentId = contentItem.id.toString();
  const contentTitle = contentItem.title;
  
  // Record user preference
  await recordUserAction(userId, contentType, action, contentId, contentTitle);
  
  // Update popularity if positive action
  if (['like', 'save', 'share'].includes(action)) {
    await updateContentPopularity(contentId, contentType, contentTitle, action as any);
  }
};

const getContentType = (item: ContentItem): any => {
  if ('isBreakingNews' in item) return 'news';
  if ('type' in item) {
    switch (item.type) {
      case 'fact': return 'facts';
      case 'quote': return 'quotes';
      case 'movie':
      case 'tvshow': return 'movies';
      case 'song':
      case 'album': return 'music';
      case 'stock': return 'stocks';
      case 'weather': return 'weather';
      case 'history': return 'history';
      case 'featured-picture': return 'featured-picture';
    }
  }
  return 'wiki';
};
