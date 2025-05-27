
import { WikipediaArticle, WikipediaResponse } from './types';
import { fetchWikipediaContent } from './wikipediaApi';
import { transformToArticle } from './articleTransformer';

const getRandomArticles = async (count: number = 10): Promise<WikipediaArticle[]> => {
  try {
    // Get random articles from featured articles for quality
    const params = new URLSearchParams({
      action: 'query',
      format: 'json',
      origin: '*',
      list: 'categorymembers',
      cmtitle: 'Category:Featured articles',
      cmlimit: (count * 3).toString(), // Get more than needed for variety
      cmtype: 'page',
      cmsort: 'timestamp',
      cmdir: 'desc'
    });

    const response = await fetch(`https://en.wikipedia.org/w/api.php?${params}`);
    if (!response.ok) throw new Error('Failed to fetch articles');
    
    const data = await response.json() as WikipediaResponse;
    const titles = data.query?.categorymembers
      ?.map(article => article.title)
      ?.sort(() => 0.5 - Math.random()) // Shuffle for randomness
      ?.slice(0, count * 2) || []; // Take double what we need

    if (!titles.length) {
      // Fallback to truly random articles
      const randomParams = new URLSearchParams({
        action: 'query',
        format: 'json',
        origin: '*',
        list: 'random',
        rnlimit: (count * 2).toString(),
        rnnamespace: '0'
      });

      const randomResponse = await fetch(`https://en.wikipedia.org/w/api.php?${randomParams}`);
      const randomData = await randomResponse.json() as WikipediaResponse;
      const randomTitles = randomData.query?.random?.map(page => page.title) || [];
      
      const articleData = await fetchWikipediaContent(randomTitles) as WikipediaResponse;
      const pages = Object.values(articleData.query?.pages || {});
      
      const articles = await Promise.all(pages.map(transformToArticle));
      return articles.filter(article => article !== null) as WikipediaArticle[];
    }

    const articleData = await fetchWikipediaContent(titles) as WikipediaResponse;
    const pages = Object.values(articleData.query?.pages || {});
    
    const articles = await Promise.all(pages.map(transformToArticle));
    const validArticles = articles.filter(article => article !== null) as WikipediaArticle[];
    
    return validArticles.slice(0, count);
  } catch (error) {
    console.error('Error fetching articles:', error);
    throw error;
  }
};

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
      ?.filter(relatedArticle => relatedArticle.title !== article.title)
      ?.map(relatedArticle => relatedArticle.title)
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
