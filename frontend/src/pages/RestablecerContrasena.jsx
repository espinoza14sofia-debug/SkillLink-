import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';
import { GlassCard, Button } from '../components/ui';
import api from '../services/api';

export default function RestablecerContrasena() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [exito, setExito] = useState(false);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (nuevaPassword !== confirmar) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (nuevaPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setCargando(true);
    try {
      await api.post('/auth/restablecer-password', { token, nuevaPassword });
      setExito(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo restablecer la contraseña. El enlace puede haber expirado.');
    } finally {
      setCargando(false);
    }
  };

  if (!token) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <GlassCard style={{ padding: '32px', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <p style={{ color: '#c97070', fontSize: '14px' }}>
            Enlace inválido o incompleto. Solicita uno nuevo.
          </p>
          <Link to="/olvide-contrasena" style={{ color: '#778DA9', fontSize: '13px' }}>
            Solicitar recuperación
          </Link>
        </GlassCard>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <GlassCard style={{ padding: '32px', width: '100%', maxWidth: '400px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, margin: '0 0 6px' }}>
          Nueva contraseña
        </h1>

        {exito ? (
          <p style={{ color: '#6db384', fontSize: '14px' }}>
            Contraseña restablecida correctamente. Redirigiendo al inicio de sesión…
          </p>
        ) : (
          <>
            <p style={{ color: '#778DA9', fontSize: '13px', margin: '0 0 20px' }}>
              Ingresa tu nueva contraseña.
            </p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#778DA9' }} />
                <input
                  type="password"
                  value={nuevaPassword}
                  onChange={(e) => setNuevaPassword(e.target.value)}
                  placeholder="Nueva contraseña"
                  required
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 12px 10px 36px',
                    background: 'rgba(224,225,221,0.06)',
                    border: '1px solid rgba(224,225,221,0.15)',
                    borderRadius: '8px',
                    color: '#E0E1DD',
                    fontSize: '14px',
                  }}
                />
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#778DA9' }} />
                <input
                  type="password"
                  value={confirmar}
                  onChange={(e) => setConfirmar(e.target.value)}
                  placeholder="Confirmar contraseña"
                  required
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 12px 10px 36px',
                    background: 'rgba(224,225,221,0.06)',
                    border: '1px solid rgba(224,225,221,0.15)',
                    borderRadius: '8px',
                    color: '#E0E1DD',
                    fontSize: '14px',
                  }}
                />
              </div>
              <Button variant="primary" type="submit" disabled={cargando}>
                {cargando ? 'Restableciendo…' : 'Restablecer contraseña'}
              </Button>
              {error && <p style={{ color: '#c97070', fontSize: '12px', margin: 0 }}>{error}</p>}
            </form>
          </>
        )}

        <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#778DA9', fontSize: '13px', marginTop: '20px', textDecoration: 'none' }}>
          <ArrowLeft size={14} /> Volver a iniciar sesión
        </Link>
      </GlassCard>
    </div>
  );
}