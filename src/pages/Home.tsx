import { useEffect } from 'react';
import MovieCard from '../components/MovieCard';
import { useMoviesService } from '../services/moviesService';

export default function Home() {
  const { movies, fetchMovies } = useMoviesService();

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  return (
    <div>
      <h1>Cartelera</h1>
      <div className="movie-grid">
        {movies.map((m) => (
          <MovieCard key={m.id} movie={m} />
        ))}
      </div>
    </div>
  );
}
