import { useState } from 'react';
import axios from 'axios';

function EstadoRecepcionModal({ isOpen, onClose, onActualizado }) {
  const [codigoBulto, setCodigoBulto] = useState('');
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [mostrarPregunta, setMostrarPregunta] = useState(false);

  const handleActualizar = async () => {
    if (!codigoBulto || !nuevoEstado) return;

    try {
      await axios.put(`http://localhost:8080/api/bultos/actualizar-estado`, {
        codigoBulto,
        nuevoEstado,
      });

      setCodigoBulto('');
      setNuevoEstado('');

      onActualizado();
      setMostrarPregunta(true); // Mostrar solo la pregunta
    } catch (err) {
      alert('Error al actualizar estado del bulto');
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="relative bg-gray-900 text-white p-6 rounded-xl shadow-xl w-[90%] max-w-sm">

        {/* Botón de cierre (equis) */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white text-xl font-bold hover:text-red-500"
        >
          &times;
        </button>

        {!mostrarPregunta ? (
          <>
            <h2 className="text-lg font-bold mb-4 text-green-400">Editar Estado del Bulto</h2>

            <label className="block mb-2">Código del bulto:</label>
            <input
              type="text"
              className="w-full px-4 py-2 mb-4 rounded bg-gray-800 text-white"
              value={codigoBulto}
              onChange={(e) => setCodigoBulto(e.target.value.toUpperCase())}
            />

            <label className="block mb-2">Nuevo estado de recepción:</label>
            <select
              className="w-full px-4 py-2 mb-6 rounded bg-gray-800 text-white"
              value={nuevoEstado}
              onChange={(e) => setNuevoEstado(e.target.value)}
            >
              <option value="">Selecciona</option>
              <option value="EN_BUEN_ESTADO">En buen estado</option>
              <option value="DETERIORADO">Deteriorado</option>
              <option value="FALTANTE">Faltante</option>
            </select>

            <div className="flex justify-center mt-4">
              <button
                onClick={handleActualizar}
                className="bg-green-500 hover:bg-green-600 px-6 py-2 rounded font-bold"
              >
                Actualizar
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-center text-sm mb-4">¿Deseas editar otro bulto?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setMostrarPregunta(false);
                }}
                className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-2 rounded font-bold"
              >
                Sí, otro
              </button>
              <button
                onClick={() => {
                  setMostrarPregunta(false);
                  onClose();
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded font-bold"
              >
                No, salir
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default EstadoRecepcionModal;
