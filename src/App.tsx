
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import MovieDetails from './pages/MovieDetails';
import AdminPanel from './pages/AdminPanel';
import BookingPage from './pages/BookingPage';
import Navbar from './components/Navbar';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
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
