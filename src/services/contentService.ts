
import { WikipediaArticle, getRandomArticles as getWikiArticles, searchArticles as searchWikiArticles } from './wikipediaService';
import { NewsArticle, getBreakingNews, searchNews, markArticleAsViewed } from './rssNewsService';
import { getUserInterests } from './userInterestsService';

export type ContentItem = WikipediaArticle | NewsArticle;

export const isNewsArticle = (item: ContentItem): item is NewsArticle => {
  return 'isBreakingNews' in item;
};

// Track viewed articles for better randomization
const viewedWikiArticles = new Set<string>();

// Mark article as viewed to reduce future appearance probability
export const markContentAsViewed = (item: ContentItem) => {
  if (isNewsArticle(item)) {
    markArticleAsViewed(item.id);
  } else {
    viewedWikiArticles.add(item.id);
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

  // Randomize news percentage between 25-40% for more variety
  const newsPercentage = Math.random() * 0.15 + 0.25; // 25-40%
  const newsCount = Math.max(1, Math.floor(count * newsPercentage));
  const wikiCount = count - newsCount;

  console.log(`Fetching ${wikiCount} Wikipedia articles and ${newsCount} news articles`);

  try {
    // Always fetch some content regardless of user interests for variety
    const baseWikiCount = Math.floor(wikiCount * 0.3); // 30% random content
    const interestBasedCount = wikiCount - baseWikiCount;

    const requests = [];

    // Fetch news articles
    requests.push(getBreakingNews(newsCount + 2)); // Get extra for filtering

    // If user has interests, fetch interest-based content
    if (userInterests.length > 0 && interestBasedCount > 0) {
      console.log(`Interest-based: ${interestBasedCount}, Random: ${baseWikiCount}, News: ${newsCount}`);

      // Create category mappings for better Wikipedia searches
      const categoryMap: { [key: string]: string[] } = {
        'Technology': ['Technology', 'Computing', 'Software', 'Internet', 'Electronics', 'Programming'],
        'Science': ['Science', 'Physics', 'Chemistry', 'Biology', 'Medicine', 'Research'],
        'Sports': ['Sports', 'Football', 'Basketball', 'Soccer', 'Olympics', 'Athletes'],
        'Movies': ['Films', 'Cinema', 'Actors', 'Directors', 'Hollywood', 'Entertainment'],
        'Music': ['Music', 'Musicians', 'Albums', 'Songs', 'Bands', 'Artists'],
        'Games': ['Video games', 'Gaming', 'Nintendo', 'PlayStation', 'Xbox', 'Esports'],
        'Travel': ['Travel', 'Tourism', 'Countries', 'Cities', 'Geography', 'Culture'],
        'Food': ['Food', 'Cooking', 'Cuisine', 'Restaurants', 'Recipes', 'Nutrition'],
        'History': ['History', 'Ancient history', 'World War', 'Historical figures', 'Archaeology'],
        'Art': ['Art', 'Painting', 'Sculpture', 'Artists', 'Museums', 'Design'],
        'Business': ['Business', 'Economics', 'Companies', 'Finance', 'Entrepreneurship', 'Markets'],
        'Health': ['Health', 'Medicine', 'Fitness', 'Nutrition', 'Healthcare', 'Wellness']
      };

      // Get Wikipedia categories based on user interests
      const wikiCategories: string[] = [];
      userInterests.forEach(interest => {
        const mappedCategories = categoryMap[interest] || [interest];
        wikiCategories.push(...mappedCategories);
      });

      // Randomize which interests to focus on each session
      const shuffledCategories = wikiCategories.sort(() => Math.random() - 0.5);
      const selectedCategories = shuffledCategories.slice(0, Math.min(3, shuffledCategories.length));
      
      // Fetch interest-based articles with randomized categories
      for (let i = 0; i < selectedCategories.length; i++) {
        const category = selectedCategories[i];
        const articlesPerCategory = Math.ceil(interestBasedCount / selectedCategories.length);
        requests.push(
          getWikiArticles(articlesPerCategory + 2, category).catch(() => [])
        );
      }
    } else {
      // No user interests or fallback - get random content
      const totalWikiCount = wikiCount + interestBasedCount;
      const articlesPerRequest = Math.ceil(totalWikiCount / 3);
      
      for (let i = 0; i < 3; i++) {
        requests.push(getWikiArticles(articlesPerRequest + 2).catch(() => []));
      }
    }

    // Add some completely random content for serendipity
    if (baseWikiCount > 0) {
      requests.push(getWikiArticles(baseWikiCount + 2).catch(() => []));
    }

    const results = await Promise.all(requests);
    
    // Separate news and wiki results
    const newsArticles = results[0] as NewsArticle[] || [];
    const wikiResults = results.slice(1).flat() as WikipediaArticle[];
    
    // Filter and prioritize unviewed articles
    const unviewedWiki = wikiResults.filter(article => 
      !viewedWikiArticles.has(article.id) && 
      article.image && 
      !article.image.includes('placeholder')
    );
    
    const viewedWiki = wikiResults.filter(article => 
      viewedWikiArticles.has(article.id) && 
      article.image && 
      !article.image.includes('placeholder')
    );

    // Combine with preference for unviewed content
    const availableWiki = [...unviewedWiki, ...viewedWiki];
    
    // Ultra-random selection process
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
    if (remainingCount > 0 && availableWiki.length > 0) {
      const remainingArticles = availableWiki.filter(article => 
        !selectedWiki.some(selected => selected.id === article.id)
      );
      
      const shuffledRemaining = remainingArticles.sort(() => Math.random() - 0.5);
      selectedWiki.push(...shuffledRemaining.slice(0, remainingCount));
    }

    // Create final mixed content with ultra-randomization
    const mixedContent: ContentItem[] = [];
    
    // Create random positions for content insertion
    const positions = Array.from({ length: count }, (_, i) => i);
    positions.sort(() => Math.random() - 0.5);
    
    // Randomly interleave news and wiki content
    const newsPool = [...newsArticles.slice(0, newsCount)];
    const wikiPool = [...selectedWiki];
    
    for (let i = 0; i < count && (newsPool.length > 0 || wikiPool.length > 0); i++) {
      // Random decision with slight preference for the type we have more of
      const useNews = newsPool.length > 0 && (
        wikiPool.length === 0 || 
        (Math.random() < 0.4 && newsPool.length > 0)
      );
      
      if (useNews) {
        const randomIndex = Math.floor(Math.random() * newsPool.length);
        const item = newsPool.splice(randomIndex, 1)[0];
        if (item) mixedContent.push(item);
      } else if (wikiPool.length > 0) {
        const randomIndex = Math.floor(Math.random() * wikiPool.length);
        const item = wikiPool.splice(randomIndex, 1)[0];
        if (item) mixedContent.push(item);
      }
    }

    // Final ultra-randomization with multiple shuffle passes
    const finalContent = mixedContent
      .sort(() => Math.random() - 0.5)
      .sort(() => Math.random() - 0.5)
      .sort(() => Math.random() - 0.5)
      .slice(0, count);

    console.log(`Final content mix: ${finalContent.filter(isNewsArticle).length} news, ${finalContent.filter(item => !isNewsArticle(item)).length} wiki`);
    
    return finalContent;

  } catch (error) {
    console.error('Error in getMixedContent:', error);
    
    // Fallback: return basic content
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
