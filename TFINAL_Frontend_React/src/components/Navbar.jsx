import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isAuthenticated, logout } from '../services/auth.js'

export default function Navbar() {
  const navigate = useNavigate()
  const handleLogout = () => { logout(); navigate('/login') }
  return (
    <div className="container">
      <div className="nav card">
        <Link to="/">Inicio</Link>
        <Link to="/productos">Productos</Link>
        <div className="right">
          {isAuthenticated()
            ? <button className="button" onClick={handleLogout}>Cerrar sesión</button>
            : <Link to="/login">Iniciar sesión</Link>
          }
        </div>
      </div>
    </div>
  )
}
