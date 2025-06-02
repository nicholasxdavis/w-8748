
import { WikipediaArticle, getRandomArticles as getWikiArticles, searchArticles as searchWikiArticles } from './wikipediaService';
import { NewsArticle, getBreakingNews, searchNews, markArticleAsViewed } from './rssNewsService';
import { getUserInterests } from './userInterestsService';
import { getWikipediaCategories } from './content/categoryMapping';
import { viewedWikiArticles, filterArticlesByViewed, selectRandomWikiArticles } from './content/articleFilter';
import { createMixedContent } from './content/contentMixer';

export type ContentItem = WikipediaArticle | NewsArticle;

export const isNewsArticle = (item: ContentItem): item is NewsArticle => {
  return 'isBreakingNews' in item;
};

export const markContentAsViewed = (item: ContentItem) => {
  if (isNewsArticle(item)) {
    markArticleAsViewed(item.id);
  } else {
    viewedWikiArticles.add(item.id.toString());
  }
};

let contentPosition = 0;

export const getMixedContent = async (count: number = 8, userId?: string): Promise<ContentItem[]> => {
  try {
    console.log(`Getting mixed content: count=${count}, userId=${userId}, position=${contentPosition}`);
    
    // Get user interests if userId is provided
    let userInterests: string[] = [];
    if (userId) {
      try {
        const interests = await getUserInterests(userId);
        userInterests = interests.map(interest => interest.topic?.name || '').filter(Boolean);
        console.log('User interests found:', userInterests);
      } catch (error) {
        console.error('Error fetching user interests:', error);
      }
    }

    // Reduced news distribution to 15%
    const newsCount = Math.max(1, Math.floor(count * 0.15));
    const wikiCount = count - newsCount;

    console.log(`Fetching ${wikiCount} Wikipedia articles and ${newsCount} news articles`);

    // Fetch news articles first to ensure they're valid
    const newsArticles = await getBreakingNews(newsCount + 3);
    console.log(`Fetched ${newsArticles.length} news articles`);

    // Fetch Wikipedia content
    let wikiArticles;
    if (userInterests.length > 0) {
      const wikiCategories = getWikipediaCategories(userInterests);
      const selectedCategory = wikiCategories[Math.floor(Math.random() * wikiCategories.length)];
      wikiArticles = await getWikiArticles(wikiCount + 2, selectedCategory);
    } else {
      wikiArticles = await getWikiArticles(wikiCount + 2);
    }

    console.log(`Fetched ${wikiArticles.length} wiki articles`);
    
    // Filter valid content
    const validNews = newsArticles.filter(article => 
      article.image && !article.image.includes('placeholder')
    ).slice(0, newsCount);
    
    const validWiki = wikiArticles.filter(article => 
      article.image && !article.image.includes('placeholder')
    ).slice(0, wikiCount);

    console.log(`Valid content: ${validNews.length} news, ${validWiki.length} wiki`);

    // Create mixed content ensuring news is included
    const mixedContent = createMixedContent(validWiki, validNews, count);
    
    console.log(`Final mix: ${mixedContent.filter(isNewsArticle).length} news, ${mixedContent.filter(item => !isNewsArticle(item)).length} wiki`);
    
    // Update position for next fetch
    contentPosition += count;
    
    return mixedContent;

  } catch (error) {
    console.error('Error in getMixedContent:', error);
    
    // Fallback to Wikipedia content only
    const fallbackWiki = await getWikiArticles(count).catch(() => []);
    return fallbackWiki.slice(0, count);
  }
};

export const searchMixedContent = async (query: string): Promise<ContentItem[]> => {
  if (!query || query.length < 3) return [];

  const [wikiResults, newsResults] = await Promise.all([
    searchWikiArticles(query).catch(() => []),
    searchNews(query).catch(() => [])
  ]);

  const mixedResults: ContentItem[] = [];
  const maxResults = Math.max(wikiResults.length, newsResults.length);

  for (let i = 0; i < maxResults && mixedResults.length < 20; i++) {
    if (i < wikiResults.length) mixedResults.push(wikiResults[i]);
    if (i < newsResults.length && mixedResults.length < 20 && i % 3 === 0) {
      mixedResults.push(newsResults[i]);
    }
  }

  return mixedResults.filter(item => item.image && !item.image.includes('placeholder'));
};
