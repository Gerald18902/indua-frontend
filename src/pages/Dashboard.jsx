import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'

const Dashboard = () => {
  const navigate = useNavigate()
  const rol = localStorage.getItem('rol')?.toLowerCase() || ''

  const steps = [
    {
      key: 'recepcion',
      icon: '📦',
      title: 'Recepción',
      description: 'Registrar bultos recepcionados.',
      path: '/recepcion',
    },
    {
      key: 'transporte',
      icon: '🚚',
      title: 'Transporte',
      description: 'Planificar rutas de entrega.',
      path: '/transporte',
    },
    {
      key: 'despacho',
      icon: '📬',
      title: 'Despacho',
      description: 'Confirmar entregas y registrar faltantes.',
      path: '/despacho',
    },
    {
      key: 'bultos',
      icon: '📊',
      title: 'Gestión de Bultos',
      description: 'Verificar la trazabilidad.',
      path: '/bultos',
    },
  ]

  const accesos = {
    administrador: ['recepcion', 'transporte', 'despacho', 'bultos'],
    operaciones: ['recepcion', 'transporte', 'despacho', 'bultos'],
    atarama: ['transporte', 'despacho'],
  }

  const modulosPermitidos = accesos[rol] || []
  const pasosSuperiores = steps.slice(0, 3).filter(step => modulosPermitidos.includes(step.key))
  const mostrarPasoInferior = modulosPermitidos.includes('bultos')

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center">

        <div className="flex flex-col items-center gap-12">

          {/* Pasos principales con flechas */}
          <div className="flex items-center gap-4 flex-wrap justify-center">
            {pasosSuperiores.map((step, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="bg-gray-800 p-6 rounded-2xl shadow-md flex flex-col items-center text-center text-white w-64">
                  <div className="text-blue-400 font-bold text-lg mb-1">Paso {index + 1}</div>
                  <div className="text-5xl mb-2">{step.icon}</div>
                  <h2 className="text-xl font-semibold mb-2 text-white">{step.title}</h2>
                  <p className="text-sm text-gray-300 mb-4">{step.description}</p>
                  <button
                    onClick={() => navigate(step.path)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Ir al módulo
                  </button>
                </div>

                {/* Flecha entre pasos visibles */}
                {index !== pasosSuperiores.length - 1 && (
                  <svg
                    width="32"
                    height="32"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mx-2"
                  >
                    <path d="M0 16h24l-6-6m6 6l-6 6" />
                  </svg>
                )}
              </div>
            ))}
          </div>

          {mostrarPasoInferior && (
            <div className="mt-2">
              <div className="bg-gray-800 p-6 rounded-2xl shadow-md flex flex-col items-center text-center text-white w-64 mx-auto">
                <div className="text-blue-400 font-bold text-lg mb-1">Paso {pasosSuperiores.length + 1}</div>
                <div className="text-5xl mb-2">{steps[3].icon}</div>
                <h2 className="text-xl font-semibold mb-2 text-white">{steps[3].title}</h2>
                <p className="text-sm text-gray-300 mb-4">{steps[3].description}</p>
                <button
                  onClick={() => navigate(steps[3].path)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Ir al módulo
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </Layout>
  )
}

export default Dashboard
