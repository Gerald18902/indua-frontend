import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'


const Login = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('') // Limpiar error anterior

    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || 'Error al iniciar sesión')
      }

      const data = await response.json()

      // Guardar token y rol
      localStorage.setItem('token', data.token || 'temp-token')
      localStorage.setItem('rol', data.rol.toLowerCase())
      localStorage.setItem('nombre', data.nombre)

      // Redirigir al usuario a un dashboard según su rol
      if (data.rol === 'administrador') {
        navigate('/admin-home')
      } else {
        navigate('/dashboard')
      }      

    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="relative min-h-screen bg-gray-900 overflow-hidden flex items-center justify-center">
      {/* Blobs de fondo */}
      <div className="absolute w-[600px] h-[600px] bg-gradient-to-r from-[#FF754B] to-[#5D4BFF] rounded-full blur-3xl opacity-30 top-[-150px] left-[-150px]" />
      <div className="absolute w-[500px] h-[500px] bg-gradient-to-r from-[#5D4BFF] to-[#FF754B] rounded-full blur-3xl opacity-30 bottom-[-100px] right-[-100px]" />

      {/* Formulario */}
      <form
        onSubmit={handleSubmit}
        className="relative z-10 bg-gray-800 p-10 rounded-2xl shadow-lg w-full max-w-sm space-y-4"
      >
        <div className="flex justify-center mb-4">
          <img src={logo} alt="ISL" className="h-10" />
        </div>
        <h2 className="text-2xl font-bold text-center text-blue-400">¡Bienvenido!</h2>
        <p className="text-center text-sm text-gray-300">Ingresa tus credenciales para continuar.</p>

        <input
          type="text"
          name="username"
          placeholder="Usuario"
          value={form.username}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded"
        >
          Ingresar
        </button>
      </form>
    </div>
  )
}

export default Login