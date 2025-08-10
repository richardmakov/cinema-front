import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Session } from "../types/cinema";
import { fetchJson } from "./api";

type Id = string | number;

interface SessionsService {
  sessions: Session[];
  selectedSession?: Session;

  loading: boolean;
  error?: string;

  // Queries
  fetchSessions: (movieId?: Id, preferMovieAction?: boolean) => Promise<void>;
  fetchSession: (id: Id) => Promise<Session>;

  // Mutations
  createSession: (data: Partial<Session>) => Promise<Session>;
  updateSession: (id: Id, data: Partial<Session>) => Promise<Session>;
  deleteSession: (id: Id) => Promise<void>;

  // Local helpers
  setSessions: (sessions: Session[]) => void;
  addSession: (session: Session) => void;
  selectSession: (id: Id) => void;
  clearSelection: () => void;
}

const idToKey = (id: Id) => String(id);

export const useSessionsService = create<SessionsService>()(
  persist(
    (set, get) => ({
      sessions: [],
      selectedSession: undefined,
      loading: false,
      error: undefined,

      /**
       * GET /sessions/ (todas, ya filtradas por tu get_queryset)
       * GET /movies/:id/sessions/ (action del MovieViewSet)
       * GET /sessions/by_movie?movie_id=:id (action del SessionViewSet)
       *
       * Si pasas movieId:
       *  - por defecto usará /movies/:id/sessions/
       *  - si preferMovieAction=false, usará /sessions/by_movie?movie_id=:id
       */
      fetchSessions: async (movieId, preferMovieAction = true) => {
        try {
          set({ loading: true, error: undefined });
          let path: string;

          if (movieId !== undefined && movieId !== null) {
            path = preferMovieAction
              ? `/movies/${idToKey(movieId)}/sessions/`
              : `/sessions/by_movie?movie_id=${encodeURIComponent(idToKey(movieId))}`;
          } else {
            path = `/sessions/`;
          }

          const sessions = await fetchJson<Session[]>(path);
          set({ sessions, loading: false });
        } catch (e: any) {
          set({
            loading: false,
            error: e?.message ?? "Error al cargar sesiones",
          });
          throw e;
        }
      },

      // GET /sessions/:id/
      fetchSession: async (id: Id) => {
        try {
          set({ loading: true, error: undefined });
          const session = await fetchJson<Session>(`/sessions/${idToKey(id)}/`);
          const { sessions } = get();
          const idx = sessions.findIndex((s) => idToKey(s.id) === idToKey(id));
          const next = sessions.slice();
          if (idx >= 0) next[idx] = session;
          else next.push(session);
          set({ sessions: next, selectedSession: session, loading: false });
          return session;
        } catch (e: any) {
          set({
            loading: false,
            error: e?.message ?? "Error al cargar la sesión",
          });
          throw e;
        }
      },

      // POST /sessions/
      // data debe incluir: movie (id de la peli), fecha, hora, sala, precio, asientos_totales, asientos_disponibles
      createSession: async (data: Partial<Session>) => {
        try {
          set({ loading: true, error: undefined });
          const created = await fetchJson<Session>("/sessions/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          set((state) => ({ sessions: [...state.sessions, created], loading: false }));
          return created;
        } catch (e: any) {
          set({
            loading: false,
            error: e?.message ?? "Error al crear la sesión",
          });
          throw e;
        }
      },

      // PATCH /sessions/:id/
      updateSession: async (id: Id, data: Partial<Session>) => {
        try {
          set({ loading: true, error: undefined });
          const updated = await fetchJson<Session>(`/sessions/${idToKey(id)}/`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          set((state) => {
            const idx = state.sessions.findIndex((s) => idToKey(s.id) === idToKey(id));
            const sessions = state.sessions.slice();
            if (idx >= 0) sessions[idx] = updated;
            return {
              sessions,
              selectedSession:
                state.selectedSession && idToKey(state.selectedSession.id) === idToKey(id)
                  ? updated
                  : state.selectedSession,
              loading: false,
            };
          });
          return updated;
        } catch (e: any) {
          set({
            loading: false,
            error: e?.message ?? "Error al actualizar la sesión",
          });
          throw e;
        }
      },

      // DELETE /sessions/:id/
      deleteSession: async (id: Id) => {
        try {
          set({ loading: true, error: undefined });
          await fetchJson<void>(`/sessions/${idToKey(id)}/`, { method: "DELETE" });
          set((state) => {
            const key = idToKey(id);
            const sessions = state.sessions.filter((s) => idToKey(s.id) !== key);
            const isSelected =
              state.selectedSession && idToKey(state.selectedSession.id) === key;
            return {
              sessions,
              selectedSession: isSelected ? undefined : state.selectedSession,
              loading: false,
            };
          });
        } catch (e: any) {
          set({
            loading: false,
            error: e?.message ?? "Error al eliminar la sesión",
          });
          throw e;
        }
      },

      // Local helpers
      setSessions: (sessions) => set({ sessions }),
      addSession: (session) =>
        set((state) => ({ sessions: [...state.sessions, session] })),
      selectSession: (id) =>
        set((state) => ({
          selectedSession: state.sessions.find(
            (s) => idToKey(s.id) === idToKey(id)
          ),
        })),
      clearSelection: () => set({ selectedSession: undefined }),
    }),
    { name: "sessions-storage" }
  )
);
