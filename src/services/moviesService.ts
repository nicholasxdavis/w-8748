
export interface Movie {
  id: string;
  type: 'movie';
  title: string;
  content: string;
  image: string;
  rating: number;
  year: number;
  genre: string;
  director?: string;
  plot: string;
}

export interface TVShow {
  id: string;
  type: 'tvshow';
  title: string;
  content: string;
  image: string;
  rating: number;
  year: number;
  genre: string;
  creator?: string;
  plot: string;
}

export type MovieContent = Movie | TVShow;

// Curated highly rated movies and shows with high-quality images
const CURATED_MOVIES: Omit<Movie, 'id'>[] = [
  {
    type: 'movie',
    title: 'The Shawshank Redemption',
    content: 'The Shawshank Redemption (1994) - Rated 9.3/10 on IMDb. A banker convicted of uxoricide forms a friendship over a quarter century with a hardened convict, while maintaining his innocence and trying to remain hopeful through simple compassion.',
    image: 'https://images.unsplash.com/photo-1489599510041-0635c917c42e?w=800&h=600&fit=crop',
    rating: 9.3,
    year: 1994,
    genre: 'Drama',
    director: 'Frank Darabont',
    plot: 'A banker convicted of uxoricide forms a friendship over a quarter century with a hardened convict, while maintaining his innocence and trying to remain hopeful through simple compassion.'
  },
  {
    type: 'movie',
    title: 'The Godfather',
    content: 'The Godfather (1972) - Rated 9.2/10 on IMDb. The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
    image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=600&fit=crop',
    rating: 9.2,
    year: 1972,
    genre: 'Crime',
    director: 'Francis Ford Coppola',
    plot: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.'
  },
  {
    type: 'movie',
    title: 'Pulp Fiction',
    content: 'Pulp Fiction (1994) - Rated 8.9/10 on IMDb. The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.',
    image: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&h=600&fit=crop',
    rating: 8.9,
    year: 1994,
    genre: 'Crime',
    director: 'Quentin Tarantino',
    plot: 'The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.'
  },
  {
    type: 'movie',
    title: 'Inception',
    content: 'Inception (2010) - Rated 8.8/10 on IMDb. A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    image: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=800&h=600&fit=crop',
    rating: 8.8,
    year: 2010,
    genre: 'Sci-Fi',
    director: 'Christopher Nolan',
    plot: 'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.'
  }
];

const CURATED_TVSHOWS: Omit<TVShow, 'id'>[] = [
  {
    type: 'tvshow',
    title: 'Breaking Bad',
    content: 'Breaking Bad (2008-2013) - Rated 9.5/10 on IMDb. A chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine with a former student.',
    image: 'https://images.unsplash.com/photo-1489599510041-0635c917c42e?w=800&h=600&fit=crop',
    rating: 9.5,
    year: 2008,
    genre: 'Crime Drama',
    creator: 'Vince Gilligan',
    plot: 'A chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine with a former student.'
  },
  {
    type: 'tvshow',
    title: 'The Sopranos',
    content: 'The Sopranos (1999-2007) - Rated 9.2/10 on IMDb. New Jersey mob boss Tony Soprano deals with personal and professional issues in his home and business life.',
    image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=600&fit=crop',
    rating: 9.2,
    year: 1999,
    genre: 'Crime Drama',
    creator: 'David Chase',
    plot: 'New Jersey mob boss Tony Soprano deals with personal and professional issues in his home and business life.'
  },
  {
    type: 'tvshow',
    title: 'The Wire',
    content: 'The Wire (2002-2008) - Rated 9.3/10 on IMDb. Baltimore drug scene, as seen through the eyes of drug dealers and law enforcement.',
    image: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&h=600&fit=crop',
    rating: 9.3,
    year: 2002,
    genre: 'Crime Drama',
    creator: 'David Simon',
    plot: 'Baltimore drug scene, as seen through the eyes of drug dealers and law enforcement.'
  },
  {
    type: 'tvshow',
    title: 'Game of Thrones',
    content: 'Game of Thrones (2011-2019) - Rated 9.2/10 on IMDb. Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for millennia.',
    image: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=800&h=600&fit=crop',
    rating: 9.2,
    year: 2011,
    genre: 'Fantasy Drama',
    creator: 'David Benioff',
    plot: 'Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for millennia.'
  }
];

export const getRandomMovies = async (count: number = 1): Promise<MovieContent[]> => {
  try {
    // Try to fetch from TMDB API first (you can replace this with your preferred movie API)
    const apiMovies = await fetchMoviesFromAPI(count);
    if (apiMovies.length > 0) {
      return apiMovies;
    }
  } catch (error) {
    console.log('Movie API fetch failed, using curated movies:', error);
  }

  // Fallback to curated content
  const allContent = [...CURATED_MOVIES, ...CURATED_TVSHOWS];
  const shuffled = [...allContent].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((movie, index) => ({
    ...movie,
    id: `movie-${Date.now()}-${index}`
  }));
};

const fetchMoviesFromAPI = async (count: number): Promise<MovieContent[]> => {
  // This is a placeholder for API integration
  // You can integrate with TMDB API, OMDB API, etc.
  // Example: https://api.themoviedb.org/3/movie/top_rated
  throw new Error('Movie API not configured');
};
