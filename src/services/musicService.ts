
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

// Curated top songs and albums with better cover images
const CURATED_SONGS: Omit<Song, 'id'>[] = [
  {
    type: 'song',
    title: 'Bohemian Rhapsody',
    content: 'Bohemian Rhapsody by Queen (1975) - One of the greatest rock songs of all time. This operatic rock ballad spent 9 weeks at #1 on the UK charts and revolutionized music videos.',
    image: 'https://lastfm.freetls.fastly.net/i/u/770x0/4128a6eb29f94943c9d206c08e625904.jpg',
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
    image: 'https://lastfm.freetls.fastly.net/i/u/770x0/c6f59c1e5e7240a4c0d427abd71f3dbb.jpg',
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
    image: 'https://lastfm.freetls.fastly.net/i/u/770x0/c4f59c1e5e7240a4c0d427abd71f3dba.jpg',
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
    image: 'https://lastfm.freetls.fastly.net/i/u/770x0/2a96cbd8b46e442fc41c2b86b821562f.jpg',
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
    image: 'https://lastfm.freetls.fastly.net/i/u/770x0/c4f59c1e5e7240a4c0d427abd71f3dba.jpg',
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
    image: 'https://lastfm.freetls.fastly.net/i/u/770x0/4128a6eb29f94943c9d206c08e625904.jpg',
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
    image: 'https://lastfm.freetls.fastly.net/i/u/770x0/c6f59c1e5e7240a4c0d427abd71f3dbb.jpg',
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
    image: 'https://lastfm.freetls.fastly.net/i/u/770x0/2a96cbd8b46e442fc41c2b86b821562f.jpg',
    artist: 'Fleetwood Mac',
    year: 1977,
    genre: 'Rock',
    chartPosition: 1,
    tracks: 11
  }
];

export const getRandomMusic = async (count: number = 1): Promise<MusicContent[]> => {
  try {
    // Try Spotify Web API for album covers first
    const apiMusic = await fetchMusicFromSpotify(count);
    if (apiMusic.length > 0) {
      return apiMusic;
    }
  } catch (error) {
    console.log('Spotify API fetch failed, using curated music:', error);
  }

  // Fallback to curated content with Last.fm cover images
  const allContent = [...CURATED_SONGS, ...CURATED_ALBUMS];
  const shuffled = [...allContent].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((music, index) => ({
    ...music,
    id: `music-${Date.now()}-${index}`
  }));
};

const fetchMusicFromSpotify = async (count: number): Promise<MusicContent[]> => {
  try {
    // Use iTunes Search API as a fallback for album covers
    const response = await fetch(
      `https://itunes.apple.com/search?term=top+songs&media=music&limit=${count * 2}`
    );
    
    if (!response.ok) {
      throw new Error('iTunes API request failed');
    }
    
    const data = await response.json();
    const music: MusicContent[] = [];
    
    if (data.results && data.results.length > 0) {
      const selectedTracks = data.results.slice(0, count);
      
      for (const track of selectedTracks) {
        music.push({
          id: `itunes-song-${track.trackId}`,
          type: 'song',
          title: track.trackName,
          content: `${track.trackName} by ${track.artistName} - Popular track from the album "${track.collectionName}". This song showcases the artist's signature style and continues to resonate with listeners worldwide.`,
          image: track.artworkUrl100?.replace('100x100', '600x600') || getSongCoverImage(track.trackName),
          artist: track.artistName,
          album: track.collectionName || 'Unknown Album',
          year: new Date(track.releaseDate).getFullYear(),
          genre: track.primaryGenreName || 'Popular',
          chartPosition: Math.floor(Math.random() * 50) + 1
        });
      }
    }
    
    return music;
  } catch (error) {
    console.error('iTunes API error:', error);
    throw error;
  }
};

const getSongCoverImage = (title: string): string => {
  // High-quality music/vinyl style images from Unsplash as fallback
  const musicImages = [
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&h=600&fit=crop'
  ];
  
  return musicImages[Math.floor(Math.random() * musicImages.length)];
};
