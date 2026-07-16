import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Insignias.css';
import favicon from '../assets/favicon.png';

export default function Insignias() {
  const { user } = useAuth();
  const [logros, setLogros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarLogros = async () => {
      try {
        const { data } = await api.get(`/usuarios/${user.id}/logros`);
        setLogros(data);
      } catch (err) {
        setError('No se pudieron cargar las insignias.');
      } finally {
        setCargando(false);
      }
    };

    if (user?.id) cargarLogros();
  }, [user]);

  return (
    <div className="insignias-wrapper">
      <nav className="navbar">
        <div className="navbar-brand">
          <img src={favicon} alt="SkillLink" className="brand-icon-img" />
          <span className="brand-name">SkillLink</span>
        </div>
        <Link to="/dashboard" className="back-link">← Volver al Dashboard</Link>
      </nav>

      <main className="insignias-content">
        <h1>Mis Insignias</h1>

        {cargando && <p className="insignias-mensaje">Cargando insignias...</p>}
        {error && <p className="insignias-mensaje error">{error}</p>}

        {!cargando && !error && (
          <div className="insignias-grid">
            {logros.map((logro) => (
              <div
                key={logro.id}
                className={`insignia-card ${logro.desbloqueado ? '' : 'bloqueada'}`}
              >
                <div className="insignia-icono">
                  {logro.desbloqueado ? '🏅' : '🔒'}
                </div>
                <h3>{logro.nombre}</h3>
                {logro.descripcion && <p className="insignia-condicion">{logro.descripcion}</p>}
                {logro.desbloqueado ? (
                  <span className="insignia-estado desbloqueada">
                    Desbloqueada {logro.fechaObtenido && `· ${new Date(logro.fechaObtenido).toLocaleDateString()}`}
                  </span>
                ) : (
                  <span className="insignia-estado bloqueada-texto">Bloqueada</span>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}