import { WikipediaPage, WikipediaArticle } from './types';
import { getPageViews } from './wikipediaApi';
import { getArticleImage } from './imageService';

export const transformToArticle = async (page: WikipediaPage): Promise<WikipediaArticle> => {
  const views = await getPageViews(page.title);
  const image = await getArticleImage(page);
  
  return {
    id: page.pageid,
    title: page.title,
    content: page.extract || "No content available",
    image,
    citations: Math.floor(Math.random() * 300) + 50,
    readTime: Math.ceil((page.extract?.split(" ").length || 100) / 200),
    views,
    tags: page.categories?.slice(0, 4).map(cat => cat.title.replace("Category:", "")) || [],
    relatedArticles: [],
  };
};