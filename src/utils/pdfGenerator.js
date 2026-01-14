import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Datos institucionales
const INSTITUTIONAL_DATA = {
  university: 'UNIVERSIDAD DE LA HABANA',
  department: 'Dirección de Servicios Tecnológicos (DST)',
  director: 'Dr. Carlos E. Quevedo',
  directorPosition: 'Director del Departamento de Servicios Tecnológicos'
};

// Función para convertir colores HEX a RGB
const hexToRgb = (hex) => {
  // Eliminar el # si existe
  const hexColor = hex.replace('#', '');
  
  // Convertir a RGB
  const r = parseInt(hexColor.substring(0, 2), 16);
  const g = parseInt(hexColor.substring(2, 4), 16);
  const b = parseInt(hexColor.substring(4, 6), 16);
  
  return [r, g, b];
};

// Colores en formato HEX
const COLORS = {
  primary: '#4E0101',    // Borgundy
  secondary: '#d2b48c',  // Tan
  accent: '#667080',     // Sapphire
  light: '#F5F0E9',      // Swan White
  neutral: '#D9CBC2',    // Shellstone
};

// Configuración de estilos CON RGB CORRECTO
const PDF_CONFIG = {
  margins: {
    left: 25,
    right: 25,
    top: 30,
    bottom: 20
  },
  colors: {
    primary: hexToRgb(COLORS.primary),    // [78, 1, 1]
    secondary: hexToRgb(COLORS.secondary),// [210, 180, 140]
    text: [0, 0, 0],
    gray: [100, 100, 100],
    white: [255, 255, 255]
  }
};

/**
 * Función para generar reporte general de todos los pedidos
 */
