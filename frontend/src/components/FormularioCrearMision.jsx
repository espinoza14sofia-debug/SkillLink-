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
    <div
      style={{
        width: "100%",
        maxWidth: "760px",  
        maxHeight: "min(90vh, 840px)",
        margin: "0 auto",
        overflowY: "auto",
        overflowX: "hidden",
        boxSizing: "border-box",
        padding: "clamp(20px, 3vw, 32px)",
        background: "rgba(255, 255, 255, 0.85)",  
        border: "1px solid rgba(15, 53, 56, 0.2)",  
        borderRadius: "16px",
        boxShadow: "0 8px 32px rgba(15, 53, 56, 0.12)",  
        WebkitOverflowScrolling: "touch",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "clamp(14px, 2.2vh, 20px)",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <Input
          label="Título de la misión"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          icon={<Target size={15} />}
          required
        />

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "13px", fontWeight: 500, color: "#4E7276" }}>Descripción</label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={3}
            style={{
              width: "100%",
              boxSizing: "border-box",
              background: "rgba(15, 53, 56, 0.04)",
              border: "1px solid rgba(15, 53, 56, 0.2)",   
              borderRadius: "12px",
              padding: "12px 14px",
              color: "#0F3538",
              fontSize: "clamp(13px, 1.6vw, 14px)",
              outline: "none",
              fontFamily: "var(--font-body)",
              resize: "vertical",
              minHeight: "88px",
            }}
          />
        </div>

        {equipoId && (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "13px", fontWeight: 500, color: "#4E7276", display: "flex", alignItems: "center", gap: "6px" }}>
              <User size={13} />Asignar a
            </label>
            <select
              value={usuarioAsignadoId}
              onChange={(e) => setUsuarioAsignadoId(e.target.value)}
              disabled={cargandoMiembros}
              style={{
                width: "100%",
                boxSizing: "border-box",
                background: "rgba(15, 53, 56, 0.04)",
                border: "1px solid rgba(15, 53, 56, 0.2)",
                borderRadius: "12px",
                padding: "10px 14px",
                color: "#0F3538",
                fontSize: "clamp(13px, 1.6vw, 14px)",
                outline: "none",
                fontFamily: "var(--font-body)",
              }}
            >
              <option value=""> </option>
              {miembros.map((m) => (
                <option key={m.usuarioId ?? m.UsuarioId} value={m.usuarioId ?? m.UsuarioId}>
                  {m.nombre ?? m.Nombre}
                </option>
              ))}
            </select>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ fontSize: "13px", fontWeight: 500, color: "#4E7276" }}>Etiquetas</label>

          {etiquetas.length > 0 && (
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {etiquetas.map((t) => (
                <span
                  key={t}
                  className="glass-nested"
                  style={{
                    padding: "5px 10px",
                    fontSize: "12px",
                    color: "#006D77",
                    border: "1px solid rgba(0, 109, 119, 0.2)",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    maxWidth: "100%",
                  }}
                >
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t}</span>
                  <X size={12} style={{ cursor: "pointer", flexShrink: 0 }} onClick={() => quitarEtiqueta(t)} />
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
                  border: "1px solid rgba(15, 53, 56, 0.2)",
                  background: "transparent",
                  color: "#4E7276",
                  cursor: "pointer",
                }}
              >
                + {s}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <input
              value={etiquetaLibre}
              onChange={(e) => setEtiquetaLibre(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAgregarLibre(e);
              }}
              placeholder="Nueva etiqueta…"
              style={{
                flex: "1 1 160px",
                minWidth: 0,
                boxSizing: "border-box",
                background: "rgba(15, 53, 56, 0.04)",
                border: "1px solid rgba(15, 53, 56, 0.2)",
                borderRadius: "10px",
                padding: "8px 12px",
                color: "#0F3538",
                fontSize: "13px",
                outline: "none",
              }}
            />
            <Button type="button" variant="ghost" size="sm" onClick={handleAgregarLibre}>
              Agregar
            </Button>
          </div>
        </div>

        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 180px", minWidth: 0 }}>
            <Input
              label="XP al completar"
              type="number"
              min="0"
              value={xpValor}
              onChange={(e) => setXpValor(e.target.value)}
              icon={<Zap size={15} />}
            />
          </div>
          <div style={{ flex: "1 1 180px", minWidth: 0 }}>
            <Input
              label="Fecha límite (opcional)"
              type="date"
              value={fechaLimite}
              onChange={(e) => setFechaLimite(e.target.value)}
              icon={<Calendar size={15} />}
            />
          </div>
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#4E7276", cursor: "pointer" }}>
          <input type="checkbox" checked={esUrgente} onChange={(e) => setEsUrgente(e.target.checked)} />
          Marcar como urgente
        </label>

        {error && (
          <div
            style={{
              background: "rgba(196, 69, 60, 0.15)",
              border: "1px solid rgba(196, 69, 60, 0.35)",
              borderRadius: "10px",
              padding: "10px 14px",
              fontSize: "13px",
              color: "#C4453C",
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", flexWrap: "wrap", marginTop: "4px" }}>
          {onCancelar && (
            <Button type="button" variant="ghost" onClick={onCancelar} style={{ flex: "0 1 auto" }}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={cargando} style={{ flex: "0 1 auto" }}>
            {cargando ? "Creando…" : "Crear misión"}
          </Button>
        </div>
      </form>
    </div>
  );
}