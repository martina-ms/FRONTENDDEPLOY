import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";
import Header from "./Header";
import { useKeycloak } from '@react-keycloak/web';
import { FaShoppingCart, FaBars, FaTimes } from "react-icons/fa";
import { useCartContext } from "../../context/cartContext";
import NotificacionBell from "../notificaciones/NotificacionBell";



const Navbar = () => {
  const { carrito, mostrarCarrito } = useCartContext();
  const cantidadTotal = carrito.reduce((sum, p) => sum + p.cantidad, 0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();
  const location = useLocation(); 

  // Función que redirige a /productos con query param "nombre"
  const handleSearch = () => {
    if (searchText.trim() !== "") {
      navigate(`/productos?nombre=${encodeURIComponent(searchText.trim())}`);
      setSearchText(""); // opcional: limpiar input
    }
  };

  // Permitir buscar al presionar Enter
  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const { keycloak, initialized } = useKeycloak();
  return (
    <>
      {location.pathname === "/" && <Header />}

      <nav className="navbar">
        {/* Logo */}
        <div className="nav-logo"><a href="/">Tienda Sol</a></div>

        {/* Buscador */}
        <div className="nav-search-wrapper">
          <input
            type="text"
            placeholder="Buscar..."
            className="nav-search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button className="nav-search-btn" onClick={handleSearch}>
            Buscar
          </button>
        </div>

        {/* Botón menú hamburguesa */}
        <div className="nav-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FaTimes /> : <FaBars />}
        </div>

        {/* Enlaces de navegación */}
        <div className={`nav-links ${menuOpen ? "active" : ""}`}>
          <a href="/">Inicio</a>

          {/* Productos con submenú */}
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


          {keycloak.authenticated && keycloak.hasRealmRole('default-roles-tp-tienda-sol') && (
            <a href="/pedidos">Mis Pedidos</a>
          )}

          {/* Íconos */}
          <div className="nav-icons">
            <button
              onClick={mostrarCarrito}
              className="nav-icon-button"
              style={{ position: "relative" }}
            >
              <FaShoppingCart className="nav-icon" />
              {cantidadTotal > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -8,
                    right: -8,
                    background: "red",
                    color: "white",
                    borderRadius: "50%",
                    padding: "2px 6px",
                    fontSize: "12px"
                  }}
                >
                  {cantidadTotal}
                </span>
              )}
            </button>

            <NotificacionBell />
          </div>


          {/* Si el usuario NO está autenticado */}
          {!keycloak.authenticated && (
            <button
              type="button"
              className="auth-button login"
              onClick={() => keycloak.login()}
            >
              Iniciar Sesión
            </button>
          )}

          {/* Si el usuario SÍ está autenticado */}
          {keycloak.authenticated && (
            <div className="user-info-nav">
              {keycloak.hasRealmRole('administrador') && (
                <button className="nav-button">Admin</button>
              )}

              <button
                type="button"
                className="auth-button logout"
                onClick={() => keycloak.logout()}
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
