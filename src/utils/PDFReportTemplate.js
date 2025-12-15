import React from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Configuración de estilos y constantes
const PDF_CONFIG = {
  // Colores institucionales
  colors: {
    primary: '#4E0101', // Borundy
    secondary: '#d2b48c', // Tan
    accent: '#3C5070', // Sapphire
    light: '#F5F0E9', // Swan White
    dark: '#2f0000ff'
  },
  
  // Márgenes
  margins: {
    left: 25,
    right: 25,
    top: 30,
    bottom: 20
  },
  
  // Fuentes
  fonts: {
    normal: 'helvetica',
    bold: 'helvetica-bold',
    italic: 'helvetica-italic'
  },
  
  // Tamaños de fuente
  fontSizes: {
    title: 16,
    subtitle: 14,
    header: 12,
    body: 10,
    small: 8
  }
};

// Datos institucionales
const INSTITUTIONAL_DATA = {
  university: 'UNIVERSIDAD DE LA HABANA',
  department: 'Departamento de Servicios Tecnológicos (DST)',
  director: {
    name: 'Dr. Carlos E. Quevedo',
    position: 'Director del Departamento de Servicios Tecnológicos'
  },
  address: 'Calle 123, Vedado, Plaza de la Revolución, La Habana, Cuba',
  phone: '+53 7 1234567',
  email: 'dst@uh.cu'
};

class PDFReportTemplate {
  constructor() {
    this.doc = new jsPDF();
    this.currentPage = 1;
    this.yPosition = PDF_CONFIG.margins.top;
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
  }

  // ========== MÉTODOS BÁSICOS DEL DOCUMENTO ==========

  /**
   * Agrega el encabezado institucional a cada página
   */
  addHeader() {
    const { left, right, top } = PDF_CONFIG.margins;
    
    // Logo o texto de la universidad
    this.doc.setFontSize(PDF_CONFIG.fontSizes.small);
    this.doc.setTextColor(100, 100, 100);
    this.doc.text(INSTITUTIONAL_DATA.university, left, 15);
    
    // Departamento
    this.doc.setFontSize(PDF_CONFIG.fontSizes.header);
    this.doc.setTextColor(40, 40, 40);
    this.doc.text(INSTITUTIONAL_DATA.department, this.pageWidth / 2, 27, { align: 'center' });
    
    // Línea decorativa
    this.doc.setDrawColor(78, 1, 1);
    this.doc.setLineWidth(0.5);
    this.doc.line(left, 32, this.pageWidth - right, 32);
    
    // Reiniciar posición Y después del header
    this.yPosition = top + 15;
  }

