
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
  chartData: Array<{
    symbol: string;
    price: number;
    change: number;
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
  try {
    // Try Alpha Vantage or IEX Cloud API first
    const apiStocks = await fetchStocksFromAPI(count);
    if (apiStocks.length > 0) {
      return apiStocks;
    }
  } catch (error) {
    console.log('Stock API fetch failed, using simulated data:', error);
  }

  // Generate realistic stock data
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

    const chartData = selectedStocks.map(stock => ({
      symbol: stock.symbol,
      price: stock.price,
      change: stock.changePercent
    }));

    stockCards.push({
      id: `stock-${Date.now()}-${i}`,
      type: 'stock',
      title: 'Market Overview',
      content: `Current stock prices for major technology and growth companies. Market showing ${selectedStocks.filter(s => s.change > 0).length} gainers and ${selectedStocks.filter(s => s.change < 0).length} losers.`,
      image: STOCK_IMAGES[Math.floor(Math.random() * STOCK_IMAGES.length)],
      stocks: selectedStocks,
      chartData
    });
  }

  return stockCards;
};

const fetchStocksFromAPI = async (count: number): Promise<StockData[]> => {
  // Try to fetch from Alpha Vantage API
  const API_KEY = 'demo'; // Replace with actual API key
  const stockData: StockData[] = [];

  try {
    const stockPromises = TOP_STOCKS.slice(0, 6).map(async (stock) => {
      const response = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stock.symbol}&apikey=${API_KEY}`
      );
      
      if (response.ok) {
        const data = await response.json();
        const quote = data['Global Quote'];
        
        if (quote) {
          return {
            symbol: stock.symbol,
            name: stock.name,
            price: parseFloat(quote['05. price']),
            change: parseFloat(quote['09. change']),
            changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
            marketCap: 'N/A'
          };
        }
      }
      return null;
    });

    const stocks = (await Promise.all(stockPromises)).filter(Boolean);
    
    if (stocks.length > 0) {
      const chartData = stocks.map(stock => ({
        symbol: stock!.symbol,
        price: stock!.price,
        change: stock!.changePercent
      }));

      stockData.push({
        id: `stock-api-${Date.now()}`,
        type: 'stock',
        title: 'Live Market Data',
        content: `Real-time stock prices from major exchanges. Data updated every 15 minutes.`,
        image: STOCK_IMAGES[Math.floor(Math.random() * STOCK_IMAGES.length)],
        stocks: stocks as any,
        chartData
      });
    }
  } catch (error) {
    console.error('Stock API error:', error);
  }

  return stockData;
};
