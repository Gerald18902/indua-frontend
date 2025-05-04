import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import BotonVolver from '../components/BotonVolver'

const Administracion = () => {
  const navigate = useNavigate()

  return (
    <Layout>





      <div className="relative w-full max-w-5xl mx-auto mt-4 flex items-center justify-start">
        <BotonVolver />

        <h1 className="absolute left-1/2 transform -translate-x-1/2 text-3xl font-bold text-white text-center">
          Panel de Administración
        </h1>
      </div>




      <div className="flex flex-col items-center justify-center gap-12 mt-8">
        <div className="flex gap-8 flex-wrap justify-center">
          {/* Registro de Carga */}
          <div
            onClick={() => navigate('/cargas')}
            className="cursor-pointer bg-gray-800 hover:bg-gray-700 text-white p-6 rounded-2xl shadow-md w-72 text-center transition"
          >
            <div className="text-5xl mb-2">📝</div>
            <h2 className="text-xl font-semibold mb-1">Registro de Carga</h2>
            <p className="text-sm text-gray-300">Carga guías desde archivos Excel.</p>
          </div>

          {/* Gestión de Usuarios */}
          <div
            onClick={() => navigate('/usuarios')}
            className="cursor-pointer bg-gray-800 hover:bg-gray-700 text-white p-6 rounded-2xl shadow-md w-72 text-center transition"
          >
            <div className="text-5xl mb-2">👥</div>
            <h2 className="text-xl font-semibold mb-1">Gestión de Usuarios</h2>
            <p className="text-sm text-gray-300">Crea, edita o elimina cuentas del sistema.</p>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Administracion
