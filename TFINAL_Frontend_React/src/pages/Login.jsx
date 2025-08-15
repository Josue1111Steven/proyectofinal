import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../services/auth.js'

export default function Login() {
  const [email, setEmail] = useState('admin@demo.com')
  const [password, setPassword] = useState('admin')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const validateForm = () => {
    if (!email.trim()) {
      setError('El correo es requerido')
      return false
    }
    if (!email.includes('@')) {
      setError('El correo no es válido')
      return false
    }
    if (!password.trim()) {
      setError('La contraseña es requerida')
      return false
    }
    return true
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    try {
      await login(email.trim(), password)
      navigate('/')
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Credenciales incorrectas')
      } else if (err.response?.status === 500) {
        setError('Error del servidor. Intenta más tarde')
      } else {
        setError(err.message || 'Error al iniciar sesión')
      }
    } finally {
      setLoading(false)
    }
  }

  // Estilos corregidos
  const cardStyle = {
    maxWidth: 420, 
    margin: '2rem auto',
    padding: '2rem', // Agregamos padding interno
    boxSizing: 'border-box' // Importante para el tamaño correcto
  }

  const inputStyle = {
    width: '100%', // Ancho completo del contenedor
    maxWidth: '100%', // No exceder el contenedor
    boxSizing: 'border-box', // Incluir padding y border en el ancho
    margin: 0 // Remover márgenes que puedan causar overflow
  }

  const buttonStyle = {
    width: '100%', // Botón de ancho completo
    boxSizing: 'border-box'
  }

  return (
    <div className="container">
      <div className="card" style={cardStyle}>
        <h2 style={{margin: '0 0 1.5rem 0', textAlign: 'center'}}>Iniciar sesión</h2>
        
        <form onSubmit={onSubmit}>
          <label htmlFor="email" style={{display: 'block', marginBottom: '0.5rem'}}>
            Correo
          </label>
          <input 
            id="email"
            type="email" 
            className="input" 
            style={inputStyle}
            value={email} 
            onChange={e => setEmail(e.target.value)}
            disabled={loading}
            autoComplete="email"
          />
          
          <div style={{height: 16}} />
          
          <label htmlFor="password" style={{display: 'block', marginBottom: '0.5rem'}}>
            Contraseña
          </label>
          <input 
            id="password"
            type="password" 
            className="input" 
            style={inputStyle}
            value={password} 
            onChange={e => setPassword(e.target.value)}
            disabled={loading}
            autoComplete="current-password"
          />
          
          <div style={{height: 20}} />
          
          <button 
            type="submit"
            className="button" 
            style={buttonStyle}
            disabled={loading || !email || !password}
          >
            {loading ? 'Ingresando...' : 'Entrar'}
          </button>
          
          {error && (
            <p className="status" style={{
              marginTop: 16, 
              color: '#ffb3b3',
              textAlign: 'center',
              fontSize: '0.9rem'
            }}>
              {error}
            </p>
          )}
          
          
        </form>
      </div>
    </div>
  )
}