import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import BotonVolver from "../components/BotonVolver";
import AsignarFechaTransporteModal from "../components/AsignarFechaTransporteModal";
import { API_BASE_URL } from "../config/api";

const GestionBultos = () => {
  const [bultos, setBultos] = useState([]);
  const [cargas, setCargas] = useState([]);
  const [fechasDisponibles, setFechasDisponibles] = useState([]);
  const [cargasPorFecha, setCargasPorFecha] = useState({});

  const [filtroFecha, setFiltroFecha] = useState("");
  const [filtroCodigoCarga, setFiltroCodigoCarga] = useState("");
  const [filtroCodigoBulto, setFiltroCodigoBulto] = useState("");
  const [filtroLocal, setFiltroLocal] = useState("");

  const [modalAbierto, setModalAbierto] = useState(false);

  useEffect(() => {
    cargarBultos();
    cargarCargas();
  }, []);

  const cargarBultos = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/bultos/trazabilidad`);
      setBultos(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error al cargar bultos:", err);
      setBultos([]);
    }
  };

  const cargarCargas = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/cargas`);
      const data = Array.isArray(res.data) ? res.data : [];
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
    } catch (err) {
      console.error("Error al cargar cargas:", err);
      setCargas([]);
    }
  };

  const bultosFiltrados = useMemo(() => {
    return bultos.filter((b) => {
      if (filtroCodigoBulto && !b.codigoBulto.includes(filtroCodigoBulto))
        return false;
      if (filtroCodigoCarga && b.codigoCarga !== filtroCodigoCarga)
        return false;
      if (filtroLocal && !b.nombreLocal?.toUpperCase().includes(filtroLocal))
        return false;
      if (filtroFecha) {
        const carga = cargas.find((c) => c.codigoCarga === b.codigoCarga);
        if (!carga || carga.fechaCarga !== filtroFecha) return false;
      }
      return true;
    });
  }, [
    bultos,
    filtroFecha,
    filtroCodigoCarga,
    filtroCodigoBulto,
    filtroLocal,
    cargas,
  ]);

  const localesEnAlmacen = useMemo(() => {
    const set = new Set();
    bultosFiltrados.forEach((b) => {
      if (b.estadoTransporte === "EN_ALMACEN") {
        set.add(b.nombreLocal);
      }
    });
    return Array.from(set);
  }, [bultosFiltrados]);

  const formatFecha = (str) => {
    if (!str || str === "-") return "-";
    const [year, month, day] = str.split("-");
    return new Date(year, month - 1, day).toLocaleDateString("es-PE");
  };

  return (
    <Layout>
      <div className="relative w-full max-w-6xl mx-auto mt-4 flex items-center justify-start">
        <BotonVolver ruta="/dashboard" />
        <h1 className="absolute left-1/2 transform -translate-x-1/2 text-3xl font-bold text-black dark:text-white text-center">
          Gestión de Bultos
        </h1>
      </div>

      <div className="flex flex-col items-center justify-start p-6 text-black dark:text-white">
        <div className="flex flex-wrap gap-4 mb-4">
          <div>
            <label className="block text-sm mb-1">Filtrar por fecha:</label>
            <select
              className="bg-gray-100 dark:bg-gray-800 text-black dark:text-white px-4 py-2 rounded"
              value={filtroFecha}
              onChange={(e) => {
                setFiltroFecha(e.target.value);
                setFiltroCodigoCarga("");
              }}
            >
              <option value="">Todas</option>
              {fechasDisponibles.map((f, i) => (
                <option key={i} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          {filtroFecha && (
            <div>
              <label className="block text-sm mb-1">
                Filtrar por código de carga:
              </label>
              <select
                className="bg-gray-100 dark:bg-gray-800 text-black dark:text-white px-4 py-2 rounded"
                value={filtroCodigoCarga}
                onChange={(e) => setFiltroCodigoCarga(e.target.value)}
              >
                <option value="">Todos</option>
                {cargasPorFecha[filtroFecha]?.map((c, i) => (
                  <option key={i} value={c.codigoCarga}>
                    {c.codigoCarga}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm mb-1">
              Buscar código de bulto:
            </label>
            <input
              type="text"
              className="bg-gray-100 dark:bg-gray-800 text-black dark:text-white px-4 py-2 rounded"
              placeholder="Ej: BANSA1234..."
              value={filtroCodigoBulto}
              onChange={(e) =>
                setFiltroCodigoBulto(e.target.value.toUpperCase())
              }
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Buscar por local:</label>
            <input
              type="text"
              className="bg-gray-100 dark:bg-gray-800 text-black dark:text-white px-4 py-2 rounded"
              placeholder="Ej: TRUJILLO 2"
              value={filtroLocal}
              onChange={(e) => setFiltroLocal(e.target.value.toUpperCase())}
            />
          </div>
        </div>

        <div className="bg-white text-black rounded-xl shadow-lg w-full max-w-6xl mx-auto overflow-hidden">
          <div className="overflow-y-auto max-h-[450px]">
            <table className="table-auto w-full">
              <thead className="sticky top-0 z-10 bg-black text-white text-sm uppercase tracking-wide text-center">
                <tr>
                  <th className="px-4 py-2">Código Bulto</th>
                  <th className="px-4 py-2">Local</th>
                  <th className="px-4 py-2">Estado Recepción</th>
                  <th className="px-4 py-2">Estado Transporte</th>
                  <th className="px-4 py-2">Fecha Transporte</th>
                  <th className="px-4 py-2">Estado Despacho</th>
                  <th className="px-4 py-2">Fecha Despacho</th>
                </tr>
              </thead>
              <tbody>
                {bultosFiltrados.map((b, i) => (
                  <tr key={i} className="text-center border-t">
                    <td className="px-4 py-2">{b.codigoBulto}</td>
                    <td className="px-4 py-2">{b.nombreLocal || "-"}</td>
                    <td className="px-4 py-2">
                      {b.estadoRecepcion?.replace(/_/g, " ") || "-"}
                    </td>
                    <td className="px-4 py-2">
                      {b.estadoTransporte?.replace(/_/g, " ") || "-"}
                    </td>
                    <td className="px-4 py-2">
                      {formatFecha(b.fechaTransporte)}
                    </td>
                    <td className="px-4 py-2">
                      {b.estadoDespacho?.replace(/_/g, " ") || "-"}
                    </td>
                    <td className="px-4 py-2">
                      {formatFecha(b.fechaDespacho)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {localesEnAlmacen.length > 0 && (
          <button
            onClick={() => setModalAbierto(true)}
            disabled={!filtroFecha || !filtroCodigoCarga}
            className={`mt-6 px-6 py-2 rounded font-bold text-white transition ${
              !filtroFecha || !filtroCodigoCarga
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            Asignar Fecha de Transporte
          </button>
        )}

        {modalAbierto && (
          <AsignarFechaTransporteModal
            isOpen={modalAbierto}
            onClose={() => setModalAbierto(false)}
            localesDisponibles={localesEnAlmacen} // ✅ nombre correcto
            codigoCarga={filtroCodigoCarga}
            onAsignado={() => {
              setModalAbierto(false);
              cargarBultos();
            }}
          />
        )}
      </div>
    </Layout>
  );
};

export default GestionBultos;