  /**
   * Agrega el pie de página con número de página
   */
  addFooter() {
    const footerY = this.pageHeight - 15;
    
    this.doc.setFontSize(PDF_CONFIG.fontSizes.small);
    this.doc.setTextColor(100, 100, 100);
    
    // Información de contacto
    this.doc.text(INSTITUTIONAL_DATA.address, PDF_CONFIG.margins.left, footerY - 10, { 
      maxWidth: this.pageWidth - PDF_CONFIG.margins.left - PDF_CONFIG.margins.right 
    });
    
    // Número de página
    this.doc.text(`Página ${this.currentPage}`, this.pageWidth / 2, footerY, { align: 'center' });
    
    // Fecha de generación
    this.doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, 
      this.pageWidth - PDF_CONFIG.margins.right, footerY, { align: 'right' });
  }

  /**
   * Verifica si hay espacio suficiente en la página actual
   * @param {number} requiredSpace - Espacio requerido en puntos
   * @returns {boolean} - True si se creó nueva página
   */
  checkNewPage(requiredSpace = 20) {
    if (this.yPosition + requiredSpace > this.pageHeight - PDF_CONFIG.margins.bottom) {
      this.addFooter();
      this.doc.addPage();
      this.currentPage++;
      this.yPosition = PDF_CONFIG.margins.top;
      this.addHeader();
      return true;
    }
    return false;
  }

  // ========== ELEMENTOS DE CONTENIDO ==========

  /**
   * Agrega un título al documento
   * @param {string} text - Texto del título
   * @param {string} align - Alineación (left, center, right)
   */
  addTitle(text, align = 'center') {
    this.checkNewPage(30);
    
    this.doc.setFontSize(PDF_CONFIG.fontSizes.title);
    this.doc.setFont(PDF_CONFIG.fonts.bold);
    this.doc.setTextColor(PDF_CONFIG.colors.primary);
    this.doc.text(text, this.getXPosition(align), this.yPosition, { align });
    
    this.yPosition += 12;
    this.resetFont();
  }

  /**
   * Agrega un subtítulo
   * @param {string} text - Texto del subtítulo
   * @param {string} align - Alineación
   */
  addSubtitle(text, align = 'left') {
    this.checkNewPage(15);
    
    this.doc.setFontSize(PDF_CONFIG.fontSizes.subtitle);
    this.doc.setFont(PDF_CONFIG.fonts.bold);
    this.doc.setTextColor(PDF_CONFIG.colors.accent);
    this.doc.text(text, this.getXPosition(align), this.yPosition, { align });
    
    this.yPosition += 8;
    this.resetFont();
  }

  /**
   * Agrega texto normal
   * @param {string} text - Texto a agregar
   * @param {string} align - Alineación
   * @param {number} maxWidth - Ancho máximo del texto
   */
  addText(text, align = 'left', maxWidth = null) {
    this.checkNewPage(10);
    
    const effectiveMaxWidth = maxWidth || (this.pageWidth - PDF_CONFIG.margins.left - PDF_CONFIG.margins.right);
    
    this.doc.setFontSize(PDF_CONFIG.fontSizes.body);
    this.doc.setTextColor(0, 0, 0);
    
    const lines = this.doc.splitTextToSize(text, effectiveMaxWidth);
    this.doc.text(lines, this.getXPosition(align), this.yPosition, { align, maxWidth: effectiveMaxWidth });
    
    this.yPosition += lines.length * 7;
  }

  /**
   * Agrega texto en negrita
   * @param {string} text - Texto en negrita
   * @param {string} align - Alineación
   */
  addBoldText(text, align = 'left') {
    this.checkNewPage(10);
    
    this.doc.setFontSize(PDF_CONFIG.fontSizes.body);
    this.doc.setFont(PDF_CONFIG.fonts.bold);
    this.doc.setTextColor(0, 0, 0);
    this.doc.text(text, this.getXPosition(align), this.yPosition, { align });
    
    this.yPosition += 7;
    this.resetFont();
  }

  /**
   * Agrega una línea de información clave: valor
   * @param {string} label - Etiqueta
   * @param {string} value - Valor
   * @param {string} valueColor - Color del valor (opcional)
   */
  addInfoLine(label, value, valueColor = null) {
    this.checkNewPage(10);
    
    this.doc.setFontSize(PDF_CONFIG.fontSizes.body);
    
    // Etiqueta
    this.doc.setFont(PDF_CONFIG.fonts.bold);
    this.doc.text(`${label}:`, PDF_CONFIG.margins.left, this.yPosition);
    
    // Valor
    this.doc.setFont(PDF_CONFIG.fonts.normal);
    if (valueColor) {
      this.doc.setTextColor(valueColor);
    }
    this.doc.text(value, PDF_CONFIG.margins.left + 40, this.yPosition);
    
    // Reset color
    this.doc.setTextColor(0, 0, 0);
    this.yPosition += 6;
  }

  /**
   * Agrega un espacio vertical
   * @param {number} space - Espacio en puntos
   */
  addSpace(space = 10) {
    this.checkNewPage(space);
    this.yPosition += space;
  }

  /**
   * Agrega una línea divisoria
   */
  addDivider() {
    this.checkNewPage(15);
    
    this.doc.setDrawColor(200, 200, 200);
    this.doc.setLineWidth(0.3);
    this.doc.line(
      PDF_CONFIG.margins.left, 
      this.yPosition, 
      this.pageWidth - PDF_CONFIG.margins.right, 
      this.yPosition
    );
    
    this.yPosition += 10;
  }

  // ========== TABLAS ==========

  /**
   * Agrega una tabla con autotable
   * @param {Array} head - Encabezados de la tabla
   * @param {Array} body - Cuerpo de la tabla
   * @param {Object} options - Opciones adicionales para autoTable
   */
  addTable(head, body, options = {}) {
    this.checkNewPage(50);
    
    const tableOptions = {
      startY: this.yPosition,
      theme: 'grid',
      styles: { 
        fontSize: PDF_CONFIG.fontSizes.body,
        cellPadding: 3,
        textColor: [0, 0, 0],
        lineColor: [200, 200, 200],
        lineWidth: 0.1
      },
      headStyles: { 
        fillColor: [PDF_CONFIG.colors.primary],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { 
        left: PDF_CONFIG.margins.left, 
        right: PDF_CONFIG.margins.right 
      },
      ...options
    };

    this.doc.autoTable({
      head: head,
      body: body,
      ...tableOptions
    });
    
    this.yPosition = this.doc.lastAutoTable.finalY + 10;
  }

  /**
   * Agrega una tabla resumen con estadísticas
   * @param {Array} stats - Array de estadísticas [{label, value, color?}]
   */
  addStatsTable(stats) {
    this.checkNewPage(30);
    
    this.addSubtitle('Resumen Estadístico');
    
    const tableTop = this.yPosition;
    const colWidth = (this.pageWidth - PDF_CONFIG.margins.left - PDF_CONFIG.margins.right) / 2;
    
    stats.forEach((stat, index) => {
      const y = tableTop + (index * 8);
      
      // Fondo alternado para filas
      if (index % 2 === 0) {
        this.doc.setFillColor(245, 245, 245);
        this.doc.rect(PDF_CONFIG.margins.left, y - 4, colWidth * 2, 8, 'F');
      }
      
      // Etiqueta
      this.doc.setFontSize(PDF_CONFIG.fontSizes.body);
      this.doc.setFont(PDF_CONFIG.fonts.bold);
      this.doc.text(stat.label, PDF_CONFIG.margins.left + 5, y);
      
      // Valor
      this.doc.setFont(PDF_CONFIG.fonts.normal);
      if (stat.color) {
        this.doc.setTextColor(stat.color);
      }
      this.doc.text(stat.value, PDF_CONFIG.margins.left + colWidth, y, { align: 'right' });
      
      // Reset color
      this.doc.setTextColor(0, 0, 0);
    });
    
    this.yPosition = tableTop + (stats.length * 8) + 10;
  }

  // ========== GRÁFICOS SIMPLES ==========

  /**
   * Agrega un gráfico de barras simple
   * @param {Array} data - Datos [{label, value, color?}]
   * @param {string} title - Título del gráfico
   */
  addBarChart(data, title = 'Distribución') {
    this.checkNewPage(100);
    
    this.addSubtitle(title);
    
    const chartTop = this.yPosition;
    const chartWidth = this.pageWidth - PDF_CONFIG.margins.left - PDF_CONFIG.margins.right - 20;
    const chartHeight = 60;
    const barWidth = chartWidth / data.length * 0.8;
    const maxValue = Math.max(...data.map(item => item.value));
    
    // Eje Y
    this.doc.setDrawColor(150, 150, 150);
    this.doc.line(
      PDF_CONFIG.margins.left + 20, 
      chartTop, 
      PDF_CONFIG.margins.left + 20, 
      chartTop + chartHeight
    );
    
    // Eje X
    this.doc.line(
      PDF_CONFIG.margins.left + 20, 
      chartTop + chartHeight, 
      PDF_CONFIG.margins.left + 20 + chartWidth, 
      chartTop + chartHeight
    );
    
    // Barras
    data.forEach((item, index) => {
      const barHeight = (item.value / maxValue) * chartHeight * 0.8;
      const x = PDF_CONFIG.margins.left + 25 + (index * (chartWidth / data.length));
      const y = chartTop + chartHeight - barHeight;
      
      // Barra
      this.doc.setFillColor(item.color || PDF_CONFIG.colors.secondary);
      this.doc.rect(x, y, barWidth, barHeight, 'F');
      
      // Etiqueta
      this.doc.setFontSize(PDF_CONFIG.fontSizes.small);
      this.doc.setTextColor(0, 0, 0);
      this.doc.text(item.label, x + barWidth / 2, chartTop + chartHeight + 5, { align: 'center' });
      
      // Valor
      this.doc.text(item.value.toString(), x + barWidth / 2, y - 5, { align: 'center' });
    });
    
    this.yPosition = chartTop + chartHeight + 20;
  }

  // ========== FIRMAS Y CERTIFICACIONES ==========

  /**
   * Agrega sección de firmas
   * @param {Array} signatures - Array de firmas [{name, position, department}]
   */
  addSignatures(signatures) {
    this.checkNewPage(60);
    
    this.addDivider();
    this.addSubtitle('Certificación');
    
    const signatureTop = this.yPosition;
    const colWidth = (this.pageWidth - PDF_CONFIG.margins.left - PDF_CONFIG.margins.right) / signatures.length;
    
    signatures.forEach((signature, index) => {
      const x = PDF_CONFIG.margins.left + (index * colWidth) + (colWidth / 2);
      
      // Línea para firma
      this.doc.setDrawColor(0, 0, 0);
      this.doc.line(x - 40, signatureTop + 20, x + 40, signatureTop + 20);
      
      // Nombre
      this.doc.setFontSize(PDF_CONFIG.fontSizes.body);
      this.doc.setFont(PDF_CONFIG.fonts.bold);
      this.doc.text(signature.name, x, signatureTop + 30, { align: 'center' });
      
      // Cargo
      this.doc.setFont(PDF_CONFIG.fonts.normal);
      this.doc.setFontSize(PDF_CONFIG.fontSizes.small);
      this.doc.text(signature.position, x, signatureTop + 35, { align: 'center' });
      
      // Departamento
      this.doc.text(signature.department, x, signatureTop + 40, { align: 'center' });
    });
    
    this.yPosition = signatureTop + 50;
  }

  // ========== MÉTODOS DE UTILIDAD ==========

  /**
   * Obtiene la posición X según la alineación
   * @param {string} align - Alineación
   * @returns {number} - Posición X
   */
  getXPosition(align) {
    switch (align) {
      case 'center':
        return this.pageWidth / 2;
      case 'right':
        return this.pageWidth - PDF_CONFIG.margins.right;
      default:
        return PDF_CONFIG.margins.left;
    }
  }

  /**
   * Reinicia la fuente a valores por defecto
   */
  resetFont() {
    this.doc.setFont(PDF_CONFIG.fonts.normal);
    this.doc.setFontSize(PDF_CONFIG.fontSizes.body);
    this.doc.setTextColor(0, 0, 0);
  }

  /**
   * Genera y guarda el PDF
   * @param {string} fileName - Nombre del archivo
   */
  save(fileName) {
    this.addFooter();
    this.doc.save(fileName);
  }

  /**
   * Obtiene el documento PDF como blob (para previsualización)
   * @returns {Blob} - Blob del PDF
   */
  getBlob() {
    this.addFooter();
    return this.doc.output('blob');
  }

  /**
   * Obtiene el documento PDF como URL (para previsualización)
   * @returns {string} - URL del PDF
   */
  getURL() {
    this.addFooter();
    return this.doc.output('bloburl');
  }
}

