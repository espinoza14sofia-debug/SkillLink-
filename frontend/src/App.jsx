import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AvisoNivel from './components/AvisoNivel';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Misiones from './pages/Misiones';
import MiEquipo from './pages/MiEquipo';
import ProyectoDetalle from './pages/ProyectoDetalle';
import Insignias from './pages/Insignias';
import MisProyectos from './pages/MisProyectos';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AvisoNivel />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
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
          <Route path="/" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;