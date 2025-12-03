import axios from "axios";
import { getToken } from "../auth/authService.js";

const API_BASE_URL = 'https://tiendasolback.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// interceptor async que obtiene token y lo agrega si existe
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await getToken();
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      // No hacemos throw: si falla obtener token, seguimos sin Authorization
      console.warn("api: no se pudo obtener token para la request", err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helpers para llamadas públicas/protegidas
export const getProductos = async () => {
  try {
    // No forzamos headers aquí: evitamos preflight innecesario
    const response = await api.get(`/productos`);
    return response.data;
  } catch (error) {
    console.error("Error obteniendo productos", extractAxiosError(error));
    throw error;
  }
};

export const getProductoById = async (id) => {
  try {
    const response = await api.get(`/productos/${encodeURIComponent(id)}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener producto con id ${id}`, extractAxiosError(error));
    throw error;
  }
};

export const getTopProductos = async () => {
  try {
    // GET simple, sin headers extra para evitar preflight
    const response = await api.get(`/productos/top`);
    return response.data;
  } catch (error) {
    console.error("Error obteniendo top 10 productos más vendidos", extractAxiosError(error));
    throw error;
  }
};

export const crearProducto = async (datosProducto) => {
  try {
    // Para FormData axios coloca el Content-Type correctamente (no lo seteamos manualmente)
    const response = await api.post('/productos', datosProducto);
    return response.data;
  } catch (error) {
    console.error("Error al crear el producto", extractAxiosError(error));
    throw error;
  }
};

function extractAxiosError(error) {
  // Devuelve info útil para debugging
  if (!error) return null;
  return {
    message: error.message,
    code: error.code,
    status: error.response?.status,
    data: error.response?.data,
    request: !!error.request,
  };
}

export default api;