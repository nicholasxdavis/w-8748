
import { WikipediaArticle, getRandomArticles as getWikiArticles, searchArticles as searchWikiArticles } from './wikipediaService';
import { NewsArticle, getBreakingNews, searchNews, markArticleAsViewed } from './rssNewsService';
import { getUserInterests } from './userInterestsService';
import { getWikipediaCategories } from './content/categoryMapping';
import { viewedWikiArticles, filterArticlesByViewed, selectRandomWikiArticles } from './content/articleFilter';
import { createMixedContent } from './content/contentMixer';
import { getAlgorithmicContent } from './content/algorithmService';

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
    // Use the new algorithmic approach
    const content = await getAlgorithmicContent(count, userId, contentPosition);
    contentPosition += count;
    
    // Ensure we have valid content with images
    const validContent = content.filter(item => 
      item.image && !item.image.includes('placeholder')
    );
    
    if (validContent.length === 0) {
      throw new Error('No valid content found');
    }
    
    // Final shuffle while maintaining news distribution
    return validContent.sort(() => Math.random() - 0.5).slice(0, count);
    
  } catch (error) {
    console.error('Error in getMixedContent:', error);
    
    // Fallback to original approach but fixed
    return getFallbackContent(count, userId);
  }
};

const getFallbackContent = async (count: number, userId?: string): Promise<ContentItem[]> => {
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

  // Fixed news distribution - ensure news actually appears
  const newsPercentage = 0.15;
  const newsCount = Math.max(1, Math.floor(count * newsPercentage)); // Ensure at least 1 news
  const wikiCount = count - newsCount;

  console.log(`Fallback: Fetching ${wikiCount} Wikipedia articles and ${newsCount} news articles`);

  try {
    const requests = [];

    // Fetch news articles - ensure they're actually fetched
    requests.push(getBreakingNews(newsCount + 2));

    // Fetch Wikipedia content
    if (userInterests.length > 0) {
      const wikiCategories = getWikipediaCategories(userInterests);
      const selectedCategory = wikiCategories[Math.floor(Math.random() * wikiCategories.length)];
      requests.push(getWikiArticles(wikiCount + 2, selectedCategory));
    } else {
      requests.push(getWikiArticles(wikiCount + 2));
    }

    const [newsArticles, wikiArticles] = await Promise.all(requests);
    
    console.log(`Fetched ${newsArticles.length} news and ${wikiArticles.length} wiki articles`);
    
    // Filter valid content
    const validNews = (newsArticles as NewsArticle[]).filter(article => 
      article.image && !article.image.includes('placeholder')
    ).slice(0, newsCount);
    
    const validWiki = (wikiArticles as WikipediaArticle[]).filter(article => 
      article.image && !article.image.includes('placeholder')
    ).slice(0, wikiCount);

    // Create mixed content ensuring news is included
    const mixedContent = createMixedContent(validWiki, validNews, count);
    
    console.log(`Final fallback mix: ${mixedContent.filter(isNewsArticle).length} news, ${mixedContent.filter(item => !isNewsArticle(item)).length} wiki`);
    
    return mixedContent;

  } catch (error) {
    console.error('Error in fallback content:', error);
    
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
