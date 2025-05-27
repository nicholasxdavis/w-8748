import { WikipediaArticle, WikipediaResponse } from './types';
import { fetchWikipediaContent } from './wikipediaApi';
import { transformToArticle } from './articleTransformer';

const getRelatedArticles = async (article: WikipediaArticle): Promise<WikipediaArticle[]> => {
  try {
    const categoryTitles = article.tags.map(tag => `Category:${tag}`).join('|');
    const params = new URLSearchParams({
      action: 'query',
      format: 'json',
      origin: '*',
      list: 'categorymembers',
      cmtitle: categoryTitles,
      cmlimit: '10',
      cmtype: 'page'
    });

    const categoryResponse = await fetch(`https://en.wikipedia.org/w/api.php?${params}`);
    if (!categoryResponse.ok) throw new Error('Failed to fetch category articles');
    
    const categoryData = await categoryResponse.json() as WikipediaResponse;
    const relatedTitles = categoryData.query?.categorymembers
      ?.filter(article => article.title !== article.title)
      ?.map(article => article.title)
      ?.slice(0, 10) || [];

    if (relatedTitles.length === 0) {
      return getRandomArticles(3);
    }

    const data = await fetchWikipediaContent(relatedTitles) as WikipediaResponse;
    const pages = Object.values(data.query?.pages || {});
    
    const articles = await Promise.all(pages.map(transformToArticle));
    return articles.filter(article => article !== null) as WikipediaArticle[];
  } catch (error) {
    console.error('Error fetching related articles:', error);
    return getRandomArticles(3);
  }
};

const getPopularArticles = async (count: number = 3): Promise<WikipediaArticle[]> => {
  // Expanded list of high-quality, popular Wikipedia articles
  const popularCategories = {
    science: [
      'Albert Einstein', 'Isaac Newton', 'Charles Darwin', 'Marie Curie',
      'Stephen Hawking', 'Nikola Tesla', 'Artificial intelligence',
      'Quantum mechanics', 'DNA', 'Black hole', 'Solar System',
      'Climate change', 'Evolution', 'Space exploration', 'Physics',
      'Chemistry', 'Biology', 'Astronomy', 'Genetics', 'Mathematics'
    ],
    history: [
      'World War II', 'Ancient Egypt', 'Roman Empire', 'World War I',
      'Renaissance', 'Industrial Revolution', 'American Civil War',
      'French Revolution', 'Cold War', 'Napoleon', 'Adolf Hitler',
      'Ancient Greece', 'Medieval period', 'Byzantine Empire',
      'Ottoman Empire', 'Mongol Empire', 'British Empire'
    ],
    people: [
      'Leonardo da Vinci', 'Shakespeare', 'Alexander the Great',
      'Julius Caesar', 'Cleopatra', 'George Washington', 'Abraham Lincoln',
      'Winston Churchill', 'Gandhi', 'Martin Luther King Jr.',
      'The Beatles', 'Michael Jackson', 'Pablo Picasso', 'Van Gogh'
    ],
    geography: [
      'United States', 'India', 'China', 'France', 'Germany', 'Japan',
      'Brazil', 'Russia', 'Australia', 'Egypt', 'Italy', 'United Kingdom',
      'Canada', 'Mexico', 'Spain', 'Greece', 'Turkey', 'South Africa'
    ],
    culture: [
      'Greek mythology', 'Philosophy', 'Psychology', 'Religion',
      'Art', 'Music', 'Literature', 'Cinema', 'Architecture',
      'Photography', 'Dance', 'Theater', 'Sculpture', 'Painting'
    ],
    technology: [
      'Internet', 'Computer', 'Smartphone', 'Automobile', 'Airplane',
      'Television', 'Radio', 'Electricity', 'Steam engine', 'Printing press',
      'Photography', 'Medicine', 'Vaccines', 'Antibiotics'
    ]
  };

  try {
    // Randomly select from different categories for variety
    const allTitles = Object.values(popularCategories).flat();
    const selectedTitles = allTitles
      .sort(() => 0.5 - Math.random())
      .slice(0, count * 3); // Get more to ensure we have enough valid articles

    const data = await fetchWikipediaContent(selectedTitles) as WikipediaResponse;
    const pages = Object.values(data.query?.pages || {});
    
    const articles = await Promise.all(pages.map(transformToArticle));
    const validArticles = articles.filter(article => article !== null) as WikipediaArticle[];
    
    return validArticles.slice(0, count);
  } catch (error) {
    console.error('Error fetching popular articles:', error);
    return getFeaturedArticles(count);
  }
};

