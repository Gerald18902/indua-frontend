import { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";

const AsignarFechaTransporteModal = ({
  isOpen,
  onClose,
  localesDisponibles,
  codigoCarga,
  onAsignado,
}) => {
  const [localSeleccionado, setLocalSeleccionado] = useState("");
  const [fechaSeleccionada, setFechaSeleccionada] = useState("");

  const hoy = new Date().toISOString().split("T")[0];

  const handleAsignar = async () => {
    if (!localSeleccionado || !fechaSeleccionada) {
      toast.error("Completa todos los campos");
      return;
    }

    try {
      await axios.put(
        "http://localhost:8080/api/bultos/asignar-fecha-transporte",
        {
          nombreLocal: localSeleccionado,
          codigoCarga,
          fechaTransporte: fechaSeleccionada, // ✅ directamente sin parseo
        }
      );
      toast.success("Fecha de transporte asignada correctamente");
      onAsignado();
      onClose();
    } catch (err) {
      toast.error("Error al asignar la fecha");
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 text-black dark:text-white rounded-lg p-6 w-[90%] max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-4 text-xl font-bold"
        >
          &times;
        </button>

        <h2 className="text-xl font-bold mb-4 text-center text-green-400">
          Asignar Fecha de Transporte
        </h2>

        <label className="block text-sm mb-1">Selecciona Local:</label>
        <select
          value={localSeleccionado}
          onChange={(e) => setLocalSeleccionado(e.target.value)}
          className="w-full mb-4 px-4 py-2 rounded bg-gray-100 dark:bg-gray-800"
        >
          <option value="">-- Selecciona un local --</option>
          {localesDisponibles.map((l, i) => (
            <option key={i} value={l}>
              {l}
            </option>
          ))}
        </select>

        <label className="block text-sm mb-1">Fecha de Transporte:</label>
        <input
          type="date"
          min={hoy}
          value={fechaSeleccionada}
          onChange={(e) => setFechaSeleccionada(e.target.value)}
          className="w-full mb-4 px-4 py-2 rounded bg-gray-100 dark:bg-gray-800"
        />

        <div className="flex justify-center">
          <button
            onClick={handleAsignar}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded font-bold"
          >
            Asignar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AsignarFechaTransporteModal;
