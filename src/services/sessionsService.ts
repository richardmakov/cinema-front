import type { Session } from '../types/cinema';
import { fetchJson } from './api';

export async function getSessions(movieId?: string): Promise<Session[]> {
  const path = movieId ? `/movies/${movieId}/sessions/` : '/sessions/';
  return fetchJson<Session[]>(path);
}

export async function getSession(id: string): Promise<Session> {
  return fetchJson<Session>(`/sessions/${id}/`);
}
