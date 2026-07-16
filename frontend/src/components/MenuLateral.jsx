import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './MenuLateral.css';
import iconMision from '../assets/mision-icon.png';
import iconInsignia from '../assets/insignia-icon.png';
import iconEquipo from '../assets/equipo-icon.png';


export default function MenuLateral() {
    const [abierto, setAbierto] = useState(false);
    const { logout } = useAuth();
    const navigate = useNavigate();

    const cerrar = () => setAbierto(false);

    const handleLogout = () => {
        cerrar();
        logout();
        navigate('/login');
    };

    return (
        <>
            <button className="menu-toggle" onClick={() => setAbierto(!abierto)}>
                ☰
            </button>

            {abierto && (
                <div className="menu-overlay" onClick={cerrar}>
                    <nav className="menu-panel" onClick={(e) => e.stopPropagation()}>
                        <button className="menu-close" onClick={cerrar}>✕</button>

                     
                       <Link to="/misiones" className="menu-link" onClick={cerrar}>
                            <img src={iconMision} alt="" className="menu-link-icon" /> Misiones
                        </Link>
                        <Link to="/insignias" className="menu-link" onClick={cerrar}>
                           <img src={iconInsignia} alt="" className="menu-link-icon" /> Insignias
                        </Link>
                        <Link to="/mi-equipo" className="menu-link" onClick={cerrar}>
                         <img src={iconEquipo} alt="" className="menu-link-icon" /> Mi Equipo
                        </Link>

                        <button className="menu-link menu-logout" onClick={handleLogout}>
                           Cerrar sesión
                        </button>
                    </nav>
                </div>
            )}
        </>
    );
}