export const generateProfessionalReportPDF = (data) => {
  try {
    console.log('📄 Iniciando generación de PDF general...', data);
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const { left, right, top } = PDF_CONFIG.margins;
    let yPosition = top;
    let currentPage = 1;

    const addHeader = () => {
      doc.setFontSize(10);
      doc.setTextColor(...PDF_CONFIG.colors.gray);
      doc.text(INSTITUTIONAL_DATA.university, left, 15);
      doc.text(INSTITUTIONAL_DATA.department, pageWidth / 2, 27, { align: 'center' });
      
      doc.setDrawColor(...PDF_CONFIG.colors.primary);
      doc.setLineWidth(0.5);
      doc.line(left, 32, pageWidth - right, 32);
    };

    const addFooter = () => {
      const footerY = doc.internal.pageSize.getHeight() - 15;
      doc.setFontSize(8);
      doc.setTextColor(...PDF_CONFIG.colors.gray);
      doc.text(`Página ${currentPage}`, pageWidth / 2, footerY, { align: 'center' });
      doc.text('Documento generado automáticamente por el Sistema SiPP', pageWidth / 2, footerY + 6, { align: 'center' });
    };

    const checkNewPage = (requiredSpace = 20) => {
      if (yPosition + requiredSpace > doc.internal.pageSize.getHeight() - 30) {
        addFooter();
        doc.addPage();
        currentPage++;
        yPosition = top;
        addHeader();
        return true;
      }
      return false;
    };

    // INICIO DEL CONTENIDO
    addHeader();

    // Título
    doc.setFontSize(16);
    doc.setTextColor(...PDF_CONFIG.colors.primary);
    doc.text('INFORME TÉCNICO OFICIAL', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Información del reporte
    doc.setFontSize(10);
    doc.setTextColor(...PDF_CONFIG.colors.gray);
    const reportCode = `INF-DST-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    doc.text(`Código: ${reportCode}`, left, yPosition);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, pageWidth - right, yPosition, { align: 'right' });
    yPosition += 20;

    // Estadísticas
    doc.setFontSize(11);
    doc.setTextColor(...PDF_CONFIG.colors.text);
    
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN EJECUTIVO', left, yPosition);
    yPosition += 8;
    
    doc.setFont('helvetica', 'normal');
    
    // Verificar que los datos existan
    if (!data.stats) {
      console.error('❌ Error: data.stats no está definido', data);
      throw new Error('Datos de estadísticas no disponibles');
    }
    
    const statsText = [
      `Período: ${data.period || 'No especificado'}`,
      `Total de solicitudes: ${data.stats.totalRequests || 0}`,
      `Monto total: $${(data.stats.totalAmount || 0).toFixed(2)} CUP`,
      `Usuarios activos: ${data.stats.activeUsers || 0}`,
      `Proyectos involucrados: ${data.stats.projectsCount || 0}`,
      `Solicitudes regulares: ${data.stats.regularRequests || 0}`,
      `Pedidos extras: ${data.stats.extraRequests || 0}`
    ];
    
    statsText.forEach(text => {
      checkNewPage(8);
      doc.text(text, left, yPosition, { maxWidth: pageWidth - left - right });
      yPosition += 7;
    });
    
    yPosition += 10;

    // Filtros aplicados (si existen)
    if (data.filters) {
      checkNewPage(15);
      doc.setFont('helvetica', 'bold');
      doc.text('FILTROS APLICADOS:', left, yPosition);
      yPosition += 8;
      
      doc.setFont('helvetica', 'normal');
      
      const filters = [];
      if (data.filters.user !== 'Todos' && data.filters.user) {
        filters.push(`• Usuario: ${data.filters.user}`);
      }
      if (data.filters.project !== 'Todos' && data.filters.project) {
        filters.push(`• Proyecto: ${data.filters.project}`);
      }
      if (data.filters.month !== 'Todos' && data.filters.month) {
        filters.push(`• Mes: ${data.filters.month}`);
      }
      if (data.filters.period !== 'Todos' && data.filters.period) {
        filters.push(`• Período: ${data.filters.period}`);
      }
      
      if (filters.length > 0) {
        filters.forEach(filter => {
          checkNewPage(8);
          doc.text(filter, left + 5, yPosition, { maxWidth: pageWidth - left - right });
          yPosition += 6;
        });
        yPosition += 10;
      }
    }

    // Introducción
    checkNewPage(20);
    doc.setFont('helvetica', 'bold');
    doc.text('INTRODUCCIÓN', left, yPosition);
    yPosition += 8;
    
    doc.setFont('helvetica', 'normal');
    const introText = [
      `El presente documento constituye el informe técnico oficial generado por el ${INSTITUTIONAL_DATA.department}`,
      `correspondiente al período especificado. Este reporte detallado presenta un análisis exhaustivo de todas`,
      `las solicitudes gestionadas a través del Sistema Integrado de Pedidos y Proyectos (SiPP).`
    ];
    
    introText.forEach(line => {
      checkNewPage(10);
      doc.text(line, left, yPosition, { maxWidth: pageWidth - left - right });
      yPosition += 6;
    });
    yPosition += 10;

    // Tabla de datos (si existe)
    if (data.tableData && data.tableData.head && data.tableData.body && data.tableData.body.length > 0) {
      checkNewPage(50);
      
      console.log('📊 Generando tabla con datos:', {
        headers: data.tableData.head,
        rows: data.tableData.body.length
      });
      
      try {
        doc.autoTable({
          head: data.tableData.head,
          body: data.tableData.body,
          startY: yPosition,
          theme: 'grid',
          styles: { 
            fontSize: 9,
            cellPadding: 3,
            textColor: PDF_CONFIG.colors.text,
            font: 'helvetica'
          },
          headStyles: { 
            fillColor: PDF_CONFIG.colors.primary,
            textColor: PDF_CONFIG.colors.white,
            fontStyle: 'bold',
            halign: 'center',
            fontSize: 10
          },
          margin: { left, right },
          didDrawPage: function (data) {
            // Esta función se llama para cada página dibujada
          }
        });
        
        yPosition = doc.lastAutoTable.finalY + 15;
      } catch (tableError) {
        console.error('❌ Error generando tabla:', tableError);
        // Continuar sin la tabla si hay error
        checkNewPage(10);
        doc.text('No se pudo generar la tabla de datos', left, yPosition);
        yPosition += 10;
      }
    } else {
      checkNewPage(10);
      doc.text('No hay datos de tabla disponibles para mostrar', left, yPosition);
      yPosition += 10;
    }

    // Total general
    checkNewPage(15);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL GENERAL: $${(data.stats.totalAmount || 0).toFixed(2)} CUP`, pageWidth - right, yPosition, { align: 'right' });
    yPosition += 20;

    // Firmas
    checkNewPage(40);
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.8);
    doc.line(left + 40, yPosition, left + 160, yPosition);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(INSTITUTIONAL_DATA.director, left + 100, yPosition + 10, { align: 'center' });
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(INSTITUTIONAL_DATA.directorPosition, left + 100, yPosition + 15, { align: 'center' });

    // Pie de página final
    addFooter();

    // Generar nombre de archivo
    const fileName = `Informe_DST_${new Date().toISOString().split('T')[0]}_${reportCode}.pdf`;
    console.log('💾 Guardando PDF como:', fileName);
    
    // Guardar el PDF
    doc.save(fileName);
    
    console.log('✅ PDF generado exitosamente');
    return true;
    
  } catch (error) {
    console.error('❌ Error generando PDF profesional:', error);
    console.error('Stack trace:', error.stack);
    
    // Intentar con un PDF simple de emergencia
    try {
      const emergencyDoc = new jsPDF();
      emergencyDoc.setFontSize(16);
      emergencyDoc.text('Error generando reporte', 20, 20);
      emergencyDoc.setFontSize(10);
      emergencyDoc.text(`Error: ${error.message}`, 20, 30);
      emergencyDoc.save('Error_Reporte.pdf');
    } catch (e) {
      console.error('❌ Error incluso en generación de emergencia:', e);
    }
    
    return false;
  }
};

