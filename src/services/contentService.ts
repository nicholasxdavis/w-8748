
import { WikipediaArticle, getRandomArticles as getWikiArticles, searchArticles as searchWikiArticles } from './wikipediaService';
import { NewsArticle, getBreakingNews, searchNews, markArticleAsViewed } from './rssNewsService';
import { DidYouKnowFact, getRandomFacts } from './factsService';
import { Quote, getRandomQuotes } from './quotesService';
import { getUserInterests } from './userInterestsService';
import { getWikipediaCategories } from './content/categoryMapping';
import { viewedWikiArticles, filterArticlesByViewed, selectRandomWikiArticles } from './content/articleFilter';
import { createMixedContent } from './content/contentMixer';

export type ContentItem = WikipediaArticle | NewsArticle | DidYouKnowFact | Quote;

export const isNewsArticle = (item: ContentItem): item is NewsArticle => {
  return 'isBreakingNews' in item;
};

export const isFactArticle = (item: ContentItem): item is DidYouKnowFact => {
  return 'type' in item && item.type === 'fact';
};

export const isQuoteArticle = (item: ContentItem): item is Quote => {
  return 'type' in item && item.type === 'quote';
};

export const markContentAsViewed = (item: ContentItem) => {
  if (isNewsArticle(item)) {
    markArticleAsViewed(item.id);
  } else if (!isFactArticle(item) && !isQuoteArticle(item)) {
    viewedWikiArticles.add(item.id.toString());
  }
  // Facts and quotes don't need to be marked as viewed since they're random
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

    // Calculate content distribution based on position - made more frequent
    const shouldIncludeNews = contentPosition > 0 && (
      (contentPosition % 8 === 0) || // Every 8th post
      (contentPosition % 11 === 0)   // Or every 11th post
    );
    
    const shouldIncludeFacts = contentPosition > 0 && (
      (contentPosition % 6 === 0) || // Every 6th post (more frequent)
      (contentPosition % 9 === 0)    // Or every 9th post
    );

    const shouldIncludeQuotes = contentPosition > 0 && (
      (contentPosition % 7 === 0) || // Every 7th post
      (contentPosition % 10 === 0)   // Or every 10th post
    );
    
    const newsCount = shouldIncludeNews ? 1 : 0;
    const factsCount = shouldIncludeFacts ? 1 : 0;
    const quotesCount = shouldIncludeQuotes ? 1 : 0;
    const wikiCount = count - newsCount - factsCount - quotesCount;

    console.log(`Position ${contentPosition}: including ${newsCount} news, ${factsCount} facts, ${quotesCount} quotes, ${wikiCount} wiki articles`);

    // Fetch content types
    let newsArticles: NewsArticle[] = [];
    let facts: DidYouKnowFact[] = [];
    let quotes: Quote[] = [];
    
    if (newsCount > 0) {
      newsArticles = await getBreakingNews(3); // Get a few to choose from
      console.log(`Fetched ${newsArticles.length} news articles`);
    }
    
    if (factsCount > 0) {
      facts = await getRandomFacts(factsCount);
      console.log(`Fetched ${facts.length} facts`);
    }

    if (quotesCount > 0) {
      quotes = await getRandomQuotes(quotesCount);
      console.log(`Fetched ${quotes.length} quotes`);
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

    console.log(`Valid content: ${validNews.length} news, ${facts.length} facts, ${quotes.length} quotes, ${validWiki.length} wiki`);

    // Create mixed content - facts and quotes are always valid since they have curated images
    const allContent: ContentItem[] = [...validWiki, ...validNews, ...facts, ...quotes];
    
    // Shuffle the content to create a natural mix
    const shuffledContent = allContent.sort(() => Math.random() - 0.5).slice(0, count);
    
    console.log(`Final mix: ${shuffledContent.filter(isNewsArticle).length} news, ${shuffledContent.filter(isFactArticle).length} facts, ${shuffledContent.filter(isQuoteArticle).length} quotes, ${shuffledContent.filter(item => !isNewsArticle(item) && !isFactArticle(item) && !isQuoteArticle(item)).length} wiki`);
    
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
