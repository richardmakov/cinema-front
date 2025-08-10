import type { Ticket } from '../types/cinema';
import { fetchJson } from './api';

export async function getBookings(): Promise<Ticket[]> {
  return fetchJson<Ticket[]>('/bookings/');
}

export async function createBooking(ticket: Ticket): Promise<Ticket> {
  return fetchJson<Ticket>('/bookings/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ticket),
  });
}
