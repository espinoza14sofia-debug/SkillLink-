import { useEffect, useState } from 'react';
import './NotificacionLogro.css';

export default function NotificacionLogro({ logros, onCerrar }) {
    const [indice, setIndice] = useState(0);

    useEffect(() => {
        if (!logros || logros.length === 0) return;

        const timer = setTimeout(() => {
            if (indice < logros.length - 1) {
                setIndice((i) => i + 1);
            } else {
                onCerrar();
            }
        }, 3500);

        return () => clearTimeout(timer);
    }, [indice, logros, onCerrar]);

    if (!logros || logros.length === 0) return null;

    const logro = logros[indice];

    return (
        <div className="notificacion-logro">
            <span className="notificacion-icono">🏅</span>
            <div className="notificacion-texto">
                <strong>¡Nueva insignia desbloqueada!</strong>
                <span>{logro.nombre}</span>
            </div>
        </div>
    );
}