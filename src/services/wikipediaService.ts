const WIKIPEDIA_API_BASE = "https://en.wikipedia.org/w/api.php";
const PAGEVIEWS_API_BASE = "https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/all-agents";

// Array of gradient backgrounds to use as placeholders
const placeholderBackgrounds = [
  "linear-gradient(45deg, #121212 0%, #FE2C55 10%, #121212 100%)",
  "linear-gradient(135deg, #121212 0%, #20D5EC 15%, #121212 100%)",
  "linear-gradient(to right, #1a1a1a 0%, #69C9D0 10%, #1a1a1a 100%)",
  "linear-gradient(to bottom right, #232323 0%, #EE1D52 15%, #121212 100%)",
  "linear-gradient(to bottom, #202020 0%, #69C9D0 10%, #161616 100%)",
];

const getRandomPlaceholder = () => {
  const randomIndex = Math.floor(Math.random() * placeholderBackgrounds.length);
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg width="1000" height="1000" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#121212;stop-opacity:1" />
          <stop offset="15%" style="stop-color:#FE2C55;stop-opacity:0.5" />
          <stop offset="100%" style="stop-color:#121212;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)"/>
    </svg>`
  )}`;
};

export interface WikipediaArticle {
  id: number;
  title: string;
  content: string;
  image: string;
  citations: number;
  readTime: number;
  views: number;
  tags: string[];
  relatedArticles: {
    id: number;
    title: string;
    image: string;
  }[];
}

const getPageViews = async (title: string): Promise<number> => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const formatDate = (date: Date) => date.toISOString().slice(0, 10).replace(/-/g, '');

    const response = await fetch(
      `${PAGEVIEWS_API_BASE}/${encodeURIComponent(title)}/daily/${formatDate(startDate)}/${formatDate(endDate)}`
    );
    
    if (!response.ok) {
      console.warn(`Failed to fetch pageviews for ${title}`);
      return 0;
    }

    const data = await response.json();
    return data.items?.reduce((sum: number, item: any) => sum + item.views, 0) || 0;
  } catch (error) {
    console.warn(`Failed to fetch pageviews for ${title}:`, error);
    return 0;
  }
};

const fetchWikipediaContent = async (titles: string[]) => {
  const titlesString = titles.join("|");
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    origin: '*',
    prop: 'extracts|pageimages|categories|links|images|info',
    titles: titlesString,
    exintro: '1',
    explaintext: '1',
    pithumbsize: '1000',
    imlimit: '5',
    inprop: 'protection'
  });

  const response = await fetch(`${WIKIPEDIA_API_BASE}?${params}`);
  if (!response.ok) throw new Error('Failed to fetch Wikipedia content');
  
  return response.json();
};

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

      const categoryResponse = await fetch(`${WIKIPEDIA_API_BASE}?${params}`);
      if (!categoryResponse.ok) throw new Error('Failed to fetch category articles');
      
      const categoryData = await categoryResponse.json();
      titles = categoryData.query?.categorymembers?.map((article: any) => article.title) || [];
    } else {
      const params = new URLSearchParams({
        action: 'query',
        format: 'json',
        origin: '*',
        list: 'random',
        rnnamespace: '0',
        rnlimit: count.toString()
      });

      const randomResponse = await fetch(`${WIKIPEDIA_API_BASE}?${params}`);
      if (!randomResponse.ok) throw new Error('Failed to fetch random articles');
      
      const randomData = await randomResponse.json();
      titles = randomData.query?.random?.map((article: any) => article.title) || [];
    }

    if (!titles.length) throw new Error('No articles found');

    const data = await fetchWikipediaContent(titles);
    const pages = Object.values(data.query?.pages || {});

    const articlesWithImages = await Promise.all(
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

            const imageResponse = await fetch(`${WIKIPEDIA_API_BASE}?${imageParams}`);
            if (imageResponse.ok) {
              const imageData = await imageResponse.json();
              mainImage = Object.values(imageData.query?.pages || {})[0]?.imageinfo?.[0]?.url;
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

    return articlesWithImages;
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

    const searchResponse = await fetch(`${WIKIPEDIA_API_BASE}?${params}`);
    if (!searchResponse.ok) throw new Error('Search request failed');
    
    const searchData = await searchResponse.json();
    if (!searchData.query?.search?.length) return [];

    const titles = searchData.query.search.map((result: any) => result.title);
    const data = await fetchWikipediaContent(titles);
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