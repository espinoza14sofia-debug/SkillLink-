import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import {
    LayoutDashboard, Swords, Users, Trophy, Medal, MessageSquare,
    Bell, Settings, User, LogOut, Menu, X, ChevronRight, Zap, Search,
} from "lucide-react";
import { Avatar, XPBar } from "./ui";
import { usePerfil } from "../context/PerfilContext";

const navLinks = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/misiones", label: "Misiones", icon: Swords },
    { path: "/mi-equipo", label: "Mi Equipo", icon: Users },
    { path: "/buscar-habilidad", label: "Buscar", icon: Search },
    { path: "/ranking", label: "Ranking", icon: Trophy },
    { path: "/insignias", label: "Insignias", icon: Medal },
    { path: "/mensajes", label: "Mensajes", icon: MessageSquare },
];

// El backend (NotificacionRespuestaDto) devuelve exactamente: id, tipo, mensaje, leida, fecha.
function normalizarNotificacion(n) {
    return {
        id: n.id,
        tipo: n.tipo,
        msg: n.mensaje,
        fecha: n.fecha,
        read: n.leida,
    };
}

function tiempoRelativo(fechaIso) {
    if (!fechaIso) return "";
    const diffMs = Date.now() - new Date(fechaIso).getTime();
    const min = Math.floor(diffMs / 60000);
    if (min < 1) return "un momento";
    if (min < 60) return `${min} min`;
    const horas = Math.floor(min / 60);
    if (horas < 24) return `${horas} h`;
    return `${Math.floor(horas / 24)} d`;
}

