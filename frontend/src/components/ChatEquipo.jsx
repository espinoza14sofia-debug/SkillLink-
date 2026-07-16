import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./ChatEquipo.css";

const INTERVALO_POLLING_MS = 4000;

// Paleta de colores neutros/pastel — legible con texto oscuro
const PALETA_COLORES = [
  "#D8D3C5", // beige
  "#C9D6D3", // verde grisáceo
  "#D6CFE0", // lavanda suave
  "#D9C9BE", // terracota claro
  "#C7D3DE", // celeste grisáceo
  "#DAD4C0", // arena
  "#CDD9C4", // verde salvia
  "#DCCFCF", // rosa polvo
];

// Genera un índice de color estable a partir del id del usuario
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

  if (cargando) return <p className="chat-mensaje-estado">Cargando chat...</p>;

  return (
    <div className="chat-equipo">
      <div className="chat-mensajes" ref={contenedorRef}>
        {mensajes.length === 0 && (
          <p className="chat-mensaje-estado">Aún no hay mensajes. ¡Sé el primero en escribir!</p>
        )}

        {mensajes.map((m) => {
          const esPropia = m.emisorId === user?.id;
          const color = colorPorUsuario(m.emisorId);

          return (
            <div
              key={m.id}
              className={`chat-burbuja ${esPropia ? "propia" : ""}`}
              style={{ backgroundColor: color }}
            >
              <span className="chat-emisor">{m.emisorNombre}</span>
              <p className="chat-contenido">{m.contenido}</p>
              <span className="chat-hora">
                {new Date(m.fecha).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          );
        })}
      </div>

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
  );
}