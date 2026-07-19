import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./ChatPrivado.css";

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
    <div className="chat-privado-overlay" onClick={onCerrar}>
      <div className="chat-privado-modal" onClick={(e) => e.stopPropagation()}>
        <div className="chat-privado-header">
          <span>{otroUsuarioNombre}</span>
          <button className="chat-privado-cerrar" onClick={onCerrar}>✕</button>
        </div>

        {cargando ? (
          <p className="chat-mensaje-estado">Cargando chat...</p>
        ) : (
          <div className="chat-mensajes" ref={contenedorRef}>
            {mensajes.length === 0 && (
              <p className="chat-mensaje-estado">Aún no hay mensajes. ¡Escribí el primero!</p>
            )}

            {mensajes.map((m) => {
              const esPropia = m.emisorId === user?.id;
              return (
                <div
                  key={m.id}
                  className={`chat-burbuja-privada ${esPropia ? "propia" : ""}`}
                >
                  <p className="chat-contenido">{m.contenido}</p>
                  <span className="chat-hora">
                    {new Date(m.fecha).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {error && <p className="chat-mensaje-estado error">{error}</p>}

        <form className="chat-form" onSubmit={handleEnviar}>
          <input
            type="text"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escribí un mensaje..."
            disabled={enviando}
          />
          <button type="submit" disabled={enviando || !texto.trim()}>
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}
