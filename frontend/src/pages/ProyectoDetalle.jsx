import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Circle, CheckCircle, AlertCircle, Clock, Target, Users } from "lucide-react";
import { Badge, Button, GlassCard, XPBar } from "../components/ui";
import FormularioCrearMision from "../components/FormularioCrearMision";
import api from "../services/api";

const statusConfig = {
  urgent:       { label: "Urgente",     variant: "error",   icon: AlertCircle, color: "#c97070" },
  in_progress: { label: "En progreso", variant: "accent",  icon: Circle,      color: "#9db5cc" },
  pending:     { label: "Pendiente",    variant: "neutral", icon: Clock,       color: "#415A77" },
  done:        { label: "Completada",  variant: "success", icon: CheckCircle, color: "#6db384" },
};

function normalizar(m) {
  return {
    id: m.id ?? m.Id,
    titulo: m.titulo ?? m.Titulo,
    descripcion: m.descripcion ?? m.Descripcion,
    estado: m.estado ?? m.Estado,
    xpValor: m.xpValor ?? m.XpValor,
    usuarioAsignadoId: m.usuarioAsignadoId ?? m.UsuarioAsignadoId,
    proyectoId: m.proyectoId ?? m.ProyectoId,
    progreso: m.progreso ?? m.Progreso ?? 0,
    esUrgente: m.esUrgente ?? m.EsUrgente ?? false,
    fechaLimite: m.fechaLimite ?? m.FechaLimite ?? null,
  };
}

function calcularGrupo(m) {
  if (m.estado === "completada") return "done";
  if (m.esUrgente) return "urgent";
  if (m.progreso > 0) return "in_progress";
  return "pending";
}

function formatearVencimiento(fechaLimite) {
  if (!fechaLimite) return null;
  const dias = Math.ceil((new Date(fechaLimite) - new Date()) / (1000 * 60 * 60 * 24));
  if (dias < 0) return "Vencida";
  if (dias === 0) return "Hoy";
  if (dias === 1) return "1 día";
  return `${dias} días`;
}

