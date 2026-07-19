import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import './NotificacionesBell.css';

export default function NotificacionesBell() {
    const [abierto, setAbierto] = useState(false);
    const [notificaciones, setNotificaciones] = useState([]);
    const [noLeidas, setNoLeidas] = useState(0);
    const [cargando, setCargando] = useState(false);
    const panelRef = useRef(null);

    const cargarConteo = async () => {
        try {
            const { data } = await api.get('/notificaciones/no-leidas/conteo');
            setNoLeidas(data.conteo);
        } catch (err) {
            console.error('Error al cargar conteo de notificaciones:', err);
        }
    };

    const cargarNotificaciones = async () => {
        setCargando(true);
        try {
            const { data } = await api.get('/notificaciones');
            setNotificaciones(data);
        } catch (err) {
            console.error('Error al cargar notificaciones:', err);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarConteo();
        const interval = setInterval(cargarConteo, 30000); // refresca cada 30s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickFuera = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                setAbierto(false);
            }
        };
        document.addEventListener('mousedown', handleClickFuera);
        return () => document.removeEventListener('mousedown', handleClickFuera);
    }, []);

    const toggleAbierto = () => {
        const nuevoEstado = !abierto;
        setAbierto(nuevoEstado);
        if (nuevoEstado) cargarNotificaciones();
    };

    const marcarComoLeida = async (id) => {
        try {
            await api.put(`/notificaciones/${id}/leer`);
            setNotificaciones((prev) =>
                prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
            );
            setNoLeidas((prev) => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Error al marcar notificación como leída:', err);
        }
    };

    const marcarTodasComoLeidas = async () => {
        try {
            await api.put('/notificaciones/leer-todas');
            setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
            setNoLeidas(0);
        } catch (err) {
            console.error('Error al marcar todas como leídas:', err);
        }
    };

    return (
        <div className="notificaciones-bell" ref={panelRef}>
            <button className="notificaciones-toggle" onClick={toggleAbierto}>
                🔔
                {noLeidas > 0 && <span className="notificaciones-badge">{noLeidas}</span>}
            </button>

            {abierto && (
                <div className="notificaciones-panel">
                    <div className="notificaciones-header">
                        <span>Notificaciones</span>
                        {noLeidas > 0 && (
                            <button className="notificaciones-marcar-todas" onClick={marcarTodasComoLeidas}>
                                Marcar todas como leídas
                            </button>
                        )}
                    </div>

                    {cargando && <p className="notificaciones-vacio">Cargando...</p>}

                    {!cargando && notificaciones.length === 0 && (
                        <p className="notificaciones-vacio">No tienes notificaciones.</p>
                    )}

                    <ul className="notificaciones-lista">
                        {notificaciones.map((n) => (
                            <li
                                key={n.id}
                                className={`notificacion-item ${n.leida ? '' : 'no-leida'}`}
                                onClick={() => !n.leida && marcarComoLeida(n.id)}
                            >
                                <span className="notificacion-tipo">{n.tipo}</span>
                                <span className="notificacion-mensaje">{n.mensaje}</span>
                                <span className="notificacion-fecha">
                                    {new Date(n.fecha).toLocaleString()}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
