
import { NewsArticle } from '../rssNewsService';
import { viewedArticles } from './newsCache';

export const getRandomizedArticles = (articles: NewsArticle[], count: number): NewsArticle[] => {
  const unviewedArticles = articles.filter(article => !viewedArticles.has(article.id));
  const viewedArticlesList = articles.filter(article => viewedArticles.has(article.id));
  
  const selectedArticles: NewsArticle[] = [];
  
  const shuffledUnviewed = unviewedArticles.sort(() => Math.random() - 0.5);
  selectedArticles.push(...shuffledUnviewed.slice(0, Math.min(count, shuffledUnviewed.length)));
  
  if (selectedArticles.length < count && viewedArticlesList.length > 0) {
    const shuffledViewed = viewedArticlesList.sort(() => Math.random() - 0.5);
    const remainingCount = count - selectedArticles.length;
    selectedArticles.push(...shuffledViewed.slice(0, remainingCount));
  }
  
  return selectedArticles.sort(() => Math.random() - 0.5);
};
