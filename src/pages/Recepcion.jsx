import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Layout from "../components/Layout";
import BotonVolver from "../components/BotonVolver";
import { API_BASE_URL } from "../config/api";

import ReporteRecepcionPDF from "../components/ReporteRecepcionPDF";

function Recepcion() {
  const [bultos, setBultos] = useState([]);
  const [cargas, setCargas] = useState([]);

  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  const [mostrarReporte, setMostrarReporte] = useState(false);
  const [codigoParaReporte, setCodigoParaReporte] = useState(null);
  const [idCargaReporte, setIdCargaReporte] = useState(null);
  const [faltantesPorLocal, setFaltantesPorLocal] = useState({});
  const [deterioradosPorLocal, setDeterioradosPorLocal] = useState({});

  const [filtroFecha, setFiltroFecha] = useState("");
  const [filtroCodigoCarga, setFiltroCodigoCarga] = useState("");

  const [modalReporteOpen, setModalReporteOpen] = useState(false);
  const [fechaSeleccionada, setFechaSeleccionada] = useState("");
  const [codigoSeleccionado, setCodigoSeleccionado] = useState("");
  const [fechasDisponibles, setFechasDisponibles] = useState([]);
  const [cargasPorFecha, setCargasPorFecha] = useState({});

  const [mostrarModalTerminar, setMostrarModalTerminar] = useState(false);

  const [filtroCodigoBulto, setFiltroCodigoBulto] = useState("");

  useEffect(() => {
    cargarBultos();
    cargarCargas();

    // 👇 Útil para depurar errores de ID o fechas
    console.log("✅ useEffect inicial: Se cargaron bultos y cargas");
    console.log("API BASE URL:", API_BASE_URL);
  }, []);

  useEffect(() => {
    console.log("📦 Cargas actualizadas:", cargas);
  }, [cargas]);

  useEffect(() => {
    if (!filtroFecha || !filtroCodigoCarga) {
      setFiltroCodigoBulto("");
    }
  }, [filtroFecha, filtroCodigoCarga]);

  const cargarBultos = () => {
    axios
      .get(`${API_BASE_URL}/bultos`) // ← corregido
      .then((response) => {
        const data = Array.isArray(response.data) ? response.data : [];
        console.log("📦 Bultos recibidos:", data); // ← ayuda a depurar
        setBultos(data);
      })
      .catch((error) => {
        console.error("Error al cargar bultos:", error);
        setBultos([]);
      });
  };

  // Dentro del componente Recepcion

  // 1. Filtrar los códigos de carga válidos (todos sus bultos tienen estadoRecepcion definido)
  const cargasSinNulos = useMemo(() => {
    const cargasValidas = new Set();

    // Agrupa bultos por código de carga
    const agrupadosPorCarga = {};
    bultos.forEach((b) => {
      if (!agrupadosPorCarga[b.codigoCarga]) {
        agrupadosPorCarga[b.codigoCarga] = [];
      }
      agrupadosPorCarga[b.codigoCarga].push(b);
    });

    // Evalúa si todos los bultos de la carga tienen estadoRecepcion definido
    cargas.forEach((carga) => {
      const bultosDeCarga = agrupadosPorCarga[carga.codigoCarga] || [];
      const todosDefinidos =
        bultosDeCarga.length > 0 &&
        bultosDeCarga.every(
          (b) =>
            b.estadoRecepcion !== null &&
            b.estadoRecepcion !== undefined &&
            b.estadoRecepcion !== "null" &&
            b.estadoRecepcion !== "" &&
            b.estadoRecepcion !== "-"
        );
      if (todosDefinidos) {
        cargasValidas.add(carga.codigoCarga);
      }
    });

    return cargas.filter((c) => cargasValidas.has(c.codigoCarga));
  }, [bultos, cargas]);

  const cargaCompleta = useMemo(() => {
    return cargasSinNulos.some((c) => c.codigoCarga === filtroCodigoCarga);
  }, [cargasSinNulos, filtroCodigoCarga]);

  const bultosFiltrados = bultos.filter((b) => {
    if (!filtroFecha) return true;

    const carga = cargas.find((c) => c.codigoCarga === b.codigoCarga);
    if (!carga || !carga.fechaCarga.startsWith(filtroFecha)) return false; // ← corregido

    if (filtroCodigoCarga && b.codigoCarga !== filtroCodigoCarga) return false;

    if (filtroCodigoBulto && !b.codigoBulto.includes(filtroCodigoBulto))
      return false;

    return true;
  });

  const cargarCargas = () => {
    axios
      .get(`${API_BASE_URL}/cargas`)
      .then((response) => {
        const data = response.data;
        setCargas(Array.isArray(data) ? data : []);
        const agrupadas = {};
        data.forEach((c) => {
          const fecha = c.fechaCarga;
          if (!agrupadas[fecha]) agrupadas[fecha] = [];
          agrupadas[fecha].push(c);
        });
        setCargasPorFecha(agrupadas);
        setFechasDisponibles(
          Object.keys(agrupadas).sort((a, b) => new Date(b) - new Date(a))
        );
      })
      .catch((error) => {
        console.error("Error al cargar cargas:", error);
        setCargas([]);
      });
  };

  const agruparBultosPorLocal = (estado, reporte) => {
    if (!reporte || !reporte.bultosProblema) return {};
    const filtrados = reporte.bultosProblema.filter(
      (b) => b.estadoRecepcion === estado
    );
    const agrupados = {};

    filtrados.forEach((b) => {
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

  const handleGenerarReporteDesdeCodigo = async () => {
    try {
      const carga = cargasPorFecha[fechaSeleccionada]?.find(
        (c) => c.codigoCarga === codigoSeleccionado
      );

      if (!carga || !carga.idCarga) {
        toast.error("Carga no encontrada o ID inválido");
        return;
      }

      const reporteRes = await axios.get(
        `${API_BASE_URL}/cargas/reporte-recepcion/${carga.idCarga}`
      );
      const reporte = reporteRes.data;

      // Agrupar bultos deteriorados y faltantes
      setCodigoParaReporte(carga.codigoCarga);
      setIdCargaReporte(carga.idCarga);
      setFaltantesPorLocal(agruparBultosPorLocal("FALTANTE", reporte));
      setDeterioradosPorLocal(agruparBultosPorLocal("DETERIORADO", reporte));
      setMostrarReporte(true);
      setModalReporteOpen(false);
    } catch (err) {
      toast.error("Error al generar el reporte.");
      console.error("Error al generar el reporte:", err);
    }
  };

  const handleCompletarCarga = async () => {
    if (!filtroCodigoCarga) return;

    try {
      await axios.put(`${API_BASE_URL}/bultos/completar-carga`, {
        codigoCarga: filtroCodigoCarga,
      });

      toast.success("Carga completada con éxito");
      cargarBultos(); // refrescar tabla
    } catch (error) {
      toast.error("Hubo un error al completar la carga");
      console.error(error);
    }
  };

  const handleTerminarCarga = async () => {
    try {
      await axios.put(`${API_BASE_URL}/bultos/terminar-carga`, {
        codigoCarga: filtroCodigoCarga,
      });

      toast.success("Carga terminada con éxito");
      cargarBultos();
    } catch (error) {
      toast.error("Error al terminar la carga");
      console.error(error);
    } finally {
      setMostrarModalTerminar(false);
    }
  };

  return (
    <Layout>
      <div className="relative w-full max-w-5xl mx-auto mt-4 flex items-center justify-start">
        <BotonVolver ruta="/dashboard" />
        <h1 className="absolute left-1/2 transform -translate-x-1/2 text-3xl font-bold text-black dark:text-white text-center">
          Módulo de Recepción
        </h1>
      </div>

      <div className="flex flex-col items-center justify-start p-6 text-black dark:text-white transition-colors">
        <div className="flex flex-wrap gap-4 mb-4">
          <div>
            <label className="block text-black dark:text-white text-sm mb-1">
              Filtrar por fecha:
            </label>
            <select
              className="bg-gray-100 dark:bg-gray-800 text-black dark:text-white px-4 py-2 rounded transition-colors"
              value={filtroFecha}
              onChange={(e) => {
                setFiltroFecha(e.target.value);
                setFiltroCodigoCarga(""); // reinicia código si cambia fecha
              }}
            >
              <option value="">Todas</option>
              {fechasDisponibles.map((fecha, i) => (
                <option key={i} value={fecha}>
                  {fecha}
                </option>
              ))}
            </select>
          </div>

          {filtroFecha && (
            <div>
              <label className="block text-black dark:text-white text-sm mb-1">
                Filtrar por código de carga:
              </label>
              <select
                className="bg-gray-100 dark:bg-gray-800 text-black dark:text-white px-4 py-2 rounded transition-colors"
                value={filtroCodigoCarga}
                onChange={(e) => setFiltroCodigoCarga(e.target.value)}
              >
                <option value="">Todos</option>
                {cargasPorFecha[filtroFecha]
                  ?.slice() // 👈 sin filtrar, solo ordenar
                  .sort((a, b) =>
                    a.codigoCarga.localeCompare(b.codigoCarga, undefined, {
                      numeric: true,
                      sensitivity: "base",
                    })
                  )
                  .map((c, i) => (
                    <option key={i} value={c.codigoCarga}>
                      {c.codigoCarga}
                    </option>
                  ))}
              </select>
            </div>
          )}
        </div>

        {filtroFecha && filtroCodigoCarga && (
          <div className="w-full max-w-5xl flex justify-between items-end mb-4">
            {/* Input escanear (izquierda) */}
            <div className="flex flex-col">
              <label className="text-sm text-black dark:text-white mb-1">
                Escanear código de bulto:
              </label>
              <input
                type="text"
                className={`px-4 py-2 rounded transition-colors ${
                  cargaCompleta
                    ? "bg-gray-300 dark:bg-gray-600 text-black dark:text-white cursor-not-allowed"
                    : "bg-gray-100 dark:bg-gray-800 text-black dark:text-white"
                }`}
                placeholder="Ej: BANSA1234567890"
                disabled={cargaCompleta}
                onKeyDown={async (e) => {
                  if (cargaCompleta) return;
                  if (e.key === "Enter") {
                    const codigo = e.target.value.trim().toUpperCase();
                    const regex = /^BANSA\d{10}$/;

                    if (!regex.test(codigo)) {
                      toast.error(`Formato de código inválido`);
                      return;
                    }

                    try {
                      await axios.put(
                        `${API_BASE_URL}/bultos/actualizar-estado`,
                        {
                          codigoBulto: codigo,
                          nuevoEstado: "EN_BUEN_ESTADO",
                        }
                      );

                      toast.success(
                        `Estado del bulto ${codigo} actualizado a EN BUEN ESTADO`
                      );
                      e.target.value = "";
                      cargarBultos();
                    } catch (error) {
                      toast.error("Error al actualizar el estado del bulto");
                      console.error(error);
                    }
                  }
                }}
              />
            </div>

            {/* Input buscar (derecha) */}
            <div className="flex flex-col text-right">
              <label className="text-sm text-black dark:text-white mb-1">
                Editar estado:
              </label>
              <input
                type="text"
                className={`px-4 py-2 rounded transition-colors ${
                  cargaCompleta
                    ? "bg-gray-300 dark:bg-gray-600 text-black dark:text-white cursor-not-allowed"
                    : "bg-gray-100 dark:bg-gray-800 text-black dark:text-white"
                }`}
                placeholder="Ej: BANSA1234..."
                disabled={cargaCompleta}
                value={filtroCodigoBulto}
                onChange={(e) =>
                  setFiltroCodigoBulto(e.target.value.trim().toUpperCase())
                }
              />
            </div>
          </div>
        )}

        <div className="bg-white text-black rounded-xl shadow-lg w-full max-w-5xl mx-auto overflow-hidden">
          <div className="overflow-y-auto max-h-[400px]">
            <table className="table-auto w-full">
              <thead className="sticky top-0 z-10 bg-black text-white text-sm uppercase tracking-wide text-center">
                <tr>
                  <th className="px-6 py-3 text-center">Código Bulto</th>
                  <th className="px-6 py-3 text-center">Local</th>
                  <th className="px-6 py-3 text-center">Código Carga</th>
                  <th className="px-6 py-3 text-center">Estado Recepción</th>
                </tr>
              </thead>
              <tbody>
                {bultosFiltrados
                  .slice()
                  .sort((a, b) => {
                    const compareCarga = a.codigoCarga.localeCompare(
                      b.codigoCarga
                    );
                    if (compareCarga !== 0) return compareCarga;

                    const compareLocal = a.nombreLocal.localeCompare(
                      b.nombreLocal
                    );
                    if (compareLocal !== 0) return compareLocal;

                    return a.codigoBulto.localeCompare(b.codigoBulto);
                  })
                  .map((b, i) => (
                    <tr key={i} className="text-center border-t">
                      <td className="px-4 py-2">{b.codigoBulto}</td>
                      <td className="px-4 py-2">
                        {b.nombreLocal} - {b.codigoLocal}
                      </td>
                      <td className="px-4 py-2">{b.codigoCarga}</td>
                      <td className="px-4 py-2 text-black text-center">
                        {filtroCodigoBulto ? (
                          <select
                            className="bg-gray-200 text-black px-2 py-1 rounded w-full text-center"
                            value={b.estadoRecepcion}
                            onChange={async (e) => {
                              const nuevoEstado = e.target.value;
                              if (nuevoEstado === "-") return;

                              try {
                                await axios.put(
                                  `${API_BASE_URL}/bultos/actualizar-estado`,
                                  {
                                    codigoBulto: b.codigoBulto,
                                    nuevoEstado,
                                  }
                                );

                                toast.success(
                                  `Estado actualizado a ${nuevoEstado.replace(
                                    /_/g,
                                    " "
                                  )}`
                                );
                                cargarBultos();
                              } catch (error) {
                                toast.error("Error al actualizar estado");
                                console.error(error);
                              }
                            }}
                          >
                            <option value="-" disabled>
                              -
                            </option>
                            <option value="EN_BUEN_ESTADO">
                              EN BUEN ESTADO
                            </option>
                            <option value="FALTANTE">FALTANTE</option>
                            <option value="DETERIORADO">DETERIORADO</option>
                          </select>
                        ) : (
                          b.estadoRecepcion.replace(/_/g, " ")
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-center gap-4 mt-6">
          <button
            className={`${
              filtroFecha && filtroCodigoCarga && !cargaCompleta
                ? "bg-green-500 hover:bg-green-600 cursor-pointer"
                : "bg-gray-400 cursor-not-allowed"
            } text-black font-bold py-2 px-4 rounded transition`}
            onClick={() => setMostrarConfirmacion(true)}
            disabled={!(filtroFecha && filtroCodigoCarga && !cargaCompleta)}
          >
            Completar Carga
          </button>

          <button
            className={`${
              filtroFecha && filtroCodigoCarga && !cargaCompleta
                ? "bg-red-500 hover:bg-red-600 cursor-pointer"
                : "bg-gray-400 cursor-not-allowed"
            } text-white font-bold py-2 px-6 rounded transition`}
            onClick={() => setMostrarModalTerminar(true)}
            disabled={!(filtroFecha && filtroCodigoCarga && !cargaCompleta)}
          >
            Terminar Carga
          </button>

          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition"
            onClick={() => {
              setModalReporteOpen(true);
              setFechaSeleccionada("");
              setCodigoSeleccionado("");
            }}
          >
            Generar Reporte
          </button>
        </div>

        {modalReporteOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="relative bg-white dark:bg-gray-900 text-black dark:text-white transition-colors rounded-xl shadow-lg w-[90%] max-w-md p-8">
              <button
                onClick={() => setModalReporteOpen(false)}
                className="absolute top-3 right-3 text-black dark:text-white text-xl font-bold hover:text-red-500"
              >
                &times;
              </button>

              <div className="flex flex-col items-center mb-6">
                <h2 className="text-xl font-bold text-green-400">
                  Selecciona Carga
                </h2>
              </div>

              <label className="block text-sm mb-1">Fecha de carga:</label>
              <select
                className="w-full bg-gray-100 dark:bg-gray-800 text-black dark:text-white px-4 py-2 mb-4 rounded transition-colors"
                value={fechaSeleccionada}
                onChange={(e) => {
                  setFechaSeleccionada(e.target.value);
                  setCodigoSeleccionado("");
                }}
              >
                <option value="">-- Selecciona una fecha --</option>
                {fechasDisponibles.map((f, i) => (
                  <option key={i} value={f}>
                    {f}
                  </option>
                ))}
              </select>

              <label className="block text-sm mb-1">Código de carga:</label>

              <select
                className="w-full bg-gray-100 dark:bg-gray-800 text-black dark:text-white px-4 py-2 mb-4 rounded transition-colors"
                value={codigoSeleccionado}
                onChange={(e) => setCodigoSeleccionado(e.target.value)}
                disabled={!fechaSeleccionada}
              >
                <option value="">-- Selecciona un código --</option>
                {fechaSeleccionada &&
                  cargasPorFecha[fechaSeleccionada]
                    ?.filter((c) =>
                      cargasSinNulos.some(
                        (cs) => cs.codigoCarga === c.codigoCarga
                      )
                    )
                    .sort((a, b) => a.codigoCarga.localeCompare(b.codigoCarga))
                    .map((c, i) => (
                      <option key={i} value={c.codigoCarga}>
                        {c.codigoCarga}
                      </option>
                    ))}
              </select>

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

        {mostrarReporte && (
          <ReporteRecepcionPDF
            codigoCarga={codigoParaReporte}
            fechaCarga={
              cargas.find((c) => c.codigoCarga === codigoParaReporte)
                ?.fechaCarga || ""
            }
            idCarga={idCargaReporte}
            faltantesPorLocal={faltantesPorLocal}
            deterioradosPorLocal={deterioradosPorLocal}
            onRenderComplete={() => {
              setMostrarReporte(false);
            }}
          />
        )}
      </div>

      {mostrarConfirmacion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative bg-white dark:bg-gray-900 text-black dark:text-white transition-colors p-6 rounded-xl shadow-xl w-[90%] max-w-sm">
            <button
              onClick={() => setMostrarConfirmacion(false)}
              className="absolute top-3 right-3 text-black dark:text-white text-xl font-bold hover:text-red-500"
            >
              &times;
            </button>

            <h2 className="text-lg font-bold mb-6 text-green-400 text-center">
              ¿Deseas completar esta carga?
            </h2>
            <div className="flex justify-center gap-4">
              <button
                className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-2 rounded font-bold"
                onClick={() => {
                  handleCompletarCarga();
                  setMostrarConfirmacion(false);
                }}
              >
                Sí, completar
              </button>
              <button
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded font-bold"
                onClick={() => setMostrarConfirmacion(false)}
              >
                No, cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarModalTerminar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative bg-white dark:bg-gray-900 text-black dark:text-white transition-colors p-6 rounded-xl shadow-xl w-[90%] max-w-sm">
            <button
              onClick={() => setMostrarModalTerminar(false)}
              className="absolute top-3 right-3 text-black dark:text-white text-xl font-bold hover:text-red-500"
            >
              &times;
            </button>

            <h2 className="text-lg font-bold mb-6 text-red-400 text-center">
              ¿Deseas terminar esta carga?
            </h2>
            <p className="text-sm text-center mb-4">
              Los bultos sin estado serán marcados como{" "}
              <strong>FALTANTE</strong>.
            </p>
            <div className="flex justify-center gap-4">
              <button
                className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-2 rounded font-bold"
                onClick={handleTerminarCarga}
              >
                Sí, terminar
              </button>
              <button
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded font-bold"
                onClick={() => setMostrarModalTerminar(false)}
              >
                No, cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Recepcion;
