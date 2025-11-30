import React, { useEffect } from "react";
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { setTokenGetter, clearTokenGetter } from "./authService";

/**
 * Auth0ProviderWithHistory: Provider para Auth0 que registra un token getter
 * en authService para que los módulos fuera de React (ej: axios) puedan
 * solicitar access tokens.
 */
const Auth0Initializer = () => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const audience = process.env.REACT_APP_AUTH0_AUDIENCE;

  useEffect(() => {
    setTokenGetter(async () => {
      if (!isAuthenticated) return null;
      return await getAccessTokenSilently({
        authorizationParams: {
          audience: audience,
        },
      });
    });

    return () => {
      clearTokenGetter();
    };
  }, [getAccessTokenSilently, isAuthenticated, audience]);

  return null;
};

const Auth0ProviderWithHistory = ({ children }) => {
  const navigate = useNavigate();

  const domain = process.env.REACT_APP_AUTH0_DOMAIN;
  const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID;
  const audience = process.env.REACT_APP_AUTH0_AUDIENCE;
  const redirectUri = process.env.REACT_APP_AUTH0_REDIRECT_URI || window.location.origin;

  const onRedirectCallback = (appState) => {
    navigate(appState?.returnTo || window.location.pathname);
  };

  // Nota de seguridad: cacheLocation: "localstorage" persiste tokens entre reloads pero aumenta riesgo
  // frente a XSS. Usá useRefreshTokens + Rotate Refresh Tokens en Auth0 para mejor seguridad.
  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
        audience,
        scope: "openid profile email",
      }}
      onRedirectCallback={onRedirectCallback}
      useRefreshTokens={true}
      cacheLocation="localstorage"
    >
      <Auth0Initializer />
      {children}
    </Auth0Provider>
  );
};

export default Auth0ProviderWithHistory;