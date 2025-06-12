import { useState } from 'react'
import { API_BASE_URL } from "../config/api";

const RegistroUsuario = () => {
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    username: '',
    password: '',
    rol: 'operaciones',
    estado: true
  })

  const [mensaje, setMensaje] = useState('')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('${API_BASE_URL}/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      if (!response.ok) throw new Error('Error al registrar usuario')

      setMensaje('Usuario registrado correctamente ✅')
      setForm({
        nombre: '',
        apellido: '',
        username: '',
        password: '',
        rol: 'operaciones',
        estado: true
      })
    } catch (err) {
      setMensaje('❌ ' + err.message)
    }
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-purple-900 via-purple-800 to-orange-600 text-white">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-10 rounded-xl shadow-md w-full max-w-md space-y-4"
      >
        <h2 className="text-xl font-bold text-center">Registrar Usuario</h2>

        <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} className="w-full p-2 rounded bg-gray-700" required />
        <input name="apellido" placeholder="Apellido" value={form.apellido} onChange={handleChange} className="w-full p-2 rounded bg-gray-700" required />
        <input name="username" placeholder="Usuario" value={form.username} onChange={handleChange} className="w-full p-2 rounded bg-gray-700" required />
        <input name="password" type="password" placeholder="Contraseña" value={form.password} onChange={handleChange} className="w-full p-2 rounded bg-gray-700" required />

        <select name="rol" value={form.rol} onChange={handleChange} className="w-full p-2 rounded bg-gray-700">
          <option value="administrador">Administrador</option>
          <option value="operaciones">Operaciones</option>
          <option value="atarama">Atarama</option>
        </select>

        <label className="flex items-center">
          <input type="checkbox" name="estado" checked={form.estado} onChange={handleChange} className="mr-2" />
          Usuario activo
        </label>

        <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 py-2 rounded">Registrar</button>

        {mensaje && <p className="text-center text-sm mt-2">{mensaje}</p>}
      </form>
    </div>
  )
}

export default RegistroUsuario
