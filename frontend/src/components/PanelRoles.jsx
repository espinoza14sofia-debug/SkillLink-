import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import ChatPrivado from "./ChatPrivado";

export default function PanelRoles({ equipoId }) {
  const { user } = useAuth();
  const [miembros, setMiembros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [chatCon, setChatCon] = useState(null);
  const [mensajeExito, setMensajeExito] = useState(null);

  useEffect(() => {
    api.get(`/equipos/${equipoId}/miembros`)
      .then(res => setMiembros(res.data))
      .finally(() => setCargando(false));
  }, [equipoId]);

  const cambiarRol = async (usuarioId, nuevoRol, nombreMiembro) => {
    try {
      await api.put(`/equipos/${equipoId}/miembros/${usuarioId}/rol`, { nuevoRol });
      
      // Actualizar estado local
      setMiembros(prev =>
        prev.map(m => m.usuarioId === usuarioId ? { ...m, rol: nuevoRol === 1 ? "Lider" : "Colaborador" } : m)
      );

      // Confirmación visual
      const textoRol = nuevoRol === 1 ? "Líder" : "Colaborador";
      setMensajeExito(`¡Rol de ${nombreMiembro} actualizado a ${textoRol} con éxito!`);
      setTimeout(() => setMensajeExito(null), 4000); // Se oculta tras 4 segundos
    } catch (err) {
      alert("No se pudo cambiar el rol. Asegúrate de tener permisos de líder.");
    }
  };

  if (cargando) return <p style={{ color: "var(--eq-text-dim)" }}>Cargando miembros...</p>;

  const yoSoyLider = miembros.some(m => m.usuarioId === user?.id && m.rol === "Lider");

  return (
    <>
      {/* Alerta de confirmación de actualización */}
      {mensajeExito && (
        <div style={{
          background: "rgba(74, 222, 128, 0.1)",
          border: "1px solid #4ade80",
          color: "#4ade80",
          padding: "10px 14px",
          borderRadius: "8px",
          fontSize: "13px",
          marginBottom: "12px",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <span>✅</span> {mensajeExito}
        </div>
      )}

      <ul className="miembros-lista">
        {miembros.map(m => (
          <li key={m.usuarioId} className="miembro-item" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="miembro-info" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div className="miembro-avatar" style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#415A77", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "#fff" }}>
                {m.nombre.charAt(0).toUpperCase()}
              </div>
              <span className="miembro-nombre" style={{ color: "#E0E1DD", fontWeight: 500 }}>{m.nombre}</span>
              <span className={`rol-badge ${m.rol.toLowerCase()}`} style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "4px", background: m.rol === "Lider" ? "rgba(196, 154, 63, 0.2)" : "rgba(119, 141, 169, 0.2)", color: m.rol === "Lider" ? "#c49a3f" : "#778DA9" }}>
                {m.rol}
              </span>
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
                <select 
                  onChange={e => cambiarRol(m.usuarioId, Number(e.target.value), m.nombre)} 
                  defaultValue=""
                  style={{
                    background: 'rgba(224,225,221,0.06)',
                    border: '1px solid rgba(224,225,221,0.15)',
                    borderRadius: '8px',
                    color: '#E0E1DD',
                    fontSize: '11px',
                    padding: '4px 8px',
                  }}
                >
                  <option value="" disabled>Cambiar rol...</option>
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