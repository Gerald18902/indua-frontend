import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Layout from '../components/Layout'
import BotonVolver from '../components/BotonVolver'
import FormularioUsuario from '../components/FormularioUsuario'

import { toast } from 'react-toastify'

const GestionUsuarios = () => {
  const [usuarios, setUsuarios] = useState([])
  const [modalAbierto, setModalAbierto] = useState(false)
  const [usuarioEditar, setUsuarioEditar] = useState(null)

  const cargarUsuarios = () => {
    fetch('http://localhost:8080/api/usuarios')
      .then(res => res.json())
      .then(data => setUsuarios(data))
      .catch(err => console.error('Error al cargar usuarios:', err))
  }

  useEffect(() => {
    cargarUsuarios()
  }, [])

  const abrirModalCrear = () => {
    setUsuarioEditar(null)
    setModalAbierto(true)
  }

  const abrirModalEditar = (usuario) => {
    setUsuarioEditar(usuario)
    setModalAbierto(true)
  }

  const cerrarModal = () => {
    setModalAbierto(false)
    setUsuarioEditar(null)
  }

  const guardarUsuario = (data) => {
    const metodo = usuarioEditar ? 'PUT' : 'POST'
    const url = usuarioEditar
      ? `http://localhost:8080/api/usuarios/${usuarioEditar.id_usuario}`
      : 'http://localhost:8080/api/auth/register'

    fetch(url, {
      method: metodo,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        estado: usuarioEditar ? data.estado : true // activo por defecto si es nuevo
      })
    })
      .then((res) => {
        if (!res.ok) throw new Error('Error en la operación')
        toast.success(usuarioEditar ? 'Usuario actualizado' : 'Usuario creado')
        cerrarModal()
        cargarUsuarios()
      })
      .catch(() => toast.error('Error al guardar usuario.'))
  }

  return (
    <Layout>
      {/* Encabezado */}
      <div className="relative w-full max-w-5xl mx-auto mt-4 flex items-center justify-start">
        <BotonVolver />
        <h1 className="absolute left-1/2 transform -translate-x-1/2 text-3xl font-bold text-black dark:text-white text-center">
          Gestión de Usuarios
        </h1>
      </div>


      <div className="flex flex-col items-center justify-start p-6 text-white">
        {/* Tabla de usuarios */}
        <div className="bg-white text-black rounded-xl shadow-lg w-full max-w-5xl overflow-hidden">
          <div className="overflow-y-auto max-h-[400px]">
            <table className="table-auto min-w-full">
              <thead className="sticky top-0 z-10 bg-black text-white text-sm uppercase tracking-wide text-center">
                <tr>
                  <th className="px-4 py-2 text-center">Nombre Completo</th>
                  <th className="px-4 py-2 text-center">Usuario</th>
                  <th className="px-4 py-2 text-center">Rol</th>
                  <th className="px-4 py-2 text-center">Estado</th>
                  <th className="px-4 py-2 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((user) => (
                  <tr key={user.id_usuario} className='text-center'>
                    <td className="px-4 py-2">{user.nombre} {user.apellido}</td>
                    <td className="px-4 py-2">{user.username}</td>
                    <td className="px-4 py-2 capitalize">{user.rol}</td>
                    <td className="px-4 py-2">{user.estado ? 'Activo' : 'Inactivo'}</td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => abrirModalEditar(user)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-3 py-1 rounded"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {usuarios.length === 0 && (
              <p className="text-center text-gray-300 mt-6">No hay usuarios registrados.</p>
            )}
          </div>
        </div>
      </div>

      {/* Botón agregar */}
      <div className="mt-10 flex justify-center">
        <button
          onClick={abrirModalCrear}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded shadow-md transition"
        >
          ➕ Agregar usuario
        </button>
      </div>

      {/* Modal */}
      {modalAbierto && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-900 text-black dark:text-white p-6 rounded-lg shadow-lg w-full max-w-lg relative transition-colors duration-300">
            <button
              onClick={cerrarModal}
              className="absolute top-2 right-3 text-black dark:text-white text-xl font-bold hover:text-red-500 transition"
            >
              ✕
            </button>
            <h2 className="text-black dark:text-white text-2xl font-bold mb-4 text-center">
              {usuarioEditar ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h2>
            <FormularioUsuario
              initialData={usuarioEditar || {}}
              onSubmit={guardarUsuario}
            />
          </div>
        </div>,
        document.body
      )}
    </Layout>
  )
}

export default GestionUsuarios
