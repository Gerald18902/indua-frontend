import Layout from '../components/Layout'
import BotonVolver from '../components/BotonVolver'

const Despacho = () => {
  return (
    <Layout>







      <div className="relative w-full max-w-5xl mx-auto mt-4 flex items-center justify-start">
        <BotonVolver />

        <h1 className="absolute left-1/2 transform -translate-x-1/2 text-3xl font-bold text-white text-center">
          Módulo de Despacho
        </h1>
      </div>








    </Layout>
  )
}

export default Despacho
