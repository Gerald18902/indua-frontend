import CargaModal from '../components/CargaModal';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import BotonVolver from '../components/BotonVolver'
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
Chart.register(ArcElement, Tooltip, Legend);
import ChartDataLabels from 'chartjs-plugin-datalabels';
Chart.register(ChartDataLabels);

import ReporteRecepcionPDF from '../components/ReporteRecepcionPDF';

function Recepcion() {
  const [cargas, setCargas] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [mostrarReporte, setMostrarReporte] = useState(false);
  const [codigoParaReporte, setCodigoParaReporte] = useState(null);
  const [idCargaReporte, setIdCargaReporte] = useState(null);
  const [faltantesPorLocal, setFaltantesPorLocal] = useState({});
  const [deterioradosPorLocal, setDeterioradosPorLocal] = useState({});
  const [renderizado, setRenderizado] = useState(false);

  const [modalReporteOpen, setModalReporteOpen] = useState(false);
  const [fechaSeleccionada, setFechaSeleccionada] = useState('');
  const [codigoSeleccionado, setCodigoSeleccionado] = useState('');
  const [fechasDisponibles, setFechasDisponibles] = useState([]);
  const [cargasPorFecha, setCargasPorFecha] = useState({});

  useEffect(() => {
    cargarCargas();
  }, []);

  const cargarCargas = () => {
    axios.get('http://localhost:8080/api/cargas')
      .then(response => {
        const data = response.data;
        setCargas(Array.isArray(data) ? data : []);
        const agrupadas = {};
        data.forEach(c => {
          const fecha = c.fechaCarga;
          if (!agrupadas[fecha]) agrupadas[fecha] = [];
          agrupadas[fecha].push(c);
        });
        setCargasPorFecha(agrupadas);
        setFechasDisponibles(Object.keys(agrupadas));
      })
      .catch(error => {
        console.error('Error al cargar cargas:', error);
        setCargas([]);
      });
  };

  const agruparBultosPorLocal = (estado, reporte) => {
    if (!reporte || !reporte.bultosProblema) return {};
    const filtrados = reporte.bultosProblema.filter(b => b.estadoRecepcion === estado);
    const agrupados = {};

    filtrados.forEach(b => {
      const clave = `${b.nombreLocal} - ${b.codigoLocal}`;
      if (!agrupados[clave]) {
        agrupados[clave] = [];
      }
      agrupados[clave].push(b.codigoBulto);
    });

    return Object.keys(agrupados)
      .sort()
      .reduce((obj, clave) => {
        obj[clave] = agrupados[clave];
        return obj;
      }, {});
  };

  const handleCargaRegistrada = async (idNuevaCarga) => {
    if (renderizado) return;
    setRenderizado(true);

    await cargarCargas();

    if (idNuevaCarga) {
      const cargasRes = await axios.get('http://localhost:8080/api/cargas');
      const carga = cargasRes.data.find(c => c.idCarga === idNuevaCarga);
      if (!carga) return;

      const codigoCarga = carga.codigoCarga;
      const res = await axios.get(`http://localhost:8080/api/cargas/reporte-recepcion/${idNuevaCarga}`);
      const reporte = res.data;

      setCodigoParaReporte(codigoCarga);
      setIdCargaReporte(idNuevaCarga);
      setFaltantesPorLocal(agruparBultosPorLocal('FALTANTE', reporte));
      setDeterioradosPorLocal(agruparBultosPorLocal('DETERIORADO', reporte));
      setMostrarReporte(true);
    }
  };

  const handleGenerarReporteDesdeCodigo = async () => {
    try {
      const carga = cargasPorFecha[fechaSeleccionada]?.find(c => c.codigoCarga === codigoSeleccionado);
      if (!carga) return alert('Carga no encontrada');

      const reporteRes = await axios.get(`http://localhost:8080/api/cargas/reporte-recepcion/${carga.idCarga}`);
      const reporte = reporteRes.data;

      setCodigoParaReporte(carga.codigoCarga);
      setIdCargaReporte(carga.idCarga);
      setFaltantesPorLocal(agruparBultosPorLocal('FALTANTE', reporte));
      setDeterioradosPorLocal(agruparBultosPorLocal('DETERIORADO', reporte));
      setMostrarReporte(true);
      setModalReporteOpen(false);
    } catch (err) {
      alert('Error al generar el reporte');
      console.error(err);
    }
  };

  return (
    <Layout>

<div className="relative w-full max-w-5xl mx-auto mt-4 flex items-center justify-start">
        <BotonVolver />
        <h1 className="absolute left-1/2 transform -translate-x-1/2 text-3xl font-bold text-white text-center">
          Módulo de Recepción
        </h1>
      </div>


      <div className="flex flex-col items-center justify-start p-6 text-white">
        <div className="bg-white text-black rounded-xl shadow-lg w-full max-w-5xl overflow-hidden">
          <div className="overflow-y-auto max-h-[400px]">
            <table className="table-auto min-w-full border">
              <thead>
                <tr className="sticky top-0 z-10 bg-gray-100 font-bold text-sm">
                  <th className="border px-4 py-2">Fecha de Carga</th>
                  <th className="border px-4 py-2">Código de Carga</th>
                  <th className="border px-4 py-2">Placa</th>
                  <th className="border px-4 py-2">Dueño</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(cargas) && cargas.map((carga, index) => (
                  <tr key={index} className="text-center">
                    <td className="border px-4 py-2">{carga.fechaCarga}</td>
                    <td className="border px-4 py-2">{carga.codigoCarga}</td>
                    <td className="border px-4 py-2">{carga.placaCarreta}</td>
                    <td className="border px-4 py-2">{carga.duenoCarreta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex gap-6 mt-8">
          <button
            onClick={() => setModalOpen(true)}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition"
          >
            INGRESAR NUEVA CARGA
          </button>

          <button
            onClick={() => setModalReporteOpen(true)}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition"
          >
            GENERAR REPORTE
          </button>
        </div>

        {modalReporteOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="relative bg-gray-900 text-white rounded-xl shadow-lg w-[90%] max-w-md p-8">

              <button
                onClick={() => setModalReporteOpen(false)}
                className="absolute top-3 right-3 text-white text-2xl font-bold hover:text-red-500"
              >
                &times;
              </button>

              <div className="flex flex-col items-center mb-6">
                <h2 className="text-xl font-bold text-green-400">Selecciona Carga</h2>
              </div>

              <label className="block text-sm mb-1">Fecha de carga:</label>
              <select
                className="w-full bg-gray-800 px-4 py-2 mb-4 rounded"
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

              {fechaSeleccionada && (
                <>
                  <label className="block text-sm mb-1">Código de carga:</label>
                  <select
                    className="w-full bg-gray-800 px-4 py-2 mb-6 rounded"
                    value={codigoSeleccionado}
                    onChange={(e) => setCodigoSeleccionado(e.target.value)}
                  >
                    <option value="">-- Selecciona un código --</option>
                    {cargasPorFecha[fechaSeleccionada].map((c, i) => (
                      <option key={i} value={c.codigoCarga}>{c.codigoCarga}</option>
                    ))}
                  </select>
                </>
              )}

              <div className="flex justify-center">
                <button
                  className="bg-green-400 text-black font-bold py-2 px-6 rounded hover:bg-green-500"
                  disabled={!codigoSeleccionado}
                  onClick={() => handleGenerarReporteDesdeCodigo()}
                >
                  Generar
                </button>
              </div>
            </div>
          </div>
        )}


        <CargaModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onCargaRegistrada={handleCargaRegistrada}
        />

        {mostrarReporte && (
          <ReporteRecepcionPDF
            codigoCarga={codigoParaReporte}
            idCarga={idCargaReporte}
            faltantesPorLocal={faltantesPorLocal}
            deterioradosPorLocal={deterioradosPorLocal}
            onRenderComplete={() => {
              setMostrarReporte(false);
              setRenderizado(false);
            }}
          />
        )}
      </div>
    </Layout>
  );
}

export default Recepcion;
