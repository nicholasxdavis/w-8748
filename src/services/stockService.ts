
export interface StockData {
  id: string;
  type: 'stock';
  title: string;
  content: string;
  image: string;
  stocks: Array<{
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    marketCap?: string;
  }>;
}

// Top tech and major stocks
const TOP_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corp.' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.' },
  { symbol: 'META', name: 'Meta Platforms' },
  { symbol: 'NFLX', name: 'Netflix Inc.' }
];

const STOCK_IMAGES = [
  'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1633114128729-0c75d4babaad?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop'
];

export const getRandomStocks = async (count: number = 1): Promise<StockData[]> => {
  console.log('Generating stock data...');
  
  const stockCards: StockData[] = [];
  
  for (let i = 0; i < count; i++) {
    const selectedStocks = TOP_STOCKS.slice(0, 6).map(stock => {
      const basePrice = Math.random() * 300 + 50; // $50-$350
      const change = (Math.random() - 0.5) * 20; // -$10 to +$10
      const changePercent = (change / basePrice) * 100;
      
      return {
        symbol: stock.symbol,
        name: stock.name,
        price: parseFloat(basePrice.toFixed(2)),
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(changePercent.toFixed(2)),
        marketCap: `$${(Math.random() * 2000 + 100).toFixed(0)}B`
      };
    });

    const gainers = selectedStocks.filter(s => s.change > 0).length;
    const losers = selectedStocks.filter(s => s.change < 0).length;

    stockCards.push({
      id: `stock-${Date.now()}-${i}`,
      type: 'stock',
      title: 'Market Overview',
      content: `Current stock prices for major technology companies. Today's market shows ${gainers} gainers and ${losers} losers among top tech stocks. Average price movement is ${selectedStocks.reduce((acc, s) => acc + Math.abs(s.changePercent), 0) / selectedStocks.length}%.`,
      image: STOCK_IMAGES[Math.floor(Math.random() * STOCK_IMAGES.length)],
      stocks: selectedStocks
    });
  }

  console.log(`Generated ${stockCards.length} stock cards`);
  return stockCards;
};
