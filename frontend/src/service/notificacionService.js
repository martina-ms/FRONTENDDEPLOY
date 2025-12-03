import axios from "axios";
import api from "../api/api";

const API_BASE_URL = process.env.REACT_APP_API_URL


export const obtenerNotificaciones = async (usuarioId, opts = {}) => {
  try {
    if (!usuarioId) throw new Error("Falta usuarioId");
    const params = [];
    if (opts.leida === true) params.push("leida=true");
    const query = params.length ? `?${params.join("&")}` : "";
    const url = `/notificaciones/usuarios/${encodeURIComponent(usuarioId)}${query}`;
    const resp = await api.get(url);
    return resp.data;
  } catch (err) {
    console.error("Error obteniendo notificaciones:", err);
    throw err;
  }
};


export const marcarNotificacionLeida = async (notificacionId) => {
  try {
    if (!notificacionId) throw new Error("Falta notificacionId");
    const url = `/notificaciones/${encodeURIComponent(notificacionId)}/leida`;
    const resp = await api.patch(url);
    return resp.data;
  } catch (err) {
    console.error("Error marcando notificación leída:", err);
    throw err;
  }
};


export const marcarTodasNotificacionesLeidas = async (usuarioId) => {
  try {
    if (!usuarioId) throw new Error("Falta usuarioId");
    const url = `/notificaciones/usuarios/${encodeURIComponent(usuarioId)}/leidas`;
    const resp = await api.patch(url);
    return resp.data;
  } catch (err) {
    console.error("Error marcando todas las notificaciones leídas:", err);
    throw err;
  }
};