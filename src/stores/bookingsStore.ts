import { create } from 'zustand';
import type { Ticket } from '../types/cinema';
import {
  getBookings,
  createBooking as apiCreateBooking,
} from '../services/bookingsService';

interface BookingsState {
  bookings: Ticket[];
  fetchBookings: () => Promise<void>;
  createBooking: (ticket: Ticket) => Promise<void>;
  removeBooking: (id: string) => void;
  clearBookings: () => void;
}

export const useBookingsStore = create<BookingsState>((set) => ({
  bookings: [],
  fetchBookings: async () => {
    const bookings = await getBookings();
    set({ bookings });
  },
  createBooking: async (ticket) => {
    const saved = await apiCreateBooking(ticket);
    set((state) => ({ bookings: [...state.bookings, saved] }));
  },
  removeBooking: (id) =>
    set((state) => ({
      bookings: state.bookings.filter((b) => b.id !== id),
    })),
  clearBookings: () => set({ bookings: [] }),
}));
