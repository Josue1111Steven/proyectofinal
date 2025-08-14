import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Productos from './pages/Productos.jsx'
import ProductoForm from './pages/ProductoForm.jsx'
import NotFound from './pages/NotFound.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

export default function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/productos" element={
          <ProtectedRoute>
            <Productos />
          </ProtectedRoute>
        } />
        <Route path="/productos/nuevo" element={
          <ProtectedRoute>
            <ProductoForm />
          </ProtectedRoute>
        } />
        <Route path="/productos/:id/editar" element={
          <ProtectedRoute>
            <ProductoForm editMode />
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}
