
import { RSS_FEEDS } from './news/rssFeedConfig';
import { articleCache, viewedArticles, isCacheValid, clearCache, updateCacheTime } from './news/newsCache';
import { parseRSSFeed } from './news/rssFeedParser';
import { removeDuplicateArticles } from './news/articleProcessor';
import { getFallbackNews } from './news/fallbackNews';
import { getRandomizedArticles } from './news/articleRandomizer';

export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  image: string;
  publishedAt: string;
  source: string;
  url: string;
  readTime: number;
  views: number;
  isBreakingNews: true;
  lastShown?: string;
}

export const getBreakingNews = async (count: number = 5): Promise<NewsArticle[]> => {
  try {
    if (isCacheValid()) {
      console.log('Using cached news articles');
      const cachedArticles = Array.from(articleCache.values());
      return getRandomizedArticles(cachedArticles, count);
    }
    
    console.log('Fetching fresh breaking news from RSS feeds...');
    
    const feedPromises = RSS_FEEDS.map(feed => 
      Promise.race([
        parseRSSFeed(feed.url, feed.name),
        new Promise<NewsArticle[]>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 10000)
        )
      ]).catch(error => {
        console.error(`Failed to fetch from ${feed.name}:`, error);
        return [];
      })
    );
    
    const allResults = await Promise.all(feedPromises);
    const allArticles = allResults.flat();
    
    console.log(`Total articles fetched: ${allArticles.length}`);
    
    if (allArticles.length === 0) {
      console.log('No articles fetched, returning fallback news');
      return getFallbackNews(count);
    }
    
    const uniqueArticles = removeDuplicateArticles(allArticles);
    
    clearCache();
    uniqueArticles.forEach(article => {
      articleCache.set(article.id, article);
    });
    updateCacheTime();
    
    console.log(`Cached ${uniqueArticles.length} unique articles`);
    return getRandomizedArticles(uniqueArticles, count);
    
  } catch (error) {
    console.error('Error fetching breaking news:', error);
    return getFallbackNews(count);
  }
};

export const markArticleAsViewed = (articleId: string) => {
  viewedArticles.add(articleId);
  console.log(`Marked article ${articleId} as viewed`);
};

export const searchNews = async (query: string): Promise<NewsArticle[]> => {
  if (!query || query.length < 3) return [];
  
  try {
    const allArticles = await getBreakingNews(20);
    
    const searchResults = allArticles.filter(article => 
      article.title.toLowerCase().includes(query.toLowerCase()) ||
      article.content.toLowerCase().includes(query.toLowerCase())
    );
    
    return searchResults.slice(0, 10);
  } catch (error) {
    console.error('Error searching news:', error);
    return [];
  }
};
