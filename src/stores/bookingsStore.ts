import { create } from 'zustand';
import type { Ticket } from '../types/cinema';

interface BookingsState {
  bookings: Ticket[];
  addBooking: (ticket: Ticket) => void;
  removeBooking: (id: string) => void;
  clearBookings: () => void;
}

export const useBookingsStore = create<BookingsState>((set) => ({
  bookings: [],
  addBooking: (ticket) =>
    set((state) => ({ bookings: [...state.bookings, ticket] })),
  removeBooking: (id) =>
    set((state) => ({
      bookings: state.bookings.filter((b) => b.id !== id),
    })),
  clearBookings: () => set({ bookings: [] }),
}));
