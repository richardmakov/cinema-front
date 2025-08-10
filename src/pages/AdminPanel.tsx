import { useEffect, useState } from "react";
import { useMoviesService } from "../services/moviesService";
import { useSessionsService } from "../services/sessionsService";
import "./AdminPanel.css";

type Id = string | number;

const EMPTY_MOVIE = {
  titulo: "",
  descripcion: "",
  duracion: 90,
  genero: "",
  clasificacion: "",
  poster_url: "",
  activa: true,
};

type ConfirmState = {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm?: () => void | Promise<void>;
};

function ConfirmModal({
  open,
  title = "Confirmar acción",
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmState & { onCancel?: () => void }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal">
        <h4>{title}</h4>
        <p>{message}</p>
        <div className="modal-actions">
          <button className="btn-ghost" type="button" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            className={danger ? "btn-danger" : "btn-primary"}
            type="button"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPanel() {
  const {
    movies,
    fetchMovies,
    createMovie,
    updateMovie,
    deleteMovie,
  } = useMoviesService();

  const {
    sessions,
    fetchSessions,
    createSession,
    updateSession,
    deleteSession,
  } = useSessionsService();

  // Crear película
  const [movieForm, setMovieForm] = useState({ ...EMPTY_MOVIE });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | undefined>();

  // Editar película
  const [editId, setEditId] = useState<Id | null>(null);
  const [editForm, setEditForm] = useState({ ...EMPTY_MOVIE });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | undefined>();

  // --- Edición de sesiones dentro de la película ---
  const [sessionForms, setSessionForms] = useState<Record<
    string,
    {
      fecha: string;
      hora: string;
      sala: string;
      precio: number | string;
      asientos_totales: number | string;
      asientos_disponibles: number | string;
    }
  >>({});

  const [savingSessionIds, setSavingSessionIds] = useState<Record<string, boolean>>({});
  const [sessionErrors, setSessionErrors] = useState<Record<string, string | undefined>>({});

  // Crear nueva sesión para la película en edición
  const [newSession, setNewSession] = useState({
    fecha: "",
    hora: "",
    sala: "",
    precio: 0,
    asientos_totales: 0,
  });
  const [creatingChildSession, setCreatingChildSession] = useState(false);
  const [createChildSessionErr, setCreateChildSessionErr] = useState<string | undefined>();

  // Modal confirmación
  const [confirm, setConfirm] = useState<ConfirmState>({ open: false, message: "" });

  // Cargar data al montar
  useEffect(() => {
    fetchMovies();     // GET /movies/
    fetchSessions();   // GET /sessions/ (para stats)
  }, [fetchMovies, fetchSessions]);

  // Crear película
  const handleMovieSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(undefined);
    try {
      await createMovie(movieForm);
      setMovieForm({ ...EMPTY_MOVIE });
      await fetchMovies();
    } catch (err: any) {
      setCreateError(err?.message ?? "No se pudo crear la película");
    } finally {
      setCreating(false);
    }
  };

  // Abrir editor con datos y cargar sesiones de esa peli
  const startEdit = async (id: Id) => {
    const m = movies.find((mm) => String(mm.id) === String(id));
    if (!m) return;
    setEditId(id);
    setEditError(undefined);
    setEditForm({
      titulo: m.titulo ?? "",
      descripcion: m.descripcion ?? "",
      duracion: Number(m.duracion ?? 90),
      genero: m.genero ?? "",
      clasificacion: m.clasificacion ?? "",
      poster_url: m.poster_url ?? "",
      activa: Boolean(m.activa),
    });
    await fetchSessions(id); // carga sólo sesiones de esta película
    setTimeout(() => {
      document.getElementById("edit-movie-section")?.scrollIntoView({ behavior: "smooth" });
    }, 0);
  };

  // Cuando se cargan sesiones de la peli en edición, volcar a formularios locales
  useEffect(() => {
    if (editId == null) return;
    const map: Record<string, any> = {};
    sessions.forEach((s: any) => {
      map[String(s.id)] = {
        fecha: s.fecha ?? "",
        hora: s.hora ?? "",
        sala: s.sala ?? "",
        precio: Number(s.precio ?? 0),
        asientos_totales: Number(s.asientos_totales ?? 0),
        asientos_disponibles: Number(s.asientos_disponibles ?? 0),
      };
    });
    setSessionForms(map);
  }, [editId, sessions]);

  // Guardar edición película
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId == null) return;
    setSavingEdit(true);
    setEditError(undefined);
    try {
      await updateMovie(editId, editForm);
      await fetchMovies();
    } catch (err: any) {
      setEditError(err?.message ?? "No se pudo actualizar la película");
    } finally {
      setSavingEdit(false);
    }
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditForm({ ...EMPTY_MOVIE });
    setEditError(undefined);
    setSessionForms({});
    setSessionErrors({});
  };

  // --- Helpers edición de sesiones (dentro de película) ---
  const onSessionField =
    (sid: Id, field: keyof (typeof sessionForms)[string]) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const key = String(sid);
        const val = e.target.value;
        setSessionForms((prev) => ({
          ...prev,
          [key]: { ...prev[key], [field]: val },
        }));
      };

  const saveSession = async (sid: Id) => {
    if (editId == null) return;
    const key = String(sid);
    const data = sessionForms[key];
    if (!data) return;

    setSavingSessionIds((p) => ({ ...p, [key]: true }));
    setSessionErrors((p) => ({ ...p, [key]: undefined }));

    try {
      await updateSession(sid, {
        fecha: data.fecha,
        hora: data.hora,
        sala: data.sala,
        precio: Number(data.precio),
        asientos_totales: Number(data.asientos_totales),
        asientos_disponibles: Number(data.asientos_disponibles),
      } as any);
      await fetchSessions(editId);
    } catch (err: any) {
      setSessionErrors((p) => ({ ...p, [key]: err?.message ?? "No se pudo actualizar la sesión" }));
    } finally {
      setSavingSessionIds((p) => ({ ...p, [key]: false }));
    }
  };

  // Crear nueva sesión (dentro de la película)
  const createChildSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId == null) return;
    setCreatingChildSession(true);
    setCreateChildSessionErr(undefined);
    try {
      await createSession({
        movie_id: editId,
        fecha: newSession.fecha,
        hora: newSession.hora,
        sala: newSession.sala,
        precio: Number(newSession.precio),
        asientos_totales: Number(newSession.asientos_totales),
        asientos_disponibles: Number(newSession.asientos_totales),
      } as any);
      setNewSession({ fecha: "", hora: "", sala: "", precio: 0, asientos_totales: 0 });
      await fetchSessions(editId);
    } catch (err: any) {
      setCreateChildSessionErr(err?.message ?? "No se pudo crear la sesión");
    } finally {
      setCreatingChildSession(false);
    }
  };

  // --- Eliminar película (con confirm) ---
  const askDeleteMovie = (id: Id, titulo: string) => {
    setConfirm({
      open: true,
      title: "Eliminar película",
      message: `¿Seguro que quieres eliminar "${titulo}"? Esta acción no se puede deshacer.`,
      confirmLabel: "Eliminar",
      cancelLabel: "Cancelar",
      danger: true,
      onConfirm: async () => {
        try {
          await deleteMovie(id);
          await fetchMovies();
          if (editId !== null && String(editId) === String(id)) cancelEdit();
        } finally {
          setConfirm((c) => ({ ...c, open: false }));
        }
      },
    });
  };

  // --- Eliminar sesión (con confirm) ---
  const askDeleteSession = (sid: Id) => {
    setConfirm({
      open: true,
      title: "Eliminar sesión",
      message: "¿Seguro que quieres eliminar esta sesión? Esta acción no se puede deshacer.",
      confirmLabel: "Eliminar",
      cancelLabel: "Cancelar",
      danger: true,
      onConfirm: async () => {
        try {
          await deleteSession(sid);
          if (editId != null) await fetchSessions(editId);
        } finally {
          setConfirm((c) => ({ ...c, open: false }));
        }
      },
    });
  };

  return (
    <div className="admin-panel">
      <h1>Panel de Administración</h1>

      <section className="stats">
        <p><strong>Películas:</strong> {movies.length}</p>
        <p><strong>Sesiones:</strong> {sessions.length}</p>
      </section>

      {/* ====== Crear Película ====== */}
      <section>
        <h2>Agregar Película</h2>
        <form onSubmit={handleMovieSubmit}>
          <label>
            <span>Título</span>
            <input
              placeholder="Título"
              value={movieForm.titulo}
              onChange={(e) => setMovieForm({ ...movieForm, titulo: e.target.value })}
              required
            />
          </label>

          <label style={{ gridColumn: "1 / -1" }}>
            <span>Descripción</span>
            <textarea
              placeholder="Descripción"
              value={movieForm.descripcion}
              onChange={(e) => setMovieForm({ ...movieForm, descripcion: e.target.value })}
              required
            />
          </label>

          <label>
            <span>Duración (min)</span>
            <input
              placeholder="Duración"
              type="number"
              min={1}
              value={movieForm.duracion}
              onChange={(e) => setMovieForm({ ...movieForm, duracion: Number(e.target.value) })}
              required
            />
          </label>

          <label>
            <span>Género</span>
            <input
              placeholder="Género"
              value={movieForm.genero}
              onChange={(e) => setMovieForm({ ...movieForm, genero: e.target.value })}
            />
          </label>

          <label>
            <span>Clasificación</span>
            <input
              placeholder="Clasificación"
              value={movieForm.clasificacion}
              onChange={(e) => setMovieForm({ ...movieForm, clasificacion: e.target.value })}
            />
          </label>

          <label>
            <span>Póster URL</span>
            <input
              placeholder="Póster URL"
              value={movieForm.poster_url}
              onChange={(e) => setMovieForm({ ...movieForm, poster_url: e.target.value })}
            />
          </label>

          <label>
            <input
              type="checkbox"
              checked={movieForm.activa}
              onChange={(e) => setMovieForm({ ...movieForm, activa: e.target.checked })}
            />
            Activa
          </label>

          <button type="submit" disabled={creating}>
            {creating ? "Guardando..." : "Guardar Película"}
          </button>
          {createError && <p style={{ color: "red" }}>{createError}</p>}
        </form>
      </section>

      {/* ====== Listado Películas ====== */}
      <section>
        <h2>Películas existentes</h2>
        <div className="admin-movies-list">
          {movies.length === 0 ? (
            <p>No hay películas.</p>
          ) : (
            movies.map((m) => (
              <div className="admin-movie-row" key={String(m.id)}>
                <div className="amr-info">
                  <img src={m.poster_url || "/placeholder-poster.png"} alt={m.titulo} className="amr-thumb" />
                  <div className="amr-texts">
                    <strong>{m.titulo}</strong>
                    <span>{m.genero || "—"} · {m.duracion} min · {m.clasificacion || "—"}</span>
                    <span className={`amr-badge ${m.activa ? "on" : "off"}`}>{m.activa ? "Activa" : "Inactiva"}</span>
                  </div>
                </div>
                <div className="amr-actions">
                  <button type="button" onClick={() => startEdit(m.id)}>Editar</button>
                  <button
                    type="button"
                    className="btn-danger-outline"
                    onClick={() => askDeleteMovie(m.id, m.titulo)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ====== Editar Película + Sesiones de esa película ====== */}
      {editId !== null && (
        <section id="edit-movie-section">
          <div className="edit-header">
            <h2>Editar Película</h2>
            <button type="button" className="btn-secondary" onClick={cancelEdit}>
              Cerrar edición
            </button>
          </div>

          <form onSubmit={handleEditSubmit}>
            <label>
              <span>Título</span>
              <input
                placeholder="Título"
                value={editForm.titulo}
                onChange={(e) => setEditForm({ ...editForm, titulo: e.target.value })}
                required
              />
            </label>

            <label style={{ gridColumn: "1 / -1" }}>
              <span>Descripción</span>
              <textarea
                placeholder="Descripción"
                value={editForm.descripcion}
                onChange={(e) => setEditForm({ ...editForm, descripcion: e.target.value })}
                required
              />
            </label>

            <label>
              <span>Duración (min)</span>
              <input
                placeholder="Duración"
                type="number"
                min={1}
                value={editForm.duracion}
                onChange={(e) => setEditForm({ ...editForm, duracion: Number(e.target.value) })}
                required
              />
            </label>

            <label>
              <span>Género</span>
              <input
                placeholder="Género"
                value={editForm.genero}
                onChange={(e) => setEditForm({ ...editForm, genero: e.target.value })}
              />
            </label>

            <label>
              <span>Clasificación</span>
              <input
                placeholder="Clasificación"
                value={editForm.clasificacion}
                onChange={(e) => setEditForm({ ...editForm, clasificacion: e.target.value })}
              />
            </label>

            <label>
              <span>Póster URL</span>
              <input
                placeholder="Póster URL"
                value={editForm.poster_url}
                onChange={(e) => setEditForm({ ...editForm, poster_url: e.target.value })}
              />
            </label>

            <label>
              <input
                type="checkbox"
                checked={editForm.activa}
                onChange={(e) => setEditForm({ ...editForm, activa: e.target.checked })}
              />
              Activa
            </label>

            <div className="edit-buttons">
              <button type="submit" disabled={savingEdit}>
                {savingEdit ? "Guardando..." : "Guardar cambios"}
              </button>

              <button
                type="button"
                className="btn-danger-outline"
                onClick={() => askDeleteMovie(editId!, editForm.titulo || "esta película")}
              >
                Eliminar película
              </button>
            </div>

            {editError && <p style={{ color: "red" }}>{editError}</p>}
          </form>

          <hr className="divider" />
          {/* Crear nueva sesión para esta peli */}
          <h3 style={{ marginTop: "1rem" }}>Añadir nueva sesión</h3>
          <form
            onSubmit={createChildSession}
            style={{ display: "grid", gap: ".6rem", gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}
          >
            <label>
              <span>Fecha (YYYY-MM-DD)</span>
              <input
                placeholder="Fecha (YYYY-MM-DD)"
                value={newSession.fecha}
                onChange={(e) => setNewSession({ ...newSession, fecha: e.target.value })}
                required
              />
            </label>

            <label>
              <span>Hora (HH:MM o HH:MM:SS)</span>
              <input
                placeholder="Hora (HH:MM o HH:MM:SS)"
                value={newSession.hora}
                onChange={(e) => setNewSession({ ...newSession, hora: e.target.value })}
                required
              />
            </label>

            <label>
              <span>Sala</span>
              <input
                placeholder="Sala"
                value={newSession.sala}
                onChange={(e) => setNewSession({ ...newSession, sala: e.target.value })}
                required
              />
            </label>

            <label>
              <span>Precio</span>
              <input
                placeholder="Precio"
                type="number"
                value={newSession.precio}
                onChange={(e) => setNewSession({ ...newSession, precio: Number(e.target.value) })}
                required
              />
            </label>

            <label>
              <span>Asientos totales</span>
              <input
                placeholder="Asientos totales"
                type="number"
                value={newSession.asientos_totales}
                onChange={(e) => setNewSession({ ...newSession, asientos_totales: Number(e.target.value) })}
                required
              />
            </label>

            <div style={{ display: "flex", alignItems: "end", gap: ".6rem" }}>
              <button type="submit" disabled={creatingChildSession}>
                {creatingChildSession ? "Creando..." : "Crear sesión"}
              </button>
            </div>

            {createChildSessionErr && (
              <p style={{ color: "red", gridColumn: "1 / -1" }}>{createChildSessionErr}</p>
            )}
          </form>

          <hr className="divider" />
          {/* --- Sesiones de esta película --- */}
          <h3 style={{ marginTop: "1rem" }}>Sesiones de esta película</h3>

          {sessions.length === 0 ? (
            <p>No hay sesiones para esta película.</p>
          ) : (
            <div className="admin-movies-list">
              {sessions.map((s: any) => {
                const key = String(s.id);
                const form = sessionForms[key] || {
                  fecha: "",
                  hora: "",
                  sala: "",
                  precio: 0,
                  asientos_totales: 0,
                  asientos_disponibles: 0,
                };
                const saving = !!savingSessionIds[key];
                const err = sessionErrors[key];

                return (
                  <div className="admin-movie-row" key={key}>
                    <div className="amr-info" style={{ alignItems: "start" }}>
                      <div className="amr-texts" style={{ display: "grid", gap: ".35rem" }}>
                        <strong>Sesión #{key}</strong>

                        <div style={{ display: "grid", gap: ".45rem", gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
                          <label>
                            <span>Fecha</span>
                            <input
                              placeholder="YYYY-MM-DD"
                              value={form.fecha}
                              onChange={onSessionField(key, "fecha")}
                            />
                          </label>

                          <label>
                            <span>Hora</span>
                            <input
                              placeholder="HH:MM o HH:MM:SS"
                              value={form.hora}
                              onChange={onSessionField(key, "hora")}
                            />
                          </label>

                          <label>
                            <span>Sala</span>
                            <input
                              placeholder="Sala"
                              value={form.sala}
                              onChange={onSessionField(key, "sala")}
                            />
                          </label>

                          <label>
                            <span>Precio</span>
                            <input
                              placeholder="Precio"
                              type="number"
                              value={form.precio}
                              onChange={onSessionField(key, "precio")}
                            />
                          </label>

                          <label>
                            <span>Asientos totales</span>
                            <input
                              placeholder="Asientos totales"
                              type="number"
                              value={form.asientos_totales}
                              onChange={onSessionField(key, "asientos_totales")}
                            />
                          </label>

                          <label>
                            <span>Disponibles</span>
                            <input
                              placeholder="Disponibles"
                              type="number"
                              value={form.asientos_disponibles}
                              onChange={onSessionField(key, "asientos_disponibles")}
                            />
                          </label>
                        </div>

                        {err && <p style={{ color: "red" }}>{err}</p>}
                      </div>
                    </div>

                    <div className="amr-actions">
                      <button type="button" onClick={() => saveSession(key)} disabled={saving}>
                        {saving ? "Guardando..." : "Guardar"}
                      </button>
                      <button
                        type="button"
                        className="btn-danger-outline"
                        onClick={() => askDeleteSession(key)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Modal de confirmación */}
      <ConfirmModal
        open={confirm.open}
        title={confirm.title}
        message={confirm.message}
        confirmLabel={confirm.confirmLabel}
        cancelLabel={confirm.cancelLabel}
        danger={confirm.danger}
        onConfirm={confirm.onConfirm}
        onCancel={() => setConfirm((c) => ({ ...c, open: false }))}
      />
    </div>
  );
}
