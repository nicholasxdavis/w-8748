
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
    // Try TMDB API for movie posters first
    const apiMovies = await fetchMoviesFromAPI(count);
    if (apiMovies.length > 0) {
      return apiMovies;
    }
  } catch (error) {
    console.log('Movie API fetch failed, using curated movies with better images:', error);
  }

  // Fallback to curated content with better poster images
  const allContent = [...CURATED_MOVIES, ...CURATED_TVSHOWS];
  const shuffled = [...allContent].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((movie, index) => ({
    ...movie,
    id: `movie-${Date.now()}-${index}`,
    // Use higher quality movie/TV poster images
    image: movie.type === 'movie' 
      ? getMoviePosterImage(movie.title)
      : getTVShowPosterImage(movie.title)
  }));
};

const fetchMoviesFromAPI = async (count: number): Promise<MovieContent[]> => {
  try {
    // Use TMDB API for high-quality movie posters
    const API_KEY = 'demo'; // Replace with actual TMDB API key
    
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/top_rated?api_key=${API_KEY}&language=en-US&page=1`
    );
    
    if (!response.ok) {
      throw new Error('TMDB API request failed');
    }
    
    const data = await response.json();
    const movies: MovieContent[] = [];
    
    if (data.results && data.results.length > 0) {
      const selectedMovies = data.results.slice(0, count);
      
      for (const movie of selectedMovies) {
        movies.push({
          id: `tmdb-movie-${movie.id}`,
          type: 'movie',
          title: movie.title,
          content: `${movie.title} (${new Date(movie.release_date).getFullYear()}) - ${movie.overview.slice(0, 200)}...`,
          image: movie.poster_path 
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : getMoviePosterImage(movie.title),
          rating: movie.vote_average,
          year: new Date(movie.release_date).getFullYear(),
          genre: 'Drama', // You could fetch genres separately
          plot: movie.overview
        });
      }
    }
    
    return movies;
  } catch (error) {
    console.error('TMDB API error:', error);
    throw error;
  }
};

const getMoviePosterImage = (title: string): string => {
  // High-quality movie poster style images from Unsplash
  const movieImages = [
    'https://images.unsplash.com/photo-1489599510041-0635c917c42e?w=800&h=1200&fit=crop',
    'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=1200&fit=crop',
    'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&h=1200&fit=crop',
    'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=800&h=1200&fit=crop'
  ];
  
  return movieImages[Math.floor(Math.random() * movieImages.length)];
};

const getTVShowPosterImage = (title: string): string => {
  // High-quality TV show poster style images
  const tvImages = [
    'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=800&h=1200&fit=crop',
    'https://images.unsplash.com/photo-1595769816263-9b910be24d5f?w=800&h=1200&fit=crop',
    'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=800&h=1200&fit=crop',
    'https://images.unsplash.com/photo-1489599510041-0635c917c42e?w=800&h=1200&fit=crop'
  ];
  
  return tvImages[Math.floor(Math.random() * tvImages.length)];
};
