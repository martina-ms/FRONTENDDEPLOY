import React from "react";
import "./App.css";
import Home from "./features/home/Home";
import Productos from "./features/productos/productos";
import Navbar from "./components/headers/Navbar";
import Footer from "./components/footer/Footer";
import CargaProducto from "./features/cargaProducto/cargaProducto";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProductoUnitario from "./features/productoUnitario/productoUnitario";
import MisPedidos from "./features/Pedidos/MisPedidos";
import Carrito from "./features/Pedidos/Carrito";
import CartDrawer from "./components/Carrito/cartDrawer";
import Checkout from "./pages/Checkout";
import Gracias from "./pages/Gracias";

function App() {
  return (
    <>
      <Navbar />
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/carga-producto" element={<CargaProducto />} />
          <Route path="/pedidos" element={<MisPedidos />} />
          <Route path="/productos/:id" element={<ProductoUnitario />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/gracias" element={<Gracias />} />
        </Routes>
        <CartDrawer />
      </div>
      <Footer />
    </>
  );
}

export default App;

/*
function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:8000/hello")
      .then((response) => response.json())
      .then((data) => setMessage(data.message))
      .catch((error) => console.error("Error cargando mensaje.", error));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Monorepo Demo</h1>
        <p>{message ? message : "Cargando mensaje del backend..."}</p>
      </header>
    </div>
  );
}
*/ 


