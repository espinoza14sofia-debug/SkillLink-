import { useState, useEffect } from "react";
import { Target, Zap, Calendar, X, User } from "lucide-react";
import { Input, Button } from "./ui";
import api from "../services/api";

const ETIQUETAS_SUGERIDAS = [
  "Frontend", "Backend", "UX", "React", ".NET", "SQL",
  "Testing", "DevOps", "Diseño", "Análisis", "API", "Docs",
];

export default function FormularioCrearMision({ proyectoId, equipoId, onCreada, onCancelar }) {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [xpValor, setXpValor] = useState(50);
  const [fechaLimite, setFechaLimite] = useState("");
  const [esUrgente, setEsUrgente] = useState(false);
  const [etiquetas, setEtiquetas] = useState([]);
  const [etiquetaLibre, setEtiquetaLibre] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const [miembros, setMiembros] = useState([]);
  const [usuarioAsignadoId, setUsuarioAsignadoId] = useState("");
  const [cargandoMiembros, setCargandoMiembros] = useState(false);

  useEffect(() => {
    if (!equipoId) return;

    const cargarMiembros = async () => {
      setCargandoMiembros(true);
      try {
        const { data } = await api.get(`/equipos/${equipoId}/miembros`);
        setMiembros(data);
      } catch (err) {
        setMiembros([]);
      } finally {
        setCargandoMiembros(false);
      }
    };

    cargarMiembros();
  }, [equipoId]);

  const agregarEtiqueta = (tag) => {
    const limpio = tag.trim();
    if (!limpio || etiquetas.includes(limpio)) return;
    setEtiquetas((prev) => [...prev, limpio]);
  };

  const quitarEtiqueta = (tag) => {
    setEtiquetas((prev) => prev.filter((t) => t !== tag));
  };

  const handleAgregarLibre = (e) => {
    e.preventDefault();
    agregarEtiqueta(etiquetaLibre);
    setEtiquetaLibre("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!titulo.trim()) {
      setError("El título es obligatorio.");
      return;
    }

    setCargando(true);
    try {
      const { data } = await api.post("/misiones", {
        titulo,
        descripcion,
        xpValor: Number(xpValor),
        proyectoId: proyectoId || null,
        equipoId: equipoId || null,
        fechaLimite: fechaLimite ? new Date(fechaLimite).toISOString() : null,
        etiquetas: etiquetas.join(","),
        esUrgente,
        usuarioAsignadoId: usuarioAsignadoId || null,
      });
      onCreada?.(data);
    } catch (err) {
      setError(err.response?.data?.mensaje || "No se pudo crear la misión.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <Input
        label="Título de la misión"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        placeholder="Optimizar consultas de usuarios"
        icon={<Target size={15} />}
        required
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label style={{ fontSize: "13px", fontWeight: 500, color: "#778DA9" }}>Descripción</label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder=" Mejorar repositorios y consultas usando Entity Framework."
          rows={3}
          style={{
            width: "100%",
            background: "rgba(224, 225, 221, 0.06)",
            border: "1px solid rgba(224, 225, 221, 0.15)",
            borderRadius: "12px",
            padding: "12px 14px",
            color: "#E0E1DD",
            fontSize: "14px",
            outline: "none",
            fontFamily: "var(--font-body)",
            resize: "vertical",
          }}
        />
      </div>

      {equipoId && (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "13px", fontWeight: 500, color: "#778DA9", display: "flex", alignItems: "center", gap: "6px" }}>
            <User size={13} />Asignar a
          </label>
          <select
            value={usuarioAsignadoId}
            onChange={(e) => setUsuarioAsignadoId(e.target.value)}
            disabled={cargandoMiembros}
            style={{
              width: "100%",
              background: "rgba(224, 225, 221, 0.06)",
              border: "1px solid rgba(224, 225, 221, 0.15)",
              borderRadius: "12px",
              padding: "10px 14px",
              color: "#E0E1DD",
              fontSize: "14px",
              outline: "none",
              fontFamily: "var(--font-body)",
            }}
          >
            <option value="">Sin asignar (queda disponible para el equipo)</option>
            {miembros.map((m) => (
              <option key={m.usuarioId ?? m.UsuarioId} value={m.usuarioId ?? m.UsuarioId}>
                {m.nombre ?? m.Nombre}
              </option>
            ))}
          </select>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <label style={{ fontSize: "13px", fontWeight: 500, color: "#778DA9" }}>Etiquetas</label>

        {etiquetas.length > 0 && (
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {etiquetas.map((t) => (
              <span
                key={t}
                className="glass-nested"
                style={{
                  padding: "5px 10px",
                  fontSize: "12px",
                  color: "#9db5cc",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                {t}
                <X size={12} style={{ cursor: "pointer" }} onClick={() => quitarEtiqueta(t)} />
              </span>
            ))}
          </div>
        )}

        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {ETIQUETAS_SUGERIDAS.filter((s) => !etiquetas.includes(s)).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => agregarEtiqueta(s)}
              style={{
                padding: "4px 10px",
                fontSize: "11px",
                borderRadius: "999px",
                border: "1px solid rgba(224, 225, 221, 0.12)",
                background: "transparent",
                color: "#778DA9",
                cursor: "pointer",
              }}
            >
              + {s}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <input
            value={etiquetaLibre}
            onChange={(e) => setEtiquetaLibre(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAgregarLibre(e);
            }}
            placeholder="Otra etiqueta…"
            style={{
              flex: 1,
              background: "rgba(224, 225, 221, 0.06)",
              border: "1px solid rgba(224, 225, 221, 0.15)",
              borderRadius: "10px",
              padding: "8px 12px",
              color: "#E0E1DD",
              fontSize: "13px",
              outline: "none",
            }}
          />
          <Button type="button" variant="ghost" size="sm" onClick={handleAgregarLibre}>
            Agregar
          </Button>
        </div>
      </div>

      <div style={{ display: "flex", gap: "16px" }}>
        <div style={{ flex: 1 }}>
          <Input
            label="XP al completar"
            type="number"
            min="0"
            value={xpValor}
            onChange={(e) => setXpValor(e.target.value)}
            icon={<Zap size={15} />}
          />
        </div>
        <div style={{ flex: 1 }}>
          <Input
            label="Fecha límite (opcional)"
            type="date"
            value={fechaLimite}
            onChange={(e) => setFechaLimite(e.target.value)}
            icon={<Calendar size={15} />}
          />
        </div>
      </div>

      <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#778DA9", cursor: "pointer" }}>
        <input type="checkbox" checked={esUrgente} onChange={(e) => setEsUrgente(e.target.checked)} />
        Marcar como urgente
      </label>

      {error && (
        <div
          style={{
            background: "rgba(124, 58, 58, 0.15)",
            border: "1px solid rgba(124, 58, 58, 0.35)",
            borderRadius: "10px",
            padding: "10px 14px",
            fontSize: "13px",
            color: "#c97070",
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
        {onCancelar && (
          <Button type="button" variant="ghost" onClick={onCancelar}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={cargando}>
          {cargando ? "Creando…" : "Crear misión"}
        </Button>
      </div>
    </form>
  );
}