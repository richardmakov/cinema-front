import { create } from 'zustand';
import type { Session } from '../types/cinema';
import { getSessions } from '../services/sessionsService';

interface SessionsState {
  sessions: Session[];
  selectedSession?: Session;
  fetchSessions: (movieId?: string) => Promise<void>;
  setSessions: (sessions: Session[]) => void;
  addSession: (session: Session) => void;
  selectSession: (id: string) => void;
  clearSelection: () => void;
}

export const useSessionsStore = create<SessionsState>((set) => ({
  sessions: [],
  selectedSession: undefined,
  fetchSessions: async (movieId) => {
    const sessions = await getSessions(movieId);
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
}));
