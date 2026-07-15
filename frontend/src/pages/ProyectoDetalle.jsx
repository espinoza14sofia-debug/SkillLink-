import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import "./ProyectoDetalle.css";

export default function ProyectoDetalle() {
  const { id } = useParams();
  const [proyecto, setProyecto] = useState(null);

  useEffect(() => {
    api.get(`/proyectos/${id}`).then(res => setProyecto(res.data));
  }, [id]);

  if (!proyecto) return <p style={{ color: "var(--eq-text-dim)" }}>Cargando...</p>;

  return (
    <div className="proyecto-container">
      <Link to="/mi-equipo" className="proyecto-volver">← Volver a mi equipo</Link>
      <div className="proyecto-card">
        <h1>{proyecto.nombre}</h1>
        <span className="proyecto-estado">{proyecto.estado}</span>
        <p className="proyecto-descripcion">{proyecto.descripcion}</p>

        <div className="mision-bar-label">
          <span>Avance de la misión</span>
        </div>
        <div className="mision-bar-track">
          <div className="mision-bar-fill" style={{ width: `${proyecto.porcentajeAvance}%` }}>
            <div className="mision-bar-marker"></div>
          </div>
        </div>
        <div className="mision-bar-percent">{proyecto.porcentajeAvance}%</div>
      </div>
    </div>
  );
}