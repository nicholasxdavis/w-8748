
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
    title: "Wise Words",
    content: '"The only way to do great work is to love what you do. If you haven\'t found it yet, keep looking. Don\'t settle." — Steve Jobs'
  },
  {
    type: 'quote',
    text: "Life is what happens to you while you're busy making other plans.",
    author: "John Lennon",
    category: "Life",
    image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=800&h=600&fit=crop",
    title: "Wise Words",
    content: '"Life is what happens to you while you\'re busy making other plans." — John Lennon'
  },
  {
    type: 'quote',
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
    category: "Dreams",
    image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=800&h=600&fit=crop",
    title: "Wise Words",
    content: '"The future belongs to those who believe in the beauty of their dreams." — Eleanor Roosevelt'
  },
  {
    type: 'quote',
    text: "In the middle of difficulty lies opportunity.",
    author: "Albert Einstein",
    category: "Opportunity",
    image: "https://images.unsplash.com/photo-1466442929976-97f336a657be?w=800&h=600&fit=crop",
    title: "Wise Words",
    content: '"In the middle of difficulty lies opportunity." — Albert Einstein'
  },
  {
    type: 'quote',
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
    category: "Perseverance",
    image: "https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=800&h=600&fit=crop",
    title: "Wise Words",
    content: '"Success is not final, failure is not fatal: it is the courage to continue that counts." — Winston Churchill'
  },
  {
    type: 'quote',
    text: "The only impossible journey is the one you never begin.",
    author: "Tony Robbins",
    category: "Action",
    image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=800&h=600&fit=crop",
    title: "Wise Words",
    content: '"The only impossible journey is the one you never begin." — Tony Robbins'
  },
  {
    type: 'quote',
    text: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt",
    category: "Belief",
    image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=800&h=600&fit=crop",
    title: "Wise Words",
    content: '"Believe you can and you\'re halfway there." — Theodore Roosevelt'
  },
  {
    type: 'quote',
    text: "Don't watch the clock; do what it does. Keep going.",
    author: "Sam Levenson",
    category: "Persistence",
    image: "https://images.unsplash.com/photo-1466442929976-97f336a657be?w=800&h=600&fit=crop",
    title: "Wise Words",
    content: '"Don\'t watch the clock; do what it does. Keep going." — Sam Levenson'
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
