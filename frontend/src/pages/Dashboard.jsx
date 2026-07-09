import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { FaMedal } from 'react-icons/fa';
import './Dashboard.css';
import favicon from '../assets/favicon.png';
import xpBadge from '../assets/badge-xp.png';
import insigniaBadge from '../assets/badge-insignia.png';
import misionBadge from '../assets/badge-mision.png';
import misionesDisponiblesIcon from '../assets/mision_disponibles.png';


export default function Dashboard() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [perfil, setPerfil] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const cargarPerfil = async () => {
            try {
                const respuesta = await api.get('/usuarios/me');
                setPerfil(respuesta.data);
            } catch (err) {
                setError('No se pudo cargar tu perfil.');
            } finally {
                setCargando(false);
            }
        };

        cargarPerfil();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleGanarXp = async () => {
        try {
            const respuesta = await api.post('/xp/otorgar', {
                cantidad: 50,
                motivo: 'Prueba'
            });

            setPerfil((prev) => ({
                ...prev,
                ...respuesta.data
            }));
        } catch (err) {
            console.error('Error al otorgar XP:', err);
        }
    };

    if (cargando) {
        return <div className="dashboard-loading">Cargando...</div>;
    }

    if (error || !perfil) {
        return (
            <div className="dashboard-loading">
                <p>{error || 'Ocurrió un error.'}</p>
                <button className="logout-btn" onClick={handleLogout}>
                    Cerrar sesión
                </button>
            </div>
        );
    }

    return (
        <div className="dashboard-wrapper">
            <nav className="navbar">
                <div className="navbar-brand">
                    <img src={favicon} alt="SkillLink" className="brand-icon-img" />
                    <span className="brand-name">SkillLink</span>
                </div>

                <button className="logout-btn" onClick={handleLogout}>
                    Cerrar sesión
                </button>
            </nav>

            <main className="dashboard-content">

                <section className="welcome-section">
                    <h1>¡Hola, {perfil.nombre.split(' ')[0]}! 🌟</h1>

                    {perfil.carrera && (
                        <p className="carrera-tag">
                            {perfil.carrera}
                        </p>
                    )}
                </section>

                <section className="level-card">

                    <div className="level-card-top">
                        <div className="nivel-circle">
                            <span className="nivel-numero">
                                {perfil.nivel}
                            </span>
                        </div>

                        <div className="level-info">
                            <span className="level-label">
                                {perfil.titulo}
                            </span>

                            <span className="level-xp">
                                {perfil.xp} XP acumulado
                            </span>
                        </div>
                    </div>

                    <div className="xp-bar-container">
                        <div
                            className="xp-bar-fill"
                            style={{ width: `${perfil.progreso}%` }}
                        />
                    </div>

                    <p className="xp-remaining">
                        {perfil.xpRestante > 0
                            ? `Te faltan ${perfil.xpRestante} XP para el siguiente nivel`
                            : '¡Nivel completo!'}
                    </p>

                    <button
                        className="test-xp-btn"
                        onClick={handleGanarXp}
                    >
                        + Ganar 50 XP (prueba)
                    </button>

                </section>

                <section className="stats-grid">

                    <div className="stat-card">
                         <img src={xpBadge} alt="XP" className="stat-icon-img" />
                        <span className="stat-value">{perfil.xp}</span>
                        <span className="stat-label">XP Total</span>
                    </div>

                   <div className="stat-card">
                         <img src={insigniaBadge} alt="Insignias" className="stat-icon-img" />
                        <span className="stat-value">{perfil.insigniasDesbloqueadas}</span>
                        <span className="stat-label">Insignias</span>
                    </div>

                    <div className="stat-card">
                         <img src={misionBadge} alt="Misiones completadas" className="stat-icon-img" />
                        <span className="stat-value">{perfil.misionesCompletadas}</span>
                        <span className="stat-label">
                            Misiones completadas
                        </span>
                    </div>

                </section>

                <Link to="/misiones" className="misiones-link">
                    <img src={misionesDisponiblesIcon} alt="" className="misiones-link-icon" />
                    Ver misiones disponibles
                </Link>

            </main>
        </div>
    );
}