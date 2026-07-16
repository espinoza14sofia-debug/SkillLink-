import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Misiones from './pages/Misiones';
import MiEquipo from './pages/MiEquipo';
import ProyectoDetalle from './pages/ProyectoDetalle';
import Insignias from './pages/Insignias';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
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