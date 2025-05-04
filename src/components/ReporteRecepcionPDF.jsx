import { useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import { Chart, ArcElement, Tooltip, Legend, PieController } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import axios from 'axios';

Chart.register(ArcElement, Tooltip, Legend, ChartDataLabels, PieController);

const ReporteRecepcionPDF = ({ codigoCarga = 'TEST', idCarga = 0, faltantesPorLocal = {}, deterioradosPorLocal = {}, onRenderComplete }) => {
  const canvasRef1 = useRef(null);
  const canvasRef2 = useRef(null);
  const chart1Ref = useRef(null);
  const chart2Ref = useRef(null);

  const hasGenerated = useRef(false);

  useEffect(() => {
    if (hasGenerated.current) return;
    hasGenerated.current = true;

    const generarPDF = async () => {
      try {
        const canvas1 = canvasRef1.current;
        const canvas2 = canvasRef2.current;
        if (!canvas1 || !canvas2) throw new Error('Canvas no disponible');

        // Gráfico de recepción
        if (chart1Ref.current) chart1Ref.current.destroy();
        chart1Ref.current = new Chart(canvas1, {
          type: 'pie',
          data: {
            labels: ['Buen estado', 'Deteriorado', 'Faltante'],
            datasets: [{
              data: [75.98, 18.26, 5.76],
              backgroundColor: ['#4caf50', '#f44336', '#ff9800']
            }]
          },
          options: {
            animation: false,
            responsive: false,
            plugins: {
              datalabels: {
                color: '#fff',
                font: { weight: 'bold', size: 14 },
                formatter: (value, context) => {
                  const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                  const porcentaje = (value / total) * 100;
                  return `${porcentaje.toFixed(2)}%`;
                }
              }
            }
          },
          plugins: [ChartDataLabels]
        });

        // Gráfico de frecuencia
        const frecuenciaRes = await axios.get(`http://localhost:8080/api/cargas/reporte-frecuencia/${idCarga}`);
        const datosFrecuencia = frecuenciaRes.data;

        if (chart2Ref.current) chart2Ref.current.destroy();
        chart2Ref.current = new Chart(canvas2, {
          type: 'pie',
          data: {
            labels: ['En frecuencia', 'Fuera de frecuencia'],
            datasets: [{
              data: [
                datosFrecuencia.porcentajeEnFrecuencia,
                datosFrecuencia.porcentajeFueraFrecuencia
              ],
              backgroundColor: ['#4caf50', '#f44336']
            }]
          },
          options: {
            animation: false,
            responsive: false,
            plugins: {
              datalabels: {
                color: '#fff',
                font: { weight: 'bold', size: 14 },
                formatter: (value, context) => {
                  const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                  const porcentaje = (value / total) * 100;
                  return `${porcentaje.toFixed(2)}%`;
                }
              }
            }
          },
          plugins: [ChartDataLabels]
        });

        requestAnimationFrame(() => {
          setTimeout(() => {
            try {
              const img1 = canvas1.toDataURL();
              const img2 = canvas2.toDataURL();
              const pdf = new jsPDF();
              const width = pdf.internal.pageSize.getWidth();
              const height = pdf.internal.pageSize.getHeight();
              const bottomMargin = 20;
              let y = 20;

              const verificarSalto = () => {
                if (y + 10 > height - bottomMargin) {
                  pdf.addPage();
                  y = 20;
                }
              };

              // Página 1
              pdf.setFontSize(16);
              pdf.text(`Reporte de Recepción - Carga ${codigoCarga}`, width / 2, y, { align: 'center' });
              pdf.addImage(img1, 'PNG', 30, 30, width - 60, width - 60);

              pdf.setFontSize(12);
              y = width + 10;
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

              // Página 2 - Frecuencia
              pdf.addPage();
              pdf.setFontSize(16);
              pdf.text(`Frecuencia de locales - Carga ${codigoCarga}`, width / 2, 20, { align: 'center' });
              pdf.addImage(img2, 'PNG', 30, 30, width - 60, width - 60);

              y = width + 10;
              pdf.setFontSize(12);
              pdf.text('LOCALES EN FRECUENCIA', 20, y);
              y += 6;
              datosFrecuencia.localesEnFrecuencia
              .sort((a, b) => a.nombre.localeCompare(b.nombre))
              .forEach(local => {
                verificarSalto();
                const texto = typeof local === 'string' ? local : `${local.nombre} - ${local.codigo}`;
                pdf.text(`• ${texto}`, 25, y);
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
                const texto = typeof local === 'string' ? local : `${local.nombre} - ${local.codigo}`;
                pdf.text(`• ${texto}`, 25, y);
                y += 5;
              });

              pdf.save(`reporte_recepcion_${codigoCarga}_${new Date().toISOString().split('T')[0]}.pdf`);
              if (onRenderComplete) onRenderComplete();
            } catch (err) {
              console.error('Error al generar PDF:', err);
            }
          }, 500);
        });
      } catch (err) {
        console.error('Error al generar PDF:', err);
      }
    };

    generarPDF();
  }, [codigoCarga, idCarga, faltantesPorLocal, deterioradosPorLocal, onRenderComplete]);

  return (
    <div className="hidden">
      <canvas ref={canvasRef1} width="400" height="400" />
      <canvas ref={canvasRef2} width="400" height="400" />
    </div>
  );
};

export default ReporteRecepcionPDF;
