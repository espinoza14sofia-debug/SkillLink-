import { useEffect, useState } from 'react';
import { Search, Clock, CheckCircle, Lock, Circle, AlertCircle, Plus } from 'lucide-react';
import { Badge, Button, GlassCard, XPBar, Input } from '../components/ui';
import Navbar from '../components/Navbar';
import FormularioCrearMision from '../components/FormularioCrearMision';
import api from '../services/api';

const FILTROS = ['Todas', 'En progreso', 'Urgentes', 'Pendientes', 'Completadas'];

function formatearTiempoRelativo(fechaIso) {
  if (!fechaIso) return null;
  const ahora = new Date();
  const fecha = new Date(fechaIso);
  const segundos = Math.floor((ahora - fecha) / 1000);

  if (segundos < 60) return 'hace un momento';
  const minutos = Math.floor(segundos / 60);
  if (minutos < 60) return `hace ${minutos}m`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `hace ${horas}h`;
  const dias = Math.floor(horas / 24);
  if (dias < 30) return `hace ${dias}d`;
  const meses = Math.floor(dias / 30);
  return `hace ${meses}mes`;
}

export default function Missions() {
  const [misiones, setMisiones] = useState([]);
  const [usuarioId, setUsuarioId] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('Todas');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [detailsOpenId, setDetailsOpenId] = useState(null);
  const [reasignarId, setReasignarId] = useState(null);
  const [reasignarDestino, setReasignarDestino] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const cargarMisiones = async () => {
    const equipoId = localStorage.getItem('equipoId');
    if (!equipoId) {
      setMisiones([]);
      setCargando(false);
      return;
    }
    try {
      const respuesta = await api.get(`/misiones/equipo/${equipoId}`);
      setMisiones(respuesta.data);
    } catch (err) {
      setError('No se pudieron cargar las misiones.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem('usuario');
    if (stored) {
      setUsuarioId(JSON.parse(stored).id);
    }
    cargarMisiones();
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      const respuesta = await api.get('/usuarios');
      setUsuarios(respuesta.data);
    } catch (err) {
      setUsuarios([]);
    }
  };

  const handleReasignar = async (id, destinoId) => {
    if (!destinoId) return;
    try {
      await api.put(`/misiones/${id}/reasignar`, { usuarioId: destinoId });
      setReasignarId(null);
      setReasignarDestino('');
      cargarMisiones();
    } catch (err) {
      const mensaje = err.response?.data?.mensaje || 'No se pudo ceder la misión.';
      alert(mensaje);
    }
  };

  const handleAsignar = async (id) => {
    try {
      await api.put(`/misiones/${id}/asignar`);
      cargarMisiones();
    } catch (err) {
      alert('No se pudo asignar la misión.');
    }
  };

  const handleCompletar = async (id) => {
    try {
      await api.put(`/misiones/${id}/completar`);
      cargarMisiones();
    } catch (err) {
      const mensaje = err.response?.data?.mensaje || 'No se pudo completar la misión.';
      alert(mensaje);
    }
  };

  const handleActualizarProgreso = async (id, progreso) => {
    try {
      await api.put(`/misiones/${id}/progreso`, { progreso });
      cargarMisiones();
    } catch (err) {
      const mensaje = err.response?.data?.mensaje || 'No se pudo actualizar el progreso.';
      alert(mensaje);
    }
  };

  const derivarEstado = (m) => {
    const completada = m.estado === 'completada';
    const esMia = String(m.usuarioAsignadoId) === String(usuarioId);
    const sinAsignar = !m.usuarioAsignadoId;

    if (completada) return { key: 'done', label: 'Completada', variant: 'success', icon: CheckCircle };
    if (m.esUrgente || m.vencida) {
      return {
        key: 'urgent',
        label: m.vencida ? 'Vencida' : 'Urgente',
        variant: 'error',
        icon: AlertCircle,
      };
    }
    if (esMia) return { key: 'in_progress', label: 'En progreso', variant: 'accent', icon: Circle };
    if (sinAsignar) return { key: 'pending', label: 'Disponible', variant: 'neutral', icon: Circle };
    return { key: 'otro', label: 'Asignada a otro', variant: 'neutral', icon: Lock };
  };

  const filtered = misiones.filter((m) => {
    const estado = derivarEstado(m);
    const matchFilter =
      activeFilter === 'Todas' ||
      (activeFilter === 'En progreso' && estado.key === 'in_progress') ||
      (activeFilter === 'Urgentes' && estado.key === 'urgent') ||
      (activeFilter === 'Pendientes' && estado.key === 'pending') ||
      (activeFilter === 'Completadas' && estado.key === 'done');
    const matchSearch = m.titulo.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const mapaFiltro = {
    'En progreso': 'in_progress',
    'Urgentes': 'urgent',
    'Pendientes': 'pending',
    'Completadas': 'done',
  };

  const contarPorFiltro = (f) => {
    if (f === 'Todas') return misiones.length;
    return misiones.filter((m) => derivarEstado(m).key === mapaFiltro[f]).length;
  };

  const totalXpDisponible = misiones
    .filter((m) => m.estado !== 'completada')
    .reduce((acc, m) => acc + (m.xpValor || 0), 0);

  if (cargando) {
    return (
      <div>
        <Navbar />
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '90px 24px 32px' }}>
          <div className="skeleton" style={{ height: 100, borderRadius: 16, marginBottom: 24 }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton" style={{ height: 180, borderRadius: 16 }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '90px 24px 32px' }}>
        <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700, margin: '0 0 6px' }}>
              Misiones
            </h1>
            <p style={{ color: '#778DA9', margin: 0 }}>Completa misiones para ganar XP y subir de nivel</p>
          </div>
          <Button variant="primary" onClick={() => setShowCreateModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={15} />
            Nueva misión
          </Button>
        </div>

        {error && (
          <GlassCard style={{ padding: '14px 18px', marginBottom: '20px', color: '#c97070' }}>{error}</GlassCard>
        )}

        <div style={{ marginBottom: '24px' }}>
          <Input
            placeholder="Buscar misiones…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search size={15} />}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {FILTROS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              style={{
                padding: '7px 14px',
                borderRadius: '999px',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                border: 'none',
                transition: 'all 0.18s',
                background: activeFilter === f ? '#415A77' : 'rgba(224, 225, 221, 0.08)',
                color: activeFilter === f ? '#E0E1DD' : '#778DA9',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
            >
              {f}
              {f !== 'Todas' && (
                <span style={{ marginLeft: '6px', fontSize: '11px', opacity: 0.7 }}>({contarPorFiltro(f)})</span>
              )}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '28px' }}>
          {[
            { label: 'Total misiones', value: misiones.length },
            { label: 'En progreso', value: contarPorFiltro('En progreso') + contarPorFiltro('Urgentes') },
            { label: 'Completadas', value: contarPorFiltro('Completadas') },
            { label: 'XP disponible', value: `${totalXpDisponible} XP` },
          ].map(({ label, value }) => (
            <GlassCard key={label} style={{ padding: '14px 18px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '22px', fontWeight: 600, color: '#E0E1DD' }}>
                {value}
              </div>
              <div style={{ fontSize: '12px', color: '#778DA9', marginTop: '2px' }}>{label}</div>
            </GlassCard>
          ))}
        </div>

        {filtered.length === 0 ? (
          <GlassCard style={{ padding: '60px', textAlign: 'center' }}>
            <Search size={40} color="#415A77" style={{ margin: '0 auto 16px', display: 'block', opacity: 0.5 }} />
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: '#E0E1DD', margin: '0 0 8px' }}>
              Sin resultados
            </p>
            <p style={{ color: '#778DA9', margin: 0 }}>
              {misiones.length === 0 ? 'No hay misiones disponibles todavía.' : 'Intenta con otro filtro o búsqueda.'}
            </p>
          </GlassCard>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '14px' }}>
            {filtered.map((m) => {
              const estado = derivarEstado(m);
              const isExpanded = expandedId === m.id;
              const esMia = String(m.usuarioAsignadoId) === String(usuarioId);
              const sinAsignar = !m.usuarioAsignadoId;
              const completada = estado.key === 'done';
              const Icon = estado.icon;
              const etiquetas = (m.etiquetas || '').split(',').map((t) => t.trim()).filter(Boolean);
              const iconBg = completada ? 'rgba(109, 179, 132, 0.12)' : 'rgba(65, 90, 119, 0.2)';
              const iconBorder = completada ? 'rgba(109, 179, 132, 0.35)' : 'rgba(65, 90, 119, 0.3)';
              const iconColor = estado.key === 'urgent' ? '#c97070' : completada ? '#6db384' : '#778DA9';

              return (
                <GlassCard
                  key={m.id}
                  className="hover-lift"
                  style={{
                    padding: '20px',
                    cursor: 'pointer',
                    opacity: completada ? 0.9 : 1,
                    transition: 'all 0.2s',
                  }}
                  onClick={() => setExpandedId(isExpanded ? null : m.id)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: '50%',
                        background: iconBg,
                        border: `1.5px solid ${iconBorder}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={17} color={iconColor} />
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 600, color: '#9db5cc' }}>
                      +{m.xpValor} XP
                    </div>
                  </div>

                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 700, margin: '0 0 6px', color: '#E0E1DD' }}>
                    {m.titulo}
                  </h3>
                  {m.proyectoNombre && (
                    <p style={{ color: '#778DA9', fontSize: '12px', margin: '0 0 4px' }}>{m.proyectoNombre}</p>
                  )}
                  {m.descripcion && (
                    <p style={{ color: '#9aa8b8', fontSize: '13px', margin: '0 0 14px', lineHeight: 1.5 }}>
                      {m.descripcion}
                    </p>
                  )}

                  {etiquetas.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                      {etiquetas.map((t) => (
                        <span
                          key={t}
                          className="glass-nested"
                          style={{ padding: '5px 12px', fontSize: '12px', color: '#9db5cc', borderRadius: '8px' }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  {!completada && (
                    <div style={{ marginBottom: '14px' }}>
                      <XPBar value={m.progreso || 0} max={100} label={`${m.progreso || 0}%`} />
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Badge variant={estado.variant}>{estado.label}</Badge>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#778DA9' }}>
                      <Clock size={12} />
                      {m.fechaLimite
                        ? new Date(m.fechaLimite).toLocaleDateString('es-CR', { day: 'numeric', month: 'short' })
                        : formatearTiempoRelativo(m.fechaCreacion)}
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(224,225,221,0.08)' }} onClick={(e) => e.stopPropagation()}>
                      <p style={{ fontSize: '13px', color: '#778DA9', margin: '0 0 12px' }}>
                        {completada ? (
                          <>Ya ganaste <strong style={{ color: '#6db384' }}>+{m.xpValor} XP</strong> completando esta misión{m.proyectoNombre ? <> del proyecto <em>{m.proyectoNombre}</em></> : ''}.</>
                        ) : (
                          <>Completa esta misión para ganar <strong style={{ color: '#9db5cc' }}>+{m.xpValor} XP</strong>{m.proyectoNombre ? <> y avanzar en el proyecto <em>{m.proyectoNombre}</em></> : ''}.</>
                        )}
                      </p>

                      {!completada && (
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                          {sinAsignar && (
                            <Button variant="primary" size="sm" onClick={() => handleAsignar(m.id)}>
                              Iniciar misión
                            </Button>
                          )}
                          {esMia && (
                            <Button variant="primary" size="sm" onClick={() => setDetailsOpenId(m.id)}>
                              Continuar
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDetailsOpenId(detailsOpenId === m.id ? null : m.id)}
                          >
                            Ver detalles
                          </Button>
                        </div>
                      )}

                      {detailsOpenId === m.id && (
                        <div
                          className="glass-nested"
                          style={{ padding: '12px 14px', marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}
                        >
                          <DetailRow label="Estado" value={estado.label} />
                          <DetailRow label="Progreso" value={`${m.progreso || 0}%`} />
                          {m.proyectoNombre && <DetailRow label="Proyecto" value={m.proyectoNombre} />}
                          <DetailRow
                            label="Creada"
                            value={new Date(m.fechaCreacion).toLocaleDateString('es-CR', { day: 'numeric', month: 'short', year: 'numeric' })}
                          />
                          {m.fechaLimite && (
                            <DetailRow
                              label="Fecha límite"
                              value={new Date(m.fechaLimite).toLocaleDateString('es-CR', { day: 'numeric', month: 'short', year: 'numeric' })}
                            />
                          )}
                          <DetailRow label="Asignada a" value={sinAsignar ? 'Nadie todavía' : esMia ? 'Ti' : 'Otro usuario'} />
                        </div>
                      )}

                      {!completada && esMia && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <div>
                            <label style={{ fontSize: '12px', color: '#778DA9', display: 'block', marginBottom: '6px' }}>
                              Actualizar progreso
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              step="5"
                              defaultValue={m.progreso || 0}
                              onMouseUp={(e) => handleActualizarProgreso(m.id, Number(e.target.value))}
                              onTouchEnd={(e) => handleActualizarProgreso(m.id, Number(e.target.value))}
                              style={{ width: '100%' }}
                            />
                          </div>
                          <Button variant="primary" size="sm" onClick={() => handleCompletar(m.id)}>
                            Marcar como completada
                          </Button>

                          <div style={{ borderTop: '1px solid rgba(224,225,221,0.08)', paddingTop: '10px', marginTop: '4px' }}>
                            {reasignarId === m.id ? (
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <select
                                  value={reasignarDestino}
                                  onChange={(e) => setReasignarDestino(e.target.value)}
                                  style={{
                                    flex: 1,
                                    background: 'rgba(224,225,221,0.06)',
                                    border: '1px solid rgba(224,225,221,0.15)',
                                    borderRadius: '8px',
                                    color: '#E0E1DD',
                                    fontSize: '12px',
                                    padding: '6px 8px',
                                  }}
                                >
                                  <option value="">Selecciona una persona…</option>
                                  {usuarios
                                    .filter((u) => String(u.id) !== String(usuarioId))
                                    .map((u) => (
                                      <option key={u.id} value={u.id}>
                                        {u.nombre}
                                      </option>
                                    ))}
                                </select>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleReasignar(m.id, reasignarDestino)}
                                  disabled={!reasignarDestino}
                                >
                                  Ceder
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => setReasignarId(null)}>
                                  Cancelar
                                </Button>
                              </div>
                            ) : (
                              <Button variant="ghost" size="sm" onClick={() => setReasignarId(m.id)}>
                                Ceder a otra persona
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="overlay" onClick={() => setShowCreateModal(false)}>
          <div
            className="glass-float"
            style={{ width: '100%', maxWidth: '480px', padding: '32px', margin: '24px', maxHeight: '85vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 600, margin: '0 0 6px' }}>
              Nueva misión
            </h2>
            <p style={{ color: '#778DA9', fontSize: '13px', margin: '0 0 24px' }}>
              Completa los datos de la misión
            </p>
            <FormularioCrearMision
              onCreada={() => {
                setShowCreateModal(false);
                cargarMisiones();
              }}
              onCancelar={() => setShowCreateModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
      <span style={{ color: '#778DA9' }}>{label}</span>
      <span style={{ color: '#E0E1DD', fontWeight: 500 }}>{value}</span>
    </div>
  );
}