/**
 * Función para generar reporte de pedidos seleccionados
 */
export const generateSelectedOrdersReportPDF = (data) => {
  try {
    console.log('📄 Iniciando generación de PDF seleccionado...', data);
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const { left, right, top } = PDF_CONFIG.margins;
    let yPosition = top;
    let currentPage = 1;

    const addHeader = () => {
      doc.setFontSize(10);
      doc.setTextColor(...PDF_CONFIG.colors.gray);
      doc.text(INSTITUTIONAL_DATA.university, left, 15);
      
      doc.setFontSize(12);
      doc.setTextColor(...PDF_CONFIG.colors.primary);
      doc.text(INSTITUTIONAL_DATA.department, pageWidth / 2, 27, { align: 'center' });
      
      doc.setDrawColor(...PDF_CONFIG.colors.primary);
      doc.setLineWidth(0.5);
      doc.line(left, 32, pageWidth - right, 32);
    };

    const addFooter = () => {
      const footerY = doc.internal.pageSize.getHeight() - 15;
      doc.setFontSize(8);
      doc.setTextColor(...PDF_CONFIG.colors.gray);
      doc.text(`Página ${currentPage}`, pageWidth / 2, footerY, { align: 'center' });
      doc.text('Documento generado automáticamente por el Sistema SiPP', pageWidth / 2, footerY + 6, { align: 'center' });
    };

    const checkNewPage = (requiredSpace = 20) => {
      if (yPosition + requiredSpace > doc.internal.pageSize.getHeight() - 30) {
        addFooter();
        doc.addPage();
        currentPage++;
        yPosition = top;
        addHeader();
        return true;
      }
      return false;
    };

    addHeader();

    // Título
    doc.setFontSize(16);
    doc.setTextColor(...PDF_CONFIG.colors.primary);
    doc.text('REPORTE DE PEDIDOS SELECCIONADOS', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Información del reporte
    doc.setFontSize(10);
    doc.setTextColor(...PDF_CONFIG.colors.gray);
    const reportCode = `SEL-DST-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    doc.text(`Código: ${reportCode}`, left, yPosition);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, pageWidth - right, yPosition, { align: 'right' });
    yPosition += 20;

    // Estadísticas de selección
    doc.setFontSize(11);
    doc.setTextColor(...PDF_CONFIG.colors.text);
    
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN DE SELECCIÓN', left, yPosition);
    yPosition += 8;
    
    doc.setFont('helvetica', 'normal');
    
    // Validar datos
    if (!data.stats) {
      console.error('❌ Error: data.stats no está definido en reporte seleccionado', data);
      data.stats = {
        selectedCount: 0,
        regularCount: 0,
        extraCount: 0,
        totalAmount: 0,
        usersInvolved: 0
      };
    }
    
    const statsText = [
      `Pedidos seleccionados: ${data.selectedOrders || 0}`,
      `Monto total seleccionado: $${(data.stats.totalAmount || 0).toFixed(2)} CUP`,
      `Usuarios involucrados: ${data.stats.usersInvolved || 0}`,
      `Regulares: ${data.stats.regularCount || 0} | Extras: ${data.stats.extraCount || 0}`
    ];
    
    statsText.forEach(text => {
      checkNewPage(8);
      doc.text(text, left, yPosition, { maxWidth: pageWidth - left - right });
      yPosition += 7;
    });
    yPosition += 10;

    // Descripción
    checkNewPage(15);
    doc.setFont('helvetica', 'bold');
    doc.text('DESCRIPCIÓN', left, yPosition);
    yPosition += 8;
    
    doc.setFont('helvetica', 'normal');
    const descText = [
      `Este reporte contiene información detallada exclusivamente de los pedidos seleccionados`,
      `por el administrador. Los datos presentados corresponden a solicitudes específicas`,
      `marcadas para inclusión en este documento.`
    ];
    
    descText.forEach(line => {
      checkNewPage(10);
      doc.text(line, left, yPosition, { maxWidth: pageWidth - left - right });
      yPosition += 6;
    });
    yPosition += 10;

    // Tabla de pedidos seleccionados
    if (data.tableData && data.tableData.head && data.tableData.body && data.tableData.body.length > 0) {
      checkNewPage(50);
      
      console.log('📊 Generando tabla de seleccionados:', {
        headers: data.tableData.head,
        rows: data.tableData.body.length
      });
      
      try {
        doc.autoTable({
          head: data.tableData.head,
          body: data.tableData.body,
          startY: yPosition,
          theme: 'grid',
          styles: { 
            fontSize: 9,
            cellPadding: 3,
            textColor: PDF_CONFIG.colors.text,
            font: 'helvetica'
          },
          headStyles: { 
            fillColor: PDF_CONFIG.colors.primary,
            textColor: PDF_CONFIG.colors.white,
            fontStyle: 'bold',
            halign: 'center',
            fontSize: 10
          },
          margin: { left, right }
        });
        
        yPosition = doc.lastAutoTable.finalY + 15;
      } catch (tableError) {
        console.error('❌ Error generando tabla de seleccionados:', tableError);
        checkNewPage(10);
        doc.text('No se pudo generar la tabla de pedidos seleccionados', left, yPosition);
        yPosition += 10;
      }
    } else {
      checkNewPage(10);
      doc.text('No hay datos de pedidos seleccionados para mostrar', left, yPosition);
      yPosition += 10;
    }

    // Total seleccionado
    checkNewPage(15);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL SELECCIONADO: $${(data.stats.totalAmount || 0).toFixed(2)} CUP`, pageWidth - right, yPosition, { align: 'right' });
    yPosition += 20;

    // Pie de página final
    addFooter();

    const fileName = `Reporte_Seleccionados_${new Date().toISOString().split('T')[0]}_${reportCode}.pdf`;
    console.log('💾 Guardando PDF seleccionado como:', fileName);
    
    doc.save(fileName);
    
    console.log('✅ PDF seleccionado generado exitosamente');
    return true;
    
  } catch (error) {
    console.error('❌ Error generando PDF de seleccionados:', error);
    console.error('Stack trace:', error.stack);
    return false;
  }
};

