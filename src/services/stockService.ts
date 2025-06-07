
export interface StockData {
  id: string;
  type: 'stock';
  title: string;
  content: string;
  image: string;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap?: string;
  volume?: string;
  sector?: string;
}

// Curated top stocks with financial data
const CURATED_STOCKS: Omit<StockData, 'id'>[] = [
  {
    type: 'stock',
    title: 'Apple Inc. (AAPL)',
    content: 'Apple Inc. - The world\'s most valuable company by market capitalization. Known for iPhone, Mac, iPad, and services. Current price reflects strong quarterly earnings and continued innovation in AI and services.',
    image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop',
    symbol: 'AAPL',
    price: 185.92,
    change: 2.15,
    changePercent: 1.17,
    marketCap: '$2.89T',
    volume: '45.2M',
    sector: 'Technology'
  },
  {
    type: 'stock',
    title: 'Microsoft Corporation (MSFT)',
    content: 'Microsoft Corporation - Leading technology company in cloud computing, productivity software, and AI. Azure cloud platform continues to drive strong revenue growth.',
    image: 'https://images.unsplash.com/photo-1633114128729-0c75d4babaad?w=800&h=600&fit=crop',
    symbol: 'MSFT',
    price: 378.85,
    change: -1.42,
    changePercent: -0.37,
    marketCap: '$2.81T',
    volume: '22.8M',
    sector: 'Technology'
  },
  {
    type: 'stock',
    title: 'NVIDIA Corporation (NVDA)',
    content: 'NVIDIA Corporation - Leading AI and graphics chip manufacturer. Stock has surged on AI boom and data center demand. Key player in the artificial intelligence revolution.',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop',
    symbol: 'NVDA',
    price: 875.28,
    change: 15.67,
    changePercent: 1.82,
    marketCap: '$2.16T',
    volume: '38.9M',
    sector: 'Technology'
  },
  {
    type: 'stock',
    title: 'Tesla, Inc. (TSLA)',
    content: 'Tesla, Inc. - Electric vehicle and clean energy company led by Elon Musk. Stock volatile but showing strong fundamentals with growing EV market share and energy storage business.',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
    symbol: 'TSLA',
    price: 248.42,
    change: 8.93,
    changePercent: 3.73,
    marketCap: '$789B',
    volume: '67.1M',
    sector: 'Automotive'
  }
];

export const getRandomStocks = async (count: number = 1): Promise<StockData[]> => {
  try {
    // Try to fetch from financial API first
    const apiStocks = await fetchStocksFromAPI(count);
    if (apiStocks.length > 0) {
      return apiStocks;
    }
  } catch (error) {
    console.log('Stock API fetch failed, using curated stocks:', error);
  }

  // Fallback to curated stocks
  const shuffled = [...CURATED_STOCKS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((stock, index) => ({
    ...stock,
    id: `stock-${Date.now()}-${index}`
  }));
};

const fetchStocksFromAPI = async (count: number): Promise<StockData[]> => {
  // This is a placeholder for API integration
  // You can integrate with Alpha Vantage, Yahoo Finance, IEX Cloud, etc.
  // Example: https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=YOUR_API_KEY
  throw new Error('Stock API not configured');
};
