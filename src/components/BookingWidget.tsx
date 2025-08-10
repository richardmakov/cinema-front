import { useEffect, useMemo, useState } from "react";
import { useSessionsService } from "../services/sessionsService";
import { useBookingsService } from "../services/bookingsService";

type Id = string | number;

interface Props {
    sessionId: Id;               // id de la sesión
    cols?: number;               // nº de butacas por fila (layout simple)
}

export default function BookingWidget({ sessionId, cols = 10 }: Props) {
    const { fetchSession, selectedSession } = useSessionsService();
    const { createBooking } = useBookingsService();

    const [nombre, setNombre] = useState("");
    const [email, setEmail] = useState("");
    const [telefono, setTelefono] = useState("");
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        fetchSession(sessionId); // trae la sesión con precio y asientos
    }, [sessionId, fetchSession]);

    const total = selectedSession?.asientos_totales ?? 0;
    const disponibles = selectedSession?.asientos_disponibles ?? 0;
    const precio = Number(selectedSession?.precio ?? 0);

    // Genera un layout simple A1..A10, B1..B10, etc.
    const seatMap = useMemo(() => {
        if (!total) return [];
        const rows = Math.ceil(total / cols);
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const map: string[][] = [];
        let count = 0;
        for (let r = 0; r < rows; r++) {
            const row: string[] = [];
            for (let c = 1; c <= cols; c++) {
                count++;
                if (count > total) break;
                row.push(`${letters[r]}${c}`);
            }
            map.push(row);
        }
        return map;
    }, [total, cols]);

    const maxSelectable = Math.min(disponibles || 0, total || 0);

    const toggleSeat = (seat: string) => {
        setSelectedSeats((prev) => {
            const exists = prev.includes(seat);
            if (exists) return prev.filter((s) => s !== seat);
            if (prev.length >= maxSelectable) return prev; // no superar disponibles
            return [...prev, seat];
        });
    };

    const totalAPagar = useMemo(() => (selectedSeats.length * precio).toFixed(2), [selectedSeats, precio]);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        setSuccessMsg(null);

        if (!selectedSession) {
            setErrorMsg("No se pudo cargar la sesión.");
            return;
        }
        if (selectedSeats.length === 0) {
            setErrorMsg("Selecciona al menos una butaca.");
            return;
        }
        if (selectedSeats.length > (disponibles || 0)) {
            setErrorMsg("La cantidad seleccionada supera las butacas disponibles.");
            return;
        }

        try {
            setSubmitting(true);
            const booking = await createBooking({
                session: selectedSession.id,                 // 👈 FK
                nombre_cliente: nombre,
                email_cliente: email,
                telefono_cliente: telefono || undefined,
                asientos_seleccionados: selectedSeats,       // JSON
                cantidad_asientos: selectedSeats.length,
                // precio_total lo calcula el backend
            });
            setSuccessMsg(`¡Reserva creada! Código: ${booking.codigo_reserva}`);
            setSelectedSeats([]);
            setNombre("");
            setEmail("");
            setTelefono("");
        } catch (err: any) {
            setErrorMsg(err?.message ?? "No se pudo crear la reserva.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="booking-widget">
            <h3>Reserva tus butacas</h3>

            {!selectedSession ? (
                <p>Cargando sesión...</p>
            ) : (
                <>
                    <div className="session-info">
                        <p><strong>Fecha:</strong> {selectedSession.fecha}</p>
                        <p><strong>Hora:</strong> {selectedSession.hora}</p>
                        <p><strong>Sala:</strong> {selectedSession.sala}</p>
                        <p><strong>Precio:</strong> {precio} €</p>
                        <p><strong>Disponibles:</strong> {disponibles}</p>
                    </div>

                    <div className="screen">Pantalla</div>

                    <div className="seats-grid">
                        {seatMap.map((row, ri) => (
                            <div key={ri} className="seat-row">
                                {row.map((seat) => {
                                    const selected = selectedSeats.includes(seat);
                                    return (
                                        <button
                                            key={seat}
                                            type="button"
                                            className={`seat ${selected ? "selected" : ""}`}
                                            onClick={() => toggleSeat(seat)}
                                            aria-pressed={selected}
                                        >
                                            {seat}
                                        </button>
                                    );
                                })}
                            </div>
                        ))}
                    </div>

                    <form onSubmit={onSubmit} className="booking-form">
                        <div className="summary">
                            <p><strong>Butacas:</strong> {selectedSeats.join(", ") || "—"}</p>
                            <p><strong>Cantidad:</strong> {selectedSeats.length}</p>
                            <p><strong>Total:</strong> {totalAPagar} €</p>
                        </div>

                        <input
                            placeholder="Nombre"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            required
                        />
                        <input
                            placeholder="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <input
                            placeholder="Teléfono (opcional)"
                            value={telefono}
                            onChange={(e) => setTelefono(e.target.value)}
                        />

                        <button type="submit" disabled={submitting || selectedSeats.length === 0}>
                            {submitting ? "Procesando..." : "Confirmar reserva"}
                        </button>

                        {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
                        {successMsg && <p style={{ color: "green" }}>{successMsg}</p>}
                    </form>
                </>
            )}

            <style>{`
        .booking-widget { display: grid; gap: 1rem; }
        .session-info { display: grid; gap: .25rem; }
        .screen { text-align: center; padding: .5rem; background: #eee; border-radius: 8px; }
        .seats-grid { display: grid; gap: .5rem; }
        .seat-row { display: grid; grid-template-columns: repeat(${cols}, 1fr); gap: .4rem; }
        .seat { border: 1px solid #ccc; padding: .4rem; border-radius: 6px; cursor: pointer; }
        .seat.selected { outline: 2px solid #333; }
        .booking-form { display: grid; gap: .5rem; }
        .summary { background: #f8f8f8; padding: .5rem; border-radius: 8px; }
      `}</style>
        </div>
    );
}
