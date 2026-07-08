import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div>
            <h1>Dashboard</h1>
            {user ? (
                <div>
                    <p>Bienvenido, {user.nombre}</p>
                    <p>Nivel: {user.nivel} — XP: {user.xp}</p>
                </div>
            ) : (
                <p>No hay sesión activa.</p>
            )}
            <button onClick={handleLogout}>Cerrar sesión</button>
        </div>
    );
}