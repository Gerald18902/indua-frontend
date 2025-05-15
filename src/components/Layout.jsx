import Navbar from './Navbar'
import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'

const Layout = ({ children }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { theme } = useTheme()

  // Redirige al login si no hay token
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/')
    }
  }, [location, navigate])

  return (
    <div className="relative min-h-screen bg-white text-black dark:bg-gray-900 dark:text-white overflow-hidden transition-colors duration-300">
      {/* Blobs de fondo según el tema */}
      {theme === 'dark' ? (
        <>
          <div className="absolute w-[600px] h-[600px] bg-gradient-to-r from-[#FF754B] to-[#5D4BFF] rounded-full blur-3xl opacity-30 top-[-150px] left-[-150px]" />
          <div className="absolute w-[500px] h-[500px] bg-gradient-to-r from-[#5D4BFF] to-[#FF754B] rounded-full blur-3xl opacity-30 bottom-[-100px] right-[-100px]" />
        </>
      ) : (
        <>
          <div className="absolute w-[600px] h-[600px] bg-gradient-to-r from-yellow-300 to-pink-300 rounded-full blur-3xl opacity-40 top-[-150px] left-[-150px]" />
          <div className="absolute w-[500px] h-[500px] bg-gradient-to-r from-pink-300 to-yellow-300 rounded-full blur-3xl opacity-40 bottom-[-100px] right-[-100px]" />
        </>
      )}

      {/* Contenido principal */}
      <div className="relative z-10">
        <Navbar />
        <main className="p-8">{children}</main>
      </div>
    </div>
  )
}

export default Layout