// ========== FUNCIONES ESPECÍFICAS PARA REPORTES ==========

/**
 * Genera un reporte general de pedidos
 * @param {Object} data - Datos para el reporte
 * @param {string} fileName - Nombre del archivo
 */
export const generateGeneralReport = (data, fileName = null) => {
  const pdf = new PDFReportTemplate();
  const { period, stats, tableData, filters } = data;
  
  // Encabezado inicial
  pdf.addHeader();
  
  // Título principal
  pdf.addTitle('INFORME TÉCNICO OFICIAL');
  
  // Información del período
  pdf.addInfoLine('Período del Reporte', period);
  pdf.addInfoLine('Fecha de Generación', new Date().toLocaleDateString('es-ES'));
  pdf.addInfoLine('Total de Solicitudes', stats.totalRequests.toString());
  pdf.addInfoLine('Monto Total', `$${stats.totalAmount.toFixed(2)} CUP`);
  
  if (filters) {
    pdf.addSpace(5);
    pdf.addBoldText('Filtros Aplicados:');
    if (filters.user) pdf.addInfoLine('Usuario', filters.user);
    if (filters.project) pdf.addInfoLine('Proyecto', filters.project);
    if (filters.month) pdf.addInfoLine('Mes', filters.month);
  }
  
  pdf.addSpace(10);
  
  // Introducción
  pdf.addBoldText('INTRODUCCIÓN');
  pdf.addText(
    `El presente documento constituye el informe técnico oficial generado por el ${INSTITUTIONAL_DATA.department} ` +
    `correspondiente al período especificado. Este reporte detallado presenta un análisis exhaustivo de todas las ` +
    `solicitudes gestionadas a través del Sistema Integrado de Pedidos y Proyectos (SiPP), incluyendo tanto pedidos ` +
    `regulares como pedidos extras realizados por los diferentes departamentos y áreas de la universidad.`
  );
  
  pdf.addSpace(5);
  
  pdf.addText(
    `El informe incluye estadísticas de volumen, distribución por tipo de solicitud, montos invertidos y ` +
    `tendencias que permiten evaluar el desempeño operacional del departamento y la distribución de recursos ` +
    `tecnológicos en la institución.`
  );
  
  pdf.addSpace(15);
  
  // Tabla de datos
  if (tableData && tableData.head && tableData.body) {
    pdf.addSubtitle('Detalle de Solicitudes');
    pdf.addTable(tableData.head, tableData.body);
  }
  
  // Estadísticas resumen
  if (stats) {
    const statsData = [
      { label: 'Total de Solicitudes', value: stats.totalRequests.toString() },
      { label: 'Solicitudes Regulares', value: stats.regularRequests ? stats.regularRequests.toString() : 'N/A' },
      { label: 'Pedidos Extras', value: stats.extraRequests ? stats.extraRequests.toString() : 'N/A' },
      { label: 'Monto Total Invertido', value: `$${stats.totalAmount.toFixed(2)} CUP` },
      { label: 'Usuarios Activos', value: stats.activeUsers ? stats.activeUsers.toString() : 'N/A' },
      { label: 'Proyectos Involucrados', value: stats.projectsCount ? stats.projectsCount.toString() : 'N/A' }
    ];
    
    pdf.addStatsTable(statsData);
  }
  
  // Conclusión
  pdf.addSpace(10);
  pdf.addBoldText('OBSERVACIONES');
  pdf.addText(
    `Este informe ha sido generado automáticamente por el Sistema Integrado de Pedidos y Proyectos (SiPP) ` +
    `y constituye un documento oficial del ${INSTITUTIONAL_DATA.department}. Los datos presentados reflejan ` +
    `la actividad real registrada en el sistema durante el período especificado.`
  );
  
  // Firmas
  pdf.addSignatures([
    {
      name: INSTITUTIONAL_DATA.director.name,
      position: INSTITUTIONAL_DATA.director.position,
      department: INSTITUTIONAL_DATA.department
    }
  ]);
  
  const finalFileName = fileName || `Informe_DST_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(finalFileName);
};

/**
 * Genera un reporte de pedidos seleccionados
 * @param {Object} data - Datos para el reporte
 * @param {string} fileName - Nombre del archivo
 */
export const generateSelectedOrdersReport = (data, fileName = null) => {
  const pdf = new PDFReportTemplate();
  const { selectedOrders, stats, tableData } = data;
  
  pdf.addHeader();
  pdf.addTitle('REPORTE DE PEDIDOS SELECCIONADOS');
  
  pdf.addInfoLine('Fecha de Generación', new Date().toLocaleDateString('es-ES'));
  pdf.addInfoLine('Pedidos Seleccionados', selectedOrders.toString());
  pdf.addInfoLine('Monto Total Seleccionado', `$${stats.totalAmount.toFixed(2)} CUP`);
  
  pdf.addSpace(10);
  
  pdf.addBoldText('DESCRIPCIÓN');
  pdf.addText(
    `Este reporte específico contiene información detallada de los pedidos seleccionados por el administrador ` +
    `del sistema. Los datos presentados corresponden exclusivamente a las solicitudes marcadas para inclusión ` +
    `en este documento, independientemente de su fecha o período de creación.`
  );
  
  pdf.addSpace(15);
  
  // Tabla de datos
  if (tableData && tableData.head && tableData.body) {
    pdf.addSubtitle('Pedidos Seleccionados - Detalle');
    pdf.addTable(tableData.head, tableData.body);
  }
  
  // Resumen de estadísticas de selección
  if (stats) {
    const statsData = [
      { label: 'Total de Pedidos Seleccionados', value: stats.selectedCount.toString() },
      { label: 'Pedidos Regulares', value: stats.regularCount ? stats.regularCount.toString() : 'N/A' },
      { label: 'Pedidos Extras', value: stats.extraCount ? stats.extraCount.toString() : 'N/A' },
      { label: 'Monto Total Seleccionado', value: `$${stats.totalAmount.toFixed(2)} CUP` },
      { label: 'Usuarios Involucrados', value: stats.usersInvolved ? stats.usersInvolved.toString() : 'N/A' }
    ];
    
    pdf.addStatsTable(statsData);
  }
  
  pdf.addSpace(10);
  pdf.addBoldText('NOTAS');
  pdf.addText(
    `Documento generado para fines de análisis específico. Los pedidos incluidos en este reporte han sido ` +
    `seleccionados manualmente y pueden no corresponder a un período o criterio temporal específico.`
  );
  
  const finalFileName = fileName || `Reporte_Pedidos_Seleccionados_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(finalFileName);
};

