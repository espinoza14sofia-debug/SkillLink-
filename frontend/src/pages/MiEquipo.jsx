import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import FormularioCrearEquipo from "../components/FormularioCrearEquipo";
import PanelRoles from "../components/PanelRoles";
import FormularioCrearProyecto from "../components/FormularioCrearProyecto";
import ChatEquipo from "../components/ChatEquipo";
import favicon from "../assets/favicon.png";
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
      <div className="equipo-wrapper">
        <nav className="navbar">
          <div className="navbar-brand">
            <img src={favicon} alt="SkillLink" className="brand-icon-img" />
            <span className="brand-name">SkillLink</span>
          </div>
          <Link to="/dashboard" className="back-link">← Volver al Dashboard</Link>
        </nav>
        <div className="equipo-container">
          <div className="equipo-card" style={{ maxWidth: 420, margin: "40px auto" }}>
            <h2>Aún no tienes un equipo</h2>
            <FormularioCrearEquipo onCreado={handleEquipoCreado} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="equipo-wrapper">
      <nav className="navbar">
        <div className="navbar-brand">
          <img src={favicon} alt="SkillLink" className="brand-icon-img" />
          <span className="brand-name">SkillLink</span>
        </div>
        <Link to="/dashboard" className="back-link">← Volver al Dashboard</Link>
      </nav>

      <div className="equipo-container">
        <h1>Mi Equipo</h1>
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
          <div className="equipo-card chat-card-ancha">
            <h2>Chat del equipo</h2>
            <ChatEquipo equipoId={equipoId} />
          </div>
        </div>
      </div>
    </div>
  );
}