export default function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();

    const { perfil } = usePerfil();
    const [notificaciones, setNotificaciones] = useState([]); const [showNotifs, setShowNotifs] = useState(false);
    const [showUser, setShowUser] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {

        const cargarNotificaciones = async () => {
            try {
                const respuesta = await api.get("/notificaciones");
                setNotificaciones(respuesta.data.map(normalizarNotificacion));
            } catch (err) {
                setNotificaciones([]);
            }
        };
        cargarNotificaciones();
    }, []);

    const unread = notificaciones.filter((n) => !n.read).length;

    const marcarTodoLeido = async () => {
        setNotificaciones((prev) => prev.map((n) => ({ ...n, read: true })));
        try {
            await api.put("/notificaciones/leer-todas");
        } catch (err) {
            console.error("Error al marcar todas las notificaciones como leídas:", err);
        }
    };

    const marcarUnaLeida = async (n) => {
        if (n.read) return;
        setNotificaciones((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
        try {
            await api.put(`/notificaciones/${n.id}/leer`);
        } catch (err) {
            console.error("Error al marcar la notificación como leída:", err);
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");

    const navStyle = {
        position: "fixed",
        top: "10px",
        left: "16px",
        right: "16px",
        zIndex: 100,
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "16px",
        boxShadow: "var(--shadow-md)",
    };

    return (
        <>
            <nav style={navStyle}>
                <div style={{ display: "flex", alignItems: "center", padding: "0 20px", height: "60px", gap: "8px" }}>
                    {/* Logo */}
                    <Link to="/dashboard" style={{ display: "flex", alignItems: "center", gap: "8px", marginRight: "8px", flexShrink: 0 }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: "10px", background: "var(--color-primary)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <Zap size={17} color="#FFFFFF" fill="#FFFFFF" />
                        </div>
                        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "17px", color: "var(--text-primary)" }}>
                            SkillLink
                        </span>
                    </Link>

                    {/* Desktop nav links */}
                    <div className="nav-desktop" style={{ display: "flex", alignItems: "center", gap: "2px", flex: 1 }}>
                        {navLinks.map(({ path, label, icon: Icon }) => (
                            <Link
                                key={path}
                                to={path}
                                className={isActive(path) ? "nav-link-active" : ""}
                                style={{
                                    display: "flex", alignItems: "center", gap: "6px",
                                    padding: "7px 12px", borderRadius: "10px", fontSize: "13px", fontWeight: 600,
                                    color: isActive(path) ? "var(--color-primary)" : "var(--text-secondary)",
                                    transition: "all 0.18s",
                                    background: isActive(path) ? "var(--color-accent-soft)" : "transparent",
                                    whiteSpace: "nowrap",
                                }}
                                onMouseEnter={(e) => { if (!isActive(path)) { e.currentTarget.style.color = "var(--color-primary)"; e.currentTarget.style.background = "var(--surface-soft)"; } }}
                                onMouseLeave={(e) => { if (!isActive(path)) { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.background = "transparent"; } }}
                            >
                                <Icon size={15} />
                                {label}
                            </Link>
                        ))}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginLeft: "auto", flexShrink: 0 }}>
                        {/* XP mini display */}
                        {perfil && (
                            <div className="nav-desktop" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 12px", borderRadius: "10px", background: "rgba(0, 109, 119, 0.08)", border: "1px solid rgba(0, 109, 119, 0.18)" }}>
                                <Zap size={13} color="var(--color-primary)" />
                                <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-primary)", fontWeight: 600 }}>
                                    {perfil.xp?.toLocaleString()}
                                </span>
                                <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>XP · Nv.{perfil.nivel}</span>
                            </div>
                        )}

                        {/* Notifications */}
                        <div style={{ position: "relative" }}>
                            <button
                                onClick={() => { setShowNotifs((v) => !v); setShowUser(false); }}
                                style={{
                                    width: 36, height: 36, borderRadius: "10px", border: "none", cursor: "pointer",
                                    background: showNotifs ? "var(--color-accent-soft)" : "var(--surface-soft)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    position: "relative", transition: "background 0.18s",
                                }}
                            >
                                <Bell size={16} color={showNotifs ? "var(--color-primary)" : "var(--text-secondary)"} />
                                {unread > 0 && (
                                    <span style={{
                                        position: "absolute", top: 5, right: 5, width: 8, height: 8,
                                        borderRadius: "50%", background: "var(--color-accent)", border: "1px solid var(--surface)",
                                    }} />
                                )}
                            </button>

                            {showNotifs && (
                                <div className="glass-float" style={{
                                    position: "absolute", top: "calc(100% + 8px)", right: 0,
                                    width: 320, padding: "8px", zIndex: 200,
                                }}>
                                    <div style={{ padding: "8px 12px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "14px", color: "var(--text-primary)" }}>Notificaciones</span>
                                        {unread > 0 && (
                                            <span onClick={marcarTodoLeido} style={{ fontSize: "12px", color: "var(--color-primary)", cursor: "pointer", fontWeight: 600 }}>
                                                Marcar todo
                                            </span>
                                        )}
                                    </div>
                                    {notificaciones.length === 0 ? (
                                        <p style={{ padding: "12px", fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>
                                            No tenés notificaciones.
                                        </p>
                                    ) : (
                                        notificaciones.map((n) => (
                                            <div key={n.id} onClick={() => marcarUnaLeida(n)} style={{
                                                display: "flex", gap: "10px", alignItems: "flex-start",
                                                padding: "10px 12px", borderRadius: "10px", cursor: "pointer",
                                                background: n.read ? "transparent" : "var(--color-accent-soft)",
                                                transition: "background 0.15s",
                                            }}
                                                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-soft)")}
                                                onMouseLeave={(e) => (e.currentTarget.style.background = n.read ? "transparent" : "var(--color-accent-soft)")}
                                            >
                                                <div style={{
                                                    width: 8, height: 8, borderRadius: "50%", marginTop: 5, flexShrink: 0,
                                                    background: n.read ? "transparent" : "var(--color-accent)",
                                                }} />
                                                <div style={{ flex: 1 }}>
                                                    <p style={{ margin: 0, fontSize: "13px", color: "var(--text-primary)", lineHeight: 1.4 }}>{n.msg}</p>
                                                    <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>hace {tiempoRelativo(n.fecha)}</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        {/* User menu */}
                        {perfil && (
                            <div style={{ position: "relative" }}>
                                <button
                                    onClick={() => { setShowUser((v) => !v); setShowNotifs(false); }}
                                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                                >
                                    <Avatar name={perfil.nombre} size={36} ring="gold" level={perfil.nivel} />
                                </button>

                                {showUser && (
                                    <div className="glass-float" style={{
                                        position: "absolute", top: "calc(100% + 8px)", right: 0,
                                        width: 240, padding: "8px", zIndex: 200,
                                    }}>
                                        <div style={{ padding: "12px 12px 10px" }}>
                                            <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: "14px", fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
                                                {perfil.nombre}
                                            </p>
                                            {perfil.email && (
                                                <p style={{ margin: "0 0 10px", fontSize: "12px", color: "var(--text-secondary)" }}>{perfil.email}</p>
                                            )}
                                            <XPBar value={perfil.xp} max={perfil.xpProximoNivel} showValues />
                                        </div>
                                        <div style={{ borderTop: "1px solid var(--border)", padding: "6px 0" }}>
                                            {[
                                                { icon: User, label: "Mi Perfil", path: "/perfil" },
                                            ].map(({ icon: Icon, label, path }) => (
                                                <button key={path} onClick={() => { navigate(path); setShowUser(false); }} style={{
                                                    display: "flex", alignItems: "center", gap: "10px", width: "100%",
                                                    padding: "9px 12px", borderRadius: "10px", border: "none", cursor: "pointer",
                                                    background: "transparent", color: "var(--text-secondary)", fontSize: "13px", fontWeight: 500,
                                                    transition: "all 0.15s", textAlign: "left",
                                                }}
                                                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-soft)"; e.currentTarget.style.color = "var(--color-primary)"; }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; }}
                                                >
                                                    <Icon size={15} />{label}
                                                </button>
                                            ))}
                                        </div>
                                        <div style={{ borderTop: "1px solid var(--border)", padding: "6px 0 2px" }}>
                                            <button onClick={handleLogout} style={{
                                                display: "flex", alignItems: "center", gap: "10px", width: "100%",
                                                padding: "9px 12px", borderRadius: "10px", border: "none", cursor: "pointer",
                                                background: "transparent", color: "var(--error)", fontSize: "13px", fontWeight: 500,
                                                transition: "all 0.15s", textAlign: "left",
                                            }}
                                                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--error-light)")}
                                                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                            >
                                                <LogOut size={15} />Cerrar sesión
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Mobile menu button */}
                        <button className="nav-mobile-btn" onClick={() => setMobileOpen((v) => !v)} style={{
                            width: 36, height: 36, borderRadius: "10px", border: "none", cursor: "pointer",
                            background: "var(--surface-soft)", display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            {mobileOpen ? <X size={16} color="var(--text-primary)" /> : <Menu size={16} color="var(--text-secondary)" />}
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {mobileOpen && (
                    <div style={{ padding: "8px 12px 16px", borderTop: "1px solid var(--border)" }}>
                        {navLinks.map(({ path, label, icon: Icon }) => (
                            <Link key={path} to={path} onClick={() => setMobileOpen(false)} style={{
                                display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px",
                                borderRadius: "10px", color: isActive(path) ? "var(--color-primary)" : "var(--text-secondary)",
                                background: isActive(path) ? "var(--color-accent-soft)" : "transparent",
                                fontWeight: 600, fontSize: "14px", marginBottom: "2px",
                                justifyContent: "space-between",
                            }}>
                                <span style={{ display: "flex", alignItems: "center", gap: "10px" }}><Icon size={16} />{label}</span>
                                <ChevronRight size={14} />
                            </Link>
                        ))}
                    </div>
                )}
            </nav>

            {/* Close dropdowns on outside click */}
            {(showNotifs || showUser) && (
                <div onClick={() => { setShowNotifs(false); setShowUser(false); }}
                    style={{ position: "fixed", inset: 0, zIndex: 99 }} />
            )}
        </>
    );
}
