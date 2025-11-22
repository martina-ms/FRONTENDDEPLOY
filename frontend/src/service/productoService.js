import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL

export const crearProducto = async (producto) => {
  try{
    const response = await axios.post(`${API_BASE_URL}/productos`, producto);
    return response.data;
  } catch (error) {
    console.error(`Error al crear el producto`, error);
    throw error;
  } 
}
/*
export const obtenerProductos = async (params = {}) => {
  try {
        const query = new URLSearchParams(params).toString();
        const response = await axios.get(`${API_BASE_URL}/productos?${query}`);
        return response.data;
  } catch (error) {
    console.error("Error al obtener productos", error);
    throw error;
  }
};*/

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

    const response = await axios.get(`${API_BASE_URL}/productos?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error obteniendo productos", error);
    throw error;
  }
};


export const obtenerProducto = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/productos/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error obteniendo producto ${id}`, error);
    throw error;
  }
};