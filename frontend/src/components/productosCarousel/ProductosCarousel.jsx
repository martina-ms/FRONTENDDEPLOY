import React, { useState, useEffect } from "react";
import CarouselItem from "../carouselItem/CarouselItem.jsx";
import "./ProductosCarousel.css";
import PropTypes from "prop-types";

export default function ProductoCarousel({ productos }) {

  useEffect(() => {
    setIndex(0);
  }, [productos]);

  const [index, setIndex] = useState(0);
  const visible = 4; // Mostrar 4 productos a la vez

  const siguiente = () => {
    if (index < productos.length - visible) setIndex(index + 1);
  };

  const anterior = () => {
    if (index > 0) setIndex(index - 1);
  };

  if (!Array.isArray(productos) || productos.length === 0) {
    return <p className="carousel-empty">No hay productos disponibles</p>;
  }

  return (
    <div className="carousel-container">

      <div className="carousel-wrapper">
        <div className="carousel-viewport">
          <div
            className={`carousel-track ${productos.length <= visible ? "centered" : ""}`}
            style={{
              transform:
                productos.length <= visible
                  ? "none" // no aplicar desplazamiento
                  : `translateX(-${index * (100 / visible)}%)`,
            }}
          >
            {productos.map((producto) => (
              <CarouselItem producto={producto} key={producto.id} />
            ))}
          </div>
        </div>

        <button
          onClick={anterior}
          disabled={index === 0}
          className={`carousel-btn left-btn ${index === 0 ? "disabled" : ""
            }`}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <button
          onClick={siguiente}
          disabled={index >= productos.length - visible}
          className={`carousel-btn right-btn ${index >= productos.length - visible ? "disabled" : ""
            }`}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

ProductoCarousel.propTypes = {
  productos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      titulo: PropTypes.string,
      precio: PropTypes.number,
      moneda: PropTypes.string,
      fotos: PropTypes.arrayOf(PropTypes.string),
    })
  ).isRequired,
};