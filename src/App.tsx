import './App.css';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import MovieDetails from './pages/MovieDetails';
import AdminPanel from './pages/AdminPanel';
import BookingPage from './pages/BookingPage';

function App() {
  return (
    <BrowserRouter>
      <header>
        <nav>
          <Link to="/">Cartelera</Link>
          <Link to="/admin">Admin</Link>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movies/:id" element={<MovieDetails />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/booking/:sessionId" element={<BookingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
