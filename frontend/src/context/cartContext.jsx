import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();
export const useCartContext = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [carrito, setCarrito] = useState([]);

  useEffect(() => {
    const carritoGuardado = localStorage.getItem("carrito");
    if (carritoGuardado) {
      try {
        setCarrito(JSON.parse(carritoGuardado));
      } catch (err) {
        console.error("Error al parsear carrito guardado:", err);
        localStorage.removeItem("carrito");
      }
    }
  }, []);

  //Cada vez que cambia el carrito se guarda en localStorage
  useEffect(() => {
    localStorage.setItem("carrito", JSON.stringify(carrito));
  }, [carrito]);

  const mostrarCarrito = () => setOpen(true);
  const esconderCarrito = () => setOpen(false);

const limpiarCarrito = (borrarStorage = true) => {
  setCarrito([]);
  if (borrarStorage) localStorage.removeItem("carrito");
};
  const removerProducto = (producto) => {
    setCarrito(prev => prev.filter(p => p._id !== producto._id));
  };

const agregarProductoConCantidad = (producto, cantidad) => {
  setCarrito(prev => {
    const existe = prev.find(p => p._id === producto._id);

    if (existe) {
      return prev.map(p => {
        if (p._id === producto._id) {
          const nuevaCantidad = p.cantidad + cantidad;

          // Evita ir debajo de 1
          if (nuevaCantidad < 1) {
            return { ...p, cantidad: 1 };
          }

          // Evita superar el stock
          if (nuevaCantidad > producto.stock) {
            alert(`Solo hay ${producto.stock} unidades disponibles de ${producto.titulo}`);
            return { ...p, cantidad: producto.stock };
          }

          return { ...p, cantidad: nuevaCantidad };
        }
        return p;
      });
    }

    // Si el producto entra por primera vez, arranca con 1
    return [...prev, { ...producto, cantidad: 1 }];
  });
};

  const actualizarCantidad = (idProducto, nuevaCantidad) => {
    setCarrito(prev =>
      prev.map(p => {
        if (p._id === idProducto) {
          if (nuevaCantidad < 1) nuevaCantidad = 1;
          if (nuevaCantidad > p.stock) nuevaCantidad = p.stock;
          return { ...p, cantidad: nuevaCantidad };
        }
        return p;
      })
    );
  };


  return (
    <CartContext.Provider value={{
      open,
      carrito,
      mostrarCarrito,
      esconderCarrito,
      agregarProductoConCantidad,
      removerProducto,
      limpiarCarrito,
      actualizarCantidad
    }}>
      {children}
    </CartContext.Provider>
  );
};
