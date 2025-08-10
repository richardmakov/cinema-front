import { Link } from "react-router-dom";
import type { Movie } from "../types/cinema";

interface Props {
  movie: Movie;
}

export function MovieCard({ movie }: Props) {
  const src = movie.poster_url || "/placeholder-poster.png"; // pon aquí tu placeholder
  return (
    <Link to={`/movies/${movie.id}`} className="movie-card">
      <img src={src} alt={movie.titulo} loading="lazy" />
      <h3>{movie.titulo}</h3>
    </Link>
  );
}

export default MovieCard;
