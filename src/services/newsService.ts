
import { getNewsPlaceholderImage } from '../utils/newsPlaceholders';

export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  image: string;
  publishedAt: string;
  source: string;
  url: string;
  readTime: number;
  views: number;
  isBreakingNews: true;
  lastShown?: string;
}

// Current, relevant breaking news topics for 2025
const BREAKING_NEWS_SOURCES = {
  reuters: [
    {
      title: "OpenAI Announces GPT-5 with Revolutionary Reasoning Capabilities",
      content: "OpenAI has unveiled GPT-5, featuring advanced reasoning abilities that can solve complex mathematical proofs and scientific problems. The new model shows human-level performance in PhD-level physics and mathematics, marking a significant leap in AI capabilities.",
      category: "technology",
      url: "https://www.reuters.com/technology/openai-gpt5-announcement-2025/"
    },
    {
      title: "Global Climate Fund Reaches $2 Trillion Milestone for Green Energy Transition",
      content: "An unprecedented coalition of 195 countries has committed $2 trillion to accelerate the global transition to renewable energy. The fund aims to achieve net-zero emissions by 2030, five years ahead of previous targets.",
      category: "environment",
      url: "https://www.reuters.com/business/environment/climate-fund-2-trillion-2025/"
    },
    {
      title: "First Human Clone Successfully Developed for Organ Transplantation",
      content: "Scientists have successfully created the first human clone specifically for organ harvesting, raising ethical debates worldwide. The breakthrough could solve the global organ shortage crisis but faces significant regulatory hurdles.",
      category: "medical",
      url: "https://www.reuters.com/business/healthcare/human-clone-organ-transplant-2025/"
    }
  ],
  ap: [
    {
      title: "Quantum Internet Successfully Connects Major Cities Across Three Continents",
      content: "The world's first intercontinental quantum internet network is now operational, connecting New York, London, Tokyo, and Sydney. This unhackable communication network promises to revolutionize cybersecurity and financial transactions.",
      category: "technology",
      url: "https://apnews.com/article/quantum-internet-global-network-2025"
    },
    {
      title: "Antarctica Reveals Ancient Civilization Beneath Ice Sheet",
      content: "Archaeological teams have discovered evidence of an advanced civilization buried under Antarctica's ice for over 10,000 years. The find includes sophisticated structures and technology that could rewrite human history.",
      category: "science",
      url: "https://apnews.com/article/antarctica-ancient-civilization-discovery-2025"
    },
    {
      title: "Space Elevator Construction Begins with Revolutionary Carbon Nanotube Cable",
      content: "Japan has begun construction of the world's first space elevator using breakthrough carbon nanotube technology. The project promises to reduce space launch costs by 99% and make space travel accessible to civilians.",
      category: "space",
      url: "https://apnews.com/article/space-elevator-construction-japan-2025"
    }
  ],
  bbc: [
    {
      title: "Artificial Photosynthesis Plant Removes 1 Billion Tons of CO2 Annually",
      content: "A massive artificial photosynthesis facility in the Sahara Desert has begun operations, capable of removing 1 billion tons of CO2 from the atmosphere annually while producing clean hydrogen fuel.",
      category: "environment",
      url: "https://www.bbc.com/news/science-environment-artificial-photosynthesis-2025"
    },
    {
      title: "Brain-Computer Interface Allows Paralyzed Patients to Control Robotic Bodies",
      content: "A new brain-computer interface has enabled completely paralyzed patients to control sophisticated robotic bodies with thought alone. The technology offers hope for millions suffering from spinal injuries and neurodegenerative diseases.",
      category: "medical",
      url: "https://www.bbc.com/news/health-brain-computer-interface-2025"
    },
    {
      title: "Fusion Power Plant Achieves Commercial Viability, Powers 10 Million Homes",
      content: "The world's first commercially viable fusion power plant has begun operations in France, successfully powering 10 million homes with clean, unlimited energy. The breakthrough marks the beginning of the fusion energy era.",
      category: "energy",
      url: "https://www.bbc.com/news/science-fusion-power-commercial-2025"
    }
  ],
  cnn: [
    {
      title: "Digital Currency Replaces Cash in 50 Countries as CBDCs Go Global",
      content: "Central Bank Digital Currencies (CBDCs) have officially replaced physical cash in 50 countries, marking the largest monetary system change in human history. The transition promises to eliminate financial fraud and improve economic transparency.",
      category: "finance",
      url: "https://www.cnn.com/2025/business/cbdc-global-adoption"
    },
    {
      title: "Vertical Farms Now Produce 30% of World's Food Supply",
      content: "Revolutionary vertical farming technology has reached a tipping point, now producing 30% of the world's food supply using 95% less water and 90% less land than traditional agriculture.",
      category: "agriculture",
      url: "https://www.cnn.com/2025/business/vertical-farms-food-supply"
    }
  ]
};

