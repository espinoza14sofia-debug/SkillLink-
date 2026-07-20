import { useState } from "react";
import { Input, Button } from "./ui";
import { Users } from "lucide-react";
import api from "../services/api";

export default function FormularioCrearEquipo({ onCreado }) {
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      const res = await api.post("/equipos", { nombre });
      onCreado?.(res.data.id);
    } catch (err) {
      console.error("Error creando equipo:", err.response?.data || err);
      setError(err.response?.data?.mensaje || "No se pudo crear el equipo.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <Input
        label="Nombre del equipo"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        placeholder="Ej: Quantum Devs"
        icon={<Users size={15} />}
        required
      />

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

      <Button type="submit" size="lg" disabled={cargando} style={{ width: "100%" }}>
        {cargando ? "Creando…" : "Crear equipo"}
      </Button>
    </form>
  );
}