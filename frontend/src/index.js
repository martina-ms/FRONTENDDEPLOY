import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { ReactKeycloakProvider } from '@react-keycloak/web';
import keycloak from './keycloak';
import { CartProvider } from "./context/cartContext";
import CircularProgress from "@mui/material/CircularProgress"; // 👈 importa el loader

const root = ReactDOM.createRoot(document.getElementById("root"));


const onKeycloakEvent = (event, error) => {
  if (event === 'onAuthSuccess') {
    console.log('Usuario autenticado');
  }
  if (event === 'onAuthError') {
    console.error('Error de autenticación', error);
  }
};

//loader
const LoaderAutenticacion = () => (
  <div className="auth-loader">
    <CircularProgress size={60} color="primary" />
    <p>Iniciando sesión...</p>
  </div>
);

root.render(
  <React.StrictMode>
    <ReactKeycloakProvider
      authClient={keycloak}
      initOptions={{ onLoad: 'check-sso' }}
      onEvent={onKeycloakEvent}
      LoadingComponent={<LoaderAutenticacion />}
    >
      <CartProvider>   
        <App />
      </CartProvider>
    </ReactKeycloakProvider>
  </React.StrictMode>
);



reportWebVitals();
