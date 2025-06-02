
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
  
  // Create news placement positions - spread them out more evenly
  const newsPositions = new Set<number>();
  if (newsCount > 0) {
    const spacing = Math.floor(count / (newsCount + 1));
    for (let i = 0; i < newsCount; i++) {
      const basePosition = spacing * (i + 1) + Math.floor(Math.random() * Math.max(1, spacing / 2));
      newsPositions.add(Math.min(basePosition, count - 1));
    }
  }
  
  // Fill content with strategic news placement
  const newsPool = [...newsArticles];
  const wikiPool = [...wikiArticles];
  
  for (let i = 0; i < count && (newsPool.length > 0 || wikiPool.length > 0); i++) {
    if (newsPositions.has(i) && newsPool.length > 0) {
      // Place news at designated positions
      const randomIndex = Math.floor(Math.random() * newsPool.length);
      const item = newsPool.splice(randomIndex, 1)[0];
      if (item) mixedContent.push(item);
    } else if (wikiPool.length > 0) {
      // Fill with wiki articles
      const randomIndex = Math.floor(Math.random() * wikiPool.length);
      const item = wikiPool.splice(randomIndex, 1)[0];
      if (item) mixedContent.push(item);
    }
  }

  // Final randomization pass
  const finalContent = mixedContent
    .sort(() => Math.random() - 0.5)
    .slice(0, count);

  console.log(`Final content mix: ${finalContent.filter(isNewsArticle).length} news, ${finalContent.filter(item => !isNewsArticle(item)).length} wiki`);
  
  return finalContent;
};
