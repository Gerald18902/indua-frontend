import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'

const PasoCard = ({ index, paso, onClick }) => (
  <div
    onClick={onClick}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => { if (e.key === 'Enter') onClick() }}
    className="cursor-pointer bg-gray-100 dark:bg-gray-800 text-black dark:text-white p-6 rounded-2xl shadow-md flex flex-col items-center text-center w-64 transition-colors hover:ring-2 hover:ring-blue-400"
  >
    <div className="text-blue-500 dark:text-blue-400 font-bold text-lg mb-1">Paso {index}</div>
    <div className="text-5xl mb-2">{paso.icon}</div>
    <h2 className="text-xl font-semibold mb-2">{paso.title}</h2>
    <p className="text-sm text-gray-700 dark:text-gray-300">{paso.description}</p>
  </div>
)

const Flecha = () => (
  <svg
    width="32"
    height="32"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="mx-2 text-black dark:text-white transition"
  >
    <path d="M0 16h24l-6-6m6 6l-6 6" />
  </svg>
)

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
                <PasoCard
                  index={index + 1}
                  paso={step}
                  onClick={() => navigate(step.path)}
                />
                {index !== pasosSuperiores.length - 1 && <Flecha />}
              </div>
            ))}
          </div>

          {/* Paso inferior */}
          {mostrarPasoInferior && (
            <div className="mt-2">
              <PasoCard
                index={pasosSuperiores.length + 1}
                paso={steps[3]}
                onClick={() => navigate(steps[3].path)}
              />
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default Dashboard
