import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'

const DashboardAdmin = () => {
  const navigate = useNavigate()

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center gap-12 mt-8">
        <h1 className="text-3xl font-bold text-white text-center">¿Qué deseas hacer hoy?</h1>

        <div className="flex gap-8 flex-wrap justify-center">
          {/* Panel de administración */}
          <div
            onClick={() => navigate('/administracion')}
            className="cursor-pointer bg-gray-800 hover:bg-gray-700 text-white p-6 rounded-2xl shadow-md w-72 text-center transition"
          >
            <div className="text-5xl mb-2">⚙️</div>
            <h2 className="text-xl font-semibold mb-1">Panel de Administración</h2>
            <p className="text-sm text-gray-300">Gestiona usuarios y registra nuevas cargas.</p>
          </div>

          {/* Flujo operativo */}
          <div
            onClick={() => navigate('/dashboard')}
            className="cursor-pointer bg-gray-800 hover:bg-gray-700 text-white p-6 rounded-2xl shadow-md w-72 text-center transition"
          >
            <div className="text-5xl mb-2">📋</div>
            <h2 className="text-xl font-semibold mb-1">Flujo Operativo</h2>
            <p className="text-sm text-gray-300">Supervisa la trazabilidad y el proceso logístico.</p>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default DashboardAdmin
