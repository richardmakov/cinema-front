import { useEffect, useMemo, useState } from "react";
import { useSessionsService } from "../services/sessionsService";
import { useBookingsService } from "../services/bookingsService";
import { useNavigate } from "react-router-dom"; // 👈 NUEVO
import "./BookingWidget.css";

type Id = string | number;

interface Props {
    sessionId: Id;
    cols?: number;
}

export default function BookingWidget({ sessionId, cols = 10 }: Props) {
    const { fetchSession, selectedSession } = useSessionsService();
    const { createBooking } = useBookingsService();
    const navigate = useNavigate(); // 👈 NUEVO

    const [nombre, setNombre] = useState("");
    const [email, setEmail] = useState("");
    const [telefono, setTelefono] = useState("");
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        fetchSession(sessionId);
    }, [sessionId, fetchSession]);

    const total = selectedSession?.asientos_totales ?? 0;
    const disponibles = selectedSession?.asientos_disponibles ?? 0;
    const precio = Number(selectedSession?.precio ?? 0);

    const occupiedSet = useMemo(() => {
        const direct =
            (selectedSession as any)?.asientos_ocupados ??
            (selectedSession as any)?.asientosOcupados ??
            [];
        const fromBookings =
            (selectedSession as any)?.reservas?.flatMap(
                (r: any) => r.asientos_seleccionados ?? r.asientosSeleccionados ?? []
            ) ?? [];
        const seats = (direct.length ? direct : fromBookings) as string[];
        return new Set(seats);
    }, [selectedSession]);

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
        if (occupiedSet.has(seat)) return;
        setSelectedSeats((prev) => {
            const exists = prev.includes(seat);
            if (exists) return prev.filter((s) => s !== seat);
            if (prev.length >= maxSelectable) return prev;
            return [...prev, seat];
        });
    };

    const totalAPagar = useMemo(
        () => (selectedSeats.length * precio).toFixed(2),
        [selectedSeats, precio]
    );

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        setSuccessMsg(null);

        if (!selectedSession) return setErrorMsg("No se pudo cargar la sesión.");
        if (selectedSeats.length === 0) return setErrorMsg("Selecciona al menos una butaca.");
        if (selectedSeats.length > (disponibles || 0)) {
            return setErrorMsg("La cantidad seleccionada supera las butacas disponibles.");
        }

        try {
            setSubmitting(true);
            const booking = await createBooking({
                session: selectedSession.id,          
                session_id: selectedSession.id,       
                nombre_cliente: nombre,
                email_cliente: email,
                telefono_cliente: telefono || undefined,
                asientos_seleccionados: selectedSeats,
                cantidad_asientos: selectedSeats.length,
            });

            setSuccessMsg(`¡Reserva creada! Código: ${booking.codigo_reserva}`);

            // Limpieza (por si el widget permanece montado en otras rutas)
            setSelectedSeats([]);
            setNombre("");
            setEmail("");
            setTelefono("");
            
            navigate(`/ticket/${booking.codigo_reserva}`);

            // Si te quedaras en la misma página, refrescaría la sesión:
            // fetchSession(sessionId);
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

                    <div className="legend">
                        <span className="seat legend-item" /> Libre
                        <span className="seat selected legend-item" /> Seleccionada
                        <span className="seat occupied legend-item" /> Ocupada
                    </div>

                    <div className="seats-grid">
                        {seatMap.map((row, ri) => (
                            <div key={ri} className="seat-row">
                                {row.map((seat) => {
                                    const selected = selectedSeats.includes(seat);
                                    const occupied = occupiedSet.has(seat);
                                    return (
                                        <button
                                            key={seat}
                                            type="button"
                                            className={`seat ${selected ? "selected" : ""} ${occupied ? "occupied" : ""}`}
                                            onClick={() => toggleSeat(seat)}
                                            aria-pressed={selected}
                                            aria-disabled={occupied}
                                            disabled={occupied}
                                            title={occupied ? "Butaca ocupada" : `Butaca ${seat}`}
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
                            placeholder="Teléfono"
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
        .legend { display: flex; align-items: center; gap: .75rem; font-size: .9rem; }
        .legend-item { width: 1.2rem; height: 1.2rem; display: inline-block; vertical-align: middle; }
        .seats-grid { display: grid; gap: .5rem; }
        .seat-row { display: grid; grid-template-columns: repeat(${cols}, 1fr); gap: .4rem; }
        .seat { border: 1px solid #ccc; padding: .4rem; border-radius: 6px; cursor: pointer; background: #fff; }
        .seat.selected { outline: 2px solid #333; }
        .seat.occupied { background: #ddd; color: #777; cursor: not-allowed; border-color: #bbb; }
        .booking-form { display: grid; gap: .5rem; }
        .summary { background: #f8f8f8; padding: .5rem; border-radius: 8px; }
      `}</style>
        </div>
    );
}
