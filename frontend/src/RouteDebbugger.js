import React from "react";
import { useLocation } from "react-router-dom";

/**
 * RouteDebugger: componente temporal para mostrar pathname y ayudar a debuggear rutas.
 * Colócalo en tu App para ver en pantalla la ruta actual y forzar logs.
 */
export default function RouteDebugger() {
  const loc = useLocation();
  console.log("[ROUTE DEBUG] current pathname:", loc.pathname);
  return (
    <div style={{ position: "fixed", right: 10, bottom: 10, zIndex: 9999, background: "#fff", border: "1px solid #ccc", padding: "8px", fontSize: 12 }}>
      <strong>Route Debug</strong>
      <div>pathname: {loc.pathname}</div>
    </div>
  );
}