// src/utils/generarGuiaSiPP.js
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Nueva paleta de colores
const COLORS = {
  borgundy: [2, 33, 71],    // #4E0101 en RGB
  tan: [210, 180, 140],       // #d2b48c en RGB
  sapphire: [60, 80, 112],    // #3C5070 en RGB
  swanWhite: [245, 240, 233], // #F5F0E9 en RGB
  shellstone: [217, 203, 194] // #D9CBC2 en RGB
};

/**
 * Genera y descarga la Guía Oficial del Sistema SiPP en PDF
 * Incluye: introducción, roles, navegación, proyectos, pedidos, mensajes, reportes, configuración, ayuda
 */
export const generarGuiaSiPP = () => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 20;
  let currentPage = 1;

  // Función para agregar encabezado
  const addHeader = () => {
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('UNIVERSIDAD DE LA HABANA', margin, 15);
    doc.text('Sistema Integral de Pedidos para Proyectos (SiPP)', pageWidth - margin, 15, { align: 'right' });
    
    doc.setDrawColor(...COLORS.borgundy);
    doc.setLineWidth(0.5);
    doc.line(margin, 35, pageWidth - margin, 35);
  };

  // Función para agregar pie de página
  const addFooter = () => {
    const footerY = doc.internal.pageSize.getHeight() - 15;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Página ${currentPage} - Guía de Usuario SiPP v1.0`, pageWidth / 2, footerY, { align: 'center' });
    doc.text('Desarrollado por Grupo de Desarrollo de VRTD', margin, footerY);
    doc.text(new Date().toLocaleDateString('es-ES'), pageWidth - margin, footerY, { align: 'right' });
  };

  // Función para verificar nueva página
  const checkNewPage = (requiredSpace = 20) => {
    if (y + requiredSpace > doc.internal.pageSize.getHeight() - 30) {
      addFooter();
      doc.addPage();
      currentPage++;
      y = 30;
      addHeader();
      return true;
    }
    return false;
  };

  // === PÁGINA 1: PORTADA Y ÍNDICE ===
  addHeader();
  y += 10;

  // Título principal
  doc.setFontSize(18);
  doc.setTextColor(...COLORS.borgundy);
  doc.text('GUÍA COMPLETA DEL SISTEMA SiPP', pageWidth / 2, y, { align: 'center' });
  y += 15;

  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);

  // Introducción breve
  const introText = [
    'Bienvenido al Sistema Integral de Pedidos para Proyectos (SiPP) de la Universidad de La Habana.',
    'Esta guía proporciona una descripción completa de todas las interfaces del sistema,',
    'explicando los procesos y procedimientos para cada rol de usuario.',
    '',
    'El sistema está diseñado para gestionar proyectos universitarios, realizar pedidos de',
    'productos y servicios, y generar reportes oficiales de manera eficiente y organizada.'
  ];

  introText.forEach(line => {
    checkNewPage(10);
    doc.text(line, margin, y, { maxWidth: pageWidth - 2 * margin });
    y += 6;
  });

  y += 15;

  // Índice
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.borgundy);
  doc.text('ÍNDICE', margin, y);
  y += 10;

  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  const itemsIndex = [
    '1. Roles del Sistema ....................................... 2',
    '2. Navegación e Interfaz ................................. 3',
    '3. Gestión de Proyectos .................................. 4',
    '4. Módulo de Pedidos ..................................... 5',
    '5. Sistema de Mensajes ................................... 6',
    '6. Reportes y Actas ...................................... 7',
    '7. Configuración y Perfil ............................... 8',
    '8. Ayuda y Soporte ....................................... 9'
  ];

  itemsIndex.forEach(item => {
    checkNewPage(7);
    doc.text(item, margin, y);
    y += 6;
  });

  // === PÁGINA 2: ROLES DEL SISTEMA ===
  doc.addPage();
  currentPage = 2;
  y = 30;
  addHeader();

  doc.setFontSize(14);
  doc.setTextColor(...COLORS.borgundy);
  doc.text('1. ROLES DEL SISTEMA Y PERMISOS', margin, y);
  y += 12;

  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);

  const rolesText = [
    'El sistema SiPP cuenta con tres tipos de roles principales:',
    '',
    'ADMINISTRADOR:',
    '• Acceso completo al sistema',
    '• Gestiona usuarios, proyectos, empresas y catálogos',
    '• Puede crear proyectos para cualquier usuario',
    '• Supervisa todos los pedidos del sistema',
    '',
    'COMERCIAL:',
    '• Similar al administrador pero enfocado en gestión comercial',
    '• Gestiona empresas y catálogos',
    '• Puede ver todos los proyectos y pedidos',
    '• Enfoque en procesos comerciales y proveedores',
    '',
    'USUARIO NORMAL:',
    '• Crea y gestiona sus propios proyectos',
    '• Realiza pedidos asociados a sus proyectos',
    '• Ve su historial personal de pedidos',
    '• Acceso limitado a sus propios datos',
    ''
  ];

  rolesText.forEach(line => {
    checkNewPage(7);
    doc.text(line, margin, y, { maxWidth: pageWidth - 2 * margin });
    y += line === '' ? 3 : 6;
  });

  // === PÁGINA 3: NAVEGACIÓN E INTERFAZ ===
  doc.addPage();
  currentPage = 3;
  y = 30;
  addHeader();

  doc.setFontSize(14);
  doc.setTextColor(...COLORS.borgundy);
  doc.text('2. NAVEGACIÓN E INTERFAZ', margin, y);
  y += 12;

  doc.setFontSize(11);
  const navegacionText = [
    'El sistema está organizado en módulos principales accesibles desde la barra de navegación:',
    '',
    'DASHBOARD:',
    '• Vista general del estado de proyectos y pedidos',
    '• Resumen de proyectos activos y estado presupuestario',
    '• Notificaciones y alertas del sistema',
    '• Accesos rápidos a módulos principales',
    '',
    'PROYECTOS:',
    '• Gestión completa de proyectos universitarios',
    '• Creación, edición y eliminación de proyectos',
    '• Control presupuestario y fechas de vencimiento',
    '• Filtros por área, usuario y estado',
    '',
    'PEDIDOS:',
    '• Catálogo de productos y servicios disponibles',
    '• Carrito de compras y solicitudes de pedidos',
    '• Pedidos extras para productos no catalogados',
    '• Historial completo de pedidos realizados',
    '',
    'MENSAJES:',
    '• Comunicación y seguimiento de pedidos',
    '• Notificaciones automáticas del sistema',
    '• Sistema de archivado para organización',
    '',
    'REPORTES:',
    '• Generación de reportes técnicos y estadísticas',
    '• Actas de conformidad oficiales',
    '• Exportación a formatos PDF y Excel'
  ];

  navegacionText.forEach(line => {
    checkNewPage(7);
    doc.text(line, margin, y, { maxWidth: pageWidth - 2 * margin });
    y += line === '' ? 3 : 6;
  });

  // === PÁGINA 4: GESTIÓN DE PROYECTOS ===
  doc.addPage();
  currentPage = 4;
  y = 30;
  addHeader();

  doc.setFontSize(14);
  doc.setTextColor(...COLORS.borgundy);
  doc.text('3. GESTIÓN DE PROYECTOS', margin, y);
  y += 12;

  doc.setFontSize(11);
  const proyectosText = [
    'Los proyectos son la base del sistema SiPP y requieren información específica:',
    '',
    'CAMPOS OBLIGATORIOS:',
    '• Centro de Costo: Número único identificador (solo números)',
    '• Número de Proyecto: Identificador alfanumérico único',
    '• Presupuesto: Monto asignado en CUP',
    '• Fecha de Finalización: Fecha límite del proyecto',
    '• Área: Área universitaria responsable',
    '• Tipo de Área: Facultad, Dirección, Departamento, etc.',
    '',
    'VALIDACIONES AUTOMÁTICAS:',
    '• Validación de unicidad de centro de costo + número',
    '• Cálculo automático de presupuesto restante',
    '• Integración con módulo de pedidos para control presupuestario',
    '• Verificación de fechas (no puede ser anterior a la actual)',
    '',
    'PROCESOS POR ROL:',
    '• Administradores/Comerciales: Pueden crear proyectos para cualquier usuario',
    '• Usuarios Normales: Solo pueden crear y gestionar sus propios proyectos',
    '• Comerciales: No pueden visualizar ni gestionar los proyectos existentes',
    '',
    'FUNCIONALIDADES:',
    '• Filtrado por área, usuario y estado',
    '• Cálculo automático de gastos reales',
    '• Visualización de presupuesto restante',
    '• Ordenamiento por fecha y prioridad'
  ];

  proyectosText.forEach(line => {
    checkNewPage(7);
    doc.text(line, margin, y, { maxWidth: pageWidth - 2 * margin });
    y += line === '' ? 3 : 6;
  });

  // === PÁGINA 5: MÓDULO DE PEDIDOS ===
  doc.addPage();
  currentPage = 5;
  y = 30;
  addHeader();

  doc.setFontSize(14);
  doc.setTextColor(...COLORS.borgundy);
  doc.text('4. MÓDULO DE PEDIDOS', margin, y);
  y += 12;

  doc.setFontSize(11);
  const pedidosText = [
    'Sistema completo para realizar solicitudes de productos y servicios:',
    '',
    'SUBMÓDULOS:',
    '• Productos: Catálogo de productos disponibles con empresas activas',
    '• Servicios: Catálogo de servicios profesionales',
    '• Pedidos Extra: Solicitudes de productos/servicios no catalogados',
    '• Historial: Seguimiento de todos los pedidos realizados',
    '',
    'PROCESO DE PEDIDO:',
    '1. Seleccionar proyecto destino (validación automática de presupuesto)',
    '2. Agregar productos/servicios al carrito',
    '3. Revisar y confirmar pedido',
    '4. Seguimiento de estados: Pendiente → En proceso → Completado/Denegado',
    '',
    'CARACTERÍSTICAS ESPECIALES:',
    '• Separación automática de productos y servicios en el historial',
    '• Validación de stock y disponibilidad en tiempo real',
    '• Control de empresas con contrato activo',
    '• Generación automática de números de pedido únicos',
    '• Validación de presupuesto con submayor oficial',
    '',
    'RESTRICCIONES POR ROL:',
    '• Comerciales: No pueden agregar productos al carrito',
    '• Usuarios Normales: Solo pueden realizar pedidos para sus proyectos',
    '• Administradores: Sin restricciones'
  ];

  pedidosText.forEach(line => {
    checkNewPage(7);
    doc.text(line, margin, y, { maxWidth: pageWidth - 2 * margin });
    y += line === '' ? 3 : 6;
  });

  // === PÁGINA 6: SISTEMA DE MENSAJES ===
  doc.addPage();
  currentPage = 6;
  y = 30;
  addHeader();

  doc.setFontSize(14);
  doc.setTextColor(...COLORS.borgundy);
  doc.text('5. SISTEMA DE MENSAJES', margin, y);
  y += 12;

  doc.setFontSize(11);
  const mensajesText = [
    'Sistema de comunicación y seguimiento integral:',
    '',
    'FUNCIONALIDADES:',
    '• Notificaciones automáticas de cambios de estado',
    '• Mensajes directos con administradores',
    '• Sistema de archivado para organización',
    '• Separación automática de productos y servicios',
    '• Filtrado por tipo, estado y usuario',
    '',
    'ESTADOS DE PEDIDO:',
    '• PENDIENTE: Solicitud recibida, en espera de revisión',
    '• EN PROCESO: En gestión administrativa',
    '• COMPLETADO: Listo para entrega (genera acta automáticamente)',
    '• DENEGADO: Se especifican razones de denegación',
    '• ARCHIVADO: Movido a historial para limpieza de vista principal',
    '',
    'GESTIÓN POR ROL:',
    '• Administradores/Comerciales: Pueden cambiar estados y archivar',
    '• Usuarios Normales: Solo pueden ver sus propios mensajes',
    '• Comerciales: Acceso limitado de solo lectura',
    '',
    'CARACTERÍSTICAS:',
    '• Interface responsive para dispositivos móviles',
    '• Búsqueda y filtrado avanzado',
    '• Notificaciones en tiempo real',
    '• Historial completo de comunicaciones'
  ];

  mensajesText.forEach(line => {
    checkNewPage(7);
    doc.text(line, margin, y, { maxWidth: pageWidth - 2 * margin });
    y += line === '' ? 3 : 6;
  });

  // === PÁGINA 7: REPORTES Y ACTAS ===
  doc.addPage();
  currentPage = 7;
  y = 30;
  addHeader();

  doc.setFontSize(14);
  doc.setTextColor(...COLORS.borgundy);
  doc.text('6. REPORTES Y ACTAS', margin, y);
  y += 12;

  doc.setFontSize(11);
  const reportesText = [
    'Sistema avanzado de generación de documentación oficial:',
    '',
    'SUBMÓDULOS:',
    '• DASHBOARD: Estadísticas y gráficos de uso del sistema',
    '• REPORTES: Informes técnicos detallados de pedidos y proyectos',
    '• ACTAS: Generación de actas de conformidad oficiales',
    '',
    'NUEVAS FUNCIONALIDADES:',
    '• Generación de plantillas de acta antes de completar pedidos',
    '• Previsualización de documentos antes de exportar',
    '• Plantillas profesionales con formato institucional',
    '• Numeración automática de documentos oficiales',
    '',
    'PROCESOS PARA ACTAS:',
    '1. Los pedidos en estado "Completado" generan actas automáticamente',
    '2. Las actas se envían por correo para firma digital',
    '3. Documentación enviada a departamento de economía',
    '4. Archivo digital de toda la documentación',
    '5. Generación de plantillas para previsualización',
    '',
    'FORMATOS DE EXPORTACIÓN:',
    '• PDF profesional con logo institucional',
    '• Numeración automática de documentos',
    '• Firma digital de ambas partes',
    '• Marca de agua de autenticidad',
    '',
    'REPORTES ESTADÍSTICOS:',
    '• Distribución por tipo de pedido (Productos, Servicios, Extras)',
    '• Análisis de presupuesto por proyecto',
    '• Tendencias mensuales de solicitudes',
    '• Métricas de eficiencia del sistema'
  ];

  reportesText.forEach(line => {
    checkNewPage(7);
    doc.text(line, margin, y, { maxWidth: pageWidth - 2 * margin });
    y += line === '' ? 3 : 6;
  });

  // === PÁGINA 8: CONFIGURACIÓN Y PERFIL ===
  doc.addPage();
  currentPage = 8;
  y = 30;
  addHeader();

  doc.setFontSize(14);
  doc.setTextColor(...COLORS.borgundy);
  doc.text('7. CONFIGURACIÓN Y PERFIL DE USUARIO', margin, y);
  y += 12;

  doc.setFontSize(11);
  const configText = [
    'Gestión completa de cuenta personal y preferencias:',
    '',
    'FUNCIONALIDADES:',
    '• Actualización de información personal (nombre, área, contacto)',
    '• Cambio de contraseña segura',
    '• Subida de foto de perfil',
    '• Visualización de historial personal',
    '• Gestión de proyectos propios',
    '',
    'INFORMACIÓN DISPONIBLE:',
    '• Rol de usuario y permisos',
    '• Proyectos activos y completados',
    '• Historial de pedidos realizados',
    '• Estadísticas personales de uso'
  ];

  configText.forEach(line => {
    checkNewPage(7);
    doc.text(line, margin, y, { maxWidth: pageWidth - 2 * margin });
    y += line === '' ? 3 : 6;
  });

  // === PÁGINA 9: AYUDA Y SOPORTE ===
  doc.addPage();
  currentPage = 9;
  y = 30;
  addHeader();

  doc.setFontSize(14);
  doc.setTextColor(...COLORS.borgundy);
  doc.text('8. AYUDA Y SOPORTE', margin, y);
  y += 12;

  doc.setFontSize(11);
  const ayudaText = [
    'Sistema integral de ayuda y soporte técnico:',
    '',
    'CENTRO DE AYUDA INTEGRADO:',
    '• Preguntas frecuentes organizadas por categorías',
    '• Búsqueda de soluciones a problemas comunes',
    '• Guías paso a paso para cada módulo',
    '• Filtrado por categorías (Navegación, Proyectos, Pedidos, etc.)',
    '',
    'CONTACTO CON SOPORTE:',
    '• Formulario de contacto integrado',
    '• Envío directo de mensajes a administradores',
    '• Seguimiento de tickets de soporte',
    '• Respuesta en 48 horas hábiles',
    '',
    'INFORMACIÓN DE CONTACTO:',
    '• Correo: gestion.dst@iris.uh.cu',
    '• Teléfono: +53 7 8730 1190',
    '• Oficina: Grupo de Desarrollo Dirección de Servicios Tecnológicos (DST)',
    '• Horario: Lunes a Viernes, 8:00 AM - 4:00 PM',
    '',
    'RECURSOS ADICIONALES:',
    '• Esta guía completa en formato PDF',
    '• Manuales técnicos por módulo',
    '• Actualizaciones regulares del sistema'
  ];

  ayudaText.forEach(line => {
    checkNewPage(7);
    doc.text(line, margin, y, { maxWidth: pageWidth - 2 * margin });
    y += line === '' ? 3 : 6;
  });

  y += 10;

  // === EJEMPLO DE TABLA CON NUEVO COLOR ===
  checkNewPage(50);
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.borgundy);
  doc.text('Ejemplo de Estructura de Pedido', margin, y);
  y += 8;

  doc.autoTable({
    head: [['Producto/Servicio', 'Cantidad', 'Precio Unit.', 'Total']],
    body: [
      ['Laptop Dell Inspiron 15"', '3', '$1100 CUP', '$3300 CUP'],
      ['Impresora Epson L3150', '1', '$350 CUP', '$350 CUP'],
      ['Mantenimiento Preventivo', '1', '$150 CUP', '$150 CUP'],
      ['Licencia Software Office', '5', '$80 CUP', '$400 CUP'],
      ['', '', 'TOTAL GENERAL:', '$4200 CUP']
    ],
    startY: y,
    theme: 'grid',
    styles: { 
      fontSize: 9,
      cellPadding: 3
    },
    headStyles: { 
      fillColor: COLORS.borgundy,
      textColor: 255,
      fontStyle: 'bold'
    },
    margin: { left: margin, right: margin }
  });

  y = doc.lastAutoTable.finalY + 15;

  // === CONCLUSIÓN ===
  checkNewPage(20);
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.borgundy);
  doc.text('CONCLUSIÓN', margin, y);
  y += 8;

  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  const conclusionText = [
    'El Sistema SiPP está diseñado para optimizar la gestión de pedidos para los proyectos en',
    'la Universidad de La Habana, proporcionando una plataforma integral que facilita',
    'los procesos administrativos y mejora la eficiencia operacional.',
    '',
    'Cada módulo ha sido cuidadosamente diseñado para satisfacer las necesidades',
    'específicas de los diferentes roles de usuario, garantizando seguridad,',
    'eficiencia y una experiencia de usuario excepcional.',
    '',
    'Para soporte técnico adicional, contacte al equipo de desarrollo VRTD a través',
    'del Centro de Ayuda integrado en el sistema.'
  ];

  conclusionText.forEach(line => {
    checkNewPage(7);
    doc.text(line, margin, y, { maxWidth: pageWidth - 2 * margin });
    y += 6;
  });

  // Pie de página final
  addFooter();

  // === MARCA DE AGUA CON NUEVO COLOR ===
  doc.setGState(new doc.GState({ opacity: 0.05 }));
  doc.setFontSize(80);
  doc.setTextColor(...COLORS.borgundy);
  doc.text('SiPP v1.0', pageWidth / 2, pageWidth / 2, { 
    align: 'center', 
    angle: 45 
  });
  doc.setGState(new doc.GState({ opacity: 1 }));

  // === GUARDAR PDF ===
  doc.save('Guia_Completa_SiPP_Usuario.pdf');
};