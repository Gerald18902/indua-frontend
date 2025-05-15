import { useEffect, useState } from 'react'
import axios from 'axios'

const VerLocalesModal = ({ isOpen, onClose, idRuta }) => {
  const [locales, setLocales] = useState([])

  useEffect(() => {
    if (isOpen && idRuta) {
      axios.get(`http://localhost:8080/api/rutas/locales-de-ruta/${idRuta}`)
        .then(res => {
          setLocales(res.data || []);
        })

        .catch(err => {
          console.error('Error al cargar locales:', err)
          setLocales([])
        })
    }
  }, [isOpen, idRuta])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-900 text-black dark:text-white transition-colors p-6 rounded-xl w-[90%] max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-2xl font-bold text-black dark:text-white hover:text-red-500"
        >
          &times;
        </button>

        <h2 className="text-xl font-bold mb-4 text-green-400 text-center">Locales de la Ruta</h2>

        {locales.length === 0 ? (
          <p className="text-center text-black dark:text-white">No se encontraron locales asignados.</p>
        ) : (
          <ol className="pl-2 space-y-1 max-h-64 overflow-y-auto list-none">
            {locales.map((local, index) => (
              <li key={index}>
                <span className="font-semibold text-green-400">{index + 1}</span> – {local.nombre} ({local.codigo})
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  )
}

export default VerLocalesModal
