
import { WikipediaArticle } from './wikipediaService';

// Facts service that fetches mind-blowing facts from external APIs
export interface DidYouKnowFact {
  id: string;
  title: string;
  content: string;
  image: string;
  category: string;
  type: 'fact';
}

const factImages = [
  'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1464822759844-d150baef013c?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&h=600&fit=crop'
];

const categories = [
  'science', 'nature', 'space', 'history', 'technology', 'ocean', 
  'animals', 'psychology', 'physics', 'biology', 'astronomy', 'chemistry'
];

// Cache for facts to avoid immediate repeats
const factsCache = new Set<string>();
const MAX_CACHE_SIZE = 100;

// Enhanced fallback facts with better content
const fallbackFacts = [
  {
    title: "Quick Fact",
    content: "Octopuses have three hearts that pump blue blood through their bodies. Two hearts pump blood to the gills, while the third pumps blood to the rest of the body. The main heart stops beating when they swim, which is why they prefer crawling.",
    category: "animals"
  },
  {
    title: "Quick Fact", 
    content: "Due to Einstein's theory of relativity, time actually moves faster on GPS satellites than on Earth. Without accounting for this time difference, GPS would be off by about 6 miles every day.",
    category: "science"
  },
  {
    title: "Quick Fact",
    content: "Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly edible. Honey's low moisture content and acidic pH create an environment where bacteria cannot survive.",
    category: "nature"
  },
  {
    title: "Quick Fact",
    content: "When you move your joints, the pressure changes can cause tiny nitrogen bubbles to form and collapse, creating microscopic diamond crystals that dissolve almost instantly. This is what causes the popping sound.",
    category: "science"
  },
  {
    title: "Quick Fact",
    content: "Bananas contain potassium-40, a naturally occurring radioactive isotope. You'd need to eat 10 million bananas at once to die from radiation poisoning. Scientists even use 'banana equivalent dose' as an informal unit of radiation exposure.",
    category: "science"
  },
  {
    title: "Quick Fact",
    content: "A single cloud can weigh more than a million pounds. Despite this massive weight, clouds float because the water droplets are so small and spread out that they're less dense than the surrounding air.",
    category: "nature"
  },
  {
    title: "Quick Fact",
    content: "Your brain uses about 20% of your body's total energy, despite only making up 2% of your body weight. It's like having a 20-watt light bulb constantly running in your head.",
    category: "science"
  },
  {
    title: "Quick Fact",
    content: "If you could fold a piece of paper in half 42 times, it would reach the moon. Each fold doubles the thickness, leading to exponential growth that quickly becomes astronomical.",
    category: "mathematics"
  }
];

// Improved API fetching with better content filtering
const fetchFactsFromAPIs = async (): Promise<any[]> => {
  const facts: any[] = [];

  try {
    // Try UselessFacts API with better filtering
    const uselessFactsResponse = await fetch('https://uselessfacts.jsph.pl/api/v2/facts/random?language=en');
    if (uselessFactsResponse.ok) {
      const uselessFact = await uselessFactsResponse.json();
      if (uselessFact.text && uselessFact.text.length > 30 && uselessFact.text.length < 500 && !uselessFact.text.includes('`')) {
        facts.push({
          title: "Quick Fact",
          content: uselessFact.text.trim(),
          category: "general",
          source: "useless"
        });
      }
    }
  } catch (error) {
    console.log('UselessFacts API failed:', error);
  }

  try {
    // Try Cat Facts API with filtering
    const catFactsResponse = await fetch('https://catfact.ninja/fact');
    if (catFactsResponse.ok) {
      const catFact = await catFactsResponse.json();
      if (catFact.fact && catFact.fact.length > 20 && catFact.fact.length < 300) {
        facts.push({
          title: "Quick Fact",
          content: catFact.fact.trim(),
          category: "animals",
          source: "cats"
        });
      }
    }
  } catch (error) {
    console.log('Cat Facts API failed:', error);
  }

  try {
    // Try Dog Facts API
    const dogFactsResponse = await fetch('https://dogapi.dog/api/v2/facts');
    if (dogFactsResponse.ok) {
      const dogFacts = await dogFactsResponse.json();
      if (dogFacts.data && dogFacts.data.length > 0) {
        const dogFact = dogFacts.data[0];
        if (dogFact.attributes && dogFact.attributes.body && dogFact.attributes.body.length > 20) {
          facts.push({
            title: "Quick Fact",
            content: dogFact.attributes.body.trim(),
            category: "animals",
            source: "dogs"
          });
        }
      }
    }
  } catch (error) {
    console.log('Dog Facts API failed:', error);
  }

  try {
    // Try another random fact API with better filtering
    const factsResponse = await fetch('https://api.api-ninjas.com/v1/facts?limit=5', {
      headers: {
        'X-Api-Key': 'demo'
      }
    });
    if (factsResponse.ok) {
      const randomFacts = await factsResponse.json();
      if (Array.isArray(randomFacts)) {
        randomFacts.forEach(factObj => {
          if (factObj.fact && factObj.fact.length > 30 && factObj.fact.length < 400 && !factObj.fact.includes('`')) {
            facts.push({
              title: "Quick Fact",
              content: factObj.fact.trim(),
              category: "general",
              source: "ninjas"
            });
          }
        });
      }
    }
  } catch (error) {
    console.log('API Ninjas failed:', error);
  }

  return facts;
};

