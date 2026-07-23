import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, Medal, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Avatar, GlassCard, Badge } from "../components/ui";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const COLOR_POSICION = {
    1: "#c49a3f", // oro
    2: "#a0b5c8", // plata
    3: "#a9713f", // bronce
};

const RING_POSICION = { 1: "gold", 2: "silver", 3: "bronze" };

export default function Ranking() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [top, setTop] = useState([]);
    const [miPosicion, setMiPosicion] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const cargar = async () => {
            try {
                const { data } = await api.get("/ranking");
                setTop(data);
            } catch (err) {
                setError("No se pudo cargar el ranking.");
            }

            try {
                const { data } = await api.get("/ranking/mi-posicion");
                setMiPosicion(data);
            } catch (err) {
                setMiPosicion(null);
            } finally {
                setCargando(false);
            }
        };
        cargar();
    }, []);

    const estoyEnElTop = miPosicion && top.some((u) => u.usuarioId === miPosicion.usuarioId);
    const top3 = top.slice(0, 3);
    const resto = top.slice(3);

    if (cargando) {
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
                <div style={{ marginBottom: "28px" }}>
                    <h1 style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 700, margin: "0 0 6px" }}>
                        Ranking Global
                    </h1>
                    <p style={{ color: "#778DA9", margin: 0 }}>Los estudiantes con más XP en SkillLink</p>
                </div>

                {error && (
                    <GlassCard style={{ padding: "14px 18px", marginBottom: "20px", color: "#c97070", textAlign: "center" }}>
                        {error}
                    </GlassCard>
                )}

                {top.length === 0 && !error ? (
                    <GlassCard style={{ padding: "48px", textAlign: "center" }}>
                        <Trophy size={40} color="#415A77" style={{ margin: "0 auto 16px", display: "block", opacity: 0.5 }} />
                        <p style={{ color: "#778DA9", margin: 0 }}>Aún no hay usuarios en el ranking.</p>
                    </GlassCard>
                ) : (
                    <>
                        {/* Podio top 3 */}
                        {top3.length === 3 && (
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px", marginBottom: "28px", alignItems: "end" }}>
                                <PodioCard usuario={top3[1]} posicion={2} onClick={() => navigate(`/usuarios/${top3[1].usuarioId}`)} />
                                <PodioCard usuario={top3[0]} posicion={1} onClick={() => navigate(`/usuarios/${top3[0].usuarioId}`)} />
                                <PodioCard usuario={top3[2]} posicion={3} onClick={() => navigate(`/usuarios/${top3[2].usuarioId}`)} />
                            </div>
                        )}

                        {/* Mi posición destacada (si no estoy en el top visible) */}
                        {miPosicion && !estoyEnElTop && (
                            <GlassCard style={{
                                padding: "16px 20px", marginBottom: "16px",
                                background: "rgba(65, 90, 119, 0.2)", border: "1px solid rgba(65, 90, 119, 0.45)",
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "10px" }}>
                                    <TrendingUp size={14} color="#9db5cc" />
                                    <span style={{ fontSize: "12px", color: "#9db5cc", fontWeight: 500 }}>TU POSICIÓN</span>
                                </div>
                                <FilaRanking usuario={miPosicion} esYo onClick={() => {}} />
                            </GlassCard>
                        )}

                        {/* Tabla completa (desde el puesto 4) */}
                        {resto.length > 0 && (
                            <GlassCard style={{ padding: "8px" }}>
                                <div style={{
                                    padding: "8px 16px 12px", display: "grid",
                                    gridTemplateColumns: top[0]?.carrera ? "50px 1fr 100px 100px 70px" : "50px 1fr 100px 70px",
                                    gap: "8px", alignItems: "center",
                                }}>
                                    {(top[0]?.carrera ? ["#", "Estudiante", "Carrera", "XP", "Nivel"] : ["#", "Estudiante", "XP", "Nivel"]).map((h) => (
                                        <span key={h} style={{ fontSize: "11px", fontWeight: 600, color: "#415A77", textTransform: "uppercase", letterSpacing: "0.05em" }}>
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

// Tarjeta del podio (posiciones 1, 2 y 3), con medalla como ícono en vez de emoji
function PodioCard({ usuario, posicion, onClick }) {
    const alturaBase = posicion === 1 ? 160 : posicion === 2 ? 130 : 110;
    const color = COLOR_POSICION[posicion];
    const rgb = posicion === 1 ? "196,154,63" : posicion === 2 ? "160,181,200" : "169,113,63";

    return (
        <div style={{ textAlign: "center", cursor: "pointer" }} onClick={onClick}>
            <Avatar name={usuario.nombre} size={posicion === 1 ? 68 : 56} ring={RING_POSICION[posicion]} level={usuario.nivel} />
            <div style={{ marginTop: "10px", marginBottom: "8px" }}>
                <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "13px", margin: "0 0 2px", color: "#E0E1DD" }}>
                    {usuario.nombre.split(" ")[0]}
                </p>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "#9db5cc", fontWeight: 500 }}>
                    {usuario.xp.toLocaleString()} XP
                </span>
            </div>
            <div style={{
                height: alturaBase,
                background: `rgba(${rgb}, 0.1)`,
                border: `1px solid rgba(${rgb}, 0.25)`,
                borderRadius: "12px 12px 0 0",
                display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "16px",
            }}>
                <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: `rgba(${rgb}, 0.15)`, border: `2px solid ${color}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <Medal size={17} color={color} />
                </div>
            </div>
        </div>
    );
}

// Fila de la tabla / de "tu posición"
function FilaRanking({ usuario, esYo, mostrarCarrera, onClick }) {
    const colorMedalla = COLOR_POSICION[usuario.posicion];
    const tieneTendencia = typeof usuario.cambio === "number";
    const IconoTendencia = usuario.cambio > 0 ? TrendingUp : usuario.cambio < 0 ? TrendingDown : Minus;
    const colorTendencia = usuario.cambio > 0 ? "#6db384" : usuario.cambio < 0 ? "#c97070" : "#415A77";

    return (
        <div
            onClick={esYo ? undefined : onClick}
            style={{
                display: "grid",
                gridTemplateColumns: mostrarCarrera ? "50px 1fr 100px 100px 70px" : "50px 1fr 100px 70px",
                gap: "8px", alignItems: "center",
                padding: "10px 16px", borderRadius: "10px", marginBottom: "2px",
                cursor: esYo ? "default" : "pointer",
                background: esYo ? "rgba(65, 90, 119, 0.15)" : "transparent",
                border: esYo ? "1px solid rgba(65, 90, 119, 0.3)" : "1px solid transparent",
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                {usuario.posicion <= 3
                    ? <Medal size={15} color={colorMedalla} />
                    : <span style={{ fontFamily: "var(--font-mono)", fontSize: "14px", fontWeight: 600, color: esYo ? "#9db5cc" : "#778DA9" }}>#{usuario.posicion}</span>}
                {tieneTendencia && <IconoTendencia size={11} color={colorTendencia} />}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                <Avatar name={usuario.nombre} size={32} ring={RING_POSICION[usuario.posicion] || "none"} />
                <p style={{ margin: 0, fontSize: "13px", fontWeight: 500, color: "#E0E1DD", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {usuario.nombre}{esYo && <span style={{ fontSize: "11px", color: "#9db5cc", marginLeft: "6px" }}>(tú)</span>}
                </p>
            </div>

            {mostrarCarrera && (
                <span style={{ fontSize: "12px", color: "#778DA9", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {usuario.carrera}
                </span>
            )}

            <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "#9db5cc", fontWeight: 500 }}>
                {usuario.xp.toLocaleString()}
            </span>

            <Badge variant="neutral">{usuario.nivel}</Badge>
        </div>
    );
}