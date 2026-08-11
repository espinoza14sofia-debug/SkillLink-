import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, MessageSquare, GitBranch, Link2, Zap, Target, Trophy, Users, Award } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import api from "../services/api"
import Navbar from "../components/Navbar"
import { Avatar, GlassCard, XPBar, Button } from "../components/ui"

// Mismo mapeo de colores por nivel que se usa en el perfil privado (Profile.jsx)
const levelColors = {
    'Básico': '#4E7276',
    'Intermedio': '#006D77',
    'Avanzado': '#0F3538'
}

export default function PerfilPublico() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()

    const [perfil, setPerfil] = useState(null)
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState("")

    const esMiPropioPerfil = user && user.id === id

    useEffect(() => {
        const cargarPerfil = async () => {
            try {
                const { data } = await api.get(`/usuarios/${id}/perfil`)
                if (!data) {
                    setError("Este usuario no existe.")
                    return
                }

                // La posición del ranking viene de un endpoint aparte.
                // Si falla (ej. el usuario aún no tiene posición asignada), simplemente no se muestra.
                let posicionGlobal = null
                try {
                    const { data: posicionData } = await api.get(`/ranking/usuario/${id}`)
                    posicionGlobal = posicionData?.posicion ?? null
                } catch (posErr) {
                    posicionGlobal = null
                }

                setPerfil({ ...data, posicionGlobal })
            } catch (err) {
                console.error("Error al cargar perfil:", err)
                setError("No se pudo cargar este perfil.")
            } finally {
                setCargando(false)
            }
        }
        cargarPerfil()
    }, [id])

    if (cargando) {
        return (
            <div>
                <Navbar />
                <div style={{ maxWidth: "920px", margin: "0 auto", padding: "90px 24px 32px" }}>
                    <div className="skeleton" style={{ height: 260, borderRadius: 16 }} />
                </div>
            </div>
        )
    }

    if (error || !perfil) {
        return (
            <div>
                <Navbar />
                <div style={{ maxWidth: "920px", margin: "0 auto", padding: "90px 24px 32px" }}>
                    <GlassCard style={{ padding: "48px", textAlign: "center" }}>
                        <p style={{ color: "#4E7276", margin: "0 0 16px" }}>{error || "Perfil no encontrado."}</p>
                        <Button variant="ghost" onClick={() => navigate(-1)}>Volver</Button>
                    </GlassCard>
                </div>
            </div>
        )
    }

    // Campos alineados 1 a 1 con los que devuelve /usuarios/me y usa Profile.jsx
    const skills = perfil.habilidades || []
    const badges = perfil.insignias || []
    const recentMissions = perfil.misionesRecientes || [] // opcional: se oculta si el backend no lo envía
    const fotoUrl = perfil.foto

    const stats = {
        missions: perfil.misionesCompletadas ?? 0,
        rank: perfil.posicionGlobal ? `#${perfil.posicionGlobal}` : '—',
        streak: perfil.racha ?? 0,
        badges: badges.length
    }

    return (
        <div>
            <Navbar />
            <div style={{ maxWidth: '920px', margin: '0 auto', padding: '90px 24px 32px' }}>
                {/* Back */}
                <button onClick={() => navigate(-1)} style={{
                    display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none',
                    cursor: 'pointer', color: '#4E7276', fontSize: '14px', marginBottom: '24px', padding: 0,
                }}
                    onMouseEnter={e => e.currentTarget.style.color = '#0F3538'}
                    onMouseLeave={e => e.currentTarget.style.color = '#4E7276'}
                >
                    <ArrowLeft size={16} />Volver
                </button>

                {/* Hero */}
                <GlassCard style={{
                    padding: '32px', marginBottom: '20px',
                    background: 'rgba(0, 109, 119, 0.12)', border: '1px solid rgba(0, 109, 119, 0.3)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', flexWrap: 'wrap' }}>
                        {fotoUrl ? (
                            <img
                                src={fotoUrl}
                                alt="Avatar"
                                style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '2px solid #0F3538' }}
                            />
                        ) : (
                            <Avatar name={perfil.nombre || 'Usuario'} size={80} ring="silver" level={perfil.nivel || 1} />
                        )}
                        <div style={{ flex: 1, minWidth: 200 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '4px' }}>
                                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, margin: 0, color: '#0F3538' }}>
                                    {perfil.nombre || 'Sin nombre'}
                                </h1>
                            </div>
                            <p style={{ color: '#4E7276', fontSize: '13px', margin: '0 0 12px' }}>
                                Nivel {perfil.nivel || 1} · {perfil.rango || 'Principiante'}
                                {perfil.carrera ? ` · ${perfil.carrera}` : ''}
                                {perfil.semestre ? ` · Semestre ${perfil.semestre}` : ''}
                            </p>
                            <p style={{ color: '#0F3538', fontSize: '14px', margin: '0 0 16px', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                                {perfil.descripcion || 'Este usuario aún no ha agregado una biografía.'}
                            </p>
                            <XPBar value={perfil.xp || 0} max={(perfil.nivel || 1) * 1000} showValues />
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: 160 }}>
                            {!esMiPropioPerfil && (
                                <Button
                                    variant="primary"
                                    onClick={() =>
                                        navigate('/mensajes', {
                                            state: {
                                                usuarioId: perfil.id,
                                                nombre: perfil.nombre
                                            }
                                        })
                                    }
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <MessageSquare size={15} />
                                    Enviar mensaje
                                </Button>
                            )}
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                {perfil.github && (
                                    <a href={`https://github.com/${perfil.github}`} target="_blank" rel="noreferrer" style={{
                                        width: 36, height: 36, borderRadius: '10px', border: '1px solid rgba(15,53,56,0.15)',
                                        background: 'rgba(15,53,56,0.06)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }} title="GitHub">
                                        <GitBranch size={16} color="#4E7276" />
                                    </a>
                                )}
                                {perfil.linkedin && (
                                    <a href={`https://linkedin.com/in/${perfil.linkedin}`} target="_blank" rel="noreferrer" style={{
                                        width: 36, height: 36, borderRadius: '10px', border: '1px solid rgba(15,53,56,0.15)',
                                        background: 'rgba(15,53,56,0.06)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }} title="LinkedIn">
                                        <Link2 size={16} color="#4E7276" />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </GlassCard>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
                    {[
                        { label: 'Misiones', value: stats.missions, icon: Target },
                        { label: 'Posición', value: stats.rank, icon: Trophy },
                        { label: 'Racha', value: `${stats.streak}d`, icon: Zap },
                        { label: 'Insignias', value: stats.badges, icon: Users },
                    ].map(({ label, value, icon: Icon }) => (
                        <GlassCard key={label} style={{ padding: '16px', textAlign: 'center' }}>
                            <Icon size={18} color="#4E7276" style={{ margin: '0 auto 8px', display: 'block' }} />
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: 700, color: '#0F3538' }}>{value}</div>
                            <div style={{ fontSize: '12px', color: '#4E7276', marginTop: '2px' }}>{label}</div>
                        </GlassCard>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '16px' }}>
                    {/* Skills & Recent Missions */}
                    <GlassCard style={{ padding: '22px' }}>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 600, margin: '0 0 16px', color: '#0F3538' }}>Habilidades</h2>
                        {skills.length === 0 ? (
                            <p style={{ fontSize: '13px', color: '#4E7276' }}>No hay habilidades registradas.</p>
                        ) : (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {skills.map((sk) => (
                                    <div key={sk.id} style={{
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                        padding: '7px 14px', borderRadius: '999px',
                                        background: 'rgba(0, 109, 119, 0.18)', border: '1px solid rgba(0, 109, 119, 0.3)',
                                    }}>
                                        <span style={{ fontSize: '13px', fontWeight: 500, color: '#0F3538' }}>{sk.nombre}</span>
                                        <span style={{ fontSize: '11px', color: levelColors[sk.nivel] || '#4E7276' }}>· {sk.nivel}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Misiones recientes: solo se muestra la sección si el backend envía el campo */}
                        {recentMissions.length > 0 && (
                            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(15,53,56,0.08)' }}>
                                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 600, margin: '0 0 12px', color: '#4E7276' }}>
                                    MISIONES RECIENTES
                                </h3>
                                {recentMissions.map((m, idx) => (
                                    <div key={idx} style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '10px 0', borderBottom: '1px solid rgba(15,53,56,0.06)',
                                    }}>
                                        <span style={{ fontSize: '13px', color: m.done ? '#4E7276' : '#0F3538' }}>
                                            {m.done ? '✓ ' : '◐ '}{m.title}
                                        </span>
                                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#6db384' }}>+{m.xp}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </GlassCard>

                    {/* Badges & Meta info */}
                    <GlassCard style={{ padding: '22px' }}>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 600, margin: '0 0 16px', color: '#0F3538' }}>Insignias</h2>
                        {badges.length === 0 ? (
                            <p style={{ fontSize: '13px', color: '#4E7276' }}>Sin insignias registradas.</p>
                        ) : (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {badges.map((insignia) => (
                                    <div key={insignia.id} title={insignia.nombre} style={{
                                        width: 40, height: 40, borderRadius: '50%',
                                        background: 'rgba(0, 109, 119, 0.2)', border: '1px solid rgba(0, 109, 119, 0.35)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <Award size={20} color="#006D77" />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Miembro desde: solo se muestra si el backend envía fechaRegistro */}
                        {perfil.fechaRegistro && (
                            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(15,53,56,0.08)' }}>
                                <p style={{ fontSize: '13px', color: '#4E7276', margin: '0 0 6px' }}>Miembro desde</p>
                                <p style={{ fontWeight: 600, margin: 0, color: '#0F3538' }}>
                                    {new Date(perfil.fechaRegistro).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                        )}

                        {/* Equipo: mismo campo que usa el perfil privado (perfil.equipo) */}
                        {perfil.equipo && (
                            <div style={{ marginTop: '14px' }}>
                                <p style={{ fontSize: '13px', color: '#4E7276', margin: '0 0 6px' }}>Equipo actual</p>
                                <p style={{ fontWeight: 600, margin: 0, color: '#0F3538' }}>{perfil.equipo}</p>
                            </div>
                        )}
                    </GlassCard>
                </div>
            </div>
        </div>
    )
}