export const getRandomFacts = async (count: number = 3): Promise<DidYouKnowFact[]> => {
  const facts: DidYouKnowFact[] = [];
  
  try {
    // First try to get facts from APIs
    const apiFacts = await fetchFactsFromAPIs();
    
    // Filter out facts we've shown recently and ensure quality
    const newApiFacts = apiFacts.filter(fact => 
      !factsCache.has(fact.content) && 
      fact.content.length > 20 && 
      fact.content.length < 500 &&
      !fact.content.includes('`') &&
      !fact.content.includes('looking for thing')
    );
    
    // Add API facts first
    for (let i = 0; i < Math.min(newApiFacts.length, count); i++) {
      const factData = newApiFacts[i];
      const randomImage = factImages[Math.floor(Math.random() * factImages.length)];
      
      const fact: DidYouKnowFact = {
        id: `fact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: "Quick Fact",
        content: factData.content,
        image: randomImage,
        category: factData.category,
        type: 'fact'
      };
      
      facts.push(fact);
      factsCache.add(fact.content);
    }
    
    // If we need more facts, use fallbacks
    while (facts.length < count) {
      const remainingFallbacks = fallbackFacts.filter(fact => !factsCache.has(fact.content));
      
      if (remainingFallbacks.length === 0) {
        // Clear cache if we've used all facts
        factsCache.clear();
        console.log('Cleared facts cache - starting fresh cycle');
      }
      
      const availableFacts = remainingFallbacks.length > 0 ? remainingFallbacks : fallbackFacts;
      const randomFact = availableFacts[Math.floor(Math.random() * availableFacts.length)];
      const randomImage = factImages[Math.floor(Math.random() * factImages.length)];
      
      const fact: DidYouKnowFact = {
        id: `fact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: "Quick Fact",
        content: randomFact.content,
        image: randomImage,
        category: randomFact.category,
        type: 'fact'
      };
      
      facts.push(fact);
      factsCache.add(fact.content);
    }
    
    // Manage cache size
    if (factsCache.size > MAX_CACHE_SIZE) {
      const cacheArray = Array.from(factsCache);
      factsCache.clear();
      // Keep the most recent half
      cacheArray.slice(-MAX_CACHE_SIZE / 2).forEach(fact => factsCache.add(fact));
    }
    
  } catch (error) {
    console.error('Error fetching facts:', error);
    
    // Fallback to static facts if all APIs fail
    for (let i = 0; i < count; i++) {
      const randomFact = fallbackFacts[Math.floor(Math.random() * fallbackFacts.length)];
      const randomImage = factImages[Math.floor(Math.random() * factImages.length)];
      
      facts.push({
        id: `fallback-fact-${Date.now()}-${i}`,
        title: "Quick Fact",
        content: randomFact.content,
        image: randomImage,
        category: randomFact.category,
        type: 'fact'
      });
    }
  }
  
  console.log(`Generated ${facts.length} facts from various sources`);
  return facts;
};
