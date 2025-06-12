import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaCamera } from "react-icons/fa";
import { API_BASE_URL } from "../config/api";

function RegistrarIrregularidadModal({ isOpen, onClose, onRegistroExitoso }) {
  const [form, setForm] = useState({
    fechaIncidencia: "",
    codigoBulto: "",
    numeroActa: "",
    nombreAuxiliar: "",
    nombre: "",
    tipoMerma: "",
    estadoMerma: "",
    cantidad: "",
  });
  const [foto, setFoto] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);

  const tiposMerma = ["DETERIORADO", "DISCREPANCIA", "FALTANTE"];

  useEffect(() => {
    if (foto) {
      const url = URL.createObjectURL(foto);
      setPreviewURL(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewURL(null);
    }
  }, [foto]);

  // 👉 Asignar automáticamente estadoMerma según tipoMerma
  useEffect(() => {
    if (form.tipoMerma === "FALTANTE") {
      setForm((prev) => ({ ...prev, estadoMerma: "FALTANTE" }));
    } else if (form.tipoMerma === "DETERIORADO" || form.tipoMerma === "DISCREPANCIA") {
      setForm((prev) => ({ ...prev, estadoMerma: "MERMA SIN SUSTENTO" }));
    } else {
      setForm((prev) => ({ ...prev, estadoMerma: "SIN ESTADO" }));
    }
  }, [form.tipoMerma]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = [
      "fechaIncidencia",
      "codigoBulto",
      "nombre",
      "tipoMerma",
      "cantidad",
    ];
    for (let field of requiredFields) {
      if (!form[field]) {
        toast.error("Todos los campos obligatorios deben estar completos.");
        return;
      }
    }

    const cantidadNum = parseInt(form.cantidad);
    if (isNaN(cantidadNum) || cantidadNum < 1) {
      toast.error("La cantidad debe ser un número mayor o igual a 1.");
      return;
    }

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      data.append(key, value); // ✅ Incluye estadoMerma ahora
    });

    if (foto) data.append("fotoRegistro", foto);

    try {
      const res = await fetch(`${API_BASE_URL}/actas`, {
        method: "POST",
        body: data,
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Irregularidad registrada con éxito");
      setForm({
        fechaIncidencia: "",
        codigoBulto: "",
        numeroActa: "",
        nombreAuxiliar: "",
        nombre: "",
        tipoMerma: "",
        estadoMerma: "",
        cantidad: "",
      });
      setFoto(null);
      setPreviewURL(null);
      if (onRegistroExitoso)
        onRegistroExitoso(form.codigoBulto, form.tipoMerma);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Error al registrar la irregularidad");
    }
  };

  const getMaxDate = () => new Date().toISOString().split("T")[0];
  const getMinDate = () => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return d.toISOString().split("T")[0];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 text-black dark:text-white rounded-xl shadow-lg w-[90%] max-w-4xl p-8 relative transition-colors">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-black dark:text-white text-2xl font-bold hover:text-red-500"
        >
          &times;
        </button>

        <h2 className="text-center text-green-400 font-bold text-lg mb-4">
          FORMULARIO DE IRREGULARIDAD
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="flex flex-col gap-3">
            <input
              name="fechaIncidencia"
              type="date"
              value={form.fechaIncidencia}
              min={getMinDate()}
              max={getMaxDate()}
              onChange={handleChange}
              className="px-4 py-2 rounded bg-gray-100 dark:bg-gray-800"
              required
            />
            <input
              name="codigoBulto"
              placeholder="Código del bulto"
              value={form.codigoBulto}
              onChange={handleChange}
              className="px-4 py-2 rounded bg-gray-100 dark:bg-gray-800"
              required
            />
            <input
              name="numeroActa"
              placeholder="Número de acta"
              value={form.numeroActa}
              onChange={handleChange}
              className="px-4 py-2 rounded bg-gray-100 dark:bg-gray-800"
            />
            <input
              name="nombreAuxiliar"
              placeholder="Nombre del auxiliar"
              value={form.nombreAuxiliar}
              onChange={handleChange}
              className="px-4 py-2 rounded bg-gray-100 dark:bg-gray-800"
            />
            <input
              name="nombre"
              placeholder="Nombre del bulto"
              value={form.nombre}
              onChange={handleChange}
              className="px-4 py-2 rounded bg-gray-100 dark:bg-gray-800"
              required
            />
            <select
              name="tipoMerma"
              value={form.tipoMerma}
              onChange={handleChange}
              className="px-4 py-2 rounded bg-gray-100 dark:bg-gray-800"
              required
            >
              <option value="">TIPO DE MERMA</option>
              {tiposMerma.map((tipo, i) => (
                <option key={i} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
            <input
              name="cantidad"
              placeholder="Cantidad"
              type="number"
              value={form.cantidad}
              onChange={handleChange}
              className="px-4 py-2 rounded bg-gray-100 dark:bg-gray-800"
              required
              min={1}
            />
          </div>

          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-500 rounded-lg p-6">
            <label className="flex flex-col items-center cursor-pointer">
              {!previewURL && (
                <FaCamera className="text-5xl text-gray-700 dark:text-white mb-4" />
              )}
              {previewURL ? (
                <img
                  src={previewURL}
                  alt="Previsualización"
                  className="max-w-full max-h-72 object-contain mb-2 rounded shadow"
                />
              ) : (
                <span className="text-sm text-gray-500 dark:text-gray-300">
                  Subir imagen (opcional)
                </span>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setFoto(e.target.files[0])}
              />
            </label>
          </div>
        </form>

        <div className="flex justify-between mt-6">
          <button
            type="submit"
            onClick={handleSubmit}
            className="bg-green-500 hover:bg-green-600 px-6 py-2 rounded font-bold"
          >
            Registrar
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-red-500 hover:bg-red-600 px-6 py-2 rounded font-bold"
          >
            Regresar
          </button>
        </div>
      </div>
    </div>
  );
}

export default RegistrarIrregularidadModal;
