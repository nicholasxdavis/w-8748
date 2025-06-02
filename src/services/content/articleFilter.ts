
import { WikipediaArticle } from '../wikipediaService';

export const viewedWikiArticles = new Set<string>();

export const filterArticlesByViewed = (articles: WikipediaArticle[]) => {
  const unviewedWiki = articles.filter(article => 
    !viewedWikiArticles.has(article.id.toString()) && 
    article.image && 
    !article.image.includes('placeholder')
  );
  
  const viewedWiki = articles.filter(article => 
    viewedWikiArticles.has(article.id.toString()) && 
    article.image && 
    !article.image.includes('placeholder')
  );

  return { unviewedWiki, viewedWiki };
};

export const selectRandomWikiArticles = (unviewedWiki: WikipediaArticle[], allWiki: WikipediaArticle[], wikiCount: number): WikipediaArticle[] => {
  const selectedWiki: WikipediaArticle[] = [];
  const usedIndices = new Set<number>();
  
  // First pass: select unviewed articles randomly
  while (selectedWiki.length < wikiCount && selectedWiki.length < unviewedWiki.length) {
    const randomIndex = Math.floor(Math.random() * unviewedWiki.length);
    if (!usedIndices.has(randomIndex)) {
      usedIndices.add(randomIndex);
      selectedWiki.push(unviewedWiki[randomIndex]);
    }
  }
  
  // Second pass: fill remaining slots with any articles
  const remainingCount = wikiCount - selectedWiki.length;
  if (remainingCount > 0 && allWiki.length > 0) {
    const remainingArticles = allWiki.filter(article => 
      !selectedWiki.some(selected => selected.id === article.id)
    );
    
    const shuffledRemaining = remainingArticles.sort(() => Math.random() - 0.5);
    selectedWiki.push(...shuffledRemaining.slice(0, remainingCount));
  }

  return selectedWiki;
};
