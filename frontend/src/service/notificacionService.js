import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL


export const obtenerNotificaciones = async (usuarioId, opts = {}, token) => {
  try {
    if (!usuarioId) throw new Error("Falta usuarioId");
    const params = [];
    if (opts.leida === true) params.push("leida=true");
    const query = params.length ? `?${params.join("&")}` : "";
    const url = `${API_BASE_URL}/notificaciones/usuarios/${encodeURIComponent(usuarioId)}${query}`;
    const resp = await axios.get(url);
    return resp.data;
  } catch (err) {
    console.error("Error obteniendo notificaciones:", err);
    throw err;
  }
};


export const marcarNotificacionLeida = async (notificacionId, token) => {
  try {
    if (!notificacionId) throw new Error("Falta notificacionId");
    const url = `${API_BASE_URL}/notificaciones/${encodeURIComponent(notificacionId)}/leida`;
    const resp = await axios.patch(url);
    return resp.data;
  } catch (err) {
    console.error("Error marcando notificación leída:", err);
    throw err;
  }
};


export const marcarTodasNotificacionesLeidas = async (usuarioId, token) => {
  try {
    if (!usuarioId) throw new Error("Falta usuarioId");
    const url = `${API_BASE_URL}/notificaciones/usuarios/${encodeURIComponent(usuarioId)}/leidas`;

    const resp = await axios.patch(url);
    return resp.data;

  } catch (err) {
    console.error("Error marcando todas las notificaciones leídas:", err);
    throw err;
  }
}; 