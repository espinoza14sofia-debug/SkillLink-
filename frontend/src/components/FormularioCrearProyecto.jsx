import { useState } from "react";
import { Folder } from "lucide-react";
import { Input, Button } from "./ui";
import api from "../services/api";

export default function FormularioCrearProyecto({ equipoId, onCreado }) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      const res = await api.post("/proyectos", { nombre, descripcion, equipoId });
      onCreado?.(res.data);
    } catch {
      setError("No se pudo crear el proyecto.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <Input
        label="Nombre del proyecto"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        placeholder="Ej: Portal de gestión académica"
        icon={<Folder size={15} />}
        required
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label style={{ fontSize: "13px", fontWeight: 500, color: "#4E7276" }}>Descripción</label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="¿Qué van a construir?"
          rows={3}
          style={{
            width: "100%",
            background: "rgba(15, 53, 56, 0.06)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: "1px solid rgba(15, 53, 56, 0.15)",
            borderRadius: "12px",
            padding: "12px 14px",
            color: "#0F3538",
            fontSize: "14px",
            outline: "none",
            fontFamily: "var(--font-body)",
            resize: "vertical",
          }}
        />
      </div>

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

      <Button type="submit" size="lg" disabled={cargando} style={{ width: "100%" }}>
        {cargando ? "Creando…" : "Crear proyecto"}
      </Button>
    </form>
  );
}