import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Datos institucionales
const INSTITUTIONAL_DATA = {
  university: 'UNIVERSIDAD DE LA HABANA',
  department: 'Departamento de Servicios Tecnológicos (DST)',
  director: 'Dr. Carlos E. Quevedo',
  directorPosition: 'Director del Departamento de Servicios Tecnológicos'
};

// Configuración de estilos
const PDF_CONFIG = {
  margins: {
    left: 25,
    right: 25,
    top: 30,
    bottom: 20
  },
  colors: {
    primary: [78, 1, 1],
    secondary: [210, 180, 140],
    text: [0, 0, 0],
    gray: [100, 100, 100]
  }
};

/**
 * Función para generar reporte general de todos los pedidos
 */
export const generateProfessionalReportPDF = (data) => {
  try {
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
      doc.setTextColor(40, 40, 40);
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
    
    doc.setFont(undefined, 'bold');
    doc.text('RESUMEN EJECUTIVO', left, yPosition);
    yPosition += 8;
    
    doc.setFont(undefined, 'normal');
    doc.text(`Período: ${data.period}`, left, yPosition);
    yPosition += 6;
    
    doc.text(`Total de solicitudes: ${data.stats.totalRequests}`, left, yPosition);
    yPosition += 6;
    
    doc.text(`Monto total: $${data.stats.totalAmount.toFixed(2)} CUP`, left, yPosition);
    yPosition += 6;
    
    doc.text(`Usuarios activos: ${data.stats.activeUsers}`, left, yPosition);
    yPosition += 6;
    
    doc.text(`Proyectos involucrados: ${data.stats.projectsCount}`, left, yPosition);
    yPosition += 15;

    // Filtros aplicados
    if (data.filters) {
      doc.setFont(undefined, 'bold');
      doc.text('FILTROS APLICADOS:', left, yPosition);
      yPosition += 8;
      
      doc.setFont(undefined, 'normal');
      if (data.filters.user !== 'Todos') {
        doc.text(`• Usuario: ${data.filters.user}`, left + 5, yPosition);
        yPosition += 6;
      }
      if (data.filters.project !== 'Todos') {
        doc.text(`• Proyecto: ${data.filters.project}`, left + 5, yPosition);
        yPosition += 6;
      }
      if (data.filters.month !== 'Todos') {
        doc.text(`• Mes: ${data.filters.month}`, left + 5, yPosition);
        yPosition += 6;
      }
      if (data.filters.period !== 'Todos') {
        doc.text(`• Período: ${data.filters.period}`, left + 5, yPosition);
        yPosition += 6;
      }
      yPosition += 10;
    }

    // Introducción
    doc.setFont(undefined, 'bold');
    doc.text('INTRODUCCIÓN', left, yPosition);
    yPosition += 8;
    
    doc.setFont(undefined, 'normal');
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

    // Tabla de datos
    if (data.tableData && data.tableData.head && data.tableData.body) {
      checkNewPage(50);
      
      doc.autoTable({
        head: data.tableData.head,
        body: data.tableData.body,
        startY: yPosition,
        theme: 'grid',
        styles: { 
          fontSize: 9,
          cellPadding: 3,
          textColor: PDF_CONFIG.colors.text
        },
        headStyles: { 
          fillColor: PDF_CONFIG.colors.primary,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center'
        },
        margin: { left, right }
      });
      
      yPosition = doc.lastAutoTable.finalY + 15;
    }

    // Total general
    checkNewPage(10);
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text(`TOTAL GENERAL: $${data.stats.totalAmount.toFixed(2)} CUP`, pageWidth - right, yPosition, { align: 'right' });
    yPosition += 20;

    // Firmas
    checkNewPage(30);
    doc.setDrawColor(0, 0, 0);
    doc.line(left + 50, yPosition, left + 150, yPosition);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text(INSTITUTIONAL_DATA.director, left + 100, yPosition + 10, { align: 'center' });
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    doc.text(INSTITUTIONAL_DATA.directorPosition, left + 100, yPosition + 15, { align: 'center' });
    doc.text(INSTITUTIONAL_DATA.department, left + 100, yPosition + 20, { align: 'center' });

    addFooter();

    const fileName = `Informe_DST_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    return true;
  } catch (error) {
    console.error('Error generando PDF:', error);
    return false;
  }
};

/**
 * Función para generar reporte de pedidos seleccionados
 */
export const generateSelectedOrdersReportPDF = (data) => {
  try {
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
      doc.setTextColor(40, 40, 40);
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
    
    doc.setFont(undefined, 'bold');
    doc.text('RESUMEN DE SELECCIÓN', left, yPosition);
    yPosition += 8;
    
    doc.setFont(undefined, 'normal');
    doc.text(`Pedidos seleccionados: ${data.selectedOrders}`, left, yPosition);
    yPosition += 6;
    
    doc.text(`Monto total seleccionado: $${data.stats.totalAmount.toFixed(2)} CUP`, left, yPosition);
    yPosition += 6;
    
    doc.text(`Usuarios involucrados: ${data.stats.usersInvolved}`, left, yPosition);
    yPosition += 6;
    
    doc.text(`Regulares: ${data.stats.regularCount} | Extras: ${data.stats.extraCount}`, left, yPosition);
    yPosition += 15;

    // Descripción
    doc.setFont(undefined, 'bold');
    doc.text('DESCRIPCIÓN', left, yPosition);
    yPosition += 8;
    
    doc.setFont(undefined, 'normal');
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
    if (data.tableData && data.tableData.head && data.tableData.body) {
      checkNewPage(50);
      
      doc.autoTable({
        head: data.tableData.head,
        body: data.tableData.body,
        startY: yPosition,
        theme: 'grid',
        styles: { 
          fontSize: 9,
          cellPadding: 3,
          textColor: PDF_CONFIG.colors.text
        },
        headStyles: { 
          fillColor: PDF_CONFIG.colors.primary,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center'
        },
        margin: { left, right }
      });
      
      yPosition = doc.lastAutoTable.finalY + 15;
    }

    // Total seleccionado
    checkNewPage(10);
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text(`TOTAL SELECCIONADO: $${data.stats.totalAmount.toFixed(2)} CUP`, pageWidth - right, yPosition, { align: 'right' });
    yPosition += 20;

    addFooter();

    const fileName = `Reporte_Seleccionados_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    return true;
  } catch (error) {
    console.error('Error generando PDF de seleccionados:', error);
    return false;
  }
};

