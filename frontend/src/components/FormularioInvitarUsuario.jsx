import { useState } from 'react';
import { UserPlus, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button, GlassCard } from './ui';
import api from '../services/api';

export default function FormularioInvitarUsuario({ equipoId, onInvitacionEnviada }) {
  const [emailOUsername, setEmailOUsername] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  const handleInvitar = async (e) => {
    e.preventDefault();
    if (!emailOUsername.trim()) return;

    setCargando(true);
    setMensaje({ tipo: '', texto: '' });

    try {
      await api.post(`/equipos/${equipoId}/invitaciones`, {
        emailOUsername: emailOUsername.trim()
      });

      setMensaje({ tipo: 'exito', texto: '¡Invitación enviada con éxito!' });
      setEmailOUsername('');
      if (onInvitacionEnviada) onInvitacionEnviada();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data || 'No se pudo enviar la invitación.';
      setMensaje({ tipo: 'error', texto: typeof errorMsg === 'string' ? errorMsg : 'Error al enviar invitación.' });
    } finally {
      setCargando(false);
    }
  };

  return (
    <form onSubmit={handleInvitar} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <UserPlus size={16} color="#778DA9" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Correo o nombre de usuario..."
            value={emailOUsername}
            onChange={(e) => setEmailOUsername(e.target.value)}
            disabled={cargando}
            style={{
              width: '100%',
              background: 'rgba(224, 225, 221, 0.06)',
              border: '1px solid rgba(224, 225, 221, 0.15)',
              borderRadius: '10px',
              padding: '10px 12px 10px 38px',
              color: '#E0E1DD',
              fontSize: '13px',
              outline: 'none',
              fontFamily: 'var(--font-body)',
            }}
          />
        </div>
        <Button
          type="submit"
          variant="glass"
          disabled={cargando || !emailOUsername.trim()}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}
        >
          <Send size={14} />
          {cargando ? 'Enviando...' : 'Invitar'}
        </Button>
      </div>

      {mensaje.texto && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            color: mensaje.tipo === 'exito' ? '#4ade80' : '#f87171',
          }}
        >
          {mensaje.tipo === 'exito' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
          <span>{mensaje.texto}</span>
        </div>
      )}
    </form>
  );
}