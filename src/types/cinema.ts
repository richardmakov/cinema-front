export interface Movie {
  id: string;
  titulo: string;
  descripcion: string;
  duracion: number;
  genero: string;
  clasificacion: string;
  poster_url: string;
  activa: boolean;
}

export interface Session {
  id: string;                 
  movie_id: string | number;     
  fecha: string;              
  hora: string;               
  sala: string;
  precio: number;
  asientos_totales: number;
  asientos_disponibles: number;
}

export interface Seat {
  id: string;
  row: string;
  number: number;
  isOccupied: boolean;
  isSelected: boolean;
  type: 'normal' | 'premium' | 'disabled';
}

// types/cinema.ts
export interface Booking {
  id: string | number;
  session: string | number; 
  session_id: string | number;           // FK a Session
  nombre_cliente: string;
  email_cliente: string;
  telefono_cliente?: string;
  asientos_seleccionados: any;        // JSON (puede ser Seat[] o estructura equivalente)
  cantidad_asientos: number;
  precio_total: number;               // lo calcula el backend al crear
  estado: "pendiente" | "confirmada" | "cancelada";
  codigo_reserva: string;
  creado_en: string;                  // ISO datetime
}
