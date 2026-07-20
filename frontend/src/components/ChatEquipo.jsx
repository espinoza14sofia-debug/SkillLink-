import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./ChatEquipo.css";

const INTERVALO_POLLING_MS = 4000;

 
const PALETA_COLORES = [
  "rgba(55, 61, 67, 0.69)",   // azul acero
  "rgba(119, 141, 169, 0.3)",  // azul grisáceo
  "rgba(109, 179, 132, 0.25)", // verde salvia
  "rgba(117, 117, 129, 0.59)",  // dorado suave
  "rgb(112, 70, 91)",  // mauve
  "rgba(27, 38, 59, 0.6)",     // azul marino oscuro
  "rgba(130, 89, 39, 0.91)", // celeste
  "rgba(169, 128, 128, 0.15)", // rosa apagado
];

function colorPorUsuario(id) {
  if (!id) return PALETA_COLORES[0];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const indice = Math.abs(hash) % PALETA_COLORES.length;
  return PALETA_COLORES[indice];
}

export default function ChatEquipo({ equipoId }) {
  const { user } = useAuth();
  const [mensajes, setMensajes] = useState([]);
  const [texto, setTexto] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [toastXp, setToastXp] = useState(null);

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

      if (data.xpGanado) {
        setToastXp(data.xpGanado);
        setTimeout(() => setToastXp(null), 3000);
      }
    } catch (err) {
      setError("No se pudo enviar el mensaje.");
    } finally {
      setEnviando(false);
    }
  };

  if (cargando)
    return (
      <p style={{ color: "#778DA9", fontSize: "13px", padding: "16px", textAlign: "center" }}>
        Cargando chat...
      </p>
    );

  return (
    <div
      className="chat-equipo"
      style={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      <div
        className="chat-mensajes"
        ref={contenedorRef}
        style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}
      >
        {mensajes.length === 0 && (
          <p style={{ color: "#778DA9", fontSize: "13px", textAlign: "center" }}>
            Aún no hay mensajes. ¡Sé el primero en escribir!
          </p>
        )}

        {mensajes.map((m) => {
          const esPropia = m.emisorId === user?.id;
          const color = colorPorUsuario(m.emisorId);

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
                <span style={{ fontSize: "11px", color: "#778DA9", marginBottom: "3px", paddingLeft: "4px" }}>
                  {m.emisorNombre}
                </span>
              )}
              <div
                style={{
                  background: color,
                  border: "1px solid rgba(255, 255, 255, 0.16)",
                  borderRadius: "12px",
                  padding: "9px 13px",
                  maxWidth: "85%",
                }}
              >
                <p style={{ margin: 0, fontSize: "13px", color: "#030303", lineHeight: 1.5 }}>
                  {m.contenido}
                </p>
              </div>
              <span style={{ fontSize: "10px", color: "#415A77", marginTop: "3px", paddingLeft: "4px" }}>
                {new Date(m.fecha).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          );
        })}
      </div>

      {error && (
        <p style={{ color: "#c97070", fontSize: "12px", padding: "0 16px" }}>{error}</p>
      )}

<<<<<<< Updated upstream
      {toastXp && <div className="chat-toast-xp">+{toastXp} XP</div>}

      <form className="chat-form" onSubmit={handleEnviar}>
=======
      <form
        onSubmit={handleEnviar}
        style={{
          padding: "12px 16px",
          borderTop: "1px solid rgba(22, 22, 23, 0.44)",
          display: "flex",
          gap: "8px",
        }}
      >
>>>>>>> Stashed changes
        <input
          type="text"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escribí un mensaje..."
          disabled={enviando}
          style={{
            flex: 1,
            background: "rgba(201, 201, 202, 0.91)",
            border: "1px solid rgba(173, 174, 178, 0.54)",
            borderRadius: "10px",
            padding: "9px 13px",
            color: "#020202",
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
            background: "#8a8b8c",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            opacity: enviando || !texto.trim() ? 0.5 : 1,
          }}
        >
          <span style={{ color: "#232121", fontSize: "13px" }}>➤</span>
        </button>
      </form>
    </div>
  );
}