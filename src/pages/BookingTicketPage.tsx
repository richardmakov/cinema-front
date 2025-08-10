// src/pages/BookingPage.tsx
import { useParams } from "react-router-dom";
import BookingTicket from "../components/BookingTicket";

export default function BookingTicketPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  if (!bookingId) return <p>Falta bookingId</p>;
  return <BookingTicket bookingId={bookingId} />;
}