export default function ProyectoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proyecto, setProyecto] = useState(null);
  const [misiones, setMisiones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [usuarioActualId, setUsuarioActualId] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('usuario');
    if (stored) {
      setUsuarioActualId(JSON.parse(stored).id);
    }
  }, []);

  const cargarDatos = async () => {
    try {
      const resProyecto = await api.get(`/proyectos/${id}`);
      const proyectoData = resProyecto.data;
      setProyecto(proyectoData);

      const equipoId = proyectoData.equipoId ?? proyectoData.EquipoId;

      if (equipoId) {
        const resMisiones = await api.get(`/misiones/equipo/${equipoId}`);
        const todas = resMisiones.data.map(normalizar);
        setMisiones(todas.filter((m) => String(m.proyectoId) === String(id)));
      } else {
        const resMisiones = await api.get(`/misiones/todas`);
        const todas = resMisiones.data.map(normalizar);
        setMisiones(todas.filter((m) => String(m.proyectoId) === String(id)));
      }
    } catch (err) {
      setError("No se pudo cargar el proyecto.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAsignar = async (misionId) => {
    try {
      await api.put(`/misiones/${misionId}/asignar`);
      cargarDatos();
    } catch (err) {
      alert(err.response?.data?.mensaje || "No se pudo asignar la misión.");
    }
  };

  const handleIniciar = async (misionId) => {
    try {
      await api.put(`/misiones/${misionId}/progreso`, { progreso: 10 });
      cargarDatos();
    } catch (err) {
      alert(err.response?.data?.mensaje || "No se pudo iniciar la misión.");
    }
  };

  const handleCompletar = async (misionId) => {
    try {
      await api.put(`/misiones/${misionId}/completar`);
      cargarDatos();
    } catch (err) {
      alert(err.response?.data?.mensaje || "No se pudo completar la misión.");
    }
  };

  const handleMisionCreada = () => {
    setShowAdd(false);
    cargarDatos();
  };

  if (cargando) {
    return (
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px" }}>
        <div className="skeleton" style={{ height: 300, borderRadius: 16 }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px" }}>
        <GlassCard style={{ padding: "24px", textAlign: "center", color: "#c97070" }}>{error}</GlassCard>
      </div>
    );
  }

  if (!proyecto) return null;

  const grupos = { urgent: [], in_progress: [], pending: [], done: [] };
  misiones.forEach((m) => grupos[calcularGrupo(m)].push(m));
  const done = grupos.done.length;

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px" }}>
      {/* Back */}
      <button
        onClick={() => navigate("/mi-equipo")}
        style={{
          display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none",
          cursor: "pointer", color: "#778DA9", fontSize: "14px", marginBottom: "24px", padding: 0,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#E0E1DD")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#778DA9")}
      >
        <ArrowLeft size={16} />Mi Equipo
      </button>

      {/* Project card */}
      <GlassCard style={{
        padding: "28px 32px", marginBottom: "24px",
        background: "rgba(65, 90, 119, 0.12)",
        border: "1px solid rgba(65, 90, 119, 0.3)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px", flexWrap: "wrap" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: 700, margin: 0 }}>
            {proyecto.nombre}
          </h1>
          <Badge variant="accent">{proyecto.estado}</Badge>
        </div>
        {proyecto.descripcion && (
          <p style={{ color: "#778DA9", fontSize: "14px", margin: "0 0 20px", lineHeight: 1.6 }}>{proyecto.descripcion}</p>
        )}

        <div style={{ marginBottom: "12px" }}>
          <XPBar
            value={proyecto.porcentajeAvance}
            max={100}
            label={`${proyecto.porcentajeAvance}% completado · ${done}/${misiones.length} misiones`}
            showValues={false}
          />
        </div>

        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          {[
            { icon: Target, label: `${done} misiones completadas` },
            { icon: Users, label: `${misiones.length} misiones en total` },
          ].map(({ icon: Icon, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#778DA9" }}>
              <Icon size={14} />{label}
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Missions list */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 600, margin: 0 }}>
          Misiones del proyecto
        </h2>
        <Button variant="primary" size="sm" onClick={() => setShowAdd(true)} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Plus size={14} />Nueva misión
        </Button>
      </div>

      {misiones.length === 0 && (
        <GlassCard style={{ padding: "40px", textAlign: "center" }}>
          <p style={{ color: "#778DA9", margin: 0, fontSize: "13px" }}>
            Este proyecto todavía no tiene misiones. Creá la primera con "Nueva misión".
          </p>
        </GlassCard>
      )}

      {["urgent", "in_progress", "pending", "done"].map((grupo) => {
        const lista = grupos[grupo];
        if (!lista.length) return null;
        const cfg = statusConfig[grupo];
        return (
          <div key={grupo} style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <cfg.icon size={14} color={cfg.color} />
              <span style={{ fontSize: "13px", fontWeight: 500, color: "#778DA9" }}>{cfg.label} ({lista.length})</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {lista.map((m) => {
                const vencimiento = formatearVencimiento(m.fechaLimite);
                const esMia = String(m.usuarioAsignadoId) === String(usuarioActualId);
                return (
                  <GlassCard key={m.id} className="hover-lift" style={{
                    padding: "14px 18px",
                    opacity: m.estado === "completada" ? 0.7 : 1,
                    display: "flex", alignItems: "center", gap: "14px",
                  }}>
                    <cfg.icon size={16} color={cfg.color} style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{
                        fontWeight: 500, fontSize: "14px",
                        textDecoration: m.estado === "completada" ? "line-through" : "none",
                        color: m.estado === "completada" ? "#778DA9" : "#E0E1DD",
                      }}>{m.titulo}</span>
                      {m.descripcion && (
                        <p style={{ margin: "3px 0 0", fontSize: "12px", color: "#778DA9" }}>{m.descripcion}</p>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                      {vencimiento && (
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#778DA9" }}>
                          <Clock size={12} />{vencimiento}
                        </div>
                      )}
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 600, color: "#9db5cc" }}>
                        +{m.xpValor}
                      </div>

                      {/* Sin asignar: cualquiera puede tomarla */}
                      {!m.usuarioAsignadoId && m.estado !== "completada" && (
                        <Button variant="ghost" size="sm" style={{ padding: "4px 8px", fontSize: "11px" }} onClick={() => handleAsignar(m.id)}>
                          Asignarme
                        </Button>
                      )}
                      {/* Asignada a mí, sin iniciar */}
                      {esMia && m.estado === "pendiente" && m.progreso === 0 && (
                        <Button variant="ghost" size="sm" style={{ padding: "4px 8px", fontSize: "11px" }} onClick={() => handleIniciar(m.id)}>
                          Iniciar
                        </Button>
                      )}
                      {/* Asignada a mí, en progreso */}
                      {esMia && m.estado !== "completada" && m.progreso > 0 && (
                        <Button variant="primary" size="sm" style={{ padding: "4px 8px", fontSize: "11px" }} onClick={() => handleCompletar(m.id)}>
                          Completar
                        </Button>
                      )}
                      {/* Asignada a otra persona */}
                      {m.usuarioAsignadoId && !esMia && m.estado !== "completada" && (
                        <span style={{ fontSize: "11px", color: "#778DA9" }}>Asignada a otro</span>
                      )}
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Add mission modal — usa el formulario completo con etiquetas */}
      {showAdd && (
        <div className="overlay" onClick={() => setShowAdd(false)}>
          <div
            className="glass-float"
            style={{ width: "100%", maxWidth: "480px", padding: "32px", margin: "24px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 600, margin: "0 0 6px" }}>
              Nueva misión
            </h2>
            <p style={{ color: "#778DA9", fontSize: "13px", margin: "0 0 24px" }}>
              Agregá una misión a este proyecto
            </p>
            <FormularioCrearMision
              proyectoId={id}
              onCreada={handleMisionCreada}
              onCancelar={() => setShowAdd(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}