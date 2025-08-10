import { useState } from "react";
import type { FormEvent } from "react"
import { useBookingsService } from "../services/bookingsService";
import BookingTicket from "../components/BookingTicket";
import "./TicketSearchPage.css";

export default function TicketSearchPage() {
  const { fetchBookingDetailByCode } = useBookingsService();
  const [code, setCode] = useState("");
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) {
      setErr("Introduce un código de reserva.");
      return;
    }
    setErr(null);
    setLoading(true);
    try {
      // Comprobamos que existe (y cacheamos en store) antes de mostrar
      await fetchBookingDetailByCode(trimmed);
      setSubmittedCode(trimmed);
    } catch (e: any) {
      setSubmittedCode(null);
      setErr(e?.message ?? "No se encontró ninguna reserva con ese código.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ticket-search">
      <h1>Buscar entradas</h1>
      <p className="hint">Introduce tu <strong>código de reserva</strong>.</p>

      <form onSubmit={onSubmit} className="search-form" role="search" aria-label="Buscar entradas por código">
        <input
          type="text"
          inputMode="text"
          autoComplete="off"
          spellCheck={false}
          placeholder="Ej. 533df60e-12ce-4784-a971-3dbc146fd13e"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          aria-invalid={!!err}
          aria-describedby="search-error"
        />
        <button type="submit" disabled={loading || code.trim().length === 0}>
          {loading ? "Buscando..." : "Buscar"}
        </button>
      </form>

      {err && <p id="search-error" className="error">{err}</p>}

      {/* Si encontramos código válido, renderizamos el ticket */}
      {submittedCode && !loading && !err && (
        <div className="result">
          {/* Tu BookingTicket espera prop bookingId pero llama a fetchBookingDetailByCode internamente,
              así que le pasamos el código aquí directamente. */}
          <BookingTicket bookingId={submittedCode} />
        </div>
      )}
    </div>
  );
}
