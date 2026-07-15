import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormularioCrearEquipo from "../components/FormularioCrearEquipo";
import PanelRoles from "../components/PanelRoles";
import FormularioCrearProyecto from "../components/FormularioCrearProyecto";
import "./MiEquipo.css";

export default function MiEquipo() {
  const [equipoId, setEquipoId] = useState(localStorage.getItem("equipoId"));
  const navigate = useNavigate();

  const handleEquipoCreado = (id) => {
    localStorage.setItem("equipoId", id);
    setEquipoId(id);
  };

  if (!equipoId) {
    return (
      <div className="equipo-container">
        <div className="equipo-card" style={{ maxWidth: 420, margin: "80px auto" }}>
          <h2>Aún no tienes un equipo</h2>
          <FormularioCrearEquipo onCreado={handleEquipoCreado} />
        </div>
      </div>
    );
  }

  return (
    <div className="equipo-container">
      <div className="equipo-header">
        <h1>Mi Equipo</h1>
      </div>
      <div className="equipo-grid">
        <div className="equipo-card">
          <h2>Miembros</h2>
          <PanelRoles equipoId={equipoId} />
        </div>
        <div className="equipo-card">
          <h2>Nuevo proyecto</h2>
          <FormularioCrearProyecto
            equipoId={equipoId}
            onCreado={(proyecto) => navigate(`/proyectos/${proyecto.id}`)}
          />
        </div>
      </div>
    </div>
  );
}