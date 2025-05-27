
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

const getPopularArticles = async (count: number = 10): Promise<WikipediaArticle[]> => {
  // Expanded list of high-quality, popular Wikipedia articles by category
  // Each time we fetch, we'll pull from different categories to ensure variety
  const popularCategories = {
    science: [
      'Albert Einstein', 'Isaac Newton', 'Charles Darwin', 'Marie Curie',
      'Stephen Hawking', 'Nikola Tesla', 'Artificial intelligence',
      'Quantum mechanics', 'DNA', 'Black hole', 'Solar System',
      'Climate change', 'Evolution', 'Space exploration', 'Physics',
      'Chemistry', 'Biology', 'Astronomy', 'Genetics', 'Mathematics',
      'Nanotechnology', 'Renewable energy', 'Theory of relativity',
      'Supernova', 'Higgs boson', 'CRISPR', 'Nuclear fusion', 'Dark matter',
      'Neuroscience', 'Biotechnology', 'Quantum computing', 'String theory',
      'Artificial neural network', 'Big Bang', 'Viruses', 'Dinosaurs'
    ],
    history: [
      'World War II', 'Ancient Egypt', 'Roman Empire', 'World War I',
      'Renaissance', 'Industrial Revolution', 'American Civil War',
      'French Revolution', 'Cold War', 'Napoleon', 'Adolf Hitler',
      'Ancient Greece', 'Medieval period', 'Byzantine Empire',
      'Ottoman Empire', 'Mongol Empire', 'British Empire',
      'American Revolution', 'Alexander the Great', 'Cleopatra', 
      'Genghis Khan', 'Vikings', 'Aztec Empire', 'Maya civilization', 
      'Inca Empire', 'Ancient China', 'Samurai', 'Crusades', 
      'Black Death', 'Great Depression', 'Space Race'
    ],
    people: [
      'Leonardo da Vinci', 'Shakespeare', 'Alexander the Great',
      'Julius Caesar', 'Cleopatra', 'George Washington', 'Abraham Lincoln',
      'Winston Churchill', 'Gandhi', 'Martin Luther King Jr.',
      'The Beatles', 'Michael Jackson', 'Pablo Picasso', 'Van Gogh',
      'Steve Jobs', 'Bill Gates', 'Elon Musk', 'Walt Disney',
      'Elvis Presley', 'Marilyn Monroe', 'Charlie Chaplin', 'Mozart',
      'Ludwig van Beethoven', 'Queen Elizabeth II', 'Nelson Mandela',
      'Marie Antoinette', 'Anne Frank', 'Oprah Winfrey', 'Barack Obama'
    ],
    geography: [
      'United States', 'India', 'China', 'France', 'Germany', 'Japan',
      'Brazil', 'Russia', 'Australia', 'Egypt', 'Italy', 'United Kingdom',
      'Canada', 'Mexico', 'Spain', 'Greece', 'Turkey', 'South Africa',
      'Grand Canyon', 'Amazon Rainforest', 'Himalayas', 'Sahara Desert',
      'Great Barrier Reef', 'Mount Everest', 'Niagara Falls', 'Venice',
      'New York City', 'Tokyo', 'Paris', 'London', 'Rome', 'Rio de Janeiro'
    ],
    culture: [
      'Greek mythology', 'Philosophy', 'Psychology', 'Religion',
      'Art', 'Music', 'Literature', 'Cinema', 'Architecture',
      'Photography', 'Dance', 'Theater', 'Sculpture', 'Painting',
      'Fashion', 'Cuisine', 'Wine', 'Coffee', 'Chocolate',
      'Video games', 'Animation', 'Hip hop', 'Rock music',
      'Opera', 'Ballet', 'Jazz', 'Pop culture', 'Television'
    ],
    technology: [
      'Internet', 'Computer', 'Smartphone', 'Automobile', 'Airplane',
      'Television', 'Radio', 'Electricity', 'Steam engine', 'Printing press',
      'Photography', 'Medicine', 'Vaccines', 'Antibiotics', 'Blockchain',
      'Virtual reality', 'Augmented reality', 'Internet of Things',
      'Robotics', '3D printing', 'Social media', 'Search engine',
      'Video streaming', 'Cloud computing', 'Cryptocurrency',
      'Machine learning', 'Autonomous vehicles', 'Drones'
    ],
    nature: [
      'Lion', 'Tiger', 'Elephant', 'Giraffe', 'Dolphin', 'Whale',
      'Eagle', 'Penguin', 'Giant panda', 'Koala', 'Great white shark',
      'Blue whale', 'Gorilla', 'Polar bear', 'Wolf', 'Cheetah',
      'Hummingbird', 'Octopus', 'Butterfly', 'Narwhal', 'Chameleon',
      'Platypus', 'Komodo dragon', 'Kangaroo', 'Sloth', 'Honeybee',
      'Coral reef', 'Redwood tree', 'Venus flytrap', 'Sunflower'
    ],
    sports: [
      'Olympic Games', 'FIFA World Cup', 'Super Bowl', 'NBA', 'Tennis',
      'Golf', 'Cricket', 'Rugby', 'Formula 1', 'Boxing', 'Swimming',
      'Athletics', 'Gymnastics', 'Baseball', 'Hockey', 'Volleyball',
      'Skiing', 'Cycling', 'Mixed martial arts', 'Wrestling',
      'Surfing', 'Skateboarding', 'Marathon', 'Chess', 'eSports'
    ],
    entertainment: [
      'Star Wars', 'Harry Potter', 'Marvel Cinematic Universe',
      'Game of Thrones', 'The Lord of the Rings', 'Disney',
      'Stephen King', 'Friends (TV series)', 'Breaking Bad',
      'The Simpsons', 'Saturday Night Live', 'Academy Awards',
      'Grammy Awards', 'Broadway theatre', 'Cannes Film Festival',
      'Studio Ghibli', 'Anime', 'Manga', 'K-pop', 'Hollywood'
    ],
    food: [
      'Pizza', 'Sushi', 'Chocolate', 'Coffee', 'Tea', 'Wine',
      'Beer', 'Cheese', 'Bread', 'Pasta', 'Ice cream', 'Hamburger',
      'French cuisine', 'Italian cuisine', 'Japanese cuisine',
      'Chinese cuisine', 'Indian cuisine', 'Mexican cuisine',
      'Thai cuisine', 'Middle Eastern cuisine', 'Mediterranean diet'
    ]
  };

  try {
    // Select 2-3 random categories for variety
    const categories = Object.keys(popularCategories);
    const selectedCategories = [];
    
    // Always include at least 2 categories
    for (let i = 0; i < Math.min(3, categories.length); i++) {
      const randomIndex = Math.floor(Math.random() * categories.length);
      selectedCategories.push(categories.splice(randomIndex, 1)[0]);
    }
    
    // Gather articles from selected categories
    let allTitles = [];
    for (const category of selectedCategories) {
      const categoryTitles = popularCategories[category];
      // Shuffle the titles within each category
      const shuffled = [...categoryTitles].sort(() => 0.5 - Math.random());
      allTitles = [...allTitles, ...shuffled.slice(0, Math.ceil(count / selectedCategories.length) + 5)];
    }
    
    // Shuffle again for better mixing
    allTitles = allTitles.sort(() => 0.5 - Math.random()).slice(0, count * 2);

    const data = await fetchWikipediaContent(allTitles) as WikipediaResponse;
    const pages = Object.values(data.query?.pages || {});
    
    const articles = await Promise.all(pages.map(transformToArticle));
    const validArticles = articles.filter(article => article !== null) as WikipediaArticle[];
    
    if (validArticles.length < count) {
      // If we don't have enough articles, try the featured approach as backup
      const featuredArticles = await getFeaturedArticles(count - validArticles.length);
      return [...validArticles, ...featuredArticles].slice(0, count);
    }
    
    return validArticles.slice(0, count);
  } catch (error) {
    console.error('Error fetching popular articles:', error);
    return getFeaturedArticles(count);
  }
};

