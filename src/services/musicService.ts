
export interface Song {
  id: string;
  type: 'song';
  title: string;
  content: string;
  image: string;
  artist: string;
  album: string;
  year: number;
  genre: string;
  chartPosition?: number;
}

export interface Album {
  id: string;
  type: 'album';
  title: string;
  content: string;
  image: string;
  artist: string;
  year: number;
  genre: string;
  chartPosition?: number;
  tracks?: number;
}

export type MusicContent = Song | Album;

// Curated top songs and albums with high-quality images
const CURATED_SONGS: Omit<Song, 'id'>[] = [
  {
    type: 'song',
    title: 'Bohemian Rhapsody',
    content: 'Bohemian Rhapsody by Queen (1975) - One of the greatest rock songs of all time. This operatic rock ballad spent 9 weeks at #1 on the UK charts and revolutionized music videos.',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
    artist: 'Queen',
    album: 'A Night at the Opera',
    year: 1975,
    genre: 'Rock',
    chartPosition: 1
  },
  {
    type: 'song',
    title: 'Like a Rolling Stone',
    content: 'Like a Rolling Stone by Bob Dylan (1965) - Rolling Stone magazine\'s #1 greatest song of all time. This 6-minute epic changed the landscape of popular music forever.',
    image: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&h=600&fit=crop',
    artist: 'Bob Dylan',
    album: 'Highway 61 Revisited',
    year: 1965,
    genre: 'Folk Rock',
    chartPosition: 2
  },
  {
    type: 'song',
    title: 'Billie Jean',
    content: 'Billie Jean by Michael Jackson (1983) - The King of Pop\'s signature hit spent 7 weeks at #1 and helped break down racial barriers on MTV.',
    image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&h=600&fit=crop',
    artist: 'Michael Jackson',
    album: 'Thriller',
    year: 1983,
    genre: 'Pop',
    chartPosition: 1
  },
  {
    type: 'song',
    title: 'Hotel California',
    content: 'Hotel California by Eagles (1977) - This iconic rock ballad topped charts worldwide and won the Grammy for Record of the Year in 1978.',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&h=600&fit=crop',
    artist: 'Eagles',
    album: 'Hotel California',
    year: 1977,
    genre: 'Rock',
    chartPosition: 1
  }
];

const CURATED_ALBUMS: Omit<Album, 'id'>[] = [
  {
    type: 'album',
    title: 'Thriller',
    content: 'Thriller by Michael Jackson (1982) - The best-selling album of all time with over 70 million copies sold worldwide. Features 7 top 10 hits including "Billie Jean" and "Beat It".',
    image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&h=600&fit=crop',
    artist: 'Michael Jackson',
    year: 1982,
    genre: 'Pop',
    chartPosition: 1,
    tracks: 9
  },
  {
    type: 'album',
    title: 'The Dark Side of the Moon',
    content: 'The Dark Side of the Moon by Pink Floyd (1973) - Spent 14 years on the Billboard 200 chart. This conceptual masterpiece explores themes of conflict, greed, time, and mental illness.',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
    artist: 'Pink Floyd',
    year: 1973,
    genre: 'Progressive Rock',
    chartPosition: 1,
    tracks: 10
  },
  {
    type: 'album',
    title: 'Abbey Road',
    content: 'Abbey Road by The Beatles (1969) - The Beatles\' final recorded album featuring the iconic medley on side two and classics like "Come Together" and "Here Comes the Sun".',
    image: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&h=600&fit=crop',
    artist: 'The Beatles',
    year: 1969,
    genre: 'Rock',
    chartPosition: 1,
    tracks: 17
  },
  {
    type: 'album',
    title: 'Rumours',
    content: 'Rumours by Fleetwood Mac (1977) - One of the best-selling albums ever, born from the band\'s personal turmoil. Spent 31 weeks at #1 and won the Grammy for Album of the Year.',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&h=600&fit=crop',
    artist: 'Fleetwood Mac',
    year: 1977,
    genre: 'Rock',
    chartPosition: 1,
    tracks: 11
  }
];

export const getRandomMusic = async (count: number = 1): Promise<MusicContent[]> => {
  try {
    // Try to fetch from Spotify API or Billboard API first
    const apiMusic = await fetchMusicFromAPI(count);
    if (apiMusic.length > 0) {
      return apiMusic;
    }
  } catch (error) {
    console.log('Music API fetch failed, using curated music:', error);
  }

  // Fallback to curated content
  const allContent = [...CURATED_SONGS, ...CURATED_ALBUMS];
  const shuffled = [...allContent].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((music, index) => ({
    ...music,
    id: `music-${Date.now()}-${index}`
  }));
};

const fetchMusicFromAPI = async (count: number): Promise<MusicContent[]> => {
  // This is a placeholder for API integration
  // You can integrate with Spotify API, Last.fm API, Billboard API, etc.
  // Example: https://api.spotify.com/v1/playlists/{playlist_id}/tracks
  throw new Error('Music API not configured');
};
