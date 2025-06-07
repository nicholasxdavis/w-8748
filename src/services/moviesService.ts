
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

// Curated highly rated movies and shows with TMDB poster URLs
const CURATED_MOVIES: Omit<Movie, 'id'>[] = [
  {
    type: 'movie',
    title: 'The Shawshank Redemption',
    content: 'The Shawshank Redemption (1994) - Rated 9.3/10 on IMDb. A banker convicted of uxoricide forms a friendship over a quarter century with a hardened convict, while maintaining his innocence and trying to remain hopeful through simple compassion.',
    image: 'https://image.tmdb.org/t/p/w500/9cqNxx0GxF0bflyCy3FpPiy3BXg.jpg',
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
    image: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
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
    image: 'https://image.tmdb.org/t/p/w500/dM2w364MScsjFf8pfMbaWUcWrR.jpg',
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
    image: 'https://image.tmdb.org/t/p/w500/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg',
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
    image: 'https://image.tmdb.org/t/p/w500/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg',
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
    image: 'https://image.tmdb.org/t/p/w500/rTc7ZXdroqjkKivFPvCPX0Ru7uw.jpg',
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
    image: 'https://image.tmdb.org/t/p/w500/dg7NuKDjmS6OzuNy33qt8kSkPF9.jpg',
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
    image: 'https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg',
    rating: 9.2,
    year: 2011,
    genre: 'Fantasy Drama',
    creator: 'David Benioff',
    plot: 'Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for millennia.'
  }
];

export const getRandomMovies = async (count: number = 1): Promise<MovieContent[]> => {
  try {
    // Try OMDB API for movie posters first
    const apiMovies = await fetchMoviesFromOMDB(count);
    if (apiMovies.length > 0) {
      return apiMovies;
    }
  } catch (error) {
    console.log('OMDB API fetch failed, using curated movies with TMDB covers:', error);
  }

  // Fallback to curated content with TMDB poster images
  const allContent = [...CURATED_MOVIES, ...CURATED_TVSHOWS];
  const shuffled = [...allContent].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((movie, index) => ({
    ...movie,
    id: `movie-${Date.now()}-${index}`
  }));
};

const fetchMoviesFromOMDB = async (count: number): Promise<MovieContent[]> => {
  try {
    // Use OMDB API for high-quality movie posters
    const popularMovies = ['Inception', 'The Matrix', 'Interstellar', 'The Dark Knight', 'Avengers', 'Titanic'];
    const movies: MovieContent[] = [];
    
    for (let i = 0; i < Math.min(count, popularMovies.length); i++) {
      const response = await fetch(
        `https://www.omdbapi.com/?t=${encodeURIComponent(popularMovies[i])}&apikey=demo`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.Response === 'True' && data.Poster !== 'N/A') {
          movies.push({
            id: `omdb-movie-${data.imdbID}`,
            type: 'movie',
            title: data.Title,
            content: `${data.Title} (${data.Year}) - ${data.Plot}`,
            image: data.Poster,
            rating: parseFloat(data.imdbRating) || 8.0,
            year: parseInt(data.Year),
            genre: data.Genre?.split(',')[0] || 'Drama',
            director: data.Director,
            plot: data.Plot
          });
        }
      }
    }
    
    return movies;
  } catch (error) {
    console.error('OMDB API error:', error);
    throw error;
  }
};
