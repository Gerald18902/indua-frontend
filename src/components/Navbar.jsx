import { useNavigate, useLocation } from 'react-router-dom'
import logo from '../assets/logo.png'

const Navbar = () => {
  const navigate = useNavigate()
  const rol = localStorage.getItem('rol')
  //const nombre = localStorage.getItem('nombre')
  const location = useLocation()
  const path = location.pathname


  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('rol')
    navigate('/')
  }

  const linkClass = (ruta) => {
    const isActive = path === ruta
    return `text-white text-lg px-3 py-1 rounded-md font-semibold ${
      isActive ? 'border-b-2 border-white' : 'hover:bg-white/20 transition duration-200'
    }`
  }

  const puedeVer = (modulo) => {
    const accesos = {
      administrador: ['recepcion', 'transporte', 'despacho', 'bultos', 'usuarios'],
      operaciones: ['recepcion', 'transporte', 'despacho', 'bultos'],
      atarama: ['transporte', 'despacho'],
    }

    return accesos[rol]?.includes(modulo)
  }

  return (
    <nav className="bg-gray-900 text-white flex items-center justify-between px-6 py-4 shadow">
      <div className='flex items-center space-x-2'>
        <img src={logo} alt="Logo" className="h-8" />
      </div>

      <div className="flex-1 flex justify-center space-x-8">
        {puedeVer('recepcion') && <a href="/recepcion" className={linkClass('/recepcion')}>Recepción</a>}
        {puedeVer('transporte') && <a href="/transporte" className= {linkClass('/transporte')}>Transporte</a>}
        {puedeVer('despacho') && <a href="/despacho" className={linkClass('/despacho')}>Despacho</a>}
        {puedeVer('bultos') && <a href="/bultos" className={linkClass('/bultos')}>Bultos</a>}
        {puedeVer('usuarios') && <a href="/usuarios" className={linkClass('/usuarios')}>Usuarios</a>}
      </div>

      <div className="flex items-center space-x-4">
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Cerrar Sesión
        </button>
      </div>

    </nav>
  )
}

export default Navbar
