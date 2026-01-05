// src/utils/plantillasUtils.js
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Datos institucionales
const DATOS_INSTITUCIONALES = {
  universidad: 'UNIVERSIDAD DE LA HABANA',
  departamento: 'Departamento de Servicios Tecnológicos (DST)',
  director: 'Dr. Carlos E. Quevedo',
  cargoDirector: 'Director del Departamento de Servicios Tecnológicos'
};

  // Paleta de colores
  const COLORS = {
    borgundy: '#4E0101',
    tan: '#d2b48c',
    sapphire: '#667080',
    swanWhite: '#F5F0E9',
    shellstone: '#D9CBC2',
  };

/**
 * Genera plantilla básica de acta de conformidad
 */
export const generarPlantillaActa = () => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 30;

  // Encabezado institucional
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(DATOS_INSTITUCIONALES.universidad, margin, 15);
  
  doc.setFontSize(12);
  doc.setTextColor(...hexToRgb(COLORS.borgundy));
  doc.text(DATOS_INSTITUCIONALES.departamento, pageWidth / 2, 25, { align: 'center' });
  
  doc.setDrawColor(...hexToRgb(COLORS.borgundy));
  doc.setLineWidth(0.5);
  doc.line(margin, 32, pageWidth - margin, 32);

  // Título del documento
  y = 45;
  doc.setFontSize(16);
  doc.setTextColor(...hexToRgb(COLORS.borgundy));
  doc.text('PLANTILLA DE ACTA DE CONFORMIDAD', pageWidth / 2, y, { align: 'center' });
  y += 15;

  // Código y fecha
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  const codigoActa = `AC-DST-${new Date().getFullYear()}-PLANTILLA`;
  doc.text(`Código: ${codigoActa}`, margin, y);
  doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, pageWidth - margin, y, { align: 'right' });
  y += 20;

  // Contenido de la plantilla
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);

  // src/utils/plantillasUtils.js

  // Función para convertir HEX a RGB
  const hexToRgb = (hex) => {
    // Remover el # si está presente
    const cleanedHex = hex.replace('#', '');
    
    // Convertir HEX a RGB
    const bigint = parseInt(cleanedHex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    
    return [r, g, b];
  };

  const contenidoActa = [
    'ACTA DE CONFORMIDAD - PLANTILLA',
    '',
    'Por medio del presente documento, el Departamento de Servicios Tecnológicos hace constar',
    'que ha completado satisfactoriamente el pedido asociado al proyecto:',
    '',
    '[NOMBRE DEL PROYECTO]',
    '',
    'Solicitado por: [NOMBRE DEL SOLICITANTE]',
    'Área: [ÁREA SOLICITANTE]',
    'Centro de Costo: [CENTRO DE COSTO]',
    'Número de Proyecto: [NÚMERO PROYECTO]',
    '',
    'El usuario [NOMBRE DEL SOLICITANTE] manifiesta su completa conformidad con los productos',
    'y/o servicios recibidos, reconociendo que han sido entregados de acuerdo a las',
    'especificaciones solicitadas y dentro de los parámetros de calidad establecidos.',
    '',
    'Se detallan a continuación los items entregados:'
  ];

  contenidoActa.forEach(line => {
    if (y > 250) {
      doc.addPage();
      y = 30;
    }
    doc.text(line, margin, y, { maxWidth: pageWidth - 2 * margin });
    y += 6;
  });

  y += 10;

  // Tabla de items (ejemplo)
  doc.autoTable({
    head: [['No.', 'Descripción', 'Cant.', 'Precio Unit. (CUP)', 'Total (CUP)']],
    body: [
      ['1', '[DESCRIPCIÓN DEL PRODUCTO/SERVICIO]', '[CANTIDAD]', '$[PRECIO]', '$[TOTAL]'],
      ['2', '[DESCRIPCIÓN DEL PRODUCTO/SERVICIO]', '[CANTIDAD]', '$[PRECIO]', '$[TOTAL]'],
      ['', '', '', 'TOTAL GENERAL:', '$[TOTAL GENERAL]']
    ],
    startY: y,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { 
      fillColor: COLORS.borgundy,
      textColor: 255,
      fontStyle: 'bold'
    },
    margin: { left: margin, right: margin }
  });

  y = doc.lastAutoTable.finalY + 20;

  // Firmas
  if (y > 200) {
    doc.addPage();
    y = 30;
  }

  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  
  // Firma del solicitante
  doc.text('_________________________', margin, y);
  doc.text('[NOMBRE DEL SOLICITANTE]', margin, y + 8);
  doc.text('Jefe de Proyecto', margin, y + 16);
  
  // Firma del director
  doc.text('_________________________', pageWidth - margin - 60, y, { align: 'right' });
  doc.text(DATOS_INSTITUCIONALES.director, pageWidth - margin - 60, y + 8, { align: 'right' });
  doc.text(DATOS_INSTITUCIONALES.cargoDirector, pageWidth - margin - 60, y + 16, { align: 'right' });

  // Pie de página
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('Documento generado automáticamente por el Sistema SiPP - Plantilla de Acta', pageWidth / 2, footerY, { align: 'center' });

  // Guardar
  doc.save('Plantilla_Acta_Conformidad_SiPP.pdf');
};

