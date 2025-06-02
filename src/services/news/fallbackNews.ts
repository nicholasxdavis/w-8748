
import { NewsArticle } from '../rssNewsService';

export const getFallbackNews = (count: number): NewsArticle[] => {
  const fallbackArticles = [
    {
      title: "Global Markets Show Strong Performance Amid Economic Recovery",
      content: "Financial markets across the globe are experiencing significant growth as economies continue to recover from recent challenges. Investors are showing renewed confidence in emerging markets and technology sectors...",
      source: "REUTERS"
    },
    {
      title: "Breakthrough in Renewable Energy Technology Announced",
      content: "Scientists have announced a major breakthrough in solar panel efficiency that could revolutionize the renewable energy sector. The new technology promises to reduce costs and increase adoption rates...",
      source: "TECHCRUNCH"
    },
    {
      title: "International Climate Summit Reaches Historic Agreement",
      content: "World leaders have reached a historic agreement on climate action at the international summit, setting ambitious targets for carbon reduction and sustainable development goals...",
      source: "BBC"
    },
    {
      title: "Major Advancement in Artificial Intelligence Research",
      content: "Researchers have made significant progress in developing more efficient AI models that require less computational power while maintaining high accuracy rates...",
      source: "NPR"
    },
    {
      title: "Space Exploration Mission Discovers New Findings",
      content: "A recent space mission has returned with unprecedented data about distant galaxies, providing new insights into the formation of the universe and potential for life...",
      source: "CNN"
    }
  ];
  
  return fallbackArticles.slice(0, count).map((article, index) => ({
    id: `fallback-${index}-${Date.now()}-${Math.random()}`,
    title: article.title,
    content: article.content,
    image: `https://picsum.photos/800/600?random=${index + Date.now()}`,
    publishedAt: new Date().toISOString(),
    source: article.source,
    url: '#',
    readTime: 3,
    views: Math.floor(Math.random() * 500000) + 100000,
    isBreakingNews: true as const,
    lastShown: Date.now().toString()
  }));
};
