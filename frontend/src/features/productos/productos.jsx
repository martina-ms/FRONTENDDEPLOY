import React, { useEffect, useState } from "react";
import FiltroLateral from "../../components/filtroLateral/filtroLateral";
import "./productos.css";
import { obtenerProductos } from "../../service/productoService";
import { useNavigate, useLocation } from "react-router-dom";

const MONEDA_MAPEO = {
  Peso_arg: "ARS",
  Dolar_usa: "USD",
  Real: "BRL",
};
const API_BASE = process.env.REACT_APP_API_URL || "https://tiendasolback.onrender.com";

const getImageUrl = (imgValue) => {
  if (!imgValue) return null;
  if (typeof imgValue !== "string") return null;
  const trimmed = imgValue.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${API_BASE}${path}`;
};

const Productos = () => {
  const [todosProductos, setTodosProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagina, setPagina] = useState(1);
  const productosPorPagina = 8;
  const [mostrarFiltro, setMostrarFiltro] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const categoriaSeleccionada = queryParams.get("categoria") || "";
  const nombreSeleccionado = queryParams.get("nombre") || "";

  const [filtros, setFiltros] = useState({
    categoria: "",
    nombre: "",
    moneda: "",
    precioMin: undefined,
    precioMax: undefined,
    ordenamiento: "precio_asc",
  });

  useEffect(() => {
    const fetchProductos = async () => {
      setLoading(true);
      try {
        const filtrosValidos = {};

        if (filtros.categoria || categoriaSeleccionada)
          filtrosValidos.categoria = categoriaSeleccionada || filtros.categoria;
        if (filtros.nombre || nombreSeleccionado)
          filtrosValidos.nombre = nombreSeleccionado || filtros.nombre;
        if (filtros.precioMin !== undefined && filtros.precioMin !== "")
          filtrosValidos.precioMin = filtros.precioMin;
        if (filtros.precioMax !== undefined && filtros.precioMax !== "")
          filtrosValidos.precioMax = filtros.precioMax;
        if (filtros.ordenamiento)
          filtrosValidos.ordenamiento = filtros.ordenamiento;

        // Traemos **todos los productos filtrados** del backend
        const data = await obtenerProductos(filtrosValidos);
        setTodosProductos(data.productos || data);
      } catch (error) {
        console.error("Error cargando productos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, [filtros, categoriaSeleccionada, nombreSeleccionado]);

  const handleClickProducto = (id) => {
    navigate(`/productos/${id}`);
  };

  // Paginación en frontend
  const totalPaginas = Math.ceil(todosProductos.length / productosPorPagina);
  const indiceInicio = (pagina - 1) * productosPorPagina;
  const productosPagina = todosProductos.slice(
    indiceInicio,
    indiceInicio + productosPorPagina
  );

  if (loading) return <div className="productos-loading">Cargando productos...</div>;

  return (
    <div className="productos-page">
      <button
        className="btn-toggle-filtro"
        onClick={() => setMostrarFiltro(!mostrarFiltro)}
      >
        {mostrarFiltro ? "Cerrar filtros" : "Filtrar"}
      </button>

      <div className="layout-contenido">
        <div className={`filtro-wrapper ${mostrarFiltro ? "show" : ""}`}>
          <FiltroLateral
            onApplyFilters={(nuevosFiltros) => {
              setFiltros(nuevosFiltros);
              setPagina(1);
            }}
            onClearFilters={() => {
              navigate("/productos", { replace: true });
              setFiltros({
                categoria: "",
                nombre: "",
                moneda: "",
                precioMin: undefined,
                precioMax: undefined,
                ordenamiento: "mas_vendido",
              });
              setPagina(1);
            }}
          />
        </div>

        <div className="productos-container">
          <div className="productos-list">
            {productosPagina.length === 0 ? (
              <p>No hay productos disponibles.</p>
            ) : (
              productosPagina.map((prod) => {
                const moneda = MONEDA_MAPEO[prod.moneda] || "";
                const precioFormateado = prod.precio
                  ? `$${Number(prod.precio).toLocaleString("es-AR")} ${moneda}`
                  : "Precio no disponible";
                  const primeraFoto = Array.isArray(prod.fotos) && prod.fotos.length > 0
                  ? getImageUrl(prod.fotos[0])
                  : null;
                const imagenSrc = primeraFoto || "/placeholder.png";

                return (
                  <div
                    key={prod._id}
                    className="producto-card"
                    onClick={() => handleClickProducto(prod._id)}
                  >
                    <img
                      src={imagenSrc}
                      alt={prod.titulo}
                      className="producto-imagen"
                    />
                    <div className="producto-info">
                      <h3 className="producto-titulo">{prod.titulo}</h3>
                      <p className="producto-descripcion">
                        {prod.descripcion?.length > 100
                          ? prod.descripcion.slice(0, 100) + "..."
                          : prod.descripcion}
                      </p>
                      <p className="producto-precio">{precioFormateado}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {totalPaginas > 1 && (
            <div className="paginacion">
              <button
                disabled={pagina === 1}
                onClick={() => setPagina(pagina - 1)}
                className={`paginacion-btn ${pagina === 1 ? "disabled" : ""}`}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <span className="paginacion-info">
                Página {pagina} de {totalPaginas}
              </span>

              <button
                disabled={pagina === totalPaginas}
                onClick={() => setPagina(pagina + 1)}
                className={`paginacion-btn ${pagina === totalPaginas ? "disabled" : ""}`}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Productos;
