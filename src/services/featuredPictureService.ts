
export interface FeaturedPicture {
  id: string;
  type: 'featured-picture';
  title: string;
  content: string;
  image: string;
  photographer?: string;
  date: string;
  description: string;
}

export const getTodaysFeaturedPicture = async (count: number = 1): Promise<FeaturedPicture[]> => {
  console.log('Fetching today\'s featured picture...');
  
  try {
    const today = new Date().toISOString().split('T')[0];
    const response = await fetch(
      `https://en.wikipedia.org/api/rest_v1/feed/featured/${today.replace(/-/g, '/')}`
    );
    
    if (!response.ok) {
      throw new Error('Featured picture API failed');
    }
    
    const data = await response.json();
    const picture = data.image;
    
    if (picture && picture.title && picture.thumbnail) {
      return [{
        id: `featured-picture-${Date.now()}`,
        type: 'featured-picture',
        title: picture.title.replace('File:', '').replace(/\.[^/.]+$/, ''),
        content: picture.description?.text || 'Today\'s featured picture from Wikipedia showcases exceptional photography and visual content.',
        image: picture.thumbnail.source || picture.image.source,
        photographer: picture.artist?.text || 'Unknown',
        date: today,
        description: picture.description?.text || ''
      }];
    }
    
    throw new Error('No featured picture data');
  } catch (error) {
    console.error('Error fetching featured picture:', error);
    
    // Fallback to curated featured pictures
    const fallbackPictures = [
      {
        title: 'Aurora Borealis',
        content: 'The Aurora Borealis, or Northern Lights, is a natural light display in Earth\'s sky, predominantly seen in high-latitude regions.',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
        description: 'A stunning display of the Aurora Borealis captured in the Arctic sky.'
      },
      {
        title: 'Milky Way Galaxy',
        content: 'The Milky Way is the galaxy that includes our Solar System, appearing as a hazy band of light in the night sky.',
        image: 'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=800&h=600&fit=crop',
        description: 'A breathtaking view of the Milky Way galaxy from Earth.'
      }
    ];
    
    const fallback = fallbackPictures[Math.floor(Math.random() * fallbackPictures.length)];
    return [{
      id: `featured-picture-fallback-${Date.now()}`,
      type: 'featured-picture',
      title: fallback.title,
      content: fallback.content,
      image: fallback.image,
      photographer: 'Wikipedia Commons',
      date: new Date().toISOString().split('T')[0],
      description: fallback.description
    }];
  }
};