/**
 * Genera plantilla básica de reporte técnico
 */
export const generarPlantillaReporte = () => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 30;

  // Encabezado institucional
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(DATOS_INSTITUCIONALES.universidad, margin, 15);
  
  doc.setFontSize(12);
  doc.setTextColor(...hexToRgb(COLORS.borgundy));
  doc.text(DATOS_INSTITUCIONALES.departamento, pageWidth / 2, 25, { align: 'center' });
  
  doc.setDrawColor(...hexToRgb(COLORS.borgundy));
  doc.setLineWidth(0.5);
  doc.line(margin, 32, pageWidth - margin, 32);

  // Título del documento
  y = 45;
  doc.setFontSize(16);
  doc.setTextColor(...hexToRgb(COLORS.borgundy));
  doc.text('PLANTILLA DE INFORME TÉCNICO', pageWidth / 2, y, { align: 'center' });
  y += 15;

  // Código y fecha
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  const codigoReporte = `INF-DST-${new Date().getFullYear()}-PLANTILLA`;
  doc.text(`Código: ${codigoReporte}`, margin, y);
  doc.text(`Período: [FECHA INICIAL] al [FECHA FINAL]`, pageWidth - margin, y, { align: 'right' });
  y += 20;

  // Contenido del reporte
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);

  const contenidoReporte = [
    'INFORME TÉCNICO - PLANTILLA',
    '',
    'El presente documento constituye el informe técnico oficial correspondiente al período',
    'comprendido entre [FECHA INICIAL] y [FECHA FINAL].',
    '',
    'Este reporte detallado presenta un análisis exhaustivo de todas las solicitudes gestionadas',
    'a través del Sistema Integrado de Pedidos y Proyectos (SiPP), incluyendo tanto pedidos',
    'regulares como pedidos extras realizados por los diferentes departamentos y áreas.',
    '',
    'RESUMEN EJECUTIVO:',
    '• Total de solicitudes procesadas: [CANTIDAD]',
    '• Monto total gestionado: $[MONTO] CUP',
    '• Proyectos activos: [CANTIDAD]',
    '• Usuarios participantes: [CANTIDAD]',
    '',
    'DISTRIBUCIÓN POR TIPO DE SOLICITUD:',
    '• Productos: [CANTIDAD] solicitudes',
    '• Servicios: [CANTIDAD] solicitudes', 
    '• Pedidos Extra: [CANTIDAD] solicitudes',
    '',
    'PRINCIPALES INDICADORES:'
  ];

  contenidoReporte.forEach(line => {
    if (y > 250) {
      doc.addPage();
      y = 30;
    }
    doc.text(line, margin, y, { maxWidth: pageWidth - 2 * margin });
    y += 6;
  });

  y += 10;

  // Tabla de indicadores
  doc.autoTable({
    head: [['Indicador', 'Valor', 'Meta', 'Desviación']],
    body: [
      ['Tiempo promedio respuesta', '[VALOR] días', '[META] días', '[DESVIACIÓN]'],
      ['Satisfacción del usuario', '[VALOR]%', '[META]%', '[DESVIACIÓN]'],
      ['Cumplimiento de plazos', '[VALOR]%', '[META]%', '[DESVIACIÓN]'],
      ['Eficiencia presupuestaria', '[VALOR]%', '[META]%', '[DESVIACIÓN]']
    ],
    startY: y,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { 
      fillColor: COLORS.borgundy,
      textColor: 255,
      fontStyle: 'bold'
    },
    margin: { left: margin, right: margin }
  });

  y = doc.lastAutoTable.finalY + 15;

  // Recomendaciones
  doc.setFontSize(11);
  doc.setTextColor(...hexToRgb(COLORS.borgundy));
  doc.text('RECOMENDACIONES Y OBSERVACIONES:', margin, y);
  y += 10;

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  const recomendaciones = [
    '1. [OBSERVACIÓN/RECOMENDACIÓN ESPECÍFICA]',
    '2. [OBSERVACIÓN/RECOMENDACIÓN ESPECÍFICA]', 
    '3. [OBSERVACIÓN/RECOMENDACIÓN ESPECÍFICA]',
    '4. [OBSERVACIÓN/RECOMENDACIÓN ESPECÍFICA]'
  ];

  recomendaciones.forEach(line => {
    if (y > 270) {
      doc.addPage();
      y = 30;
    }
    doc.text(line, margin, y);
    y += 6;
  });

  // Pie de página
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('Documento generado automáticamente por el Sistema SiPP - Plantilla de Reporte', pageWidth / 2, footerY, { align: 'center' });

  // Guardar
  doc.save('Plantilla_Reporte_Tecnico_SiPP.pdf');
};

