import { useCartContext } from "../context/cartContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import "./Checkout.css";
import CircularProgress from "@mui/material/CircularProgress";
import useAuth from "../hooks/useAuth";
import { getToken } from "../auth/authService";
import api from "../api/api";

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

export default function Checkout() {
  const { carrito, limpiarCarrito } = useCartContext();
  const navigate = useNavigate();
  const carritoVacio = carrito.length === 0;
  const [countdown, setCountdown] = useState(5);
  const [pedidoConfirmado, setPedidoConfirmado] = useState(false);
  const [direccion, setDireccion] = useState({
    calle: "",
    altura: "",
    codigoPostal: "",
    ciudad: "",
    provincia: "",
    pais: "Argentina"
  });
  const [loading, setLoading] = useState(false);

  const total = carrito.reduce((sum, p) => {
    const precioEnPesos = convertirMoneda(p.precio, p.moneda, "ARS");
    return sum + precioEnPesos * p.cantidad;
  }, 0);

  const { isAuthenticated, loginWithRedirect, user } = useAuth();

  useEffect(() => {
    if (!carritoVacio || pedidoConfirmado) return;
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate("/");
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [carritoVacio, navigate, pedidoConfirmado]);

  const obtenerCompradorId = async () => {
    // Preferimos usar user.sub si está disponible, si no decodeamos el access token
    if (user && user.sub) return user.sub;
    try {
      const token = await getToken();
      if (!token) return null;
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.sub || null;
    } catch (e) {
      console.warn("No se pudo obtener compradorId desde token", e);
      return null;
    }
  };

  const handleConfirmar = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      // Redirigir al login si no está autenticado
      await loginWithRedirect();
      return;
    }

    setLoading(true);

    const compradorId = await obtenerCompradorId();
    if (!compradorId) {
      alert("Error: no se pudo identificar al usuario. Iniciá sesión nuevamente.");
      setLoading(false);
      return;
    }

    const pedido = {
      comprador: compradorId,
      moneda: "Peso_arg",
      direccionEntrega: {
        ...direccion,
        altura: Number(direccion.altura)
      },
      items: carrito.map(p => ({
        producto: p._id,
        cantidad: p.cantidad
      }))
    };

    try {
      const resp = await api.post("/pedidos", pedido);

      if (resp.status && resp.status >= 400) {
        console.log(resp);
        alert("Error procesando pedido");
        return;
      }

      setPedidoConfirmado(true);
      limpiarCarrito(true);
      navigate("/gracias");
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 401) {
        // Token inválido/expirado: forzar relogin
        alert("Sesión expirada o no autorizada. Volvé a iniciar sesión.");
        await loginWithRedirect();
        return;
      }
      alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page">
      <form className="form-checkout" onSubmit={handleConfirmar}>
        <h2>Confirmar Pedido</h2>

        <h4 className="subtitulo">Dirección de entrega</h4>

        <label>
          Calle
          <input
            placeholder="Ej: Av. Rivadavia"
            value={direccion.calle}
            onChange={(e) => setDireccion({ ...direccion, calle: e.target.value })}
            disabled={carritoVacio}
            required
          />
        </label>

        <label>
          Altura
          <input
            placeholder="Ej: 1234"
            value={direccion.altura}
            onChange={(e) => setDireccion({ ...direccion, altura: e.target.value })}
            disabled={carritoVacio}
            required
          />
        </label>

        <label>
          Código Postal
          <input
            placeholder="Ej: 1406"
            value={direccion.codigoPostal}
            onChange={(e) => setDireccion({ ...direccion, codigoPostal: e.target.value })}
            disabled={carritoVacio}
            required
          />
        </label>

        <label>
          Ciudad
          <input
            placeholder="Ej: CABA"
            value={direccion.ciudad}
            onChange={(e) => setDireccion({ ...direccion, ciudad: e.target.value })}
            disabled={carritoVacio}
            required
          />
        </label>

        <label>
          Provincia
          <select
            value={direccion.provincia}
            onChange={(e) => setDireccion({ ...direccion, provincia: e.target.value })}
            disabled={carritoVacio}
            required
          >
            <option value="">Seleccione una provincia</option>
            <option value="Buenos Aires">Buenos Aires</option>
            <option value="Catamarca">Catamarca</option>
            <option value="Chaco">Chaco</option>
            <option value="Chubut">Chubut</option>
            <option value="Córdoba">Córdoba</option>
            <option value="Corrientes">Corrientes</option>
            <option value="Entre Ríos">Entre Ríos</option>
            <option value="Formosa">Formosa</option>
            <option value="Jujuy">Jujuy</option>
            <option value="La Pampa">La Pampa</option>
            <option value="La Rioja">La Rioja</option>
            <option value="Mendoza">Mendoza</option>
            <option value="Misiones">Misiones</option>
            <option value="Neuquén">Neuquén</option>
            <option value="Río Negro">Río Negro</option>
            <option value="Salta">Salta</option>
            <option value="San Juan">San Juan</option>
            <option value="San Luis">San Luis</option>
            <option value="Santa Cruz">Santa Cruz</option>
            <option value="Santa Fe">Santa Fe</option>
            <option value="Santiago del Estero">Santiago del Estero</option>
            <option value="Tierra del Fuego">Tierra del Fuego</option>
            <option value="Tucumán">Tucumán</option>
          </select>
        </label>

        <label>
          País
          <input
            value={direccion.pais}
            readOnly
            disabled={carritoVacio}
          />
        </label>

        {!carritoVacio && (
          <>
            <h4 className="subtitulo">Resumen del pedido</h4>
            {carrito.map((p) => {
              const precioEnPesos = convertirMoneda(p.precio, p.moneda, "ARS");
              return (
                <div key={p._id} className="resumen-item">
                  <span>{p.titulo} × {p.cantidad}</span>
                  <strong>${(precioEnPesos * p.cantidad).toFixed(2)} ARS</strong>
                </div>
              );
            })}

            <div className="resumen-total">
              <span>Total:</span>
              <strong>${total.toFixed(2)} ARS</strong>
            </div>
          </>
        )}

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={carritoVacio || loading}
          className="btn-confirmar"
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Confirmar Pedido"}
        </Button>

        {carritoVacio && (
          <p className="volver-texto">
            Volviendo al inicio en {countdown}...
          </p>
        )}

      </form>
    </div>
  );
}