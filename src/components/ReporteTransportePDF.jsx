import { useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import logo from '../assets/logo.png'; // ajusta el path si es necesario

const ReporteTransportePDF = ({ datos, onRenderComplete }) => {
  const hasGenerated = useRef(false);

  useEffect(() => {
    if (hasGenerated.current || !datos) return;
    hasGenerated.current = true;

    const convertirImagen = (imagePath) => {
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
        img.onerror = reject;
      });
    };

    const generarPDF = async () => {
      try {
        const logoBase64 = await convertirImagen(logo);
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

        // Cabecera
        pdf.addImage(logoBase64, 'PNG', 15, 10, 30, 30);
        pdf.setFontSize(18);
        pdf.setFont('times', 'bold'); // ← Negrita
        pdf.text(`Reporte de Transporte - Carga ${datos.codigoCarga}`, width / 2, 45, { align: 'center' });
        y = 55;

        if (!datos || !Array.isArray(datos.rutas)) {
          console.error('Datos de reporte incompletos:', datos);
          return;
        }

        datos.rutas.forEach((ruta, index) => {
          verificarSalto();
          pdf.setFontSize(14);
          pdf.setFont('times', 'bold'); // ← Negrita
          pdf.text(`Ruta ${index + 1}`, 20, y);
          y += 6;

          pdf.setFontSize(13);
          pdf.setFont('times', 'normal'); // ← Color negro normal
          pdf.text(`• Placa: ${ruta.placa}`, 25, y);
          y += 5;
          pdf.text(`• Comentario: ${ruta.comentario || 'Sin comentario'}`, 25, y);
          y += 5;
          pdf.text('• Locales en orden:', 25, y);
          y += 5;

          ruta.locales.forEach((local) => {
            verificarSalto();
            pdf.text(`- ${local.nombre} (${local.codigo})`, 30, y);
            y += 5;
          });

          y += 8;
        });

        const fechaStr = datos.fechaCarga.split('-').reverse().join('-');
        pdf.save(`reporte_transporte_${datos.codigoCarga}_${fechaStr}.pdf`);
        if (onRenderComplete) onRenderComplete();
      } catch (error) {
        console.error('Error al generar PDF:', error);
      }
    };

    generarPDF();
  }, [datos, onRenderComplete]);

  return null;
};

export default ReporteTransportePDF;
