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

  // Queries (por ID)
  fetchBookings: () => Promise<void>;
  fetchBooking: (id: Id) => Promise<Booking>;
  fetchStats: () => Promise<Record<string, number>>;

  // Mutations
  createBooking: (
    payload: Omit<
      Partial<Booking>,
      "precio_total" | "estado" | "codigo_reserva" | "creado_en" | "id"
    >
  ) => Promise<Booking>;
  deleteBooking: (id: Id) => Promise<void>;
  confirmBooking: (id: Id) => Promise<void>;
  cancelBooking: (id: Id) => Promise<void>;

  // Local helpers
  removeBookingLocal: (id: Id) => void;
  clearBookings: () => void;

  // -------- NUEVO: soporte por código de reserva --------
  // Queries (por código)
  fetchBookingByCode: (code: string) => Promise<Booking>;
  fetchBookingDetailByCode: (code: string) => Promise<{ booking: Booking; session: any }>;

  // Estado/selección por ID (lo que ya tenías ampliado)
  selectedBookingId?: Id;
  getBookingLocal: (id: Id) => Booking | undefined;
  selectBooking: (id: Id) => void;
  getSelectedBooking: () => Booking | undefined;
  fetchBookingAndSelect: (id: Id) => Promise<Booking>;
  fetchBookingDetail: (id: Id) => Promise<{ booking: Booking; session: any }>;

  // -------- NUEVO: selección por código --------
  selectedBookingCode?: string;
  getBookingLocalByCode: (code: string) => Booking | undefined;
  selectBookingByCode: (code: string) => void;
  getSelectedBookingByCode: () => Booking | undefined;
  fetchBookingAndSelectByCode: (code: string) => Promise<Booking>;
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
          const i = list.findIndex((b) => idToKey(b.id) === idToKey(id));
          if (i >= 0) list[i] = booking;
          else list.push(booking);
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
        } catch {
          return {};
        }
      },

      // POST /bookings/
      createBooking: async (payload) => {
        try {
          set({ loading: true, error: undefined });
          const created = await fetchJson<Booking>("/bookings/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          set((state) => ({
            bookings: [...state.bookings, created],
            loading: false,
          }));
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
          set((state) => ({
            bookings: state.bookings.filter(
              (b) => idToKey(b.id) !== idToKey(id)
            ),
            loading: false,
          }));
        } catch (e: any) {
          set({ loading: false, error: e?.message ?? "Error al eliminar la reserva" });
          throw e;
        }
      },

      // POST /bookings/:id/confirm/
      confirmBooking: async (id: Id) => {
        await fetchJson<{ status: string }>(
          `/bookings/${idToKey(id)}/confirm/`,
          { method: "POST" }
        );
        await get().fetchBooking(id);
      },

      // POST /bookings/:id/cancel/
      cancelBooking: async (id: Id) => {
        await fetchJson<{ status: string }>(
          `/bookings/${idToKey(id)}/cancel/`,
          { method: "POST" }
        );
        await get().fetchBooking(id);
      },

      // Helpers locales
      removeBookingLocal: (id: Id) =>
        set((state) => ({
          bookings: state.bookings.filter(
            (b) => idToKey(b.id) !== idToKey(id)
          ),
        })),
      clearBookings: () => set({ bookings: [] }),

      // GET /bookings/by_code/:code/
      fetchBookingByCode: async (code: string) => {
        const booking = await fetchJson<Booking>(
          `/bookings/by_code/${encodeURIComponent(code)}/`
        );
        const list = get().bookings.slice();
        const i = list.findIndex(b => b.codigo_reserva === booking.codigo_reserva);
        if (i >= 0) list[i] = booking; else list.push(booking);
        set({ bookings: list });
        return booking;
      },

      fetchBookingDetailByCode: async (code: string) => {
        const booking = await get().fetchBookingByCode(code);
        const session = await fetchJson<any>(`/sessions/${String(booking.session)}/`);
        return { booking, session };
      },

      selectedBookingId: undefined,

      getBookingLocal: (id: Id) => {
        const { bookings } = get();
        return bookings.find((b) => idToKey(b.id) === idToKey(id));
      },

      selectBooking: (id: Id) => set({ selectedBookingId: id }),

      getSelectedBooking: () => {
        const { selectedBookingId, bookings } = get();
        if (selectedBookingId == null) return undefined;
        return bookings.find(
          (b) => idToKey(b.id) === idToKey(selectedBookingId)
        );
      },

      fetchBookingAndSelect: async (id: Id) => {
        const booking = await get().fetchBooking(id);
        set({ selectedBookingId: booking.id });
        return booking;
      },

      fetchBookingDetail: async (id: Id) => {
        const booking = await get().fetchBooking(id);
        const session = await fetchJson<any>(
          `/sessions/${idToKey(booking.session)}/`
        );
        return { booking, session };
      },

      selectedBookingCode: undefined,

      getBookingLocalByCode: (code: string) => {
        const { bookings } = get();
        return bookings.find((b) => b.codigo_reserva === code);
      },

      selectBookingByCode: (code: string) => set({ selectedBookingCode: code }),

      getSelectedBookingByCode: () => {
        const { selectedBookingCode, bookings } = get();
        if (!selectedBookingCode) return undefined;
        return bookings.find((b) => b.codigo_reserva === selectedBookingCode);
      },

      fetchBookingAndSelectByCode: async (code: string) => {
        const booking = await get().fetchBookingByCode(code);
        set({ selectedBookingCode: booking.codigo_reserva });
        return booking;
      },
    }),
    { name: "bookings-storage" }
  )
);