const getFeaturedArticles = async (count: number = 10): Promise<WikipediaArticle[]> => {
  try {
    // Using a much higher limit to ensure we get enough unique content
    const requestLimit = Math.max(count * 5, 50);
    
    // Get featured articles which are typically high-quality and popular
    const params = new URLSearchParams({
      action: 'query',
      format: 'json',
      origin: '*',
      list: 'categorymembers',
      cmtitle: 'Category:Featured articles',
      cmlimit: requestLimit.toString(),
      cmtype: 'page',
      cmsort: 'timestamp',
      cmdir: 'desc'
    });

    const response = await fetch(`https://en.wikipedia.org/w/api.php?${params}`);
    if (!response.ok) throw new Error('Failed to fetch featured articles');
    
    const data = await response.json() as WikipediaResponse;
    const titles = data.query?.categorymembers
      ?.map(article => article.title)
      ?.slice(0, requestLimit) || [];

    if (!titles.length) {
      return getRandomArticles(count);
    }

    // Shuffle titles for variety
    const shuffledTitles = titles.sort(() => 0.5 - Math.random());
    
    const articleData = await fetchWikipediaContent(shuffledTitles) as WikipediaResponse;
    const pages = Object.values(articleData.query?.pages || {});
    
    const articles = await Promise.all(pages.map(transformToArticle));
    const validArticles = articles.filter(article => article !== null) as WikipediaArticle[];
    
    return validArticles.slice(0, count);
  } catch (error) {
    console.error('Error fetching featured articles:', error);
    return getRandomArticles(count);
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
    const multiplier = 8; // Increased multiplier for more variety
    
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
