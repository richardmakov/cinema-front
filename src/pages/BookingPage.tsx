import { useParams } from "react-router-dom";
import BookingWidget from "../components/BookingWidget";

export default function BookingPage() {
  const { sessionId } = useParams<{ sessionId: string }>();

  if (!sessionId) return <p>Sesión no encontrada</p>;

  return (
    <div>
      <h1>Reserva de entradas</h1>
      <BookingWidget sessionId={sessionId} cols={10} />
    </div>
  );
}