/**
 * Genera un reporte estadístico con gráficos
 * @param {Object} data - Datos para el reporte
 * @param {string} fileName - Nombre del archivo
 */
export const generateStatisticalReport = (data, fileName = null) => {
  const pdf = new PDFReportTemplate();
  const { period, charts, trends, summary } = data;
  
  pdf.addHeader();
  pdf.addTitle('REPORTE ESTADÍSTICO ANALÍTICO');
  
  pdf.addInfoLine('Período de Análisis', period);
  pdf.addInfoLine('Fecha de Generación', new Date().toLocaleDateString('es-ES'));
  
  pdf.addSpace(10);
  
  pdf.addBoldText('ANÁLISIS ESTADÍSTICO');
  pdf.addText(
    `Este reporte presenta un análisis estadístico detallado de la actividad del departamento, ` +
    `incluyendo distribuciones por tipo, tendencias temporales y métricas de desempeño.`
  );
  
  // Gráficos de distribución
  if (charts && charts.distribution) {
    pdf.addSpace(15);
    pdf.addBarChart(
      charts.distribution, 
      'Distribución de Solicitudes por Tipo'
    );
  }
  
  // Tablas de tendencias
  if (trends && trends.monthly) {
    pdf.addSpace(15);
    pdf.addSubtitle('Tendencias Mensuales');
    
    const trendHead = [['Mes', 'Productos', 'Servicios', 'Extras', 'Total']];
    const trendBody = trends.monthly.map(item => [
      item.month,
      `$${item.productos.toFixed(2)}`,
      `$${item.servicios.toFixed(2)}`,
      `$${item.extras.toFixed(2)}`,
      `$${item.total.toFixed(2)}`
    ]);
    
    pdf.addTable(trendHead, trendBody);
  }
  
  // Resumen ejecutivo
  if (summary) {
    pdf.addSpace(15);
    pdf.addSubtitle('Resumen Ejecutivo');
    
    const summaryStats = [
      { label: 'Crecimiento Mensual Promedio', value: `${summary.monthlyGrowth}%` },
      { label: 'Tipo de Solicitud Más Común', value: summary.mostCommonType },
      { label: 'Usuario Más Activo', value: summary.mostActiveUser },
      { label: 'Proyecto con Mayor Inversión', value: summary.highestInvestmentProject },
      { label: 'Eficiencia Operacional', value: `${summary.operationalEfficiency}%` }
    ];
    
    pdf.addStatsTable(summaryStats);
  }
  
  pdf.addSpace(10);
  pdf.addBoldText('CONCLUSIONES');
  pdf.addText(
    `El análisis estadístico presentado permite identificar patrones de comportamiento, áreas de oportunidad ` +
    `y tendencias relevantes para la planificación estratégica del departamento.`
  );
  
  const finalFileName = fileName || `Reporte_Estadistico_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(finalFileName);
};

// Exportar la clase principal para uso personalizado
export default PDFReportTemplate;