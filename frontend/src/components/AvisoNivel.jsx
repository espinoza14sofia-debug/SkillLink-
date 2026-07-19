import { useEffect, useState } from "react";
import "./AvisoNivel.css";

export default function AvisoNivel() {
  const [nivel, setNivel] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      setNivel(e.detail.nivel);
      setTimeout(() => setNivel(null), 4000);
    };
    window.addEventListener("subioDeNivel", handler);
    return () => window.removeEventListener("subioDeNivel", handler);
  }, []);

  if (!nivel) return null;

  return (
    <div className="aviso-nivel-overlay">
      <div className="aviso-nivel-card">
        <span className="aviso-nivel-titulo">¡Subiste de nivel!</span>
        <span className="aviso-nivel-numero">Nivel {nivel}</span>
      </div>
    </div>
  );
}