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

// RSS feed sources with more reliable feeds
const RSS_FEEDS = [
  {
    name: 'BBC',
    url: 'https://feeds.bbci.co.uk/news/rss.xml',
    category: 'general'
  },
  {
    name: 'CNN',
    url: 'http://rss.cnn.com/rss/edition.rss',
    category: 'general'
  },
  {
    name: 'Reuters',
    url: 'https://feeds.reuters.com/reuters/topNews',
    category: 'business'
  },
  {
    name: 'TechCrunch',
    url: 'https://techcrunch.com/feed/',
    category: 'technology'
  },
  {
    name: 'NPR',
    url: 'https://feeds.npr.org/1001/rss.xml',
    category: 'general'
  }
];

// Cache to store fetched articles and track views
const articleCache = new Map<string, NewsArticle>();
const viewedArticles = new Set<string>();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes
let lastCacheTime = 0;

// Helper function to extract image from content or use placeholder
const extractImageFromContent = (content: string, title: string): string => {
  // Try to find img tags in content
  const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
  if (imgMatch && imgMatch[1]) {
    return imgMatch[1];
  }
  
  // Generate a placeholder image based on category/title
  const categories = ['technology', 'business', 'world', 'science', 'health', 'sports'];
  const category = categories[Math.floor(Math.random() * categories.length)];
  return `https://picsum.photos/800/600?random=${Math.abs(title.split('').reduce((a, b) => a + b.charCodeAt(0), 0))}&category=${category}`;
};

// Function to parse RSS XML with better error handling
const parseRSSFeed = async (feedUrl: string, sourceName: string): Promise<NewsArticle[]> => {
  try {
    console.log(`Attempting to fetch from ${sourceName}: ${feedUrl}`);
    
    // Try multiple proxy services for better reliability
    const proxies = [
      `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`,
      `https://cors-anywhere.herokuapp.com/${feedUrl}`,
      `https://api.allorigins.win/get?url=${encodeURIComponent(feedUrl)}`
    ];
    
    let data = null;
    let lastError = null;
    
    for (const proxyUrl of proxies) {
      try {
        const response = await fetch(proxyUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json, application/xml, text/xml',
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        if (proxyUrl.includes('rss2json')) {
          data = await response.json();
          if (data.status === 'ok' && data.items) break;
        } else if (proxyUrl.includes('allorigins')) {
          const result = await response.json();
          // Parse XML manually for allorigins
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(result.contents, 'text/xml');
          const items = xmlDoc.querySelectorAll('item');
          
          data = {
            status: 'ok',
            items: Array.from(items).map(item => ({
              title: item.querySelector('title')?.textContent || '',
              link: item.querySelector('link')?.textContent || '',
              description: item.querySelector('description')?.textContent || '',
              pubDate: item.querySelector('pubDate')?.textContent || new Date().toISOString(),
              enclosure: item.querySelector('enclosure') ? {
                link: item.querySelector('enclosure')?.getAttribute('url') || ''
              } : null
            }))
          };
          if (data.items.length > 0) break;
        }
        
        data = null; // Reset if we didn't get good data
      } catch (error) {
        console.warn(`Failed to fetch from ${proxyUrl}:`, error);
        lastError = error;
        continue;
      }
    }
    
    if (!data || !data.items || !Array.isArray(data.items)) {
      throw lastError || new Error('No valid data from any proxy');
    }
    
    console.log(`Successfully fetched ${data.items.length} items from ${sourceName}`);
    
    return data.items.slice(0, 10).map((item: any, index: number) => {
      // Create unique ID with timestamp to avoid duplicates
      const timestamp = Date.now();
      const titleHash = item.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '').substring(0, 20);
      const articleId = `${sourceName.toLowerCase()}-${titleHash}-${timestamp}-${index}`;
      
      // Clean content and extract text
      const cleanContent = item.description 
        ? item.description.replace(/<[^>]*>/g, '').substring(0, 400) + '...'
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
        lastShown: timestamp.toString()
      };
      
      return article;
    });
  } catch (error) {
    console.error(`Error parsing RSS feed from ${sourceName}:`, error);
    return [];
  }
};

