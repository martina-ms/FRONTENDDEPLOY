import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

/**
 * Uso con React Router v6:
 * <Route path="/private" element={<ProtectedRoute><PrivatePage/></ProtectedRoute>} />
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();

  if (isLoading) return <div>Cargando...</div>;

  if (!isAuthenticated) {
    // Forzamos redirect al login de Auth0
    loginWithRedirect();
    return null;
    // Alternativa: return <Navigate to="/login" replace /> y manejar /login
  }

  return children;
}