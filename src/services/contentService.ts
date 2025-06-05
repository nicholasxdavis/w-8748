
import { WikipediaArticle, getRandomArticles as getWikiArticles, searchArticles as searchWikiArticles } from './wikipediaService';
import { NewsArticle, getBreakingNews, searchNews, markArticleAsViewed } from './rssNewsService';
import { DidYouKnowFact, getRandomFacts } from './factsService';
import { getUserInterests } from './userInterestsService';
import { getWikipediaCategories } from './content/categoryMapping';
import { viewedWikiArticles, filterArticlesByViewed, selectRandomWikiArticles } from './content/articleFilter';
import { createMixedContent } from './content/contentMixer';

export type ContentItem = WikipediaArticle | NewsArticle | DidYouKnowFact;

export const isNewsArticle = (item: ContentItem): item is NewsArticle => {
  return 'isBreakingNews' in item;
};

export const isFactArticle = (item: ContentItem): item is DidYouKnowFact => {
  return 'type' in item && item.type === 'fact';
};

export const markContentAsViewed = (item: ContentItem) => {
  if (isNewsArticle(item)) {
    markArticleAsViewed(item.id);
  } else if (!isFactArticle(item)) {
    viewedWikiArticles.add(item.id.toString());
  }
  // Facts don't need to be marked as viewed since they're random
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

    // Calculate content distribution based on position
    const shouldIncludeNews = contentPosition > 0 && (
      (contentPosition % 17 === 0) || // Every 17th post
      (contentPosition % 19 === 0)    // Or every 19th post (creates variation)
    );
    
    const shouldIncludeFacts = contentPosition > 0 && (
      (contentPosition % 12 === 0) || // Every 12th post
      (contentPosition % 15 === 0)    // Or every 15th post
    );
    
    const newsCount = shouldIncludeNews ? 1 : 0;
    const factsCount = shouldIncludeFacts ? 1 : 0;
    const wikiCount = count - newsCount - factsCount;

    console.log(`Position ${contentPosition}: including ${newsCount} news, ${factsCount} facts, ${wikiCount} wiki articles`);

    // Fetch content types
    let newsArticles: NewsArticle[] = [];
    let facts: DidYouKnowFact[] = [];
    
    if (newsCount > 0) {
      newsArticles = await getBreakingNews(3); // Get a few to choose from
      console.log(`Fetched ${newsArticles.length} news articles`);
    }
    
    if (factsCount > 0) {
      facts = await getRandomFacts(factsCount);
      console.log(`Fetched ${facts.length} facts`);
    }

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

    console.log(`Valid content: ${validNews.length} news, ${facts.length} facts, ${validWiki.length} wiki`);

    // Create mixed content - facts are always valid since they have curated images
    const allContent: ContentItem[] = [...validWiki, ...validNews, ...facts];
    
    // Shuffle the content to create a natural mix
    const shuffledContent = allContent.sort(() => Math.random() - 0.5).slice(0, count);
    
    console.log(`Final mix: ${shuffledContent.filter(isNewsArticle).length} news, ${shuffledContent.filter(isFactArticle).length} facts, ${shuffledContent.filter(item => !isNewsArticle(item) && !isFactArticle(item)).length} wiki`);
    
    // Update position for next fetch
    contentPosition += count;
    
    return shuffledContent;

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
