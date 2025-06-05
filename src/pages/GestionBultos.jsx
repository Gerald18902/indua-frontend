import Layout from '../components/Layout'
import BotonVolver from '../components/BotonVolver'

const GestionBultos = () => {
  return (
    <Layout>









      
      <div className="relative w-full max-w-5xl mx-auto mt-4 flex items-center justify-start">
        <BotonVolver ruta="/dashboard"/>

        <h1 className="absolute left-1/2 transform -translate-x-1/2 text-3xl font-bold text-black dark:text-white text-center">
          Gestión de Bultos
        </h1>
      </div>








    </Layout>
  )
}

export default GestionBultos