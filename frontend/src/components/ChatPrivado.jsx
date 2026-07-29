import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const INTERVALO_POLLING_MS = 4000;

export default function ChatPrivado({ otroUsuarioId, otroUsuarioNombre, onCerrar }) {
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
    const cargarHistorial = async () => {
      try {
        const { data } = await api.get(`/mensajes-privados/${otroUsuarioId}`);
        setMensajes(data);
        if (data.length > 0) {
          ultimaFechaRef.current = data[data.length - 1].fecha;
        }
      } catch (err) {
        setError("No se pudo cargar la conversación.");
      } finally {
        setCargando(false);
      }
    };

    cargarHistorial();
  }, [otroUsuarioId]);

  useEffect(() => {
    intervaloRef.current = setInterval(async () => {
      try {
        const params = ultimaFechaRef.current
          ? { desde: ultimaFechaRef.current }
          : {};
        const { data } = await api.get(`/mensajes-privados/${otroUsuarioId}`, { params });

        if (data.length > 0) {
          setMensajes((prev) => [...prev, ...data]);
          ultimaFechaRef.current = data[data.length - 1].fecha;
        }
      } catch (err) {
        // Silencioso
      }
    }, INTERVALO_POLLING_MS);

    return () => clearInterval(intervaloRef.current);
  }, [otroUsuarioId]);

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
      const { data } = await api.post(`/mensajes-privados/${otroUsuarioId}`, { contenido });
      setMensajes((prev) => [...prev, data]);
      ultimaFechaRef.current = data.fecha;
      setTexto("");
    } catch (err) {
      setError("No se pudo enviar el mensaje.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="overlay" onClick={onCerrar}>
      <div
        className="glass-float fade-in"
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          maxWidth: "380px",
          height: "480px",
          margin: "24px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid rgba(224, 225, 221, 0.1)",
          }}
        >
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "15px", color: "#E0E1DD" }}>
            {otroUsuarioNombre}
          </span>
          <button
            onClick={onCerrar}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#778DA9",
              padding: "4px",
              display: "flex",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#E0E1DD")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#778DA9")}
          >
            <X size={18} />
          </button>
        </div>

        {/* Mensajes */}
        {cargando ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ color: "#778DA9", fontSize: "13px" }}>Cargando chat...</p>
          </div>
        ) : (
          <div
            ref={contenedorRef}
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px 20px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {mensajes.length === 0 && (
              <p style={{ textAlign: "center", color: "#778DA9", fontSize: "13px", padding: "12px" }}>
                Aún no hay mensajes. ¡Escribí el primero!
              </p>
            )}

            {mensajes.map((m) => {
              const esPropia = m.emisorId === user?.id;
              return (
                <div
                  key={m.id}
                  className={esPropia ? "bubble-self" : "bubble-other"}
                  style={{
                    maxWidth: "78%",
                    minWidth: "100px",
                    padding: "8px 12px",
                    alignSelf: esPropia ? "flex-end" : "flex-start",
                  }}
                >
                  <p style={{ margin: 0, fontSize: "13px", lineHeight: 1.4, color: "#E0E1DD", wordBreak: "break-word" }}>
                    {m.contenido}
                  </p>
                  <span
                    style={{
                      display: "block",
                      fontSize: "11px",
                      color: "#778DA9",
                      textAlign: "right",
                      marginTop: "3px",
                    }}
                  >
                    {new Date(m.fecha).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {error && (
          <p style={{ textAlign: "center", color: "#c97070", fontSize: "12px", padding: "0 16px 8px" }}>
            {error}
          </p>
        )}

        {/* Form */}
        <form
          onSubmit={handleEnviar}
          style={{
            display: "flex",
            gap: "8px",
            padding: "12px 16px",
            borderTop: "1px solid rgba(224, 225, 221, 0.1)",
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
              background: "rgba(224, 225, 221, 0.06)",
              border: "1px solid rgba(224, 225, 221, 0.15)",
              borderRadius: "999px",
              padding: "10px 16px",
              color: "#E0E1DD",
              fontSize: "13px",
              outline: "none",
              fontFamily: "var(--font-body)",
            }}
          />
          <button
            type="submit"
            disabled={enviando || !texto.trim()}
            style={{
              padding: "10px 20px",
              borderRadius: "999px",
              border: "none",
              background: "#415A77",
              color: "#E0E1DD",
              cursor: enviando || !texto.trim() ? "not-allowed" : "pointer",
              opacity: enviando || !texto.trim() ? 0.5 : 1,
              fontWeight: 500,
              fontSize: "13px",
              fontFamily: "var(--font-body)",
            }}
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}