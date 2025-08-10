import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Booking } from "../types/cinema";
import { fetchJson } from "./api";

type Id = string | number;
const idToKey = (id: Id) => String(id);

interface BookingsService {
  bookings: Booking[];
  loading: boolean;
  error?: string;

  // Queries
  fetchBookings: () => Promise<void>;
  fetchBooking: (id: Id) => Promise<Booking>;
  fetchStats: () => Promise<Record<string, number>>; // { pendiente: n, confirmada: n, cancelada: n }

  // Mutations
  createBooking: (payload: Omit<Partial<Booking>, "precio_total" | "estado" | "codigo_reserva" | "creado_en" | "id">) => Promise<Booking>;
  deleteBooking: (id: Id) => Promise<void>;
  confirmBooking: (id: Id) => Promise<void>;
  cancelBooking: (id: Id) => Promise<void>;

  // Local helpers (si las quieres mantener)
  removeBookingLocal: (id: Id) => void;
  clearBookings: () => void;
}

export const useBookingsService = create<BookingsService>()(
  persist(
    (set, get) => ({
      bookings: [],
      loading: false,
      error: undefined,

      // GET /bookings/
      fetchBookings: async () => {
        try {
          set({ loading: true, error: undefined });
          const bookings = await fetchJson<Booking[]>("/bookings/");
          set({ bookings, loading: false });
        } catch (e: any) {
          set({ loading: false, error: e?.message ?? "Error al cargar reservas" });
          throw e;
        }
      },

      // GET /bookings/:id/
      fetchBooking: async (id: Id) => {
        try {
          set({ loading: true, error: undefined });
          const booking = await fetchJson<Booking>(`/bookings/${idToKey(id)}/`);
          const list = get().bookings.slice();
          const i = list.findIndex(b => idToKey(b.id) === idToKey(id));
          if (i >= 0) list[i] = booking; else list.push(booking);
          set({ bookings: list, loading: false });
          return booking;
        } catch (e: any) {
          set({ loading: false, error: e?.message ?? "Error al cargar la reserva" });
          throw e;
        }
      },

      // GET /bookings/stats/
      fetchStats: async () => {
        try {
          return await fetchJson<Record<string, number>>("/bookings/stats/");
        } catch (e) {
          return {};
        }
      },

      /**
       * POST /bookings/
       * payload mínimo que el backend necesita:
       * - session (id)
       * - nombre_cliente
       * - email_cliente
       * - telefono_cliente? (opcional)
       * - asientos_seleccionados (JSON)
       * - cantidad_asientos (number)
       *
       * precio_total lo calcula el backend (session.precio * cantidad)
       */
      createBooking: async (payload) => {
        try {
          set({ loading: true, error: undefined });
          const created = await fetchJson<Booking>("/bookings/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          set(state => ({ bookings: [...state.bookings, created], loading: false }));
          return created;
        } catch (e: any) {
          set({ loading: false, error: e?.message ?? "Error al crear la reserva" });
          throw e;
        }
      },

      // DELETE /bookings/:id/
      deleteBooking: async (id: Id) => {
        try {
          set({ loading: true, error: undefined });
          await fetchJson<void>(`/bookings/${idToKey(id)}/`, { method: "DELETE" });
          set(state => ({
            bookings: state.bookings.filter(b => idToKey(b.id) !== idToKey(id)),
            loading: false,
          }));
        } catch (e: any) {
          set({ loading: false, error: e?.message ?? "Error al eliminar la reserva" });
          throw e;
        }
      },

      // POST /bookings/:id/confirm/
      confirmBooking: async (id: Id) => {

        await fetchJson<{ status: string }>(`/bookings/${idToKey(id)}/confirm/`, { method: "POST" });
        // refrescamos la reserva en local
        await get().fetchBooking(id);

      },

      // POST /bookings/:id/cancel/
      cancelBooking: async (id: Id) => {

        await fetchJson<{ status: string }>(`/bookings/${idToKey(id)}/cancel/`, { method: "POST" });
        // refrescamos la reserva y (opcional) la sesión si llevas stock localmente
        await get().fetchBooking(id);

      },

      // Helpers locales (opcionales)
      removeBookingLocal: (id: Id) =>
        set(state => ({ bookings: state.bookings.filter(b => idToKey(b.id) !== idToKey(id)) })),
      clearBookings: () => set({ bookings: [] }),
    }),
    { name: "bookings-storage" }
  )
);
