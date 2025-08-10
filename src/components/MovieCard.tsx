import { Link } from 'react-router-dom';
import type { Movie } from '../types/cinema';

interface Props {
  movie: Movie;
}

export function MovieCard({ movie }: Props) {
  return (
    <Link to={`/movies/${movie.id}`} className="movie-card">
      <img src={movie.poster} alt={movie.title} />
      <h3>{movie.title}</h3>
    </Link>
  );
}

export default MovieCard;
