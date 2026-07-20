import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Zap, Eye, EyeOff } from 'lucide-react';
import { Button, Input } from '../components/ui';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Completa todos los campos.');
      return;
    }

    setCargando(true);
    try {
      const respuesta = await api.post('/auth/login', { email, password });
      const { token, usuario } = respuesta.data;
      login(token, usuario);
      navigate('/dashboard');
    } catch (err) {
      const mensaje = err.response?.data?.mensaje || 'Credenciales inválidas.';
      setError(mensaje);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
      }}
    >
      {/* Blobs decorativos */}
      <div className="bg-blob bg-blob-1" />
      <div className="bg-blob bg-blob-2" />
      <div className="bg-blob bg-blob-3" />

      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '16px',
              background: '#415A77',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 0 30px rgba(65, 90, 119, 0.4)',
            }}
          >
            <Zap size={28} color="#E0E1DD" fill="#E0E1DD" />
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '28px',
              fontWeight: 700,
              margin: '0 0 6px',
              color: '#E0E1DD',
            }}
          >
            SkillLink
          </h1>
          <p style={{ color: '#778DA9', margin: 0, fontSize: '14px' }}>
            Colabora, aprende y sube de nivel
          </p>
        </div>

        {/* Card */}
        <div className="glass-card" style={{ padding: '36px 32px' }}>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '20px',
              fontWeight: 600,
              margin: '0 0 6px',
            }}
          >
            Bienvenido de vuelta
          </h2>
          <p style={{ color: '#778DA9', fontSize: '13px', margin: '0 0 28px' }}>
            Inicia sesión para continuar tu aventura
          </p>

          {error && (
            <div
              style={{
                background: 'rgba(124, 58, 58, 0.15)',
                border: '1px solid rgba(124, 58, 58, 0.35)',
                borderRadius: '10px',
                padding: '10px 14px',
                marginBottom: '20px',
                fontSize: '13px',
                color: '#c97070',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <Input
              label="Correo electrónico"
              type="email"
              placeholder="correo@universidad.net"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={15} />}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <Input
                label="Contraseña"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock size={15} />}
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#778DA9',
                  fontSize: '12px',
                  alignSelf: 'flex-end',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: 0,
                }}
              >
                {showPass ? <EyeOff size={13} /> : <Eye size={13} />}
                {showPass ? 'Ocultar' : 'Ver'} contraseña
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-8px' }}>
              <Link
                to="/recuperar-password"
                style={{ fontSize: '13px', color: '#778DA9', textDecoration: 'none' }}
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <Button type="submit" size="lg" style={{ width: '100%', marginTop: '4px' }} disabled={cargando}>
              {cargando ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <LoadingDots />
                  Iniciando sesión…
                </span>
              ) : (
                'Iniciar sesión'
              )}
            </Button>
          </form>

          <div
            style={{
              textAlign: 'center',
              marginTop: '24px',
              paddingTop: '24px',
              borderTop: '1px solid rgba(224, 225, 221, 0.08)',
            }}
          >
            <span style={{ color: '#778DA9', fontSize: '13px' }}>¿No tienes cuenta? </span>
            <Link to="/register" style={{ color: '#9db5cc', fontSize: '13px', fontWeight: 500 }}>
            <br /> 
             Regístrate gratis
              
            </Link>
          </div>
        </div>

        <p style={{ textAlign: 'center', color: '#415A77', fontSize: '12px', marginTop: '24px' }}>
     
          Plataforma de aprendizaje colaborativo
        </p>
      </div>
    </div>
  );
}

function LoadingDots() {
  return (
    <span style={{ display: 'inline-flex', gap: '3px' }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: '#E0E1DD',
            animation: `shimmer 1s ease-in-out ${i * 0.15}s infinite alternate`,
            display: 'inline-block',
          }}
        />
      ))}
    </span>
  );
}