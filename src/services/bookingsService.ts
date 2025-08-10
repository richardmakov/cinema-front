import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Ticket } from '../types/cinema';
import { fetchJson } from './api';

interface BookingsService {
  bookings: Ticket[];
  fetchBookings: () => Promise<void>;
  createBooking: (ticket: Ticket) => Promise<void>;
  removeBooking: (id: string) => void;
  clearBookings: () => void;
}

export const useBookingsService = create<BookingsService>()(
  persist(
    (set) => ({
      bookings: [],
      fetchBookings: async () => {
        const bookings = await fetchJson<Ticket[]>('/bookings/');
        set({ bookings });
      },
      createBooking: async (ticket) => {
        const saved = await fetchJson<Ticket>('/bookings/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ticket),
        });
        set((state) => ({ bookings: [...state.bookings, saved] }));
      },
      removeBooking: (id) =>
        set((state) => ({
          bookings: state.bookings.filter((b) => b.id !== id),
        })),
      clearBookings: () => set({ bookings: [] }),
    }),
    { name: 'bookings-storage' }
  )
);
