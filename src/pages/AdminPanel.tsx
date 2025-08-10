import { useState } from "react";
import { useMoviesService } from "../services/moviesService";
import { useSessionsService } from "../services/sessionsService";

export default function AdminPanel() {
  const { movies, createMovie } = useMoviesService();
  // ⬇️ usamos createSession en lugar de addSession
  const { sessions, createSession } = useSessionsService();

  const [movieForm, setMovieForm] = useState({
    titulo: "",
    descripcion: "",
    duracion: 90,
    genero: "",
    clasificacion: "",
    poster_url: "",
    activa: true,
  });

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | undefined>();

  // mantenemos el formulario como lo tenías y mapeamos en el submit
  const [sessionForm, setSessionForm] = useState({
    movieId: "",
    date: "",
    time: "",
    room: "",
    price: 0,
    totalSeats: 0,
  });

  const handleMovieSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(undefined);

    try {
      await createMovie(movieForm); // POST /movies/
      setMovieForm({
        titulo: "",
        descripcion: "",
        duracion: 90,
        genero: "",
        clasificacion: "",
        poster_url: "",
        activa: true,
      });
    } catch (err: any) {
      setCreateError(err?.message ?? "No se pudo crear la película");
    } finally {
      setCreating(false);
    }
  };

  // ⬇️ ahora persiste la sesión en Django
  const handleSessionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSession({
        // nombres que espera tu backend:
        movie_id: sessionForm.movieId,                // id de la película (string o number)
        fecha: sessionForm.date,                  // "YYYY-MM-DD"
        hora: sessionForm.time,                   // "HH:MM" o "HH:MM:SS"
        sala: sessionForm.room,
        precio: Number(sessionForm.price),
        asientos_totales: Number(sessionForm.totalSeats),
        asientos_disponibles: Number(sessionForm.totalSeats), // inicia igual que totales
      });

      // limpiar formulario
      setSessionForm({
        movieId: "",
        date: "",
        time: "",
        room: "",
        price: 0,
        totalSeats: 0,
      });
    } catch (err) {
      console.error("Error al crear la sesión:", err);
      // opcional: muestra un mensaje en UI si quieres
    }
  };

  return (
    <div className="admin-panel">
      <h1>Panel de Administración</h1>

      <section className="stats">
        <p>Películas: {movies.length}</p>
        <p>Sesiones: {sessions.length}</p>
      </section>

      <section>
        <h2>Agregar Película</h2>
        <form onSubmit={handleMovieSubmit}>
          <input
            placeholder="Título"
            value={movieForm.titulo}
            onChange={(e) =>
              setMovieForm({ ...movieForm, titulo: e.target.value })
            }
            required
          />
          <textarea
            placeholder="Descripción"
            value={movieForm.descripcion}
            onChange={(e) =>
              setMovieForm({ ...movieForm, descripcion: e.target.value })
            }
            required
          />
          <input
            placeholder="Duración"
            type="number"
            value={movieForm.duracion}
            onChange={(e) =>
              setMovieForm({
                ...movieForm,
                duracion: Number(e.target.value),
              })
            }
            min={1}
            required
          />
          <input
            placeholder="Género"
            value={movieForm.genero}
            onChange={(e) =>
              setMovieForm({ ...movieForm, genero: e.target.value })
            }
          />
          <input
            placeholder="Clasificación"
            value={movieForm.clasificacion}
            onChange={(e) =>
              setMovieForm({ ...movieForm, clasificacion: e.target.value })
            }
          />
          <input
            placeholder="Póster URL"
            value={movieForm.poster_url}
            onChange={(e) =>
              setMovieForm({ ...movieForm, poster_url: e.target.value })
            }
          />
          <label>
            <input
              type="checkbox"
              checked={movieForm.activa}
              onChange={(e) =>
                setMovieForm({ ...movieForm, activa: e.target.checked })
              }
            />
            Activa
          </label>

          <button type="submit" disabled={creating}>
            {creating ? "Guardando..." : "Guardar Película"}
          </button>

          {createError && <p style={{ color: "red" }}>{createError}</p>}
        </form>
      </section>

      <section>
        <h2>Agregar Sesión</h2>
        <form onSubmit={handleSessionSubmit}>
          <input
            placeholder="ID Película"
            value={sessionForm.movieId}
            onChange={(e) =>
              setSessionForm({ ...sessionForm, movieId: e.target.value })
            }
            required
          />
          <input
            placeholder="Fecha (YYYY-MM-DD)"
            value={sessionForm.date}
            onChange={(e) =>
              setSessionForm({ ...sessionForm, date: e.target.value })
            }
            required
          />
          <input
            placeholder="Hora (HH:MM o HH:MM:SS)"
            value={sessionForm.time}
            onChange={(e) =>
              setSessionForm({ ...sessionForm, time: e.target.value })
            }
            required
          />
          <input
            placeholder="Sala"
            value={sessionForm.room}
            onChange={(e) =>
              setSessionForm({ ...sessionForm, room: e.target.value })
            }
            required
          />
          <input
            placeholder="Precio"
            type="number"
            value={sessionForm.price}
            onChange={(e) =>
              setSessionForm({
                ...sessionForm,
                price: Number(e.target.value),
              })
            }
            min={0}
            required
          />
          <input
            placeholder="Asientos totales"
            type="number"
            value={sessionForm.totalSeats}
            onChange={(e) =>
              setSessionForm({
                ...sessionForm,
                totalSeats: Number(e.target.value),
              })
            }
            min={1}
            required
          />
          <button type="submit">Guardar Sesión</button>
        </form>
      </section>
    </div>
  );
}
