import { FaBoxOpen } from "react-icons/fa";

function RegistrarEntregaModal({ isOpen, onClose, onCompletarEntrega, onAbrirIrregularidad }) {
  if (!isOpen) return null;


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="relative bg-white dark:bg-gray-900 text-black dark:text-white rounded-xl shadow-lg w-[90%] max-w-md p-8 transition-colors">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-black dark:text-white text-2xl font-bold hover:text-red-500"
        >
          &times;
        </button>

        <div className="flex flex-col items-center">
          <FaBoxOpen className="text-4xl text-black dark:text-white mb-3" />
          <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-6">
            Registrar Entrega
          </h2>
        </div>

        <div className="flex flex-col gap-6">
          <button
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-6 rounded"
            onClick={() => {
              onClose(); // Cierra modal actual
              if (typeof onAbrirIrregularidad === "function") {
                onAbrirIrregularidad(); // Abre el modal de irregularidad
              }
            }}
          >
            Registrar Irregularidad
          </button>

          <button
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded"
            onClick={onCompletarEntrega}
          >
            Completar Entrega
          </button>
        </div>
      </div>
    </div>
  );
}

export default RegistrarEntregaModal;
