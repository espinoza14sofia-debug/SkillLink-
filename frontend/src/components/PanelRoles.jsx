import { useEffect, useState } from "react";
import api from "../services/api";

export default function PanelRoles({ equipoId }) {
  const [miembros, setMiembros] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api.get(`/equipos/${equipoId}/miembros`)
      .then(res => setMiembros(res.data))
      .finally(() => setCargando(false));
  }, [equipoId]);

  const cambiarRol = async (usuarioId, nuevoRol) => {
    await api.put(`/equipos/${equipoId}/miembros/${usuarioId}/rol`, { nuevoRol });
    setMiembros(prev =>
      prev.map(m => m.usuarioId === usuarioId ? { ...m, rol: nuevoRol === 1 ? "Lider" : "Colaborador" } : m)
    );
  };

  if (cargando) return <p style={{ color: "var(--eq-text-dim)" }}>Cargando miembros...</p>;

  return (
    <ul className="miembros-lista">
      {miembros.map(m => (
        <li key={m.usuarioId} className="miembro-item">
          <div className="miembro-info">
            <div className="miembro-avatar">{m.nombre.charAt(0).toUpperCase()}</div>
            <span className="miembro-nombre">{m.nombre}</span>
            <span className={`rol-badge ${m.rol.toLowerCase()}`}>{m.rol}</span>
          </div>
          <select onChange={e => cambiarRol(m.usuarioId, Number(e.target.value))} defaultValue="">
            <option value="" disabled>Cambiar</option>
            <option value={0}>Colaborador</option>
            <option value={1}>Líder</option>
          </select>
        </li>
      ))}
    </ul>
  );
}