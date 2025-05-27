
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

const NEWS_SOURCES = [
  { name: "BBC", country: "UK" },
  { name: "CNN", country: "US" },
  { name: "Reuters", country: "Global" },
  { name: "AP News", country: "US" },
  { name: "Al Jazeera", country: "Qatar" },
  { name: "France24", country: "France" },
  { name: "DW", country: "Germany" },
  { name: "Sky News", country: "UK" }
];

// High-quality news images from reliable sources
const getNewsImage = (topic: string, index: number): string => {
  const newsImages = [
    // Technology news images
    "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop&crop=entropy&auto=format", // Tech/AI
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop&crop=entropy&auto=format", // Space/Science
    "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&h=600&fit=crop&crop=entropy&auto=format", // Medical/Health
    "https://images.unsplash.com/photo-1476242906366-d8eb64c2f661?w=800&h=600&fit=crop&crop=entropy&auto=format", // Environment
    "https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?w=800&h=600&fit=crop&crop=entropy&auto=format", // Business/Economy
    "https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?w=800&h=600&fit=crop&crop=entropy&auto=format", // Politics/Government
    "https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800&h=600&fit=crop&crop=entropy&auto=format", // Research/Science
    "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&h=600&fit=crop&crop=entropy&auto=format", // Energy/Climate
  ];

  // Select image based on topic keywords or use index as fallback
  const topicLower = topic.toLowerCase();
  
  if (topicLower.includes('tech') || topicLower.includes('ai') || topicLower.includes('computer')) {
    return newsImages[0];
  } else if (topicLower.includes('space') || topicLower.includes('science') || topicLower.includes('quantum')) {
    return newsImages[1];
  } else if (topicLower.includes('health') || topicLower.includes('medical') || topicLower.includes('gene')) {
    return newsImages[2];
  } else if (topicLower.includes('climate') || topicLower.includes('environment') || topicLower.includes('energy')) {
    return newsImages[3];
  } else if (topicLower.includes('economic') || topicLower.includes('business') || topicLower.includes('trade')) {
    return newsImages[4];
  } else if (topicLower.includes('peace') || topicLower.includes('agreement') || topicLower.includes('summit')) {
    return newsImages[5];
  } else if (topicLower.includes('research') || topicLower.includes('discover') || topicLower.includes('study')) {
    return newsImages[6];
  } else {
    return newsImages[index % newsImages.length];
  }
};

const generateBreakingNews = (): NewsArticle[] => {
  const newsTopics = [
    "Global Climate Summit Reaches Historic Agreement",
    "Major Breakthrough in Quantum Computing Announced",
    "International Space Station Welcomes New Crew",
    "Revolutionary Gene Therapy Shows Promising Results",
    "World Leaders Gather for Emergency Economic Summit",
    "Scientists Discover New Species in Deep Ocean",
    "Major Archaeological Find Rewrites Ancient History",
    "Renewable Energy Milestone Achieved Globally",
    "Tech Giants Announce AI Safety Partnership",
    "Historic Peace Agreement Signed in Region",
    "Breakthrough Cancer Treatment Approved",
    "New Archaeological Discovery in Egypt",
    "International Trade Agreement Finalized",
    "Climate Technology Innovation Unveiled",
    "Space Exploration Mission Launches Successfully",
    "Medical Research Breakthrough Announced",
    "Global Economic Recovery Plan Unveiled",
    "Environmental Protection Initiative Launched"
  ];

  const newsContent = [
    "In a groundbreaking development that could reshape our understanding of the subject, researchers have made significant progress that promises to impact millions worldwide. The implications of this discovery extend far beyond initial expectations, opening new possibilities for future innovations and applications in various fields.",
    "Following months of intensive negotiations and collaboration between international stakeholders, a comprehensive framework has been established to address critical challenges facing the global community. This landmark decision represents a unified approach to tackling complex issues that require coordinated international response.",
    "Advanced technological innovations continue to push the boundaries of what was previously thought possible, with recent achievements demonstrating remarkable progress in efficiency and capability. These developments signal a new era of technological advancement that could transform multiple industries.",
    "Extensive research conducted over several years has yielded unprecedented insights into fundamental questions that have puzzled scientists for decades. The findings challenge existing theories and provide new frameworks for understanding complex phenomena in the natural world.",
    "International cooperation has reached new heights with this collaborative effort that brings together experts from multiple disciplines and nations. The project represents a significant step forward in addressing global challenges through shared knowledge and resources.",
    "Recent developments in the field have opened up entirely new avenues for exploration and application. The breakthrough represents years of dedicated research and could have far-reaching implications for how we approach similar challenges in the future."
  ];

  return Array.from({ length: 12 }, (_, index) => {
    const randomSource = NEWS_SOURCES[Math.floor(Math.random() * NEWS_SOURCES.length)];
    const randomTopic = newsTopics[Math.floor(Math.random() * newsTopics.length)];
    const randomContent = newsContent[Math.floor(Math.random() * newsContent.length)];
    
    // Generate dates from last 24 hours
    const hoursAgo = Math.floor(Math.random() * 24);
    const publishedAt = new Date();
    publishedAt.setHours(publishedAt.getHours() - hoursAgo);

    return {
      id: `news-${index}-${Date.now()}`,
      title: randomTopic,
      content: randomContent,
      image: getNewsImage(randomTopic, index),
      publishedAt: publishedAt.toISOString(),
      source: randomSource.name,
      url: `https://example.com/news/${index}`,
      readTime: Math.ceil(randomContent.split(" ").length / 200),
      views: Math.floor(Math.random() * 10000) + 1000,
      isBreakingNews: true as const
    };
  });
};

export const getBreakingNews = async (count: number = 5): Promise<NewsArticle[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const allNews = generateBreakingNews();
  return allNews.slice(0, count);
};

export const searchNews = async (query: string): Promise<NewsArticle[]> => {
  if (!query || query.length < 3) return [];
  
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const allNews = generateBreakingNews();
  return allNews.filter(article => 
    article.title.toLowerCase().includes(query.toLowerCase()) ||
    article.content.toLowerCase().includes(query.toLowerCase())
  );
};
