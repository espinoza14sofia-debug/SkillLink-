import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { usePerfil } from "../context/PerfilContext";

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

import {
    Avatar,
    Badge,
    XPBar,
    GlassCard,
    Button,
} from "../components/ui";

/* =========================================================
UTILIDADES
========================================================= */

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

/* =========================================================
   DASHBOARD
========================================================= */

export default function Dashboard() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const { perfil, cargandoPerfil, errorPerfil } = usePerfil();
    const [misionesActivas, setMisionesActivas] = useState([]); const [misionesCompletadasCount, setMisionesCompletadasCount] = useState(0);
    const [actividad, setActividad] = useState([]);

    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    /* =====================================================
       CARGAR DASHBOARD
    ===================================================== */

    useEffect(() => {
        let activo = true;

        const cargarDashboard = async () => {
            try {
                setCargando(true);
                setError("");

                /*
                 * Las tres peticiones son independientes.
                 *
                 * Antes:
                 *   1. perfil
                 *   2. misiones
                 *   3. actividad
                 *
                 * Ahora:
                 *   perfil + misiones + actividad
                 *   se solicitan al mismo tiempo.
                 */
                const [
                    respuestaMisiones,
                    respuestaActividad,
                ] = await Promise.allSettled([
                    api.get("/misiones"),
                    api.get("/actividad"),
                ]);

                /*
                 * Si el componente ya no está montado,
                 * no actualizamos el estado.
                 */
                if (!activo) return;

                /* =================================================
                   PERFIL
                ================================================= */

                if (!perfil) {
                    return;
                }

                const miId = String(perfil.id);
                /* =================================================
                   MISIONES
                ================================================= */

                if (respuestaMisiones.status === "fulfilled") {
                    const grupos = respuestaMisiones.value.data || [];

                    /*
                     * /misiones puede devolver grupos que contienen
                     * un arreglo de misiones.
                     */
                    const todasLasMisiones = Array.isArray(grupos)
                        ? grupos.flatMap(
                            (grupo) => grupo?.misiones || []
                        )
                        : [];

                    /*
                     * Nos quedamos solamente con las misiones
                     * asignadas al usuario actual.
                     */
                    const misMisiones = todasLasMisiones.filter(
                        (mision) =>
                            String(mision.usuarioAsignadoId) === miId
                    );

                    const esCompletada = (mision) =>
                        mision.estado === "completada";

                    /*
                     * Contador de misiones completadas.
                     */
                    const completadas = misMisiones.filter(
                        esCompletada
                    );

                    setMisionesCompletadasCount(
                        completadas.length
                    );

                    /*
                     * Misiones activas:
                     * - pertenecen al usuario
                     * - todavía no están completadas
                     * - máximo 4 para el dashboard
                     */
                    const activas = misMisiones
                        .filter((mision) => !esCompletada(mision))
                        .slice(0, 4);

                    setMisionesActivas(activas);
                } else {
                    console.error(
                        "Error obteniendo misiones:",
                        respuestaMisiones.reason
                    );

                    setMisionesActivas([]);
                    setMisionesCompletadasCount(0);
                }

                /* =================================================
                   ACTIVIDAD
                ================================================= */

                if (respuestaActividad.status === "fulfilled") {
                    const actividadData =
                        respuestaActividad.value.data || [];

                    setActividad(
                        Array.isArray(actividadData)
                            ? actividadData
                            : []
                    );
                } else {
                    console.error(
                        "Error obteniendo actividad:",
                        respuestaActividad.reason
                    );

                    setActividad([]);
                }
            } catch (err) {
                console.error(
                    "Error cargando dashboard:",
                    err
                );

                if (activo) {
                    setError(
                        "No se pudo cargar la información del dashboard."
                    );
                }
            } finally {
                if (activo) {
                    setCargando(false);
                }
            }
        };

        if (cargandoPerfil) return;
        if (!perfil) {
            setCargando(false);
            return;
        }

        cargarDashboard();

        return () => {
            activo = false;
        };
    }, [perfil, cargandoPerfil]);

    /* =========================================================
       LOGOUT
    ========================================================= */

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    /* =========================================================
       LOADING
    ========================================================= */

    if (cargando || cargandoPerfil) {
        return (
            <div>
                <Navbar />

                <div
                    style={{
                        maxWidth: "1200px",
                        margin: "0 auto",
                        padding: "90px 24px 32px",
                    }}
                >
                    <div
                        className="skeleton"
                        style={{
                            height: 180,
                            marginBottom: 24,
                            borderRadius: 16,
                        }}
                    />

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(3, 1fr)",
                            gap: 16,
                        }}
                    >
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="skeleton"
                                style={{
                                    height: 110,
                                    borderRadius: 16,
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    /* =========================================================
       ERROR
    ========================================================= */

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
                    <p style={{ color: "#0F3538" }}>
                        {error || "Ocurrió un error."}
                    </p>

                    <Button
                        variant="ghost"
                        onClick={handleLogout}
                    >
                        Cerrar sesión
                    </Button>
                </div>
            </div>
        );
    }

    /* =========================================================
       DATOS DEL PERFIL
    ========================================================= */

    const xp = perfil.xp ?? 0;
    const xpMax = perfil.xpProximoNivel ?? 0;

    const primerNombre =
        perfil.nombre?.split(" ")[0] || "Usuario";

    /* =========================================================
       RENDER
    ========================================================= */

    return (
        <div>
            <Navbar />

            <div
                style={{
                    maxWidth: "1200px",
                    margin: "0 auto",
                    padding: "90px 24px 32px",
                }}
            >
                {/* =================================================
                    BIENVENIDA
                ================================================= */}

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
                                fontFamily:
                                    "var(--font-display)",
                                fontSize: "28px",
                                fontWeight: 700,
                                margin: "0 0 4px",
                            }}
                        >
                            {saludoSegunHora()}, {primerNombre}
                        </h1>

                        <p
                            style={{
                                color: "#4E7276",
                                margin: 0,
                            }}
                        >
                            {perfil.xpRestante > 0
                                ? `Te faltan ${perfil.xpRestante} XP para el siguiente nivel.`
                                : "¡Nivel completo! Sigue así."}
                        </p>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                    >
                        Cerrar sesión
                    </Button>
                </div>

                {/* =================================================
                    LEVEL HERO CARD
                ================================================= */}

                <div
                    className="glass-card"
                    style={{
                        padding: "32px",
                        marginBottom: "24px",
                        background:
                            "rgba(0, 109, 119, 0.14)",
                        border:
                            "1px solid rgba(0, 109, 119, 0.35)",
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
                            border:
                                "1px solid rgba(0, 109, 119, 0.2)",
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
                            border:
                                "1px solid rgba(0, 109, 119, 0.15)",
                            pointerEvents: "none",
                        }}
                    />

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "24px",
                            flexWrap: "wrap",
                        }}
                    >
                        <Avatar
                            name={perfil.nombre}
                            size={72}
                            ring="gold"
                            level={perfil.nivel}
                        />

                        <div
                            style={{
                                flex: 1,
                                minWidth: 200,
                            }}
                        >
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
                                        fontFamily:
                                            "var(--font-display)",
                                        fontSize: "22px",
                                        fontWeight: 700,
                                        margin: 0,
                                    }}
                                >
                                    {perfil.nombre}
                                </h2>

                                <div
                                    style={{
                                        background:
                                            "rgba(15, 53, 56, 0.15)",
                                        border:
                                            "1px solid rgba(15, 53, 56, 0.4)",
                                        borderRadius: "999px",
                                        padding: "3px 12px",
                                    }}
                                >
                                    <span
                                        style={{
                                            fontFamily:
                                                "var(--font-display)",
                                            fontSize: "13px",
                                            fontWeight: 600,
                                            color: "#b78e38",
                                        }}
                                    >
                                        Nivel {perfil.nivel} —{" "}
                                        {perfil.titulo}
                                    </span>
                                </div>
                            </div>

                            {perfil.carrera && (
                                <p
                                    style={{
                                        color: "#4E7276",
                                        fontSize: "13px",
                                        margin: "0 0 16px",
                                    }}
                                >
                                    {perfil.carrera}
                                </p>
                            )}

                            <XPBar
                                value={xp}
                                max={xpMax}
                                showValues
                            />

                            <p
                                style={{
                                    fontSize: "12px",
                                    color: "#4E7276",
                                    margin:
                                        "6px 0 0",
                                }}
                            >
                                {perfil.xpRestante > 0 ? (
                                    <>
                                        Faltan{" "}
                                        <span
                                            style={{
                                                fontFamily:
                                                    "var(--font-mono)",
                                                color: "#006D77",
                                                fontWeight: 500,
                                            }}
                                        >
                                            {perfil.xpRestante.toLocaleString()}
                                        </span>{" "}
                                        XP para el siguiente
                                        nivel
                                    </>
                                ) : (
                                    "¡Nivel completo!"
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                {/* =================================================
                    ESTADÍSTICAS
                ================================================= */}

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(3, 1fr)",
                        gap: "16px",
                        marginBottom: "28px",
                    }}
                >
                    {[
                        {
                            label: "XP Total",
                            value: xp.toLocaleString(),
                            color: "#006D77",
                            Icon: Zap,
                            to: "/perfil",
                        },
                        {
                            label: "Insignias",
                            value:
                                perfil.insigniasDesbloqueadas ?? 0,
                            color: "#0F3538",
                            Icon: Star,
                            to: "/insignias",
                        },
                        {
                            label: "Misiones completadas",
                            value:
                                misionesCompletadasCount,
                            color: "#6db384",
                            Icon: Target,
                            to: "/misiones",
                        },
                    ].map(
                        ({
                            label,
                            value,
                            color,
                            Icon,
                            to,
                        }) => (
                            <Link
                                key={label}
                                to={to}
                                style={{
                                    textDecoration: "none",
                                }}
                            >
                                <GlassCard
                                    className="hover-lift"
                                    style={{
                                        padding:
                                            "22px 24px",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius:
                                                "12px",
                                            background: `rgba(${hexToRgb(
                                                color
                                            )}, 0.12)`,
                                            border: `1px solid rgba(${hexToRgb(
                                                color
                                            )}, 0.25)`,
                                            display:
                                                "flex",
                                            alignItems:
                                                "center",
                                            justifyContent:
                                                "center",
                                            marginBottom:
                                                "16px",
                                        }}
                                    >
                                        <Icon
                                            size={18}
                                            color={color}
                                        />
                                    </div>

                                    <div
                                        style={{
                                            fontFamily:
                                                "var(--font-mono)",
                                            fontSize: "28px",
                                            fontWeight: 600,
                                            color: "#0F3538",
                                            marginBottom:
                                                "4px",
                                        }}
                                    >
                                        {value}
                                    </div>

                                    <div
                                        style={{
                                            fontSize:
                                                "13px",
                                            color:
                                                "#4E7276",
                                        }}
                                    >
                                        {label}
                                    </div>
                                </GlassCard>
                            </Link>
                        )
                    )}
                </div>

                {/* =================================================
                    GRID PRINCIPAL
                ================================================= */}

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "1fr 340px",
                        gap: "20px",
                        marginBottom: "28px",
                    }}
                >
                    {/* =================================================
                        MISIONES ACTIVAS
                    ================================================= */}

                    <div>
                        <div
                            style={{
                                display: "flex",
                                alignItems:
                                    "center",
                                justifyContent:
                                    "space-between",
                                marginBottom:
                                    "16px",
                            }}
                        >
                            <h2
                                style={{
                                    fontFamily:
                                        "var(--font-display)",
                                    fontSize:
                                        "18px",
                                    fontWeight: 600,
                                    margin: 0,
                                }}
                            >
                                Misiones activas
                            </h2>

                            <Link
                                to="/misiones"
                                style={{
                                    textDecoration:
                                        "none",
                                }}
                            >
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    style={{
                                        display:
                                            "flex",
                                        alignItems:
                                            "center",
                                        gap: "6px",
                                    }}
                                >
                                    Ver todas
                                    <ChevronRight
                                        size={14}
                                    />
                                </Button>
                            </Link>
                        </div>

                        {misionesActivas.length ===
                            0 ? (
                            <GlassCard
                                style={{
                                    padding: "24px",
                                    textAlign:
                                        "center",
                                }}
                            >
                                <p
                                    style={{
                                        color:
                                            "#4E7276",
                                        fontSize:
                                            "13px",
                                        margin: 0,
                                    }}
                                >
                                    No tienes misiones
                                    activas ahora
                                    mismo.
                                </p>
                            </GlassCard>
                        ) : (
                            <div
                                style={{
                                    display:
                                        "flex",
                                    flexDirection:
                                        "column",
                                    gap: "10px",
                                }}
                            >
                                {misionesActivas.map(
                                    (mision) => (
                                        <MissionRow
                                            key={
                                                mision.id
                                            }
                                            mission={
                                                mision
                                            }
                                        />
                                    )
                                )}
                            </div>
                        )}
                    </div>

                    {/* =================================================
                        ACTIVIDAD RECIENTE
                    ================================================= */}

                    <div>
                        <h2
                            style={{
                                fontFamily:
                                    "var(--font-display)",
                                fontSize:
                                    "18px",
                                fontWeight: 600,
                                margin:
                                    "0 0 16px",
                            }}
                        >
                            Actividad reciente
                        </h2>

                        {actividad.length === 0 ? (
                            <GlassCard
                                style={{
                                    padding: "24px",
                                    textAlign:
                                        "center",
                                }}
                            >
                                <p
                                    style={{
                                        color:
                                            "#4E7276",
                                        fontSize:
                                            "13px",
                                        margin: 0,
                                    }}
                                >
                                    Aún no hay
                                    actividad
                                    reciente.
                                </p>
                            </GlassCard>
                        ) : (
                            <GlassCard
                                style={{
                                    padding: "8px",
                                }}
                            >
                                {actividad.map(
                                    (item, index) => (
                                        <div
                                            key={
                                                item.id ??
                                                index
                                            }
                                            style={{
                                                display:
                                                    "flex",
                                                gap: "12px",
                                                alignItems:
                                                    "flex-start",
                                                padding:
                                                    "12px",
                                                borderRadius:
                                                    "10px",
                                                borderBottom:
                                                    index <
                                                        actividad.length -
                                                        1
                                                        ? "1px solid rgba(15,53,56,0.06)"
                                                        : "none",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: 34,
                                                    height: 34,
                                                    borderRadius:
                                                        "10px",
                                                    flexShrink:
                                                        0,
                                                    background:
                                                        "rgba(0, 109, 119, 0.2)",
                                                    border:
                                                        "1px solid rgba(0, 109, 119, 0.3)",
                                                    display:
                                                        "flex",
                                                    alignItems:
                                                        "center",
                                                    justifyContent:
                                                        "center",
                                                }}
                                            >
                                                <CheckCircle
                                                    size={
                                                        15
                                                    }
                                                    color="#4E7276"
                                                />
                                            </div>

                                            <div
                                                style={{
                                                    flex: 1,
                                                }}
                                            >
                                                <p
                                                    style={{
                                                        margin:
                                                            "0 0 4px",
                                                        fontSize:
                                                            "13px",
                                                        color:
                                                            "#0F3538",
                                                        lineHeight:
                                                            1.4,
                                                    }}
                                                >
                                                    {
                                                        item.texto
                                                    }
                                                </p>

                                                <div
                                                    style={{
                                                        display:
                                                            "flex",
                                                        alignItems:
                                                            "center",
                                                        gap: "8px",
                                                    }}
                                                >
                                                    {item.xp !=
                                                        null && (
                                                            <span
                                                                style={{
                                                                    fontFamily:
                                                                        "var(--font-mono)",
                                                                    fontSize:
                                                                        "12px",
                                                                    color:
                                                                        "#6db384",
                                                                    fontWeight:
                                                                        500,
                                                                }}
                                                            >
                                                                +
                                                                {
                                                                    item.xp
                                                                }{" "}
                                                                XP
                                                            </span>
                                                        )}

                                                    <span
                                                        style={{
                                                            fontSize:
                                                                "11px",
                                                            color:
                                                                "#4E7276",
                                                        }}
                                                    >
                                                        hace{" "}
                                                        {
                                                            item.tiempo
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                )}
                            </GlassCard>
                        )}

                        {/* =================================================
                            ACCIONES RÁPIDAS
                        ================================================= */}

                        <div
                            style={{
                                marginTop: "16px",
                            }}
                        >
                            <h3
                                style={{
                                    fontFamily:
                                        "var(--font-display)",
                                    fontSize:
                                        "14px",
                                    fontWeight: 600,
                                    margin:
                                        "0 0 10px",
                                    color:
                                        "#4E7276",
                                }}
                            >
                                ACCIONES RÁPIDAS
                            </h3>

                            <div
                                style={{
                                    display:
                                        "flex",
                                    flexDirection:
                                        "column",
                                    gap: "8px",
                                }}
                            >
                                {[
                                    {
                                        label:
                                            "Ver mi equipo",
                                        path:
                                            "/mi-equipo",
                                        icon: Users,
                                    },
                                    {
                                        label:
                                            "Mensajes",
                                        path:
                                            "/mensajes",
                                        icon:
                                            MessageSquare,
                                    },
                                    {
                                        label:
                                            "Ranking global",
                                        path:
                                            "/ranking",
                                        icon:
                                            TrendingUp,
                                    },
                                    {
                                        label:
                                            "Mis insignias",
                                        path:
                                            "/insignias",
                                        icon: Star,
                                    },
                                ].map(
                                    ({
                                        label,
                                        path,
                                        icon: Icon,
                                    }) => (
                                        <Link
                                            key={
                                                path
                                            }
                                            to={
                                                path
                                            }
                                            style={{
                                                textDecoration:
                                                    "none",
                                            }}
                                        >
                                            <div
                                                className="glass-nested hover-lift"
                                                style={{
                                                    display:
                                                        "flex",
                                                    alignItems:
                                                        "center",
                                                    justifyContent:
                                                        "space-between",
                                                    padding:
                                                        "11px 14px",
                                                    cursor:
                                                        "pointer",
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        display:
                                                            "flex",
                                                        alignItems:
                                                            "center",
                                                        gap:
                                                            "10px",
                                                        fontSize:
                                                            "13px",
                                                        fontWeight:
                                                            500,
                                                        color:
                                                            "#0F3538",
                                                    }}
                                                >
                                                    <Icon
                                                        size={
                                                            15
                                                        }
                                                        color="#4E7276"
                                                    />

                                                    {
                                                        label
                                                    }
                                                </span>

                                                <ChevronRight
                                                    size={
                                                        14
                                                    }
                                                    color="#006D77"
                                                />
                                            </div>
                                        </Link>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* =========================================================
   ESTADO VISUAL DE UNA MISIÓN
========================================================= */

function derivarEstadoMision(mision) {
    if (mision.esUrgente || mision.vencida) {
        return {
            label: mision.vencida
                ? "Vencida"
                : "Urgente",
            variant: "error",
            Icon: AlertCircle,
        };
    }

    return {
        label: "En progreso",
        variant: "accent",
        Icon: Circle,
    };
}

/* =========================================================
   FILA DE MISIÓN
========================================================= */

function MissionRow({ mission }) {
    const estado = derivarEstadoMision(mission);

    const tieneProgreso =
        typeof mission.progreso === "number" &&
        mission.progreso > 0;

    return (
        <GlassCard
            className="hover-lift"
            style={{
                padding: "16px 20px",
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems:
                        "flex-start",
                    justifyContent:
                        "space-between",
                    marginBottom:
                        tieneProgreso
                            ? "12px"
                            : 0,
                }}
            >
                {/* INFORMACIÓN DE MISIÓN */}

                <div
                    style={{
                        flex: 1,
                    }}
                >
                    <div
                        style={{
                            display:
                                "flex",
                            alignItems:
                                "center",
                            gap: "10px",
                            flexWrap:
                                "wrap",
                            marginBottom:
                                "4px",
                        }}
                    >
                        <span
                            style={{
                                fontWeight:
                                    600,
                                fontSize:
                                    "14px",
                                fontFamily:
                                    "var(--font-display)",
                            }}
                        >
                            {mission.titulo}
                        </span>

                        <Badge
                            variant={
                                estado.variant
                            }
                        >
                            {estado.label}
                        </Badge>
                    </div>

                    <span
                        style={{
                            fontSize:
                                "12px",
                            color:
                                "#4E7276",
                        }}
                    >
                        {mission.proyectoNombre ||
                            mission.descripcion}
                    </span>
                </div>

                {/* XP + FECHA */}

                <div
                    style={{
                        display:
                            "flex",
                        flexDirection:
                            "column",
                        alignItems:
                            "flex-end",
                        gap: "4px",
                        marginLeft:
                            "16px",
                        flexShrink: 0,
                    }}
                >
                    <div
                        style={{
                            fontFamily:
                                "var(--font-mono)",
                            fontSize:
                                "13px",
                            fontWeight:
                                600,
                            color:
                                "#006D77",
                            background:
                                "rgba(0,109,119,0.2)",
                            padding:
                                "2px 8px",
                            borderRadius:
                                "6px",
                        }}
                    >
                        +{mission.xpValor} XP
                    </div>

                    {mission.fechaLimite && (
                        <div
                            style={{
                                display:
                                    "flex",
                                alignItems:
                                    "center",
                                gap: "4px",
                                fontSize:
                                    "11px",
                                color:
                                    "#4E7276",
                            }}
                        >
                            <Clock
                                size={
                                    11
                                }
                            />

                            {new Date(
                                mission.fechaLimite
                            ).toLocaleDateString(
                                "es-CR",
                                {
                                    day: "numeric",
                                    month: "short",
                                }
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* PROGRESO */}

            {tieneProgreso && (
                <XPBar
                    value={
                        mission.progreso
                    }
                    max={100}
                    label={`${mission.progreso}% completado`}
                />
            )}
        </GlassCard>
    );
}