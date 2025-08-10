import { create } from 'zustand';
import type { Movie } from '../types/cinema';
import { getMovies } from '../services/moviesService';

interface MoviesState {
  movies: Movie[];
  selectedMovie?: Movie;
  fetchMovies: () => Promise<void>;
  setMovies: (movies: Movie[]) => void;
  addMovie: (movie: Movie) => void;
  selectMovie: (id: string) => void;
  clearSelection: () => void;
}

export const useMoviesStore = create<MoviesState>((set) => ({
  movies: [],
  selectedMovie: undefined,
  fetchMovies: async () => {
    const movies = await getMovies();
    set({ movies });
  },
  setMovies: (movies) => set({ movies }),
  addMovie: (movie) =>
    set((state) => ({
      movies: [...state.movies, movie],
    })),
  selectMovie: (id) =>
    set((state) => ({
      selectedMovie: state.movies.find((m) => m.id === id),
    })),
  clearSelection: () => set({ selectedMovie: undefined }),
}));
