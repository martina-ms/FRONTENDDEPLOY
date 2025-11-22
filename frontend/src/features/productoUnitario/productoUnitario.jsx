import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { obtenerProducto, obtenerProductos } from "../../service/productoService"; //ojo aki
import "./productoUnitario.css";
import { useCartContext } from "../../context/cartContext";


const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3000";

const MONEDA_MAPEO = {
  Peso_arg: "ARS",
  Dolar_usa: "USD",
  Real: "BRL",
};

const ProductoUnitario =() => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [producto, setProducto] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cantidad, setCantidad] = useState(1);
    const [indiceImagen, setIndiceImagen] = useState(0);
    const [relacionados, setRelacionados] = useState([]);

    //carrusel
    const scrollRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    useEffect(() => {
     const fetchProductoYRelacionados = async () => {
      setLoading(true);
      try {
        const data = await obtenerProducto(id);
        const productoReal = data.producto || data;
        setProducto(productoReal);

        // si no hay categorias, no buscamos relacionados
        const cats = Array.isArray(productoReal?.categorias) ? productoReal.categorias : [];
        if (!cats.length) {
          setRelacionados([]);
          return;
        }

        const categoriasConsulta = cats.slice(0, 5);

        const promises = categoriasConsulta.map((cat) =>
          obtenerProductos({ categoria: cat, limit: 8 })
            .then((resp) => resp.productos || resp) // normalizo formato
            .catch((err) => {
              console.warn("Error al pedir relacionados para categoria", cat, err);
              return [];
            })
        );

        const resultados = await Promise.all(promises);
        
        const flatten = resultados.flat();

        // Mapa para eliminar duplicados por _id
        const seen = new Set();
        const filtered = [];
        for (const p of flatten) {
          if (!p || !p._id) continue;
          if (p._id === productoReal._id) continue; // excluyo el producto actual
          if (seen.has(p._id)) continue;
          seen.add(p._id);
          filtered.push(p);
          if (filtered.length >= 8) break; // limito a 8
        }

        setRelacionados(filtered);
      } catch (err) {
        console.error("Error al cargar producto y relacionados:", err);
        setProducto(null);
        setRelacionados([]);
      } finally {
        setLoading(false);
        setIndiceImagen(0);
      }
    };

    fetchProductoYRelacionados();
}, [id]);

    const checkScroll = () => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 5);
        setCanScrollRight(el.scrollLeft + el.clientWidth + 5 < el.scrollWidth);
    };

        useEffect(() => {
            checkScroll();
            const onResize = () => checkScroll();
            window.addEventListener("resize", onResize);
            const el = scrollRef.current;
            if (el) el.addEventListener("scroll", checkScroll);
            return () => {
            window.removeEventListener("resize", onResize);
            if (el) el.removeEventListener("scroll", checkScroll);
            };
        }, [relacionados]);

    const scroll = (direction = "right") => {
        const el = scrollRef.current;
        if (!el) return;
        const scrollAmount = Math.floor(el.clientWidth * 0.8);
        const to = direction === "right" ? el.scrollLeft + scrollAmount : el.scrollLeft - scrollAmount;
        el.scrollTo({ left: to, behavior: "smooth" });
    };



    const moneda = MONEDA_MAPEO[producto?.moneda] || "";

    const precioFormateado = producto?.precio
        ? `$${Number(producto.precio).toLocaleString("es-AR")} ${moneda}`
        : "Precio no disponible";


    const { agregarProductoConCantidad, mostrarCarrito } = useCartContext();

  const handleAgregarCarrito = () => {
    const productoParaCarrito = {
    ...producto,
    moneda: MONEDA_MAPEO[producto.moneda] || "ARS", 
  };
  agregarProductoConCantidad(productoParaCarrito, cantidad);
  mostrarCarrito(); // se abre el carrito automaticamente
};
   /* const handleAgregarCarrito = () => {
    // ver cuando exista carrito
    try {
      const carrito = JSON.parse(localStorage.getItem("carrito") || "[]");
      const existenteIndex = carrito.findIndex((i) => i._id === producto._id);
      if (existenteIndex >= 0) {
        carrito[existenteIndex].cantidad += cantidad;
      } else {
        carrito.push({ ...producto, cantidad });
      }
      localStorage.setItem("carrito", JSON.stringify(carrito));
      // redirigir a carrito o mostrar notificación
      navigate("/carrito");
    } catch (e) {
      console.error("Error al agregar al carrito:", e);
    }
  }; */

  const handleComprarAhora = () => {
    const productoParaCarrito = {
    ...producto,
    moneda: MONEDA_MAPEO[producto.moneda] || "ARS",
  };
  agregarProductoConCantidad(productoParaCarrito, cantidad);
  mostrarCarrito(); // si querés que el usuario lo vea primero
  // navigate("/pedido");  // lo dejamos para mas adelante xq es lo del checkout
};
  
  /*const handleComprarAhora = () => {
    // agregar 1 al carrito y redirigir a checkout
    try {
      const carrito = JSON.parse(localStorage.getItem("carrito") || "[]");
      const existenteIndex = carrito.findIndex((i) => i._id === producto._id);
      if (existenteIndex >= 0) {
        carrito[existenteIndex].cantidad += cantidad;
      } else {
        carrito.push({ ...producto, cantidad });
      }
      localStorage.setItem("carrito", JSON.stringify(carrito));
      //ver cuando exista pedido!
      navigate("/pedido");
    } catch (e) {
      console.error("Error al comprar ahora:", e);
    }
  };  */
    
     const handleClickRelacionado = (relId) => {
        navigate(`/productos/${relId}`);
    };
    // UTIL: genera URL absoluta válida para la imagen según el valor guardado en DB
  const getImageUrl = (fotoValue) => {
    if (!fotoValue) return null;
    // si ya es URL absoluta
    if (typeof fotoValue === "string" && (fotoValue.startsWith("http://") || fotoValue.startsWith("https://"))) {
      return fotoValue;
    }
    // si viene con slash inicial (ej. /uploads/xxx.jpg) o sin él (xxx.jpg)
    const path = fotoValue.startsWith("/") ? fotoValue : `/${fotoValue}`;
    return `${API_BASE}${path}`;
  };


    if (loading) return <div className="producto-detalle-loading">Cargando producto...</div>;
    if (!producto) return <div className="producto-detalle-loading">Producto no encontrado.</div>;

    const mainFotoValue = producto.fotos?.[indiceImagen] ?? null;
    const mainFotoUrl = getImageUrl(mainFotoValue);
    return (
    <div className="producto-detalle-page">
      <div className="producto-detalle-layout">
        <div className="galeria">
          <div className="imagen-principal">
          <img src={mainFotoUrl || "/placeholder.png"} alt={producto.titulo} />
          </div>
          <div className="miniaturas">
            {(producto.fotos?.length ? producto.fotos : []).map((src, idx) => (
              <button
                key={idx}
                className={`miniatura-btn ${idx === indiceImagen ? "active" : ""}`}
                onClick={() => setIndiceImagen(idx)}
              >
                <img src={getImageUrl(src) || "/placeholder.png"} alt={`${producto.titulo} miniatura ${idx + 1}`} />
              </button>
  ))}
</div>

        </div>

        <div className="info">
          <h1 className="titulo">{producto.titulo}</h1>

          {/* mostrar categorias como chips o coma */}
          <div className="categorias">
            {Array.isArray(producto.categorias) && producto.categorias.length ? (
              producto.categorias.map((c, i) => (
                <span key={`${c}-${i}`} className="categoria-chip">
                  {c}
                </span>
              ))
            ) : (
              <span className="categoria-empty">Sin categorías</span>
            )}
          </div>

          <div className="precio-stock">
            <p className="precio">{precioFormateado}</p>
            <p className={`stock ${producto.stock > 0 ? "disponible" : "agotado"}`}>
              {producto.stock > 0 ? `Stock: ${producto.stock}` : "Agotado"}
            </p>
          </div>

          <div className="acciones">
            <label className="label-cantidad">Cantidad</label>
            <input
              type="number"
              min="1"
              max={producto.stock || 999}
              value={cantidad}
              onChange={(e) => setCantidad(Math.max(1, Number(e.target.value)))}
              className="input-cantidad"
            />

            <div className="botones">
              <button className="btn-agregar" onClick={handleAgregarCarrito} disabled={producto.stock <= 0}>
                Agregar al carrito
              </button>
              <button className="btn-comprar" onClick={handleComprarAhora} disabled={producto.stock <= 0}>
                Comprar ahora
              </button>
            </div>
          </div>

          <div className="descripcion">
            <h3>Descripción</h3>
            <p>{producto.descripcion || "Sin descripción disponible."}</p>
          </div>

          {producto.vendedor && (
            <div className="vendedor">
              <h4>Vendedor</h4>
              <p className="vendedor-nombre">{producto.vendedor.nombre || producto.vendedor}</p>
              {producto.vendedor.contacto && <p className="vendedor-contacto">Contacto: {producto.vendedor.contacto}</p>}
            </div>
          )}
        </div>
      </div>

      {relacionados.length > 0 && (
        <div className="relacionados-section">
          <h3>Productos relacionados</h3>

          <div className="relacionados-carrusel-wrapper">
            <button className={`carrusel-btn left ${!canScrollLeft ? "hidden" : ""}`} onClick={() => scroll("left")} aria-label="Desplazar izquierda">
              ◀
            </button>

            <div className="relacionados-carrusel" ref={scrollRef} onScroll={checkScroll}>
              {relacionados.map((r) => (
                <div key={r._id} className="producto-card relacionado" onClick={() => handleClickRelacionado(r._id)}>
                  <img src={getImageUrl(r.fotos?.[0]) || "/placeholder.png"} alt={r.titulo} className="producto-imagen" />
                  <div className="producto-info">
                    <h4 className="producto-titulo">{r.titulo}</h4>
                    <p className="producto-precio">
                      {r.precio ? `$${Number(r.precio).toLocaleString("es-AR")} ${MONEDA_MAPEO[r.moneda] || ""}` : "Precio no disponible"}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button className={`carrusel-btn right ${!canScrollRight ? "hidden" : ""}`} onClick={() => scroll("right")} aria-label="Desplazar derecha">
              ▶
            </button>
          </div>
        </div>
      )}
    </div>
  );
};



export default ProductoUnitario;