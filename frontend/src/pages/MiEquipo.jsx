<<<<<<< Updated upstream
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
=======
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, Plus, MessageSquare, Crown, ChevronRight, Folder } from 'lucide-react';
import { Avatar, Button, GlassCard, XPBar, EmptyState } from '../components/ui';
import Navbar from '../components/Navbar';
import FormularioCrearEquipo from '../components/FormularioCrearEquipo';
import FormularioCrearProyecto from '../components/FormularioCrearProyecto';
import ChatEquipo from '../components/ChatEquipo';
import api from '../services/api';

export default function Team() {
>>>>>>> Stashed changes
  const navigate = useNavigate();
  const [equipoId, setEquipoId] = useState(localStorage.getItem('equipoId'));
  const [miembros, setMiembros] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [showCreateProject, setShowCreateProject] = useState(false);

  const handleEquipoCreado = (id) => {
    localStorage.setItem('equipoId', id);
    setEquipoId(id);
  };

<<<<<<< Updated upstream
  const cargarProyectos = () => {
    api.get("/proyectos/mios")
      .then(res => setProyectos(res.data))
      .catch(() => {});
  };

  useEffect(() => {
    if (equipoId) cargarProyectos();
  }, [equipoId]);

=======
  const cargarMiembros = async () => {
    try {
      const { data } = await api.get(`/equipos/${equipoId}/miembros`);
      setMiembros(data);
    } catch (err) {
      setMiembros([]);
    }
  };

  const cargarProyectos = async () => {
    try {
      const { data } = await api.get(`/proyectos/equipo/${equipoId}`);
      setProyectos(data);
    } catch (err) {
      setProyectos([]);
    }
  };

  useEffect(() => {
    if (!equipoId) {
      setCargando(false);
      return;
    }
    Promise.all([cargarMiembros(), cargarProyectos()]).finally(() => setCargando(false));
  }, [equipoId]);

  const cambiarRol = async (usuarioId, nuevoRol) => {
    try {
      await api.put(`/equipos/${equipoId}/miembros/${usuarioId}/rol`, { nuevoRol });
      setMiembros((prev) =>
        prev.map((m) => (m.usuarioId === usuarioId ? { ...m, rol: nuevoRol === 1 ? 'Lider' : 'Colaborador' } : m))
      );
    } catch (err) {
      alert('No se pudo cambiar el rol.');
    }
  };

  const handleProyectoCreado = (proyecto) => {
    setProyectos((prev) => [proyecto, ...prev]);
    setShowCreateProject(false);
  };

  // Sin equipo todavía
>>>>>>> Stashed changes
  if (!equipoId) {
    return (
      <div>
        <Navbar />
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '90px 24px 32px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700, margin: '0 0 28px' }}>
            Mi Equipo
          </h1>
          <GlassCard style={{ padding: '48px 24px' }}>
            <EmptyState
              icon={<Users size={52} />}
              title="Aún no perteneces a ningún equipo"
              desc="Crea tu propio equipo para empezar a colaborar."
              action={
                <div style={{ maxWidth: '340px', margin: '0 auto' }}>
                  <FormularioCrearEquipo onCreado={handleEquipoCreado} />
                </div>
              }
            />
          </GlassCard>
        </div>
      </div>
    );
  }

  if (cargando) {
    return (
      <div>
        <Navbar />
        <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '90px 24px 32px' }}>
          <div className="skeleton" style={{ height: 400, borderRadius: 16 }} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '90px 24px 32px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '28px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700, margin: '0 0 4px' }}>
              Mi Equipo
            </h1>
            <p style={{ color: '#778DA9', margin: 0 }}>
              {miembros.length} {miembros.length === 1 ? 'miembro' : 'miembros'}
            </p>
          </div>
        </div>
<<<<<<< Updated upstream
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
=======

        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr 320px', gap: '16px' }}>
          {/* Members panel */}
          <GlassCard style={{ padding: '20px' }}>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '16px',
                fontWeight: 600,
                margin: '0 0 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Users size={16} color="#778DA9" /> Miembros
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {miembros.map((m) => (
                <div
                  key={m.usuarioId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'rgba(224, 225, 221, 0.04)',
                    border: '1px solid rgba(224, 225, 221, 0.06)',
                  }}
                >
                  <Avatar name={m.nombre} size={38} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                      <span
                        style={{
                          fontWeight: 500,
                          fontSize: '13px',
                          color: '#E0E1DD',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {m.nombre}
                      </span>
                      {m.rol === 'Lider' && <Crown size={12} color="#c49a3f" />}
                    </div>
                    <span style={{ fontSize: '11px', color: '#778DA9' }}>{m.rol}</span>
                  </div>
                  <select
                    onChange={(e) => cambiarRol(m.usuarioId, Number(e.target.value))}
                    defaultValue=""
                    style={{
                      background: 'rgba(224,225,221,0.06)',
                      border: '1px solid rgba(224,225,221,0.15)',
                      borderRadius: '8px',
                      color: '#778DA9',
                      fontSize: '11px',
                      padding: '4px 6px',
                    }}
                  >
                    <option value="" disabled>
                      Rol
                    </option>
                    <option value={0}>Colaborador</option>
                    <option value={1}>Líder</option>
                  </select>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Projects panel */}
          <GlassCard style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '16px',
                  fontWeight: 600,
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Folder size={16} color="#778DA9" /> Proyectos
              </h2>
              <Button
                variant="glass"
                size="sm"
                onClick={() => setShowCreateProject(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={13} />
                Nuevo
              </Button>
            </div>

            {proyectos.length === 0 ? (
              <p style={{ color: '#778DA9', fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>
                Aún no hay proyectos. Crea el primero.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {proyectos.map((p) => (
                  <div
                    key={p.id}
                    className="glass-nested hover-lift"
                    style={{ padding: '16px', cursor: 'pointer' }}
                    onClick={() => navigate(`/proyectos/${p.id}`)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 600, margin: 0, color: '#E0E1DD' }}>
                        {p.nombre}
                      </h3>
                      <ChevronRight size={14} color="#415A77" />
                    </div>
                    <span style={{ fontSize: '12px', color: '#778DA9', display: 'block', marginBottom: '12px' }}>
                      {p.estado === 'Completado' ? 'Completado' : 'En progreso'}
                    </span>
                    <XPBar value={p.porcentajeAvance} max={100} label={`${p.porcentajeAvance}% completado`} />
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          {/* Chat panel — reutiliza tu componente ChatEquipo funcional */}
          <GlassCard style={{ padding: '0', display: 'flex', flexDirection: 'column', height: '580px', overflow: 'hidden' }}>
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid rgba(224,225,221,0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <MessageSquare size={15} color="#778DA9" />
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 600, margin: 0 }}>
                Chat del equipo
              </h2>
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <ChatEquipo equipoId={equipoId} />
            </div>
          </GlassCard>
>>>>>>> Stashed changes
        </div>
      </div>

      {/* Create project modal — reutiliza tu FormularioCrearProyecto funcional */}
      {showCreateProject && (
        <div className="overlay" onClick={() => setShowCreateProject(false)}>
          <div
            className="glass-float"
            style={{ width: '100%', maxWidth: '440px', padding: '32px', margin: '24px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 600, margin: '0 0 6px' }}>
              Nuevo proyecto
            </h2>
            <p style={{ color: '#778DA9', fontSize: '13px', margin: '0 0 24px' }}>
              Crea un proyecto para organizar las misiones del equipo
            </p>
            <FormularioCrearProyecto equipoId={equipoId} onCreado={handleProyectoCreado} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <Button variant="ghost" onClick={() => setShowCreateProject(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}