/**
 * Función para generar informe mensual
 */
export const generarInformeMensual = (data) => {
  try {
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
      doc.setTextColor(40, 40, 40);
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
    doc.text(`Mes: ${data.mes}`, pageWidth - right, yPosition, { align: 'right' });
    yPosition += 20;

    // Estadísticas principales
    doc.setFontSize(11);
    doc.setTextColor(...PDF_CONFIG.colors.text);
    
    doc.setFont(undefined, 'bold');
    doc.text('ESTADÍSTICAS MENSUALES', left, yPosition);
    yPosition += 8;
    
    doc.setFont(undefined, 'normal');
    doc.text(`Total de solicitudes: ${data.totalSolicitudes}`, left, yPosition);
    yPosition += 6;
    
    doc.text(`Monto total: $${data.montoTotal.toFixed(2)} CUP`, left, yPosition);
    yPosition += 6;
    
    doc.text(`Solicitudes regulares: ${data.solicitudesRegulares}`, left, yPosition);
    yPosition += 6;
    
    doc.text(`Pedidos extras: ${data.pedidosExtras}`, left, yPosition);
    yPosition += 6;
    
    doc.text(`Usuarios activos: ${data.usuariosActivos}`, left, yPosition);
    yPosition += 15;

    // Tabla de solicitudes
    if (data.solicitudes && data.solicitudes.length > 0) {
      checkNewPage(50);
      
      const tableHead = [['#', 'Usuario', 'Proyecto', 'Fecha', 'Tipo', 'Monto (CUP)']];
      const tableBody = data.solicitudes.map((solicitud, index) => [
        (index + 1).toString(),
        solicitud.usuario,
        solicitud.proyecto,
        new Date(solicitud.fecha).toLocaleDateString('es-ES'),
        solicitud.tipo,
        `$${solicitud.monto.toFixed(2)}`
      ]);

      doc.autoTable({
        head: tableHead,
        body: tableBody,
        startY: yPosition,
        theme: 'grid',
        styles: { 
          fontSize: 9,
          cellPadding: 3,
          textColor: PDF_CONFIG.colors.text
        },
        headStyles: { 
          fillColor: PDF_CONFIG.colors.primary,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center'
        },
        margin: { left, right }
      });
      
      yPosition = doc.lastAutoTable.finalY + 15;
    }

    addFooter();
    
    const fileName = `Informe_Mensual_${data.mes.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    return true;
  } catch (error) {
    console.error('Error generando informe mensual:', error);
    return false;
  }
};