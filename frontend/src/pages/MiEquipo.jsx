import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, MessageSquare, Crown, ChevronRight, Folder } from 'lucide-react';
import { Avatar, Button, GlassCard, XPBar, EmptyState } from '../components/ui';
import Navbar from '../components/Navbar';
import FormularioCrearEquipo from '../components/FormularioCrearEquipo';
import FormularioCrearProyecto from '../components/FormularioCrearProyecto';
import ChatEquipo from '../components/ChatEquipo';
import api from '../services/api';

export default function Team() {
  const navigate = useNavigate();
  const [equipoId, setEquipoId] = useState(localStorage.getItem('equipoId'));
  const [miembros, setMiembros] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [buscandoEquipo, setBuscandoEquipo] = useState(!localStorage.getItem('equipoId'));
  const [showCreateProject, setShowCreateProject] = useState(false);

  const handleEquipoCreado = (id) => {
    localStorage.setItem('equipoId', id);
    setEquipoId(id);
  };

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

  // Si no hay equipoId guardado en este navegador, buscamos si el usuario
  // ya pertenece a algún equipo en el backend antes de mostrar "sin equipo".
  useEffect(() => {
    if (equipoId) {
      setBuscandoEquipo(false);
      return;
    }

    const buscarMisEquipos = async () => {
      try {
        const { data } = await api.get('/equipos/mios');
        if (data && data.length > 0) {
          localStorage.setItem('equipoId', data[0].id);
          setEquipoId(data[0].id);
        }
      } catch (err) {
        // Si falla, dejamos que se muestre la pantalla de "crear equipo"
      } finally {
        setBuscandoEquipo(false);
      }
    };

    buscarMisEquipos();
  }, [equipoId]);

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

  const handleProyectoCreado = async () => {
    await cargarProyectos();
    setShowCreateProject(false);
  };

  // Todavía buscando si el usuario pertenece a algún equipo
  if (buscandoEquipo) {
    return (
      <div>
        <Navbar />
        <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '90px 24px 32px' }}>
          <div className="skeleton" style={{ height: 400, borderRadius: 16 }} />
        </div>
      </div>
    );
  }

  // Sin equipo todavía (ni guardado, ni encontrado en el backend)
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
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(224, 225, 221, 0.08)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(224, 225, 221, 0.04)')}
                >
                  <Avatar name={m.nombre} size={38} ring={m.rol === 'Lider' ? 'gold' : 'none'} />
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
                      flexShrink: 0,
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
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

            <div style={{ borderTop: '1px solid rgba(224,225,221,0.08)', paddingTop: '16px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 600, margin: '0 0 12px', color: '#778DA9' }}>
                ESTADÍSTICAS DEL EQUIPO
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[
                  { label: 'Proyectos', value: proyectos.length },
                  { label: 'Miembros', value: miembros.length },
                ].map(({ label, value }) => (
                  <div key={label} className="glass-nested" style={{ padding: '10px 12px' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 600, color: '#E0E1DD' }}>{value}</div>
                    <div style={{ fontSize: '11px', color: '#778DA9', marginTop: 2 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>

          {/* Chat panel */}
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
        </div>
      </div>

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