/**
 * Genera plantilla de carga masiva de productos
 */
export const generarPlantillaCargaProductos = () => {
  // Esta función simularía la generación de un Excel para carga masiva
  // Por ahora, creamos un PDF instructivo
  
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 30;

  doc.setFontSize(16);
  doc.setTextColor(...hexToRgb(COLORS.borgundy));
  doc.text('PLANTILLA CARGA MASIVA - PRODUCTOS', pageWidth / 2, y, { align: 'center' });
  y += 20;

  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);

  const instrucciones = [
    'INSTRUCCIONES PARA CARGA MASIVA DE PRODUCTOS',
    '',
    '1. Descargue la plantilla Excel del sistema',
    '2. Complete los siguientes campos obligatorios:',
    '',
    'CAMPOS REQUERIDOS:',
    '• nombre: Nombre del producto',
    '• modelo: Modelo o referencia',
    '• precio: Precio en CUP (solo números)',
    '• categoria: Categoría del producto',
    '• stock: Cantidad disponible',
    '• disponibilidad: "Disponible" o "Agotado"',
    '• empresa: Nombre de la empresa proveedora',
    '',
    'EJEMPLO DE ESTRUCTURA:',
    'nombre,modelo,precio,categoria,stock,disponibilidad,empresa',
    'Laptop HP,HP 15-ef2125,1200,Computadoras,10,Disponible,HP',
    'Mouse Logitech,M720,35,Periféricos,25,Disponible,Logitech',
    '',
    'NOTAS:',
    '- Use formato CSV o XLSX',
    '- No incluya símbolos de moneda en precios',
    '- Los nombres de categoría deben coincidir con los existentes',
    '- Las empresas deben estar previamente registradas'
  ];

  instrucciones.forEach(line => {
    if (y > 270) {
      doc.addPage();
      y = 30;
    }
    doc.text(line, margin, y, { maxWidth: pageWidth - 2 * margin });
    y += 6;
  });

  doc.save('Instrucciones_Carga_Productos_SiPP.pdf');
};

export default {
  generarPlantillaActa,
  generarPlantillaReporte,
  generarPlantillaCargaProductos
};

// Agregar esta función al final de plantillasUtils.js
export const generateProfessionalReportPDF = (data) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let y = 30;

    // Función para convertir HEX a RGB
    const hexToRgb = (hex) => {
      const cleanedHex = hex.replace('#', '');
      const bigint = parseInt(cleanedHex, 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return [r, g, b];
    };

    // Encabezado institucional
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('UNIVERSIDAD DE LA HABANA', margin, 15);
    
    doc.setFontSize(12);
    doc.setTextColor(...hexToRgb(COLORS.borgundy));
    doc.text(DATOS_INSTITUCIONALES.departamento, pageWidth / 2, 25, { align: 'center' });
    
    doc.setDrawColor(...hexToRgb(COLORS.borgundy));
    doc.setLineWidth(0.5);
    doc.line(margin, 32, pageWidth - margin, 32);

    // Título
    y = 45;
    doc.setFontSize(16);
    doc.setTextColor(...hexToRgb(COLORS.borgundy));
    doc.text('REPORTE GENERAL DE SOLICITUDES', pageWidth / 2, y, { align: 'center' });
    y += 15;

    // Información del reporte
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Período: ${data.period}`, margin, y);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, pageWidth - margin, y, { align: 'right' });
    y += 15;

    // Estadísticas
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    
    const stats = [
      `Total de solicitudes: ${data.stats.totalRequests}`,
      `Solicitudes regulares: ${data.stats.regularRequests}`,
      `Pedidos extras: ${data.stats.extraRequests}`,
      `Monto total: $${data.stats.totalAmount.toFixed(2)} CUP`,
      `Usuarios activos: ${data.stats.activeUsers}`,
      `Proyectos involucrados: ${data.stats.projectsCount}`
    ];

    stats.forEach(stat => {
      doc.text(stat, margin, y, { maxWidth: pageWidth - 2 * margin });
      y += 7;
    });

    y += 10;

    // Tabla de datos
    if (data.tableData && data.tableData.body.length > 0) {
      doc.autoTable({
        head: data.tableData.head,
        body: data.tableData.body,
        startY: y,
        theme: 'grid',
        styles: { 
          fontSize: 9,
          cellPadding: 3
        },
        headStyles: { 
          fillColor: hexToRgb(COLORS.borgundy),
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center'
        },
        margin: { left: margin, right: margin }
      });
    }

    // Guardar el PDF
    const fileName = `REPORTE_GENERAL_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);

    return true;
  } catch (error) {
    console.error('Error generando reporte profesional:', error);
    return false;
  }
};