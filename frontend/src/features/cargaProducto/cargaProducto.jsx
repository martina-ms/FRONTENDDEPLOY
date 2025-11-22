import { React, useState, useEffect } from "react";
import "./cargaProducto.css";
import axios from "axios";
import { crearProducto } from "../../api/api";
import { useNavigate } from "react-router-dom";
import { useKeycloak } from "@react-keycloak/web";

const CargaProducto = () => {
const navigate = useNavigate();
const { keycloak, initialized } = useKeycloak();

const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    categoria: "",
    precio: "",
    moneda: "",
    stock: "",
    fotos: [],
  });

  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);

useEffect(() => {
    if (initialized && !keycloak.authenticated) {
      alert("Debes iniciar sesión para cargar un producto.");
      keycloak.login();
    }
    // Opcional: si quieres verificar que sea VENDEDOR
    // if (initialized && !keycloak.hasRealmRole('vendedor')) {
    //   alert("No tienes permisos para cargar productos.");
    //   navigate("/");
    // }
  }, [keycloak, initialized, navigate]);

useEffect(() => {
    // limpiar objectURLs al desmontar / cuando previews cambien
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const categoriasDisponibles = [
    "Ropa de Mujer",
    "Ropa de Hombre",
    "Ropa Unisex",
    "Ropa de Niños",
  ];

  const monedasDisponibles = ["Peso_arg", "Dolar_usa", "Real"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFotosChange = (e) => {
    const files = Array.from(e.target.files|| []);
    //const nombres = files.map((f) => f.name);
    setFormData((prev) => ({ ...prev, fotos: files }));


    // limpiar previos si existen
    previews.forEach((url) => URL.revokeObjectURL(url));
    const objectUrls = files.map((f) => URL.createObjectURL(f));
    setPreviews(objectUrls);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("titulo", formData.titulo);
      fd.append("descripcion", formData.descripcion);
      // enviamos categoria como array (backend debe manejarlo)
      fd.append("categorias[]", formData.categoria);
      fd.append("precio", String(formData.precio));
      fd.append("moneda", formData.moneda);
      fd.append("stock", String(formData.stock));

      // adjuntar archivos con la misma key 'fotos' (backend con multer array('fotos') lo recibirá)
      formData.fotos.forEach((file) => {
        fd.append("fotos", file);
      });

    
      const headers = {};
      if (keycloak?.token) {
        headers.Authorization = `Bearer ${keycloak.token}`;
      }

      crearProducto(fd);
      /* const url = `${API_BASE}/api/productos`; 
      const resp = await axios.post(url, fd, { headers }); */

      // sreemplazar la llamada axios por crearProducto(fd)
      //console.log("Producto creado:", resp.data);
      alert("Producto cargado con éxito");

      // limpiar form y previews
      setFormData({
        titulo: "",
        descripcion: "",
        categoria: "",
        precio: "",
        moneda: "",
        stock: "",
        fotos: [],
      });
      previews.forEach((url) => URL.revokeObjectURL(url));
      setPreviews([]);

      // redirigir
      setTimeout(() => navigate("/"), 500);

      /* 
      // Llamamos al backend
      const nuevoProducto = await crearProducto({
       
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        categorias: [formData.categoria], // array!
        precio: Number(formData.precio),
        moneda: formData.moneda,
        stock: Number(formData.stock),
        fotos: formData.fotos,
      });

      alert("Producto cargado con éxito");
      console.log("Producto guardado:", nuevoProducto);

      setTimeout(() => navigate("/")); */
    } catch (error) {
      alert("Error al cargar el producto, revisá la consola");
      console.error("Error al crear producto:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };
if (!initialized) {
    return <div>Cargando...</div>;
  }
  return (
    <div className="form-page">
      <form className="form-producto" onSubmit={handleSubmit} encType="multipart/form-data">
        <h2>Cargar nuevo producto</h2>

  
        <label>
          Título
          <input
            type="text"
            name="titulo"
            placeholder="Ej: Zapatillas deportivas"
            value={formData.titulo}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Descripción
          <textarea
            name="descripcion"
            placeholder="Descripción del producto"
            value={formData.descripcion}
            onChange={handleChange}
          />
        </label>

        <label>
          Categoría
          <select
            name="categoria"
            value={formData.categoria}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione una categoría</option>
            {categoriasDisponibles.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </label>

        <label>
          Precio
          <input
            type="number"
            name="precio"
            min="0"
            placeholder="Ej: 45000"
            value={formData.precio}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Moneda
          <select
            name="moneda"
            value={formData.moneda}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione una moneda</option>
            {monedasDisponibles.map((m) => (
              <option key={m} value={m}>
                {m === "Peso_arg"
                  ? "Peso Argentino"
                  : m === "Dolar_usa"
                  ? "Dólar USA"
                  : "Real"}
              </option>
            ))}
          </select>
        </label>

        <label>
          Stock
          <input
            type="number"
            name="stock"
            min="0"
            placeholder="Cantidad disponible"
            value={formData.stock}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Fotos
          <input
            type="file"
            name="fotos"
            multiple
            accept="image/*"
            onChange={handleFotosChange}
          /> 
          {formData.fotos.length > 0 && (
            <p className="archivo-subido">
              {formData.fotos.length} archivo(s) seleccionado(s)
            </p>
          )}
        </label>
          {previews.length > 0 && (
          <div className="previews" style={{ display: "flex", gap: 8, marginTop: 8 }}>
            {previews.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`preview-${i}`}
                style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 6 }}
              />
            ))}
          </div>
        )}
        <button type="submit" className="btn-enviar" disabled={loading}>
        {loading ? "Subiendo..." : "Cargar producto"}
        </button>
      </form>
    </div>
  );
};

export default CargaProducto;