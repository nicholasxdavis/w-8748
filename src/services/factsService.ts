
export interface DidYouKnowFact {
  id: string;
  fact: string;
  category?: string;
  source?: string;
}

export interface HistoricQuote {
  id: string;
  quote: string;
  author: string;
  category?: string;
  year?: string;
}

// Cache for better performance
const factsCache = new Map<number, DidYouKnowFact[]>();
const quotesCache = new Map<number, HistoricQuote[]>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export const getDidYouKnowFacts = async (count: number = 3): Promise<DidYouKnowFact[]> => {
  // Check cache first
  const cached = factsCache.get(count);
  if (cached) {
    console.log('Using cached facts');
    return cached.slice(0, count);
  }

  try {
    // Using NumbersAPI for more interesting facts
    const facts: DidYouKnowFact[] = [];
    
    // Get a mix of different fact types
    const factTypes = ['trivia', 'math', 'date', 'year'];
    
    for (let i = 0; i < count; i++) {
      try {
        const factType = factTypes[i % factTypes.length];
        let url = '';
        
        switch (factType) {
          case 'trivia':
            url = 'http://numbersapi.com/random/trivia';
            break;
          case 'math':
            url = 'http://numbersapi.com/random/math';
            break;
          case 'date':
            url = 'http://numbersapi.com/random/date';
            break;
          case 'year':
            url = 'http://numbersapi.com/random/year';
            break;
        }
        
        const response = await fetch(url);
        const factText = await response.text();
        
        facts.push({
          id: `fact-${factType}-${i}-${Date.now()}`,
          fact: factText,
          category: factType.charAt(0).toUpperCase() + factType.slice(1),
          source: 'Numbers API'
        });
      } catch (error) {
        console.warn(`Failed to fetch ${factType} fact:`, error);
      }
    }
    
    // If we got some facts, cache them
    if (facts.length > 0) {
      factsCache.set(count, facts);
      setTimeout(() => factsCache.delete(count), CACHE_DURATION);
      return facts;
    }
    
    // Fallback facts if API fails
    return [
      {
        id: 'fact-fallback-1',
        fact: 'The human brain contains approximately 86 billion neurons, more than the number of stars in the Milky Way galaxy.',
        category: 'Science',
        source: 'Neuroscience Research'
      },
      {
        id: 'fact-fallback-2',
        fact: 'A single bolt of lightning contains enough energy to power a 100-watt light bulb for over 3 months.',
        category: 'Physics',
        source: 'National Weather Service'
      },
      {
        id: 'fact-fallback-3',
        fact: 'The Great Pyramid of Giza was the tallest man-made structure in the world for over 3,800 years.',
        category: 'History',
        source: 'Archaeological Records'
      }
    ].slice(0, count);
    
  } catch (error) {
    console.error('Error fetching facts:', error);
    // Return fallback facts
    return [
      {
        id: 'fact-fallback-1',
        fact: 'The human brain contains approximately 86 billion neurons, more than the number of stars in the Milky Way galaxy.',
        category: 'Science',
        source: 'Neuroscience Research'
      }
    ];
  }
};

export const getHistoricQuotes = async (count: number = 3): Promise<HistoricQuote[]> => {
  // Check cache first
  const cached = quotesCache.get(count);
  if (cached) {
    console.log('Using cached quotes');
    return cached.slice(0, count);
  }

  try {
    const quotes: HistoricQuote[] = [];
    
    // Fetch quotes one by one to ensure we get different ones
    for (let i = 0; i < count; i++) {
      try {
        const response = await fetch('https://api.quotable.io/random?minLength=40&maxLength=180&tags=wisdom|motivational|inspirational|science|philosophy');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        quotes.push({
          id: `quote-${i}-${Date.now()}`,
          quote: data.content,
          author: data.author,
          category: data.tags?.[0] || 'Wisdom'
        });
        
        // Small delay to avoid hitting rate limits
        if (i < count - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.warn(`Failed to fetch quote ${i}:`, error);
      }
    }
    
    // Cache the results
    if (quotes.length > 0) {
      quotesCache.set(count, quotes);
      setTimeout(() => quotesCache.delete(count), CACHE_DURATION);
      return quotes;
    }
    
    // Fallback quotes if API fails
    return [
      {
        id: 'quote-fallback-1',
        quote: 'The only way to do great work is to love what you do. If you haven\'t found it yet, keep looking. Don\'t settle.',
        author: 'Steve Jobs',
        category: 'Motivation'
      },
      {
        id: 'quote-fallback-2',
        quote: 'Imagination is more important than knowledge. Knowledge is limited, imagination embraces the entire world.',
        author: 'Albert Einstein',
        category: 'Science'
      },
      {
        id: 'quote-fallback-3',
        quote: 'The future belongs to those who believe in the beauty of their dreams.',
        author: 'Eleanor Roosevelt',
        category: 'Inspiration'
      }
    ].slice(0, count);
    
  } catch (error) {
    console.error('Error fetching quotes:', error);
    // Return fallback quotes
    return [
      {
        id: 'quote-fallback-1',
        quote: 'The only way to do great work is to love what you do.',
        author: 'Steve Jobs',
        category: 'Motivation'
      }
    ];
  }
};
