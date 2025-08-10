import { useState } from 'react';
import { useMoviesStore } from '../stores/moviesStore';
import { useSessionsStore } from '../stores/sessionsStore';

export default function AdminPanel() {
  const { movies, addMovie } = useMoviesStore();
  const { sessions, addSession } = useSessionsStore();

  const [movieForm, setMovieForm] = useState({
    title: '',
    duration: 90,
    genre: '',
    rating: '',
    synopsis: '',
    poster: '',
    director: '',
    cast: '',
  });

  const [sessionForm, setSessionForm] = useState({
    movieId: '',
    date: '',
    time: '',
    room: '',
    price: 0,
    totalSeats: 0,
  });

  const handleMovieSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = Date.now().toString();
    addMovie({
      id,
      ...movieForm,
      cast: movieForm.cast.split(',').map((c) => c.trim()),
    });
    setMovieForm({
      title: '',
      duration: 90,
      genre: '',
      rating: '',
      synopsis: '',
      poster: '',
      director: '',
      cast: '',
    });
  };

  const handleSessionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = Date.now().toString();
    addSession({
      id,
      movieId: sessionForm.movieId,
      date: sessionForm.date,
      time: sessionForm.time,
      room: sessionForm.room,
      price: Number(sessionForm.price),
      availableSeats: sessionForm.totalSeats,
      totalSeats: Number(sessionForm.totalSeats),
    });
    setSessionForm({ movieId: '', date: '', time: '', room: '', price: 0, totalSeats: 0 });
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
            value={movieForm.title}
            onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
          />
          <input
            placeholder="Duración"
            type="number"
            value={movieForm.duration}
            onChange={(e) => setMovieForm({ ...movieForm, duration: Number(e.target.value) })}
          />
          <input
            placeholder="Género"
            value={movieForm.genre}
            onChange={(e) => setMovieForm({ ...movieForm, genre: e.target.value })}
          />
          <input
            placeholder="Clasificación"
            value={movieForm.rating}
            onChange={(e) => setMovieForm({ ...movieForm, rating: e.target.value })}
          />
          <input
            placeholder="Póster URL"
            value={movieForm.poster}
            onChange={(e) => setMovieForm({ ...movieForm, poster: e.target.value })}
          />
          <input
            placeholder="Director"
            value={movieForm.director}
            onChange={(e) => setMovieForm({ ...movieForm, director: e.target.value })}
          />
          <input
            placeholder="Reparto (separado por comas)"
            value={movieForm.cast}
            onChange={(e) => setMovieForm({ ...movieForm, cast: e.target.value })}
          />
          <textarea
            placeholder="Sinopsis"
            value={movieForm.synopsis}
            onChange={(e) => setMovieForm({ ...movieForm, synopsis: e.target.value })}
          />
          <button type="submit">Guardar Película</button>
        </form>
      </section>
      <section>
        <h2>Agregar Sesión</h2>
        <form onSubmit={handleSessionSubmit}>
          <input
            placeholder="ID Película"
            value={sessionForm.movieId}
            onChange={(e) => setSessionForm({ ...sessionForm, movieId: e.target.value })}
          />
          <input
            placeholder="Fecha"
            value={sessionForm.date}
            onChange={(e) => setSessionForm({ ...sessionForm, date: e.target.value })}
          />
          <input
            placeholder="Hora"
            value={sessionForm.time}
            onChange={(e) => setSessionForm({ ...sessionForm, time: e.target.value })}
          />
          <input
            placeholder="Sala"
            value={sessionForm.room}
            onChange={(e) => setSessionForm({ ...sessionForm, room: e.target.value })}
          />
          <input
            placeholder="Precio"
            type="number"
            value={sessionForm.price}
            onChange={(e) => setSessionForm({ ...sessionForm, price: Number(e.target.value) })}
          />
          <input
            placeholder="Asientos totales"
            type="number"
            value={sessionForm.totalSeats}
            onChange={(e) => setSessionForm({ ...sessionForm, totalSeats: Number(e.target.value) })}
          />
          <button type="submit">Guardar Sesión</button>
        </form>
      </section>
    </div>
  );
}
