import { useEffect } from "react";
import MovieCard from "../components/MovieCard";
import { useMoviesService } from "../services/moviesService";

export default function Home() {
  const { movies, fetchMovies, loading, error } = useMoviesService();

  useEffect(() => {
    fetchMovies();
  }, []);

  return (
    <div>
      <h1>Cartelera</h1>

      {loading && <p>Cargando películas...</p>}
      {error && !loading && <p style={{ color: "red" }}>{error}</p>}
      {!loading && movies.length === 0 && !error && <p>No hay películas activas.</p>}

      <div className="movie-grid">
        {movies.map((m) => (
          <MovieCard key={m.id} movie={m} />
        ))}
      </div>
    </div>
  );
}
