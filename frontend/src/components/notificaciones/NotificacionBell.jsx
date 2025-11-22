import React, { useEffect, useRef, useState } from "react";
import { FaBell } from "react-icons/fa";
import { useKeycloak } from "@react-keycloak/web";
import NotificacionPanel from "./NotificacionPanel";
import {
  obtenerNotificaciones,
  marcarNotificacionLeida,
 marcarTodasNotificacionesLeidas,
} from "../../service/notificacionService";
import "./notificaciones.css";

export default function NotificacionBell() {
  const { keycloak, initialized } = useKeycloak();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  const usuarioId = keycloak?.tokenParsed?.sub || keycloak?.subject || null;

  
  useEffect(() => {
    if (!initialized || !keycloak?.authenticated) {
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

    // Opcional: polling cada 30s (si no usás websockets)
    const interval = setInterval(fetch, 30000);
    return () => { mounted = false; clearInterval(interval); };
  }, [initialized, keycloak, usuarioId]);

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
      
    }
  };

    const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, leida: true })));
    try {
      await marcarTodasNotificacionesLeidas(usuarioId);
    } catch (err) {
      console.error("Error marcando todas leídas:", err);
    }
  }; 

  /* Time real con Socket.IO 
  useEffect(() => {
    if (!initialized || !keycloak?.authenticated) return;
    const socket = io(API_BASE_URL, { auth: { token: keycloak.token } });
    socket.on("connect", () => console.log("socket conectado"));
    socket.on("notificacion", (n) => {
      setNotifications((prev) => [n, ...prev]);
    });
    return () => socket.disconnect();
  }, [initialized, keycloak]);
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
          />
        </div>
      )}
    </div>
  );
}