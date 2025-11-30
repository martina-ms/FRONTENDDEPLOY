import React, { useEffect, useRef, useState } from "react";
import { FaBell } from "react-icons/fa";
import NotificacionPanel from "./NotificacionPanel";
import {
  obtenerNotificaciones,
  marcarNotificacionLeida,
  marcarTodasNotificacionesLeidas,
} from "../../service/notificacionService";
import "./notificaciones.css";
import useAuth from "../../hooks/useAuth";
import { getToken } from "../../auth/authService";

/**
 * Nota: la autorización en las llamadas al backend la maneja el interceptor de src/api.js,
 * que ya agrega Authorization: Bearer <token> usando authService.getToken().
 */

export default function NotificacionBell() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  // Preferimos usar user.sub de Auth0; si no está, intentamos extraer sub del access token
  const [usuarioId, setUsuarioId] = useState(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!isAuthenticated) {
        if (mounted) setUsuarioId(null);
        return;
      }

      // Si Auth0 user está disponible, usar su sub
      if (user && user.sub) {
        if (mounted) setUsuarioId(user.sub);
        return;
      }

      // Fallback: decodificar access token para obtener sub
      try {
        const token = await getToken();
        if (token) {
          const payload = JSON.parse(atob(token.split(".")[1]));
          if (mounted) setUsuarioId(payload.sub || null);
          return;
        }
        if (mounted) setUsuarioId(null);
      } catch (e) {
        console.warn("NotificacionBell: no se pudo obtener usuarioId desde token", e);
        if (mounted) setUsuarioId(null);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [isAuthenticated, user]);

  // Cargar notificaciones (polling opcional)
  useEffect(() => {
    if (!isAuthenticated || !usuarioId) {
      setNotifications([]);
      return;
    }

    let mounted = true;
    const fetch = async () => {
      setLoading(true);
      try {
        const resp = await obtenerNotificaciones(usuarioId);
        const lista = resp.notificaciones || resp;
        if (mounted) {
          lista.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setNotifications(lista);
        }
      } catch (err) {
        console.error("Error cargando notificaciones:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetch();

    const interval = setInterval(fetch, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [isAuthenticated, usuarioId]);

  // Click fuera para cerrar
  useEffect(() => {
    const onDocClick = (e) => {
      if (!open) return;
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [open]);

  const unreadCount = notifications.filter((n) => !n.leida).length;

  const handleToggle = (e) => {
    e.stopPropagation();
    setOpen((v) => !v);
  };

  const handleMarkRead = async (id) => {
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, leida: true } : n)));
    try {
      await marcarNotificacionLeida(id);
    } catch (err) {
      console.error("Error marcando leída:", err);
      // Podrías revertir el estado si querés manejar fallos:
      // setNotifications(prev => prev.map(n => n._id === id ? { ...n, leida: false } : n));
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, leida: true })));
    try {
      await marcarTodasNotificacionesLeidas(usuarioId);
    } catch (err) {
      console.error("Error marcando todas leídas:", err);
      // Revertir si es necesario
    }
  };

  /* Ejemplo de uso de Socket.IO con token (descomentá si usás sockets)
     NOTA: el servidor debe aceptar el token vía auth en la conexión o en query.
  useEffect(() => {
    if (!isAuthenticated) return;
    let socket;
    (async () => {
      try {
        const token = await getToken();
        if (!token) return;
        socket = io(API_BASE_URL, { auth: { token } });
        socket.on("connect", () => console.log("socket conectado"));
        socket.on("notificacion", (n) => {
          setNotifications((prev) => [n, ...prev]);
        });
      } catch (e) {
        console.warn("NotificacionBell: error al conectar socket", e);
      }
    })();

    return () => {
      if (socket) socket.disconnect();
    };
  }, [isAuthenticated]);
  ------------------------------------------------------------------------------ */

  return (
    <div className="notif-root" ref={containerRef}>
      <button
        className="notif-bell-btn"
        onClick={handleToggle}
        aria-haspopup="dialog"
        aria-expanded={open}
        title="Notificaciones"
      >
        <FaBell />
        {unreadCount > 0 && <span className="notif-count">{unreadCount}</span>}
      </button>

      {open && (
        <div className="notif-panel-portal">
          <NotificacionPanel
            notifications={notifications}
            onMarkRead={handleMarkRead}
            onMarkAllRead={handleMarkAllRead}
            onClose={() => setOpen(false)}
            loading={loading}
          />
        </div>
      )}
    </div>
  );
}