// Main function to get breaking news with better caching
export const getBreakingNews = async (count: number = 5): Promise<NewsArticle[]> => {
  try {
    const now = Date.now();
    
    // Check if we have fresh cached data
    if (now - lastCacheTime < CACHE_DURATION && articleCache.size > 0) {
      console.log('Using cached news articles');
      const cachedArticles = Array.from(articleCache.values());
      return getRandomizedArticles(cachedArticles, count);
    }
    
    console.log('Fetching fresh breaking news from RSS feeds...');
    
    // Fetch from RSS feeds with timeout
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
    
    // Remove duplicates and filter viewed articles for lower probability
    const uniqueArticles = allArticles.filter((article, index, array) => {
      const titleWords = article.title.toLowerCase().split(' ');
      const isDuplicate = array.slice(0, index).some(prevArticle => {
        const prevTitleWords = prevArticle.title.toLowerCase().split(' ');
        const commonWords = titleWords.filter(word => prevTitleWords.includes(word) && word.length > 3);
        return commonWords.length > Math.min(titleWords.length, prevTitleWords.length) * 0.5;
      });
      
      return !isDuplicate;
    });
    
    // Update cache
    articleCache.clear();
    uniqueArticles.forEach(article => {
      articleCache.set(article.id, article);
    });
    lastCacheTime = now;
    
    console.log(`Cached ${uniqueArticles.length} unique articles`);
    return getRandomizedArticles(uniqueArticles, count);
    
  } catch (error) {
    console.error('Error fetching breaking news:', error);
    return getFallbackNews(count);
  }
};

// Function to get randomized articles with viewed article preference
const getRandomizedArticles = (articles: NewsArticle[], count: number): NewsArticle[] => {
  // Separate viewed and unviewed articles
  const unviewedArticles = articles.filter(article => !viewedArticles.has(article.id));
  const viewedArticlesList = articles.filter(article => viewedArticles.has(article.id));
  
  // Prefer unviewed articles, but include some viewed ones if needed
  const selectedArticles: NewsArticle[] = [];
  
  // First, add unviewed articles
  const shuffledUnviewed = unviewedArticles.sort(() => Math.random() - 0.5);
  selectedArticles.push(...shuffledUnviewed.slice(0, Math.min(count, shuffledUnviewed.length)));
  
  // If we need more articles, add some viewed ones with lower probability
  if (selectedArticles.length < count && viewedArticlesList.length > 0) {
    const shuffledViewed = viewedArticlesList.sort(() => Math.random() - 0.5);
    const remainingCount = count - selectedArticles.length;
    selectedArticles.push(...shuffledViewed.slice(0, remainingCount));
  }
  
  // Final shuffle
  return selectedArticles.sort(() => Math.random() - 0.5);
};

// Track when an article is viewed (call this from the UI)
export const markArticleAsViewed = (articleId: string) => {
  viewedArticles.add(articleId);
  console.log(`Marked article ${articleId} as viewed`);
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

// Enhanced fallback news with more variety
const getFallbackNews = (count: number): NewsArticle[] => {
  const fallbackArticles = [
    {
      title: "Global Markets Show Strong Performance Amid Economic Recovery",
      content: "Financial markets across the globe are experiencing significant growth as economies continue to recover from recent challenges. Investors are showing renewed confidence in emerging markets and technology sectors...",
      source: "REUTERS"
    },
    {
      title: "Breakthrough in Renewable Energy Technology Announced",
      content: "Scientists have announced a major breakthrough in solar panel efficiency that could revolutionize the renewable energy sector. The new technology promises to reduce costs and increase adoption rates...",
      source: "TECHCRUNCH"
    },
    {
      title: "International Climate Summit Reaches Historic Agreement",
      content: "World leaders have reached a historic agreement on climate action at the international summit, setting ambitious targets for carbon reduction and sustainable development goals...",
      source: "BBC"
    },
    {
      title: "Major Advancement in Artificial Intelligence Research",
      content: "Researchers have made significant progress in developing more efficient AI models that require less computational power while maintaining high accuracy rates...",
      source: "NPR"
    },
    {
      title: "Space Exploration Mission Discovers New Findings",
      content: "A recent space mission has returned with unprecedented data about distant galaxies, providing new insights into the formation of the universe and potential for life...",
      source: "CNN"
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
