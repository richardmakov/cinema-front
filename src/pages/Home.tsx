import { useEffect } from 'react';
import MovieCard from '../components/MovieCard';
import { useMoviesStore } from '../stores/moviesStore';

export default function Home() {
  const { movies, fetchMovies } = useMoviesStore();

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
