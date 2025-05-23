import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import BotonVolver from "../components/BotonVolver";
import RegistrarEntregaModal from "../components/RegistrarEntregaModal";
import RegistrarIrregularidadModal from "../components/RegistrarIrregularidadModal";
import { toast } from "react-toastify";

function Despacho() {
  const [bultos, setBultos] = useState([]);
  const [cargas, setCargas] = useState([]);
  const [filtroFecha, setFiltroFecha] = useState("");
  const [filtroCodigoCarga, setFiltroCodigoCarga] = useState("");
  const [fechasDisponibles, setFechasDisponibles] = useState([]);
  const [cargasPorFecha, setCargasPorFecha] = useState({});
  const [modalEntregaOpen, setModalEntregaOpen] = useState(false);
  const [modalIrregularidadOpen, setModalIrregularidadOpen] = useState(false);

  useEffect(() => {
    cargarBultos();
    cargarCargas();
  }, []);

  const cargarBultos = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/bultos/en-camino");
      const data = Array.isArray(res.data) ? res.data : [];
      setBultos(data);
    } catch (err) {
      console.error("Error al cargar bultos en camino:", err);
      setBultos([]);
    }
  };

  const cargarCargas = () => {
    axios
      .get("http://localhost:8080/api/cargas")
      .then((res) => {
        const data = res.data;
        setCargas(data);
        const agrupadas = {};
        data.forEach((c) => {
          const fecha = c.fechaCarga;
          if (!agrupadas[fecha]) agrupadas[fecha] = [];
          agrupadas[fecha].push(c);
        });
        setCargasPorFecha(agrupadas);
        setFechasDisponibles(
          Object.keys(agrupadas).sort((a, b) => new Date(b) - new Date(a))
        );
      })
      .catch((err) => {
        console.error("Error al cargar cargas:", err);
        setCargas([]);
      });
  };

  const bultosFiltrados = useMemo(() => {
    return bultos.filter((b) => {
      const carga = cargas.find((c) => c.codigoCarga === b.codigoCarga);
      const coincideFecha =
        !filtroFecha || (carga && carga.fechaCarga === filtroFecha);
      const coincideCarga =
        !filtroCodigoCarga || b.codigoCarga === filtroCodigoCarga;
      return coincideFecha && coincideCarga;
    });
  }, [bultos, filtroFecha, filtroCodigoCarga, cargas]);

  const completarEntrega = async () => {
    try {
      const codigos = bultosFiltrados.map((b) => b.codigoBulto);
      await axios.put(
        "http://localhost:8080/api/bultos/actualizar-despacho-masivo",
        {
          codigosBulto: codigos,
          nuevoEstado: "ENTREGADO_EN_BUEN_ESTADO",
        }
      );
      toast.success("Entrega registrada con éxito");
      setModalEntregaOpen(false);

      setBultos((prevBultos) =>
        prevBultos.map((b) =>
          codigos.includes(b.codigoBulto)
            ? {
                ...b,
                estadoDespacho: "ENTREGADO_EN_BUEN_ESTADO",
                tipoMerma: null,
              }
            : b
        )
      );
    } catch (err) {
      console.error(err);
      toast.error("Error al completar la entrega");
    }
  };

  const actualizarBultoMerma = (codigo, tipoMerma) => {
    setBultos((prevBultos) =>
      prevBultos.map((b) =>
        b.codigoBulto === codigo
          ? {
              ...b,
              tipoMerma,
              estadoDespacho: "ENTREGADO_CON_IRREGULARIDAD",
            }
          : b
      )
    );
  };

  return (
    <Layout>
      <div className="relative w-full max-w-5xl mx-auto mt-4 flex items-center justify-start">
        <BotonVolver />
        <h1 className="absolute left-1/2 transform -translate-x-1/2 text-3xl font-bold text-black dark:text-white text-center">
          Módulo de Despacho
        </h1>
      </div>

      <div className="flex flex-wrap gap-4 p-6 justify-center">
        <div>
          <label className="block text-sm mb-1 text-black dark:text-white">
            Filtrar por fecha:
          </label>
          <select
            value={filtroFecha}
            onChange={(e) => {
              setFiltroFecha(e.target.value);
              setFiltroCodigoCarga("");
            }}
            className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded text-black dark:text-white"
          >
            <option value="">Todas</option>
            {fechasDisponibles.map((fecha, i) => (
              <option key={i} value={fecha}>
                {fecha}
              </option>
            ))}
          </select>
        </div>

        {filtroFecha && (
          <div>
            <label className="block text-sm mb-1 text-black dark:text-white">
              Filtrar por código de carga:
            </label>
            <select
              value={filtroCodigoCarga}
              onChange={(e) => setFiltroCodigoCarga(e.target.value)}
              className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded text-black dark:text-white"
            >
              <option value="">Todos</option>
              {cargasPorFecha[filtroFecha]
                ?.sort((a, b) => a.codigoCarga.localeCompare(b.codigoCarga))
                .map((c, i) => (
                  <option key={i} value={c.codigoCarga}>
                    {c.codigoCarga}
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>

      <div className="bg-white text-black rounded-xl shadow-lg w-full max-w-5xl mx-auto overflow-hidden">
        <div className="overflow-y-auto max-h-[400px]">
          <table className="table-auto w-full">
            <thead className="sticky top-0 z-10 bg-black text-white text-sm uppercase tracking-wide text-center">
              <tr>
                <th className="px-6 py-3">Código Bulto</th>
                <th className="px-6 py-3">Local</th>
                <th className="px-6 py-3">Código Carga</th>
                <th className="px-6 py-3">Estado Despacho</th>
              </tr>
            </thead>
            <tbody>
              {[...bultosFiltrados]
                .sort((a, b) => a.codigoBulto.localeCompare(b.codigoBulto))
                .map((b, i) => (
                  <tr key={i} className="text-center border-t">
                    <td className="px-4 py-2">{b.codigoBulto}</td>
                    <td className="px-4 py-2">
                      {b.nombreLocal} - {b.codigoLocal}
                    </td>
                    <td className="px-4 py-2">{b.codigoCarga}</td>
                    <td className="px-4 py-2">
                      {b.tipoMerma ||
                        b.estadoDespacho?.replace(/_/g, " ") ||
                        "PENDIENTE"}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-center gap-4 mt-6">
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          onClick={() => setModalEntregaOpen(true)}
        >
          Registrar Entrega
        </button>
        <button
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
          onClick={() => setModalIrregularidadOpen(true)}
        >
          Registrar Irregularidad
        </button>
        <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
          Reportes
        </button>
      </div>

      <RegistrarEntregaModal
        isOpen={modalEntregaOpen}
        onClose={() => setModalEntregaOpen(false)}
        onCompletarEntrega={completarEntrega}
        onAbrirIrregularidad={() => {
          setModalEntregaOpen(false);
          setModalIrregularidadOpen(true);
        }}
      />

      <RegistrarIrregularidadModal
        isOpen={modalIrregularidadOpen}
        onClose={() => setModalIrregularidadOpen(false)}
        onRegistroCompleto={(codigo, tipoMerma) => {
          setModalIrregularidadOpen(false);
          actualizarBultoMerma(codigo, tipoMerma);
        }}
      />
    </Layout>
  );
}

export default Despacho;
