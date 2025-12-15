// src/utils/reportScheduler.js
import { generarInformeMensual } from './pdfGenerator';

export const scheduleMonthlyReport = () => {
  const checkAndGenerate = () => {
    const today = new Date();
    const isFirstDay = today.getDate() === 1;
    const hour = today.getHours();

    // Generar entre las 8:00 y 9:00 AM del 1ro
    if (isFirstDay && hour === 8) {
      const monthlyData = {
        mes: today.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
        totalSolicitudes: 0, // Aquí deberías obtener datos reales
        montoTotal: 0,
        solicitudesRegulares: 0,
        pedidosExtras: 0,
        usuariosActivos: 0,
        solicitudes: []
      };
      
      generarInformeMensual(monthlyData);
    }
  };

  // Ejecutar ahora y cada hora
  checkAndGenerate();
  setInterval(checkAndGenerate, 60 * 60 * 1000); // Cada hora
};

// Iniciar el scheduler
scheduleMonthlyReport();