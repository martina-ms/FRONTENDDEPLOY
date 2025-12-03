import api from "../api/api";
import axios from "axios";
import { getToken } from "../auth/authService";
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3000";

/**
 * Servicio de productos actualizado para usar la instancia axios central (src/api.js)
 * que ya añade Authorization: Bearer <token> automáticamente.
 *
 * Reemplaza las llamadas directas a axios por `api` y usa rutas relativas
 * (api tiene baseURL configurado).
 */
export const crearProducto = async (formData, token = null) => {
  try {
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    console.log(token);

    const resp = await axios.post(`${API_BASE}/productos`, formData, { headers });
    return resp.data;
  } catch (err) {
    console.error("Error al crear el producto", err?.response?.data || err.message || err);
    throw err;
  }
};

export const obtenerProductos = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();

    if (filtros.categoria) params.append("categoria", filtros.categoria);
    if (filtros.precioMin !== undefined) params.append("precioMin", filtros.precioMin);
    if (filtros.precioMax !== undefined) params.append("precioMax", filtros.precioMax);
    if (filtros.ordenamiento) params.append("ordenamiento", filtros.ordenamiento);
    if (filtros.page) params.append("page", filtros.page);
    if (filtros.limit) params.append("limit", filtros.limit);
    if (filtros.nombre) params.append("nombre", filtros.nombre);

    const query = params.toString();
    const response = await api.get(`/productos${query ? `?${query}` : ""}`);
    return response.data;
  } catch (error) {
    console.error("Error obteniendo productos", error);
    throw error;
  }
};

export const obtenerProducto = async (id) => {
  try {
    const response = await api.get(`/productos/${encodeURIComponent(id)}`);
    return response.data;
  } catch (error) {
    console.error(`Error obteniendo producto ${id}`, error);
    throw error;
  }
};