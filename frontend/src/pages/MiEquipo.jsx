import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import FormularioCrearEquipo from "../components/FormularioCrearEquipo";
import PanelRoles from "../components/PanelRoles";
import FormularioCrearProyecto from "../components/FormularioCrearProyecto";
import ChatEquipo from "../components/ChatEquipo";
import api from "../services/api";
import favicon from "../assets/favicon.png";
import "./MiEquipo.css";
import "../pages/MisProyectos.css";

export default function MiEquipo() {
  const [equipoId, setEquipoId] = useState(localStorage.getItem("equipoId"));
  const [proyectos, setProyectos] = useState([]);
  const navigate = useNavigate();

  const handleEquipoCreado = (id) => {
    localStorage.setItem("equipoId", id);
    setEquipoId(id);
  };

  const cargarProyectos = () => {
    api.get("/proyectos/mios")
      .then(res => setProyectos(res.data))
      .catch(() => {});
  };

  useEffect(() => {
    if (equipoId) cargarProyectos();
  }, [equipoId]);

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
              onCreado={(proyecto) => {
                cargarProyectos();
                navigate(`/proyectos/${proyecto.id}`);
              }}
            />
          </div>
        </div>

        <div className="equipo-grid equipo-grid-suelto" style={{ marginTop: 24 }}>
          <div className="equipo-card">
            <h2>Mis Proyectos</h2>
            {proyectos.length === 0 ? (
              <p style={{ color: "var(--eq-text-dim)" }}>Aún no hay proyectos.</p>
            ) : (
              <div className="proyectos-grid">
                {proyectos.map((p) => (
                  <Link to={`/proyectos/${p.id}`} key={p.id} className="proyecto-mini-card">
                    <h3>{p.nombre}</h3>
                    <span className="proyecto-estado">{p.estado}</span>
                    <p className="proyecto-mini-descripcion">{p.descripcion}</p>
                    <div className="mision-bar-track">
                      <div
                        className="mision-bar-fill"
                        style={{ width: `${p.porcentajeAvance}%` }}
                      >
                        <div className="mision-bar-marker"></div>
                      </div>
                    </div>
                    <div className="mision-bar-percent">{p.porcentajeAvance}%</div>
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div className="equipo-card">
            <h2>Chat del equipo</h2>
            <ChatEquipo equipoId={equipoId} />
          </div>
        </div>
      </div>
    </div>
  );
}