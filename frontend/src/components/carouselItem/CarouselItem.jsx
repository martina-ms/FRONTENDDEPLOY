import "./CarouselItem.css";
import { Link } from "react-router-dom";
import React from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3000";

const MONEDA_MAPEO = {
  'Peso_arg': 'ARS',
  'Dolar_usa': 'USD',
  'Real': 'BRL',
};

const getImageUrl = (imgValue) => {
  if (!imgValue) return null;
  if (typeof imgValue !== "string") return null;
  const trimmed = imgValue.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${API_BASE}${path}`;
};

const CarouselItem = ({ producto }) => {
  const navigate = useNavigate();
  if (!producto) return null;

  const moneda = MONEDA_MAPEO[producto.moneda] || '';
  const primeraImagenValue =
    Array.isArray(producto.fotos) && producto.fotos.length > 0
      ? producto.fotos[0]
      : null;

  const primeraImagenUrl = getImageUrl(primeraImagenValue) || "/placeholder.jpg";


  const precioFormateado = producto.precio
    ? `$${producto.precio.toLocaleString("es-AR")} ${moneda}`
    : "Precio no disponible";

  const handleClickProducto = () => {
    navigate(`/productos/${producto._id}`);
  };

  return (
    <div
      key={producto._id}
      className="carousel-card-link"
      onClick={handleClickProducto}
    >
      <div className="carousel-card">
        <img
          src={primeraImagenUrl}
          alt={producto.titulo || "Producto"}
          className="carousel-image"
          loading="lazy"
        />

        {/* Información del producto */}
        <div className="carousel-info">
          <h3 className="carousel-name">{producto.titulo || "Producto sin nombre"}</h3>
          <p className="carousel-price">{precioFormateado}</p>
        </div>
      </div>
      </div>
  );
};

CarouselItem.propTypes = {
  producto: PropTypes.shape({
    id: PropTypes.number.isRequired,
    titulo: PropTypes.string,
    precio: PropTypes.number,
    moneda: PropTypes.string,
    fotos: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
};

export default CarouselItem;