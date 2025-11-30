import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { CartProvider } from "./context/cartContext";
import Auth0ProviderWithHistory from "./auth/Auth0ProviderWithHistory";

import { BrowserRouter } from "react-router-dom";


console.log("ENV FRONT - REACT_APP_AUTH0_DOMAIN:", process.env.REACT_APP_AUTH0_DOMAIN);
console.log("ENV FRONT - REACT_APP_AUTH0_CLIENT_ID:", process.env.REACT_APP_AUTH0_CLIENT_ID);
console.log("ENV FRONT - REACT_APP_AUTH0_AUDIENCE:", process.env.REACT_APP_AUTH0_AUDIENCE);
console.log("ENV FRONT - REACT_APP_AUTH0_REDIRECT_URI:", process.env.REACT_APP_AUTH0_REDIRECT_URI || window.location.origin);

// ... el resto de index.js sigue igual

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Auth0ProviderWithHistory>
        <CartProvider>
          <App />
        </CartProvider>
      </Auth0ProviderWithHistory>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
