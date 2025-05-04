import Navbar from './Navbar'
import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

const Layout = ({ children }) => {
  const location = useLocation()
  const navigate = useNavigate()

  // Redirige al login si no hay token
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/')
    }
  }, [location, navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-orange-600 text-white">
      <Navbar />
      <main className="p-8">{children}</main>
    </div>
  )
}

export default Layout
