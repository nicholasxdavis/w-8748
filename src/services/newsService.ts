
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
}

// Updated with more interesting and current breaking news stories
const BREAKING_NEWS_STORIES = [
  {
    title: "Revolutionary AI System Achieves Major Breakthrough in Quantum Computing",
    content: "Scientists have successfully integrated artificial intelligence with quantum computing systems, achieving computational speeds previously thought impossible. This breakthrough could revolutionize cryptography, drug discovery, and climate modeling within the next decade. The hybrid system demonstrated the ability to solve complex problems in seconds that would take traditional computers thousands of years.",
    source: "TechCrunch",
    category: "technology"
  },
  {
    title: "Historic Climate Agreement: 200+ Nations Commit to Net-Zero by 2035",
    content: "In an unprecedented global climate summit, over 200 nations have agreed to accelerate their carbon neutrality goals to 2035, a full 15 years ahead of previous commitments. The agreement includes massive funding for renewable energy infrastructure and revolutionary carbon capture technologies that could reverse decades of climate damage.",
    source: "Reuters",
    category: "environment"
  },
  {
    title: "Medical Miracle: Gene Therapy Cures Previously Incurable Genetic Diseases",
    content: "A groundbreaking gene therapy treatment has shown 100% success rate in clinical trials for treating rare genetic disorders affecting over 300 million people worldwide. The one-time treatment rewrites defective genes and has already restored sight to blind patients and mobility to paralyzed individuals.",
    source: "Nature Medicine",
    category: "health"
  },
  {
    title: "Space Discovery: Potentially Habitable Exoplanet Found Just 12 Light-Years Away",
    content: "Astronomers have discovered a potentially habitable exoplanet orbiting Proxima Centauri's neighbor star, featuring liquid water, a stable atmosphere, and conditions remarkably similar to Earth. This marks the closest potentially habitable world ever found and could be reached by next-generation space missions within decades.",
    source: "NASA",
    category: "space"
  },
  {
    title: "Economic Revolution: Universal Basic Income Trials Show Unprecedented Success",
    content: "Large-scale Universal Basic Income trials across 15 countries have demonstrated remarkable results, reducing poverty by 85% and increasing entrepreneurship by 300%. The program, funded by AI-generated wealth, is now being considered for global implementation by 2030.",
    source: "Financial Times",
    category: "economics"
  },
  {
    title: "Fusion Energy Breakthrough: First Commercial Fusion Power Plant Goes Online",
    content: "The world's first commercial fusion power plant has successfully begun generating clean, unlimited energy, marking the end of humanity's dependence on fossil fuels. The plant produces zero radioactive waste and enough energy to power 10 million homes continuously.",
    source: "Science",
    category: "energy"
  },
  {
    title: "Archaeological Sensation: Lost Civilization Discovered Beneath Amazon Rainforest",
    content: "Using advanced LiDAR technology, archaeologists have uncovered a massive ancient civilization beneath the Amazon rainforest, featuring sophisticated urban planning, advanced mathematics, and technologies that predate known civilizations by thousands of years. The discovery is rewriting human history.",
    source: "National Geographic",
    category: "archaeology"
  },
  {
    title: "Cybersecurity Alert: Quantum Encryption Shields Against Future Cyber Threats",
    content: "Researchers have successfully deployed quantum encryption networks across major cities, creating unhackable communication systems that protect against even quantum computer attacks. This technology promises to secure financial systems, government communications, and personal data against all known threats.",
    source: "MIT Technology Review",
    category: "cybersecurity"
  },
  {
    title: "Ocean Cleanup Success: 90% of Pacific Plastic Waste Removed in Record Time",
    content: "Revolutionary ocean cleanup technology has successfully removed 90% of plastic waste from the Great Pacific Garbage Patch in just 18 months. The breakthrough system uses AI-guided collection vessels and has sparked a global initiative to clean all ocean plastic by 2030.",
    source: "Ocean Conservancy",
    category: "environment"
  },
  {
    title: "Neuroscience Breakthrough: Brain-Computer Interfaces Restore Memory in Alzheimer's Patients",
    content: "Advanced brain-computer interfaces have successfully restored lost memories in Alzheimer's patients, offering hope to 55 million people worldwide living with dementia. The non-invasive technology stimulates neural pathways and has shown remarkable results in clinical trials.",
    source: "The Lancet",
    category: "neuroscience"
  }
];

const generateBreakingNews = (): NewsArticle[] => {
  return BREAKING_NEWS_STORIES.map((news, index) => {
    const hoursAgo = Math.floor(Math.random() * 6) + 1; // 1-6 hours ago for breaking news
    const publishedAt = new Date();
    publishedAt.setHours(publishedAt.getHours() - hoursAgo);

    const articleId = `breaking-news-${index}`;

    return {
      id: articleId,
      title: news.title,
      content: news.content,
      image: getNewsPlaceholderImage(articleId), // Use placeholder image
      publishedAt: publishedAt.toISOString(),
      source: news.source,
      url: `https://example.com/breaking-news/${index}`,
      readTime: Math.ceil(news.content.split(" ").length / 200),
      views: Math.floor(Math.random() * 100000) + 50000, // High view counts for breaking news
      isBreakingNews: true as const
    };
  });
};

export const getBreakingNews = async (count: number = 5): Promise<NewsArticle[]> => {
  try {
    // Simulate API delay for breaking news
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const breakingNews = generateBreakingNews();
    
    // Shuffle and return requested count
    const shuffled = breakingNews.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  } catch (error) {
    console.error('Error fetching breaking news:', error);
    return generateBreakingNews().slice(0, count);
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
