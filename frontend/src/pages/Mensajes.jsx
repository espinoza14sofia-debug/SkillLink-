import { useEffect, useState } from "react";
import { Plus, X, Search, MessageSquare } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Navbar from "../components/Navbar";
import ChatEquipo from "../components/ChatEquipo";
import ChatPrivado from "../components/ChatPrivado";
import { Avatar, GlassCard } from "../components/ui";

export default function Mensajes() {
    const { user } = useAuth();

    const [tab, setTab] = useState("equipo"); // 'equipo' | 'privados'

    // --- Equipos ---
    const [equipos, setEquipos] = useState([]);
    const [equipoActivo, setEquipoActivo] = useState(null);

    // --- Privados ---
    const [conversaciones, setConversaciones] = useState([]);
    const [chatPrivadoAbierto, setChatPrivadoAbierto] = useState(null); // { id, nombre } | null
    const [mostrarBuscador, setMostrarBuscador] = useState(false);
    const [todosLosUsuarios, setTodosLosUsuarios] = useState([]);
    const [busqueda, setBusqueda] = useState("");

    // Cargar mis equipos (soporta varios; el usuario elige con cuál chatear)
    useEffect(() => {
        const cargarEquipos = async () => {
            try {
                const { data } = await api.get("/equipos/mios");
                setEquipos(data);
                if (data.length > 0) setEquipoActivo(data[0]);
            } catch (err) {
                setEquipos([]);
            }
        };
        cargarEquipos();
    }, []);

    // Cargar conversaciones privadas cada vez que se entra a esa pestaña
    useEffect(() => {
        if (tab !== "privados") return;
        const cargarConversaciones = async () => {
            try {
                const { data } = await api.get("/mensajes-privados/conversaciones");
                setConversaciones(data);
            } catch (err) {
                setConversaciones([]);
            }
        };
        cargarConversaciones();
    }, [tab, chatPrivadoAbierto]); // se refresca también al cerrar un chat (por si mandaste mensajes nuevos)

    // Cargar usuarios para el buscador de "nueva conversación" (una sola vez)
    useEffect(() => {
        if (!mostrarBuscador || todosLosUsuarios.length > 0) return;
        const cargarUsuarios = async () => {
            try {
                const { data } = await api.get("/usuarios");
                setTodosLosUsuarios(data.filter((u) => u.id !== user?.id));
            } catch (err) {
                setTodosLosUsuarios([]);
            }
        };
        cargarUsuarios();
    }, [mostrarBuscador, todosLosUsuarios.length, user?.id]);

    const usuariosFiltrados = todosLosUsuarios.filter((u) =>
        u.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div>
            <Navbar />
            <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "90px 24px 32px" }}>
                <h1 style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 700, margin: "0 0 16px" }}>
                    Mensajes
                </h1>

                {/* Tabs */}
                <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
                    {[
                        { key: "equipo", label: "Equipo" },
                        { key: "privados", label: "Privados" },
                    ].map((t) => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            style={{
                                padding: "8px 16px", borderRadius: "999px", fontSize: "13px", fontWeight: 500,
                                cursor: "pointer", border: "none",
                                background: tab === t.key ? "#415A77" : "rgba(224, 225, 221, 0.08)",
                                color: tab === t.key ? "#E0E1DD" : "#778DA9",
                            }}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {tab === "equipo" && (
                    <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "16px", height: "600px" }}>
                        {/* Lista de equipos */}
                        <GlassCard style={{ padding: 0, overflowY: "auto" }}>
                            {equipos.length === 0 && (
                                <p style={{ color: "#778DA9", fontSize: "13px", padding: "16px", textAlign: "center" }}>
                                    No estás en ningún equipo todavía.
                                </p>
                            )}
                            {equipos.map((eq) => (
                                <div
                                    key={eq.id}
                                    onClick={() => setEquipoActivo(eq)}
                                    style={{
                                        display: "flex", gap: "12px", alignItems: "center", padding: "12px 16px", cursor: "pointer",
                                        background: equipoActivo?.id === eq.id ? "rgba(65, 90, 119, 0.25)" : "transparent",
                                        borderLeft: equipoActivo?.id === eq.id ? "3px solid #415A77" : "3px solid transparent",
                                    }}
                                >
                                    <Avatar name={eq.nombre} size={38} ring="none" />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 500, fontSize: "14px", color: "#E0E1DD" }}>{eq.nombre}</div>
                                        <div style={{ fontSize: "12px", color: "#778DA9" }}>
                                            {eq.miembros?.length ? `${eq.miembros.length} integrantes` : "Equipo"}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </GlassCard>

                        {/* Chat del equipo activo (tu componente real, sin tocar) */}
                        <GlassCard style={{ padding: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                            {equipoActivo ? (
                                <>
                                    <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(224,225,221,0.08)" }}>
                                        <p style={{ fontWeight: 600, margin: 0, fontSize: "15px" }}>{equipoActivo.nombre}</p>
                                    </div>
                                    <div style={{ flex: 1, overflow: "hidden" }}>
                                        <ChatEquipo equipoId={equipoActivo.id} />
                                    </div>
                                </>
                            ) : (
                                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#778DA9", fontSize: "13px" }}>
                                    Elegí un equipo para ver su chat
                                </div>
                            )}
                        </GlassCard>
                    </div>
                )}

                {tab === "privados" && (
                    <>
                        <GlassCard style={{ padding: 0, maxWidth: 420 }}>
                            <div style={{ padding: "12px 14px", borderBottom: "1px solid rgba(224,225,221,0.08)" }}>
                                <button
                                    onClick={() => setMostrarBuscador((v) => !v)}
                                    style={{
                                        width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                                        padding: "8px", borderRadius: "10px", border: "none", cursor: "pointer",
                                        background: "rgba(65, 90, 119, 0.25)", color: "#E0E1DD", fontSize: "13px", fontWeight: 500,
                                    }}
                                >
                                    {mostrarBuscador ? <X size={14} /> : <Plus size={14} />}
                                    {mostrarBuscador ? "Cancelar" : "Nueva conversación"}
                                </button>
                            </div>

                            {mostrarBuscador && (
                                <div style={{ padding: "10px 14px", borderBottom: "1px solid rgba(224,225,221,0.08)" }}>
                                    <div style={{ position: "relative", marginBottom: "8px" }}>
                                        <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#778DA9" }} />
                                        <input
                                            value={busqueda}
                                            onChange={(e) => setBusqueda(e.target.value)}
                                            placeholder="Buscar usuario…"
                                            style={{
                                                width: "100%", padding: "8px 10px 8px 30px", boxSizing: "border-box",
                                                background: "rgba(224,225,221,0.06)", border: "1px solid rgba(224,225,221,0.1)",
                                                borderRadius: "8px", color: "#E0E1DD", fontSize: "12px", outline: "none",
                                            }}
                                        />
                                    </div>
                                    <div style={{ maxHeight: 180, overflowY: "auto", display: "flex", flexDirection: "column", gap: "2px" }}>
                                        {usuariosFiltrados.map((u) => (
                                            <div
                                                key={u.id}
                                                onClick={() => {
                                                    setChatPrivadoAbierto({ id: u.id, nombre: u.nombre });
                                                    setMostrarBuscador(false);
                                                    setBusqueda("");
                                                }}
                                                style={{ display: "flex", alignItems: "center", gap: "8px", padding: "7px 8px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", color: "#E0E1DD" }}
                                                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(224,225,221,0.06)")}
                                                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                            >
                                                <Avatar name={u.nombre} size={24} ring="none" />
                                                {u.nombre}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                {conversaciones.length === 0 && !mostrarBuscador && (
                                    <p style={{ color: "#778DA9", fontSize: "13px", padding: "16px", textAlign: "center" }}>
                                        Todavía no tenés conversaciones. Tocá "Nueva conversación" para empezar una.
                                    </p>
                                )}
                                {conversaciones.map((c) => (
                                    <div
                                        key={c.usuarioId}
                                        onClick={() => setChatPrivadoAbierto({ id: c.usuarioId, nombre: c.nombre })}
                                        style={{ display: "flex", gap: "12px", alignItems: "center", padding: "12px 16px", cursor: "pointer" }}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(224,225,221,0.04)")}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                    >
                                        <Avatar name={c.nombre} size={38} ring="none" />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                <span style={{ fontWeight: 500, fontSize: "14px", color: "#E0E1DD" }}>{c.nombre}</span>
                                                <span style={{ fontSize: "11px", color: "#415A77" }}>
                                                    {new Date(c.fecha).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}
                                                </span>
                                            </div>
                                            <span style={{ fontSize: "12px", color: "#778DA9", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block", maxWidth: "260px" }}>
                                                {c.ultimoMensaje}
                                            </span>
                                        </div>
                                        <MessageSquare size={14} color="#415A77" />
                                    </div>
                                ))}
                            </div>
                        </GlassCard>


                        {chatPrivadoAbierto && (
                            <ChatPrivado
                                otroUsuarioId={chatPrivadoAbierto.id}
                                otroUsuarioNombre={chatPrivadoAbierto.nombre}
                                onCerrar={() => setChatPrivadoAbierto(null)}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}