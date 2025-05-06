import { useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import axios from 'axios';
import logo from '../assets/logo.png';

const ReporteRecepcionPDF = ({
  codigoCarga = '',
  idCarga = null,
  faltantesPorLocal = {},
  deterioradosPorLocal = {},
  onRenderComplete
}) => {
  const hasGenerated = useRef(false);

  useEffect(() => {
    if (hasGenerated.current || !idCarga) return;
    hasGenerated.current = true;

    const convertImageToBase64 = (imagePath) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = imagePath;
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = (err) => reject(err);
      });
    };

    const generarPDF = async () => {
      try {
        const [datosFrecuencia, logoBase64] = await Promise.all([
          axios.get(`http://localhost:8080/api/cargas/reporte-frecuencia/${idCarga}`).then(res => res.data),
          convertImageToBase64(logo)
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

        // Página 1: Bultos con problemas
        pdf.addImage(logoBase64, 'PNG', 15, 10, 30, 30);
        pdf.setFontSize(16);
        pdf.text(`Reporte de Recepción - Carga ${codigoCarga}`, width / 2, 45, { align: 'center' });
        y = 55;

        pdf.setFontSize(12);
        pdf.text('BULTOS FALTANTES', 20, y);
        y += 6;
        for (const [local, bultos] of Object.entries(faltantesPorLocal)) {
          verificarSalto();
          pdf.text(`• ${local}`, 25, y);
          y += 5;
          bultos.forEach(b => {
            verificarSalto();
            pdf.text(`- ${b}`, 30, y);
            y += 5;
          });
        }

        y += 5;
        verificarSalto();
        pdf.text('BULTOS DETERIORADOS', 20, y);
        y += 6;
        for (const [local, bultos] of Object.entries(deterioradosPorLocal)) {
          verificarSalto();
          pdf.text(`• ${local}`, 25, y);
          y += 5;
          bultos.forEach(b => {
            verificarSalto();
            pdf.text(`- ${b}`, 30, y);
            y += 5;
          });
        }

        // Página 2: Frecuencia
        pdf.addPage();
        pdf.addImage(logoBase64, 'PNG', 15, 10, 30, 30);
        pdf.setFontSize(16);
        pdf.text(`Frecuencia de locales - Carga ${codigoCarga}`, width / 2, 45, { align: 'center' });
        y = 55;

        pdf.setFontSize(12);
        pdf.text('LOCALES EN FRECUENCIA', 20, y);
        y += 6;
        datosFrecuencia.localesEnFrecuencia
          .sort((a, b) => a.nombre.localeCompare(b.nombre))
          .forEach(local => {
            verificarSalto();
            pdf.text(`• ${local.nombre} - ${local.codigo}`, 25, y);
            y += 5;
          });

        y += 5;
        verificarSalto();
        pdf.text('LOCALES FUERA DE FRECUENCIA', 20, y);
        y += 6;
        datosFrecuencia.localesFueraFrecuencia
          .sort((a, b) => a.nombre.localeCompare(b.nombre))
          .forEach(local => {
            verificarSalto();
            pdf.text(`• ${local.nombre} - ${local.codigo}`, 25, y);
            y += 5;
          });

        pdf.save(`reporte_recepcion_${codigoCarga}_${new Date().toISOString().split('T')[0]}.pdf`);
        if (onRenderComplete) onRenderComplete();
      } catch (err) {
        console.error('Error al generar PDF:', err);
      }
    };

    generarPDF();
  }, [codigoCarga, idCarga, faltantesPorLocal, deterioradosPorLocal, onRenderComplete]);

  return null;
};

export default ReporteRecepcionPDF;
