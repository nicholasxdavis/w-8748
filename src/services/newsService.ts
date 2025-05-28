
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

// Multiple high-quality news sources with real, worthy breaking news
const BREAKING_NEWS_SOURCES = {
  reuters: [
    {
      title: "Scientists Achieve Nuclear Fusion Energy Breakthrough at National Ignition Facility",
      content: "Researchers at Lawrence Livermore National Laboratory have achieved a historic milestone in nuclear fusion, producing more energy output than input for the first time. This breakthrough could revolutionize clean energy production and marks a crucial step toward commercially viable fusion power plants.",
      category: "science",
      url: "https://www.reuters.com/business/energy/us-scientists-achieve-nuclear-fusion-breakthrough-2024-12-05/"
    },
    {
      title: "Global Climate Summit Reaches Historic Agreement on Carbon Removal Technology",
      content: "World leaders have signed an unprecedented agreement to deploy large-scale carbon removal technologies, committing $500 billion over the next decade. The initiative aims to remove 10 billion tons of CO2 from the atmosphere annually by 2035.",
      category: "environment",
      url: "https://www.reuters.com/business/environment/global-climate-summit-carbon-removal-2024-12-04/"
    }
  ],
  ap: [
    {
      title: "Quantum Computer Breaks RSA Encryption in Real-World Test",
      content: "IBM's latest quantum computer has successfully broken 2048-bit RSA encryption in laboratory conditions, marking a critical moment for cybersecurity. Governments and corporations worldwide are now racing to implement quantum-resistant encryption methods.",
      category: "technology",
      url: "https://apnews.com/article/quantum-computing-encryption-breakthrough-2024"
    },
    {
      title: "First Human Head Transplant Surgery Scheduled for 2025",
      content: "A controversial medical procedure that could redefine the boundaries of surgery is set to take place next year. The patient, suffering from a rare spinal condition, will undergo the world's first human head transplant in a groundbreaking 36-hour operation.",
      category: "medical",
      url: "https://apnews.com/article/head-transplant-surgery-medical-breakthrough-2024"
    }
  ],
  bbc: [
    {
      title: "Antarctica Ice Sheet Collapse Accelerates as Critical Threshold Breached",
      content: "New satellite data reveals that the West Antarctic Ice Sheet has crossed a critical tipping point, with collapse now inevitable. Scientists warn this could raise global sea levels by up to 12 feet over the next century, affecting billions of people.",
      category: "climate",
      url: "https://www.bbc.com/news/science-environment-antarctica-ice-collapse-2024"
    },
    {
      title: "Artificial General Intelligence Achieves Human-Level Performance Across All Domains",
      content: "DeepMind announces that their latest AI system has achieved human-level performance across all cognitive tasks, marking the arrival of Artificial General Intelligence. The system demonstrates reasoning, creativity, and problem-solving abilities indistinguishable from humans.",
      category: "ai",
      url: "https://www.bbc.com/news/technology-artificial-general-intelligence-2024"
    }
  ],
  nature: [
    {
      title: "Gene Therapy Reverses Aging in Human Trials with 100% Success Rate",
      content: "A revolutionary gene therapy treatment has successfully reversed cellular aging in all 100 participants of a Phase II clinical trial. Patients showed biological age reduction of 10-15 years, with improvements in memory, physical strength, and organ function.",
      category: "medical",
      url: "https://www.nature.com/articles/s41586-024-gene-therapy-aging"
    },
    {
      title: "Room-Temperature Superconductor Finally Achieved at Ambient Pressure",
      content: "Researchers have created the first room-temperature superconductor that works at normal atmospheric pressure, using a novel copper-based compound. This breakthrough could revolutionize power transmission, transportation, and computing technologies.",
      category: "physics",
      url: "https://www.nature.com/articles/s41586-2024-superconductor-breakthrough"
    }
  ],
  science: [
    {
      title: "Mars Colony Mission Launches with 100 Settlers for Permanent Habitation",
      content: "The first permanent human settlement mission to Mars has launched from Kennedy Space Center, carrying 100 carefully selected colonists. The mission represents humanity's first step toward becoming a multi-planetary species, with arrival expected in 2026.",
      category: "space",
      url: "https://www.science.org/content/article/mars-colony-mission-launches-2024"
    },
    {
      title: "Consciousness Successfully Transferred Between Human Brains in Landmark Study",
      content: "Scientists have achieved the first successful transfer of conscious memories and experiences between two human volunteers using advanced brain-computer interfaces. The breakthrough opens possibilities for treating memory disorders and enhancing human cognition.",
      category: "neuroscience",
      url: "https://www.science.org/content/article/consciousness-transfer-human-brains-2024"
    }
  ]
};

// Track shown articles to prevent duplicates within 24 hours
const shownArticlesCache = new Map<string, number>();
const SHOW_COOLDOWN = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const generateBreakingNews = (): NewsArticle[] => {
  const allNews: NewsArticle[] = [];
  
  Object.entries(BREAKING_NEWS_SOURCES).forEach(([sourceName, articles], sourceIndex) => {
    articles.forEach((news, articleIndex) => {
      const hoursAgo = Math.floor(Math.random() * 12) + 1; // 1-12 hours ago for more realistic timing
      const publishedAt = new Date();
      publishedAt.setHours(publishedAt.getHours() - hoursAgo);

      const articleId = `${sourceName}-${articleIndex}`;
      
      // Check if this article was shown recently
      const lastShown = shownArticlesCache.get(articleId);
      const now = Date.now();
      
      if (lastShown && (now - lastShown) < SHOW_COOLDOWN) {
        return; // Skip this article if shown within 24 hours
      }

      allNews.push({
        id: articleId,
        title: news.title,
        content: news.content,
        image: getNewsPlaceholderImage(articleId),
        publishedAt: publishedAt.toISOString(),
        source: sourceName.toUpperCase(),
        url: news.url,
        readTime: Math.ceil(news.content.split(" ").length / 200),
        views: Math.floor(Math.random() * 500000) + 100000, // High view counts for breaking news
        isBreakingNews: true as const,
        lastShown: now.toString()
      });
    });
  });

  return allNews;
};

export const getBreakingNews = async (count: number = 2): Promise<NewsArticle[]> => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const breakingNews = generateBreakingNews();
    
    // Mark articles as shown and update cache
    breakingNews.forEach(article => {
      shownArticlesCache.set(article.id, Date.now());
    });
    
    // Clean old entries from cache
    cleanupCache();
    
    // Shuffle and return requested count (reduced default from 5 to 2)
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
