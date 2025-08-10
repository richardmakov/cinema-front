import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Session } from '../types/cinema';
import { fetchJson } from './api';

interface SessionsService {
  sessions: Session[];
  selectedSession?: Session;
  fetchSessions: (movieId?: string) => Promise<void>;
  setSessions: (sessions: Session[]) => void;
  addSession: (session: Session) => void;
  selectSession: (id: string) => void;
  clearSelection: () => void;
}

export const useSessionsService = create<SessionsService>()(
  persist(
    (set) => ({
      sessions: [],
      selectedSession: undefined,
      fetchSessions: async (movieId) => {
        const path = movieId ? `/movies/${movieId}/sessions/` : '/sessions/';
        const sessions = await fetchJson<Session[]>(path);
        set({ sessions });
      },
      setSessions: (sessions) => set({ sessions }),
      addSession: (session) =>
        set((state) => ({ sessions: [...state.sessions, session] })),
      selectSession: (id) =>
        set((state) => ({
          selectedSession: state.sessions.find((s) => s.id === id),
        })),
      clearSelection: () => set({ selectedSession: undefined }),
    }),
    { name: 'sessions-storage' }
  )
);
