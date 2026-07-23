import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, MessageSquare, Crown, ChevronRight, Folder, Shield, ArrowRight, UserPlus, Send, CheckCircle2, AlertCircle, Check, X, Bell, LogOut, Trash2 } from 'lucide-react';
import { Avatar, Button, GlassCard, XPBar, EmptyState } from '../components/ui';
import Navbar from '../components/Navbar';
import FormularioCrearEquipo from '../components/FormularioCrearEquipo';
import FormularioCrearProyecto from '../components/FormularioCrearProyecto';
import ChatEquipo from '../components/ChatEquipo';
import api from '../services/api';

// Componente interno para invitar usuarios
function FormularioInvitarUsuario({ equipoId, onInvitacionEnviada }) {
  const [emailOUsername, setEmailOUsername] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  const handleInvitar = async (e) => {
    e.preventDefault();
    if (!emailOUsername.trim()) return;

    setCargando(true);
    setMensaje({ tipo: '', texto: '' });

    try {
      // CORREGIDO: Ruta alineada con el backend ([HttpPost("{id}/invitar")])
      await api.post(`/equipos/${equipoId}/invitar`, {
        emailOUsername: emailOUsername.trim()
      });

      setMensaje({ tipo: 'exito', texto: '¡Invitación enviada con éxito!' });
      setEmailOUsername('');
      if (onInvitacionEnviada) onInvitacionEnviada();
    } catch (err) {
      const errorMsg = err.response?.data?.mensaje || err.response?.data?.message || err.response?.data || 'No se pudo enviar la invitación.';
      setMensaje({ tipo: 'error', texto: typeof errorMsg === 'string' ? errorMsg : 'Error al enviar invitación.' });
    } finally {
      setCargando(false);
    }
  };

  return (
    <form onSubmit={handleInvitar} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', gap: '6px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <UserPlus size={15} color="#778DA9" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Correo o usuario..."
            value={emailOUsername}
            onChange={(e) => setEmailOUsername(e.target.value)}
            disabled={cargando}
            style={{
              width: '100%',
              background: 'rgba(224, 225, 221, 0.06)',
              border: '1px solid rgba(224, 225, 221, 0.15)',
              borderRadius: '8px',
              padding: '8px 10px 8px 34px',
              color: '#E0E1DD',
              fontSize: '12px',
              outline: 'none',
              fontFamily: 'var(--font-body)',
            }}
          />
        </div>
        <Button
          type="submit"
          variant="glass"
          size="sm"
          disabled={cargando || !emailOUsername.trim()}
          style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}
        >
          <Send size={12} />
          {cargando ? '...' : 'Invitar'}
        </Button>
      </div>

      {mensaje.texto && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11px',
            color: mensaje.tipo === 'exito' ? '#4ade80' : '#f87171',
          }}
        >
          {mensaje.tipo === 'exito' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
          <span>{mensaje.texto}</span>
        </div>
      )}
    </form>
  );
}

