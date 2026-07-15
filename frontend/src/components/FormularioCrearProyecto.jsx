import { useState } from "react";
import api from "../services/api";

export default function FormularioCrearProyecto({ equipoId, onCreado }) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/proyectos", { nombre, descripcion, equipoId });
      onCreado?.(res.data);
    } catch {
      setError("No se pudo crear el proyecto.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="equipo-form">
      <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre del proyecto" required />
      <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Descripción" />
      <button type="submit">Crear proyecto</button>
      {error && <p className="error-text">{error}</p>}
    </form>
  );
}