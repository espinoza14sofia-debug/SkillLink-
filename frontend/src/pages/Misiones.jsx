import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import './Misiones.css';
import favicon from '../assets/favicon.png';
import iconDisponible from '../assets/mision_disponible.png';
import iconAsignada from '../assets/mision_asignada.png';
import iconCompletada from '../assets/mision_completada.png';

export default function Misiones() {
    const [misiones, setMisiones] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [usuarioId, setUsuarioId] = useState(null);
    const navigate = useNavigate();

    const cargarMisiones = async () => {
        try {
            const respuesta = await api.get('/misiones');
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
    }, []);

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

    if (cargando) {
        return <div className="misiones-loading">Cargando misiones...</div>;
    }

    // Devuelve el ícono y el texto según el estado de la misión
    const getEstadoInfo = (mision, esMia, sinAsignar, completada) => {
        if (completada) {
            return { icon: iconCompletada, texto: 'Completada' };
        }
        if (esMia) {
            return { icon: iconAsignada, texto: 'Asignada a ti' };
        }
        if (sinAsignar) {
            return { icon: iconDisponible, texto: 'Disponible' };
        }
        // Asignada a otro usuario: no hay ícono propio, se mantiene el emoji
        return { icon: null, texto: '🔒 Asignada a otro' };
    };

    return (
        <div className="misiones-wrapper">
            <nav className="navbar">
                <div className="navbar-brand">
                    <img src={favicon} alt="SkillLink" className="brand-icon-img" />
                    <span className="brand-name">SkillLink</span>
                </div>
                <Link to="/dashboard" className="back-link">← Volver al Dashboard</Link>
            </nav>

            <main className="misiones-content">
                <h1>Misiones disponibles</h1>

                {error && <p className="error-msg">{error}</p>}

                {misiones.length === 0 && !error && (
                    <p className="empty-msg">No hay misiones disponibles todavía.</p>
                )}

                <div className="misiones-list">
                    {misiones.map((mision) => {
                        const esMia = mision.usuarioAsignadoId === usuarioId;
                        const sinAsignar = !mision.usuarioAsignadoId;
                        const completada = mision.estado === 'completada';
                        const { icon, texto } = getEstadoInfo(mision, esMia, sinAsignar, completada);

                        return (
                            <div key={mision.id} className={`mision-card ${completada ? 'completada' : ''}`}>
                                <div className="mision-header">
                                    <h3>{mision.titulo}</h3>
                                    <span className="mision-xp">+{mision.xpValor} XP</span>
                                </div>
                                {mision.descripcion && <p className="mision-desc">{mision.descripcion}</p>}

                                <div className="mision-footer">
                                    <span className={`mision-estado estado-${mision.estado}`}>
                                        {icon && <img src={icon} alt="" className="estado-icon" />}
                                        {texto}
                                    </span>

                                    {!completada && sinAsignar && (
                                        <button className="btn-asignar" onClick={() => handleAsignar(mision.id)}>
                                            Tomar misión
                                        </button>
                                    )}

                                    {!completada && esMia && (
                                        <button className="btn-completar" onClick={() => handleCompletar(mision.id)}>
                                            Marcar como completada
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}