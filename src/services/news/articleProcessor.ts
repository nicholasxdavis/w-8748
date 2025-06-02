
import { NewsArticle } from '../rssNewsService';

// Helper function to extract image from content or use placeholder
export const extractImageFromContent = (content: string, title: string): string => {
  const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
  if (imgMatch && imgMatch[1]) {
    return imgMatch[1];
  }
  
  const categories = ['technology', 'business', 'world', 'science', 'health', 'sports'];
  const category = categories[Math.floor(Math.random() * categories.length)];
  return `https://picsum.photos/800/600?random=${Math.abs(title.split('').reduce((a, b) => a + b.charCodeAt(0), 0))}&category=${category}`;
};

export const processRSSItem = (item: any, index: number, sourceName: string): NewsArticle => {
  const timestamp = Date.now();
  const titleHash = item.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '').substring(0, 20);
  const articleId = `${sourceName.toLowerCase()}-${titleHash}-${timestamp}-${index}`;
  
  const cleanContent = item.description 
    ? item.description.replace(/<[^>]*>/g, '').substring(0, 400) + '...'
    : item.title;
  
  const image = item.enclosure?.link || 
               item.thumbnail || 
               extractImageFromContent(item.description || '', item.title);
  
  return {
    id: articleId,
    title: item.title || 'Untitled',
    content: cleanContent,
    image: image,
    publishedAt: item.pubDate || new Date().toISOString(),
    source: sourceName.toUpperCase(),
    url: item.link || '#',
    readTime: Math.ceil((cleanContent.split(' ').length || 200) / 200),
    views: Math.floor(Math.random() * 1000000) + 100000,
    isBreakingNews: true as const,
    lastShown: timestamp.toString()
  };
};

export const removeDuplicateArticles = (articles: NewsArticle[]): NewsArticle[] => {
  return articles.filter((article, index, array) => {
    const titleWords = article.title.toLowerCase().split(' ');
    const isDuplicate = array.slice(0, index).some(prevArticle => {
      const prevTitleWords = prevArticle.title.toLowerCase().split(' ');
      const commonWords = titleWords.filter(word => prevTitleWords.includes(word) && word.length > 3);
      return commonWords.length > Math.min(titleWords.length, prevTitleWords.length) * 0.5;
    });
    
    return !isDuplicate;
  });
};
