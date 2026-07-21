import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Navbar from "../components/Navbar";
import {
    Zap,
    Target,
    Users,
    TrendingUp,
    ChevronRight,
    Star,
    CheckCircle,
    Clock,
    AlertCircle,
    Circle,
    MessageSquare,
} from "lucide-react";
import { Avatar, Badge, XPBar, GlassCard, Button } from "../components/ui";

function saludoSegunHora() {
    const hora = new Date().getHours();
    if (hora < 12) return "Buenos días";
    if (hora < 19) return "Buenas tardes";
    return "Buenas noches";
}

function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
}

export default function Dashboard() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [perfil, setPerfil] = useState(null);
    const [misionesActivas, setMisionesActivas] = useState([]);
    const [misionesCompletadasCount, setMisionesCompletadasCount] = useState(0);
    const [actividad, setActividad] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const cargarDashboard = async () => {
            try {
                const respuestaPerfil = await api.get("/usuarios/me");
                setPerfil(respuestaPerfil.data);

                try {
                    const respuestaMisiones = await api.get("/misiones");
                    const miId = String(respuestaPerfil.data.id);

                    const misMisiones = respuestaMisiones.data.filter(
                        (m) => String(m.usuarioAsignadoId) === miId
                    );

                    const esCompletada = (m) => m.estado === "completada";

                    const propias = misMisiones.filter((m) => !esCompletada(m)).slice(0, 4);

                    // Única fuente de verdad para "misiones completadas": contamos
                    // directo de /misiones en vez de confiar en perfil.misionesCompletadas,
                    // así el stat card y esta lista siempre muestran el mismo dato.
                    setMisionesCompletadasCount(misMisiones.filter(esCompletada).length);
                    setMisionesActivas(propias);
                } catch (err) {
                    setMisionesActivas([]);
                }

                try {
                    const respuestaActividad = await api.get("/actividad");
                    setActividad(respuestaActividad.data);
                } catch (err) {
                    setActividad([]);
                }
            } catch (err) {
                setError("No se pudo cargar tu perfil.");
            } finally {
                setCargando(false);
            }
        };
        cargarDashboard();
    }, []);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    if (cargando) {
        return (
            <div>
                <Navbar />
                <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "90px 24px 32px" }}>
                    <div className="skeleton" style={{ height: 180, marginBottom: 24, borderRadius: 16 }} />
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="skeleton" style={{ height: 110, borderRadius: 16 }} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error || !perfil) {
        return (
            <div>
                <Navbar />
                <div
                    style={{
                        minHeight: "60vh",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 16,
                    }}
                >
                    <p style={{ color: "#E0E1DD" }}>{error || "Ocurrió un error."}</p>
                    <Button variant="ghost" onClick={handleLogout}>
                        Cerrar sesión
                    </Button>
                </div>
            </div>
        );
    }

    const xp = perfil.xp;
    const xpMax = perfil.xpProximoNivel;
    const primerNombre = perfil.nombre.split(" ")[0];

    return (
        <div>
            <Navbar />
            <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "90px 24px 32px" }}>
            {/* Welcome */}
            <div
                style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    marginBottom: "32px",
                    gap: 16,
                    flexWrap: "wrap",
                }}
            >
                <div>
                    <h1
                        style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "28px",
                            fontWeight: 700,
                            margin: "0 0 4px",
                        }}
                    >
                        {saludoSegunHora()}, {primerNombre}
                    </h1>
                    <p style={{ color: "#778DA9", margin: 0 }}>
                        {perfil.xpRestante > 0
                            ? `Te faltan ${perfil.xpRestante} XP para el siguiente nivel.`
                            : "¡Nivel completo! Sigue así."}
                    </p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                    Cerrar sesión
                </Button>
            </div>

            {/* Level Hero Card */}
            <div
                className="glass-card"
                style={{
                    padding: "32px",
                    marginBottom: "24px",
                    background: "rgba(65, 90, 119, 0.14)",
                    border: "1px solid rgba(65, 90, 119, 0.35)",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        right: -60,
                        top: -60,
                        width: 250,
                        height: 250,
                        borderRadius: "50%",
                        border: "1px solid rgba(65, 90, 119, 0.2)",
                        pointerEvents: "none",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        right: -20,
                        top: -20,
                        width: 160,
                        height: 160,
                        borderRadius: "50%",
                        border: "1px solid rgba(65, 90, 119, 0.15)",
                        pointerEvents: "none",
                    }}
                />

                <div style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
                    <Avatar name={perfil.nombre} size={72} ring="gold" level={perfil.nivel} />

                    <div style={{ flex: 1, minWidth: 200 }}>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                marginBottom: "6px",
                                flexWrap: "wrap",
                            }}
                        >
                            <h2
                                style={{
                                    fontFamily: "var(--font-display)",
                                    fontSize: "22px",
                                    fontWeight: 700,
                                    margin: 0,
                                }}
                            >
                                {perfil.nombre}
                            </h2>
                            <div
                                style={{
                                    background: "rgba(196, 154, 63, 0.15)",
                                    border: "1px solid rgba(196, 154, 63, 0.4)",
                                    borderRadius: "999px",
                                    padding: "3px 12px",
                                }}
                            >
                                <span
                                    style={{
                                        fontFamily: "var(--font-display)",
                                        fontSize: "13px",
                                        fontWeight: 600,
                                        color: "#b78e38",
                                    }}
                                >
                                    Nivel {perfil.nivel} — {perfil.titulo}
                                </span>
                            </div>
                        </div>
                        {perfil.carrera && (
                            <p style={{ color: "#778DA9", fontSize: "13px", margin: "0 0 16px" }}>
                                {perfil.carrera}
                            </p>
                        )}
                        <XPBar value={xp} max={xpMax} showValues />
                        <p style={{ fontSize: "12px", color: "#778DA9", margin: "6px 0 0" }}>
                            {perfil.xpRestante > 0 ? (
                                <>
                                    Faltan{" "}
                                    <span
                                        style={{
                                            fontFamily: "var(--font-mono)",
                                            color: "#9db5cc",
                                            fontWeight: 500,
                                        }}
                                    >
                                        {perfil.xpRestante.toLocaleString()}
                                    </span>{" "}
                                    XP para el siguiente nivel
                                </>
                            ) : (
                                "¡Nivel completo!"
                            )}
                        </p>
                    </div>
                </div>
            </div>

            {/* Stat cards (datos reales del usuario, misma fuente que "Misiones activas") */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "16px",
                    marginBottom: "28px",
                }}
            >
                {[
                    { label: "XP Total", value: perfil.xp.toLocaleString(), color: "#9db5cc", Icon: Zap, to: "/perfil" },
                    { label: "Insignias", value: perfil.insigniasDesbloqueadas, color: "#c49a3f", Icon: Star, to: "/insignias" },
                    { label: "Misiones completadas", value: misionesCompletadasCount, color: "#6db384", Icon: Target, to: "/misiones" },
                ].map(({ label, value, color, Icon, to }) => (
                    <Link key={label} to={to} style={{ textDecoration: "none" }}>
                        <GlassCard className="hover-lift" style={{ padding: "22px 24px" }}>
                            <div
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: "12px",
                                    background: `rgba(${hexToRgb(color)}, 0.12)`,
                                    border: `1px solid rgba(${hexToRgb(color)}, 0.25)`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginBottom: "16px",
                                }}
                            >
                                <Icon size={18} color={color} />
                            </div>
                            <div
                                style={{
                                    fontFamily: "var(--font-mono)",
                                    fontSize: "28px",
                                    fontWeight: 600,
                                    color: "#E0E1DD",
                                    marginBottom: "4px",
                                }}
                            >
                                {value}
                            </div>
                            <div style={{ fontSize: "13px", color: "#778DA9" }}>{label}</div>
                        </GlassCard>
                    </Link>
                ))}
            </div>

            {/* Main grid: misiones activas + actividad reciente */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "20px", marginBottom: "28px" }}>
                {/* Misiones activas */}
                <div>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: "16px",
                        }}
                    >
                        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 600, margin: 0 }}>
                            Misiones activas
                        </h2>
                        <Link to="/misiones">
                            <Button variant="ghost" size="sm" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                Ver todas <ChevronRight size={14} />
                            </Button>
                        </Link>
                    </div>

                    {misionesActivas.length === 0 ? (
                        <GlassCard style={{ padding: "24px", textAlign: "center" }}>
                            <p style={{ color: "#778DA9", fontSize: "13px", margin: 0 }}>
                                No tienes misiones activas ahora mismo.
                            </p>
                        </GlassCard>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {misionesActivas.map((m) => (
                                <MissionRow key={m.id} mission={m} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Actividad reciente */}
                <div>
                    <h2 style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 600, margin: "0 0 16px" }}>
                        Actividad reciente
                    </h2>
                    {actividad.length === 0 ? (
                        <GlassCard style={{ padding: "24px", textAlign: "center" }}>
                            <p style={{ color: "#778DA9", fontSize: "13px", margin: 0 }}>
                                Aún no hay actividad reciente.
                            </p>
                        </GlassCard>
                    ) : (
                        <GlassCard style={{ padding: "8px" }}>
                            {actividad.map((a, i) => (
                                <div
                                    key={a.id ?? i}
                                    style={{
                                        display: "flex",
                                        gap: "12px",
                                        alignItems: "flex-start",
                                        padding: "12px",
                                        borderRadius: "10px",
                                        borderBottom:
                                            i < actividad.length - 1 ? "1px solid rgba(224,225,221,0.06)" : "none",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 34,
                                            height: 34,
                                            borderRadius: "10px",
                                            flexShrink: 0,
                                            background: "rgba(65, 90, 119, 0.2)",
                                            border: "1px solid rgba(65, 90, 119, 0.3)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <CheckCircle size={15} color="#778DA9" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ margin: "0 0 4px", fontSize: "13px", color: "#E0E1DD", lineHeight: 1.4 }}>
                                            {a.texto}
                                        </p>
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            {a.xp && (
                                                <span
                                                    style={{
                                                        fontFamily: "var(--font-mono)",
                                                        fontSize: "12px",
                                                        color: "#6db384",
                                                        fontWeight: 500,
                                                    }}
                                                >
                                                    +{a.xp} XP
                                                </span>
                                            )}
                                            <span style={{ fontSize: "11px", color: "#778DA9" }}>hace {a.tiempo}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </GlassCard>
                    )}

                    {/* Acciones rápidas */}
                    <div style={{ marginTop: "16px" }}>
                        <h3
                            style={{
                                fontFamily: "var(--font-display)",
                                fontSize: "14px",
                                fontWeight: 600,
                                margin: "0 0 10px",
                                color: "#778DA9",
                            }}
                        >
                            ACCIONES RÁPIDAS
                        </h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            {[
                                { label: "Ver mi equipo", path: "/mi-equipo", icon: Users },
                                { label: "Mensajes", path: "/mensajes", icon: MessageSquare },
                                { label: "Ranking global", path: "/ranking", icon: TrendingUp },
                                { label: "Mis insignias", path: "/insignias", icon: Star },
                            ].map(({ label, path, icon: Icon }) => (
                                <Link key={path} to={path} style={{ textDecoration: "none" }}>
                                    <div
                                        className="glass-nested hover-lift"
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            padding: "11px 14px",
                                            cursor: "pointer",
                                        }}
                                    >
                                        <span
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "10px",
                                                fontSize: "13px",
                                                fontWeight: 500,
                                                color: "#E0E1DD",
                                            }}
                                        >
                                            <Icon size={15} color="#778DA9" />
                                            {label}
                                        </span>
                                        <ChevronRight size={14} color="#415A77" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </div>
    );
}

// Deriva el estado visual real (misma lógica que Missions.jsx) en vez de
// comparar contra "estado", ya que el backend solo usa "pendiente"/"completada"
// para ese campo; lo urgente y lo vencido vienen aparte.
function derivarEstadoMision(m) {
    if (m.esUrgente || m.vencida) {
        return { label: m.vencida ? "Vencida" : "Urgente", variant: "error", Icon: AlertCircle };
    }
    return { label: "En progreso", variant: "accent", Icon: Circle };
}

function MissionRow({ mission }) {
    const s = derivarEstadoMision(mission);
    const tieneProgreso = typeof mission.progreso === "number" && mission.progreso > 0;

    return (
        <GlassCard className="hover-lift" style={{ padding: "16px 20px" }}>
            <div
                style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    marginBottom: tieneProgreso ? "12px" : 0,
                }}
            >
                <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "4px" }}>
                        <span style={{ fontWeight: 600, fontSize: "14px", fontFamily: "var(--font-display)" }}>
                            {mission.titulo}
                        </span>
                        <Badge variant={s.variant}>{s.label}</Badge>
                    </div>
                    <span style={{ fontSize: "12px", color: "#778DA9" }}>
                        {mission.proyectoNombre || mission.descripcion}
                    </span>
                </div>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        gap: "4px",
                        marginLeft: "16px",
                        flexShrink: 0,
                    }}
                >
                    <div
                        style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#9db5cc",
                            background: "rgba(65,90,119,0.2)",
                            padding: "2px 8px",
                            borderRadius: "6px",
                        }}
                    >
                        +{mission.xpValor} XP
                    </div>
                    {mission.fechaLimite && (
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "#778DA9" }}>
                            <Clock size={11} />
                            {new Date(mission.fechaLimite).toLocaleDateString("es-CR", { day: "numeric", month: "short" })}
                        </div>
                    )}
                </div>
            </div>
            {tieneProgreso && (
                <XPBar value={mission.progreso} max={100} label={`${mission.progreso}% completado`} />
            )}
        </GlassCard>
    );
}