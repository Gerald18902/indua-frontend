import { useEffect, useState } from 'react'
import axios from 'axios'
import Layout from '../components/Layout'
import BotonVolver from '../components/BotonVolver'
import AsignarRutaModal from '../components/AsignarRutaModal'
import VerLocalesModal from '../components/VerLocalesModal'
import { toast } from 'react-toastify';

const Transporte = () => {
  const [rutas, setRutas] = useState([])
  const [filtroFecha, setFiltroFecha] = useState('')
  const [filtroCodigoCarga, setFiltroCodigoCarga] = useState('')
  const [fechasDisponibles, setFechasDisponibles] = useState([])
  const [cargasPorFecha, setCargasPorFecha] = useState({})

  const [modalAsignarOpen, setModalAsignarOpen] = useState(false)
  const [modalLocalesOpen, setModalLocalesOpen] = useState(false)
  const [idRutaSeleccionada, setIdRutaSeleccionada] = useState(null)


  const cargarRutas = () => {
    const params = {}
    if (filtroFecha) params.fecha = filtroFecha
    if (filtroCodigoCarga) params.codigoCarga = filtroCodigoCarga

    axios.get('http://localhost:8080/api/rutas', { params })
      .then(res => setRutas(res.data || []))
      .catch(err => {
        console.error('Error al cargar rutas:', err)
        setRutas([])
      })
  }

  const cargarCargas = () => {
    axios.get('http://localhost:8080/api/cargas')
      .then(res => {
        const data = res.data || []
        const agrupadas = {}
        data.forEach(c => {
          if (!agrupadas[c.fechaCarga]) agrupadas[c.fechaCarga] = []
          agrupadas[c.fechaCarga].push(c)
        })
        setCargasPorFecha(agrupadas)
        setFechasDisponibles(
          Object.keys(agrupadas).sort((a, b) => new Date(b) - new Date(a))
        )
      })
      .catch(err => {
        console.error('Error al cargar cargas:', err)
        setCargasPorFecha({})
        setFechasDisponibles([])
      })
  }

  useEffect(() => {
    cargarCargas()
  }, [])

  useEffect(() => {
    cargarRutas()
  }, [filtroFecha, filtroCodigoCarga])
  return (
    <Layout>
      <div className="relative w-full max-w-5xl mx-auto mt-4 flex items-center justify-start">
        <BotonVolver />
        <h1 className="absolute left-1/2 transform -translate-x-1/2 text-3xl font-bold text-white text-center">
          Módulo de Transporte
        </h1>
      </div>

      <div className="flex flex-col items-center justify-start p-6 text-white">
        <div className="flex flex-wrap gap-4 mb-6">
          <div>
            <label className="block text-sm mb-1">Filtrar por fecha:</label>
            <select
              className="bg-gray-800 text-white px-4 py-2 rounded"
              value={filtroFecha}
              onChange={e => {
                setFiltroFecha(e.target.value)
                setFiltroCodigoCarga('')
              }}
            >
              <option value="">Todas</option>
              {fechasDisponibles.map((fecha, i) => (
                <option key={i} value={fecha}>{fecha}</option>
              ))}
            </select>
          </div>

          {filtroFecha && (
            <div>
              <label className="block text-sm mb-1">Filtrar por código de carga:</label>
              <select
                className="bg-gray-800 text-white px-4 py-2 rounded"
                value={filtroCodigoCarga}
                onChange={e => setFiltroCodigoCarga(e.target.value)}
              >
                <option value="">Todos</option>
                {cargasPorFecha[filtroFecha]
                  ?.sort((a, b) => a.codigoCarga.localeCompare(b.codigoCarga))
                  .map((c, i) => (
                    <option key={i} value={c.codigoCarga}>{c.codigoCarga}</option>
                  ))}
              </select>
            </div>
          )}
        </div>

        <div className="bg-white text-black rounded-xl shadow-lg w-full max-w-5xl overflow-hidden">
          <div className="overflow-y-auto max-h-[400px]">
            <table className="table-auto min-w-full">
              <thead className="sticky top-0 z-10 bg-black text-white text-sm uppercase tracking-wide text-center">
                <tr>
                  <th className="px-6 py-3 text-center">Código Carga</th>
                  <th className="px-6 py-3 text-center">Placa</th>
                  <th className="px-6 py-3 text-center">Comentario</th>
                  <th className="px-6 py-3 text-center">Locales</th>
                </tr>
              </thead>
              <tbody>
                {rutas.map((ruta, i) => (
                  <tr key={i} className="text-center">
                    <td className="border px-4 py-2">{ruta.codigoCarga}</td>
                    <td className="border px-4 py-2">{ruta.placaUnidad}</td>
                    <td className="border px-4 py-2">{ruta.comentario || '-'}</td>
                    <td className="border px-4 py-2">
                      <button
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded"
                        onClick={() => {
                          setIdRutaSeleccionada(ruta.idRuta)
                          setModalLocalesOpen(true)
                        }}
                      >
                        Ver Locales
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <AsignarRutaModal
          isOpen={modalAsignarOpen}
          onClose={() => setModalAsignarOpen(false)}
          onRutaAsignada={() => {
            cargarRutas();
            toast.success('Ruta asignada correctamente ✅');
          }}
        />

        <div className="flex justify-center mt-6">
          <button
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-6 rounded"
            onClick={() => setModalAsignarOpen(true)}
          >
            Asignar Ruta
          </button>
        </div>

      </div>


      <VerLocalesModal
        isOpen={modalLocalesOpen}
        onClose={() => setModalLocalesOpen(false)}
        idRuta={idRutaSeleccionada}
      />

    </Layout>


  )
}

export default Transporte