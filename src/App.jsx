import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RoleRoute from './components/RoleRoute';

import Login from './pages/Login';

import DashboardAdmin from './pages/DashboardAdmin';
import Administracion from './pages/Administracion';
import GestionUsuarios from './pages/GestionUsuarios';
import RegistroCarga from './pages/RegistroCarga';

import Dashboard from './pages/Dashboard';
import Recepcion from './pages/Recepcion';
import Transporte from './pages/Transporte';
import Despacho from './pages/Despacho';
import GestionBultos from './pages/GestionBultos';
import Actas from './pages/Actas';

// Temporal
import RegistroUsuario from './pages/RegistroUsuario';

function App() {
  return (
    <Router>
      <Routes>
        {/* PÚBLICO / LOGIN */}
        <Route path="/" element={<Login />} />

        {/* REGISTRO TEMPORAL */}
        <Route path="/registro-usuario" element={<RegistroUsuario />} />

        {/* ADMINISTRADOR */}
        <Route
          path="/admin-home"
          element={
            <RoleRoute allowedRoles={['administrador']}>
              <DashboardAdmin />
            </RoleRoute>
          }
        />

        <Route
          path="/administracion"
          element={
            <RoleRoute allowedRoles={['administrador']}>
              <Administracion />
            </RoleRoute>
          }
        />

        <Route
          path="/cargas"
          element={
            <RoleRoute allowedRoles={['administrador']}>
              <RegistroCarga />
            </RoleRoute>
          }
        />

        <Route
          path="/usuarios"
          element={
            <RoleRoute allowedRoles={['administrador']}>
              <GestionUsuarios />
            </RoleRoute>
          }
        />

        {/* OPERACIONES Y ATARAMA */}
        <Route
          path="/dashboard"
          element={
            <RoleRoute allowedRoles={['administrador', 'operaciones', 'atarama']}>
              <Dashboard />
            </RoleRoute>
          }
        />

        <Route
          path="/recepcion"
          element={
            <RoleRoute allowedRoles={['administrador', 'operaciones']}>
              <Recepcion />
            </RoleRoute>
          }
        />

        <Route
          path="/transporte"
          element={
            <RoleRoute allowedRoles={['administrador', 'operaciones', 'atarama']}>
              <Transporte />
            </RoleRoute>
          }
        />

        <Route
          path="/despacho"
          element={
            <RoleRoute allowedRoles={['administrador', 'operaciones', 'atarama']}>
              <Despacho />
            </RoleRoute>
          }
        />

        <Route
          path="/bultos"
          element={
            <RoleRoute allowedRoles={['administrador', 'operaciones']}>
              <GestionBultos />
            </RoleRoute>
          }
        />

        {/* NUEVA RUTA: ACTAS */}
        <Route
          path="/actas"
          element={
            <RoleRoute allowedRoles={['administrador', 'operaciones', 'atarama']}>
              <Actas />
            </RoleRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
