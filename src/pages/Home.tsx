import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useMoviesService } from "../services/moviesService";
import './Home.css';

export default function Home() {
  const { movies, fetchMovies, loading, error } = useMoviesService();

  useEffect(() => {
    fetchMovies();
  }, []);

  return (
    <div className="container-home">
      <h1>Peliculas en Cartelera</h1>

      {loading && <p>Cargando películas...</p>}
      {error && !loading && <p style={{ color: "red" }}>{error}</p>}
      {!loading && movies.length === 0 && !error && <p>No hay películas activas.</p>}

      <div className="movie-grid">
        {movies.map((m) => (
          <div key={m.id} className="movie-card">
            <div className="poster-wrap">
              <img
                src={m.poster_url || "/placeholder-poster.png"}
                alt={m.titulo}
              />
              <Link to={`/movies/${m.id}`} className="hover-cta">
                Ver detalles
              </Link>
            </div>
            <h3>{m.titulo}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}
