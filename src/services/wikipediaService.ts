const WIKIPEDIA_API_BASE = "https://en.wikipedia.org/w/api.php";
const PAGEVIEWS_API_BASE = "https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/all-agents";

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

    const formatDate = (date: Date) => {
      return date.toISOString().slice(0, 10).replace(/-/g, '');
    };

    const response = await fetch(
      `${PAGEVIEWS_API_BASE}/${encodeURIComponent(title)}/daily/${formatDate(startDate)}/${formatDate(endDate)}`
    );
    const data = await response.json();
    
    return data.items.reduce((sum: number, item: any) => sum + item.views, 0);
  } catch (error) {
    console.error("Failed to fetch pageviews", error);
    return 0; // Return 0 instead of random number when API fails
  }
};

export const getRandomArticles = async (count: number = 3): Promise<WikipediaArticle[]> => {
  const randomResponse = await fetch(
    `${WIKIPEDIA_API_BASE}?action=query&format=json&origin=*&list=random&rnnamespace=0&rnlimit=${count}`
  );
  const randomData = await randomResponse.json();
  const titles = randomData.query.random.map((article: any) => article.title).join("|");

  const response = await fetch(
    `${WIKIPEDIA_API_BASE}?action=query&format=json&origin=*&prop=extracts|pageimages|categories|links|images|info&titles=${titles}&exintro=1&explaintext=1&pithumbsize=1000&imlimit=5&inprop=protection`
  );
  const data = await response.json();
  const pages = Object.values(data.query.pages);

  const articlesWithImages = await Promise.all(pages.map(async (page: any) => {
    let images = [];
    if (page.images) {
      const imageQuery = page.images
        .filter((img: any) => !img.title.toLowerCase().includes('icon') && !img.title.toLowerCase().includes('logo'))
        .slice(0, 3)
        .map((img: any) => img.title)
        .join('|');

      if (imageQuery) {
        const imageResponse = await fetch(
          `${WIKIPEDIA_API_BASE}?action=query&format=json&origin=*&titles=${imageQuery}&prop=imageinfo&iiprop=url&iiurlwidth=1000`
        );
        const imageData = await imageResponse.json();
        images = Object.values(imageData.query?.pages || {})
          .map((img: any) => img?.imageinfo?.[0]?.url)
          .filter(Boolean);
      }
    }

    const views = await getPageViews(page.title);

    return {
      id: page.pageid,
      title: page.title,
      content: page.extract,
      image: page.thumbnail?.source || images[0] || "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
      citations: Math.floor(Math.random() * 300) + 50,
      readTime: Math.ceil(page.extract.split(" ").length / 200),
      views,
      tags: page.categories?.slice(0, 4).map((cat: any) => cat.title.replace("Category:", "")) || ["science", "history"],
      relatedArticles: images.slice(1).map((img, index) => ({
        id: index + 1,
        title: `Related ${index + 1}`,
        image: img || "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
      })),
    };
  }));

  return articlesWithImages;
};

export const searchArticles = async (query: string): Promise<WikipediaArticle[]> => {
  if (!query || query.length < 3) return [];

  const searchResponse = await fetch(
    `${WIKIPEDIA_API_BASE}?action=query&format=json&origin=*&list=search&srsearch=${encodeURIComponent(
      query
    )}&srlimit=10`
  );
  const searchData = await searchResponse.json();
  
  if (!searchData.query?.search) {
    console.log("No search results found in response:", searchData);
    return [];
  }

  const titles = searchData.query.search.map((result: any) => result.title).join('|');
  const detailsResponse = await fetch(
    `${WIKIPEDIA_API_BASE}?action=query&format=json&origin=*&prop=extracts|pageimages|categories&titles=${titles}&exintro=1&explaintext=1&pithumbsize=1000`
  );
  const detailsData = await detailsResponse.json();
  const pages = Object.values(detailsData.query.pages);

  const articles = await Promise.all(pages.map(async (page: any) => {
    const views = await getPageViews(page.title);
    
    return {
      id: page.pageid,
      title: page.title,
      content: page.extract || "No description available",
      image: page.thumbnail?.source || "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
      citations: Math.floor(Math.random() * 300) + 50,
      readTime: Math.ceil((page.extract?.split(" ").length || 100) / 200),
      views,
      tags: page.categories?.slice(0, 4).map((cat: any) => cat.title.replace("Category:", "")) || ["science", "history"],
      relatedArticles: [],
    };
  }));

  return articles;
};