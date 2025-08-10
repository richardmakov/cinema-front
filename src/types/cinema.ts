export interface Movie {
  id: string;
  title: string;
  duration: number; // en minutos
  genre: string;
  rating: string;
  synopsis: string;
  poster: string;
  director: string;
  cast: string[];
}

export interface Session {
  id: string;
  movieId: string;
  date: string;
  time: string;
  room: string;
  price: number;
  availableSeats: number;
  totalSeats: number;
}

export interface Seat {
  id: string;
  row: string;
  number: number;
  isOccupied: boolean;
  isSelected: boolean;
  type: 'normal' | 'premium' | 'disabled';
}

export interface Ticket {
  id: string;
  sessionId: string;
  movieTitle: string;
  date: string;
  time: string;
  room: string;
  seats: Seat[];
  totalPrice: number;
  purchaseDate: string;
  customerName: string;
  customerEmail: string;
}