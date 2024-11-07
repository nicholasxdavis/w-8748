const WIKIPEDIA_API_BASE = "https://en.wikipedia.org/w/api.php";

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

const getRandomArticles = async (count: number = 3): Promise<WikipediaArticle[]> => {
  // Get random articles
  const randomResponse = await fetch(
    `${WIKIPEDIA_API_BASE}?action=query&format=json&origin=*&list=random&rnnamespace=0&rnlimit=${count}`
  );
  const randomData = await randomResponse.json();
  const titles = randomData.query.random.map((article: any) => article.title).join("|");

  // Get content and images for these articles
  const response = await fetch(
    `${WIKIPEDIA_API_BASE}?action=query&format=json&origin=*&prop=extracts|pageimages|categories|links&titles=${titles}&exintro=1&explaintext=1&pithumbsize=1000`
  );
  const data = await response.json();
  const pages = Object.values(data.query.pages);

  return pages.map((page: any, index: number) => ({
    id: page.pageid,
    title: page.title,
    content: page.extract,
    image: page.thumbnail?.source || "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
    citations: Math.floor(Math.random() * 300) + 50,
    readTime: Math.ceil(page.extract.split(" ").length / 200),
    views: Math.floor(Math.random() * 5000) + 1000,
    tags: page.categories?.slice(0, 4).map((cat: any) => cat.title.replace("Category:", "")) || ["science", "history"],
    relatedArticles: [
      { id: 1, title: "Related 1", image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b" },
      { id: 2, title: "Related 2", image: "https://images.unsplash.com/photo-1481489712339-f9c0734be5d5" },
      { id: 3, title: "Related 3", image: "https://images.unsplash.com/photo-1518770660439-4636190af475" },
    ],
  }));
};

const searchArticles = async (query: string): Promise<WikipediaArticle[]> => {
  if (!query || query.length < 3) return [];

  const response = await fetch(
    `${WIKIPEDIA_API_BASE}?action=query&format=json&origin=*&list=search&srsearch=${encodeURIComponent(
      query
    )}&srlimit=10`
  );
  const data = await response.json();
  const results = data.query.search;

  // Transform the results into WikipediaArticle format
  return results.map((result: any) => ({
    id: result.pageid,
    title: result.title,
    content: result.snippet.replace(/<\/?span[^>]*>/g, ""),
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b", // Placeholder
    citations: Math.floor(Math.random() * 300) + 50,
    readTime: Math.ceil(result.wordcount / 200),
    views: Math.floor(Math.random() * 5000) + 1000,
    tags: ["science", "history"],
    relatedArticles: [],
  }));
};

export { getRandomArticles, searchArticles };