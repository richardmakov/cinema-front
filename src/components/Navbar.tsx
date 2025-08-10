import { Link } from 'react-router-dom'
import './Navbar.css'

export default function Navbar() {
  return (
    <div className='navbar'>
        <div className='nav-logo'>
            <img src="/minilogo.png" alt="" />
            <h1 className='nav-title'>Richard Cinema</h1>
        </div>
      <nav className='navbar-links'>
        <Link to="/">Cartelera</Link>
        <Link to="/admin">Admin</Link>
      </nav>
    </div>
  )
}
