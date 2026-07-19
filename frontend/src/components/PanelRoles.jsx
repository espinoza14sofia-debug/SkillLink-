import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import ChatPrivado from "./ChatPrivado";

export default function PanelRoles({ equipoId }) {
  const { user } = useAuth();
  const [miembros, setMiembros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [chatCon, setChatCon] = useState(null);

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

  const yoSoyLider = miembros.some(m => m.usuarioId === user?.id && m.rol === "Lider");

  return (
    <>
      <ul className="miembros-lista">
        {miembros.map(m => (
          <li key={m.usuarioId} className="miembro-item">
            <div className="miembro-info">
              <div className="miembro-avatar">{m.nombre.charAt(0).toUpperCase()}</div>
              <span className="miembro-nombre">{m.nombre}</span>
              <span className={`rol-badge ${m.rol.toLowerCase()}`}>{m.rol}</span>
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              {m.usuarioId !== user?.id && (
                <button
                  type="button"
                  onClick={() => setChatCon(m)}
                  title="Enviar mensaje privado"
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px" }}
                >
                  💬
                </button>
              )}
              {yoSoyLider && (
                <select onChange={e => cambiarRol(m.usuarioId, Number(e.target.value))} defaultValue="">
                  <option value="" disabled>Cambiar</option>
                  <option value={0}>Colaborador</option>
                  <option value={1}>Líder</option>
                </select>
              )}
            </div>
          </li>
        ))}
      </ul>

      {chatCon && (
        <ChatPrivado
          otroUsuarioId={chatCon.usuarioId}
          otroUsuarioNombre={chatCon.nombre}
          onCerrar={() => setChatCon(null)}
        />
      )}
    </>
  );
}