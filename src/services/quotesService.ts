
export interface Quote {
  id: string;
  type: 'quote';
  text: string;
  author: string;
  category: string;
  image: string;
  title: string;
  content: string;
}

// Curated inspirational quotes with high-quality images
const CURATED_QUOTES: Omit<Quote, 'id'>[] = [
  {
    type: 'quote',
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    category: "Motivation",
    image: "https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=800&h=600&fit=crop",
    title: "On Great Work",
    content: "The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle."
  },
  {
    type: 'quote',
    text: "Life is what happens to you while you're busy making other plans.",
    author: "John Lennon",
    category: "Life",
    image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=800&h=600&fit=crop",
    title: "On Life's Surprises",
    content: "Life is what happens to you while you're busy making other plans. Sometimes the most beautiful moments come when we least expect them."
  },
  {
    type: 'quote',
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
    category: "Dreams",
    image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=800&h=600&fit=crop",
    title: "On Dreams",
    content: "The future belongs to those who believe in the beauty of their dreams. Every great achievement begins with a dream and the courage to pursue it."
  },
  {
    type: 'quote',
    text: "In the middle of difficulty lies opportunity.",
    author: "Albert Einstein",
    category: "Opportunity",
    image: "https://images.unsplash.com/photo-1466442929976-97f336a657be?w=800&h=600&fit=crop",
    title: "On Opportunity",
    content: "In the middle of difficulty lies opportunity. Challenges are not roadblocks, but stepping stones to greater achievements."
  },
  {
    type: 'quote',
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
    category: "Perseverance",
    image: "https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=800&h=600&fit=crop",
    title: "On Courage",
    content: "Success is not final, failure is not fatal: it is the courage to continue that counts. What matters most is having the strength to keep moving forward."
  },
  {
    type: 'quote',
    text: "The only impossible journey is the one you never begin.",
    author: "Tony Robbins",
    category: "Action",
    image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=800&h=600&fit=crop",
    title: "On Beginning",
    content: "The only impossible journey is the one you never begin. Every expert was once a beginner, every master was once a disaster."
  },
  {
    type: 'quote',
    text: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt",
    category: "Belief",
    image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=800&h=600&fit=crop",
    title: "On Self-Belief",
    content: "Believe you can and you're halfway there. The power of positive thinking and self-confidence can overcome seemingly impossible obstacles."
  },
  {
    type: 'quote',
    text: "Don't watch the clock; do what it does. Keep going.",
    author: "Sam Levenson",
    category: "Persistence",
    image: "https://images.unsplash.com/photo-1466442929976-97f336a657be?w=800&h=600&fit=crop",
    title: "On Persistence",
    content: "Don't watch the clock; do what it does. Keep going. Time never stops, and neither should your determination to achieve your goals."
  }
];

export const getRandomQuotes = async (count: number = 1): Promise<Quote[]> => {
  try {
    // Try to fetch from API first (you can replace this with any quotes API)
    const apiQuotes = await fetchQuotesFromAPI(count);
    if (apiQuotes.length > 0) {
      return apiQuotes;
    }
  } catch (error) {
    console.log('API fetch failed, using curated quotes:', error);
  }

  // Fallback to curated quotes
  const shuffled = [...CURATED_QUOTES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((quote, index) => ({
    ...quote,
    id: `quote-${Date.now()}-${index}`
  }));
};

const fetchQuotesFromAPI = async (count: number): Promise<Quote[]> => {
  // This is a placeholder for API integration
  // You can integrate with APIs like quotegarden.com, quotable.io, etc.
  throw new Error('API not configured');
};
