import { useEffect, useState } from 'react'
import axios from 'axios'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'


const AsignarRutaModal = ({ isOpen, onClose, onRutaAsignada }) => {
  const [cargasDisponibles, setCargasDisponibles] = useState([])
  const [unidadesTransporte, setUnidadesTransporte] = useState([])

  const [localesSeleccionados, setLocalesSeleccionados] = useState([]);
  const [localesDescartados, setLocalesDescartados] = useState([]);

  const [idCargaSeleccionada, setIdCargaSeleccionada] = useState('')
  const [codigoCargaSeleccionada, setCodigoCargaSeleccionada] = useState('');
  const [idUnidadSeleccionada, setIdUnidadSeleccionada] = useState('')
  const [comentario, setComentario] = useState('')
  const [paso, setPaso] = useState(1); // Paso 1 = selección, Paso 2 = comentario final
  const [mensajePendientes, setMensajePendientes] = useState('');

  const [bloquearCarga, setBloquearCarga] = useState(false);

  const tienePendientes = mensajePendientes !== '';


  useEffect(() => {
    if (isOpen) {
      axios.get('http://localhost:8080/api/rutas/cargas-disponibles')
        .then(res => setCargasDisponibles(res.data || []))

      axios.get('http://localhost:8080/api/rutas/unidades-transporte')
        .then(res => setUnidadesTransporte(res.data || []))
    }
  }, [isOpen])

  useEffect(() => {
    if (idCargaSeleccionada) {
      // Carga los locales no asignados aún
      axios.get(`http://localhost:8080/api/rutas/locales-en-frecuencia/${idCargaSeleccionada}`)
        .then(res => {
          setLocalesSeleccionados(res.data || []);
          setLocalesDescartados([]);
        });

      // Carga todas las unidades y filtra las ya usadas para esta carga
      axios.get('http://localhost:8080/api/rutas/unidades-transporte')
        .then(res => {
          const todas = res.data || [];

          axios.get(`http://localhost:8080/api/rutas?codigoCarga=${codigoCargaSeleccionada}`)
            .then(rutasRes => {
              const rutas = rutasRes.data || [];
              const idsUsados = rutas.map(r => r.idUnidad);
              const disponibles = todas.filter(u => !idsUsados.includes(u.idUnidad));
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
    if (!idCargaSeleccionada || !idUnidadSeleccionada || localesSeleccionados.length === 0) {
      alert('Completa todos los campos requeridos');
      return;
    }
    setPaso(2); // cambia a la vista del comentario
  }

  const quitarLocal = (idLocal) => {
    if (localesSeleccionados.length <= 1) {
      alert('Debes dejar al menos un local para esta ruta');
      return;
    }
    const local = localesSeleccionados.find(l => l.idLocal === idLocal);
    setLocalesSeleccionados(prev => prev.filter(l => l.idLocal !== idLocal));
    setLocalesDescartados(prev => [...prev, local]);
  };

  const agregarLocal = (local) => {
    setLocalesDescartados(prev => prev.filter(l => l.idLocal !== local.idLocal));
    setLocalesSeleccionados(prev => [...prev, local]);
  };


  const handleConfirmarRuta = () => {
    const payload = {
      idCarga: idCargaSeleccionada,
      idUnidad: idUnidadSeleccionada,
      comentario,
      localesOrdenados: localesSeleccionados.map((l, index) => ({
        idLocal: l.idLocal,
        orden: index + 1
      }))
    };

    axios.post('http://localhost:8080/api/rutas', payload)
      .then(res => {
        console.log(res.data); // puede seguir mostrándose si quieres

        // Llama al callback para refrescar la tabla
        onRutaAsignada();

        // Vuelve a cargar los locales restantes
        axios.get(`http://localhost:8080/api/rutas/locales-en-frecuencia/${idCargaSeleccionada}`)
          .then(resp => {
            const restantes = resp.data || [];
            if (restantes.length > 0) {
              setLocalesSeleccionados(restantes);
              setIdUnidadSeleccionada('');
              setLocalesDescartados([]);
              setComentario('');
              setPaso(1);
              setMensajePendientes('Aún quedan locales sin asignar. Continúa creando rutas.');

              // Refrescar unidades disponibles
              axios.get('http://localhost:8080/api/rutas/unidades-transporte')
                .then(res => {
                  const todas = res.data || [];

                  axios.get(`http://localhost:8080/api/rutas?codigoCarga=${codigoCargaSeleccionada}`)
                    .then(rutasRes => {
                      const rutas = rutasRes.data || [];
                      const idsUsados = rutas.map(r => r.idUnidad);
                      const disponibles = todas.filter(u => !idsUsados.includes(u.idUnidad));
                      setUnidadesTransporte(disponibles);
                    });
                });
              setBloquearCarga(true);
            } else {
              // Ya no quedan locales pendientes → recargar lista de cargas disponibles
              axios.get('http://localhost:8080/api/rutas/cargas-disponibles')
                .then(res => {
                  setCargasDisponibles(res.data || []);
                  setPaso(1);
                  setComentario('');
                  setIdCargaSeleccionada('');
                  setIdUnidadSeleccionada('');
                  setMensajePendientes('');
                  onClose(); // cierra el modal
                });
            }

          });

      })
      .catch(err => {
        console.error('Error al asignar ruta:', err);
        alert('Error al asignar la ruta');
      });
  };

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-900 text-white p-6 rounded-xl w-[90%] max-w-2xl relative">
        <button
          onClick={() => {
            if (tienePendientes) {
              alert("Debes terminar de asignar todos los locales antes de cerrar.");
              return;
            }

            setPaso(1);
            setComentario('');
            setIdCargaSeleccionada('');
            setIdUnidadSeleccionada('');
            setMensajePendientes('');
            setLocalesSeleccionados([]);
            setLocalesDescartados([]);
            setBloquearCarga(false);
            onClose();
          }}
          className={`absolute top-3 right-3 text-2xl font-bold ${tienePendientes ? 'text-gray-500 cursor-not-allowed' : 'text-white hover:text-red-500'
            }`}
          disabled={tienePendientes}
        >
          &times;
        </button>


        {paso === 1 ? (
          <>
            <h2 className="text-xl font-bold mb-4 text-green-400">Asignar Ruta Personalizada</h2>

            {mensajePendientes && (
              <div className="bg-yellow-500 text-black text-sm px-4 py-2 mb-4 rounded shadow">
                {mensajePendientes}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm mb-1">Carga:</label>
              <select
                className="w-full bg-gray-800 px-4 py-2 rounded"
                value={idCargaSeleccionada}
                onChange={e => {
                  const id = e.target.value;
                  setIdCargaSeleccionada(id);

                  const carga = cargasDisponibles.find(c => c.idCarga.toString() === id);
                  if (carga) {
                    setCodigoCargaSeleccionada(carga.codigoCarga);
                  }
                }}
                disabled={bloquearCarga}
              >
                <option value="">-- Selecciona una carga --</option>
                {cargasDisponibles.map(c => (
                  <option key={c.idCarga} value={c.idCarga}>{c.codigoCarga}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm mb-1">Unidad de transporte:</label>
              <select
                className="w-full bg-gray-800 px-4 py-2 rounded"
                value={idUnidadSeleccionada}
                onChange={e => setIdUnidadSeleccionada(e.target.value)}
              >
                <option value="">-- Selecciona una unidad --</option>
                {unidadesTransporte.map(u => (
                  <option key={u.idUnidad} value={u.idUnidad}>{u.placa}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Seleccionados */}
              <div>
                <label className="block text-sm mb-1">Locales seleccionados:</label>
                <div className="bg-gray-800 rounded p-2 max-h-40 overflow-y-auto">
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="localesSeleccionados">
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef}>
                          {localesSeleccionados.map((local, index) => (
                            <Draggable key={local.idLocal} draggableId={local.idLocal.toString()} index={index}>
                              {(prov) => (
                                <div
                                  ref={prov.innerRef}
                                  {...prov.draggableProps}
                                  {...prov.dragHandleProps}
                                  className="bg-gray-700 text-white p-2 mb-1 rounded shadow cursor-move flex justify-between"
                                >
                                  <span>{local.nombre} ({local.codigo})</span>
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
                <label className="block text-sm mb-1">Locales descartados:</label>
                <div className="bg-gray-700 text-gray-400 p-2 rounded max-h-40 overflow-y-auto">
                  {localesDescartados.map((local, index) => (
                    <div key={index} className="flex justify-between items-center mb-1">
                      <span>{local.nombre} ({local.codigo})</span>
                      <button
                        className="text-green-400 hover:text-green-600 ml-2 font-bold"
                        onClick={() => agregarLocal(local)}
                        title="Agregar"
                      >➕</button>
                    </div>
                  ))}
                  {localesDescartados.length === 0 && (
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
            <h2 className="text-xl font-bold mb-4 text-green-400">Comentario Final</h2>

            <div className="mb-4">
              <label className="block text-sm mb-1">Comentario (opcional):</label>
              <textarea
                className="w-full bg-gray-800 px-4 py-2 rounded"
                rows="2"
                value={comentario}
                onChange={e => setComentario(e.target.value)}
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

    </div>
  )
}

export default AsignarRutaModal
