
import { ContentItem, isNewsArticle } from '../contentService';
import { NewsArticle } from '../rssNewsService';
import { WikipediaArticle } from '../wikipediaService';

export const createMixedContent = (
  wikiArticles: WikipediaArticle[], 
  newsArticles: NewsArticle[], 
  count: number
): ContentItem[] => {
  const newsCount = newsArticles.length;
  const mixedContent: ContentItem[] = [];
  
  console.log(`Mixing content: ${wikiArticles.length} wiki, ${newsArticles.length} news, target: ${count}`);
  
  // Create news placement positions - ensure they're actually placed
  const newsPositions = new Set<number>();
  if (newsCount > 0) {
    const spacing = Math.max(3, Math.floor(count / (newsCount + 1))); // Minimum spacing of 3
    for (let i = 0; i < newsCount; i++) {
      const basePosition = spacing * (i + 1);
      const randomOffset = Math.floor(Math.random() * Math.max(1, spacing / 3));
      const finalPosition = Math.min(basePosition + randomOffset, count - 1);
      newsPositions.add(finalPosition);
    }
  }
  
  console.log('News positions:', Array.from(newsPositions));
  
  // Fill content with strategic news placement
  const newsPool = [...newsArticles];
  const wikiPool = [...wikiArticles];
  
  for (let i = 0; i < count && (newsPool.length > 0 || wikiPool.length > 0); i++) {
    if (newsPositions.has(i) && newsPool.length > 0) {
      // Place news at designated positions
      const newsItem = newsPool.shift();
      if (newsItem) {
        mixedContent.push(newsItem);
        console.log(`Placed news at position ${i}:`, newsItem.title.substring(0, 50));
      }
    } else if (wikiPool.length > 0) {
      // Fill with wiki articles
      const randomIndex = Math.floor(Math.random() * wikiPool.length);
      const wikiItem = wikiPool.splice(randomIndex, 1)[0];
      if (wikiItem) mixedContent.push(wikiItem);
    } else if (newsPool.length > 0) {
      // Fill remaining with news if wiki is exhausted
      const newsItem = newsPool.shift();
      if (newsItem) mixedContent.push(newsItem);
    }
  }

  // Ensure we have the target count
  const finalContent = mixedContent.slice(0, count);
  
  console.log(`Final content mix: ${finalContent.filter(isNewsArticle).length} news, ${finalContent.filter(item => !isNewsArticle(item)).length} wiki`);
  
  return finalContent;
};
