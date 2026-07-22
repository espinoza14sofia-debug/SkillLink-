import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Crown, ChevronRight } from 'lucide-react';
import { GlassCard, EmptyState } from '../components/ui';
import Navbar from '../components/Navbar';
import FormularioCrearEquipo from '../components/FormularioCrearEquipo';
import api from '../services/api';

export default function MisEquipos() {
  const navigate = useNavigate();
  const [equipos, setEquipos] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargarEquipos = async () => {
    try {
      const { data } = await api.get('/equipos/mios');
      setEquipos(data);
    } catch {
      setEquipos([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarEquipos(); }, []);

  const seleccionarEquipo = (id) => {
    localStorage.setItem('equipoId', id);
    navigate('/mi-equipo');
  };

  const handleEquipoCreado = (id) => {
    localStorage.setItem('equipoId', id);
    navigate('/mi-equipo');
  };

  if (cargando) {
    return (
      <div>
        <Navbar />
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '90px 24px 32px' }}>
          <div className="skeleton" style={{ height: 300, borderRadius: 16 }} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '90px 24px 32px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700, margin: '0 0 24px' }}>
          Mis Equipos
        </h1>

        {equipos.length === 0 ? (
          <GlassCard style={{ padding: '48px 24px' }}>
            <EmptyState
              icon={<Users size={52} />}
              title="Aún no perteneces a ningún equipo"
              desc="Crea tu propio equipo para empezar a colaborar."
              action={
                <div style={{ maxWidth: '340px', margin: '0 auto' }}>
                  <FormularioCrearEquipo onCreado={handleEquipoCreado} />
                </div>
              }
            />
          </GlassCard>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {equipos.map((eq) => (
              <div
                key={eq.id}
                className="glass-nested hover-lift"
                style={{ padding: '18px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                onClick={() => seleccionarEquipo(eq.id)}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 600, margin: 0, color: '#E0E1DD' }}>
                      {eq.nombre}
                    </h3>
                    {eq.rol === 'Lider' && <Crown size={13} color="#c49a3f" />}
                  </div>
                  <span style={{ fontSize: '12px', color: '#778DA9' }}>
                    {eq.cantidadMiembros} {eq.cantidadMiembros === 1 ? 'miembro' : 'miembros'} · {eq.rol}
                  </span>
                </div>
                <ChevronRight size={16} color="#415A77" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}