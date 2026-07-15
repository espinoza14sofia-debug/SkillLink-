import { useState } from "react";
import api from "../services/api";

export default function FormularioCrearEquipo({ onCreado }) {
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/equipos", { nombre });
      onCreado?.(res.data.id);
    } catch {
      setError("No se pudo crear el equipo.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="equipo-form">
      <input
        value={nombre}
        onChange={e => setNombre(e.target.value)}
        placeholder="Nombre del equipo"
        required
      />
      <button type="submit">Crear equipo</button>
      {error && <p className="error-text">{error}</p>}
    </form>
  );
}