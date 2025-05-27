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

export interface WikipediaImageInfo {
  url?: string;
}

export interface WikipediaPage {
  pageid: number;
  title: string;
  extract?: string;
  thumbnail?: {
    source: string;
  };
  images?: Array<{ title: string }>;
  categories?: Array<{ title: string }>;
  imageinfo?: WikipediaImageInfo[];
}

export interface WikipediaResponse {
  query?: {
    pages?: Record<string, WikipediaPage>;
    random?: Array<{ title: string }>;
    categorymembers?: Array<{ title: string }>;
    search?: Array<{ title: string }>;
  };
}