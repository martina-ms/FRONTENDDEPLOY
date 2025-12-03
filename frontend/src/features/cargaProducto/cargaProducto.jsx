import React, { useState, useEffect } from "react";
import "./cargaProducto.css";
import { crearProducto } from "../../service/productoService";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { getToken } from "../../auth/authService"; // si getToken usa getAccessTokenSilently, ok

const CargaProducto = () => {
  const navigate = useNavigate();
  // Usamos useAuth0 directamente para evitar inconsistencias con useAuth personalizado
  const { isAuthenticated, isLoading, loginWithRedirect, getAccessTokenSilently } = useAuth0();

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

  // DEBUG: ver estado de auth en consola
  useEffect(() => {
    console.log("[CARGA] auth state - isLoading:", isLoading, "isAuthenticated:", isAuthenticated);
  }, [isLoading, isAuthenticated]);

  // Protegemos: si ya inicializó y no está autenticado, redirigimos al login
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // lanzar login sólo cuando SDK ya terminó de inicializar
      loginWithRedirect().catch(err => console.error("[CARGA] loginWithRedirect error:", err));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isAuthenticated]);

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
    const files = Array.from(e.target.files || []);
    setFormData((prev) => ({ ...prev, fotos: files }));

    // limpiar previos si existen
    previews.forEach((url) => URL.revokeObjectURL(url));
    const objectUrls = files.map((f) => URL.createObjectURL(f));
    setPreviews(objectUrls);
  };

  const usuarioTieneRol = (rolesArray, rolBuscado) => {
    if (!Array.isArray(rolesArray)) return false;
    return rolesArray.map(r => String(r).toLowerCase()).includes(String(rolBuscado).toLowerCase());
  };

  const obtenerRolesDesdeToken = async () => {
    try {
      // Preferimos usar getAccessTokenSilently del SDK para forzar ignoreCache
      const token = await (getAccessTokenSilently
        ? getAccessTokenSilently({ authorizationParams: { audience: process.env.REACT_APP_AUTH0_AUDIENCE }, ignoreCache: true })
        : getToken({ ignoreCache: true }));
      if (!token) return [];
      const payload = JSON.parse(atob(token.split(".")[1]));
      const rolesNamespace = process.env.REACT_APP_AUTH0_ROLES_NAMESPACE || "https://tienda.example.com/roles";
      const roles = payload[rolesNamespace] || payload.roles || (payload.realm_access && payload.realm_access.roles) || [];
      return Array.isArray(roles) ? roles : [];
    } catch (e) {
      console.warn("No se pudieron obtener roles desde token", e);
      return [];
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
    if (!isAuthenticated) {
      await loginWithRedirect();
      return;
    }

    // Obtener token fresco y forzado antes de enviar (ignoreCache)
    let token = null;
    try {
      token = await getAccessTokenSilently({
        authorizationParams: { audience: process.env.REACT_APP_AUTH0_AUDIENCE },
        ignoreCache: true,
      });
      console.log("[CARGA] token obtenido (len):", token ? token.length : 0);
    } catch (tkErr) {
      console.error("[CARGA] error al obtener token:", tkErr);
      // Si falló obtener token, forzamos login
      await loginWithRedirect();
      return;
    }

    // Validar rol a partir del token (si quieres)
    const roles = await obtenerRolesDesdeTokenConToken(token); // ver helper abajo
    const permitido = usuarioTieneRol(roles, "vendedor") || usuarioTieneRol(roles, "administrador");
    if (!permitido) {
      alert("No tenés permisos para cargar productos. Contactá al administrador.");
      setLoading(false);
      return;
    }

      const fd = new FormData();
      fd.append("titulo", formData.titulo);
      fd.append("descripcion", formData.descripcion);
      fd.append("categorias[]", formData.categoria);
      fd.append("precio", String(formData.precio));
      fd.append("moneda", formData.moneda);
      fd.append("stock", String(formData.stock));

      formData.fotos.forEach((file) => {
        fd.append("fotos", file);
      });

      const nuevo = await crearProducto(fd, token);

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

      setTimeout(() => navigate("/"), 500);
    } catch (error) {
    console.error("Error al crear producto:", error?.response?.data || error.message || error);
    if (error?.response?.status === 401) {
      alert("Sesión expirada o no autorizada. Volvé a iniciar sesión.");
      await loginWithRedirect();
      return;
    }
    alert("Error al cargar el producto, revisá la consola");
  } finally {
    setLoading(false);
  }
};

// helper para decodificar roles desde token que ya tenemos
const obtenerRolesDesdeTokenConToken = async (token) => {
  if (!token) return [];
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const rolesNamespace = process.env.REACT_APP_AUTH0_ROLES_NAMESPACE || "https://tienda.example.com/roles";
    const roles = payload[rolesNamespace] || payload.roles || (payload.realm_access && payload.realm_access.roles) || [];
    return Array.isArray(roles) ? roles : [];
  } catch (e) {
    console.warn("obtenerRolesDesdeTokenConToken error", e);
    return [];
  }
};

  // Mientras Auth0 inicializa, mostrar carga del SDK
  if (isLoading) return <div>Cargando...</div>;

  // Si no autenticado (loginWithRedirect fue disparado), no renderizamos el form
  if (!isAuthenticated) return null;

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
            disabled={loading}
          />
        </label>

        <label>
          Descripción
          <textarea
            name="descripcion"
            placeholder="Descripción del producto"
            value={formData.descripcion}
            onChange={handleChange}
            disabled={loading}
          />
        </label>

        <label>
          Categoría
          <select
            name="categoria"
            value={formData.categoria}
            onChange={handleChange}
            required
            disabled={loading}
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
            disabled={loading}
          />
        </label>

        <label>
          Moneda
          <select
            name="moneda"
            value={formData.moneda}
            onChange={handleChange}
            required
            disabled={loading}
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
            disabled={loading}
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
            disabled={loading}
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