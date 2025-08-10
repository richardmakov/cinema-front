import { create } from 'zustand';
import type { Session } from '../types/cinema';

interface SessionsState {
  sessions: Session[];
  selectedSession?: Session;
  setSessions: (sessions: Session[]) => void;
  addSession: (session: Session) => void;
  selectSession: (id: string) => void;
  clearSelection: () => void;
}

export const useSessionsStore = create<SessionsState>((set) => ({
  sessions: [],
  selectedSession: undefined,
  setSessions: (sessions) => set({ sessions }),
  addSession: (session) =>
    set((state) => ({ sessions: [...state.sessions, session] })),
  selectSession: (id) =>
    set((state) => ({
      selectedSession: state.sessions.find((s) => s.id === id),
    })),
  clearSelection: () => set({ selectedSession: undefined }),
}));
