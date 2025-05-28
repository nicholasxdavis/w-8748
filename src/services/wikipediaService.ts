
import { WikipediaArticle, WikipediaResponse } from './types';
import { fetchWikipediaContent } from './wikipediaApi';

const transformToArticle = async (page: any): Promise<WikipediaArticle | null> => {
  if (!page || page.missing || !page.extract || page.extract.length < 100) {
    return null;
  }

  const title = page.title;
  const content = page.extract;
  const image = page.thumbnail?.source || '';
  
  const readTime = Math.ceil(content.length / 1000);
  const views = Math.floor(Math.random() * 100000) + 1000;
  const citations = Math.floor(Math.random() * 50) + 5;
  
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
    relatedArticles: []
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

const getRandomArticles = async (count: number = 3, category?: string): Promise<WikipediaArticle[]> => {
  try {
    let titles: string[] = [];
    
    if (category && category !== "All") {
      console.log(`Fetching articles for category: ${category}`);
      
      // Try to get articles from the specific category
      const params = new URLSearchParams({
        action: 'query',
        format: 'json',
        origin: '*',
        list: 'categorymembers',
        cmtitle: `Category:${category}`,
        cmlimit: (count * 3).toString(), // Get more to ensure we have enough valid articles
        cmtype: 'page'
      });

      const categoryResponse = await fetch(`https://en.wikipedia.org/w/api.php?${params}`);
      if (categoryResponse.ok) {
        const categoryData = await categoryResponse.json() as WikipediaResponse;
        titles = categoryData.query?.categorymembers?.map(article => article.title) || [];
        console.log(`Found ${titles.length} articles in category ${category}`);
      }

      // If we don't get enough articles from the category, supplement with search
      if (titles.length < count) {
        console.log(`Not enough articles in category, searching for: ${category}`);
        const searchParams = new URLSearchParams({
          action: 'query',
          format: 'json',
          origin: '*',
          list: 'search',
          srsearch: category,
          srlimit: (count * 2).toString()
        });

        const searchResponse = await fetch(`https://en.wikipedia.org/w/api.php?${searchParams}`);
        if (searchResponse.ok) {
          const searchData = await searchResponse.json() as WikipediaResponse;
          const searchTitles = searchData.query?.search?.map(result => result.title) || [];
          titles = [...titles, ...searchTitles].slice(0, count * 2);
          console.log(`After search supplement: ${titles.length} articles`);
        }
      }
    } else {
      // Get completely random articles using multiple requests for better variety
      const randomRequests = [];
      const articlesPerRequest = Math.ceil(count / 2);
      
      for (let i = 0; i < 2; i++) {
        const params = new URLSearchParams({
          action: 'query',
          format: 'json',
          origin: '*',
          list: 'random',
          rnnamespace: '0',
          rnlimit: (articlesPerRequest + 2).toString()
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
      titles = titles.sort(() => Math.random() - 0.5);
    }

    if (!titles.length) {
      console.log('No titles found, falling back to random articles');
      throw new Error('No articles found');
    }

    // Shuffle titles to ensure randomness
    titles = titles.sort(() => Math.random() - 0.5);

    const data = await fetchWikipediaContent(titles) as WikipediaResponse;
    const pages = Object.values(data.query?.pages || {});
    
    const articles = await Promise.all(pages.map(transformToArticle));
    const validArticles = articles.filter(article => article !== null) as WikipediaArticle[];
    
    console.log(`Transformed ${validArticles.length} valid articles out of ${pages.length} pages`);
    
    // If we don't have enough articles, fetch more with a different approach
    if (validArticles.length < count && category) {
      console.log('Not enough valid articles, trying fallback...');
      const fallbackArticles = await getRandomArticles(count - validArticles.length);
      return [...validArticles, ...fallbackArticles].slice(0, count);
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
