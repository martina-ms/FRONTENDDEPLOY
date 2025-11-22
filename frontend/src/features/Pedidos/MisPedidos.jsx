import React, { useState, useEffect } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import './MisPedidos.css'; 

const MisPedidos = () => {
  const { keycloak, initialized } = useKeycloak();
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
 
  useEffect(() => {
   
    if (initialized && keycloak.authenticated) {
      const fetchPedidos = async () => {
        try {
          
          const userId = keycloak.subject; 
          
          
          const response = await fetch(`http://localhost:3000/pedidos/usuarios/${userId}`, {
            headers: {
              'Authorization': `Bearer ${keycloak.token}` // Enviar el token
            }
          });

          if (response.status === 404) {
        
            setError('No se encontraron pedidos para este usuario.');
            setPedidos([]);
          } else if (!response.ok) {
            throw new Error('Error al obtener los pedidos.');
          } else {
            const data = await response.json();
            setPedidos(data); 
          }
        } catch (err) {
          setError(err.message);
        } finally {
          setCargando(false);
        }
      };

      fetchPedidos();
    } else if (initialized && !keycloak.authenticated) {
    
      setCargando(false);
      setError('Debe iniciar sesión para ver sus pedidos.');
    }
    
  }, [keycloak, initialized]);

  const handleCancelarPedido = async (pedidoId) => {

    const motivo = prompt("Por favor, ingrese el motivo de la cancelación:");

 
    if (!motivo) {
      alert("La cancelación fue abortada. Es necesario un motivo.");
      return; 
    }


    if (!initialized || !keycloak.authenticated) {
      alert("Debe estar autenticado para cancelar un pedido.");
      return;
    }

   
    const userId = keycloak.subject;
    const token = keycloak.token;

    try {
    
      const response = await fetch(`http://localhost:3000/pedidos/${pedidoId}/cancelar`, {
        method: 'PATCH', 
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          idUsuario: userId,
          motivo: motivo
        })
      });

   
      if (response.ok) {
        alert("Pedido cancelado exitosamente.");
        
      
        setPedidos(prevPedidos =>
          prevPedidos.map(pedido =>
            pedido._id === pedidoId ? { ...pedido, estado: 'CANCELADO' } : pedido
          )
        );
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cancelar el pedido.');
      }
    } catch (err) {
    
      setError(err.message);
      alert(`Error al procesar la cancelación: ${err.message}`);
    }
  };

  if (!initialized || cargando) {
    return <div className="pedidos-container"><h2>Cargando pedidos...</h2></div>;
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

            const totalCalculado = pedido.items.reduce((acumulador, item) => {
                const precio = item.precioUnitario ?? item.producto?.precio ?? 0;
                return acumulador + (precio * (item.cantidad ?? 0));
            }, 0);
            
            return(
            <div key={pedido._id} className="pedido-card">
              <div className="pedido-header">
                <h3>Pedido #{pedido._id}</h3>
                <span className={`pedido-estado ${String(pedido.estado).toLowerCase()}`}>
                  {pedido.estado}
                </span>
              </div>
              <div className="pedido-body">
                <p><strong>Fecha:</strong> {new Date(pedido.fechaCreacion).toLocaleDateString()}</p>
              <p><strong>Total:</strong> ${totalCalculado.toFixed(2)} ({pedido.moneda})</p>
                <p><strong>Dirección:</strong> {pedido.direccionEntrega.calle} {pedido.direccionEntrega.altura}, {pedido.direccionEntrega.ciudad}</p>
                <h4>Items:</h4>
                <ul>
                  {pedido.items.map((item, index) => (
                  <li key={index}>
                     {item.cantidad} x ({item.producto?.titulo ?? 'Producto no disponible'}) - ${ (item.precioUnitario ?? item.producto?.precio)?.toFixed(2) ?? '0.00' } c/u
                    </li>
                  ))}
                </ul>

                <div className="pedido-footer">
                    {/* Solo mostrar el botón si el pedido NO está ya cancelado o entregado */}
                    {pedido.estado !== 'CANCELADO' && pedido.estado !== 'ENTREGADO' && (
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