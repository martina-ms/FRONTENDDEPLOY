import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

/**
 * ProtectedRoute mejorado:
 * - No ejecuta loginWithRedirect en el render: lo hace dentro de useEffect.
 * - Añade logs temporales para depuración.
 * - Si no está autenticado redirige al flujo de login de forma controlada.
 *
 * Uso:
 * <Route path="/private" element={<ProtectedRoute><PrivatePage/></ProtectedRoute>} />
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();

  useEffect(() => {
    // Logging temporal para depuración
    console.log("[PROTECTED] isLoading:", isLoading, "isAuthenticated:", isAuthenticated);

    // Solo intentar login cuando hayamos terminado de cargar el estado auth
    if (!isLoading && !isAuthenticated) {
      // Ejecutar side-effect de login sólo una vez, cuando corresponda
      loginWithRedirect().catch(err => {
        // Loguear error en loginWithRedirect si ocurre
        console.error("[PROTECTED] loginWithRedirect error:", err);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isAuthenticated, loginWithRedirect]);

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  // Mientras no haya isLoading, si no está autenticado habremos
  // disparado loginWithRedirect en el effect y podemos mostrar null.
  // Alternativa: podrías mostrar un mensaje o <Navigate to="/login" />.
  if (!isAuthenticated) {
    return null;
  }
//
  return children;
}