const getFeaturedArticles = async (count: number = 3): Promise<WikipediaArticle[]> => {
  try {
    // Get featured articles which are typically high-quality and popular
    const params = new URLSearchParams({
      action: 'query',
      format: 'json',
      origin: '*',
      list: 'categorymembers',
      cmtitle: 'Category:Featured articles',
      cmlimit: (count * 3).toString(),
      cmtype: 'page',
      cmsort: 'timestamp',
      cmdir: 'desc'
    });

    const response = await fetch(`https://en.wikipedia.org/w/api.php?${params}`);
    if (!response.ok) throw new Error('Failed to fetch featured articles');
    
    const data = await response.json() as WikipediaResponse;
    const titles = data.query?.categorymembers
      ?.map(article => article.title)
      ?.slice(0, count * 2) || [];

    if (!titles.length) {
      return getPopularTopicArticles(count);
    }

    const articleData = await fetchWikipediaContent(titles) as WikipediaResponse;
    const pages = Object.values(articleData.query?.pages || {});
    
    const articles = await Promise.all(pages.map(transformToArticle));
    const validArticles = articles.filter(article => article !== null) as WikipediaArticle[];
    
    return validArticles.slice(0, count);
  } catch (error) {
    console.error('Error fetching featured articles:', error);
    return getPopularTopicArticles(count);
  }
};

const getPopularTopicArticles = async (count: number = 3): Promise<WikipediaArticle[]> => {
  // Popular topics that typically have good images and interesting content
  const popularTopics = [
    'Artificial intelligence', 'Climate change', 'Space exploration', 'Quantum computing',
    'Ancient Egypt', 'World War II', 'Leonardo da Vinci', 'Albert Einstein',
    'The Beatles', 'Olympic Games', 'Solar system', 'DNA',
    'Renaissance', 'Black holes', 'Evolution', 'Photography',
    'Psychology', 'Philosophy', 'Architecture', 'Medicine'
  ];

  try {
    // Randomly select topics
    const selectedTopics = popularTopics
      .sort(() => 0.5 - Math.random())
      .slice(0, count * 2);

    const data = await fetchWikipediaContent(selectedTopics) as WikipediaResponse;
    const pages = Object.values(data.query?.pages || {});
    
    const articles = await Promise.all(pages.map(transformToArticle));
    const validArticles = articles.filter(article => article !== null) as WikipediaArticle[];
    
    return validArticles.slice(0, count);
  } catch (error) {
    console.error('Error fetching popular topic articles:', error);
    throw error;
  }
};

const getRandomArticles = async (count: number = 10, category?: string): Promise<WikipediaArticle[]> => {
  try {
    // First try to get popular articles for better quality
    if (!category || category === "All") {
      const popularArticles = await getPopularArticles(count);
      if (popularArticles.length >= count) {
        return popularArticles.sort(() => 0.5 - Math.random()); // Shuffle for variety
      }
      
      // If we don't have enough popular articles, supplement with featured articles
      const additionalCount = count - popularArticles.length;
      const featuredArticles = await getFeaturedArticles(additionalCount);
      const combined = [...popularArticles, ...featuredArticles];
      return combined.sort(() => 0.5 - Math.random()).slice(0, count);
    }

    // Category-specific articles
    let titles: string[];
    const multiplier = 4; // Increased multiplier for more variety
    
    const params = new URLSearchParams({
      action: 'query',
      format: 'json',
      origin: '*',
      list: 'categorymembers',
      cmtitle: `Category:${category}`,
      cmlimit: (count * multiplier).toString(),
      cmtype: 'page',
      cmsort: 'timestamp',
      cmdir: 'desc'
    });

    const categoryResponse = await fetch(`https://en.wikipedia.org/w/api.php?${params}`);
    if (!categoryResponse.ok) throw new Error('Failed to fetch category articles');
    
    const categoryData = await categoryResponse.json() as WikipediaResponse;
    titles = categoryData.query?.categorymembers?.map(article => article.title) || [];

    if (!titles.length) throw new Error('No articles found');

    // Shuffle titles for variety
    titles = titles.sort(() => 0.5 - Math.random());

    const data = await fetchWikipediaContent(titles) as WikipediaResponse;
    const pages = Object.values(data.query?.pages || {});
    
    const articles = await Promise.all(pages.map(transformToArticle));
    const validArticles = articles.filter(article => article !== null) as WikipediaArticle[];
    
    if (validArticles.length < count) {
      const moreArticles = await getPopularArticles(count - validArticles.length);
      return [...validArticles, ...moreArticles].slice(0, count);
    }
    
    return validArticles.slice(0, count);
  } catch (error) {
    console.error('Error fetching articles:', error);
    return getPopularArticles(count);
  }
};

const searchArticles = async (query: string): Promise<WikipediaArticle[]> => {
  if (!query || query.length < 3) return [];

  try {
    const params = new URLSearchParams({
      action: 'query',
      format: 'json',
      origin: '*',
      list: 'search',
      srsearch: query,
      srlimit: '20'
    });

    const searchResponse = await fetch(`https://en.wikipedia.org/w/api.php?${params}`);
    if (!searchResponse.ok) throw new Error('Search request failed');
    
    const searchData = await searchResponse.json() as WikipediaResponse;
    if (!searchData.query?.search?.length) return [];

    const titles = searchData.query.search.map(result => result.title);
    const data = await fetchWikipediaContent(titles) as WikipediaResponse;
    const pages = Object.values(data.query?.pages || {});
    
    const articles = await Promise.all(pages.map(transformToArticle));
    return articles.filter(article => article !== null) as WikipediaArticle[];
  } catch (error) {
    console.error('Error searching articles:', error);
    throw error;
  }
};

export { 
  getRandomArticles,
  searchArticles,
  getRelatedArticles,
  type WikipediaArticle 
};
