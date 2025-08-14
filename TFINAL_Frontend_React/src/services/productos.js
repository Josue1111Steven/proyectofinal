import { api } from './api.js'

export async function listProductos() { return api.get('/productos') }
export async function getProducto(id) { return api.get(`/productos/${id}`) }
export async function createProducto(data) { return api.post('/productos', data) }
export async function updateProducto(id, data) { return api.put(`/productos/${id}`, data) }
export async function deleteProducto(id) { return api.del(`/productos/${id}`) }
