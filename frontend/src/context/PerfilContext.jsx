import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { useAuth } from "./AuthContext";

const PerfilContext = createContext(null);

export function PerfilProvider({ children }) {
    const { isAuthenticated } = useAuth();
    const [perfil, setPerfil] = useState(null);
    const [cargandoPerfil, setCargandoPerfil] = useState(true);
    const [errorPerfil, setErrorPerfil] = useState(null);

    const recargarPerfil = useCallback(async () => {
        try {
            setCargandoPerfil(true);
            const respuesta = await api.get("/usuarios/me");
            setPerfil(respuesta.data);
            setErrorPerfil(null);
        } catch (err) {
            setErrorPerfil(err);
            setPerfil(null);
        } finally {
            setCargandoPerfil(false);
        }
    }, []);

    useEffect(() => {
        if (!isAuthenticated) {
            setPerfil(null);
            setCargandoPerfil(false);
            return;
        }
        recargarPerfil();
    }, [isAuthenticated, recargarPerfil]);

    return (
        <PerfilContext.Provider
            value={{ perfil, cargandoPerfil, errorPerfil, recargarPerfil }}
        >
            {children}
        </PerfilContext.Provider>
    );
}

export function usePerfil() {
    const ctx = useContext(PerfilContext);
    if (!ctx) {
        throw new Error("usePerfil debe usarse dentro de un PerfilProvider");
    }
    return ctx;
}