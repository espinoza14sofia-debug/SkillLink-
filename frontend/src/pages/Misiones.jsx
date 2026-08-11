import { useEffect, useState } from 'react';
import { Search, CheckCircle, Circle, Lock, AlertCircle, UserPlus, Users } from 'lucide-react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { Badge, Button, GlassCard, Input } from '../components/ui';

const estadoConfig = {
    done: { label: 'Completada', variant: 'success', icon: CheckCircle, iconColor: '#6db384' },
    urgent: { label: 'Urgente', variant: 'error', icon: AlertCircle, iconColor: '#C4453C' },
    in_progress: { label: 'En progreso', variant: 'accent', icon: Circle, iconColor: '#006D77' },
    pending: { label: 'Pendiente', variant: 'neutral', icon: Lock, iconColor: '#4E7276' },
};

const filtros = ['Todas', 'En progreso', 'Urgentes', 'Pendientes', 'Completadas'];

function getClaveEstado(mision) {
    const estado = String(mision.estado || '').toLowerCase();

    if (estado.startsWith('completad')) return 'done';
    if (mision.esUrgente) return 'urgent';

    // El backend hoy solo persiste "pendiente" y "completada" como estado real;
    // "en progreso" se infiere de que la misión ya tiene alguien asignado,
    // no de un valor de "estado" que nunca llega a setearse en la base.
    if (mision.usuarioAsignadoId) return 'in_progress';

    return 'pending';
}

