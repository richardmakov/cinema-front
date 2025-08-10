import { useParams } from "react-router-dom";
import BookingWidget from "../components/BookingWidget";
import "./BookingPage.css";

export default function BookingPage() {
  const { sessionId } = useParams<{ sessionId: string }>();

  if (!sessionId) return <p>Sesión no encontrada</p>;

  return (
    <div className="booking-page">
      <h1>Reserva de entradas</h1>
      <div className="booking-widget-container">
        <BookingWidget sessionId={sessionId} cols={10} />
      </div>
    </div>
  );
}
