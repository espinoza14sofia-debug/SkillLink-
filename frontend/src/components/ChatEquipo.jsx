import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./ChatEquipo.css";

const INTERVALO_POLLING_MS = 4000;

export default function ChatEquipo({ equipoId }) {
  const { user } = useAuth();
  const [mensajes, setMensajes] = useState([]);
  const [texto, setTexto] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  const ultimaFechaRef = useRef(null);
  const contenedorRef = useRef(null);
  const intervaloRef = useRef(null);

  useEffect(() => {
    if (!equipoId) return;

    const cargarHistorial = async () => {
      try {
        const { data } = await api.get(`/equipos/${equipoId}/mensajes`);
        setMensajes(data);
        if (data.length > 0) {
          ultimaFechaRef.current = data[data.length - 1].fecha;
        }
      } catch (err) {
        setError("No se pudo cargar el chat.");
      } finally {
        setCargando(false);
      }
    };

    cargarHistorial();
  }, [equipoId]);

  useEffect(() => {
    if (!equipoId) return;

    intervaloRef.current = setInterval(async () => {
      try {
        const params = ultimaFechaRef.current
          ? { desde: ultimaFechaRef.current }
          : {};
        const { data } = await api.get(`/equipos/${equipoId}/mensajes`, { params });

        if (data.length > 0) {
          setMensajes((prev) => [...prev, ...data]);
          ultimaFechaRef.current = data[data.length - 1].fecha;
        }
      } catch (err) {
        // Silencioso
      }
    }, INTERVALO_POLLING_MS);

    return () => clearInterval(intervaloRef.current);
  }, [equipoId]);

  useEffect(() => {
    if (contenedorRef.current) {
      contenedorRef.current.scrollTop = contenedorRef.current.scrollHeight;
    }
  }, [mensajes]);

  const handleEnviar = async (e) => {
    e.preventDefault();
    const contenido = texto.trim();
    if (!contenido || enviando) return;

    setEnviando(true);
    try {
      const { data } = await api.post(`/equipos/${equipoId}/mensajes`, { contenido });
      setMensajes((prev) => [...prev, data]);
      ultimaFechaRef.current = data.fecha;
      setTexto("");
    } catch (err) {
      setError("No se pudo enviar el mensaje.");
    } finally {
      setEnviando(false);
    }
  };

  if (cargando)
    return (
      <p style={{ color: "#4E7276", fontSize: "13px", padding: "16px", textAlign: "center" }}>
        Cargando chat...
      </p>
    );

  return (
    <div
      className="chat-equipo"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "transparent",
        boxShadow: "none",
        borderRadius: 0,
      }}
    >
      <div
        className="chat-mensajes"
        ref={contenedorRef}
        style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}
      >
        {mensajes.length === 0 && (
          <p style={{ color: "#4E7276", fontSize: "13px", textAlign: "center" }}>
            Aún no hay mensajes. ¡Sé el primero en escribir!
          </p>
        )}

        {mensajes.map((m) => {
          const esPropia = m.emisorId === user?.id;

          return (
            <div
              key={m.id}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: esPropia ? "flex-end" : "flex-start",
              }}
            >
              {!esPropia && (
                <span style={{ fontSize: "11px", color: "#4E7276", marginBottom: "3px", paddingLeft: "4px" }}>
                  {m.emisorNombre}
                </span>
              )}
              <div
                style={{
                  background: esPropia ? "#006D77" : "rgba(15, 53, 56, 0.08)",
                  border: esPropia ? "1px solid rgba(0, 109, 119, 0.5)" : "1px solid rgba(15, 53, 56, 0.1)",
                  borderRadius: "12px",
                  padding: "9px 13px",
                  maxWidth: "85%",
                  boxShadow: "none",
                }}
              >
                <p style={{ margin: 0, fontSize: "13px", color: esPropia ? "#FFFFFF" : "#0F3538", lineHeight: 1.5 }}>
                  {m.contenido}
                </p>
              </div>
              <span style={{ fontSize: "10px", color: "#006D77", marginTop: "3px", paddingLeft: "4px" }}>
                {new Date(m.fecha).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          );
        })}
      </div>

      {error && (
        <p style={{ color: "#C4453C", fontSize: "12px", padding: "0 16px" }}>{error}</p>
      )}

      <form
        onSubmit={handleEnviar}
        style={{
          padding: "12px 16px",
          borderTop: "1px solid rgba(15, 53, 56, 0.08)",
          display: "flex",
          gap: "8px",
        }}
      >
        <input
          type="text"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escribí un mensaje..."
          disabled={enviando}
          style={{
            flex: 1,
            background: "rgba(15, 53, 56, 0.06)",
            border: "1px solid rgba(15, 53, 56, 0.12)",
            borderRadius: "10px",
            padding: "9px 13px",
            color: "#0F3538",
            fontSize: "13px",
            outline: "none",
            fontFamily: "var(--font-body)",
          }}
        />
        <button
          type="submit"
          disabled={enviando || !texto.trim()}
          style={{
            width: 38,
            height: 38,
            borderRadius: "10px",
            border: "none",
            background: "#006D77",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            opacity: enviando || !texto.trim() ? 0.5 : 1,
            transition: "background 0.18s",
          }}
          onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.background = "#00565E")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#006D77")}
        >
          <Send size={15} color="#FFFFFF" />
        </button>
      </form>
    </div>
  );
}