export default function Misiones() {
    const [gruposEquipo, setGruposEquipo] = useState([]); // [{ equipoId, equipoNombre, misiones }]
    const [miembrosPorEquipo, setMiembrosPorEquipo] = useState({}); // { [equipoId]: [miembros] }
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [usuarioId, setUsuarioId] = useState(null);
    const [busqueda, setBusqueda] = useState('');
    const [filtroActivo, setFiltroActivo] = useState('Todas');
    const [expandidaId, setExpandidaId] = useState(null);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState({});

    const cargarDatos = async () => {
        try {
            setCargando(true);
            const { data } = await api.get('/misiones');
            setGruposEquipo(data);

            // Cargamos los miembros de cada equipo en paralelo, para el selector "Asignar a"
            const entradas = await Promise.all(
                data.map(async (grupo) => {
                    try {
                        const { data: miembros } = await api.get(`/equipos/${grupo.equipoId}/miembros`);
                        return [grupo.equipoId, miembros];
                    } catch {
                        return [grupo.equipoId, []];
                    }
                })
            );
            setMiembrosPorEquipo(Object.fromEntries(entradas));
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
        cargarDatos();
    }, []);

    const handleAsignar = async (misionId, targetUsuarioId) => {
        if (!targetUsuarioId) {
            alert('Por favor selecciona un miembro.');
            return;
        }
        try {
            await api.put(`/misiones/${misionId}/asignar`, { usuarioId: targetUsuarioId });
            cargarDatos();
            alert('Misión asignada correctamente.');
        } catch (err) {
            const mensaje = err.response?.data?.mensaje || 'No se pudo asignar la misión.';
            alert(mensaje);
        }
    };

    const handleCompletar = async (id) => {
        try {
            await api.put(`/misiones/${id}/completar`);
            cargarDatos();
        } catch (err) {
            const mensaje = err.response?.data?.mensaje || 'No se pudo completar la misión.';
            alert(mensaje);
        }
    };

    const filtrarMisiones = (misiones) => {
        return misiones.filter((mision) => {
            const clave = getClaveEstado(mision);

            const coincideFiltro =
                filtroActivo === 'Todas' ||
                (filtroActivo === 'En progreso' && clave === 'in_progress') ||
                (filtroActivo === 'Urgentes' && clave === 'urgent') ||
                (filtroActivo === 'Pendientes' && clave === 'pending') ||
                (filtroActivo === 'Completadas' && clave === 'done');

            const coincideBusqueda = mision.titulo.toLowerCase().includes(busqueda.toLowerCase());

            // Antes se excluían las misiones asignadas a otros compañeros — ahora se
            // muestran todas las del equipo, y cada tarjeta indica a quién está asignada.
            return coincideFiltro && coincideBusqueda;
        });
    };

    if (cargando) {
        return (
            <div>
                <Navbar />
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '90px 24px 32px', color: '#4E7276' }}>
                    Cargando misiones...
                </div>
            </div>
        );
    }

    return (
        <div>
            <Navbar />
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '90px 24px 32px' }}>
                <div style={{ marginBottom: '28px' }}>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700, margin: '0 0 6px', color: '#0F3538' }}>
                        Misiones
                    </h1>
                    <p style={{ color: '#4E7276', margin: 0 }}>Asigna misiones y completa tareas para ganar XP</p>
                </div>

                {error && (
                    <GlassCard style={{ padding: '14px 18px', marginBottom: '20px', color: '#C4453C' }}>
                        {error}
                    </GlassCard>
                )}

                <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                        <Input
                            placeholder="Buscar misiones…"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            icon={<Search size={15} />}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', flexWrap: 'wrap' }}>
                    {filtros.map((f) => (
                        <button
                            key={f}
                            onClick={() => setFiltroActivo(f)}
                            style={{
                                padding: '7px 14px', borderRadius: '999px', fontSize: '13px', fontWeight: 500,
                                cursor: 'pointer', border: 'none', transition: 'all 0.18s',
                                background: filtroActivo === f ? '#006D77' : 'rgba(15, 53, 56, 0.08)',
                                color: filtroActivo === f ? '#FFFFFF' : '#4E7276',
                            }}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {gruposEquipo.length === 0 && (
                    <GlassCard style={{ padding: '60px', textAlign: 'center' }}>
                        <Users size={40} color="#006D77" style={{ margin: '0 auto 16px', display: 'block', opacity: 0.5 }} />
                        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: '#0F3538', margin: '0 0 8px' }}>
                            No perteneces a ningún equipo todavía
                        </p>
                    </GlassCard>
                )}

                {gruposEquipo.map((grupo) => {
                    const misionesFiltradas = filtrarMisiones(grupo.misiones);
                    const miembrosEquipo = miembrosPorEquipo[grupo.equipoId] || [];

                    return (
                        <div key={grupo.equipoId} style={{ marginBottom: '36px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                                <Users size={18} color="#006D77" />
                                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 600, margin: 0, color: '#0F3538' }}>
                                    {grupo.equipoNombre}
                                </h2>
                                <span style={{ fontSize: '12px', color: '#4E7276' }}>
                                    ({misionesFiltradas.length} misión{misionesFiltradas.length !== 1 ? 'es' : ''})
                                </span>
                            </div>

                            {misionesFiltradas.length === 0 ? (
                                <GlassCard style={{ padding: '30px', textAlign: 'center' }}>
                                    <p style={{ fontSize: '13px', color: '#4E7276', margin: 0 }}>
                                        Sin misiones que coincidan con el filtro en este equipo.
                                    </p>
                                </GlassCard>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '14px' }}>
                                    {misionesFiltradas.map((mision) => {
                                        const clave = getClaveEstado(mision);
                                        const cfg = estadoConfig[clave];
                                        const isExpanded = expandidaId === mision.id;
                                        // Guardia explícita: sin esto, dos ids en null (usuarioId todavía
                                        // sin cargar + misión sin asignar) daban "true" por accidente.
                                        const esMia = Boolean(usuarioId) && Boolean(mision.usuarioAsignadoId)
                                            && String(mision.usuarioAsignadoId) === String(usuarioId);
                                        const completada = clave === 'done';
                                        const nombreAsignado = miembrosPorEquipo[grupo.equipoId]?.find(
                                            (m) => String(m.usuarioId) === String(mision.usuarioAsignadoId)
                                        )?.nombre;

                                        return (
                                            <GlassCard
                                                key={mision.id}
                                                style={{ padding: '20px', cursor: 'pointer', opacity: completada ? 0.75 : 1 }}
                                                onClick={() => setExpandidaId(isExpanded ? null : mision.id)}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                                    <div style={{
                                                        width: 36, height: 36, borderRadius: '10px',
                                                        background: 'rgba(0, 109, 119, 0.2)', border: '1px solid rgba(0, 109, 119, 0.3)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                    }}>
                                                        <cfg.icon size={17} color={cfg.iconColor} />
                                                    </div>
                                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 600, color: '#006D77' }}>
                                                        +{mision.xpValor} XP
                                                    </div>
                                                </div>

                                                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 600, margin: '0 0 4px', color: '#0F3538' }}>
                                                    {mision.titulo}
                                                </h3>
                                                {mision.descripcion && (
                                                    <p style={{ color: '#4E7276', fontSize: '12px', margin: '0 0 14px' }}>
                                                        {mision.descripcion}
                                                    </p>
                                                )}

                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                                                    <Badge variant={cfg.variant}>{cfg.label}</Badge>
                                                    <span style={{ fontSize: '11px', color: '#4E7276' }}>
                                                        {!mision.usuarioAsignadoId
                                                            ? 'Sin asignar'
                                                            : esMia
                                                                ? 'Asignada a ti'
                                                                : nombreAsignado
                                                                    ? `Asignada a ${nombreAsignado}`
                                                                    : 'Asignada a otro miembro'}
                                                    </span>
                                                </div>

                                                {isExpanded && (
                                                    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(15,53,56,0.08)' }} onClick={(e) => e.stopPropagation()}>
                                                        {!completada && (
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                                    <select
                                                                        style={{
                                                                            flex: 1, padding: '8px', borderRadius: '8px',
                                                                            background: 'rgba(26, 37, 48, 0.6)', color: '#0F3538',
                                                                            border: '1px solid rgba(0, 109, 119, 0.4)', fontSize: '13px'
                                                                        }}
                                                                        value={usuarioSeleccionado[mision.id] || ''}
                                                                        onChange={(e) => setUsuarioSeleccionado({ ...usuarioSeleccionado, [mision.id]: e.target.value })}
                                                                    >
                                                                        <option value="">Seleccionar miembro...</option>
                                                                        {miembrosEquipo.map((m) => (
                                                                            <option key={m.usuarioId} value={m.usuarioId}>
                                                                                {m.nombre} ({m.rol})
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                    <Button
                                                                        variant="secondary"
                                                                        size="sm"
                                                                        onClick={() => handleAsignar(mision.id, usuarioSeleccionado[mision.id])}
                                                                    >
                                                                        <UserPlus size={14} style={{ marginRight: '4px' }} /> Asignar
                                                                    </Button>
                                                                </div>

                                                                {esMia && (
                                                                    <Button variant="primary" size="sm" onClick={() => handleCompletar(mision.id)}>
                                                                        Marcar como completada
                                                                    </Button>
                                                                )}
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
                    );
                })}
            </div>
        </div>
    );
}