import { WikipediaArticle, getRandomArticles as getWikiArticles, searchArticles as searchWikiArticles } from './wikipediaService';
import { NewsArticle, getBreakingNews, searchNews, markArticleAsViewed } from './rssNewsService';
import { DidYouKnowFact, getRandomFacts } from './factsService';
import { Quote, getRandomQuotes } from './quotesService';
import { MovieContent, getRandomMovies } from './moviesService';
import { MusicContent, getRandomMusic } from './musicService';
import { StockData, getRandomStocks } from './stockService';
import { WeatherData, getRandomWeather } from './weatherService';
import { HistoricalEvent, getTodayInHistory } from './historyService';
import { getUserInterests } from './userInterestsService';
import { getWikipediaCategories } from './content/categoryMapping';
import { viewedWikiArticles, filterArticlesByViewed, selectRandomWikiArticles } from './content/articleFilter';
import { createMixedContent } from './content/contentMixer';

export type ContentItem = WikipediaArticle | NewsArticle | DidYouKnowFact | Quote | MovieContent | MusicContent | StockData | WeatherData | HistoricalEvent;

export const isNewsArticle = (item: ContentItem): item is NewsArticle => {
  return 'isBreakingNews' in item;
};

export const isFactArticle = (item: ContentItem): item is DidYouKnowFact => {
  return 'type' in item && item.type === 'fact';
};

export const isQuoteArticle = (item: ContentItem): item is Quote => {
  return 'type' in item && item.type === 'quote';
};

export const isMovieArticle = (item: ContentItem): item is MovieContent => {
  return 'type' in item && (item.type === 'movie' || item.type === 'tvshow');
};

export const isMusicArticle = (item: ContentItem): item is MusicContent => {
  return 'type' in item && (item.type === 'song' || item.type === 'album');
};

export const isStockArticle = (item: ContentItem): item is StockData => {
  return 'type' in item && item.type === 'stock';
};

export const isWeatherArticle = (item: ContentItem): item is WeatherData => {
  return 'type' in item && item.type === 'weather';
};

export const isHistoryArticle = (item: ContentItem): item is HistoricalEvent => {
  return 'type' in item && item.type === 'history';
};

export const markContentAsViewed = (item: ContentItem) => {
  if (isNewsArticle(item)) {
    markArticleAsViewed(item.id);
  } else if (!isFactArticle(item) && !isQuoteArticle(item) && !isMovieArticle(item) && !isMusicArticle(item) && !isStockArticle(item) && !isWeatherArticle(item) && !isHistoryArticle(item)) {
    viewedWikiArticles.add(item.id.toString());
  }
  // Special content types don't need to be marked as viewed since they're random/time-based
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

    // Calculate content distribution - made special content even less frequent
    const shouldIncludeNews = contentPosition > 0 && (contentPosition % 10 === 0);
    const shouldIncludeFacts = contentPosition > 0 && (contentPosition % 18 === 0);
    const shouldIncludeQuotes = contentPosition > 0 && (contentPosition % 22 === 0);
    const shouldIncludeMovies = contentPosition > 0 && (contentPosition % 25 === 0);
    const shouldIncludeMusic = contentPosition > 0 && (contentPosition % 28 === 0);
    const shouldIncludeStocks = contentPosition > 0 && (contentPosition % 30 === 0);
    const shouldIncludeWeather = contentPosition > 0 && (contentPosition % 35 === 0);
    const shouldIncludeHistory = contentPosition > 0 && (contentPosition % 40 === 0);
    
    const newsCount = shouldIncludeNews ? 1 : 0;
    const factsCount = shouldIncludeFacts ? 1 : 0;
    const quotesCount = shouldIncludeQuotes ? 1 : 0;
    const moviesCount = shouldIncludeMovies ? 1 : 0;
    const musicCount = shouldIncludeMusic ? 1 : 0;
    const stocksCount = shouldIncludeStocks ? 1 : 0;
    const weatherCount = shouldIncludeWeather ? 1 : 0;
    const historyCount = shouldIncludeHistory ? 1 : 0;
    const wikiCount = count - newsCount - factsCount - quotesCount - moviesCount - musicCount - stocksCount - weatherCount - historyCount;

    console.log(`Position ${contentPosition}: including ${newsCount} news, ${factsCount} facts, ${quotesCount} quotes, ${moviesCount} movies, ${musicCount} music, ${stocksCount} stocks, ${weatherCount} weather, ${historyCount} history, ${wikiCount} wiki articles`);

    // Fetch content types in parallel
    const [newsArticles, facts, quotes, movies, music, stocks, weather, history, wikiArticles] = await Promise.all([
      newsCount > 0 ? getBreakingNews(3) : Promise.resolve([]),
      factsCount > 0 ? getRandomFacts(factsCount) : Promise.resolve([]),
      quotesCount > 0 ? getRandomQuotes(quotesCount) : Promise.resolve([]),
      moviesCount > 0 ? getRandomMovies(moviesCount) : Promise.resolve([]),
      musicCount > 0 ? getRandomMusic(musicCount) : Promise.resolve([]),
      stocksCount > 0 ? getRandomStocks(stocksCount) : Promise.resolve([]),
      weatherCount > 0 ? getRandomWeather(weatherCount) : Promise.resolve([]),
      historyCount > 0 ? getTodayInHistory(historyCount) : Promise.resolve([]),
      userInterests.length > 0 
        ? getWikiArticles(wikiCount + 2, getWikipediaCategories(userInterests)[Math.floor(Math.random() * getWikipediaCategories(userInterests).length)])
        : getWikiArticles(wikiCount + 2)
    ]);

    console.log(`Fetched content: ${newsArticles.length} news, ${facts.length} facts, ${quotes.length} quotes, ${movies.length} movies, ${music.length} music, ${stocks.length} stocks, ${weather.length} weather, ${history.length} history, ${wikiArticles.length} wiki`);
    
    // Filter valid content
    const validNews = newsArticles.filter(article => 
      article.image && !article.image.includes('placeholder')
    ).slice(0, newsCount);
    
    const validWiki = wikiArticles.filter(article => 
      article.image && !article.image.includes('placeholder')
    ).slice(0, wikiCount);

    // Create mixed content - special content types have curated images so they're always valid
    const allContent: ContentItem[] = [...validWiki, ...validNews, ...facts, ...quotes, ...movies, ...music, ...stocks, ...weather, ...history];
    
    // Shuffle content for natural distribution
    const shuffledContent = allContent.sort(() => Math.random() - 0.5).slice(0, count);
    
    console.log(`Final mix: ${shuffledContent.filter(isNewsArticle).length} news, ${shuffledContent.filter(isFactArticle).length} facts, ${shuffledContent.filter(isQuoteArticle).length} quotes, ${shuffledContent.filter(isMovieArticle).length} movies, ${shuffledContent.filter(isMusicArticle).length} music, ${shuffledContent.filter(isStockArticle).length} stocks, ${shuffledContent.filter(isWeatherArticle).length} weather, ${shuffledContent.filter(isHistoryArticle).length} history, ${shuffledContent.filter(item => !isNewsArticle(item) && !isFactArticle(item) && !isQuoteArticle(item) && !isMovieArticle(item) && !isMusicArticle(item) && !isStockArticle(item) && !isWeatherArticle(item) && !isHistoryArticle(item)).length} wiki`);
    
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
