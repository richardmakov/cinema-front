
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import MovieDetails from './pages/MovieDetails';
import AdminPanel from './pages/AdminPanel';
import BookingPage from './pages/BookingPage';
import Navbar from './components/Navbar';
import BookingTicketPage from './pages/BookingTicketPage';
import TicketSearchPage from './pages/TicketSearchPage';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movies/:id" element={<MovieDetails />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/booking/:sessionId" element={<BookingPage />} />
        <Route path="/ticket/search" element={<TicketSearchPage />} />
        <Route path="/ticket/:bookingId" element={<BookingTicketPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
