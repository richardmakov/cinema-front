import { Link } from 'react-router-dom'
import './Navbar.css'
import { useState } from 'react';

export default function Navbar() {

  const [isOpen, setIsOpen] = useState(false);
  return (

    <>
      <div className='navbar'>
        <div className='nav-logo'>
          <img src="/minilogo.png" alt="" />
          <h1 className='nav-title'>Richard Cinema</h1>
        </div>
        <nav className='navbar-links'>
          <Link to="/">Cartelera</Link>
          <Link to="/ticket/search">Buscar Entradas</Link>
          <Link to="/admin">Admin</Link>
        </nav>

        <div className='open-submenu-btn ' onClick={() => setIsOpen(!isOpen)}><img src='/burger.svg' alt='burger'></img></div>

      </div>
      <div className={`submenu ${isOpen ? 'open' : 'close'}`}>
        <Link to="/" onClick={() => setIsOpen(false)}>Cartelera</Link>
        <Link to="/ticket/search">Buscar Entradas</Link>
        <Link to="/admin" onClick={() => setIsOpen(false)}>Admin</Link>
      </div>
    </>


  )
}
