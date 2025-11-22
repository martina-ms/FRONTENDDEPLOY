import React from "react";
import "./filtroLateral.css";
import { useState } from "react";

const FiltroLateral = ({ onApplyFilters, onClearFilters }) => {
  const [categoria, setCategoria] = useState("");
  const [moneda, setMoneda] = useState("");
  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [orden, setOrden] = useState("mas_vendido");

  const handleAplicar = () => {
    onApplyFilters({
      categoria: categoria || undefined,
      moneda: moneda || undefined,
      precioMin: precioMin ? Number(precioMin) : undefined,
      precioMax: precioMax ? Number(precioMax) : undefined,
      ordenamiento: orden || undefined,
    });
  };

  const handleLimpiar = () => {
    setCategoria("");
    setMoneda("");
    setPrecioMin("");
    setPrecioMax("");
    setOrden("mas_vendido");

    if (onClearFilters) onClearFilters(); // 🔹 Limpia también lo que venga de la URL
  };

  return (
    <div className="filtro-lateral">
      <h3>Filtrar por</h3>

      <label>
        Categoría:
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
          <option value="">Todas</option>
          <option value="Ropa de Mujer">Ropa de Mujer</option>
          <option value="Ropa de Hombre">Ropa de Hombre</option>
          <option value="Ropa Unisex">Ropa Unisex</option>
          <option value="Ropa de Niños">Ropa de Niños</option>
        </select>
      </label>
      <label>
        Precio mínimo:
        <input
          type="number"
          placeholder="$0"
          value={precioMin}
          onChange={(e) => setPrecioMin(e.target.value)}
        />
      </label>

      <label>
        Precio máximo:
        <input
          type="number"
          placeholder="$100000"
          value={precioMax}
          onChange={(e) => setPrecioMax(e.target.value)}
        />
      </label>

      <label>
        Ordenar por:
        <select value={orden} onChange={(e) => setOrden(e.target.value)}>
          <option value="precio_asc">Precio ascendente</option>
          <option value="precio_desc">Precio descendente</option>
          <option value="mas_vendido">Más vendido</option>
        </select>
      </label>

      <button onClick={handleAplicar}>Aplicar filtros</button>
      <button onClick={handleLimpiar} style={{ marginTop: "8px", backgroundColor: "#ccc" }}>
        Limpiar filtros
      </button>
    </div>
  );
};

export default FiltroLateral;