/**
 * Función para generar informe mensual
 */
export const generarInformeMensual = (data) => {
  try {
    console.log('📄 Iniciando generación de informe mensual...', data);
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const { left, right, top } = PDF_CONFIG.margins;
    let yPosition = top;
    let currentPage = 1;

    const addHeader = () => {
      doc.setFontSize(10);
      doc.setTextColor(...PDF_CONFIG.colors.gray);
      doc.text(INSTITUTIONAL_DATA.university, left, 15);
      
      doc.setFontSize(12);
      doc.setTextColor(...PDF_CONFIG.colors.primary);
      doc.text(INSTITUTIONAL_DATA.department, pageWidth / 2, 27, { align: 'center' });
      
      doc.setDrawColor(...PDF_CONFIG.colors.primary);
      doc.setLineWidth(0.5);
      doc.line(left, 32, pageWidth - right, 32);
    };

    const addFooter = () => {
      const footerY = doc.internal.pageSize.getHeight() - 15;
      doc.setFontSize(8);
      doc.setTextColor(...PDF_CONFIG.colors.gray);
      doc.text(`Página ${currentPage}`, pageWidth / 2, footerY, { align: 'center' });
      doc.text('Documento generado automáticamente por el Sistema SiPP', pageWidth / 2, footerY + 6, { align: 'center' });
    };

    const checkNewPage = (requiredSpace = 20) => {
      if (yPosition + requiredSpace > doc.internal.pageSize.getHeight() - 30) {
        addFooter();
        doc.addPage();
        currentPage++;
        yPosition = top;
        addHeader();
        return true;
      }
      return false;
    };

    // Contenido del informe mensual
    addHeader();

    // Título
    doc.setFontSize(16);
    doc.setTextColor(...PDF_CONFIG.colors.primary);
    doc.text('INFORME MENSUAL OFICIAL', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Información del mes
    doc.setFontSize(10);
    doc.setTextColor(...PDF_CONFIG.colors.gray);
    const reportCode = `INF-MENSUAL-DST-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    doc.text(`Código: ${reportCode}`, left, yPosition);
    doc.text(`Mes: ${data.mes || 'No especificado'}`, pageWidth - right, yPosition, { align: 'right' });
    yPosition += 20;

    // Estadísticas principales
    doc.setFontSize(11);
    doc.setTextColor(...PDF_CONFIG.colors.text);
    
    doc.setFont('helvetica', 'bold');
    doc.text('ESTADÍSTICAS MENSUALES', left, yPosition);
    yPosition += 8;
    
    doc.setFont('helvetica', 'normal');
    
    // Validar datos
    if (!data) {
      console.error('❌ Error: Datos del informe mensual no definidos');
      data = {
        totalSolicitudes: 0,
        montoTotal: 0,
        solicitudesRegulares: 0,
        pedidosExtras: 0,
        usuariosActivos: 0,
        solicitudes: []
      };
    }
    
    const statsText = [
      `Total de solicitudes: ${data.totalSolicitudes || 0}`,
      `Monto total: $${(data.montoTotal || 0).toFixed(2)} CUP`,
      `Solicitudes regulares: ${data.solicitudesRegulares || 0}`,
      `Pedidos extras: ${data.pedidosExtras || 0}`,
      `Usuarios activos: ${data.usuariosActivos || 0}`
    ];
    
    statsText.forEach(text => {
      checkNewPage(8);
      doc.text(text, left, yPosition, { maxWidth: pageWidth - left - right });
      yPosition += 7;
    });
    
    yPosition += 15;

    // Tabla de solicitudes (si existe)
    if (data.solicitudes && data.solicitudes.length > 0) {
      checkNewPage(50);
      
      const tableHead = [['#', 'Usuario', 'Proyecto', 'Fecha', 'Tipo', 'Monto (CUP)']];
      const tableBody = data.solicitudes.map((solicitud, index) => [
        (index + 1).toString(),
        solicitud.usuario || 'N/A',
        solicitud.proyecto || 'N/A',
        solicitud.fecha ? new Date(solicitud.fecha).toLocaleDateString('es-ES') : 'N/A',
        solicitud.tipo || 'N/A',
        `$${(solicitud.monto || 0).toFixed(2)}`
      ]);

      try {
        doc.autoTable({
          head: tableHead,
          body: tableBody,
          startY: yPosition,
          theme: 'grid',
          styles: { 
            fontSize: 9,
            cellPadding: 3,
            textColor: PDF_CONFIG.colors.text,
            font: 'helvetica'
          },
          headStyles: { 
            fillColor: PDF_CONFIG.colors.primary,
            textColor: PDF_CONFIG.colors.white,
            fontStyle: 'bold',
            halign: 'center',
            fontSize: 10
          },
          margin: { left, right }
        });
        
        yPosition = doc.lastAutoTable.finalY + 15;
      } catch (tableError) {
        console.error('❌ Error generando tabla mensual:', tableError);
        checkNewPage(10);
        doc.text('No se pudo generar la tabla de solicitudes mensuales', left, yPosition);
        yPosition += 10;
      }
    } else {
      checkNewPage(10);
      doc.text('No hay datos de solicitudes mensuales para mostrar', left, yPosition);
      yPosition += 10;
    }

    // Firmas
    checkNewPage(40);
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.8);
    doc.line(left + 40, yPosition, left + 160, yPosition);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(INSTITUTIONAL_DATA.director, left + 100, yPosition + 10, { align: 'center' });
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(INSTITUTIONAL_DATA.directorPosition, left + 100, yPosition + 15, { align: 'center' });
    doc.text(INSTITUTIONAL_DATA.department, left + 100, yPosition + 20, { align: 'center' });

    // Pie de página final
    addFooter();

    const fileName = `Informe_Mensual_${(data.mes || 'SinMes').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    console.log('💾 Guardando informe mensual como:', fileName);
    
    doc.save(fileName);
    
    console.log('✅ Informe mensual generado exitosamente');
    return true;
    
  } catch (error) {
    console.error('❌ Error generando informe mensual:', error);
    console.error('Stack trace:', error.stack);
    return false;
  }
};

// Exportar todas las funciones
export default {
  generateProfessionalReportPDF,
  generateSelectedOrdersReportPDF,
  generarInformeMensual
};