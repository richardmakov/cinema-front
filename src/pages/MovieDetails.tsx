import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // 👈 importamos useNavigate
import { useMoviesService } from "../services/moviesService";
import { useSessionsService } from "../services/sessionsService";

export default function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate(); // 👈 hook de navegación

  const {
    selectedMovie,
    fetchMovie,
    clearSelection,
    loading: movieLoading,
    error: movieError,
  } = useMoviesService();

  const {
    sessions,
    fetchSessions,
    loading: sessionsLoading,
    error: sessionsError,
  } = useSessionsService();

  useEffect(() => {
    if (!id) return;
    (async () => {
      await fetchMovie(id);
      await fetchSessions(id);
    })();
    return () => {
      clearSelection();
    };
  }, [id, fetchMovie, fetchSessions, clearSelection]);

  if (movieLoading && !selectedMovie) return <p>Cargando película...</p>;
  if (movieError && !selectedMovie)
    return <p style={{ color: "red" }}>{movieError}</p>;
  if (!selectedMovie) return <p>No se encontró la película.</p>;

  return (
    <div className="movie-details">
      <img
        src={selectedMovie.poster_url || "/placeholder-poster.png"}
        alt={selectedMovie.titulo}
      />
      <div className="info">
        <h2>{selectedMovie.titulo}</h2>
        <p>{selectedMovie.descripcion}</p>

        <p>
          <strong>Duración:</strong> {selectedMovie.duracion} min
        </p>
        <p>
          <strong>Género:</strong> {selectedMovie.genero || "—"}
        </p>
        <p>
          <strong>Clasificación:</strong> {selectedMovie.clasificacion || "—"}
        </p>

        <h3>Sesiones</h3>
        {sessionsLoading && <p>Cargando sesiones...</p>}
        {sessionsError && <p style={{ color: "red" }}>{sessionsError}</p>}
        {!sessionsLoading && sessions.length === 0 ? (
          <p>No hay sesiones disponibles.</p>
        ) : (
          <ul>
            {sessions.map((s) => (
              <li key={String(s.id)}>
                {s.fecha} {s.hora} — Sala {s.sala}
                {"  "}
                <button
                  onClick={() => navigate(`/booking/${s.id}`)} // 👈 redirige al booking
                >
                  Reservar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
