import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
    const [form, setForm] = useState({
        nombre: '',
        email: '',
        password: '',
        carrera: '',
    });
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setCargando(true);

        try {
            await api.post('/auth/register', form);
            navigate('/login');
        } catch (err) {
            const mensaje = err.response?.data?.mensaje || 'Ocurrió un error al registrarse.';
            setError(mensaje);
        } finally {
            setCargando(false);
        }
    };

    return (
        <div>
            <h1>Registro</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Nombre</label>
                    <input
                        type="text"
                        name="nombre"
                        value={form.nombre}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Contraseña</label>
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        required
                        minLength={6}
                    />
                </div>
                <div>
                    <label>Carrera</label>
                    <input
                        type="text"
                        name="carrera"
                        value={form.carrera}
                        onChange={handleChange}
                    />
                </div>

                {error && <p style={{ color: 'red' }}>{error}</p>}

                <button type="submit" disabled={cargando}>
                    {cargando ? 'Registrando...' : 'Registrarse'}
                </button>
            </form>

            <p>
                ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
            </p>
        </div>
    );
}