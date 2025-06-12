import { useEffect, useState } from "react";
import axios from "axios";
import DividirVueltasModal from "../components/DividirVueltasModal";
import { toast } from "react-toastify";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { API_BASE_URL } from "../config/api";

const AsignarRutaModal = ({ isOpen, onClose, onRutaAsignada }) => {
  const [cargasDisponibles, setCargasDisponibles] = useState([]);
  const [unidadesTransporte, setUnidadesTransporte] = useState([]);

  const [localesSeleccionados, setLocalesSeleccionados] = useState([]);
  const [localesDisponibles, setLocalesDisponibles] = useState([]);

  const [idCargaSeleccionada, setIdCargaSeleccionada] = useState("");
  const [codigoCargaSeleccionada, setCodigoCargaSeleccionada] = useState("");
  const [idUnidadSeleccionada, setIdUnidadSeleccionada] = useState("");
  const [comentario, setComentario] = useState("");
  const [paso, setPaso] = useState(1); // Paso 1 = selección, Paso 2 = comentario final
  const [mensajePendientes, setMensajePendientes] = useState("");

  const [bloquearCarga, setBloquearCarga] = useState(false);

  const [filtroLocal, setFiltroLocal] = useState("");

  const [segundaVueltaActiva, setSegundaVueltaActiva] = useState(false);
  const [mostrarSubmodalVueltas, setMostrarSubmodalVueltas] = useState(false);
  const [vueltasTemporales, setVueltasTemporales] = useState(null); // almacena { primera, segunda }
  const [localesParaDividir, setLocalesParaDividir] = useState([]);

  const tienePendientes = mensajePendientes !== "";

  useEffect(() => {
    if (isOpen) {
      axios
        .get(`${API_BASE_URL}/rutas/cargas-disponibles`)
        .then((res) => {
          const data = res.data;
          if (Array.isArray(data)) {
            setCargasDisponibles(data);
          } else {
            console.error("Respuesta inesperada en cargas:", data);
            setCargasDisponibles([]);
          }
        })
        .catch((err) => {
          console.error("Error al cargar cargas disponibles:", err);
          setCargasDisponibles([]);
        });

      axios
        .get(`${API_BASE_URL}/rutas/unidades-transporte`)
        .then((res) => setUnidadesTransporte(res.data || []));
    }
  }, [isOpen]);

  useEffect(() => {
    if (idCargaSeleccionada) {
      // Carga los locales no asignados aún
      axios
        .get(
          `${API_BASE_URL}/rutas/locales-en-frecuencia/${idCargaSeleccionada}`
        )
        .then((res) => {
          setLocalesSeleccionados([]);
          setLocalesDisponibles(res.data || []);
        });

      // Carga todas las unidades y filtra las ya usadas para esta carga
      axios.get(`${API_BASE_URL}/rutas/unidades-transporte`).then((res) => {
        const todas = res.data || [];

        axios
          .get(`${API_BASE_URL}/rutas?codigoCarga=${codigoCargaSeleccionada}`)
          .then((rutasRes) => {
            const rutas = rutasRes.data || [];
            const idsUsados = rutas.map((r) => r.idUnidad);
            const disponibles = todas.filter(
              (u) => !idsUsados.includes(u.idUnidad)
            );
            setUnidadesTransporte(disponibles);
          });
      });
    }
  }, [idCargaSeleccionada, codigoCargaSeleccionada]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(localesSeleccionados);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setLocalesSeleccionados(items);
  };

  const handleIrAConfirmacion = () => {
    if (
      !idCargaSeleccionada ||
      !idUnidadSeleccionada ||
      localesSeleccionados.length === 0
    ) {
      toast.error("Completa todos los campos requeridos");
      return;
    }

    setFiltroLocal("");

    if (segundaVueltaActiva) {
      // Abrir el submodal para dividir
      setLocalesParaDividir([...localesSeleccionados]);
      setMostrarSubmodalVueltas(true);
    } else {
      setPaso(2); // flujo normal
    }
  };

  const quitarLocal = (idLocal) => {
    const actualizados = localesSeleccionados.filter(
      (l) => l.idLocal !== idLocal
    );
    setLocalesSeleccionados(actualizados);
    const local = localesSeleccionados.find((l) => l.idLocal === idLocal);
    setLocalesDisponibles((prev) => [...prev, local]);

    // Si quedan menos de 2 locales, forzar que segunda vuelta se desactive
    if (actualizados.length < 2 && segundaVueltaActiva) {
      setSegundaVueltaActiva(false);
    }
  };

  const agregarLocal = (local) => {
    setLocalesDisponibles((prev) =>
      prev.filter((l) => l.idLocal !== local.idLocal)
    );
    setLocalesSeleccionados((prev) => [...prev, local]);
  };

  const handleConfirmarRuta = (vueltasDirectas = null) => {
    const rutasPayload = [];

    const vueltas = vueltasDirectas || vueltasTemporales;

    if (segundaVueltaActiva && vueltas) {
      rutasPayload.push({
        idCarga: idCargaSeleccionada,
        idUnidad: idUnidadSeleccionada,
        comentario: "PRIMERA VUELTA",
        localesOrdenados: vueltas.primera.map((l, index) => ({
          idLocal: l.idLocal,
          orden: index + 1,
        })),
      });

      rutasPayload.push({
        idCarga: idCargaSeleccionada,
        idUnidad: idUnidadSeleccionada,
        comentario: "SEGUNDA VUELTA",
        localesOrdenados: vueltas.segunda.map((l, index) => ({
          idLocal: l.idLocal,
          orden: index + 1,
        })),
      });
    } else {
      rutasPayload.push({
        idCarga: idCargaSeleccionada,
        idUnidad: idUnidadSeleccionada,
        comentario,
        localesOrdenados: localesSeleccionados.map((l, index) => ({
          idLocal: l.idLocal,
          orden: index + 1,
        })),
      });
    }

    Promise.all(
      rutasPayload.map((payload) =>
        axios.post(`${API_BASE_URL}/rutas`, payload)
      )
    )
      .then(() => {
        onRutaAsignada();

        axios
          .get(
            `${API_BASE_URL}/rutas/locales-en-frecuencia/${idCargaSeleccionada}`
          )
          .then((resp) => {
            const restantes = resp.data || [];
            if (restantes.length > 0) {
              setLocalesSeleccionados(restantes);
              setLocalesDisponibles([]);
              setIdUnidadSeleccionada("");
              setComentario("");
              setPaso(1);
              setMensajePendientes(
                "Aún quedan locales sin asignar. Continúa creando rutas."
              );
              setSegundaVueltaActiva(false);
              setVueltasTemporales(null);

              axios
                .get(`${API_BASE_URL}/rutas/unidades-transporte`)
                .then((res) => {
                  const todas = res.data || [];
                  axios
                    .get(
                      `${API_BASE_URL}/rutas?codigoCarga=${codigoCargaSeleccionada}`
                    )
                    .then((rutasRes) => {
                      const rutas = rutasRes.data || [];
                      const idsUsados = rutas.map((r) => r.idUnidad);
                      const disponibles = todas.filter(
                        (u) => !idsUsados.includes(u.idUnidad)
                      );
                      setUnidadesTransporte(disponibles);
                    });
                });

              setBloquearCarga(true);
            } else {
              axios
                .get(`${API_BASE_URL}/rutas/cargas-disponibles`)
                .then((res) => {
                  setCargasDisponibles(res.data || []);
                  setPaso(1);
                  setComentario("");
                  setIdCargaSeleccionada("");
                  setIdUnidadSeleccionada("");
                  setMensajePendientes("");
                  setSegundaVueltaActiva(false);
                  setVueltasTemporales(null);
                  onClose();
                });
            }
          });
      })
      .catch((err) => {
        console.error("Error al asignar rutas:", err);
        toast.error("Error al asignar la(s) ruta(s)");
      });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-900 text-black dark:text-white transition-colors p-6 rounded-xl w-[90%] max-w-2xl relative">
        <button
          onClick={() => {
            if (tienePendientes) {
              toast.error(
                "Debes terminar de asignar todos los locales antes de cerrar."
              );
              return;
            }

            setPaso(1);
            setComentario("");
            setIdCargaSeleccionada("");
            setIdUnidadSeleccionada("");
            setMensajePendientes("");
            setLocalesSeleccionados([]);
            setLocalesDisponibles([]);
            setFiltroLocal("");
            setSegundaVueltaActiva(false);
            setBloquearCarga(false);
            onClose();
          }}
          className={`absolute top-3 right-3 text-2xl font-bold ${
            tienePendientes
              ? "text-gray-500 cursor-not-allowed"
              : "text-black dark:text-white hover:text-red-500"
          }`}
          disabled={tienePendientes}
        >
          &times;
        </button>

        {paso === 1 ? (
          <>
            <h2 className="text-xl font-bold mb-4 text-green-400">
              Asignar Ruta Personalizada
            </h2>

            {mensajePendientes && (
              <div className="bg-yellow-500 text-black text-sm px-4 py-2 mb-4 rounded shadow">
                {mensajePendientes}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm mb-1">Carga:</label>
              <select
                className="w-full bg-gray-100 dark:bg-gray-800 text-black dark:text-white px-4 py-2 rounded transition-colors"
                value={idCargaSeleccionada}
                onChange={(e) => {
                  const id = e.target.value;
                  setIdCargaSeleccionada(id);

                  const carga = cargasDisponibles.find(
                    (c) => c.idCarga.toString() === id
                  );
                  if (carga) {
                    setCodigoCargaSeleccionada(carga.codigoCarga);
                  }
                }}
                disabled={bloquearCarga}
              >
                <option value="">-- Selecciona una carga --</option>
                {cargasDisponibles.map((c) => (
                  <option key={c.idCarga} value={c.idCarga}>
                    {c.codigoCarga}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm mb-1">
                Unidad de transporte:
              </label>
              <select
                className="w-full bg-gray-100 dark:bg-gray-800 text-black dark:text-white px-4 py-2 rounded transition-colors"
                value={idUnidadSeleccionada}
                onChange={(e) => setIdUnidadSeleccionada(e.target.value)}
              >
                <option value="">-- Selecciona una unidad --</option>
                {unidadesTransporte.map((u) => (
                  <option key={u.idUnidad} value={u.idUnidad}>
                    {u.placa}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4 flex items-center">
              <label
                htmlFor="switch-segunda-vuelta"
                className="text-sm select-none mr-3"
              >
                ¿Segunda vuelta?
              </label>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="switch-segunda-vuelta"
                  className="sr-only peer"
                  checked={segundaVueltaActiva}
                  onChange={(e) => setSegundaVueltaActiva(e.target.checked)}
                  disabled={localesSeleccionados.length < 2}
                />
                <div
                  className={`
      w-11 h-6 rounded-full
      ${
        localesSeleccionados.length < 2
          ? "bg-gray-300"
          : "bg-gray-400 peer-checked:bg-green-500"
      }
      peer-focus:outline-none transition-colors
    `}
                ></div>
                <div
                  className={`
      absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition
      peer-checked:translate-x-5
    `}
                ></div>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Seleccionados */}
              <div>
                <label className="block text-sm mb-1">
                  Locales seleccionados:
                </label>
                <div className="bg-gray-100 dark:bg-gray-800 text-black dark:text-white transition-colors rounded p-2 max-h-40 overflow-y-auto">
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="localesSeleccionados">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                        >
                          {localesSeleccionados.map((local, index) => (
                            <Draggable
                              key={local.idLocal}
                              draggableId={local.idLocal.toString()}
                              index={index}
                            >
                              {(prov) => (
                                <div
                                  ref={prov.innerRef}
                                  {...prov.draggableProps}
                                  {...prov.dragHandleProps}
                                  className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-400 transition-colors p-2 mb-1 rounded shadow cursor-move flex justify-between"
                                >
                                  <span>
                                    {local.nombre} ({local.codigo})
                                  </span>
                                  <button
                                    className="text-red-400 hover:text-red-600 ml-2 font-bold"
                                    onClick={() => quitarLocal(local.idLocal)}
                                    title="Quitar"
                                  >
                                    ➖
                                  </button>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                </div>
              </div>

              {/* Descartados */}
              <div>
                <label className="block text-sm mb-1">
                  Locales disponibles:
                </label>

                <input
                  type="text"
                  placeholder="Buscar local..."
                  className="w-full mb-2 px-3 py-1 rounded bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-600"
                  value={filtroLocal}
                  onChange={(e) => setFiltroLocal(e.target.value)}
                />

                <div className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-400 transition-colors p-2 rounded max-h-40 overflow-y-auto">
                  {localesDisponibles
                    .filter(
                      (local) =>
                        local.nombre
                          .toLowerCase()
                          .includes(filtroLocal.toLowerCase()) ||
                        local.codigo
                          .toLowerCase()
                          .includes(filtroLocal.toLowerCase())
                    )
                    .map((local, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center mb-1"
                      >
                        <span>
                          {local.nombre} ({local.codigo})
                        </span>
                        <button
                          className="text-green-400 hover:text-green-600 ml-2 font-bold"
                          onClick={() => agregarLocal(local)}
                          title="Agregar"
                        >
                          ➕
                        </button>
                      </div>
                    ))}
                  {localesDisponibles.length === 0 && (
                    <p className="text-sm italic text-gray-500">Ninguno</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-6 rounded"
                onClick={handleIrAConfirmacion}
              >
                Asignar Ruta
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-4 text-green-400">
              Comentario Final
            </h2>

            <div className="mb-4">
              <label className="block text-sm mb-1">
                Comentario (opcional):
              </label>
              <textarea
                className="w-full bg-gray-100 dark:bg-gray-800 text-black dark:text-white px-4 py-2 rounded transition-colors"
                rows="2"
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
              />
            </div>

            <div className="flex justify-center">
              <button
                className="bg-green-400 hover:bg-green-500 text-black font-bold py-2 px-6 rounded"
                onClick={handleConfirmarRuta}
              >
                Confirmar Ruta
              </button>
            </div>
          </>
        )}
      </div>

      <DividirVueltasModal
        isOpen={mostrarSubmodalVueltas}
        onClose={() => setMostrarSubmodalVueltas(false)}
        localesIniciales={localesParaDividir}
        onConfirmar={(vueltas) => {
          setMostrarSubmodalVueltas(false);
          handleConfirmarRuta(vueltas);
        }}
      />
    </div>
  );
};

export default AsignarRutaModal;
