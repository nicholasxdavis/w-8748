import { WikipediaArticle, WikipediaResponse } from './types';
import { getRandomPlaceholder } from './placeholders';
import { getPageViews, fetchWikipediaContent } from './wikipediaApi';

export type { WikipediaArticle };

export const getRandomArticles = async (count: number = 3, category?: string): Promise<WikipediaArticle[]> => {
  try {
    let titles: string[];
    
    if (category && category !== "All") {
      const params = new URLSearchParams({
        action: 'query',
        format: 'json',
        origin: '*',
        list: 'categorymembers',
        cmtitle: `Category:${category}`,
        cmlimit: count.toString(),
        cmtype: 'page'
      });

      const categoryResponse = await fetch(`https://en.wikipedia.org/w/api.php?${params}`);
      if (!categoryResponse.ok) throw new Error('Failed to fetch category articles');
      
      const categoryData = await categoryResponse.json() as WikipediaResponse;
      titles = categoryData.query?.categorymembers?.map(article => article.title) || [];
    } else {
      const params = new URLSearchParams({
        action: 'query',
        format: 'json',
        origin: '*',
        list: 'random',
        rnnamespace: '0',
        rnlimit: count.toString()
      });

      const randomResponse = await fetch(`https://en.wikipedia.org/w/api.php?${params}`);
      if (!randomResponse.ok) throw new Error('Failed to fetch random articles');
      
      const randomData = await randomResponse.json() as WikipediaResponse;
      titles = randomData.query?.random?.map(article => article.title) || [];
    }

    if (!titles.length) throw new Error('No articles found');

    const data = await fetchWikipediaContent(titles) as WikipediaResponse;
    const pages = Object.values(data.query?.pages || {});

    return Promise.all(
      pages.map(async (page: any) => {
        const views = await getPageViews(page.title);
        
        let mainImage = page.thumbnail?.source;
        if (!mainImage && page.images?.length) {
          const imageQuery = page.images
            .filter((img: any) => !img.title.toLowerCase().includes('icon') && !img.title.toLowerCase().includes('logo'))
            .slice(0, 1)
            .map((img: any) => img.title)
            .join('|');

          if (imageQuery) {
            const imageParams = new URLSearchParams({
              action: 'query',
              format: 'json',
              origin: '*',
              titles: imageQuery,
              prop: 'imageinfo',
              iiprop: 'url',
              iiurlwidth: '1000'
            });

            const imageResponse = await fetch(`https://en.wikipedia.org/w/api.php?${imageParams}`);
            if (imageResponse.ok) {
              const imageData = await imageResponse.json() as WikipediaResponse;
              const imagePages = Object.values(imageData.query?.pages || {});
              mainImage = imagePages[0]?.imageinfo?.[0]?.url;
            }
          }
        }

        return {
          id: page.pageid,
          title: page.title,
          content: page.extract || "No content available",
          image: mainImage || getRandomPlaceholder(),
          citations: Math.floor(Math.random() * 300) + 50,
          readTime: Math.ceil((page.extract?.split(" ").length || 100) / 200),
          views,
          tags: page.categories?.slice(0, 4).map((cat: any) => cat.title.replace("Category:", "")) || [],
          relatedArticles: [],
        };
      })
    );
  } catch (error) {
    console.error('Error fetching articles:', error);
    throw error;
  }
};

export const searchArticles = async (query: string): Promise<WikipediaArticle[]> => {
  if (!query || query.length < 3) return [];

  try {
    const params = new URLSearchParams({
      action: 'query',
      format: 'json',
      origin: '*',
      list: 'search',
      srsearch: query,
      srlimit: '10'
    });

    const searchResponse = await fetch(`https://en.wikipedia.org/w/api.php?${params}`);
    if (!searchResponse.ok) throw new Error('Search request failed');
    
    const searchData = await searchResponse.json() as WikipediaResponse;
    if (!searchData.query?.search?.length) return [];

    const titles = searchData.query.search.map((result: any) => result.title);
    const data = await fetchWikipediaContent(titles) as WikipediaResponse;
    const pages = Object.values(data.query?.pages || {});

    return Promise.all(
      pages.map(async (page: any) => {
        const views = await getPageViews(page.title);
        
        return {
          id: page.pageid,
          title: page.title,
          content: page.extract || "No description available",
          image: page.thumbnail?.source || getRandomPlaceholder(),
          citations: Math.floor(Math.random() * 300) + 50,
          readTime: Math.ceil((page.extract?.split(" ").length || 100) / 200),
          views,
          tags: page.categories?.slice(0, 4).map((cat: any) => cat.title.replace("Category:", "")) || [],
          relatedArticles: [],
        };
      })
    );
  } catch (error) {
    console.error('Error searching articles:', error);
    throw error;
  }
};