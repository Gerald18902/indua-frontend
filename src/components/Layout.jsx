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
    <div className="relative min-h-screen bg-gray-900 overflow-hidden text-white">
      {/* Blobs de fondo */}
      <div className="absolute w-[600px] h-[600px] bg-gradient-to-r from-[#FF754B] to-[#5D4BFF] rounded-full blur-3xl opacity-30 top-[-150px] left-[-150px]" />
      <div className="absolute w-[500px] h-[500px] bg-gradient-to-r from-[#5D4BFF] to-[#FF754B] rounded-full blur-3xl opacity-30 bottom-[-100px] right-[-100px]" />

      {/* Contenido principal */}
      <div className="relative z-10">
        <Navbar />
        <main className="p-8">{children}</main>
      </div>
    </div>
  )
}

export default Layout
