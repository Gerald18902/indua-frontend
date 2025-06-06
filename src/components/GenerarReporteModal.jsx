import React, { useState, useRef, useEffect } from "react";
import jsPDF from "jspdf";
import axios from "axios";
import logo from "../assets/logo.png";

function GenerarReporteModal({ isOpen, onClose, fechasDisponibles, cargasPorFecha }) {
  const [fechaSeleccionada, setFechaSeleccionada] = useState("");
  const [codigoCargaSeleccionado, setCodigoCargaSeleccionado] = useState("");
  const hasGenerated = useRef(false);

  useEffect(() => {
    hasGenerated.current = false; // reset flag when modal opens
  }, [isOpen]);

  const convertirImagenBase64 = (path) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = path;
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = (err) => reject(err);
    });
  };

  const generarPDF = async () => {
    if (!codigoCargaSeleccionado || !fechaSeleccionada || hasGenerated.current) return;
    hasGenerated.current = true;

    try {
      const [datos, logoBase64] = await Promise.all([
        axios.get(`http://localhost:8080/api/cargas/reporte-despacho/${codigoCargaSeleccionado}`).then(res => res.data),
        convertirImagenBase64(logo)
      ]);

      const pdf = new jsPDF();
      const width = pdf.internal.pageSize.getWidth();
      const height = pdf.internal.pageSize.getHeight();
      let y = 20;

      const verificarSalto = () => {
        if (y + 10 > height - 20) {
          pdf.addPage();
          pdf.addImage(logoBase64, 'PNG', 15, 10, 30, 30);
          y = 45;
        }
      };

      const [anio, mes, dia] = datos.fechaCarga.split("-");

      pdf.addImage(logoBase64, 'PNG', 15, 10, 30, 30);
      pdf.setFontSize(16);
      pdf.text(`Reporte de Despacho - Carga ${datos.codigoCarga} (${dia}-${mes}-${anio})`, width / 2, 45, { align: 'center' });
      y = 55;
      pdf.setFontSize(12);

      const renderBloque = (titulo, seccion) => {
        pdf.setFont(undefined, 'bold');
        pdf.text(titulo, 20, y);
        y += 6;

        if (titulo !== 'FALTANTE') {
          Object.entries(seccion).forEach(([estado, locales]) => {
            verificarSalto();
            pdf.setFont(undefined, 'italic');
            pdf.text(estado, 25, y);
            y += 5;

            Object.entries(locales).forEach(([local, bultos]) => {
              verificarSalto();
              pdf.setFont(undefined, 'normal');
              pdf.text(`• ${local}`, 30, y);
              y += 5;
              bultos.forEach((b) => {
                verificarSalto();
                pdf.text(`- ${b}`, 35, y);
                y += 5;
              });
            });
          });
        } else {
          seccion.forEach((b) => {
            verificarSalto();
            pdf.setFont(undefined, 'normal');
            pdf.text(`- ${b}`, 25, y);
            y += 5;
          });
        }

        y += 5;
      };

      renderBloque("DETERIORADO", datos.deteriorados);
      renderBloque("DISCREPANCIA", datos.discrepancias);
      renderBloque("FALTANTE", datos.faltantes);

      pdf.save(`reporte_despacho_${datos.codigoCarga}_${dia}-${mes}-${anio}.pdf`);
    } catch (err) {
      console.error("Error al generar PDF:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 text-black dark:text-white p-6 rounded-lg w-[90%] max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-2xl font-bold hover:text-red-500"
        >
          &times;
        </button>

        <h2 className="text-green-500 font-bold text-lg text-center mb-4">Selecciona Carga</h2>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm">Fecha de carga:</label>
            <select
              value={fechaSeleccionada}
              onChange={(e) => {
                setFechaSeleccionada(e.target.value);
                setCodigoCargaSeleccionado("");
              }}
              className="w-full mt-1 px-3 py-2 rounded bg-gray-100 dark:bg-gray-800"
            >
              <option value="">Selecciona una fecha</option>
              {fechasDisponibles.map((f, i) => (
                <option key={i} value={f}>{f}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm">Código de carga:</label>
            <select
              value={codigoCargaSeleccionado}
              onChange={(e) => setCodigoCargaSeleccionado(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded bg-gray-100 dark:bg-gray-800"
              disabled={!fechaSeleccionada}
            >
              <option value="">Selecciona una carga</option>
              {(cargasPorFecha[fechaSeleccionada] || []).map((c, i) => (
                <option key={i} value={c.codigoCarga}>{c.codigoCarga}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-center mt-6">
          <button
            onClick={() => {
              generarPDF();
              onClose();
            }}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded font-bold"
          >
            Generar
          </button>
        </div>
      </div>
    </div>
  );
}

export default GenerarReporteModal;
