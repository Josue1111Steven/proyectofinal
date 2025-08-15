import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getProducto, createProducto, updateProducto } from '../services/productos.js'

export default function ProductoForm({ editMode = false }) {
  const navigate = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState({ nombre: '', precio: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (editMode && id) {
      setLoading(true)
      getProducto(id)
        .then(p => setForm({ nombre: p.nombre, precio: p.precio.toString() }))
        .catch(err => setError(err.message))
        .finally(() => setLoading(false))
    }
  }, [editMode, id])

 // Función para formatear el precio mientras se escribe
  const handlePrecioChange = (e) => {
    let value = e.target.value
    
    // Permitir solo números, puntos y comas
    value = value.replace(/[^0-9.,]/g, '')
    
    // Reemplazar comas con puntos para formato estándar
    value = value.replace(/,/g, '.')
    
    // Permitir solo un punto decimal
    const parts = value.split('.')
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('')
    }
    
    setForm({...form, precio: value})
  }
  const validateForm = () => {
    if (!form.nombre.trim()) {
      setError('El nombre es requerido')
      return false
    }
    const precio = parseFloat(form.precio)
    if (isNaN(precio) || precio < 0) {
      setError('El precio debe ser un número válido mayor o igual a 0')
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
      const productData = {
        nombre: form.nombre.trim(),
        precio: parseFloat(form.precio)
      }
      
      if (editMode) {
        await updateProducto(id, productData)
      } else {
        await createProducto(productData)
      }
      navigate('/productos')
    } catch (e) {
      setError(e.message || 'Error al guardar el producto')
    } finally {
      setLoading(false)
    }
  }

  // Estilos corregidos
  const cardStyle = {
    maxWidth: 520, 
    margin: '2rem auto',
    padding: '2rem', // Padding interno
    boxSizing: 'border-box'
  }

  const inputStyle = {
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box',
    margin: 0
  }

  const buttonStyle = {
    width: '100%',
    boxSizing: 'border-box'
  }

  return (
    <div className="container">
      <div className="card" style={cardStyle}>
        <h2 style={{margin: '0 0 1.5rem 0', textAlign: 'center'}}>
          {editMode ? 'Editar' : 'Nuevo'} producto
        </h2>
        
        <form onSubmit={onSubmit}>
          <label htmlFor="nombre" style={{display: 'block', marginBottom: '0.5rem'}}>
            Nombre
          </label>
          <input 
            id="nombre"
            type="text"
            className="input" 
            style={inputStyle}
            value={form.nombre} 
            onChange={e => setForm({...form, nombre: e.target.value})}
            disabled={loading}
            placeholder="Ingrese el nombre del producto"
            required
          />
          
          <div style={{height: 16}} />
          
          <label htmlFor="precio" style={{display: 'block', marginBottom: '0.5rem'}}>
            Precio
          </label>
          <input 
            id="precio"
            type="number" 
            className="input" 
            style={inputStyle}
            value={form.precio} 
            onChange={e => setForm({...form, precio: e.target.value})}
            disabled={loading}
            placeholder="0.00"
            min="0"
            step="0.01"
            required
          />
          
          <div style={{height: 20}} />
          
          <button 
            type="submit"
            className="button" 
            style={buttonStyle}
            disabled={loading || !form.nombre.trim()}
          >
            {loading ? 'Guardando...' : 'Guardar'}
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