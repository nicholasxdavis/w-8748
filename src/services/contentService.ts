
import { WikipediaArticle, getRandomArticles as getWikiArticles, searchArticles as searchWikiArticles } from './wikipediaService';
import { NewsArticle, getBreakingNews, searchNews } from './newsService';
import { getUserInterests } from './userInterestsService';

export type ContentItem = WikipediaArticle | NewsArticle;

export const isNewsArticle = (item: ContentItem): item is NewsArticle => {
  return 'isBreakingNews' in item;
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

  // If user has interests, prioritize content based on those interests (80% of content)
  if (userInterests.length > 0) {
    const interestBasedCount = Math.floor(count * 0.8); // 80% based on interests
    const randomCount = count - interestBasedCount;
    const newsCount = Math.random() < 0.2 ? 1 : 0; // Still include some news
    const finalInterestCount = interestBasedCount - newsCount;

    console.log(`Fetching ${finalInterestCount} interest-based articles, ${randomCount} random articles, ${newsCount} news articles`);

    // Create category mappings for better Wikipedia searches
    const categoryMap: { [key: string]: string[] } = {
      'Technology': ['Technology', 'Computing', 'Software', 'Internet', 'Electronics'],
      'Science': ['Science', 'Physics', 'Chemistry', 'Biology', 'Medicine'],
      'Sports': ['Sports', 'Football', 'Basketball', 'Soccer', 'Olympics'],
      'Movies': ['Films', 'Cinema', 'Actors', 'Directors', 'Hollywood'],
      'Music': ['Music', 'Musicians', 'Albums', 'Songs', 'Bands'],
      'Games': ['Video games', 'Gaming', 'Nintendo', 'PlayStation', 'Xbox'],
      'Travel': ['Travel', 'Tourism', 'Countries', 'Cities', 'Geography'],
      'Food': ['Food', 'Cooking', 'Cuisine', 'Restaurants', 'Recipes'],
      'History': ['History', 'Ancient history', 'World War', 'Historical figures'],
      'Art': ['Art', 'Painting', 'Sculpture', 'Artists', 'Museums'],
      'Business': ['Business', 'Economics', 'Companies', 'Finance', 'Entrepreneurship'],
      'Health': ['Health', 'Medicine', 'Fitness', 'Nutrition', 'Healthcare']
    };

    // Get Wikipedia categories based on user interests
    const wikiCategories: string[] = [];
    userInterests.forEach(interest => {
      const mappedCategories = categoryMap[interest] || [interest];
      wikiCategories.push(...mappedCategories);
    });

    const requests = [];

    // Fetch interest-based articles
    if (finalInterestCount > 0) {
      // Distribute articles across user interests
      const articlesPerInterest = Math.ceil(finalInterestCount / wikiCategories.length);
      
      for (let i = 0; i < wikiCategories.length && requests.length < 3; i++) {
        const category = wikiCategories[i];
        requests.push(
          getWikiArticles(articlesPerInterest + 1, category).catch(() => [])
        );
      }
    }

    // Add some random articles for variety
    if (randomCount > 0) {
      requests.push(getWikiArticles(randomCount + 1).catch(() => []));
    }

    // Add news if needed
    if (newsCount > 0) {
      requests.push(getBreakingNews(newsCount).catch(() => []));
    }

    const results = await Promise.all(requests);
    
    // Combine all articles
    const allArticles = results.flat().filter(article => 
      article && article.image && !article.image.includes('placeholder')
    );

    // Shuffle and select final articles
    const shuffledArticles = allArticles
      .sort(() => Math.random() - 0.5)
      .sort(() => Math.random() - 0.5);

    const selectedArticles = [];
    const usedIds = new Set();

    // Ensure we get diverse content
    for (const article of shuffledArticles) {
      if (selectedArticles.length >= count) break;
      
      const articleId = isNewsArticle(article) ? article.id : `wiki-${article.id}`;
      if (!usedIds.has(articleId)) {
        usedIds.add(articleId);
        selectedArticles.push(article);
      }
    }

    // If we don't have enough articles, fill with random ones
    if (selectedArticles.length < count) {
      const additionalArticles = await getWikiArticles(count - selectedArticles.length);
      const filteredAdditional = additionalArticles.filter(article => {
        const articleId = `wiki-${article.id}`;
        return !usedIds.has(articleId) && article.image && !article.image.includes('placeholder');
      });
      selectedArticles.push(...filteredAdditional.slice(0, count - selectedArticles.length));
    }

    return selectedArticles.slice(0, count);
  }

  // Fallback: No user interests, use original random logic
  const newsCount = Math.random() < 0.2 ? 1 : 0;
  const wikiCount = count - newsCount;
  
  const randomRequests = [];
  const articlesPerRequest = Math.ceil(wikiCount / 3);
  
  for (let i = 0; i < 3; i++) {
    randomRequests.push(getWikiArticles(articlesPerRequest + 2));
  }
  
  const [randomBatch1, randomBatch2, randomBatch3, newsArticles] = await Promise.all([
    ...randomRequests.map(req => req.catch(() => [])),
    newsCount > 0 ? getBreakingNews(newsCount).catch(() => []) : Promise.resolve([])
  ]);

  const allRandomWiki = [...randomBatch1, ...randomBatch2, ...randomBatch3]
    .filter(article => article && article.image && !article.image.includes('placeholder'))
    .sort(() => Math.random() - 0.5)
    .sort(() => Math.random() - 0.5)
    .sort(() => Math.random() - 0.5);

  const selectedWiki = [];
  const usedIndices = new Set();
  
  while (selectedWiki.length < wikiCount && selectedWiki.length < allRandomWiki.length) {
    const randomIndex = Math.floor(Math.random() * allRandomWiki.length);
    if (!usedIndices.has(randomIndex)) {
      usedIndices.add(randomIndex);
      selectedWiki.push(allRandomWiki[randomIndex]);
    }
  }

  const mixedContent: ContentItem[] = [];
  const wikiPool = [...selectedWiki];
  const newsPool = [...newsArticles];

  const positions = Array.from({ length: count }, (_, i) => i);
  positions.sort(() => Math.random() - 0.5);

  for (let i = 0; i < count && (wikiPool.length > 0 || newsPool.length > 0); i++) {
    const useNews = newsPool.length > 0 && Math.random() < 0.2;
    
    if (useNews) {
      const randomNewsIndex = Math.floor(Math.random() * newsPool.length);
      const newsItem = newsPool.splice(randomNewsIndex, 1)[0];
      if (newsItem) mixedContent.push(newsItem);
    } else if (wikiPool.length > 0) {
      const randomWikiIndex = Math.floor(Math.random() * wikiPool.length);
      const wikiItem = wikiPool.splice(randomWikiIndex, 1)[0];
      if (wikiItem) mixedContent.push(wikiItem);
    } else if (newsPool.length > 0) {
      const randomNewsIndex = Math.floor(Math.random() * newsPool.length);
      const newsItem = newsPool.splice(randomNewsIndex, 1)[0];
      if (newsItem) mixedContent.push(newsItem);
    }
  }

  const finalContent = mixedContent
    .sort(() => Math.random() - 0.5)
    .sort(() => Math.random() - 0.5)
    .sort(() => Math.random() - 0.5);

  return finalContent.filter(item => item.image && !item.image.includes('placeholder'));
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
