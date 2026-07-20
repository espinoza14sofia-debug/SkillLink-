/* ── Button ── */
export function Button({ variant = 'primary', size = 'md', children, style, ...props }) {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontFamily: 'var(--font-body)',
    fontWeight: 500,
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
      background: '#415A77',
      color: '#E0E1DD',
    },
    glass: {
      background: 'rgba(224, 225, 221, 0.08)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      border: '1px solid rgba(65, 90, 119, 0.6)',
      color: '#E0E1DD',
    },
    ghost: {
      background: 'transparent',
      border: '1px solid rgba(224, 225, 221, 0.15)',
      color: '#778DA9',
    },
    danger: {
      background: 'rgba(124, 58, 58, 0.4)',
      border: '1px solid rgba(124, 58, 58, 0.6)',
      color: '#E0E1DD',
    },
  }

  return (
    <button
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
      onMouseEnter={e => {
        const el = e.currentTarget
        if (variant === 'primary') el.style.background = '#4d6b8a'
        else if (variant === 'glass') el.style.background = 'rgba(224, 225, 221, 0.14)'
        else if (variant === 'ghost') el.style.color = '#E0E1DD'
        else if (variant === 'danger') el.style.background = 'rgba(124, 58, 58, 0.6)'
        el.style.transform = 'translateY(-1px)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget
        if (variant === 'primary') el.style.background = '#415A77'
        else if (variant === 'glass') el.style.background = 'rgba(224, 225, 221, 0.08)'
        else if (variant === 'ghost') el.style.color = '#778DA9'
        else if (variant === 'danger') el.style.background = 'rgba(124, 58, 58, 0.4)'
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
        <label style={{ fontSize: '13px', fontWeight: 500, color: '#778DA9', letterSpacing: '0.02em' }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {icon && (
          <span style={{
            position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
            color: '#778DA9', display: 'flex', alignItems: 'center',
          }}>
            {icon}
          </span>
        )}
        <input
          style={{
            width: '100%',
            background: 'rgba(224, 225, 221, 0.06)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: `1px solid ${error ? 'rgba(124, 58, 58, 0.6)' : 'rgba(224, 225, 221, 0.15)'}`,
            borderRadius: '12px',
            padding: icon ? '12px 14px 12px 42px' : '12px 14px',
            color: '#E0E1DD',
            fontSize: '14px',
            outline: 'none',
            fontFamily: 'var(--font-body)',
            transition: 'border-color 0.18s, box-shadow 0.18s',
            ...style,
          }}
          onFocus={e => {
            e.currentTarget.style.borderColor = '#415A77'
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(65, 90, 119, 0.25)'
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = error ? 'rgba(124, 58, 58, 0.6)' : 'rgba(224, 225, 221, 0.15)'
            e.currentTarget.style.boxShadow = 'none'
          }}
          {...props}
        />
      </div>
      {error && <span style={{ fontSize: '12px', color: '#c97070' }}>{error}</span>}
    </div>
  )
}

/* ── Badge/Pill ── */
const badgeColors = {
  neutral: { bg: 'rgba(119, 141, 169, 0.15)', color: '#a0b5c8', border: 'rgba(119, 141, 169, 0.3)' },
  success: { bg: 'rgba(74, 124, 89, 0.15)', color: '#6db384', border: 'rgba(74, 124, 89, 0.35)' },
  warning: { bg: 'rgba(138, 106, 46, 0.15)', color: '#c49a3f', border: 'rgba(138, 106, 46, 0.35)' },
  error:   { bg: 'rgba(124, 58, 58, 0.15)',  color: '#c97070', border: 'rgba(124, 58, 58, 0.35)' },
  accent:  { bg: 'rgba(65, 90, 119, 0.25)',   color: '#9db5cc', border: 'rgba(65, 90, 119, 0.5)' },
}

export function Badge({ variant = 'neutral', children, style }) {
  const c = badgeColors[variant]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 500,
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
          {label && <span style={{ fontSize: '12px', color: '#778DA9' }}>{label}</span>}
          {showValues && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#778DA9' }}>
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
  bronze:  'rgba(139, 90, 43, 0.8)',
  silver:  'rgba(160, 181, 200, 0.8)',
  gold:    'rgba(196, 154, 63, 0.85)',
  diamond: 'rgba(119, 141, 169, 0.9)',
}

export function Avatar({ src, name, size = 40, ring = 'none', level }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const ringColor = ringColors[ring]
  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      <div style={{
        width: size, height: size, borderRadius: '50%',
        border: `2px solid ${ringColor}`,
        boxShadow: ring !== 'none' ? `0 0 12px ${ringColor}` : 'none',
        overflow: 'hidden', flexShrink: 0,
        background: '#1B263B',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {src ? (
          <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 600,
            fontSize: size * 0.35, color: '#778DA9',
          }}>{initials}</span>
        )}
      </div>
      {level !== undefined && (
        <div style={{
          position: 'absolute', bottom: -2, right: -2,
          width: 18, height: 18, borderRadius: '50%',
          background: '#415A77', border: '2px solid #0D1B2A',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-mono)', fontSize: '9px', fontWeight: 600, color: '#E0E1DD',
        }}>{level}</div>
      )}
    </div>
  )
}

/* ── Glass Card wrapper ── */
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
    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 600, color: '#E0E1DD', margin: 0 }}>
      {children}
    </h2>
  )
}

/* ── Empty state ── */
export function EmptyState({ icon, title, desc, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
      <div style={{ color: '#415A77', opacity: 0.7 }}>{icon}</div>
      <div>
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '16px', color: '#E0E1DD', margin: '0 0 6px' }}>{title}</p>
        <p style={{ color: '#778DA9', fontSize: '14px', margin: 0 }}>{desc}</p>
      </div>
      {action}
    </div>
  )
}