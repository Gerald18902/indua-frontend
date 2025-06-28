import { useState } from 'react'

const FormularioUsuario = ({ initialData = {}, onSubmit }) => {
  const isEdit = !!initialData.id_usuario

  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    username: '',
    password: '',
    rol: 'operaciones',
    estado: true,
    ...initialData
  })

  const [errores, setErrores] = useState({})

  const soloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/
  const usuarioValido = /^[A-Za-z0-9_]+$/

  const validarCampos = () => {
    const nuevosErrores = {}

    if (!soloLetras.test(form.nombre)) {
      nuevosErrores.nombre = 'El nombre solo debe contener letras y espacios.'
    }

    if (!soloLetras.test(form.apellido)) {
      nuevosErrores.apellido = 'El apellido solo debe contener letras y espacios.'
    }

    if (!usuarioValido.test(form.username)) {
      nuevosErrores.username = 'El nombre de usuario solo puede contener letras, números y guiones bajos.'
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const newValue = type === 'checkbox' ? checked : value
    setForm({ ...form, [name]: newValue })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validarCampos()) return

    const dataToSend = { ...form }
    if (isEdit) delete dataToSend.password
    onSubmit(dataToSend)
  }

  return (
    <form onSubmit={handleSubmit} className="text-black dark:text-white space-y-4">
      <div className="flex gap-4">
        <div className="w-1/2">
          <input
            name="nombre"
            placeholder="Nombre"
            value={form.nombre}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded bg-gray-100 dark:bg-gray-700 text-black dark:text-white focus:outline-none"
            required
          />
          {errores.nombre && (
            <p className="text-red-500 text-sm mt-1">{errores.nombre}</p>
          )}
        </div>

        <div className="w-1/2">
          <input
            name="apellido"
            placeholder="Apellido"
            value={form.apellido}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded bg-gray-100 dark:bg-gray-700 text-black dark:text-white focus:outline-none"
            required
          />
          {errores.apellido && (
            <p className="text-red-500 text-sm mt-1">{errores.apellido}</p>
          )}
        </div>
      </div>

      <div>
        <input
          name="username"
          placeholder="Nombre de usuario"
          value={form.username}
          onChange={handleChange}
          className="w-full px-3 py-2 rounded bg-gray-100 dark:bg-gray-700 text-black dark:text-white focus:outline-none"
          required
        />
        {errores.username && (
          <p className="text-red-500 text-sm mt-1">{errores.username}</p>
        )}
      </div>

      {!isEdit && (
        <input
          name="password"
          type="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={handleChange}
          className="w-full px-3 py-2 rounded bg-gray-100 dark:bg-gray-700 text-black dark:text-white focus:outline-none"
          required
        />
      )}

      <select
        name="rol"
        value={form.rol}
        onChange={handleChange}
        className="w-full px-3 py-2 rounded bg-gray-100 dark:bg-gray-700 text-black dark:text-white focus:outline-none"
      >
        <option value="administrador">Administrador</option>
        <option value="operaciones">Personal de Operaciones</option>
        <option value="atarama">Personal de Atarama</option>
      </select>

      {isEdit ? (
        <select
          name="estado"
          value={form.estado ? 'true' : 'false'}
          onChange={(e) =>
            setForm({ ...form, estado: e.target.value === 'true' })
          }
          className="w-full px-3 py-2 rounded bg-gray-100 dark:bg-gray-700 text-black dark:text-white focus:outline-none"
        >
          <option value="true">Activo</option>
          <option value="false">Inactivo</option>
        </select>
      ) : (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Estado:{' '}
          <span className="text-green-600 dark:text-green-400 font-semibold">
            Activo
          </span>
        </div>
      )}

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded"
      >
        Guardar
      </button>
    </form>
  )
}

export default FormularioUsuario
