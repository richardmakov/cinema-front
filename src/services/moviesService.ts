import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Movie, Session } from "../types/cinema";
import { fetchJson } from "./api";

type Id = string | number;

interface MoviesService {
  movies: Movie[];
  selectedMovie?: Movie;
  sessionsByMovie: Record<string, Session[]>;

  loading: boolean;
  error?: string;

  fetchMovies: () => Promise<void>;
  fetchAllMovies: () => Promise<void>;
  fetchMovie: (id: Id) => Promise<Movie | undefined>;
  fetchSessions: (id: Id) => Promise<Session[]>;

  createMovie: (data: Partial<Movie>) => Promise<Movie>;
  updateMovie: (id: Id, data: Partial<Movie>) => Promise<Movie>;
  deleteMovie: (id: Id) => Promise<void>;

  setMovies: (movies: Movie[]) => void;
  addMovie: (movie: Movie) => void;
  selectMovie: (id: Id) => void;
  clearSelection: () => void;
}


const idToKey = (id: Id) => String(id);

export const useMoviesService = create<MoviesService>()(
  persist(
    (set, get) => ({
      movies: [],
      selectedMovie: undefined,
      sessionsByMovie: {},
      loading: false,
      error: undefined,

      // GET /movies/
      fetchMovies: async () => {
        try {
          set({ loading: true, error: undefined });
          const movies = await fetchJson<Movie[]>("/movies/");
          set({ movies, loading: false });
        } catch (e: any) {
          set({
            loading: false,
            error: e?.message ?? "Error al cargar películas",
          });
          throw e;
        }
      },

      // GET /movies/:id/
      fetchMovie: async (id: Id) => {
        try {
          set({ loading: true, error: undefined });
          const movie = await fetchJson<Movie>(`/movies/${idToKey(id)}/`);
          const { movies } = get();
          const idx = movies.findIndex((m) => idToKey(m.id) === idToKey(id));
          let newMovies: Movie[];
          if (idx >= 0) {
            newMovies = movies.slice();
            newMovies[idx] = movie;
          } else {
            newMovies = [...movies, movie];
          }
          set({ movies: newMovies, selectedMovie: movie, loading: false });
          return movie;
        } catch (e: any) {
          set({
            loading: false,
            error: e?.message ?? "Error al cargar la película",
          });
          throw e;
        }
      },

      // GET /movies/:id/sessions/
      fetchSessions: async (id: Id) => {
        try {
          const key = idToKey(id);
          set({ loading: true, error: undefined });
          const sessions = await fetchJson<Session[]>(
            `/movies/${key}/sessions/`
          );
          set((state) => ({
            sessionsByMovie: { ...state.sessionsByMovie, [key]: sessions },
            loading: false,
          }));
          return sessions;
        } catch (e: any) {
          set({
            loading: false,
            error: e?.message ?? "Error al cargar sesiones",
          });
          throw e;
        }
      },

      fetchAllMovies: async () => {
        try {
          set({ loading: true, error: undefined });
          const movies = await fetchJson<Movie[]>("/movies/all/");
          set({ movies, loading: false });
        } catch (e: any) {
          set({ loading: false, error: e?.message ?? "Error al cargar todas las películas" });
          throw e;
        }
      },

      // POST /movies/
      createMovie: async (data: Partial<Movie>) => {
        try {
          set({ loading: true, error: undefined });
          const created = await fetchJson<Movie>("/movies/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          set((state) => ({
            movies: [...state.movies, created],
            loading: false,
          }));
          return created;
        } catch (e: any) {
          set({
            loading: false,
            error: e?.message ?? "Error al crear película",
          });
          throw e;
        }
      },

      // PATCH /movies/:id/
      updateMovie: async (id: Id, data: Partial<Movie>) => {
        try {
          set({ loading: true, error: undefined });
          const updated = await fetchJson<Movie>(`/movies/${idToKey(id)}/`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          set((state) => {
            const idx = state.movies.findIndex(
              (m) => idToKey(m.id) === idToKey(id)
            );
            const movies = state.movies.slice();
            if (idx >= 0) movies[idx] = updated;
            return {
              movies,
              selectedMovie:
                state.selectedMovie &&
                  idToKey(state.selectedMovie.id) === idToKey(id)
                  ? updated
                  : state.selectedMovie,
              loading: false,
            };
          });
          return updated;
        } catch (e: any) {
          set({
            loading: false,
            error: e?.message ?? "Error al actualizar película",
          });
          throw e;
        }
      },

      // DELETE /movies/:id/
      deleteMovie: async (id: Id) => {
        try {
          set({ loading: true, error: undefined });
          await fetchJson<void>(`/movies/${idToKey(id)}/`, { method: "DELETE" });
          set((state) => {
            const key = idToKey(id);
            const movies = state.movies.filter(
              (m) => idToKey(m.id) !== key
            );
            const isSelected =
              state.selectedMovie &&
              idToKey(state.selectedMovie.id) === key;
            const { [key]: _, ...restSessions } = state.sessionsByMovie;
            return {
              movies,
              selectedMovie: isSelected ? undefined : state.selectedMovie,
              sessionsByMovie: restSessions,
              loading: false,
            };
          });
        } catch (e: any) {
          set({
            loading: false,
            error: e?.message ?? "Error al eliminar película",
          });
          throw e;
        }
      },

      setMovies: (movies) => set({ movies }),
      addMovie: (movie) =>
        set((state) => ({ movies: [...state.movies, movie] })),
      selectMovie: (id) =>
        set((state) => ({
          selectedMovie: state.movies.find(
            (m) => idToKey(m.id) === idToKey(id)
          ),
        })),
      clearSelection: () => set({ selectedMovie: undefined }),
    }),
    { name: "movies-storage" }
  )
);
