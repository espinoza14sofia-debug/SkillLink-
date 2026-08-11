import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, Medal, TrendingUp, TrendingDown, Minus, RefreshCw } from "lucide-react";
import { Avatar, GlassCard, Badge } from "../components/ui";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const COLOR_POSICION = {
    1: "#0F3538", // oro
    2: "#006D77", // plata
    3: "#a9713f", // bronce
};

const RING_POSICION = { 1: "gold", 2: "silver", 3: "bronze" };

// Función ultra segura para extraer el XP numérico
const extraerXP = (valor) => {
    if (valor === null || valor === undefined) return 0;
    if (typeof valor === "number") return valor;
    // Quitamos cualquier letra, coma, punto o espacio que el backend envíe por error
    const textoLimpio = String(valor).replace(/[^0-9]/g, "");
    return parseInt(textoLimpio, 10) || 0;
};

export default function Ranking() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [top, setTop] = useState([]);
    const [miPosicion, setMiPosicion] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    const cargar = useCallback(async () => {
        setCargando(true);
        try {
            // El ?_t=... evita que el navegador use caché vieja
            const { data } = await api.get(`/ranking?_t=${Date.now()}`);

            // Validamos que sea un arreglo realmente
            const arregloDatos = Array.isArray(data) ? data : (data.data || data.ranking || []);

            // 1. ORDENAMOS ESTRICTAMENTE POR XP DE MAYOR A MENOR
            const rankingOrdenado = [...arregloDatos].sort((a, b) => extraerXP(b.xp) - extraerXP(a.xp));

            // 2. ASIGNAMOS POSICIONES Y EMPATES
            let posicionActual = 1;
            const rankingFinal = rankingOrdenado.map((usuario, index, array) => {
                const xpActual = extraerXP(usuario.xp);

                if (index > 0) {
                    const xpAnterior = extraerXP(array[index - 1].xp);
                    if (xpActual < xpAnterior) {
                        posicionActual = index + 1; // Solo baja de posición si tiene menos XP
                    }
                }

                return { ...usuario, xp: xpActual, posicion: posicionActual };
            });

            console.log("🥇 RANKING ORDENADO EN EL FRONTEND:", rankingFinal);
            setTop(rankingFinal);
        } catch (err) {
            setError("No se pudo cargar el ranking.");
            console.error(err);
        }

        try {
            const { data } = await api.get(`/ranking/mi-posicion?_t=${Date.now()}`);
            setMiPosicion(data);
        } catch (err) {
            setMiPosicion(null);
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        cargar();
    }, [cargar]);

    const estoyEnElTop = miPosicion && top.some((u) => u.usuarioId === miPosicion.usuarioId);
    const top3 = top.slice(0, 3);
    const resto = top.slice(3);

    if (cargando && top.length === 0) {
        return (
            <div>
                <Navbar />
                <div style={{ maxWidth: "900px", margin: "0 auto", padding: "90px 24px 32px" }}>
                    <div className="skeleton" style={{ height: 400, borderRadius: 16 }} />
                </div>
            </div>
        );
    }

    return (
        <div>
            <Navbar />
            <div style={{ maxWidth: "900px", margin: "0 auto", padding: "90px 24px 32px" }}>
                <div style={{ marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 700, margin: "0 0 6px" }}>
                            Ranking Global
                        </h1>
                        <p style={{ color: "#4E7276", margin: 0 }}>Los estudiantes con más XP en SkillLink</p>
                    </div>
                    <button
                        onClick={cargar}
                        style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", color: "#006D77", fontWeight: "bold" }}
                    >
                        <RefreshCw size={18} />
                        Actualizar
                    </button>
                </div>

                {error && (
                    <GlassCard style={{ padding: "14px 18px", marginBottom: "20px", color: "#C4453C", textAlign: "center" }}>
                        {error}
                    </GlassCard>
                )}

                {top.length === 0 && !error ? (
                    <GlassCard style={{ padding: "48px", textAlign: "center" }}>
                        <Trophy size={40} color="#006D77" style={{ margin: "0 auto 16px", display: "block", opacity: 0.5 }} />
                        <p style={{ color: "#4E7276", margin: 0 }}>Aún no hay usuarios en el ranking.</p>
                    </GlassCard>
                ) : (
                    <>
                        {/* Podio top 3 siempre seguro */}
                        {top3.length > 0 && (
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px", marginBottom: "28px", alignItems: "end" }}>
                                {top3[1] ? <PodioCard usuario={top3[1]} lugarVisual={2} onClick={() => navigate(`/usuarios/${top3[1].usuarioId}`)} /> : <div />}
                                {top3[0] ? <PodioCard usuario={top3[0]} lugarVisual={1} onClick={() => navigate(`/usuarios/${top3[0].usuarioId}`)} /> : <div />}
                                {top3[2] ? <PodioCard usuario={top3[2]} lugarVisual={3} onClick={() => navigate(`/usuarios/${top3[2].usuarioId}`)} /> : <div />}
                            </div>
                        )}

                        {miPosicion && !estoyEnElTop && (
                            <GlassCard style={{
                                padding: "16px 20px", marginBottom: "16px",
                                background: "rgba(0, 109, 119, 0.2)", border: "1px solid rgba(0, 109, 119, 0.45)",
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "10px" }}>
                                    <TrendingUp size={14} color="#006D77" />
                                    <span style={{ fontSize: "12px", color: "#006D77", fontWeight: 500 }}>TU POSICIÓN</span>
                                </div>
                                <FilaRanking usuario={miPosicion} esYo onClick={() => { }} />
                            </GlassCard>
                        )}

                        {resto.length > 0 && (
                            <GlassCard style={{ padding: "8px" }}>
                                <div style={{
                                    padding: "8px 16px 12px", display: "grid",
                                    gridTemplateColumns: top[0]?.carrera ? "50px 1fr 100px 100px 70px" : "50px 1fr 100px 70px",
                                    gap: "8px", alignItems: "center",
                                }}>
                                    {(top[0]?.carrera ? ["#", "Estudiante", "Carrera", "XP", "Nivel"] : ["#", "Estudiante", "XP", "Nivel"]).map((h) => (
                                        <span key={h} style={{ fontSize: "11px", fontWeight: 600, color: "#006D77", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                            {h}
                                        </span>
                                    ))}
                                </div>
                                {resto.map((u) => (
                                    <FilaRanking
                                        key={u.usuarioId}
                                        usuario={u}
                                        esYo={user && u.usuarioId === user.id}
                                        mostrarCarrera={Boolean(top[0]?.carrera)}
                                        onClick={() => navigate(`/usuarios/${u.usuarioId}`)}
                                    />
                                ))}
                            </GlassCard>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

function PodioCard({ usuario, lugarVisual, onClick }) {
    const alturaBase =
        lugarVisual === 1 ? 160 :
            lugarVisual === 2 ? 130 : 110;

    // El estilo depende del lugar REAL del podio
    const posReal = lugarVisual;

    const color = COLOR_POSICION[posReal];

    const rgb =
        posReal === 1
            ? "196,154,63"
            : posReal === 2
                ? "160,181,200"
                : "169,113,63";

    const ring = RING_POSICION[posReal];

    return (
        <div
            style={{ textAlign: "center", cursor: "pointer" }}
            onClick={onClick}
        >
            <Avatar
                name={usuario.nombre}
                size={lugarVisual === 1 ? 68 : 56}
                ring={ring}
            />

            <div style={{ marginTop: "10px", marginBottom: "8px" }}>
                <p
                    style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 600,
                        fontSize: "13px",
                        margin: "0 0 2px",
                        color: "#0F3538"
                    }}
                >
                    {usuario.nombre.split(" ")[0]}
                </p>

                <span
                    style={{
                        display: "block",
                        fontSize: "12px",
                        fontWeight: 700,
                        color: color,
                        marginBottom: "4px"
                    }}
                >
                    #{usuario.posicion}
                </span>

                <span
                    style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "13px",
                        color: "#006D77",
                        fontWeight: 500
                    }}
                >
                    {Number(usuario.xp).toLocaleString("en-US")} XP
                </span>
            </div>

            <div
                style={{
                    height: alturaBase,
                    background: `rgba(${rgb}, 0.1)`,
                    border: `1px solid rgba(${rgb}, 0.25)`,
                    borderRadius: "12px 12px 0 0",
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "center",
                    paddingTop: "16px",
                }}
            >
                <div
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: `rgba(${rgb}, 0.15)`,
                        border: `2px solid ${color}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Medal size={17} color={color} />
                </div>
            </div>
        </div>
    );
}
// Fila de la tabla
function FilaRanking({ usuario, esYo, mostrarCarrera, onClick }) {
    const colorMedalla = COLOR_POSICION[usuario.posicion] || "#4E7276";
    const tieneTendencia = typeof usuario.cambio === "number";
    const IconoTendencia = usuario.cambio > 0 ? TrendingUp : usuario.cambio < 0 ? TrendingDown : Minus;
    const colorTendencia = usuario.cambio > 0 ? "#6db384" : usuario.cambio < 0 ? "#C4453C" : "#006D77";

    return (
        <div
            onClick={esYo ? undefined : onClick}
            style={{
                display: "grid",
                gridTemplateColumns: mostrarCarrera ? "50px 1fr 100px 100px 70px" : "50px 1fr 100px 70px",
                gap: "8px", alignItems: "center",
                padding: "10px 16px", borderRadius: "10px", marginBottom: "2px",
                cursor: esYo ? "default" : "pointer",
                background: esYo ? "rgba(0, 109, 119, 0.15)" : "transparent",
                border: esYo ? "1px solid rgba(0, 109, 119, 0.3)" : "1px solid transparent",
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                {usuario.posicion <= 3
                    ? <Medal size={15} color={colorMedalla} />
                    : <span style={{ fontFamily: "var(--font-mono)", fontSize: "14px", fontWeight: 600, color: esYo ? "#006D77" : "#4E7276" }}>#{usuario.posicion}</span>}
                {tieneTendencia && <IconoTendencia size={11} color={colorTendencia} />}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                <Avatar name={usuario.nombre} size={32} ring={RING_POSICION[usuario.posicion] || "none"} />
                <p style={{ margin: 0, fontSize: "13px", fontWeight: 500, color: "#0F3538", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {usuario.nombre}{esYo && <span style={{ fontSize: "11px", color: "#006D77", marginLeft: "6px" }}>(tú)</span>}
                </p>
            </div>

            {mostrarCarrera && (
                <span style={{ fontSize: "12px", color: "#4E7276", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {usuario.carrera}
                </span>
            )}

            <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "#006D77", fontWeight: 500 }}>
                {usuario.xp.toLocaleString()}
            </span>

            <Badge variant="neutral">{usuario.nivel}</Badge>
        </div>
    );
}