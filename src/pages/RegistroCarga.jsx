import { useEffect, useState } from 'react'
import axios from 'axios'
import Layout from '../components/Layout'
import CargaModal from '../components/CargaModal'
import BotonVolver from '../components/BotonVolver'

function RegistroCarga() {
  const [cargas, setCargas] = useState([])
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    cargarCargas()
  }, [])

  const cargarCargas = () => {
    axios.get('http://localhost:8080/api/cargas')
      .then(response => {
        let data = Array.isArray(response.data) ? response.data : [];

        // Ordenar por ID de forma descendente (inserción más reciente arriba)
        data.sort((a, b) => b.idCarga - a.idCarga);

        setCargas(data);
      })
      .catch(error => {
        console.error('Error al cargar cargas:', error);
        setCargas([]);
      });
  };


  const handleCargaRegistrada = async () => {
    await cargarCargas()
  }

  return (
    <Layout>
      <div className="relative w-full max-w-5xl mx-auto mt-4 flex items-center justify-start">
        <BotonVolver />
        <h1 className="absolute left-1/2 transform -translate-x-1/2 text-3xl font-bold text-black dark:text-white text-center">
          Registro de Carga
        </h1>
      </div>

      <div className="flex flex-col items-center justify-start p-6 text-white">
        {/* Tabla de cargas */}
        <div className="bg-white text-black rounded-xl shadow-lg w-full max-w-5xl overflow-hidden">
          <div className="overflow-y-auto max-h-[400px]">
            <table className="min-w-full table-auto">
            <thead className="sticky top-0 z-10 bg-black text-white text-sm uppercase tracking-wide text-center">
                <tr>
                  <th className="px-6 py-3 text-center">Fecha de Carga</th>
                  <th className="px-6 py-3 text-center">Código de Carga</th>
                  <th className="px-6 py-3 text-center">Placa</th>
                  <th className="px-6 py-3 text-center">Dueño</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(cargas) && cargas.map((carga, index) => (
                  <tr
                    key={index}
                    className={`${index % 2 === 0 ? 'bg-gray-100' : 'bg-white'} hover:bg-blue-100 transition`}
                  >
                    <td className="px-6 py-3 text-center">{carga.fechaCarga}</td>
                    <td className="px-6 py-3 text-center">{carga.codigoCarga}</td>
                    <td className="px-6 py-3 text-center">{carga.placaCarreta}</td>
                    <td className="px-6 py-3 text-center">{carga.duenoCarreta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>


        {/* Botón abrir modal */}
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setModalOpen(true)}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition"
          >
            INGRESAR NUEVA CARGA
          </button>
        </div>

        {/* Modal */}
        <CargaModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onCargaRegistrada={handleCargaRegistrada}
        />
      </div>
    </Layout>
  )
}

export default RegistroCarga
