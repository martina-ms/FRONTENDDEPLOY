import axios from "axios";
import keycloak from "../keycloak"; 

const API_BASE_URL = 'https://backenddeployy.onrender.com'; 


const api = axios.create({
  baseURL: API_BASE_URL,
});


api.interceptors.request.use(
  (config) => {
    
    if (keycloak.authenticated && keycloak.token) {
      config.headers.Authorization = `Bearer ${keycloak.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);



// Obtener lista de productos
export const getProductos = async () => {
  try {
    
    const response = await api.get(`/productos`, {
      headers: { 'Cache-Control': 'no-cache' }
    });
    return response.data;
  } catch (error) {
    console.error("Error obteniendo productos", error);
    throw error;
  }
};

// Obtener producto por ID
export const getProductoById = async (id) => {
  try {
    const response = await api.get(`/productos/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener producto con id ${id}`, error);
    throw error;
  }
};

export const getTopProductos = async () => {
  try {
    const response = await api.get(`/productos/top`, {
      headers: { 'Cache-Control': 'no-cache' }
    });
    return response.data;
  } catch (error) {
    console.error("Error obteniendo top 10 productos más vendidos", error);
    throw error;
  }
};

export const crearProducto = async (datosProducto) => {
    try {
        const response = await api.post('/productos', datosProducto);
        return response.data;
    } catch (error) {
        console.error("Error al crear el producto", error);
        throw error;
    }
};
