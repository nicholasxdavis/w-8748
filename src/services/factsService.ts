
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

// Using Ninja API for facts and quotes
const NINJA_API_KEY = 'YOUR_API_KEY'; // This would be set in environment variables

export const getDidYouKnowFacts = async (count: number = 3): Promise<DidYouKnowFact[]> => {
  try {
    // Using a free facts API
    const response = await fetch('https://uselessfacts.jsph.pl/api/v2/facts/random?language=en');
    const data = await response.json();
    
    // Generate multiple facts by calling the API multiple times
    const facts: DidYouKnowFact[] = [];
    for (let i = 0; i < count; i++) {
      const factResponse = await fetch('https://uselessfacts.jsph.pl/api/v2/facts/random?language=en');
      const factData = await factResponse.json();
      
      facts.push({
        id: `fact-${i}-${Date.now()}`,
        fact: factData.text,
        source: factData.source_url || 'Unknown',
        category: 'General Knowledge'
      });
    }
    
    return facts;
  } catch (error) {
    console.error('Error fetching facts:', error);
    // Fallback facts
    return [
      {
        id: 'fact-fallback-1',
        fact: 'The Great Wall of China is not visible from space with the naked eye.',
        category: 'History',
        source: 'NASA'
      },
      {
        id: 'fact-fallback-2',
        fact: 'Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly edible.',
        category: 'Science',
        source: 'Smithsonian'
      }
    ];
  }
};

export const getHistoricQuotes = async (count: number = 3): Promise<HistoricQuote[]> => {
  try {
    // Using quotable API for quotes
    const quotes: HistoricQuote[] = [];
    
    for (let i = 0; i < count; i++) {
      const response = await fetch('https://api.quotable.io/random?minLength=50&maxLength=200');
      const data = await response.json();
      
      quotes.push({
        id: `quote-${i}-${Date.now()}`,
        quote: data.content,
        author: data.author,
        category: data.tags?.[0] || 'Wisdom'
      });
    }
    
    return quotes;
  } catch (error) {
    console.error('Error fetching quotes:', error);
    // Fallback quotes
    return [
      {
        id: 'quote-fallback-1',
        quote: 'The only way to do great work is to love what you do.',
        author: 'Steve Jobs',
        category: 'Motivation'
      },
      {
        id: 'quote-fallback-2',
        quote: 'In the middle of difficulty lies opportunity.',
        author: 'Albert Einstein',
        category: 'Wisdom'
      }
    ];
  }
};
