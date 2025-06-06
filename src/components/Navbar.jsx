import { useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'
import { useTheme } from '../context/ThemeContext'
import { Sun, Moon } from 'lucide-react'

const Navbar = () => {
  const navigate = useNavigate()
  const nombre = localStorage.getItem('nombre') || 'Usuario'
  const { theme, toggleTheme } = useTheme()

  const handleLogout = () => {
    localStorage.clear()
    navigate('/')
  }

  return (
    <nav className="relative bg-white dark:bg-gray-900 text-black dark:text-white px-6 py-4 shadow-md flex items-center justify-between transition-colors duration-300">

      <div className="flex items-center space-x-3">
        <img src={logo} alt="Logo" className="h-9" />
      </div>

      <div className="absolute left-1/2 transform -translate-x-1/2">
        <span className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent drop-shadow-sm tracking-wide uppercase">
          APP TRAZABILIDAD
        </span>
      </div>

      <div className="flex items-center gap-4">
        <span className="hidden sm:flex items-center gap-1 text-sm font-bold">
          <span className="text-black dark:text-white font-medium">Bienvenido, {nombre}</span>
        </span>

        {/* Botón Modo Claro / Oscuro con ícono */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title={theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <button
          onClick={handleLogout}
          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-2 px-4 rounded shadow transition duration-200"
        >
          Cerrar sesión
        </button>
      </div>
    </nav>
  )
}

export default Navbar