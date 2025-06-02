import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import Layout from '../components/Layout'
import BotonVolver from '../components/BotonVolver'
import AsignarRutaModal from '../components/AsignarRutaModal'
import VerLocalesModal from '../components/VerLocalesModal'
import ReporteTransportePDF from '../components/ReporteTransportePDF';
import VerMapaModal from '../components/VerMapaModal';

import { toast } from 'react-toastify';
import { ListOrdered, Map } from 'lucide-react';

const Transporte = () => {
  const [rutas, setRutas] = useState([])
  const [filtroFecha, setFiltroFecha] = useState('')
  const [filtroCodigoCarga, setFiltroCodigoCarga] = useState('')
  const [fechasDisponibles, setFechasDisponibles] = useState([])
  const [cargasPorFecha, setCargasPorFecha] = useState({})

  const [modalAsignarOpen, setModalAsignarOpen] = useState(false)
  const [modalLocalesOpen, setModalLocalesOpen] = useState(false)
  const [idRutaSeleccionada, setIdRutaSeleccionada] = useState(null)

  const [modalGenerarReporteOpen, setModalGenerarReporteOpen] = useState(false);
  const [fechaSeleccionada, setFechaSeleccionada] = useState('');
  const [codigoSeleccionado, setCodigoSeleccionado] = useState('');
  const [mostrarReporte, setMostrarReporte] = useState(false);
  const [datosReporte, setDatosReporte] = useState(null);
  const [cargasConRuta, setCargasConRuta] = useState([]);

  const [modalMapaOpen, setModalMapaOpen] = useState(false);
  const [idRutaMapa, setIdRutaMapa] = useState(null);

  const cargarRutas = useCallback(() => {
    const params = {};
    if (filtroFecha) params.fecha = filtroFecha;
    if (filtroCodigoCarga) params.codigoCarga = filtroCodigoCarga;

    axios.get('http://18.221.174.4:8080/api/rutas', { params })
      .then(res => setRutas(res.data || []))
      .catch(err => {
        console.error('Error al cargar rutas:', err);
        setRutas([]);
      });
  }, [filtroFecha, filtroCodigoCarga]);

  const cargarCargas = () => {
    axios.get('http://18.221.174.4:8080/api/cargas')
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

  const cargarCargasConRuta = () => {
    axios.get('http://18.221.174.4:8080/api/rutas/cargas-con-ruta')
      .then(res => {
        const data = res.data || [];
        const agrupadas = {};
        data.forEach(c => {
          if (!agrupadas[c.fechaCarga]) agrupadas[c.fechaCarga] = [];
          agrupadas[c.fechaCarga].push(c);
        });
        setCargasPorFecha(agrupadas);
        setFechasDisponibles(Object.keys(agrupadas).sort((a, b) => new Date(b) - new Date(a)));
        setCargasConRuta(data);
      })
      .catch(err => {
        console.error('Error al cargar cargas con ruta:', err);
        setCargasConRuta([]);
      });
  };

  const handleGenerarReporteTransporte = async () => {
    try {
      const carga = cargasPorFecha[fechaSeleccionada]?.find(c => c.codigoCarga === codigoSeleccionado);
      if (!carga) return alert('Carga no encontrada');

      const res = await axios.get(`http://18.221.174.4:8080/api/rutas/reporte-transporte/${carga.idCarga}`);
      setDatosReporte(res.data);
      setMostrarReporte(true);
      setModalGenerarReporteOpen(false);
    } catch (err) {
      alert('Error al generar el reporte');
      console.error(err);
    }
  };

  useEffect(() => {
    cargarCargas()
  }, [])

  useEffect(() => {
    if (modalGenerarReporteOpen) {
      cargarCargasConRuta();
    }
  }, [modalGenerarReporteOpen]);

  useEffect(() => {
    cargarRutas()
  }, [cargarRutas])
  return (
    <Layout>
      <div className="relative w-full max-w-5xl mx-auto mt-4 flex items-center justify-start">
        <BotonVolver />
        <h1 className="absolute left-1/2 transform -translate-x-1/2 text-3xl font-bold text-black dark:text-white text-center">
          Módulo de Transporte
        </h1>
      </div>

      <div className="flex flex-col items-center justify-start p-6 text-black dark:text-white transition-colors">
        <div className="flex flex-wrap gap-4 mb-6">
          <div>
            <label className="block text-sm mb-1 text-black dark:text-white">Filtrar por fecha:</label>
            <select className="bg-gray-100 dark:bg-gray-800 text-black dark:text-white px-4 py-2 rounded transition-colors"

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
              <label className="block text-sm mb-1 text-black dark:text-white">Filtrar por código de carga:</label>
              <select className="bg-gray-100 dark:bg-gray-800 text-black dark:text-white px-4 py-2 rounded transition-colors"
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
                          setIdRutaSeleccionada(ruta.idRuta);
                          setModalLocalesOpen(true);
                        }}
                        title="Ver Locales"
                      >
                        <ListOrdered size={18} />
                      </button>

                      <button
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded ml-2"
                        onClick={() => {
                          setIdRutaMapa(ruta.idRuta);
                          setModalMapaOpen(true);
                        }}
                        title="Ver Mapa"
                      >
                        <Map size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {modalMapaOpen && idRutaMapa && (
          <VerMapaModal
            idRuta={idRutaMapa}
            onClose={() => setModalMapaOpen(false)}
          />
        )}

        <AsignarRutaModal
          isOpen={modalAsignarOpen}
          onClose={() => setModalAsignarOpen(false)}
          onRutaAsignada={() => {
            cargarRutas();
            toast.success('Ruta asignada correctamente ✅');
          }}
        />

        <div className="flex justify-center gap-4 mt-6">
          <button
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-6 rounded"
            onClick={() => setModalAsignarOpen(true)}
          >
            Asignar Ruta
          </button>

          <button
            className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded transition"
            onClick={() => {
              setModalGenerarReporteOpen(true);
              setFechaSeleccionada('');
              setCodigoSeleccionado('');
            }}
          >
            Generar Reporte
          </button>
        </div>

      </div>

      <VerLocalesModal
        isOpen={modalLocalesOpen}
        onClose={() => setModalLocalesOpen(false)}
        idRuta={idRutaSeleccionada}
      />

      {modalGenerarReporteOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative bg-white dark:bg-gray-900 text-black dark:text-white transition-colors rounded-xl shadow-lg w-[90%] max-w-md p-8">
            <button
              onClick={() => setModalGenerarReporteOpen(false)}
              className="absolute top-3 right-3 text-black dark:text-white text-2xl font-bold hover:text-red-500"
            >
              &times;
            </button>

            <div className="flex flex-col items-center mb-6">
              <h2 className="text-xl font-bold text-green-400">Selecciona Carga</h2>
            </div>

            <label className="block text-sm mb-1 text-black dark:text-white">Fecha de carga:</label>
            <select
              className="w-full bg-gray-100 dark:bg-gray-800 text-black dark:text-white px-4 py-2 mb-4 rounded transition-colors"
              value={fechaSeleccionada}
              onChange={(e) => {
                setFechaSeleccionada(e.target.value);
                setCodigoSeleccionado('');
              }}
            >
              <option value="">-- Selecciona una fecha --</option>
              {fechasDisponibles.map((f, i) => (
                <option key={i} value={f}>{f}</option>
              ))}
            </select>

            <label className="block text-sm mb-1 text-black dark:text-white">Código de carga:</label>
            <select
              className="w-full bg-gray-100 dark:bg-gray-800 text-black dark:text-white px-4 py-2 mb-6 rounded transition-colors"
              value={codigoSeleccionado}
              onChange={(e) => setCodigoSeleccionado(e.target.value)}
              disabled={!fechaSeleccionada}
            >
              <option value="">-- Selecciona un código --</option>
              {fechaSeleccionada &&
                cargasConRuta
                  .filter(c => c.fechaCarga === fechaSeleccionada)
                  .sort((a, b) => a.codigoCarga.localeCompare(b.codigoCarga))
                  .map((c, i) => (
                    <option key={i} value={c.codigoCarga}>{c.codigoCarga}</option>
                  ))}
            </select>

            <div className="flex justify-center">
              <button
                className="bg-green-400 text-black font-bold py-2 px-6 rounded hover:bg-green-500"
                disabled={!codigoSeleccionado}
                onClick={handleGenerarReporteTransporte}
              >
                Generar
              </button>
            </div>

          </div>
        </div>
      )}

      {mostrarReporte && datosReporte && (
        <ReporteTransportePDF
          datos={datosReporte}
          onRenderComplete={() => setMostrarReporte(false)}
        />
      )}

    </Layout>
  )
}

export default Transporte