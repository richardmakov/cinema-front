import { useEffect, useMemo, useState } from "react";
import { useBookingsService } from "../services/bookingsService";
import "./BookingTicket.css";

type Id = string | number;

interface BookingTicketProps {
    bookingId: Id;
}

export default function BookingTicket({ bookingId }: BookingTicketProps) {
    const { fetchBookingDetailByCode } = useBookingsService();
    const [booking, setBooking] = useState<any | null>(null);
    const [session, setSession] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                const detail = await fetchBookingDetailByCode(bookingId);
                if (!mounted) return;
                setBooking(detail.booking);
                setSession(detail.session);
            } catch (e: any) {
                if (!mounted) return;
                setErr(e?.message ?? "No se pudo cargar la entrada");
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [bookingId, fetchBookingDetailByCode]);

    const movieTitle = session?.movie?.titulo ?? "—";
    const fecha = session?.fecha ?? "—";
    const hora = session?.hora ?? "—";
    const sala = session?.sala ?? "—";
    const precio = Number(session?.precio ?? 0);
    const seats: string[] = booking?.asientos_seleccionados ?? [];
    const total = useMemo(() => {
        const precioTotalNum = Number(
            booking?.precio_total ?? seats.length * precio
        );
        return precioTotalNum.toFixed(2);
    }, [booking?.precio_total, seats.length, precio]);

    if (loading) return <div className="ticket-loading">Cargando entrada…</div>;
    if (err) return <div className="ticket-error">Error: {err}</div>;
    if (!booking || !session) return <div className="ticket-empty">No se encontró la entrada.</div>;

    return (
        <div className="ticket-wrap" data-cy="booking-ticket">
            <article className="ticket">
                <header className="ticket__header">
                    <div className="ticket__title">
                        <h2>{movieTitle}</h2>
                        <p className="ticket__subtitle">Sala {sala}</p>
                    </div>
                    <div className="ticket__code">
                        <small>Código</small>
                        <strong className="mono">{booking.codigo_reserva}</strong>
                    </div>
                </header>

                <section className="ticket__meta">
                    <div><span className="label">Fecha</span><span className="value">{fecha}</span></div>
                    <div><span className="label">Hora</span><span className="value">{hora}</span></div>
                    <div>
                        <span className="label">Estado</span>
                        <span className={`value pill ${booking.estado}`}>{booking.estado}</span>
                    </div>
                </section>

                <section className="ticket__seats">
                    <h3>Butacas</h3>
                    <div className="seats mono">{seats.length ? seats.join(", ") : "—"}</div>
                </section>

                <section className="ticket__customer">
                    <div><span className="label">Nombre</span><span className="value">{booking.nombre_cliente}</span></div>
                    <div><span className="label">Email</span><span className="value">{booking.email_cliente}</span></div>
                    {booking.telefono_cliente ? (
                        <div><span className="label">Teléfono</span><span className="value">{booking.telefono_cliente}</span></div>
                    ) : null}
                </section>

                <footer className="ticket__footer">
                    <div className="total">
                        <small>Total</small>
                        <strong className="mono">{total} €</strong>
                    </div>
                    <div className="actions no-print">
                        <button type="button" onClick={() => window.print()} aria-label="Imprimir entradas">
                            Imprimir
                        </button>
                    </div>
                </footer>
            </article>
        </div>
    );
}
