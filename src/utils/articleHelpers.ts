
import { isNewsArticle } from '../services/contentService';
import { STOCK_NEWS_IMAGES } from '../constants/images';

export const getArticleImage = (article: any) => {
  if (article.image && !article.image.includes('placeholder')) {
    return article.image;
  }
  
  if (isNewsArticle(article)) {
    const imageIndex = parseInt(article.id) % STOCK_NEWS_IMAGES.length;
    return STOCK_NEWS_IMAGES[imageIndex];
  }
  
  return article.image;
};

export const formatNewsDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${diffInHours}h ago`;
  return date.toLocaleDateString();
};
