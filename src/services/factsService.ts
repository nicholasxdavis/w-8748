
// Simple facts service that provides interesting facts for the feed
export interface DidYouKnowFact {
  id: string;
  title: string;
  content: string;
  image: string;
  category: string;
  type: 'fact';
}

const factCategories = [
  'science',
  'nature',
  'space',
  'history',
  'technology',
  'ocean',
  'animals',
  'psychology'
];

const factImages = [
  'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1464822759844-d150baef013c?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop'
];

const mindBlowingFacts = [
  {
    title: "Octopuses Have Three Hearts",
    content: "Octopuses have three hearts that pump blue blood through their bodies. Two hearts pump blood to the gills, while the third pumps blood to the rest of the body. The main heart stops beating when they swim, which is why they prefer crawling.",
    category: "animals"
  },
  {
    title: "Time Moves Slower on GPS Satellites",
    content: "Due to Einstein's theory of relativity, time actually moves faster on GPS satellites than on Earth. Without accounting for this time difference, GPS would be off by about 6 miles every day.",
    category: "science"
  },
  {
    title: "Honey Never Spoils",
    content: "Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly edible. Honey's low moisture content and acidic pH create an environment where bacteria cannot survive.",
    category: "nature"
  },
  {
    title: "Your Body Produces Diamond Dust",
    content: "When you move your joints, the pressure changes can cause tiny nitrogen bubbles to form and collapse, creating microscopic diamond crystals that dissolve almost instantly. This is what causes the popping sound.",
    category: "science"
  },
  {
    title: "Bananas Are Radioactive",
    content: "Bananas contain potassium-40, a naturally occurring radioactive isotope. You'd need to eat 10 million bananas at once to die from radiation poisoning. Scientists even use 'banana equivalent dose' as an informal unit of radiation exposure.",
    category: "science"
  },
  {
    title: "Water Can Boil and Freeze Simultaneously",
    content: "At exactly 0.01°C and a pressure of 611.657 pascals (the triple point of water), water exists as solid, liquid, and gas simultaneously. This is the only temperature and pressure where all three phases can coexist.",
    category: "science"
  }
];

export const getRandomFacts = async (count: number = 3): Promise<DidYouKnowFact[]> => {
  const facts: DidYouKnowFact[] = [];
  
  for (let i = 0; i < count; i++) {
    const randomFact = mindBlowingFacts[Math.floor(Math.random() * mindBlowingFacts.length)];
    const randomImage = factImages[Math.floor(Math.random() * factImages.length)];
    
    facts.push({
      id: `fact-${Date.now()}-${i}`,
      title: randomFact.title,
      content: randomFact.content,
      image: randomImage,
      category: randomFact.category,
      type: 'fact'
    });
  }
  
  return facts;
};
