import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import favicon from "../assets/favicon.png";
import "./MisProyectos.css";

export default function MisProyectos() {
  const [proyectos, setProyectos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/proyectos/mios")
      .then((res) => setProyectos(res.data))
      .catch(() => setError("No se pudieron cargar tus proyectos."))
      .finally(() => setCargando(false));
  }, []);

  return (
    <div className="proyectos-container">
      <nav className="navbar">
        <div className="navbar-brand">
          <img src={favicon} alt="SkillLink" className="brand-icon-img" />
          <span className="brand-name">SkillLink</span>
        </div>
        <Link to="/mi-equipo" className="back-link">← Volver a mi equipo</Link>
      </nav>

      <main className="proyectos-content">
        <h1>Mis Proyectos</h1>

        {cargando && <p style={{ color: "var(--eq-text-dim)" }}>Cargando...</p>}
        {error && <p style={{ color: "var(--eq-text-dim)" }}>{error}</p>}

        {!cargando && !error && proyectos.length === 0 && (
          <p style={{ color: "var(--eq-text-dim)" }}>
            Todavía no tenés proyectos. Creá uno desde Mi Equipo.
          </p>
        )}

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
      </main>
    </div>
  );
}