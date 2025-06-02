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

export const getMixedContent = async (count: number = 8, userId?: string): Promise<ContentItem[]> => {
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

  // Calculate content distribution - 20% news
  const newsPercentage = 0.2; // Fixed 20%
  const newsCount = Math.max(0, Math.min(2, Math.floor(count * newsPercentage)));
  const wikiCount = count - newsCount;

  console.log(`Fetching ${wikiCount} Wikipedia articles and ${newsCount} news articles`);

  try {
    const baseWikiCount = Math.floor(wikiCount * 0.3); // 30% random content
    const interestBasedCount = wikiCount - baseWikiCount;

    const requests = [];

    // Fetch news articles
    requests.push(getBreakingNews(newsCount + 2));

    // Fetch Wikipedia content based on user interests
    if (userInterests.length > 0 && interestBasedCount > 0) {
      console.log(`Interest-based: ${interestBasedCount}, Random: ${baseWikiCount}, News: ${newsCount}`);

      const wikiCategories = getWikipediaCategories(userInterests);
      const shuffledCategories = wikiCategories.sort(() => Math.random() - 0.5);
      const selectedCategories = shuffledCategories.slice(0, Math.min(3, shuffledCategories.length));
      
      for (let i = 0; i < selectedCategories.length; i++) {
        const category = selectedCategories[i];
        const articlesPerCategory = Math.ceil(interestBasedCount / selectedCategories.length);
        requests.push(
          getWikiArticles(articlesPerCategory + 2, category).catch(() => [])
        );
      }
    } else {
      const totalWikiCount = wikiCount + interestBasedCount;
      const articlesPerRequest = Math.ceil(totalWikiCount / 3);
      
      for (let i = 0; i < 3; i++) {
        requests.push(getWikiArticles(articlesPerRequest + 2).catch(() => []));
      }
    }

    // Add random content for serendipity
    if (baseWikiCount > 0) {
      requests.push(getWikiArticles(baseWikiCount + 2).catch(() => []));
    }

    const results = await Promise.all(requests);
    
    const newsArticles = results[0] as NewsArticle[] || [];
    const wikiResults = results.slice(1).flat() as WikipediaArticle[];
    
    const { unviewedWiki, viewedWiki } = filterArticlesByViewed(wikiResults);
    const availableWiki = [...unviewedWiki, ...viewedWiki];
    const selectedWiki = selectRandomWikiArticles(unviewedWiki, availableWiki, wikiCount);

    return createMixedContent(selectedWiki, newsArticles.slice(0, newsCount), count);

  } catch (error) {
    console.error('Error in getMixedContent:', error);
    
    const [fallbackWiki, fallbackNews] = await Promise.all([
      getWikiArticles(wikiCount).catch(() => []),
      getBreakingNews(newsCount).catch(() => [])
    ]);
    
    const fallbackContent = [...fallbackWiki, ...fallbackNews]
      .sort(() => Math.random() - 0.5)
      .slice(0, count);
    
    return fallbackContent;
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
