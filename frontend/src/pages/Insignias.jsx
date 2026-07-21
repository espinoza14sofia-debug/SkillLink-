import { useEffect, useState } from "react";
import { Lock, Star, Users, Flame, Shield, Award, BookOpen, Code, Globe, Heart, Target } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { GlassCard, Badge as BadgePill } from "../components/ui";


const ICONOS = [Star, Users, Flame, Shield, Award, BookOpen, Code, Globe, Heart, Target];
const COLORES = ["#c49a3f", "#9db5cc", "#c97070", "#6db384", "#778DA9"];

function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
}

const FILTROS = ["all", "unlocked", "locked"];
const LABEL_FILTRO = { all: "Todas", unlocked: "✦ Desbloqueadas", locked: " Bloqueadas" };

export default function Insignias() {
    const { user } = useAuth();
    const [logros, setLogros] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [filtro, setFiltro] = useState("all");
    const [seleccionado, setSeleccionado] = useState(null);

    useEffect(() => {
        const cargarLogros = async () => {
            try {
                const { data } = await api.get(`/usuarios/${user.id}/logros`);
                setLogros(data);
            } catch (err) {
                setError("No se pudieron cargar las insignias.");
            } finally {
                setCargando(false);
            }
        };
        if (user?.id) cargarLogros();
    }, [user]);

    // Le suma ícono y color derivados de forma estable (mismo logro = mismo ícono/color siempre)
    const conEstilo = logros.map((l, i) => ({
        ...l,
        icon: ICONOS[i % ICONOS.length],
        color: COLORES[i % COLORES.length],
    }));

    const desbloqueadas = conEstilo.filter((l) => l.desbloqueado);
    const total = conEstilo.length;
    const progreso = total > 0 ? Math.round((desbloqueadas.length / total) * 100) : 0;

    const filtradas = conEstilo.filter((l) =>
        filtro === "all" ? true : filtro === "unlocked" ? l.desbloqueado : !l.desbloqueado
    );

    if (cargando) {
        return (
            <div>
                <Navbar />
                <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "90px 24px 32px" }}>
                    <div className="skeleton" style={{ height: 150, borderRadius: 16, marginBottom: 28 }} />
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="skeleton" style={{ height: 180, borderRadius: 16 }} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Navbar />
            <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "90px 24px 32px" }}>
                {/* Header */}
                <div style={{ marginBottom: "28px" }}>
                    <h1 style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 700, margin: "0 0 6px" }}>
                        Insignias
                    </h1>
                    <p style={{ color: "#778DA9", margin: 0 }}>
                        <span style={{ fontFamily: "var(--font-mono)", color: "#E0E1DD", fontWeight: 500 }}>{desbloqueadas.length}</span>{" "}
                        de{" "}
                        <span style={{ fontFamily: "var(--font-mono)", color: "#E0E1DD", fontWeight: 500 }}>{total}</span>{" "}
                        insignias desbloqueadas
                    </p>
                </div>

                {error && (
                    <GlassCard style={{ padding: "14px 18px", marginBottom: "20px", color: "#c97070", textAlign: "center" }}>
                        {error}
                    </GlassCard>
                )}

                {/* Progress overview */}
                <GlassCard
                    style={{
                        padding: "22px 28px", marginBottom: "28px",
                        background: "rgba(65, 90, 119, 0.1)", border: "1px solid rgba(65, 90, 119, 0.25)",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "32px", flexWrap: "wrap" }}>
                        <div>
                            <div style={{ fontFamily: "var(--font-mono)", fontSize: "40px", fontWeight: 700, color: "#E0E1DD", lineHeight: 1 }}>
                                {desbloqueadas.length}
                            </div>
                            <div style={{ fontSize: "13px", color: "#778DA9", marginTop: "4px" }}>Insignias ganadas</div>
                        </div>

                        <div style={{ flex: 1, minWidth: 160 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                <span style={{ fontSize: "13px", color: "#778DA9" }}>Progreso total</span>
                                <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "#E0E1DD" }}>{progreso}%</span>
                            </div>
                            <div className="xp-track">
                                <div className="xp-fill" style={{ width: `${progreso}%` }} />
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            {desbloqueadas.slice(0, 5).map((b) => (
                                <div
                                    key={b.id}
                                    title={b.nombre}
                                    style={{
                                        width: 36, height: 36, borderRadius: "50%",
                                        background: `rgba(${hexToRgb(b.color)}, 0.15)`,
                                        border: `2px solid ${b.color}`,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        boxShadow: `0 0 10px rgba(${hexToRgb(b.color)}, 0.3)`,
                                    }}
                                >
                                    <b.icon size={16} color={b.color} />
                                </div>
                            ))}
                            {desbloqueadas.length > 5 && (
                                <div style={{
                                    width: 36, height: 36, borderRadius: "50%",
                                    background: "rgba(65, 90, 119, 0.2)", border: "2px solid rgba(65, 90, 119, 0.4)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: "12px", fontWeight: 600, color: "#778DA9",
                                }}>
                                    +{desbloqueadas.length - 5}
                                </div>
                            )}
                        </div>
                    </div>
                </GlassCard>

                {/* Filters */}
                <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
                    {FILTROS.map((f) => (
                        <button
                            key={f}
                            onClick={() => setFiltro(f)}
                            style={{
                                padding: "7px 16px", borderRadius: "999px", border: "none", cursor: "pointer",
                                fontSize: "13px", fontWeight: 500, transition: "all 0.18s",
                                background: filtro === f ? "#415A77" : "rgba(224, 225, 221, 0.08)",
                                color: filtro === f ? "#E0E1DD" : "#778DA9",
                            }}
                        >
                            {LABEL_FILTRO[f]}
                        </button>
                    ))}
                </div>

                {/* Badge grid */}
                {filtradas.length === 0 ? (
                    <GlassCard style={{ padding: "48px", textAlign: "center" }}>
                        <p style={{ color: "#778DA9", margin: 0 }}>No hay insignias en esta categoría.</p>
                    </GlassCard>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "14px" }}>
                        {filtradas.map((logro) => (
                            <div
                                key={logro.id}
                                className={`glass-card hover-lift ${logro.desbloqueado ? "badge-glow" : ""}`}
                                style={{
                                    padding: "24px 20px", textAlign: "center", cursor: "pointer",
                                    opacity: logro.desbloqueado ? 1 : 0.55,
                                    filter: logro.desbloqueado ? "none" : "grayscale(40%)",
                                    transition: "all 0.2s",
                                }}
                                onClick={() => setSeleccionado(logro)}
                            >
                                <div style={{
                                    width: 60, height: 60, borderRadius: "50%", margin: "0 auto 14px",
                                    background: logro.desbloqueado ? `rgba(${hexToRgb(logro.color)}, 0.18)` : "rgba(65, 90, 119, 0.12)",
                                    border: logro.desbloqueado ? `2px solid ${logro.color}` : "2px solid rgba(65, 90, 119, 0.3)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    boxShadow: logro.desbloqueado ? `0 0 18px rgba(${hexToRgb(logro.color)}, 0.3)` : "none",
                                }}>
                                    {logro.desbloqueado ? <logro.icon size={26} color={logro.color} /> : <Lock size={22} color="#415A77" />}
                                </div>

                                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "14px", fontWeight: 600, margin: "0 0 4px", color: logro.desbloqueado ? "#E0E1DD" : "#778DA9" }}>
                                    {logro.nombre}
                                </h3>
                                {logro.descripcion && (
                                    <p style={{ fontSize: "12px", color: "#778DA9", margin: "0 0 12px", lineHeight: 1.4 }}>
                                        {logro.descripcion}
                                    </p>
                                )}

                                {logro.desbloqueado ? (
                                    <span style={{ fontSize: "11px", color: "#6db384", fontWeight: 500 }}>
                                        Desbloqueada{logro.fechaObtenido && ` · ${new Date(logro.fechaObtenido).toLocaleDateString()}`}
                                    </span>
                                ) : (
                                    <span style={{ fontSize: "11px", color: "#778DA9", fontWeight: 500 }}>Bloqueada</span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Badge detail modal */}
            {seleccionado && (
                <div className="overlay" onClick={() => setSeleccionado(null)}>
                    <div
                        className="glass-float"
                        style={{ width: "100%", maxWidth: "380px", padding: "36px", margin: "24px", textAlign: "center" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{
                            width: 80, height: 80, borderRadius: "50%", margin: "0 auto 20px",
                            background: seleccionado.desbloqueado ? `rgba(${hexToRgb(seleccionado.color)}, 0.18)` : "rgba(65,90,119,0.12)",
                            border: `3px solid ${seleccionado.desbloqueado ? seleccionado.color : "rgba(65,90,119,0.3)"}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: seleccionado.desbloqueado ? `0 0 30px rgba(${hexToRgb(seleccionado.color)}, 0.4)` : "none",
                        }}>
                            {seleccionado.desbloqueado
                                ? <seleccionado.icon size={36} color={seleccionado.color} />
                                : <Lock size={32} color="#415A77" />}
                        </div>

                        <BadgePill variant={seleccionado.desbloqueado ? "success" : "neutral"} style={{ marginBottom: "12px" }}>
                            {seleccionado.desbloqueado ? "Desbloqueada" : "Bloqueada"}
                        </BadgePill>

                        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: 700, margin: "0 0 8px" }}>
                            {seleccionado.nombre}
                        </h2>
                        <p style={{ color: "#778DA9", fontSize: "14px", margin: "0 0 20px", lineHeight: 1.6 }}>
                            {seleccionado.descripcion}
                        </p>

                        {seleccionado.desbloqueado && seleccionado.fechaObtenido && (
                            <p style={{ fontFamily: "var(--font-mono)", fontSize: "14px", color: "#6db384", margin: 0 }}>
                                Ganada el {new Date(seleccionado.fechaObtenido).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}