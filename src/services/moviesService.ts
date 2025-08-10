import type { Movie } from '../types/cinema';
import { fetchJson } from './api';

export async function getMovies(): Promise<Movie[]> {
  return fetchJson<Movie[]>('/movies/');
}

export async function getMovie(id: string): Promise<Movie> {
  return fetchJson<Movie>(`/movies/${id}/`);
}
