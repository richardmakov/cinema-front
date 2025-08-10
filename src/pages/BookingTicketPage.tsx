// src/pages/BookingPage.tsx
import { useParams } from "react-router-dom";
import BookingTicket from "../components/BookingTicket";
import "./BookingTicketPage.css";

export default function BookingTicketPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  if (!bookingId) return <p>Falta código de reserva</p>;
  return (
    <div className="booking-ticket-page">
      <BookingTicket bookingId={bookingId} />
    </div>
  );
}
