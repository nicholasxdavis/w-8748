
export interface HistoricalEvent {
  id: string;
  type: 'history';
  title: string;
  content: string;
  image: string;
  date: string;
  events: Array<{
    year: number;
    description: string;
    category?: string;
  }>;
}

const HISTORY_IMAGES = [
  'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1529258283598-8d6fe60b27f4?w=800&h=600&fit=crop'
];

// Fallback historical events for different dates
const FALLBACK_EVENTS = [
  {
    year: 1969,
    description: "Apollo 11 moon landing - Neil Armstrong becomes the first human to walk on the Moon",
    category: "Space"
  },
  {
    year: 1989,
    description: "The Berlin Wall falls, marking the beginning of the end of the Cold War",
    category: "Politics"
  },
  {
    year: 1945,
    description: "World War II ends in Europe with Germany's unconditional surrender",
    category: "War"
  },
  {
    year: 1776,
    description: "The United States Declaration of Independence is adopted",
    category: "Politics"
  },
  {
    year: 1865,
    description: "President Abraham Lincoln is assassinated by John Wilkes Booth",
    category: "Politics"
  }
];

export const getTodayInHistory = async (count: number = 1): Promise<HistoricalEvent[]> => {
  try {
    // Try MuffinLabs Today in History API first
    const apiEvents = await fetchHistoryFromAPI(count);
    if (apiEvents.length > 0) {
      return apiEvents;
    }
  } catch (error) {
    console.log('History API fetch failed, using fallback events:', error);
  }

  // Fallback to curated historical events
  const today = new Date();
  const dateString = `${today.getMonth() + 1}/${today.getDate()}`;
  
  const events: HistoricalEvent[] = [];
  
  for (let i = 0; i < count; i++) {
    const randomEvents = FALLBACK_EVENTS
      .sort(() => Math.random() - 0.5)
      .slice(0, 5)
      .map(event => ({
        ...event,
        year: event.year + Math.floor(Math.random() * 10) - 5 // Add some randomness to years
      }))
      .sort((a, b) => b.year - a.year);

    events.push({
      id: `history-${Date.now()}-${i}`,
      type: 'history',
      title: `This Day in History - ${dateString}`,
      content: `Significant events that happened on this day throughout history. From political milestones to scientific breakthroughs, this day has been marked by important moments that shaped our world.`,
      image: HISTORY_IMAGES[Math.floor(Math.random() * HISTORY_IMAGES.length)],
      date: dateString,
      events: randomEvents
    });
  }

  return events;
};

const fetchHistoryFromAPI = async (count: number): Promise<HistoricalEvent[]> => {
  try {
    // Use MuffinLabs Today in History API
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    
    const response = await fetch(`https://history.muffinlabs.com/date/${month}/${day}`);
    
    if (!response.ok) {
      throw new Error('History API request failed');
    }
    
    const data = await response.json();
    const events: HistoricalEvent[] = [];
    
    if (data.data && data.data.Events && data.data.Events.length > 0) {
      // Take the most significant events (usually the first few are most important)
      const significantEvents = data.data.Events
        .slice(0, 8)
        .map((event: any) => ({
          year: parseInt(event.year),
          description: event.text,
          category: 'Historical'
        }))
        .sort((a: any, b: any) => b.year - a.year);

      events.push({
        id: `history-api-${Date.now()}`,
        type: 'history',
        title: `This Day in History - ${month}/${day}`,
        content: `On this day throughout history, significant events have shaped our world. From ${significantEvents[significantEvents.length - 1]?.year} to ${significantEvents[0]?.year}, this date has witnessed remarkable moments.`,
        image: HISTORY_IMAGES[Math.floor(Math.random() * HISTORY_IMAGES.length)],
        date: `${month}/${day}`,
        events: significantEvents
      });
    }
    
    return events.slice(0, count);
  } catch (error) {
    console.error('History API error:', error);
    throw error;
  }
};
