import React, { useState, useEffect } from 'react';
import './MisPedidos.css';
import api from '../../api/api';
import useAuth from '../../hooks/useAuth';

/**
 * MisPedidos - versión adaptada a Auth0
 *
 * Cambios principales:
 * - Reemplaza useKeycloak por useAuth (Auth0).
 * - Usa `api` (axios instance) para hacer requests; el interceptor de `api`
 *   añade automáticamente Authorization: Bearer <token>.
 * - Obtiene el userId preferentemente desde user.sub; si no está disponible,
 *   intenta extraerlo decodificando el access token mediante authService/getToken.
 * - Si no está autenticado, solicita loginWithRedirect y muestra mensaje.
 */

const MisPedidos = () => {
  const { isAuthenticated, isLoading, user, loginWithRedirect } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Obtener userId preferentemente desde user.sub, si no existe, intentar obtenerlo decodificando token
  const obtenerUserId = async () => {
    if (user && user.sub) return user.sub;
    // Si no hay user.sub (raro), intentar sacar sub del access token mediante api interceptor no expone token,
    // por lo que podrías usar authService.getToken(); pero prefiero fallback null aquí.
    return null;
  };

  useEffect(() => {
    let mounted = true;

    const fetchPedidos = async () => {
      setCargando(true);
      setError(null);
      try {
        if (!isAuthenticated) {
          if (mounted) {
            setPedidos([]);
            setError('Debe iniciar sesión para ver sus pedidos.');
            setCargando(false);
          }
          return;
        }

        const userId = await obtenerUserId();
        if (!userId) {
          if (mounted) {
            setPedidos([]);
            setError('No se pudo determinar el usuario. Volvé a iniciar sesión.');
            setCargando(false);
          }
          return;
        }

        const resp = await api.get(`/pedidos/usuarios/${encodeURIComponent(userId)}`);
        // Suponemos que la API responde con array de pedidos
        if (mounted) {
          setPedidos(resp.data || []);
          setError(null);
        }
      } catch (err) {
        console.error("Error al obtener pedidos:", err);
        if (mounted) {
          if (err.response && err.response.status === 404) {
            setPedidos([]);
            setError('No se encontraron pedidos para este usuario.');
          } else if (err.response && err.response.status === 401) {
            setPedidos([]);
            setError('No autorizado. Por favor iniciá sesión nuevamente.');
          } else {
            setPedidos([]);
            setError(err.message || 'Error al obtener los pedidos.');
          }
        }
      } finally {
        if (mounted) setCargando(false);
      }
    };

    fetchPedidos();

    return () => {
      mounted = false;
    };
  }, [isAuthenticated, user]);

  const handleCancelarPedido = async (pedidoId) => {
    const motivo = prompt("Por favor, ingrese el motivo de la cancelación:");
    if (!motivo) {
      alert("La cancelación fue abortada. Es necesario un motivo.");
      return;
    }

    if (!isAuthenticated) {
      alert("Debe estar autenticado para cancelar un pedido.");
      await loginWithRedirect();
      return;
    }

    const userId = await obtenerUserId();
    if (!userId) {
      alert("No se pudo identificar al usuario. Volvé a iniciar sesión.");
      await loginWithRedirect();
      return;
    }

    try {
      const resp = await api.patch(`/pedidos/${encodeURIComponent(pedidoId)}/cancelar`, {
        idUsuario: userId,
        motivo: motivo
      });

      // Si la API respondió OK, actualizamos estado localmente
      // Dependiendo de la API podría devolver 200 con body, o 204 sin body
      if (resp.status >= 200 && resp.status < 300) {
        alert("Pedido cancelado exitosamente.");
        setPedidos(prevPedidos =>
          prevPedidos.map(pedido =>
            pedido._id === pedidoId ? { ...pedido, estado: 'CANCELADO' } : pedido
          )
        );
      } else {
        const msg = resp.data?.message || 'Error al cancelar el pedido.';
        throw new Error(msg);
      }
    } catch (err) {
      console.error("Error al cancelar pedido:", err);
      const msg = (err.response && err.response.data && err.response.data.message) || err.message || 'Error al cancelar el pedido.';
      setError(msg);
      alert(`Error al procesar la cancelación: ${msg}`);
    }
  };

  if (isLoading || cargando) {
    return <div className="pedidos-container"><h2>Cargando pedidos...</h2></div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="pedidos-container">
        <h2>Mis Pedidos</h2>
        <p className="error-msg">Debes iniciar sesión para ver tus pedidos.</p>
        <button onClick={() => loginWithRedirect()}>Iniciar sesión</button>
      </div>
    );
  }

  if (error && pedidos.length === 0) {
    return <div className="pedidos-container"><h2>Mis Pedidos</h2><p className="error-msg">{error}</p></div>;
  }

  return (
    <div className="pedidos-container">
      <h2>Mis Pedidos</h2>
      {pedidos.length === 0 ? (
        <p>Aún no tienes pedidos registrados.</p>
      ) : (
        <div className="pedidos-lista">
          {pedidos.map((pedido) => {
            const totalCalculado = (pedido.items || []).reduce((acumulador, item) => {
              const precio = (item.precioUnitario ?? item.producto?.precio) ?? 0;
              return acumulador + (precio * (item.cantidad ?? 0));
            }, 0);

            return (
              <div key={pedido._id} className="pedido-card">
                <div className="pedido-header">
                  <h3>Pedido #{pedido._id}</h3>
                  <span className={`pedido-estado ${String(pedido.estado).toLowerCase()}`}>
                    {pedido.estado}
                  </span>
                </div>
                <div className="pedido-body">
                  <p><strong>Fecha:</strong> {pedido.fechaCreacion ? new Date(pedido.fechaCreacion).toLocaleDateString() : '-'}</p>
                  <p><strong>Total:</strong> ${totalCalculado.toFixed(2)} ({pedido.moneda || 'ARS'})</p>
                  <p><strong>Dirección:</strong> {pedido.direccionEntrega?.calle} {pedido.direccionEntrega?.altura}, {pedido.direccionEntrega?.ciudad}</p>
                  <h4>Items:</h4>
                  <ul>
                    {(pedido.items || []).map((item, index) => (
                      <li key={index}>
                        {item.cantidad} x ({item.producto?.titulo ?? 'Producto no disponible'}) - ${((item.precioUnitario ?? item.producto?.precio) ?? 0).toFixed(2)} c/u
                      </li>
                    ))}
                  </ul>

                  <div className="pedido-footer">
                    {/* Solo mostrar el botón si el pedido NO está ya cancelado o entregado */}
                    {pedido.estado !== 'Cancelado' && pedido.estado !== 'Entregado' && (
                      <button
                        className="cancelar-pedido-btn"
                        onClick={() => handleCancelarPedido(pedido._id)}
                      >
                        Cancelar Pedido
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MisPedidos;