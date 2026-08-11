import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, BookOpen, Zap } from 'lucide-react';
import { Button, Input } from '../components/ui';
import api from '../services/api';

const CARRERAS = [
  'Ingeniería en Sistemas',
  'Ingeniería Industrial',
  'Diseño Gráfico',
  'Administración de Empresas',
  'Ciencias de Datos',
  'Ingeniería Biomédica',
  'Arquitectura',
  'Derecho',
  'Psicología',
  'Medicina',
];

const OTRA_CARRERA = '__otra__';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', career: '', careerOtra: '', confirm: '', password: '' });
  const [errors, setErrors] = useState({});
  const [errorBackend, setErrorBackend] = useState('');
  const [cargando, setCargando] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // Si eligió "Otra", la carrera real es lo que escribió a mano.
  const carreraFinal = form.career === OTRA_CARRERA ? form.careerOtra.trim() : form.career;

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Nombre requerido';
    if (!form.email.includes('@')) e.email = 'Correo inválido';
    if (!form.career) e.career = 'Selecciona una carrera';
    if (form.career === OTRA_CARRERA && !form.careerOtra.trim()) e.careerOtra = 'Escribí el nombre de tu carrera';
    if (form.password.length < 8) e.password = 'Mínimo 8 caracteres';
    if (form.password !== form.confirm) e.confirm = 'Las contraseñas no coinciden';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorBackend('');

    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setCargando(true);

    try {
      await api.post('/auth/register', {
        nombre: form.name,
        email: form.email,
        password: form.password,
        carrera: carreraFinal,
      });
      navigate('/login');
    } catch (err) {
      const mensaje = err.response?.data?.mensaje || 'Ocurrió un error al registrarse.';
      setErrorBackend(mensaje);
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
      <div className="bg-blob bg-blob-1" />
      <div className="bg-blob bg-blob-2" />
      <div className="bg-blob bg-blob-3" />

      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '16px',
              background: '#006D77',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px',
              boxShadow: '0 0 30px rgba(0, 109, 119, 0.4)',
            }}
          >
            <Zap size={26} color="#FFFFFF" fill="#FFFFFF" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 700, margin: '0 0 6px' }}>
            Crea tu cuenta
          </h1>
          <p style={{ color: '#4E7276', fontSize: '13px', margin: 0 }}>
            Únete a miles de estudiantes que ya colaboran
          </p>
        </div>

        <div className="glass-card" style={{ padding: '32px 28px' }}>
          {errorBackend && (
            <div
              style={{
                background: 'rgba(196, 69, 60, 0.15)',
                border: '1px solid rgba(196, 69, 60, 0.35)',
                borderRadius: '10px',
                padding: '10px 14px',
                marginBottom: '16px',
                fontSize: '13px',
                color: '#C4453C',
              }}
            >
              {errorBackend}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="Nombre completo"
              type="text"
              placeholder=" Gabriela García Mendoza"
              value={form.name}
              onChange={set('name')}
              error={errors.name}
              icon={<User size={15} />}
            />
            <Input
              label="Correo institucional"
              type="email"
              placeholder="correo@universidad.net"
              value={form.email}
              onChange={set('email')}
              error={errors.email}
              icon={<Mail size={15} />}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#4E7276' }}>Carrera</label>
              <div style={{ position: 'relative' }}>
                <BookOpen
                  size={15}
                  style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#4E7276',
                    pointerEvents: 'none',
                  }}
                />
                <select
                  value={form.career}
                  onChange={set('career')}
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    background: 'rgba(15, 53, 56, 0.06)',
                    border: `1px solid ${errors.career ? 'rgba(196,69,60,0.6)' : 'rgba(15,53,56,0.15)'}`,
                    borderRadius: '12px',
                    color: form.career ? '#0F3538' : '#4E7276',
                    fontSize: '14px',
                    outline: 'none',
                    cursor: 'pointer',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                  }}
                >
                  <option value="" style={{ background: '#FFFFFF' }}>
                    Selecciona tu carrera
                  </option>
                  {CARRERAS.map((c) => (
                    <option key={c} value={c} style={{ background: '#FFFFFF' }}>
                      {c}
                    </option>
                  ))}
                  <option value={OTRA_CARRERA} style={{ background: '#FFFFFF' }}>
                    Otra (especificar)
                  </option>
                </select>
              </div>
              {errors.career && <span style={{ fontSize: '12px', color: '#C4453C' }}>{errors.career}</span>}

              {form.career === OTRA_CARRERA && (
                <Input
                  placeholder="Escribí el nombre de tu carrera"
                  value={form.careerOtra}
                  onChange={set('careerOtra')}
                  error={errors.careerOtra}
                  icon={<BookOpen size={15} />}
                  style={{ marginTop: '2px' }}
                />
              )}
            </div>
            <Input
              label="Contraseña"
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={form.password}
              onChange={set('password')}
              error={errors.password}
              icon={<Lock size={15} />}
            />
            <Input
              label="Confirmar contraseña"
              type="password"
              placeholder="Repite tu contraseña"
              value={form.confirm}
              onChange={set('confirm')}
              error={errors.confirm}
              icon={<Lock size={15} />}
            />

            {form.password.length > 0 && <PasswordStrength password={form.password} />}

            <p style={{ fontSize: '12px', color: '#4E7276', margin: '4px 0 0', textAlign: 'center', lineHeight: 1.6 }}>
              Al registrarte aceptas los{' '}
              <span style={{ color: '#006D77', cursor: 'pointer' }}>Términos de uso</span> y la{' '}
              <span style={{ color: '#006D77', cursor: 'pointer' }}>Política de privacidad</span>
            </p>

            <Button type="submit" size="lg" style={{ width: '100%' }} disabled={cargando}>
              {cargando ? 'Creando cuenta…' : 'Crear cuenta'}
            </Button>
          </form>

          <div
            style={{
              textAlign: 'center',
              marginTop: '20px',
              paddingTop: '20px',
              borderTop: '1px solid rgba(15, 53, 56, 0.08)',
            }}
          >
            <span style={{ color: '#4E7276', fontSize: '13px' }}>¿Ya tienes cuenta? </span>
           <br /> <Link to="/login" style={{ color: '#006D77', fontSize: '13px', fontWeight: 500 }}>
              Inicia sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function PasswordStrength({ password }) {
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  const labels = ['', 'Débil', 'Regular', 'Buena', 'Fuerte'];
  const colors = ['', '#C4453C', '#C97A3C', '#83C5BE', '#2F8F6F'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', gap: '4px' }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              background: i <= score ? colors[score] : 'rgba(15, 53, 56, 0.1)',
              transition: 'background 0.25s',
            }}
          />
        ))}
      </div>
      <span style={{ fontSize: '11px', color: colors[score], textAlign: 'right' }}>{labels[score]}</span>
    </div>
  );
}