import { Navigate } from 'react-router-dom'

const RoleRoute = ({ allowedRoles, children }) => {
  const token = localStorage.getItem('token')
  const rol = localStorage.getItem('rol')

  if (!token || !rol) return <Navigate to="/" replace />

  return allowedRoles.includes(rol.toLowerCase())
    ? children
    : <Navigate to="/recepcion" replace />
}


export default RoleRoute
