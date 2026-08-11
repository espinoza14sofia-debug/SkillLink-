/* ── Button ──
   Jerarquía visual clara y con un único color por función:
   primary  → color-primary (Deep Teal): la acción principal de la pantalla
   accent   → color-accent (Terracotta): acciones destacadas, no destructivas
   secondary→ color-secondary sobre superficie clara: acción secundaria con presencia
   ghost    → sin relleno: acciones terciarias, no compiten visualmente
   danger   → rojo semántico: únicamente acciones destructivas
*/
export function Button({ variant = 'primary', size = 'md', children, style, ...props }) {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontFamily: 'var(--font-body)',
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    outline: 'none',
    transition: 'all 0.18s ease',
    whiteSpace: 'nowrap',
  }

  const sizes = {
    sm: { padding: '8px 14px', fontSize: '12px', borderRadius: '10px' },
    md: { padding: '11px 20px', fontSize: '14px', borderRadius: '12px' },
    lg: { padding: '14px 28px', fontSize: '15px', borderRadius: '14px' },
  }

  const variants = {
    primary: {
      background: 'var(--color-primary)',
      color: '#FFFFFF',
      boxShadow: '0 2px 8px rgba(0,109,119,0.25)',
    },
    accent: {
      background: 'var(--color-accent)',
      color: '#FFFFFF',
      boxShadow: '0 2px 8px rgba(226,149,120,0.3)',
    },
    secondary: {
      background: 'var(--color-secondary)',
      color: '#0F3538',
    },
    glass: {
      background: 'var(--surface)',
      border: '1px solid var(--border-strong)',
      color: 'var(--color-primary)',
    },
    ghost: {
      background: 'transparent',
      border: '1px solid var(--border-strong)',
      color: 'var(--text-secondary)',
    },
    danger: {
      background: 'var(--error-light)',
      border: '1px solid rgba(196, 69, 60, 0.35)',
      color: 'var(--error)',
    },
  }

  const hoverBg = {
    primary: '#00565E',
    accent: '#CE7E5E',
    secondary: '#6DB3AB',
    glass: 'var(--surface-soft)',
    ghost: 'var(--surface-soft)',
    danger: '#F6D3D0',
  }

  return (
    <button
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
      onMouseEnter={e => {
        const el = e.currentTarget
        el.style.background = hoverBg[variant]
        if (variant === 'ghost') el.style.color = 'var(--color-primary)'
        el.style.transform = 'translateY(-1px)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget
        el.style.background = variants[variant].background
        if (variant === 'ghost') el.style.color = 'var(--text-secondary)'
        el.style.transform = 'translateY(0)'
      }}
      {...props}
    >
      {children}
    </button>
  )
}

/* ── Input ── */
export function Input({ label, error, icon, style, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && (
        <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', letterSpacing: '0.02em' }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {icon && (
          <span style={{
            position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
          }}>
            {icon}
          </span>
        )}
        <input
          style={{
            width: '100%',
            background: 'var(--surface-soft)',
            border: `1px solid ${error ? 'var(--error)' : 'var(--border-strong)'}`,
            borderRadius: '12px',
            padding: icon ? '12px 14px 12px 42px' : '12px 14px',
            color: 'var(--text-primary)',
            fontSize: '14px',
            outline: 'none',
            fontFamily: 'var(--font-body)',
            transition: 'border-color 0.18s, box-shadow 0.18s',
            ...style,
          }}
          onFocus={e => {
            e.currentTarget.style.borderColor = 'var(--color-primary)'
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,109,119,0.15)'
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = error ? 'var(--error)' : 'var(--border-strong)'
            e.currentTarget.style.boxShadow = 'none'
          }}
          {...props}
        />
      </div>
      {error && <span style={{ fontSize: '12px', color: 'var(--error)' }}>{error}</span>}
    </div>
  )
}

/* ── Badge/Pill ──
   Cada variante tiene un único rol semántico consistente en toda la app. */
const badgeColors = {
  neutral: { bg: 'var(--surface-soft)', color: 'var(--text-secondary)', border: 'var(--border-strong)' },
  success: { bg: 'var(--success-light)', color: 'var(--success)', border: 'rgba(47,143,111,0.3)' },
  warning: { bg: 'var(--color-accent-soft)', color: '#9C5A3C', border: 'rgba(226,149,120,0.4)' },
  error:   { bg: 'var(--error-light)', color: 'var(--error)', border: 'rgba(196,69,60,0.3)' },
  accent:  { bg: 'rgba(0,109,119,0.1)', color: 'var(--color-primary)', border: 'rgba(0,109,119,0.25)' },
  secondary: { bg: 'rgba(131,197,190,0.22)', color: '#0F5A54', border: 'rgba(131,197,190,0.5)' },
}

export function Badge({ variant = 'neutral', children, style }) {
  const c = badgeColors[variant]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 600,
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
      whiteSpace: 'nowrap', ...style,
    }}>
      {children}
    </span>
  )
}

/* ── XP Progress Bar ── */
export function XPBar({ value, max, label, showValues = false }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {(label || showValues) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {label && <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{label}</span>}
          {showValues && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>
              {value.toLocaleString()} / {max.toLocaleString()} XP
            </span>
          )}
        </div>
      )}
      <div className="xp-track">
        <div className="xp-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

/* ── Avatar ── */
const ringColors = {
  none:    'transparent',
  bronze:  '#C97A3C',
  silver:  'var(--color-secondary)',
  gold:    'var(--color-accent)',
  diamond: 'var(--color-primary)',
}

export function Avatar({ src, name, size = 40, ring = 'none', level }) {
  const initials = (name || '').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const ringColor = ringColors[ring]
  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      <div style={{
        width: size, height: size, borderRadius: '50%',
        border: `2px solid ${ringColor}`,
        boxShadow: ring !== 'none' ? `0 0 0 3px ${ringColor}22` : 'none',
        overflow: 'hidden', flexShrink: 0,
        background: 'var(--color-secondary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {src ? (
          <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 600,
            fontSize: size * 0.35, color: '#0F5A54',
          }}>{initials}</span>
        )}
      </div>
      {level !== undefined && (
        <div style={{
          position: 'absolute', bottom: -2, right: -2,
          width: 18, height: 18, borderRadius: '50%',
          background: 'var(--color-primary)', border: '2px solid var(--surface)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-mono)', fontSize: '9px', fontWeight: 600, color: '#FFFFFF',
        }}>{level}</div>
      )}
    </div>
  )
}

/* ── Card ── (mantiene el nombre GlassCard por compatibilidad con el resto del código;
   visualmente ya no es "glass": es una tarjeta plana, blanca, con borde suave y sombra ligera) */
export function GlassCard({ children, style, className = '', onClick }) {
  return (
    <div className={`glass-card ${className}`} style={style} onClick={onClick}>
      {children}
    </div>
  )
}

/* ── Section title ── */
export function SectionTitle({ children }) {
  return (
    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
      {children}
    </h2>
  )
}

/* ── Empty state ── */
export function EmptyState({ icon, title, desc, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
      <div style={{ color: 'var(--color-secondary)' }}>{icon}</div>
      <div>
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)', margin: '0 0 6px' }}>{title}</p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>{desc}</p>
      </div>
      {action}
    </div>
  )
}
