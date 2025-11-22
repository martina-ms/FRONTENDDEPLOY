import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Gracias() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate("/"); // vuelve al inicio
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "80px" }}>
      <h1>¡Gracias por tu compra! 🛍️</h1>
      <p>Tu pedido está siendo procesado. ¡Esperamos que lo disfrutes!</p>
      <p>Volviendo al inicio en {countdown}...</p>
      <Link to="/" style={{ marginTop: 20, display: "inline-block" }}>
        Volver al inicio ahora
      </Link>
    </div>
  );
}

