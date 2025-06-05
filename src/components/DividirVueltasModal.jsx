import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { toast } from 'react-toastify'

const DividirVueltasModal = ({ isOpen, onClose, localesIniciales, onConfirmar }) => {
    const [primeraVuelta, setPrimeraVuelta] = useState([]);
    const [segundaVuelta, setSegundaVuelta] = useState([]);

    useEffect(() => {
        if (isOpen) {
            setPrimeraVuelta(localesIniciales || []);
            setSegundaVuelta([]); // Reiniciar segunda vuelta también
        }
    }, [isOpen, localesIniciales]);

    const handleDragEnd = (result) => {
        const { source, destination } = result;

        if (!destination) return;

        // Si es la misma lista
        if (source.droppableId === destination.droppableId) {
            const list = source.droppableId === 'primera' ? [...primeraVuelta] : [...segundaVuelta];
            const setList = source.droppableId === 'primera' ? setPrimeraVuelta : setSegundaVuelta;

            const [movedItem] = list.splice(source.index, 1);
            list.splice(destination.index, 0, movedItem);
            setList(list);
        } else {
            // Movimiento entre listas
            const sourceList = source.droppableId === 'primera' ? [...primeraVuelta] : [...segundaVuelta];
            const setSourceList = source.droppableId === 'primera' ? setPrimeraVuelta : setSegundaVuelta;

            const destList = destination.droppableId === 'primera' ? [...primeraVuelta] : [...segundaVuelta];
            const setDestList = destination.droppableId === 'primera' ? setPrimeraVuelta : setSegundaVuelta;

            const [movedItem] = sourceList.splice(source.index, 1);
            destList.splice(destination.index, 0, movedItem);

            setSourceList(sourceList);
            setDestList(destList);
        }
    };

    const handleConfirmar = () => {
        if (primeraVuelta.length === 0 || segundaVuelta.length === 0) {
            toast.error("Ambas vueltas deben tener al menos un local.");
            return;
        }

        onConfirmar({
            primera: primeraVuelta,
            segunda: segundaVuelta,
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl w-[90%] max-w-4xl text-black dark:text-white">
                <h2 className="text-xl font-bold text-green-500 mb-4 text-center">Dividir en Primera y Segunda Vuelta</h2>

                <DragDropContext onDragEnd={handleDragEnd}>
                    <div className="grid grid-cols-2 gap-6">
                        {/* Primera Vuelta */}
                        <Droppable droppableId="primera">
                            {(provided) => (
                                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded shadow h-[300px] overflow-y-auto"
                                    ref={provided.innerRef} {...provided.droppableProps}>
                                    <h3 className="text-center font-semibold text-sm mb-2">Primera Vuelta</h3>
                                    {primeraVuelta.map((local, index) => (
                                        <Draggable key={local.idLocal} draggableId={String(local.idLocal)} index={index}>
                                            {(prov) => (
                                                <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps}
                                                    className="bg-white dark:bg-gray-700 mb-2 px-4 py-2 rounded shadow text-sm cursor-move">
                                                    {local.nombre} ({local.codigo})
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>

                        {/* Segunda Vuelta */}
                        <Droppable droppableId="segunda">
                            {(provided) => (
                                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded shadow h-[300px] overflow-y-auto"
                                    ref={provided.innerRef} {...provided.droppableProps}>
                                    <h3 className="text-center font-semibold text-sm mb-2">Segunda Vuelta</h3>
                                    {segundaVuelta.map((local, index) => (
                                        <Draggable key={local.idLocal} draggableId={String(local.idLocal)} index={index}>
                                            {(prov) => (
                                                <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps}
                                                    className="bg-white dark:bg-gray-700 mb-2 px-4 py-2 rounded shadow text-sm cursor-move">
                                                    {local.nombre} ({local.codigo})
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </div>
                </DragDropContext>

                <div className="mt-6 flex justify-center gap-4">
                    <button
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded"
                        onClick={onClose}
                    >
                        Cancelar
                    </button>
                    <button
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded"
                        onClick={handleConfirmar}
                    >
                        Confirmar Vueltas
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DividirVueltasModal;
