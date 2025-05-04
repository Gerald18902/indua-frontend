import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Registro from './pages/Registro'
import Recepcion from './pages/Recepcion'
import Transporte from './pages/Transporte'
import Despacho from './pages/Despacho'
import GestionBultos from './pages/GestionBultos'
import GestionUsuarios from './pages/GestionUsuarios'
import RoleRoute from './components/RoleRoute'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        <Route path="/recepcion" element={
          <RoleRoute allowedRoles={['administrador', 'operaciones']}>
            <Recepcion />
          </RoleRoute>
        } />

        <Route path="/transporte" element={
          <RoleRoute allowedRoles={['administrador', 'operaciones', 'atarama']}>
            <Transporte />
          </RoleRoute>
        } />

        <Route path="/despacho" element={
          <RoleRoute allowedRoles={['administrador', 'operaciones', 'atarama']}>
            <Despacho />
          </RoleRoute>
        } />

        <Route path="/bultos" element={
          <RoleRoute allowedRoles={['administrador', 'operaciones']}>
            <GestionBultos />
          </RoleRoute>
        } />

        <Route path="/usuarios" element={
          <RoleRoute allowedRoles={['administrador']}>
            <GestionUsuarios />
          </RoleRoute>
        } />
      </Routes>

    </Router>
  )
}

export default App
