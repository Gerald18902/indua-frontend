import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";
import { toast } from "react-toastify";

export default function Actas() {
  const navigate = useNavigate();
  const [actas, setActas] = useState([]);
  const [filtros, setFiltros] = useState({
    codigoBulto: "",
    tipoMerma: "",
    estadoMerma: "",
    fechaIncidencia: "",
  });
  const [actualizando, setActualizando] = useState(null);
  const [foto, setFoto] = useState(null);

  const fetchActas = () => {
    const params = new URLSearchParams();
    if (filtros.codigoBulto) params.append("codigoBulto", filtros.codigoBulto);
    if (filtros.tipoMerma) params.append("tipoMerma", filtros.tipoMerma);
    if (filtros.estadoMerma) params.append("estadoMerma", filtros.estadoMerma);
    if (filtros.fechaIncidencia)
      params.append("fechaIncidencia", filtros.fechaIncidencia);

    axios
      .get(`http://localhost:8080/api/actas?${params.toString()}`)
      .then((res) => setActas(res.data))
      .catch((err) => {
        console.error(err);
        toast.error("Error al cargar actas");
      });
  };

  useEffect(() => {
    fetchActas();
  }, []);

  const handleActualizar = async () => {
    const formData = new FormData();
    formData.append("estadoMerma", actualizando.estadoMerma);
    formData.append("responsabilidad", actualizando.responsabilidad);
    if (foto) formData.append("fotoRegularizacion", foto);

    try {
      await axios.post(
        `http://localhost:8080/api/actas/${actualizando.idActa}/actualizar`,
        formData
      );
      toast.success("Acta actualizada");
      setActualizando(null);
      setFoto(null);
      fetchActas();
    } catch (err) {
      console.error(err);
      toast.error("Error al actualizar acta");
    }
  };

  return (
    <Layout>
      <div className="relative w-full max-w-5xl mx-auto mt-4 flex items-center justify-start">
        <button
          onClick={() => navigate("/despacho")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          ← Volver
        </button>
        <h1 className="absolute left-1/2 transform -translate-x-1/2 text-3xl font-bold text-black dark:text-white text-center">
          Módulo de Actas
        </h1>
      </div>

      <div className="flex flex-wrap gap-4 p-6 justify-center">
        <input
          type="text"
          placeholder="Código Bulto"
          className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded text-black dark:text-white"
          value={filtros.codigoBulto}
          onChange={(e) => setFiltros({ ...filtros, codigoBulto: e.target.value })}
        />
        <select
          className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded text-black dark:text-white"
          value={filtros.tipoMerma}
          onChange={(e) => setFiltros({ ...filtros, tipoMerma: e.target.value })}
        >
          <option value="">Tipo Merma</option>
          <option value="DETERIORADO">DETERIORADO</option>
          <option value="DISCREPANCIA">DISCREPANCIA</option>
          <option value="FALTANTE">FALTANTE</option>
        </select>
        <select
          className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded text-black dark:text-white"
          value={filtros.estadoMerma}
          onChange={(e) => setFiltros({ ...filtros, estadoMerma: e.target.value })}
        >
          <option value="">Estado</option>
          <option value="MERMA CON SUSTENTO">MERMA CON SUSTENTO</option>
          <option value="PENDIENTE DE ENVÍO">PENDIENTE DE ENVÍO</option>
          <option value="REGULARIZADO">REGULARIZADO</option>
        </select>
        <input
          type="date"
          className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded text-black dark:text-white"
          value={filtros.fechaIncidencia}
          onChange={(e) => setFiltros({ ...filtros, fechaIncidencia: e.target.value })}
        />
      </div>

      <div className="flex justify-center mb-4">
        <button
          onClick={fetchActas}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
        >
          Buscar
        </button>
      </div>

      <div className="bg-white text-black rounded-xl shadow-lg w-full max-w-5xl mx-auto overflow-hidden">
        <div className="overflow-y-auto max-h-[400px]">
          <table className="table-auto w-full">
            <thead className="sticky top-0 z-10 bg-black text-white text-sm uppercase tracking-wide text-center">
              <tr>
                <th className="px-6 py-3">Código Bulto</th>
                <th className="px-6 py-3">Tipo Merma</th>
                <th className="px-6 py-3">Estado</th>
                <th className="px-6 py-3">Responsabilidad</th>
                <th className="px-6 py-3">Incidencia</th>
                <th className="px-6 py-3">Registro</th>
                <th className="px-6 py-3">Regularización</th>
                <th className="px-6 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {actas.map((a, i) => (
                <tr key={i} className="text-center border-t">
                  <td className="px-4 py-2">{a.codigoBulto}</td>
                  <td className="px-4 py-2">{a.tipoMerma}</td>
                  <td className="px-4 py-2">{a.estadoMerma}</td>
                  <td className="px-4 py-2">{a.responsabilidad || "-"}</td>
                  <td className="px-4 py-2">{a.fechaIncidencia}</td>
                  <td className="px-4 py-2">
                    {a.fotoRegistro && (
                      <img
                        src={`http://localhost:8080/uploads/${a.fotoRegistro}`}
                        alt="registro"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/img/placeholder.png";
                        }}
                        className="w-12 h-12 object-cover mx-auto"
                      />
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {a.fotoRegularizacion && (
                      <img
                        src={`http://localhost:8080/uploads/${a.fotoRegularizacion}`}
                        alt="regularizacion"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/img/placeholder.png";
                        }}
                        className="w-12 h-12 object-cover mx-auto"
                      />
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      className="bg-yellow-400 hover:bg-yellow-500 px-2 py-1 rounded"
                      onClick={() => setActualizando(a)}
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {actualizando && (
        <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded shadow-lg max-w-4xl mx-auto">
          <h3 className="text-lg font-bold mb-4 text-black dark:text-white">
            Editar Acta: {actualizando.codigoBulto}
          </h3>

          <div className="flex flex-wrap gap-4">
            <select
              className="p-2 rounded"
              value={actualizando.estadoMerma}
              onChange={(e) =>
                setActualizando({
                  ...actualizando,
                  estadoMerma: e.target.value,
                })
              }
            >
              <option value="MERMA CON SUSTENTO">MERMA CON SUSTENTO</option>
              <option value="PENDIENTE DE ENVÍO">PENDIENTE DE ENVÍO</option>
              <option value="REGULARIZADO">REGULARIZADO</option>
            </select>

            <select
              className="p-2 rounded"
              value={actualizando.responsabilidad || ""}
              onChange={(e) =>
                setActualizando({
                  ...actualizando,
                  responsabilidad: e.target.value,
                })
              }
            >
              <option value="">Responsabilidad</option>
              <option value="ORIGEN">ORIGEN</option>
              <option value="ATARAMA">ATARAMA</option>
              <option value="ATN">ATN</option>
              <option value="ISL">ISL</option>
              <option value="TERCERO">TERCERO</option>
            </select>

            <input type="file" onChange={(e) => setFoto(e.target.files[0])} />

            <button
              className="bg-green-500 text-white px-4 py-2 rounded"
              onClick={handleActualizar}
            >
              Guardar
            </button>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded"
              onClick={() => setActualizando(null)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
