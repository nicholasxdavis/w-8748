
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
    "Historic Peace Agreement Signed in Region"
  ];

  const newsContent = [
    "In a groundbreaking development that could reshape our understanding of the subject, researchers have made significant progress that promises to impact millions worldwide. The implications of this discovery extend far beyond initial expectations, opening new possibilities for future innovations and applications in various fields.",
    "Following months of intensive negotiations and collaboration between international stakeholders, a comprehensive framework has been established to address critical challenges facing the global community. This landmark decision represents a unified approach to tackling complex issues that require coordinated international response.",
    "Advanced technological innovations continue to push the boundaries of what was previously thought possible, with recent achievements demonstrating remarkable progress in efficiency and capability. These developments signal a new era of technological advancement that could transform multiple industries.",
    "Extensive research conducted over several years has yielded unprecedented insights into fundamental questions that have puzzled scientists for decades. The findings challenge existing theories and provide new frameworks for understanding complex phenomena in the natural world."
  ];

  return Array.from({ length: 8 }, (_, index) => {
    const randomSource = NEWS_SOURCES[Math.floor(Math.random() * NEWS_SOURCES.length)];
    const randomTopic = newsTopics[Math.floor(Math.random() * newsTopics.length)];
    const randomContent = newsContent[Math.floor(Math.random() * newsContent.length)];
    
    // Generate dates from last 24 hours
    const hoursAgo = Math.floor(Math.random() * 24);
    const publishedAt = new Date();
    publishedAt.setHours(publishedAt.getHours() - hoursAgo);

    return {
      id: `news-${index}`,
      title: randomTopic,
      content: randomContent,
      image: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}?w=800&h=600&fit=crop&crop=entropy&auto=format`,
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
