
export interface DidYouKnowFact {
  id: string;
  title: string;
  content: string;
  image: string;
  category: string;
  type: 'fact';
  source?: string;
}

const factImages = [
  'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1464822759844-d150baef013c?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop'
];

// High-quality, verified facts from reliable sources
const PREMIUM_FACTS = [
  {
    title: "Did You Know",
    content: "The human brain contains approximately 86 billion neurons, each connected to thousands of others, creating a network more complex than any computer ever built. These connections form the basis of all human thought, memory, and consciousness.",
    category: "neuroscience",
    source: "National Institute of Health"
  },
  {
    title: "Did You Know", 
    content: "Octopuses have three hearts and blue blood. Two hearts pump blood to their gills, while the third pumps blood to the rest of their body. Their blood is blue because it contains copper-based hemocyanin instead of iron-based hemoglobin.",
    category: "marine biology",
    source: "Marine Biological Laboratory"
  },
  {
    title: "Did You Know",
    content: "A single teaspoon of neutron star material would weigh about 6 billion tons on Earth. Neutron stars are so dense that their gravity is 200 billion times stronger than Earth's gravity.",
    category: "astrophysics",
    source: "NASA Goddard Space Flight Center"
  },
  {
    title: "Did You Know",
    content: "Honey never spoils. Archaeologists have found edible honey in Egyptian tombs that are over 3,000 years old. Honey's low moisture content and acidic pH create an environment where bacteria cannot survive.",
    category: "food science",
    source: "Smithsonian Institution"
  },
  {
    title: "Did You Know",
    content: "The Great Wall of China is not visible from space with the naked eye, contrary to popular belief. This myth has been debunked by multiple astronauts, including those from the International Space Station.",
    category: "geography",
    source: "NASA"
  },
  {
    title: "Did You Know",
    content: "Trees can communicate with each other through underground networks of fungi called mycorrhizae. They share nutrients, water, and even warning signals about insect attacks through these 'wood wide web' networks.",
    category: "botany",
    source: "Nature Journal"
  }
];

const factsCache = new Set<string>();
const MAX_CACHE_SIZE = 50;

export const getRandomFacts = async (count: number = 3): Promise<DidYouKnowFact[]> => {
  const facts: DidYouKnowFact[] = [];
  
  try {
    // Try to get facts from reputable science APIs
    const apiFacts = await fetchFactsFromPremiumAPIs();
    
    // Filter high-quality facts
    const qualityApiFacts = apiFacts.filter(fact => 
      !factsCache.has(fact.content) && 
      fact.content.length > 50 && 
      fact.content.length < 400 &&
      !fact.content.toLowerCase().includes('unknown') &&
      !fact.content.toLowerCase().includes('approximately') // Remove vague facts
    );
    
    // Add premium API facts first
    for (let i = 0; i < Math.min(qualityApiFacts.length, count); i++) {
      const factData = qualityApiFacts[i];
      const randomImage = factImages[Math.floor(Math.random() * factImages.length)];
      
      const fact: DidYouKnowFact = {
        id: `fact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: "Did You Know",
        content: factData.content,
        image: randomImage,
        category: factData.category,
        type: 'fact',
        source: factData.source || 'Scientific Research'
      };
      
      facts.push(fact);
      factsCache.add(fact.content);
    }
    
    // Fill remaining with premium curated facts
    while (facts.length < count) {
      const availableFacts = PREMIUM_FACTS.filter(fact => !factsCache.has(fact.content));
      
      if (availableFacts.length === 0) {
        factsCache.clear();
        console.log('Cleared facts cache - starting fresh cycle');
      }
      
      const factsToUse = availableFacts.length > 0 ? availableFacts : PREMIUM_FACTS;
      const randomFact = factsToUse[Math.floor(Math.random() * factsToUse.length)];
      const randomImage = factImages[Math.floor(Math.random() * factImages.length)];
      
      const fact: DidYouKnowFact = {
        id: `fact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: "Did You Know",
        content: randomFact.content,
        image: randomImage,
        category: randomFact.category,
        type: 'fact',
        source: randomFact.source
      };
      
      facts.push(fact);
      factsCache.add(fact.content);
    }
    
    // Manage cache size
    if (factsCache.size > MAX_CACHE_SIZE) {
      const cacheArray = Array.from(factsCache);
      factsCache.clear();
      cacheArray.slice(-MAX_CACHE_SIZE / 2).forEach(fact => factsCache.add(fact));
    }
    
  } catch (error) {
    console.error('Error fetching premium facts:', error);
    
    // Fallback to curated premium facts
    for (let i = 0; i < count; i++) {
      const randomFact = PREMIUM_FACTS[Math.floor(Math.random() * PREMIUM_FACTS.length)];
      const randomImage = factImages[Math.floor(Math.random() * factImages.length)];
      
      facts.push({
        id: `premium-fact-${Date.now()}-${i}`,
        title: "Did You Know",
        content: randomFact.content,
        image: randomImage,
        category: randomFact.category,
        type: 'fact',
        source: randomFact.source
      });
    }
  }
  
  console.log(`Generated ${facts.length} premium facts from scientific sources`);
  return facts;
};

const fetchFactsFromPremiumAPIs = async (): Promise<any[]> => {
  const facts: any[] = [];

  try {
    // Try NASA API for space facts
    const nasaResponse = await fetch('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&count=3');
    if (nasaResponse.ok) {
      const nasaData = await nasaResponse.json();
      nasaData.forEach((item: any) => {
        if (item.explanation && item.explanation.length > 50 && item.explanation.length < 300) {
          facts.push({
            content: item.explanation,
            category: "space science",
            source: "NASA"
          });
        }
      });
    }
  } catch (error) {
    console.log('NASA API failed:', error);
  }

  try {
    // Try Numbers API for mathematical facts
    const numbersResponse = await fetch('http://numbersapi.com/random/trivia');
    if (numbersResponse.ok) {
      const numberFact = await numbersResponse.text();
      if (numberFact && numberFact.length > 30 && numberFact.length < 200) {
        facts.push({
          content: numberFact,
          category: "mathematics",
          source: "Numbers API"
        });
      }
    }
  } catch (error) {
    console.log('Numbers API failed:', error);
  }

  return facts;
};
