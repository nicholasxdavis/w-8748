
// High-quality placeholder images for news articles
const NEWS_PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80", // Earth from space
  "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80", // Technology/circuits
  "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80", // Medical/health
  "https://images.unsplash.com/photo-1581089778245-3ce67677f718?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80", // DNA/science
  "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80", // Nature/environment
  "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80", // Archaeology/ancient
  "https://images.unsplash.com/photo-1567095761054-7a02e69e5c43?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80", // Space/stars
  "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80", // Solar panels/renewable energy
  "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80", // Laboratory/research
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80", // Digital world map
];

export const getNewsPlaceholderImage = (articleId: string): string => {
  // Use article ID to consistently assign the same placeholder to the same article
  const hash = articleId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const index = Math.abs(hash) % NEWS_PLACEHOLDER_IMAGES.length;
  return NEWS_PLACEHOLDER_IMAGES[index];
};
