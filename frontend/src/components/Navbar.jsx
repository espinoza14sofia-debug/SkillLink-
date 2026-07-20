import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import {
    LayoutDashboard, Swords, Users, Trophy, Medal, MessageSquare,
    Bell, Settings, User, LogOut, Menu, X, ChevronRight, Zap,
} from "lucide-react";
import { Avatar, XPBar } from "./ui";

const navLinks = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/misiones", label: "Misiones", icon: Swords },
    { path: "/mi-equipo", label: "Mi Equipo", icon: Users },
    { path: "/ranking", label: "Ranking", icon: Trophy },
    { path: "/insignias", label: "Insignias", icon: Medal },
    { path: "/mensajes", label: "Mensajes", icon: MessageSquare },
];

// Normaliza una notificación venga como venga desde el backend
// (msg/mensaje/texto, read/leida, time/tiempo).
function normalizarNotificacion(n) {
    return {
        id: n.id,
        msg: n.mensaje ?? n.msg ?? n.texto ?? "",
        time: n.tiempo ?? n.time ?? n.creadoHace ?? "",
        read: n.leida ?? n.read ?? false,
    };
}

export default function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();

    const [perfil, setPerfil] = useState(null);
    const [notificaciones, setNotificaciones] = useState([]);
    const [showNotifs, setShowNotifs] = useState(false);
    const [showUser, setShowUser] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const cargarPerfil = async () => {
            try {
                const respuesta = await api.get("/usuarios/me");
                setPerfil(respuesta.data);
            } catch (err) {
                setPerfil(null);
            }
        };
        cargarPerfil();

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
            await api.put("/notificaciones/marcar-leidas");
        } catch (err) {
            // Si el endpoint todavía no existe, el estado local ya quedó marcado igual.
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
        background: "rgba(224, 225, 221, 0.10)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(224, 225, 221, 0.14)",
        borderRadius: "16px",
        boxShadow: "0 12px 40px rgba(13, 27, 42, 0.5)",
    };

    return (
        <>
            <nav style={navStyle}>
                <div style={{ display: "flex", alignItems: "center", padding: "0 20px", height: "60px", gap: "8px" }}>
                    {/* Logo */}
                    <Link to="/dashboard" style={{ display: "flex", alignItems: "center", gap: "8px", marginRight: "8px", flexShrink: 0 }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: "10px", background: "#415A77",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <Zap size={17} color="#E0E1DD" fill="#E0E1DD" />
                        </div>
                        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "17px", color: "#E0E1DD" }}>
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
                                    padding: "7px 12px", borderRadius: "10px", fontSize: "13px", fontWeight: 500,
                                    color: isActive(path) ? "#E0E1DD" : "#778DA9",
                                    transition: "all 0.18s",
                                    background: isActive(path) ? "rgba(65, 90, 119, 0.35)" : "transparent",
                                    whiteSpace: "nowrap",
                                }}
                                onMouseEnter={(e) => { if (!isActive(path)) { e.currentTarget.style.color = "#E0E1DD"; e.currentTarget.style.background = "rgba(224, 225, 221, 0.06)"; } }}
                                onMouseLeave={(e) => { if (!isActive(path)) { e.currentTarget.style.color = "#778DA9"; e.currentTarget.style.background = "transparent"; } }}
                            >
                                <Icon size={15} />
                                {label}
                            </Link>
                        ))}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginLeft: "auto", flexShrink: 0 }}>
                        {/* XP mini display */}
                        {perfil && (
                            <div className="nav-desktop" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 12px", borderRadius: "10px", background: "rgba(65, 90, 119, 0.2)", border: "1px solid rgba(65, 90, 119, 0.3)" }}>
                                <Zap size={13} color="#778DA9" />
                                <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "#E0E1DD", fontWeight: 500 }}>
                                    {perfil.xp?.toLocaleString()}
                                </span>
                                <span style={{ fontSize: "11px", color: "#778DA9" }}>XP · Nv.{perfil.nivel}</span>
                            </div>
                        )}

                        {/* Notifications */}
                        <div style={{ position: "relative" }}>
                            <button
                                onClick={() => { setShowNotifs((v) => !v); setShowUser(false); }}
                                style={{
                                    width: 36, height: 36, borderRadius: "10px", border: "none", cursor: "pointer",
                                    background: showNotifs ? "rgba(65, 90, 119, 0.35)" : "rgba(224, 225, 221, 0.06)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    position: "relative", transition: "background 0.18s",
                                }}
                            >
                                <Bell size={16} color="#778DA9" />
                                {unread > 0 && (
                                    <span style={{
                                        position: "absolute", top: 5, right: 5, width: 8, height: 8,
                                        borderRadius: "50%", background: "#c49a3f", border: "1px solid #0D1B2A",
                                    }} />
                                )}
                            </button>

                            {showNotifs && (
                                <div className="glass-float" style={{
                                    position: "absolute", top: "calc(100% + 8px)", right: 0,
                                    width: 320, padding: "8px", zIndex: 200,
                                }}>
                                    <div style={{ padding: "8px 12px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "14px" }}>Notificaciones</span>
                                        {unread > 0 && (
                                            <span onClick={marcarTodoLeido} style={{ fontSize: "12px", color: "#778DA9", cursor: "pointer" }}>
                                                Marcar todo
                                            </span>
                                        )}
                                    </div>
                                    {notificaciones.length === 0 ? (
                                        <p style={{ padding: "12px", fontSize: "13px", color: "#778DA9", margin: 0 }}>
                                            No tenés notificaciones.
                                        </p>
                                    ) : (
                                        notificaciones.map((n) => (
                                            <div key={n.id} style={{
                                                display: "flex", gap: "10px", alignItems: "flex-start",
                                                padding: "10px 12px", borderRadius: "10px", cursor: "pointer",
                                                background: n.read ? "transparent" : "rgba(65, 90, 119, 0.12)",
                                                transition: "background 0.15s",
                                            }}
                                                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(224, 225, 221, 0.06)")}
                                                onMouseLeave={(e) => (e.currentTarget.style.background = n.read ? "transparent" : "rgba(65, 90, 119, 0.12)")}
                                            >
                                                <div style={{
                                                    width: 8, height: 8, borderRadius: "50%", marginTop: 5, flexShrink: 0,
                                                    background: n.read ? "transparent" : "#c49a3f",
                                                }} />
                                                <div style={{ flex: 1 }}>
                                                    <p style={{ margin: 0, fontSize: "13px", color: "#E0E1DD", lineHeight: 1.4 }}>{n.msg}</p>
                                                    <span style={{ fontSize: "11px", color: "#778DA9" }}>hace {n.time}</span>
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
                                            <p style={{ margin: "0 0 4px", fontWeight: 600, fontSize: "14px", fontFamily: "var(--font-display)" }}>
                                                {perfil.nombre}
                                            </p>
                                            {perfil.email && (
                                                <p style={{ margin: "0 0 10px", fontSize: "12px", color: "#778DA9" }}>{perfil.email}</p>
                                            )}
                                            <XPBar value={perfil.xp} max={perfil.xpProximoNivel} showValues />
                                        </div>
                                        <div style={{ borderTop: "1px solid rgba(224, 225, 221, 0.08)", padding: "6px 0" }}>
                                            {[
                                                { icon: User, label: "Mi Perfil", path: "/perfil" },
                                                { icon: Settings, label: "Configuración", path: "/configuracion" },
                                            ].map(({ icon: Icon, label, path }) => (
                                                <button key={path} onClick={() => { navigate(path); setShowUser(false); }} style={{
                                                    display: "flex", alignItems: "center", gap: "10px", width: "100%",
                                                    padding: "9px 12px", borderRadius: "10px", border: "none", cursor: "pointer",
                                                    background: "transparent", color: "#778DA9", fontSize: "13px", fontWeight: 500,
                                                    transition: "all 0.15s", textAlign: "left",
                                                }}
                                                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(224, 225, 221, 0.06)"; e.currentTarget.style.color = "#E0E1DD"; }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#778DA9"; }}
                                                >
                                                    <Icon size={15} />{label}
                                                </button>
                                            ))}
                                        </div>
                                        <div style={{ borderTop: "1px solid rgba(224, 225, 221, 0.08)", padding: "6px 0 2px" }}>
                                            <button onClick={handleLogout} style={{
                                                display: "flex", alignItems: "center", gap: "10px", width: "100%",
                                                padding: "9px 12px", borderRadius: "10px", border: "none", cursor: "pointer",
                                                background: "transparent", color: "#c97070", fontSize: "13px", fontWeight: 500,
                                                transition: "all 0.15s", textAlign: "left",
                                            }}
                                                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(124, 58, 58, 0.12)")}
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
                            background: "rgba(224, 225, 221, 0.06)", display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            {mobileOpen ? <X size={16} color="#E0E1DD" /> : <Menu size={16} color="#778DA9" />}
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {mobileOpen && (
                    <div style={{ padding: "8px 12px 16px", borderTop: "1px solid rgba(224, 225, 221, 0.08)" }}>
                        {navLinks.map(({ path, label, icon: Icon }) => (
                            <Link key={path} to={path} onClick={() => setMobileOpen(false)} style={{
                                display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px",
                                borderRadius: "10px", color: isActive(path) ? "#E0E1DD" : "#778DA9",
                                background: isActive(path) ? "rgba(65, 90, 119, 0.3)" : "transparent",
                                fontWeight: 500, fontSize: "14px", marginBottom: "2px",
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