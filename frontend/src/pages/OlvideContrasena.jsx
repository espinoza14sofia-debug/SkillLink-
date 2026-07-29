import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { GlassCard, Button } from '../components/ui';
import api from '../services/api';

export default function OlvideContrasena() {
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      await api.post('/auth/recuperar-password', { email });
      setEnviado(true);
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo procesar la solicitud.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <GlassCard style={{ padding: '32px', width: '100%', maxWidth: '400px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, margin: '0 0 6px' }}>
          Recuperar contraseña
        </h1>

        {enviado ? (
          <p style={{ color: '#778DA9', fontSize: '14px', lineHeight: 1.6 }}>
            Si el correo <strong>{email}</strong> está registrado, vas a recibir un mensaje con instrucciones para restablecer tu contraseña.
          </p>
        ) : (
          <>
            <p style={{ color: '#778DA9', fontSize: '13px', margin: '0 0 20px' }}>
              Ingresa tu correo y te enviaremos instrucciones para restablecer tu contraseña.
            </p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#778DA9' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
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
                {cargando ? 'Enviando…' : 'Enviar instrucciones'}
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