// Componente interno para ver y responder invitaciones pendientes del usuario
function BandejaInvitaciones({ onInvitacionRespondida }) {
  const [invitaciones, setInvitaciones] = useState([]);

  const cargarInvitaciones = async () => {
    try {
      const { data } = await api.get('/equipos/invitaciones/pendientes');
      setInvitaciones(data);
    } catch (err) {
      setInvitaciones([]);
    }
  };

  useEffect(() => {
    cargarInvitaciones();
  }, []);

  const responder = async (invitacionId, aceptar) => {
    try {
      await api.put(`/equipos/invitaciones/${invitacionId}/responder`, { aceptar });
      cargarInvitaciones();
      if (onInvitacionRespondida) onInvitacionRespondida();
    } catch (err) {
      alert('Error al responder la invitación.');
    }
  };

  if (invitaciones.length === 0) return null;

  return (
    <div style={{ marginBottom: '24px' }}>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 600, margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '8px', color: '#c49a3f' }}>
        <Bell size={15} /> Tienes invitaciones pendientes ({invitaciones.length})
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {invitaciones.map((inv) => (
          <GlassCard key={inv.id} style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div>
              <p style={{ margin: '0 0 2px', fontSize: '13px', color: '#E0E1DD' }}>
                <strong>{inv.nombreQuienInvita}</strong> te invitó a <strong>{inv.nombreEquipo}</strong>
              </p>
              <span style={{ fontSize: '11px', color: '#778DA9' }}>
                {new Date(inv.fechaCreacion).toLocaleDateString()}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
              <Button variant="glass" size="sm" onClick={() => responder(inv.id, true)} style={{ color: '#4ade80', display: 'flex', gap: '4px', fontSize: '11px' }}>
                <Check size={13} /> Aceptar
              </Button>
              <Button variant="glass" size="sm" onClick={() => responder(inv.id, false)} style={{ color: '#f87171', display: 'flex', gap: '4px', fontSize: '11px' }}>
                <X size={13} /> Rechazar
              </Button>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

export default function Team() {
  const navigate = useNavigate();
  const [misEquipos, setMisEquipos] = useState([]);
  const [equipoId, setEquipoId] = useState(localStorage.getItem('equipoId'));
  const [miembros, setMiembros] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [buscandoEquipo, setBuscandoEquipo] = useState(true);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showSelectorGeneral, setShowSelectorGeneral] = useState(false);

  const handleEquipoCreado = (id) => {
    localStorage.setItem('equipoId', id);
    setEquipoId(id);
    setShowSelectorGeneral(false);
    setCargando(true);
    window.location.reload();
  };

  const seleccionarEquipo = (id) => {
    localStorage.setItem('equipoId', id);
    setEquipoId(id);
    setShowSelectorGeneral(false);
    setCargando(true);
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

  // Cargar lista de equipos a los que pertenece el usuario
  useEffect(() => {
    const buscarMisEquipos = async () => {
      try {
        const { data } = await api.get('/equipos/mios');
        if (data && data.length > 0) {
          setMisEquipos(data);
          const actualGuardado = localStorage.getItem('equipoId');
          const existe = data.some(eq => String(eq.id) === String(actualGuardado));
          
          if (!actualGuardado || !existe) {
            localStorage.setItem('equipoId', data[0].id);
            setEquipoId(data[0].id);
          }
        } else {
          setEquipoId(null);
        }
      } catch (err) {
        setMisEquipos([]);
      } finally {
        setBuscandoEquipo(false);
      }
    };

    buscarMisEquipos();
  }, []);

  // Cargar datos del equipo seleccionado actual
  useEffect(() => {
    if (!equipoId) {
      setCargando(false);
      return;
    }
    setCargando(true);
    Promise.all([cargarMiembros(), cargarProyectos()]).finally(() => setCargando(false));
  }, [equipoId]);

  const cambiarRol = async (usuarioId, nuevoRol) => {
    try {
      await api.put(`/equipos/${equipoId}/miembros/${usuarioId}/rol`, { nuevoRol });
      setMiembros((prev) =>
        prev.map((m) => (m.usuarioId === usuarioId ? { ...m, rol: nuevoRol === 1 ? 'Líder' : 'Colaborador' } : m))
      );
    } catch (err) {
      alert('No se pudo cambiar el rol.');
    }
  };

  const salirDelEquipo = async () => {
    if (!window.confirm('¿Estás seguro de que deseas salir de este equipo?')) return;
    try {
      await api.delete(`/equipos/${equipoId}/salir`);
      localStorage.removeItem('equipoId');
      window.location.reload();
    } catch (err) {
      alert('No se pudo salir del equipo.');
    }
  };

  const handleProyectoCreado = async () => {
    await cargarProyectos();
    setShowCreateProject(false);
  };

  const handleInvitacionRespondida = () => {
    window.location.reload();
  };

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

  // Sin equipo registrado en absoluto
  if (!equipoId || misEquipos.length === 0) {
    return (
      <div>
        <Navbar />
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '90px 24px 32px' }}>
          <BandejaInvitaciones onInvitacionRespondida={handleInvitacionRespondida} />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700, margin: '0 0 28px' }}>
            Mi Equipo
          </h1>
          <GlassCard style={{ padding: '48px 24px' }}>
            <EmptyState
              icon={<Users size={52} />}
              title="Aún no perteneces a ningún equipo"
              desc="Crea tu propio equipo o revisa si tienes invitaciones pendientes."
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

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '90px 24px 32px' }}>
        {/* Bandeja de invitaciones pendientes si las hay */}
        <BandejaInvitaciones onInvitacionRespondida={handleInvitacionRespondida} />

        {/* Encabezado con opción para ver/cambiar entre todos los equipos */}
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

          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              variant="glass"
              onClick={() => setShowSelectorGeneral(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Users size={16} />
              Cambiar / Crear equipo ({misEquipos.length})
            </Button>
            <Button
              variant="glass"
              onClick={salirDelEquipo}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f87171' }}
            >
              <LogOut size={16} />
              Salir
            </Button>
          </div>
        </div>

        {/* Modal / Vista de selección general para todos los equipos */}
        {showSelectorGeneral && (
          <div className="overlay" onClick={() => setShowSelectorGeneral(false)}>
            <div
              className="glass-float"
              style={{ width: '100%', maxWidth: '500px', padding: '32px', margin: '24px' }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 600, margin: '0 0 6px' }}>
                Tus equipos y creación
              </h2>
              <p style={{ color: '#778DA9', fontSize: '13px', margin: '0 0 20px' }}>
                Elige el equipo con el que deseas trabajar o crea uno nuevo:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto', marginBottom: '20px' }}>
                {misEquipos.map((eq) => (
                  <div
                    key={eq.id}
                    onClick={() => seleccionarEquipo(eq.id)}
                    className="glass-nested hover-lift"
                    style={{
                      padding: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      border: String(eq.id) === String(equipoId) ? '1px solid #c49a3f' : undefined,
                    }}
                  >
                    <div>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 600, margin: '0 0 4px', color: '#E0E1DD' }}>
                        {eq.nombre}
                      </h3>
                      <span style={{ fontSize: '12px', color: '#778DA9' }}>ID: {eq.id}</span>
                    </div>
                    <ArrowRight size={16} color={String(eq.id) === String(equipoId) ? '#c49a3f' : '#778DA9'} />
                  </div>
                ))}
              </div>

              {/* Formulario rápido para crear equipo dentro del modal */}
              <div style={{ borderTop: '1px solid rgba(224,225,221,0.1)', paddingTop: '16px' }}>
                <p style={{ color: '#E0E1DD', fontSize: '13px', fontWeight: 600, margin: '0 0 10px' }}>Crear un nuevo equipo:</p>
                <FormularioCrearEquipo onCreado={handleEquipoCreado} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                <Button variant="ghost" onClick={() => setShowSelectorGeneral(false)}>
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        )}

        {cargando ? (
          <div className="skeleton" style={{ height: 400, borderRadius: 16 }} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr 320px', gap: '16px' }}>
            {/* Members panel */}
            <GlassCard style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                <Users size={16} color="#778DA9" /> Miembros
              </h2>

              {/* Formulario de invitación de usuarios */}
              <div style={{ paddingBottom: '12px', borderBottom: '1px solid rgba(224,225,221,0.08)' }}>
                <FormularioInvitarUsuario equipoId={equipoId} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '400px' }}>
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
                    <Avatar name={m.nombre} size={38} ring={m.rol === 'Líder' ? 'gold' : 'none'} />
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
                        {m.rol === 'Líder' && <Crown size={12} color="#c49a3f" />}
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
                      <option value="" disabled>Rol</option>
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
        )}
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