import { useCartContext} from "../../context/cartContext";

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

export default function Carrito() {
const { carrito, removerProducto, limpiarCarrito, actualizarCantidad  } = useCartContext();

const total = carrito.reduce((sum, p) => {
  const precioEnPesos = convertirMoneda(p.precio, p.moneda, "ARS");
  return sum + precioEnPesos * p.cantidad;
}, 0);

    const handleAumentar = (p) => {
    if (p.cantidad < p.stock) {
      actualizarCantidad(p._id, p.cantidad + 1);
    } else {
      alert(`Solo hay ${p.stock} unidades disponibles de ${p.titulo}`);
    }
  };

  const handleDisminuir = (p) => {
    if (p.cantidad > 1) {
      actualizarCantidad(p._id, p.cantidad - 1);
    }
  };

  return (
    <div>
      <h1>Carrito</h1>

      {carrito.length === 0 && <p>No hay productos en el carrito.</p>}

      {carrito.map(p => {
  const precioEnPesos = convertirMoneda(p.precio, p.moneda, "ARS");
  return (
    <div key={p._id}>
      <strong>{p.titulo}</strong> — ${precioEnPesos.toFixed(2)} ARS
      <div style={{ display: "inline-flex", alignItems: "center", marginLeft: "10px" }}>
        <button onClick={() => handleDisminuir(p)}>-</button>
        <span style={{ margin: "0 10px" }}>{p.cantidad}</span>
        <button onClick={() => handleAumentar(p)}>+</button>
      </div>
      <span style={{ marginLeft: "10px" }}>→ ${(precioEnPesos * p.cantidad).toFixed(2)} ARS</span>
      <button style={{ marginLeft: "15px" }} onClick={() => removerProducto(p)}>Eliminar</button>
    </div>
  );
})}


<h2>Total: ${total.toFixed(2)} ARS</h2>

      <button onClick={limpiarCarrito}>Vaciar carrito</button>
      <button onClick={() => alert("Próximo paso: Checkout")}>Continuar</button>
    </div>
  );
}
