import CategoryCard from "../../components/categoryCard/CategoryCard";
import ProductoCarousel from "../../components/productosCarousel/ProductosCarousel";
import { useEffect, useState } from "react";
import React from "react";
import { getTopProductos } from "../../api/api";
import "./Home.css";
import { useNavigate } from "react-router-dom";

const categories = [
  { name: "Ropa de Mujer", img: "https://st3.depositphotos.com/1177973/17797/i/450/depositphotos_177972146-stock-photo-female-clothes-on-hangers-in.jpg" },
  { name: "Ropa de Hombre", img: "https://img.freepik.com/premium-photo/row-men-s-shirts-blue-colors-hanger_157912-617.jpg" },
  { name: "Ropa Unisex", img: "https://t4.ftcdn.net/jpg/10/32/78/75/360_F_1032787590_vC9QsBFGvJQPnmJYIQnsKitUl75f95oB.jpg" },
  { name: "Ropa de Niños", img: "https://img.freepik.com/fotos-premium/ropa-ninos-perchero-sobre-fondo-claro_441923-10886.jpg" },
];

const prendas = [
  "Pantalon",
  "Remera",
  "Buzo",
  "Campera",
  "Top",
  "Vestido",
  "Falda",
];

const Home = () => {
  const [topProductos, setTopProductos] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
  const [prendaSeleccionada, setPrendaSeleccionada] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const cargarTop = async () => {
      const top = await getTopProductos();
      setTopProductos(top);
    };
    cargarTop();
  }, []);

  const handleBuscar = () => {
    const params = new URLSearchParams(); //URL de búsqueda dinámica

    if (categoriaSeleccionada) params.append("categoria", categoriaSeleccionada);
    if (prendaSeleccionada) params.append("nombre", prendaSeleccionada);

    navigate(`/productos?${params.toString()}`);     // Redirigimos a la página de productos con los filtros aplicados
  };

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-text">
          <h1>Bienvenido a Tienda Sol</h1>
          <p>Descubrí las mejores ofertas en productos de todas las categorías</p>

          <div className="hero-search">
            <select
              value={categoriaSeleccionada}
              onChange={(e) => setCategoriaSeleccionada(e.target.value)}
            >
              <option value="">Categorías</option>
              {categories.map((c) => (
                <option key={c.name}>{c.name}</option>
              ))}
            </select>

            <select
              value={prendaSeleccionada}
              onChange={(e) => setPrendaSeleccionada(e.target.value)}
            >
              <option value="">Seleccionar prenda</option>
              {prendas.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>

            <button className="hero-search-btn" onClick={handleBuscar}>Buscar</button>
          </div>
        </div>

        <div className="hero-image">
          <img src="/tiendaSol.png" alt="Banner principal" />
        </div>
      </section>

      <section className="categories">
        <h2>Categorías</h2>
        <div className="category-grid">
          {categories.map((c) => (
            <CategoryCard
              key={c.name}
              name={c.name}
              img={c.img}
              onClick={() =>
                navigate(`/productos?categoria=${encodeURIComponent(c.name)}`)
              }
            />
          ))}
        </div>
      </section>

      <section className="categories">
        <h2>Productos más vendidos</h2>
        <ProductoCarousel productos={topProductos} />
      </section>
    </div>
  );
};


export default Home;
