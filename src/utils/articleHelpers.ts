
import { isNewsArticle } from '../services/contentService';
import { STOCK_NEWS_IMAGES } from '../constants/images';
import { getNewsPlaceholderImage } from './newsPlaceholders';

export const getArticleImage = (article: any) => {
  if (article.image && !article.image.includes('placeholder')) {
    return article.image;
  }
  
  if (isNewsArticle(article)) {
    // Use the dedicated news placeholder system for better quality images
    return getNewsPlaceholderImage(article.id);
  }
  
  // Fallback to existing system for non-news articles
  return article.image || STOCK_NEWS_IMAGES[0];
};

export const formatNewsDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${diffInHours}h ago`;
  return date.toLocaleDateString();
};
