import { useState } from 'react'
import { FaTruckMoving } from 'react-icons/fa'
import { FaFileExcel } from 'react-icons/fa'
import { toast } from 'react-toastify'


function CargaModal({ isOpen, onClose, onCargaRegistrada }) {
  const [form, setForm] = useState({
    fechaCarga: '',
    codigoCarga: '',
    placaCarreta: '',
    duenoCarreta: '',
  })
  const [file, setFile] = useState(null)

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value.toUpperCase() });
  }

  const resetForm = () => {
    setForm({
      fechaCarga: '',
      codigoCarga: '',
      placaCarreta: '',
      duenoCarreta: '',
    });
    setFile(null);
  }

  const getMaxDate = () => {
    const today = new Date();
    today.setDate(today.getDate() - 1); // ayer
    return today.toISOString().split('T')[0];
  };

  const getMinDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 7); // hace 7 días
    return date.toISOString().split('T')[0];
  };


  const handleSubmit = async e => {
    e.preventDefault()

    if (!file) {
      toast.error('Debes subir un archivo', { position: 'top-center' });
      return;
    }

    if (!file.name.endsWith('.xlsx')) {
      toast.error('Debes seleccionar un archivo válido en formato .xlsx', {
        position: 'top-center',
        autoClose: 3000,
      })
      return
    }

    const data = new FormData()
    data.append('fechaCarga', form.fechaCarga)
    data.append('codigoCarga', form.codigoCarga)
    data.append('placaCarreta', form.placaCarreta)
    data.append('duenoCarreta', form.duenoCarreta)
    data.append('file', file)

    setIsSubmitting(true)

    try {
      const response = await fetch('http://localhost:8080/api/cargas', {
        method: 'POST',
        body: data,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText)
      }

      const resultado = await response.json();
      if (onCargaRegistrada) onCargaRegistrada(resultado.idCarga);
      resetForm();               // limpiar campos
      onClose();
      toast.success('Carga registrada con éxito', { position: 'top-center' });


    } catch (error) {
      console.error('Error al registrar:', error);
      toast.error(error.message, { position: 'top-center' })
    }
    finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="relative bg-gray-900 text-white rounded-xl shadow-lg w-[90%] max-w-md p-8">

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white text-2xl font-bold hover:text-red-500"
        >
          &times;
        </button>

        <div className="flex flex-col items-center">
          <FaTruckMoving className="text-4xl text-white mb-3" />
          <h2 className="text-xl font-bold text-green-400 mb-6">Datos de la nueva carga</h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="date"
            name="fechaCarga"
            value={form.fechaCarga}
            onChange={handleChange}
            className="bg-gray-800 px-4 py-2 rounded"
            required
            min={getMinDate()}
            max={getMaxDate()}
          />

          <input
            type="text"
            name="codigoCarga"
            value={form.codigoCarga}
            onChange={handleChange}
            placeholder="Código de la carga"
            className="bg-gray-800 px-4 py-2 rounded"
            required
          />
          <input
            type="text"
            name="placaCarreta"
            value={form.placaCarreta}
            onChange={handleChange}
            placeholder="Placa de la Carreta"
            className="bg-gray-800 px-4 py-2 rounded"
            required
          />

          <select
            name="duenoCarreta"
            value={form.duenoCarreta}
            onChange={handleChange}
            className="bg-gray-800 px-4 py-2 rounded"
            required
          >
            <option value="">Selecciona el dueño</option>
            <option value="ISL">ISL</option>
            <option value="TERCERO">TERCERO</option>
          </select>


          <label className="flex flex-col items-center px-4 py-6 bg-gray-800 text-white rounded-lg shadow-md tracking-wide uppercase border border-dashed border-gray-400 cursor-pointer hover:bg-gray-700">
            <FaFileExcel className="w-10 h-10 text-green-400" />
            <span className="mt-2 text-base leading-normal">
              {file ? file.name : 'Selecciona un archivo excel'}
            </span>
            <input
              type="file"
              accept=".xlsx"
              onChange={e => setFile(e.target.files[0])}
              className="hidden"
            //required
            />
          </label>

          <div className="flex justify-center mt-4">

            <button
              type="submit"
              className="bg-green-400 text-black font-bold py-2 px-6 rounded hover:bg-green-500"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <svg className="animate-spin h-5 w-5 mr-2 text-black" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : null}
              {isSubmitting ? 'Registrando...' : 'Registrar'}
            </button>

          </div>
        </form>
      </div>
    </div>
  )
}

export default CargaModal
