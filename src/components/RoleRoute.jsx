import { Navigate } from 'react-router-dom'

const RoleRoute = ({ allowedRoles, children }) => {
  const token = localStorage.getItem('token')
  const rol = localStorage.getItem('rol')

  if (!token) return <Navigate to="/" replace />

  return allowedRoles.includes(rol) ? children : <Navigate to="/recepcion" replace />
}

export default RoleRoute
