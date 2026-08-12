import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PerfilProvider } from './context/PerfilContext';
import ProtectedRoute from './components/ProtectedRoute';
import AvisoNivel from './components/AvisoNivel';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Misiones from './pages/Misiones';
import MiEquipo from './pages/MiEquipo';
import MisEquipos from './pages/MisEquipos';
import ProyectoDetalle from './pages/ProyectoDetalle';
import Insignias from './pages/Insignias';
import MisProyectos from './pages/MisProyectos';
import Mensajes from './pages/Mensajes';
import Ranking from './pages/Ranking';
import Perfil from './pages/Perfil';
import PerfilPublico from './pages/PerfilPublico';
import BuscarPorHabilidad from './pages/BuscarPorHabilidad';
import OlvideContrasena from './pages/OlvideContrasena';
import RestablecerContrasena from './pages/RestablecerContrasena';

function App() {
  return (
    <AuthProvider>
      <PerfilProvider>
        <BrowserRouter>
          <AvisoNivel />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/olvide-contrasena" element={<OlvideContrasena />} />
            <Route path="/restablecer-password" element={<RestablecerContrasena />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/misiones"
              element={
                <ProtectedRoute>
                  <Misiones />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mis-equipos"
              element={
                <ProtectedRoute>
                  <MisEquipos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mi-equipo"
              element={
                <ProtectedRoute>
                  <MiEquipo />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mis-proyectos"
              element={
                <ProtectedRoute>
                  <MisProyectos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/proyectos/:id"
              element={
                <ProtectedRoute>
                  <ProyectoDetalle />
                </ProtectedRoute>
              }
            />
            <Route
              path="/insignias"
              element={
                <ProtectedRoute>
                  <Insignias />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mensajes"
              element={
                <ProtectedRoute>
                  <Mensajes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ranking"
              element={
                <ProtectedRoute>
                  <Ranking />
                </ProtectedRoute>
              }
            />
            <Route
              path="/perfil"
              element={
                <ProtectedRoute>
                  <Perfil />
                </ProtectedRoute>
              }
            />
            <Route
              path="/usuarios/:id"
              element={
                <ProtectedRoute>
                  <PerfilPublico />
                </ProtectedRoute>
              }
            />
            <Route
              path="/buscar-habilidad"
              element={
                <ProtectedRoute>
                  <BuscarPorHabilidad />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Login />} />
          </Routes>
        </BrowserRouter>
      </PerfilProvider>
    </AuthProvider>
  );
}

export default App;