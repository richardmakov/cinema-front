import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useMoviesStore } from '../stores/moviesStore';
import { useSessionsStore } from '../stores/sessionsStore';

export default function MovieDetails() {
  const { id } = useParams();
  const { selectedMovie, fetchMovies, selectMovie, clearSelection } =
    useMoviesStore();
  const { sessions, fetchSessions } = useSessionsStore();

  useEffect(() => {
    (async () => {
      await fetchMovies();
      if (id) {
        selectMovie(id);
        fetchSessions(id);
      }
    })();
    return () => {
      clearSelection();
    };
  }, [id, fetchMovies, selectMovie, fetchSessions, clearSelection]);

  if (!selectedMovie) {
    return <p>Cargando...</p>;
  }

  return (
    <div className="movie-details">
      <img src={selectedMovie.poster} alt={selectedMovie.title} />
      <div className="info">
        <h2>{selectedMovie.title}</h2>
        <p>{selectedMovie.synopsis}</p>
        <p>
          <strong>Duración:</strong> {selectedMovie.duration} min
        </p>
        <p>
          <strong>Director:</strong> {selectedMovie.director}
        </p>
        <p>
          <strong>Reparto:</strong> {selectedMovie.cast.join(', ')}
        </p>
        <h3>Sesiones</h3>
        <ul>
          {sessions.map((s) => (
            <li key={s.id}>
              {s.date} {s.time} - Sala {s.room}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
