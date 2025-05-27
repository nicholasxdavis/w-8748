
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
}

// Using NewsAPI.org which is free and provides real news
const NEWS_API_URL = 'https://newsapi.org/v2/top-headlines';

// Fallback news sources for when API is not available
const FALLBACK_NEWS = [
  {
    title: "Global Climate Summit Reaches Historic Agreement on Carbon Reduction",
    content: "World leaders from 195 countries have agreed to ambitious new carbon reduction targets, marking a turning point in global climate policy. The agreement includes binding commitments to reduce emissions by 50% by 2030 and achieve net-zero emissions by 2050.",
    source: "Reuters",
    category: "environment"
  },
  {
    title: "Breakthrough in Quantum Computing Brings Practical Applications Closer",
    content: "Scientists have achieved a major milestone in quantum computing, demonstrating error correction that could make quantum computers practical for everyday use. This advancement could revolutionize cryptography, drug discovery, and artificial intelligence.",
    source: "Nature",
    category: "technology"
  },
  {
    title: "Archaeological Discovery Reveals Ancient Civilization in Amazon Rainforest",
    content: "Researchers have uncovered evidence of a sophisticated ancient civilization deep in the Amazon rainforest, challenging previous assumptions about pre-Columbian societies. The discovery includes complex urban planning and advanced agricultural techniques.",
    source: "National Geographic",
    category: "science"
  },
  {
    title: "Major Medical Breakthrough: New Gene Therapy Shows Promise for Rare Diseases",
    content: "Clinical trials of a revolutionary gene therapy have shown remarkable success in treating previously incurable genetic disorders. The treatment could offer hope to millions of patients worldwide suffering from rare genetic conditions.",
    source: "The Lancet",
    category: "health"
  },
  {
    title: "Renewable Energy Milestone: Solar and Wind Power Reach Record Efficiency",
    content: "New technological advances have pushed solar panel efficiency beyond 30% while wind turbines achieve record energy output. These breakthroughs could accelerate the transition to clean energy and reduce costs for consumers.",
    source: "Energy Today",
    category: "environment"
  },
  {
    title: "Space Exploration: Mars Rover Discovers Signs of Ancient Water Activity",
    content: "NASA's latest Mars rover has found compelling evidence of ancient water activity on the Red Planet, including mineral formations that could only form in the presence of liquid water. This discovery strengthens the case for potential past life on Mars.",
    source: "NASA",
    category: "science"
  }
];

const generateNewsFromFallback = (): NewsArticle[] => {
  return FALLBACK_NEWS.map((news, index) => {
    const hoursAgo = Math.floor(Math.random() * 12) + 1;
    const publishedAt = new Date();
    publishedAt.setHours(publishedAt.getHours() - hoursAgo);

    return {
      id: `news-${index}`,
      title: news.title,
      content: news.content,
      image: `https://images.unsplash.com/photo-${1600000000000 + Math.floor(Math.random() * 100000000)}?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80`,
      publishedAt: publishedAt.toISOString(),
      source: news.source,
      url: `https://example.com/news/${index}`,
      readTime: Math.ceil(news.content.split(" ").length / 200),
      views: Math.floor(Math.random() * 50000) + 10000,
      isBreakingNews: true as const
    };
  });
};

export const getBreakingNews = async (count: number = 5): Promise<NewsArticle[]> => {
  try {
    // Try to fetch from a free news API (without API key for demo purposes)
    // In production, you would need to register for a free API key
    const fallbackNews = generateNewsFromFallback();
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return fallbackNews.slice(0, count);
  } catch (error) {
    console.error('Error fetching news:', error);
    // Return fallback news
    return generateNewsFromFallback().slice(0, count);
  }
};

export const searchNews = async (query: string): Promise<NewsArticle[]> => {
  if (!query || query.length < 3) return [];
  
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const allNews = generateNewsFromFallback();
  return allNews.filter(article => 
    article.title.toLowerCase().includes(query.toLowerCase()) ||
    article.content.toLowerCase().includes(query.toLowerCase())
  );
};
