import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { listProductos, deleteProducto } from '../services/productos.js'

export default function Productos() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await listProductos()
      setItems(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const onDelete = async (id) => {
    if (!confirm('¿Eliminar producto?')) return
    await deleteProducto(id)
    load()
  }

  return (
    <div className="container">
      <div className="card">
        <div style={{display:'flex', alignItems:'center'}}>
          <h2 style={{marginRight:'auto'}}>Productos</h2>
          <button className="button" onClick={()=>navigate('/productos/nuevo')}>Nuevo</button>
        </div>
        {loading && <p className="status">Cargando...</p>}
        {error && <p className="status" style={{color:'#ffb3b3'}}>{error}</p>}
        {!loading && !error && (
          <table className="table">
            <thead>
              <tr><th>Nombre</th><th>Precio</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {items.map(p => (
                <tr key={p.id}>
                  <td>{p.nombre}</td>
                  <td>${p.precio}</td>
                  <td>
                    <Link to={`/productos/${p.id}/editar`}>Editar</Link>
                    {' '}
                    <button className="button" onClick={()=>onDelete(p.id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan="3" className="status">Sin productos</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
