
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

// RSS feed sources
const RSS_FEEDS = [
  {
    name: 'BBC',
    url: 'https://feeds.bbci.co.uk/news/rss.xml',
    category: 'general'
  },
  {
    name: 'Reuters',
    url: 'https://www.reutersagency.com/feed/?best-topics=business-finance&post_type=best',
    category: 'business'
  },
  {
    name: 'TechCrunch',
    url: 'https://techcrunch.com/feed/',
    category: 'technology'
  },
  {
    name: 'CNN',
    url: 'http://rss.cnn.com/rss/edition.rss',
    category: 'general'
  },
  {
    name: 'The Guardian',
    url: 'https://www.theguardian.com/world/rss',
    category: 'world'
  }
];

// Cache to store fetched articles and prevent duplicates
const articleCache = new Map<string, NewsArticle>();
const usedArticleIds = new Set<string>();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Helper function to extract image from content or use placeholder
const extractImageFromContent = (content: string, title: string): string => {
  // Try to find img tags in content
  const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
  if (imgMatch && imgMatch[1]) {
    return imgMatch[1];
  }
  
  // Generate a placeholder image based on category/title
  const categories = ['technology', 'business', 'world', 'science', 'health'];
  const category = categories[Math.floor(Math.random() * categories.length)];
  return `https://picsum.photos/800/600?random=${Math.abs(title.split('').reduce((a, b) => a + b.charCodeAt(0), 0))}&category=${category}`;
};

// Function to parse RSS XML
const parseRSSFeed = async (feedUrl: string, sourceName: string): Promise<NewsArticle[]> => {
  try {
    // Use a CORS proxy to fetch RSS feeds
    const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;
    
    const response = await fetch(proxyUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch RSS feed: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.items || !Array.isArray(data.items)) {
      throw new Error('Invalid RSS feed format');
    }
    
    return data.items.slice(0, 15).map((item: any, index: number) => {
      // Create unique ID based on title and source to avoid duplicates
      const titleHash = item.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      const articleId = `${sourceName.toLowerCase()}-${titleHash}-${index}`;
      
      // Clean content and extract text
      const cleanContent = item.description 
        ? item.description.replace(/<[^>]*>/g, '').substring(0, 500) + '...'
        : item.title;
      
      // Extract image
      const image = item.enclosure?.link || 
                   item.thumbnail || 
                   extractImageFromContent(item.description || '', item.title);
      
      const article: NewsArticle = {
        id: articleId,
        title: item.title || 'Untitled',
        content: cleanContent,
        image: image,
        publishedAt: item.pubDate || new Date().toISOString(),
        source: sourceName.toUpperCase(),
        url: item.link || '#',
        readTime: Math.ceil((cleanContent.split(' ').length || 200) / 200),
        views: Math.floor(Math.random() * 1000000) + 100000,
        isBreakingNews: true as const,
        lastShown: Date.now().toString()
      };
      
      return article;
    });
  } catch (error) {
    console.error(`Error parsing RSS feed from ${sourceName}:`, error);
    return [];
  }
};

// Main function to get breaking news
export const getBreakingNews = async (count: number = 5): Promise<NewsArticle[]> => {
  try {
    console.log('Fetching breaking news from RSS feeds...');
    
    // Fetch from multiple RSS feeds
    const feedPromises = RSS_FEEDS.map(feed => 
      parseRSSFeed(feed.url, feed.name).catch(error => {
        console.error(`Failed to fetch from ${feed.name}:`, error);
        return [];
      })
    );
    
    const allResults = await Promise.all(feedPromises);
    const allArticles = allResults.flat();
    
    // Remove duplicates based on title similarity and ensure we haven't used these articles
    const uniqueArticles = allArticles.filter((article, index, array) => {
      const titleWords = article.title.toLowerCase().split(' ');
      const isDuplicate = array.slice(0, index).some(prevArticle => {
        const prevTitleWords = prevArticle.title.toLowerCase().split(' ');
        const commonWords = titleWords.filter(word => prevTitleWords.includes(word));
        return commonWords.length > titleWords.length * 0.6; // 60% similarity threshold
      });
      
      // Also check if we've already used this article
      const alreadyUsed = usedArticleIds.has(article.id);
      
      if (!isDuplicate && !alreadyUsed) {
        usedArticleIds.add(article.id);
        return true;
      }
      return false;
    });
    
    // Shuffle articles multiple times for better randomization
    const shuffledArticles = uniqueArticles
      .sort(() => Math.random() - 0.5)
      .sort(() => Math.random() - 0.5)
      .sort(() => Math.random() - 0.5)
      .slice(0, count);
    
    // Update cache
    shuffledArticles.forEach(article => {
      articleCache.set(article.id, article);
    });
    
    // Clean old cache entries
    cleanupCache();
    
    console.log(`Fetched ${shuffledArticles.length} unique articles from RSS feeds`);
    return shuffledArticles;
  } catch (error) {
    console.error('Error fetching breaking news:', error);
    
    // Return fallback articles if all else fails
    return getFallbackNews(count);
  }
};

// Search function for news
export const searchNews = async (query: string): Promise<NewsArticle[]> => {
  if (!query || query.length < 3) return [];
  
  try {
    // Get all cached articles first
    const allArticles = await getBreakingNews(20);
    
    // Filter by search query
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

// Fallback news in case RSS feeds fail
const getFallbackNews = (count: number): NewsArticle[] => {
  const fallbackArticles = [
    {
      title: "Global Markets Show Strong Performance Amid Economic Recovery",
      content: "Financial markets across the globe are experiencing significant growth as economies continue to recover from recent challenges...",
      source: "REUTERS"
    },
    {
      title: "Breakthrough in Renewable Energy Technology Announced",
      content: "Scientists have announced a major breakthrough in solar panel efficiency that could revolutionize the renewable energy sector...",
      source: "TECHCRUNCH"
    },
    {
      title: "International Climate Summit Reaches Historic Agreement",
      content: "World leaders have reached a historic agreement on climate action at the international summit, setting ambitious targets...",
      source: "BBC"
    }
  ];
  
  return fallbackArticles.slice(0, count).map((article, index) => ({
    id: `fallback-${index}-${Date.now()}-${Math.random()}`,
    title: article.title,
    content: article.content,
    image: `https://picsum.photos/800/600?random=${index + Date.now()}`,
    publishedAt: new Date().toISOString(),
    source: article.source,
    url: '#',
    readTime: 3,
    views: Math.floor(Math.random() * 500000) + 100000,
    isBreakingNews: true as const,
    lastShown: Date.now().toString()
  }));
};

// Clean up old cache entries
const cleanupCache = () => {
  const now = Date.now();
  for (const [articleId, article] of articleCache.entries()) {
    const lastShown = parseInt(article.lastShown || '0');
    if (now - lastShown > CACHE_DURATION) {
      articleCache.delete(articleId);
      usedArticleIds.delete(articleId);
    }
  }
};

// Clean up cache every 30 minutes
setInterval(cleanupCache, 30 * 60 * 1000);
