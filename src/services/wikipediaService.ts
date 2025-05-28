import { WikipediaArticle, WikipediaResponse } from './types';
import { fetchWikipediaContent } from './wikipediaApi';

const transformToArticle = async (page: any): Promise<WikipediaArticle | null> => {
  if (!page || page.missing || !page.extract || page.extract.length < 100) {
    return null;
  }

  const title = page.title;
  const content = page.extract;
  const image = page.thumbnail?.source || '';
  
  // Generate basic metadata
  const readTime = Math.ceil(content.length / 1000);
  const views = Math.floor(Math.random() * 100000) + 1000;
  const citations = Math.floor(Math.random() * 50) + 5; // Generate random citations count
  
  // Extract categories as tags
  const tags = page.categories?.slice(0, 3).map((cat: any) => 
    cat.title.replace('Category:', '')
  ) || ['General'];

  return {
    id: page.pageid,
    title,
    content,
    image,
    citations,
    readTime,
    views,
    tags,
    relatedArticles: [] // Initialize empty array, will be populated by getRelatedArticles if needed
  };
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
      cmlimit: '10', // Increased from 5 to ensure we get enough valid articles
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

const getRandomArticles = async (count: number = 3, category?: string): Promise<WikipediaArticle[]> => {
  try {
    let titles: string[] = [];
    const multiplier = 2; // Reduced multiplier to avoid getting too many similar articles
    
    if (category && category !== "All") {
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
    } else {
      const randomRequests = [];
      const articlesPerRequest = Math.ceil(count / 2);
      
      for (let i = 0; i < 2; i++) {
        const params = new URLSearchParams({
          action: 'query',
          format: 'json',
          origin: '*',
          list: 'random',
          rnnamespace: '0',
          rnlimit: articlesPerRequest.toString()
        });

        randomRequests.push(
          fetch(`https://en.wikipedia.org/w/api.php?${params}`)
            .then(response => {
              if (!response.ok) throw new Error('Failed to fetch random articles');
              return response.json();
            })
            .then((data: WikipediaResponse) => 
              data.query?.random?.map(article => article.title) || []
            )
        );
      }

      const titleBatches = await Promise.all(randomRequests);
      titles = titleBatches.flat();
      
      // Shuffle the titles to ensure randomness
      titles = titles.sort(() => Math.random() - 0.5);
    }

    if (!titles.length) throw new Error('No articles found');

    const data = await fetchWikipediaContent(titles) as WikipediaResponse;
    const pages = Object.values(data.query?.pages || {});
    
    const articles = await Promise.all(pages.map(transformToArticle));
    const validArticles = articles.filter(article => article !== null) as WikipediaArticle[];
    
    // If we don't have enough articles, fetch more with a different approach
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
      srlimit: '20' // Increased from 10 to ensure we get enough valid articles
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
