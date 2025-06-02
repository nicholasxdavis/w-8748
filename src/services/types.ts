
export interface WikipediaResponse {
  batchcomplete: boolean;
  query?: {
    pages?: {
      [key: string]: {
        pageid: number;
        ns: number;
        title: string;
        extract?: string;
        thumbnail?: {
          source: string;
          width: number;
          height: number;
        };
        categories?: {
          ns: number;
          title: string;
        }[];
        links?: {
          ns: number;
          title: string;
        }[];
        images?: {
          ns: number;
          title: string;
        }[];
        imageinfo?: [{
          url: string;
          descriptionurl: string;
          descriptionshorturl: string;
        }]
      };
    };
    search?: {
      title: string;
      snippet: string;
      pageid: number;
    }[];
    categorymembers?: {
      pageid: number;
      ns: number;
      title: string;
      type: string;
    }[];
    random?: {
      id: number;
      ns: number;
      title: string;
    }[];
  };
}

export interface WikipediaPage {
  pageid: number;
  ns: number;
  title: string;
  extract?: string;
  thumbnail?: {
    source: string;
    width: number;
    height: number;
  };
  categories?: {
    ns: number;
    title: string;
  }[];
  links?: {
    ns: number;
    title: string;
  }[];
  images?: {
    ns: number;
    title: string;
  }[];
  imageinfo?: [{
    url: string;
    descriptionurl: string;
    descriptionshorturl: string;
  }]
}

export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  image: string;
  source: string;
  url: string;
  publishedAt: string;
  isBreakingNews: boolean;
}

export interface UserInterest {
  id: string;
  userId: string;
  topicId: string;
  createdAt: string;
  updatedAt: string;
  topic?: {
    id: string;
    name: string;
  };
}

export interface WikipediaSection {
  title: string;
  content: string;
  image?: string;
}

export interface WikipediaArticle {
  id: number;
  title: string;
  content: string;
  image: string;
  citations: number;
  readTime: number;
  views: number;
  tags: string[];
  relatedArticles: WikipediaArticle[];
  sections?: WikipediaSection[];
}
