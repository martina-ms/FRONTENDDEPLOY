import React from "react";
import PropTypes from "prop-types";
import "./notificaciones.css";

const formatDate = (iso) => {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
};

export default function NotificacionPanel({
    notifications = [],
    onMarkRead = () => {},
    onMarkAllRead = () => {},
    onClose = () => {},
    }) {

  return (
    <div className="notif-panel" role="dialog" aria-label="Notificaciones">
      <div className="notif-panel-header">
        <strong>Notificaciones</strong>
        <div className="notif-panel-actions">
          <button className="btn-link" onClick={onMarkAllRead}>Marcar todas leídas</button>
          <button className="btn-close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>
      </div>

      <div className="notif-list">
        {notifications.length === 0 && (
          <div className="notif-empty">No hay notificaciones</div>
        )}

        {notifications.map((n) => (
          <div
            key={n._id}
            className={`notif-item ${n.leida ? "read" : "unread"}`}
            role="button"
            tabIndex={0}
            onClick={() => onMarkRead(n._id)}
            onKeyDown={(e) => { if (e.key === "Enter") onMarkRead(n._id); }}
            aria-pressed={n.leida}
          >
            <div className="notif-item-top">
              <div className="notif-title">{n.title || "Notificación"}</div>
              {!n.leida && <span className="notif-badge">Nuevo</span>}
            </div>

            <div className="notif-body">
              <div className="notif-message">{n.mensaje || "No hay detalle."}</div>
              <div className="notif-meta">
                <span className="notif-date">{formatDate(n.fechaAlta)}</span>
                {!n.leida && <button className="btn-mark" onClick={(e) => { e.stopPropagation(); onMarkRead(n._id); }}>Marcar leída</button>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

NotificacionPanel.propTypes = {
  notifications: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string,
      message: PropTypes.string,
      descripcion: PropTypes.string,
      tipo: PropTypes.string,
      createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
      leida: PropTypes.bool,
    })
  ),
  onMarkRead: PropTypes.func,
  onMarkAllRead: PropTypes.func,
  onClose: PropTypes.func,
};

NotificacionPanel.defaultProps = {
  notifications: [],
  onMarkRead: () => {},
  onMarkAllRead: () => {},
  onClose: () => {},
};
