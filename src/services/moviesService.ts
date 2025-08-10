import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Movie } from '../types/cinema';
import { fetchJson } from './api';

interface MoviesService {
  movies: Movie[];
  selectedMovie?: Movie;
  fetchMovies: () => Promise<void>;
  setMovies: (movies: Movie[]) => void;
  addMovie: (movie: Movie) => void;
  selectMovie: (id: string) => void;
  clearSelection: () => void;
}

export const useMoviesService = create<MoviesService>()(
  persist(
    (set) => ({
      movies: [],
      selectedMovie: undefined,
      fetchMovies: async () => {
        const movies = await fetchJson<Movie[]>('/movies/');
        set({ movies });
      },
      setMovies: (movies) => set({ movies }),
      addMovie: (movie) =>
        set((state) => ({ movies: [...state.movies, movie] })),
      selectMovie: (id) =>
        set((state) => ({
          selectedMovie: state.movies.find((m) => m.id === id),
        })),
      clearSelection: () => set({ selectedMovie: undefined }),
    }),
    { name: 'movies-storage' }
  )
);
