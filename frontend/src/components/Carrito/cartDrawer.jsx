import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Button from '@mui/material/Button';
import { useCartContext } from "../../context/cartContext";
import './cartDrawer.css';
import { useNavigate } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3000";

const getImageUrl = (imgValue) => {
  if (!imgValue) return null;
  if (typeof imgValue !== "string") return null;
  const trimmed = imgValue.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${API_BASE}${path}`;
};

function convertirMoneda(precio, monedaOrigen, monedaDestino) {
  const cotizacionUSD = 1400;
  const cotizacionREAL = 260;

  if (monedaOrigen === monedaDestino) return precio;

  switch (monedaOrigen) {
    case "USD":
      if (monedaDestino === "ARS") return precio * cotizacionUSD;
      if (monedaDestino === "BRL") return (precio * cotizacionUSD) / cotizacionREAL;
      break;
    case "BRL":
      if (monedaDestino === "ARS") return precio * cotizacionREAL;
      if (monedaDestino === "USD") return (precio * cotizacionREAL) / cotizacionUSD;
      break;
    case "ARS":
      if (monedaDestino === "USD") return precio / cotizacionUSD;
      if (monedaDestino === "BRL") return precio / cotizacionREAL;
      break;
    default:
      return precio;
  }
}

export default function CartDrawer() {
  const { 
    open, 
    carrito, 
    mostrarCarrito,
    esconderCarrito, 
    agregarProductoConCantidad,
    removerProducto 
  } = useCartContext();

  const total = carrito.reduce((sum, p) => {
    const precioEnPesos = convertirMoneda(p.precio, p.moneda, "ARS");
    return sum + precioEnPesos * p.cantidad;
  }, 0);

  const navigate = useNavigate();

  return (
    <Drawer anchor="right" open={open} onClose={esconderCarrito}>
      <div className="cart-drawer-content">
        <h2>Carrito</h2>

        {carrito.length === 0 ? (
          <p className="cart-empty">No hay productos en el carrito.</p>
        ) : (
          <div className="cart-list">
            {carrito.map((p) => {
              const fotoVal = Array.isArray(p.fotos) && p.fotos.length > 0 ? p.fotos[0] : null;
              const imgSrc = getImageUrl(fotoVal) || "/placeholder.png";

              const precioEnPesos = convertirMoneda(p.precio, p.moneda, "ARS");

              return (
                <div key={p._id} className="cart-item">
                  <img
                    src={imgSrc}
                    alt={p.titulo || "Producto en carrito"}
                    className="cart-item-img"
                    loading="lazy"
                    onError={(e) => {
                      if (e?.target) e.target.src = "/placeholder.png";
                    }}
                  />
                  <div className="cart-item-info">
                    <div className="cart-item-title">{p.titulo}</div>
                    <div className="cart-item-price">
                      ${precioEnPesos.toFixed(2)} ARS
                    </div>

                    <div className="cart-item-controls">
                      <IconButton size="small" onClick={() => agregarProductoConCantidad(p, -1)} disabled={p.cantidad <= 1}>
                        <RemoveIcon fontSize="small" />
                      </IconButton>

                      <span className="cart-item-qty">{p.cantidad}</span>

                      <IconButton size="small" onClick={() => agregarProductoConCantidad(p, +1)}>
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </div>
                  </div>

                  <IconButton size="small" onClick={() => removerProducto(p)}>
                    <DeleteIcon />
                  </IconButton>
                </div>
              );
            })}
          </div>
        )}

        <div className="cart-total-section">
          <div className="cart-total-row">
            <span>Total:</span>
            <span>${total.toFixed(2)} ARS</span>
          </div>

          <Button
            disabled={!carrito.length}
            variant="contained"
            fullWidth
            onClick={() => {
              esconderCarrito();
              navigate("/checkout");
            }}
            className="cart-continue-button"
            style={{ marginTop: 16 }}
          >
            Continuar
          </Button>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => {
              esconderCarrito();
              navigate("/");
            }}
            className="cart-yellow-button"
            style={{ marginTop: 16 }}
          >
            ¡COMPRÁ MÁS!
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