// Track shown articles to prevent duplicates within 24 hours
const shownArticlesCache = new Map<string, number>();
const SHOW_COOLDOWN = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const generateBreakingNews = (): NewsArticle[] => {
  const allNews: NewsArticle[] = [];
  const now = new Date();
  
  Object.entries(BREAKING_NEWS_SOURCES).forEach(([sourceName, articles], sourceIndex) => {
    articles.forEach((news, articleIndex) => {
      const articleId = `${sourceName}-${articleIndex}`;
      
      // Check if this article was shown recently
      const lastShown = shownArticlesCache.get(articleId);
      const currentTime = Date.now();
      
      if (lastShown && (currentTime - lastShown) < SHOW_COOLDOWN) {
        return; // Skip this article if shown within 24 hours
      }

      // Generate realistic recent timestamps (1-12 hours ago)
      const hoursAgo = Math.floor(Math.random() * 12) + 1;
      const publishedAt = new Date(now);
      publishedAt.setHours(publishedAt.getHours() - hoursAgo);

      allNews.push({
        id: articleId,
        title: news.title,
        content: news.content,
        image: getNewsPlaceholderImage(articleId),
        publishedAt: publishedAt.toISOString(), // This will be current date minus hours
        source: sourceName.toUpperCase(),
        url: news.url,
        readTime: Math.ceil(news.content.split(" ").length / 200),
        views: Math.floor(Math.random() * 2000000) + 500000, // High view counts for breaking news
        isBreakingNews: true as const,
        lastShown: currentTime.toString()
      });
    });
  });

  return allNews;
};

export const getBreakingNews = async (count: number = 1): Promise<NewsArticle[]> => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const breakingNews = generateBreakingNews();
    
    // Mark articles as shown and update cache
    const selectedNews = breakingNews.slice(0, count);
    selectedNews.forEach(article => {
      shownArticlesCache.set(article.id, Date.now());
    });
    
    // Clean old entries from cache
    cleanupCache();
    
    // Shuffle and return requested count
    const shuffled = breakingNews.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, breakingNews.length));
  } catch (error) {
    console.error('Error fetching breaking news:', error);
    return [];
  }
};

export const searchNews = async (query: string): Promise<NewsArticle[]> => {
  if (!query || query.length < 3) return [];
  
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const allNews = generateBreakingNews();
  return allNews.filter(article => 
    article.title.toLowerCase().includes(query.toLowerCase()) ||
    article.content.toLowerCase().includes(query.toLowerCase())
  );
};

// Clean up old entries from the cache
const cleanupCache = () => {
  const now = Date.now();
  for (const [articleId, timestamp] of shownArticlesCache.entries()) {
    if (now - timestamp > SHOW_COOLDOWN) {
      shownArticlesCache.delete(articleId);
    }
  }
};

// Clean up cache every hour
setInterval(cleanupCache, 60 * 60 * 1000);
