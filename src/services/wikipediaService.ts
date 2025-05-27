
import { WikipediaArticle, WikipediaResponse } from './types';
import { fetchWikipediaContent } from './wikipediaApi';
import { transformToArticle } from './articleTransformer';

const getRelatedArticles = async (article: WikipediaArticle): Promise<WikipediaArticle[]> => {
  try {
    const categoryTitles = article.tags.map(tag => `Category:${tag}`).join('|');
    const params = new URLSearchParams({
      action: 'query',
      format: 'json',
      origin: '*',
      list: 'categorymembers',
      cmtitle: categoryTitles,
      cmlimit: '10',
      cmtype: 'page'
    });

    const categoryResponse = await fetch(`https://en.wikipedia.org/w/api.php?${params}`);
    if (!categoryResponse.ok) throw new Error('Failed to fetch category articles');
    
    const categoryData = await categoryResponse.json() as WikipediaResponse;
    const relatedTitles = categoryData.query?.categorymembers
      ?.filter(article => article.title !== article.title)
      ?.map(article => article.title)
      ?.slice(0, 10) || [];

    if (relatedTitles.length === 0) {
      return getRandomArticles(3);
    }

    const data = await fetchWikipediaContent(relatedTitles) as WikipediaResponse;
    const pages = Object.values(data.query?.pages || {});
    
    const articles = await Promise.all(pages.map(transformToArticle));
    return articles.filter(article => article !== null) as WikipediaArticle[];
  } catch (error) {
    console.error('Error fetching related articles:', error);
    return getRandomArticles(3);
  }
};

const getPopularArticles = async (count: number = 3): Promise<WikipediaArticle[]> => {
  // Use well-known popular Wikipedia articles that tend to have high traffic
  const popularTitles = [
    'World War II', 'Albert Einstein', 'Leonardo da Vinci', 'United States',
    'Adolf Hitler', 'Jesus', 'India', 'China', 'France', 'Germany',
    'The Beatles', 'Michael Jackson', 'Shakespeare', 'Napoleon',
    'Isaac Newton', 'Charles Darwin', 'Artificial intelligence',
    'Climate change', 'COVID-19 pandemic', 'Ancient Egypt',
    'Roman Empire', 'Greek mythology', 'Space exploration',
    'Quantum mechanics', 'DNA', 'Black hole', 'Solar System',
    'Philosophy', 'Psychology', 'Medicine', 'Renaissance',
    'Industrial Revolution', 'American Civil War', 'Cold War'
  ];

  try {
    // Randomly select from popular titles
    const selectedTitles = popularTitles
      .sort(() => 0.5 - Math.random())
      .slice(0, count * 2);

    const data = await fetchWikipediaContent(selectedTitles) as WikipediaResponse;
    const pages = Object.values(data.query?.pages || {});
    
    const articles = await Promise.all(pages.map(transformToArticle));
    const validArticles = articles.filter(article => article !== null) as WikipediaArticle[];
    
    return validArticles.slice(0, count);
  } catch (error) {
    console.error('Error fetching popular articles:', error);
    return getFeaturedArticles(count);
  }
};

const getFeaturedArticles = async (count: number = 3): Promise<WikipediaArticle[]> => {
  try {
    // Get featured articles which are typically high-quality and popular
    const params = new URLSearchParams({
      action: 'query',
      format: 'json',
      origin: '*',
      list: 'categorymembers',
      cmtitle: 'Category:Featured articles',
      cmlimit: (count * 3).toString(),
      cmtype: 'page',
      cmsort: 'timestamp',
      cmdir: 'desc'
    });

    const response = await fetch(`https://en.wikipedia.org/w/api.php?${params}`);
    if (!response.ok) throw new Error('Failed to fetch featured articles');
    
    const data = await response.json() as WikipediaResponse;
    const titles = data.query?.categorymembers
      ?.map(article => article.title)
      ?.slice(0, count * 2) || [];

    if (!titles.length) {
      return getPopularTopicArticles(count);
    }

    const articleData = await fetchWikipediaContent(titles) as WikipediaResponse;
    const pages = Object.values(articleData.query?.pages || {});
    
    const articles = await Promise.all(pages.map(transformToArticle));
    const validArticles = articles.filter(article => article !== null) as WikipediaArticle[];
    
    return validArticles.slice(0, count);
  } catch (error) {
    console.error('Error fetching featured articles:', error);
    return getPopularTopicArticles(count);
  }
};

