import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";
import Header from "./Header";
import { FaShoppingCart, FaBars, FaTimes } from "react-icons/fa";
import { useCartContext } from "../../context/cartContext";
import NotificacionBell from "../notificaciones/NotificacionBell";
import useAuth from "../../hooks/useAuth";
import { getToken } from "../../auth/authService.js";

/**
 * Navbar actualizado para Auth0.
 * Muestra botones de login/logout y maneja roles (leyendo el access token).
 *
 * Importante: para determinar roles en frontend decodificamos el access token.
 * La fuente de verdad debe ser el backend, pero para UI temporal esto sirve.
 */
const Navbar = () => {
  const { carrito, mostrarCarrito } = useCartContext();
  const cantidadTotal = carrito.reduce((sum, p) => sum + p.cantidad, 0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const { loginWithRedirect, logout, isAuthenticated, user, isLoading } = useAuth();

  const [roles, setRoles] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!isAuthenticated) {
        setRoles([]);
        return;
      }
      try {
        const token = await getToken();
        if (!token) {
          setRoles([]);
          return;
        }
        const payload = JSON.parse(atob(token.split('.')[1]));
        const rolesNamespace = process.env.REACT_APP_AUTH0_ROLES_NAMESPACE || "https://tienda.example.com/roles";
        const tokenRoles = payload[rolesNamespace] || payload.roles || (payload.realm_access && payload.realm_access.roles) || [];
        if (mounted) setRoles(Array.isArray(tokenRoles) ? tokenRoles : []);
      } catch (e) {
        console.warn("Navbar: no se pudieron leer roles del token", e);
        setRoles([]);
      }
    })();
    return () => { mounted = false; };
  }, [isAuthenticated]);

  const handleSearch = () => {
    if (searchText.trim() !== "") {
      navigate(`/productos?nombre=${encodeURIComponent(searchText.trim())}`);
      setSearchText("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const hasRole = (r) => roles.includes(r);

  return (
    <>
      {location.pathname === "/" && <Header />}

      <nav className="navbar">
        <div className="nav-logo"><a href="/">Tienda Sol</a></div>

        <div className="nav-search-wrapper">
          <input
            type="text"
            placeholder="Buscar..."
            className="nav-search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button className="nav-search-btn" onClick={handleSearch}>Buscar</button>
        </div>

        <div className="nav-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FaTimes /> : <FaBars />}
        </div>

        <div className={`nav-links ${menuOpen ? "active" : ""}`}>
          <a href="/">Inicio</a>

          <div
            className="nav-item-with-submenu"
            onMouseEnter={() => setSubmenuOpen(true)}
            onMouseLeave={() => setSubmenuOpen(false)}
          >
            <button className="nav-main-link">Productos ▾</button>
            <div className={`submenu ${submenuOpen ? "show" : ""}`}>
              <a href="/productos">Ver productos</a>
              <a href="/carga-producto">Subir producto</a>
            </div>
          </div>

          {isAuthenticated && hasRole('comprador') && (
            <a href="/pedidos">Mis Pedidos</a>
          )}

          <div className="nav-icons">
            <button
              onClick={mostrarCarrito}
              className="nav-icon-button"
              style={{ position: "relative" }}
            >
              <FaShoppingCart className="nav-icon" />
              {cantidadTotal > 0 && (
                <span style={{
                    position: "absolute",
                    top: -8,
                    right: -8,
                    background: "red",
                    color: "white",
                    borderRadius: "50%",
                    padding: "2px 6px",
                    fontSize: "12px"
                  }}>
                  {cantidadTotal}
                </span>
              )}
            </button>

            <NotificacionBell />
          </div>

          {!isAuthenticated && (
            <button
              type="button"
              className="auth-button login"
              onClick={() => loginWithRedirect()}
            >
              Iniciar Sesión
            </button>
          )}

          {isAuthenticated && (
            <div className="user-info-nav">
              {hasRole('administrador') && (
                <button className="nav-button">Admin</button>
              )}

              <button
                type="button"
                className="auth-button logout"
                onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
              >
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;