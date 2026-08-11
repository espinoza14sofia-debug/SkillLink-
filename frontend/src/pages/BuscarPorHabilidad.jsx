import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Sparkles } from "lucide-react"
import api from "../services/api"
import Navbar from "../components/Navbar"
import { Avatar, GlassCard, Badge, EmptyState, Input } from "../components/ui"

const nivelVariant = {
    Básico: "neutral",
    Intermedio: "accent",
    Avanzado: "success",
}

export default function BuscarPorHabilidad() {
    const navigate = useNavigate()
    const [query, setQuery] = useState("")
    const [resultados, setResultados] = useState([])
    const [buscando, setBuscando] = useState(false)
    const [yaBusco, setYaBusco] = useState(false)
    const debounceRef = useRef(null)

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current)

        const texto = query.trim()
        if (texto.length < 2) {
            setResultados([])
            setYaBusco(false)
            return
        }

        debounceRef.current = setTimeout(async () => {
            setBuscando(true)
            try {
                const { data } = await api.get("/habilidades/buscar", { params: { query: texto } })
                setResultados(data || [])
            } catch (err) {
                console.error("Error al buscar por habilidad:", err)
                setResultados([])
            } finally {
                setBuscando(false)
                setYaBusco(true)
            }
        }, 400)

        return () => clearTimeout(debounceRef.current)
    }, [query])

    return (
        <div>
            <Navbar />
            <div style={{ maxWidth: "780px", margin: "0 auto", padding: "90px 24px 48px" }}>
                <div style={{ marginBottom: "24px" }}>
                    <h1 style={{ fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: 700, color: "#0F3538", margin: "0 0 6px", display: "flex", alignItems: "center", gap: "10px" }}>
                        <Sparkles size={22} style={{ color: "#006D77" }} />
                        Buscar por habilidad
                    </h1>
                    <p style={{ color: "#4E7276", fontSize: "14px", margin: 0 }}>
                        Escribí una tecnología o habilidad y encontrá a los compañeros que la tienen en su perfil.
                    </p>
                </div>

                <Input
                    icon={<Search size={16} />}
                    placeholder="   "
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoFocus
                    style={{ marginBottom: "28px" }}
                />

                {buscando && (
                    <div style={{ display: "flex", justifyContent: "center", padding: "24px" }}>
                        <div className="loading-spinner" />
                    </div>
                )}

                {!buscando && yaBusco && resultados.length === 0 && (
                    <EmptyState
                        icon={<Search size={40} />}
                        title="Sin resultados"
                        desc={`Nadie tiene registrada una habilidad que coincida con "${query.trim()}".`}
                    />
                )}

                {!buscando && resultados.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {resultados.map((u) => (
                            <GlassCard
                                key={u.usuarioId}
                                className="hover-lift"
                                style={{ padding: "16px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: "16px" }}
                                onClick={() => navigate(`/usuarios/${u.usuarioId}`)}
                            >
                                <Avatar src={u.foto} name={u.nombre || "Usuario"} size={48} ring="silver" />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ margin: "0 0 2px", color: "#0F3538", fontWeight: 600, fontSize: "15px" }}>
                                        {u.nombre}
                                    </p>
                                    <p style={{ margin: 0, color: "#4E7276", fontSize: "13px" }}>
                                        {u.carrera || "Sin carrera registrada"}
                                    </p>
                                </div>
                                <Badge variant={nivelVariant[u.nivelHabilidad] || "neutral"}>
                                    {u.habilidadCoincidente} · {u.nivelHabilidad}
                                </Badge>
                            </GlassCard>
                        ))}
                    </div>
                )}

                {!yaBusco && !buscando && (
                    <EmptyState
                        icon={<Sparkles size={40} />}
                        title="Encontrá compañeros por habilidad"
                    />
                )}
            </div>
        </div>
    )
}