const getPopularTopicArticles = async (count: number = 3): Promise<WikipediaArticle[]> => {
  // Popular topics that typically have good images and interesting content
  const popularTopics = [
    'Artificial intelligence', 'Climate change', 'Space exploration', 'Quantum computing',
    'Ancient Egypt', 'World War II', 'Leonardo da Vinci', 'Albert Einstein',
    'The Beatles', 'Olympic Games', 'Solar system', 'DNA',
    'Renaissance', 'Black holes', 'Evolution', 'Photography',
    'Psychology', 'Philosophy', 'Architecture', 'Medicine'
  ];

  try {
    // Randomly select topics
    const selectedTopics = popularTopics
      .sort(() => 0.5 - Math.random())
      .slice(0, count * 2);

    const data = await fetchWikipediaContent(selectedTopics) as WikipediaResponse;
    const pages = Object.values(data.query?.pages || {});
    
    const articles = await Promise.all(pages.map(transformToArticle));
    const validArticles = articles.filter(article => article !== null) as WikipediaArticle[];
    
    return validArticles.slice(0, count);
  } catch (error) {
    console.error('Error fetching popular topic articles:', error);
    throw error;
  }
};

const getRandomArticles = async (count: number = 3, category?: string): Promise<WikipediaArticle[]> => {
  try {
    // First try to get popular articles
    if (!category || category === "All") {
      const popularArticles = await getPopularArticles(count);
      if (popularArticles.length >= count) {
        return popularArticles;
      }
      
      // If we don't have enough popular articles, supplement with featured articles
      const additionalCount = count - popularArticles.length;
      const featuredArticles = await getFeaturedArticles(additionalCount);
      return [...popularArticles, ...featuredArticles].slice(0, count);
    }

    // Category-specific articles
    let titles: string[];
    const multiplier = 3;
    
    const params = new URLSearchParams({
      action: 'query',
      format: 'json',
      origin: '*',
      list: 'categorymembers',
      cmtitle: `Category:${category}`,
      cmlimit: (count * multiplier).toString(),
      cmtype: 'page'
    });

    const categoryResponse = await fetch(`https://en.wikipedia.org/w/api.php?${params}`);
    if (!categoryResponse.ok) throw new Error('Failed to fetch category articles');
    
    const categoryData = await categoryResponse.json() as WikipediaResponse;
    titles = categoryData.query?.categorymembers?.map(article => article.title) || [];

    if (!titles.length) throw new Error('No articles found');

    const data = await fetchWikipediaContent(titles) as WikipediaResponse;
    const pages = Object.values(data.query?.pages || {});
    
    const articles = await Promise.all(pages.map(transformToArticle));
    const validArticles = articles.filter(article => article !== null) as WikipediaArticle[];
    
    if (validArticles.length < count) {
      const moreArticles = await getRandomArticles(count - validArticles.length, category);
      return [...validArticles, ...moreArticles].slice(0, count);
    }
    
    return validArticles.slice(0, count);
  } catch (error) {
    console.error('Error fetching articles:', error);
    throw error;
  }
};

const searchArticles = async (query: string): Promise<WikipediaArticle[]> => {
  if (!query || query.length < 3) return [];

  try {
    const params = new URLSearchParams({
      action: 'query',
      format: 'json',
      origin: '*',
      list: 'search',
      srsearch: query,
      srlimit: '20'
    });

    const searchResponse = await fetch(`https://en.wikipedia.org/w/api.php?${params}`);
    if (!searchResponse.ok) throw new Error('Search request failed');
    
    const searchData = await searchResponse.json() as WikipediaResponse;
    if (!searchData.query?.search?.length) return [];

    const titles = searchData.query.search.map(result => result.title);
    const data = await fetchWikipediaContent(titles) as WikipediaResponse;
    const pages = Object.values(data.query?.pages || {});
    
    const articles = await Promise.all(pages.map(transformToArticle));
    return articles.filter(article => article !== null) as WikipediaArticle[];
  } catch (error) {
    console.error('Error searching articles:', error);
    throw error;
  }
};

export { 
  getRandomArticles,
  searchArticles,
  getRelatedArticles,
  type WikipediaArticle 
};
