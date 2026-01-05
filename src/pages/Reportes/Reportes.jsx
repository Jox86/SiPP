import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Tabs,
  Tab,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  useMediaQuery,
  Alert,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import {
  Description as DescriptionIcon,
  PictureAsPdf,
  Email,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  CalendarMonth,
  Person,
  Dashboard as DashboardIcon,
  AssignmentTurnedIn,
  ChangeCircle
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import { BarChart, PieChart, LineChart } from '@mui/x-charts';

import { 
  generateProfessionalReportPDF, 
  generateSelectedOrdersReportPDF 
} from '../../utils/pdfGenerator';

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Datos institucionales
const DIRECTOR_NOMBRE = 'Dr. Carlos E. Quevedo';
const DIRECTOR_CARGO = 'Director del Departamento de Servicios Tecnológicos';
const DEPARTAMENTO_NOMBRE = 'Departamento de Servicios Tecnológicos (DST)';

// Hook useLocalStorage para consistencia con Mensajes
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      setStoredValue(value);
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  };

  return [storedValue, setValue];
};

// Función para obtener nombre de usuario
const getUserName = (userId) => {
  try {
    const users = JSON.parse(localStorage.getItem('SiPP_users') || '[]');
    const user = users.find(u => u.id === userId);
    return user ? user.fullName : 'Usuario Desconocido';
  } catch (error) {
    console.error('Error obteniendo nombre del usuario:', error);
    return 'Usuario Desconocido';
  }
};

// Función para obtener nombre del proyecto
const getProjectName = (projectId, userId) => {
  try {
    if (!projectId || projectId === 'extra') return 'Pedido Extra';
    
    // Cargar proyectos del usuario específico
    const userProjects = JSON.parse(localStorage.getItem(`SiPP_projects_${userId}`) || '[]');
    const project = userProjects.find(p => p.id === projectId);
    
    if (project) {
      return `${project.costCenter} - ${project.projectNumber}: ${project.name}`;
    }
    
    // Buscar en todos los usuarios si no se encuentra
    const allUsers = JSON.parse(localStorage.getItem('SiPP_users') || '[]');
    for (let user of allUsers) {
      const userProjs = JSON.parse(localStorage.getItem(`SiPP_projects_${user.id}`) || '[]');
      const foundProject = userProjs.find(p => p.id === projectId);
      if (foundProject) {
        return `${foundProject.costCenter} - ${foundProject.projectNumber}: ${foundProject.name}`;
      }
    }
    
    return 'Proyecto No Encontrado';
  } catch (error) {
    console.error('Error obteniendo nombre del proyecto:', error);
    return 'N/A';
  }
};

// Función para determinar el tipo de pedido (igual que en Historial)
const getOrderType = (order) => {
  if (order.type === 'special') {
    return `P.Extra-${order.orderType || 'producto'}`;
  }
  
  if (order.items && order.items.length > 0) {
    const hasProducts = order.items.some(item => 
      item.dataType === 'products' || (!item.dataType && item.name)
    );
    const hasServices = order.items.some(item => 
      item.dataType === 'services' || (!item.dataType && item.service)
    );
    
    if (hasProducts && hasServices) return 'Productos y Servicios';
    if (hasProducts) return 'Productos';
    if (hasServices) return 'Servicios';
  }
  
  return 'General';
};

// Función para obtener el rango de fechas según el período seleccionado
const getDateRange = (period) => {
  const now = new Date();
  const start = new Date();
  
  switch (period) {
    case 'week':
      start.setDate(now.getDate() - 7);
      break;
    case 'month':
      start.setMonth(now.getMonth() - 1);
      break;
    case 'year':
      start.setFullYear(now.getFullYear() - 1);
      break;
    default:
      return { start: null, end: null };
  }
  
  return { start, end: now };
};

// Función para generar acta profesional
// REEMPLAZAR completamente la función generateProfessionalConformity en Reportes.js:

// Función para generar acta profesional - VERSIÓN CORREGIDA
const generateProfessionalConformity = (data) => {
  if (!data) {
    addNotification({
      title: 'Error',
      message: 'No hay datos para generar el acta',
      type: 'error'
    });
    return;
  }

  try {
    console.log('📄 Generando acta de conformidad:', data);
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginLeft = 25;
    const marginRight = 25;
    const marginTop = 30;
    
    let y = marginTop;
    let currentPage = 1;

    // Encabezado
    const addHeader = () => {
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('UNIVERSIDAD DE LA HABANA', marginLeft, 15);
      
      doc.setFontSize(12);
      doc.setTextColor(40, 40, 40);
      doc.text(DEPARTAMENTO_NOMBRE, pageWidth / 2, 27, { align: 'center' });
      
      doc.setDrawColor(78, 1, 1);
      doc.setLineWidth(0.5);
      doc.line(marginLeft, 32, pageWidth - marginRight, 32);
    };

    // Pie de página
    const addFooter = () => {
      const footerY = doc.internal.pageSize.getHeight() - 15;
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`Página ${currentPage}`, pageWidth / 2, footerY, { align: 'center' });
      doc.text('Documento generado automáticamente por el Sistema SiPP', pageWidth / 2, footerY + 6, { align: 'center' });
    };

    const checkNewPage = (requiredSpace = 20) => {
      if (y + requiredSpace > doc.internal.pageSize.getHeight() - 30) {
        addFooter();
        doc.addPage();
        currentPage++;
        y = marginTop;
        addHeader();
        return true;
      }
      return false;
    };

    // Encabezado inicial
    addHeader();
    y = marginTop + 15;

    // Título
    doc.setFontSize(16);
    doc.setTextColor(78, 1, 1);
    doc.text('ACTA DE CONFORMIDAD OFICIAL', pageWidth / 2, y, { align: 'center' });
    y += 12;

    // Código y fecha
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const docCode = `AC-DST-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    
    doc.text(`Código: ${docCode}`, marginLeft, y);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, pageWidth - marginRight, y, { align: 'right' });
    y += 20;

    // Datos del proyecto
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    
    const projectData = [
      `ACTA DE CONFORMIDAD OFICIAL`,
      ``,
      `Por medio del presente documento, el ${DEPARTAMENTO_NOMBRE} hace constar que ha completado`,
      `satisfactoriamente el pedido asociado al proyecto:`,
      ``,
      `PROYECTO: ${data.project || 'No especificado'}`,
      `SOLICITANTE: ${data.client || 'No especificado'}`,
      `FECHA DE ENTREGA: ${data.date || new Date().toLocaleDateString('es-ES')}`,
      ``,
      `El usuario ${data.client || 'Solicitante'} manifiesta su completa conformidad con los productos`,
      `y/o servicios recibidos, reconociendo que han sido entregados de acuerdo a las`,
      `especificaciones solicitadas y dentro de los parámetros de calidad establecidos.`,
      ``,
      `Se certifica que todos los items han sido revisados y aceptados conforme a los estándares`,
      `técnicos requeridos, cumpliendo con las expectativas del solicitante.`,
      ``,
      `Items entregados:`
    ];
    
    projectData.forEach(line => {
      checkNewPage(7);
      if (line === '') {
        y += 4;
      } else if (line.includes('ACTA DE CONFORMIDAD')) {
        doc.setFont('helvetica', 'bold');
        doc.text(line, marginLeft, y, { maxWidth: pageWidth - marginLeft - marginRight });
        doc.setFont('helvetica', 'normal');
        y += 8;
      } else {
        doc.text(line, marginLeft, y, { maxWidth: pageWidth - marginLeft - marginRight });
        y += 6;
      }
    });
    
    y += 10;

    // Tabla de items (si existen)
    if (data.items && data.items.length > 0) {
      checkNewPage(50);
      
      const tableHead = [['No.', 'Descripción', 'Cant.', 'Precio Unit. (CUP)', 'Total (CUP)']];
      const tableBody = data.items.map((item, i) => [
        (i + 1).toString(),
        item.name || item.service || 'Servicio/Producto',
        (item.quantity || 1).toString(),
        `$${(item.price || 0).toFixed(2)}`,
        `$${((item.price || 0) * (item.quantity || 1)).toFixed(2)}`
      ]);

      // Fila de total
      const total = data.items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
      tableBody.push(['', '', '', 'TOTAL:', `$${total.toFixed(2)}`]);

      try {
        doc.autoTable({
          head: tableHead,
          body: tableBody,
          startY: y,
          theme: 'grid',
          styles: { 
            fontSize: 9,
            cellPadding: 3,
            textColor: [0, 0, 0]
          },
          headStyles: { 
            fillColor: [78, 1, 1], 
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center'
          },
          margin: { left: marginLeft, right: marginRight }
        });
        
        y = doc.lastAutoTable.finalY + 15;
      } catch (tableError) {
        console.error('Error generando tabla:', tableError);
        y += 10;
      }
    } else {
      checkNewPage(10);
      doc.text('No hay items especificados', marginLeft, y);
      y += 15;
    }

    // Notas adicionales (si existen)
    if (data.notes) {
      checkNewPage(20);
      doc.setFont('helvetica', 'bold');
      doc.text('NOTAS ADICIONALES:', marginLeft, y);
      y += 8;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(data.notes, marginLeft, y, { maxWidth: pageWidth - marginLeft - marginRight });
      y += 20;
    }

    // Firmas
    checkNewPage(40);
    
    // Línea para firma del solicitante
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(marginLeft, y, marginLeft + 120, y);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(data.client || 'Solicitante', marginLeft + 60, y + 10, { align: 'center' });
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Usuario Solicitante', marginLeft + 60, y + 15, { align: 'center' });
    
    // Línea para firma del director
    doc.setDrawColor(0, 0, 0);
    doc.line(pageWidth - marginRight - 120, y, pageWidth - marginRight, y);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(DIRECTOR_NOMBRE, pageWidth - marginRight - 60, y + 10, { align: 'center' });
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(DIRECTOR_CARGO, pageWidth - marginRight - 60, y + 15, { align: 'center' });
    doc.text(DEPARTAMENTO_NOMBRE, pageWidth - marginRight - 60, y + 20, { align: 'center' });

    // Pie de página final
    addFooter();
    
    const fileName = `ACTA_CONFORMIDAD_${(data.project || 'Proyecto').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    console.log('💾 Guardando acta como:', fileName);
    
    doc.save(fileName);
    
    addNotification({
      title: 'Acta generada',
      message: 'El acta de conformidad se ha descargado exitosamente',
      type: 'success'
    });
    
  } catch (error) {
    console.error('❌ Error generando acta:', error);
    
    addNotification({
      title: 'Error',
      message: 'No se pudo generar el acta de conformidad',
      type: 'error'
    });
    
    // Intentar con PDF simple
    try {
      const emergencyDoc = new jsPDF();
      emergencyDoc.setFontSize(16);
      emergencyDoc.text('ACTA DE CONFORMIDAD', 20, 20);
      emergencyDoc.setFontSize(12);
      emergencyDoc.text(`Proyecto: ${data.project || 'No especificado'}`, 20, 40);
      emergencyDoc.text(`Solicitante: ${data.client || 'No especificado'}`, 20, 50);
      emergencyDoc.save('ACTA_EMERGENCIA.pdf');
    } catch (e) {
      console.error('Error incluso en generación de emergencia:', e);
    }
  }
};

const generateSimpleIndividualPDF = (orderData) => {
  try {
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.setTextColor(78, 1, 1);
    doc.text('REPORTE INDIVIDUAL', 20, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    const details = [
      `Usuario: ${orderData.user || 'N/A'}`,
      `Proyecto: ${!orderData.projectId || orderData.projectId === 'extra' ? 'Pedido Extra' : getProjectName(orderData.projectId, orderData.userId)}`,
      `Fecha: ${new Date(orderData.date).toLocaleDateString('es-ES')}`,
      `Tipo: ${orderData.orderType || getOrderType(orderData)}`,
      `Estado: ${orderData.status || 'Pendiente'}`,
      `Total: $${(orderData.total || 0).toFixed(2)} CUP`
    ];
    
    let y = 40;
    details.forEach(detail => {
      doc.text(detail, 20, y);
      y += 10;
    });
    
    const fileName = `Reporte_Individual_${orderData.id || Date.now()}.pdf`;
    doc.save(fileName);
    
    addNotification({
      title: 'Reporte generado',
      message: 'El PDF se ha descargado (versión simple)',
      type: 'info'
    });
    
    return true;
  } catch (error) {
    console.error('Error generando PDF simple:', error);
    return false;
  }
};

export default function Reportes() {
  const { theme, darkMode } = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const { currentUser } = useAuth();
  const { addNotification } = useNotifications();
 
  // Paleta de colores corregida para modo oscuro - MEJORADA
  const colors = {
    light: {
      borgundy: '#4E0101',
      tan: '#d2b48c',
      sapphire: '#703c3cff',
      swanWhite: '#F5F0E9',
      shellstone: '#D9CBC2',
      background: '#F5F0E9',
      paper: '#FFFFFF',
      text: '#000000ff',
      textSecondary: '#0d0404ff'
    },
    dark: {
      borgundy: '#4E0101',
      tan: '#A78B6F',
      sapphire: '#030202ff',
      swanWhite: '#4c1313ff',
      shellstone: '#0d0404ff',
      background: '#000000ff',
      paper: '#030202ff',
      text: '#FFFFFF',
      textSecondary: '#B0BEC5'
    }
  }[darkMode ? 'dark' : 'light'];

  const [tab, setTab] = useState('dashboard');
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [reportPeriod, setReportPeriod] = useState('all'); // 'all', 'week', 'month', 'year'
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [purchases, setPurchases] = useLocalStorage('OASiS_purchases', []);
  const [specialOrders, setSpecialOrders] = useLocalStorage('OASiS_special_orders', []);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useLocalStorage('SiPP_users', []);
  const [conformityData, setConformityData] = useState(null);
  const [openConformity, setOpenConformity] = useState(false);

  // Cargar proyectos de todos los usuarios
  useEffect(() => {
    const loadProjects = () => {
      try {
        const allUsers = JSON.parse(localStorage.getItem('SiPP_users') || '[]');
        const allProjects = [];
        
        allUsers.forEach(user => {
          const userProjects = JSON.parse(localStorage.getItem(`SiPP_projects_${user.id}`) || '[]');
          allProjects.push(...userProjects);
        });
        
        setProjects(allProjects);
      } catch (error) {
        console.error('Error cargando proyectos:', error);
      }
    };

    loadProjects();
  }, []);

  // Filtrar usuarios - excluir comerciales y admin
  const filteredClients = useMemo(() => {
    return clients.filter(user => 
      user.role !== 'admin' && 
      user.role !== 'comercial' && 
      user.role !== 'commercial'
    );
  }, [clients]);

  // Filtrar datos por mes y período de reporte - CORREGIDO para incluir productos
  const filteredPurchases = useMemo(() => {
    let filtered = purchases;
    
    // Filtro por usuario
    if (selectedUser) {
      filtered = filtered.filter(p => p.userId === selectedUser);
    }
    
    // Filtro por proyecto
    if (selectedProject) {
      filtered = filtered.filter(p => p.projectId === selectedProject);
    }
    
    // Filtro por mes
    if (monthFilter) {
      filtered = filtered.filter(p => {
        const purchaseDate = new Date(p.date);
        const filterDate = new Date(monthFilter);
        return purchaseDate.getMonth() === filterDate.getMonth() && 
               purchaseDate.getFullYear() === filterDate.getFullYear();
      });
    }
    
    // Filtro por período de reporte
    if (reportPeriod !== 'all') {
      const { start, end } = getDateRange(reportPeriod);
      filtered = filtered.filter(p => {
        const purchaseDate = new Date(p.date);
        return purchaseDate >= start && purchaseDate <= end;
      });
    }
    
    return filtered;
  }, [purchases, selectedUser, selectedProject, monthFilter, reportPeriod]);

  const filteredOrders = useMemo(() => {
    let filtered = specialOrders;
    
    // Filtro por usuario
    if (selectedUser) {
      filtered = filtered.filter(o => o.userId === selectedUser);
    }
    
    // Filtro por mes
    if (monthFilter) {
      filtered = filtered.filter(o => {
        const orderDate = new Date(o.date);
        const filterDate = new Date(monthFilter);
        return orderDate.getMonth() === filterDate.getMonth() && 
               orderDate.getFullYear() === filterDate.getFullYear();
      });
    }
    
    // Filtro por período de reporte
    if (reportPeriod !== 'all') {
      const { start, end } = getDateRange(reportPeriod);
      filtered = filtered.filter(o => {
        const orderDate = new Date(o.date);
        return orderDate >= start && orderDate <= end;
      });
    }
    
    return filtered;
  }, [specialOrders, selectedUser, monthFilter, reportPeriod]);

  // Combinar datos para estadísticas - CORREGIDO para incluir productos
  const allDataForCharts = useMemo(() => {
    const purchasesWithUserNames = filteredPurchases.map(purchase => ({
      ...purchase,
      user: getUserName(purchase.userId),
      projectName: getProjectName(purchase.projectId, purchase.userId),
      orderType: getOrderType(purchase), //  USAR LA MISMA FUNCIÓN QUE HISTORIAL
      isProduct: purchase.items?.some(item => item.dataType === 'products' || !item.dataType) || true
    }));

    const ordersWithUserNames = filteredOrders.map(order => ({
      ...order,
      user: getUserName(order.userId),
      projectId: order.projectId || 'extra',
      projectName: getProjectName(order.projectId, order.userId),
      items: order.items || order.products || [{ 
        name: order.orderType === 'product' ? 'Productos Extras' : 'Servicios Extras', 
        quantity: 1, 
        price: order.total
      }],
      total: order.total || 0,
      orderType: getOrderType(order), 
      isProduct: order.orderType === 'product'
    }));

    console.log('DEBUG - Datos para gráficos:', {
      purchases: purchasesWithUserNames.length,
      orders: ordersWithUserNames.length,
      total: purchasesWithUserNames.length + ordersWithUserNames.length
    });

    return [...purchasesWithUserNames, ...ordersWithUserNames];
  }, [filteredPurchases, filteredOrders]);

  // Datos para gráficos - MEJORADO para incluir productos
  const chartData = useMemo(() => {
    const purchaseByType = { 
      'Productos': 0, 
      'Servicios': 0, 
      'Pedidos Extra': 0
    };
    
    const orderByStatus = {};
    const purchaseByUser = {};
    const monthlyData = {};

    // Últimos 6 meses para tendencias
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    }).reverse();

    last6Months.forEach(month => {
      monthlyData[month] = { 
        productos: 0, 
        servicios: 0,
        extras: 0 
      };
    });

    allDataForCharts.forEach(p => {
      // Clasificar por tipo usando la misma lógica que Historial
      const orderType = p.orderType || getOrderType(p);
      
      if (orderType.includes('P.Extra')) {
        purchaseByType['Pedidos Extra'] += (p.total || 0);
      } else if (orderType.includes('Servicios')) {
        purchaseByType['Servicios'] += (p.total || 0);
      } else if (orderType.includes('Productos')) {
        purchaseByType['Productos'] += (p.total || 0);
      }

      // Estadísticas por usuario
      const user = p.user || 'Desconocido';
      purchaseByUser[user] = (purchaseByUser[user] || 0) + (p.total || 0);

      // Estadísticas por estado
      const status = p.status || 'Pendiente';
      orderByStatus[status] = (orderByStatus[status] || 0) + 1;

      // Datos mensuales
      if (p.date) {
        const date = new Date(p.date);
        const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        if (monthlyData[monthKey]) {
          if (orderType.includes('P.Extra')) {
            monthlyData[monthKey].extras += p.total || 0;
          } else if (orderType.includes('Servicios')) {
            monthlyData[monthKey].servicios += p.total || 0;
          } else {
            monthlyData[monthKey].productos += p.total || 0;
          }
        }
      }
    });

    const monthlyTrends = last6Months.map(month => ({
      month: month,
      productos: monthlyData[month].productos,
      servicios: monthlyData[month].servicios,
      extras: monthlyData[month].extras
    }));

    console.log('DEBUG - Datos de gráficos:', {
      purchaseByType,
      monthlyTrends
    });

    return {
      purchaseByType: Object.keys(purchaseByType).filter(key => purchaseByType[key] > 0),
      purchaseByTypeData: Object.values(purchaseByType).filter(val => val > 0),
      orderByStatus: Object.keys(orderByStatus),
      orderByStatusData: Object.values(orderByStatus),
      purchaseByUser: Object.keys(purchaseByUser).slice(0, 5),
      purchaseByUserData: Object.values(purchaseByUser).slice(0, 5),
      monthlyTrends: monthlyTrends
    };
  }, [allDataForCharts]);

  const generateGeneralReport = () => {
    try {
      console.log('🔄 Generando reporte general...', { 
        totalPedidos: allDataForCharts.length,
        datos: allDataForCharts 
      });

      const totalAmount = allDataForCharts.reduce((sum, p) => sum + (p.total || 0), 0);
      
      const reportData = {
        period: monthFilter 
          ? `Mes: ${new Date(monthFilter).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`
          : reportPeriod !== 'all' 
            ? `Período: ${reportPeriod === 'week' ? 'Última Semana' : reportPeriod === 'month' ? 'Último Mes' : 'Último Año'}`
            : 'Todos los períodos',
        stats: {
          totalRequests: allDataForCharts.length,
          regularRequests: filteredPurchases.length,
          extraRequests: filteredOrders.length,
          totalAmount: totalAmount,
          activeUsers: new Set(allDataForCharts.map(p => p.userId)).size,
          projectsCount: new Set(allDataForCharts.map(p => p.projectId)).size
        },
        tableData: {
          head: [['No.', 'Usuario', 'Proyecto', 'Fecha', 'Tipo', 'Total (CUP)']],
          body: allDataForCharts.map((p, i) => [
            (i + 1).toString(),
            p.user || 'N/A',
            !p.projectId || p.projectId === 'extra' ? 'Pedido Extra' : getProjectName(p.projectId, p.userId),
            new Date(p.date).toLocaleDateString('es-ES'),
            p.orderType || getOrderType(p),
            `$${(p.total || 0).toFixed(2)}`
          ])
        },
        filters: {
          user: selectedUser ? getUserName(selectedUser) : 'Todos',
          project: selectedProject ? getProjectName(selectedProject, selectedUser) : 'Todos',
          month: monthFilter ? new Date(monthFilter).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }) : 'Todos',
          period: reportPeriod !== 'all' 
            ? (reportPeriod === 'week' ? 'Última Semana' : reportPeriod === 'month' ? 'Último Mes' : 'Último Año')
            : 'Todos'
        }
      };

      console.log('📊 Datos para PDF general:', reportData);

      // Verificar si la función importada existe
      if (typeof generateProfessionalReportPDF === 'function') {
        console.log('✅ Usando generateProfessionalReportPDF');
        generateProfessionalReportPDF(reportData);
      } else {
        console.warn('⚠️ generateProfessionalReportPDF no está disponible, usando fallback');
        const success = fallbackPDFGenerator(reportData, 'general');
        if (!success) {
          addNotification({
            title: 'Error al generar PDF',
            message: 'No se pudo generar el reporte general',
            type: 'error'
          });
        }
      }

    } catch (error) {
      console.error('❌ Error generando reporte general:', error);
      addNotification({
        title: 'Error al generar PDF',
        message: 'No se pudo generar el reporte general. Verifica la consola para más detalles.',
        type: 'error'
      });
    }
  };

// REEMPLAZAR completamente la función generateSelectedOrdersReport:
const generateSelectedOrdersReport = () => {
  //  Verificación más estricta al inicio
  if (!selectedOrders || selectedOrders.length === 0) {
    addNotification({
      title: 'Selección requerida',
      message: 'Por favor selecciona al menos un pedido para generar el reporte',
      type: 'warning'
    });
    return; //  Detener ejecución inmediatamente
  }

  try {
    console.log('🔄 Generando reporte de pedidos seleccionados...', { 
      seleccionados: selectedOrders.length,
      ids: selectedOrders 
    });

    const selectedData = allDataForCharts.filter(p => selectedOrders.includes(p.id));
    
    //  Verificación adicional por si los IDs no coinciden
    if (selectedData.length === 0) {
      addNotification({
        title: 'Datos no encontrados',
        message: 'Los pedidos seleccionados no se encontraron en los datos actuales',
        type: 'error'
      });
      return;
    }

    const totalAmount = selectedData.reduce((sum, p) => sum + (p.total || 0), 0);
    
    const reportData = {
      selectedOrders: selectedOrders.length,
      stats: {
        selectedCount: selectedData.length,
        regularCount: selectedData.filter(p => p.projectId !== 'extra').length,
        extraCount: selectedData.filter(p => p.projectId === 'extra').length,
        totalAmount: totalAmount,
        usersInvolved: new Set(selectedData.map(p => p.userId)).size
      },
      tableData: {
        head: [['No.', 'Usuario', 'Proyecto', 'Fecha', 'Tipo', 'Estado', 'Total (CUP)']],
        body: selectedData.map((p, i) => [
          (i + 1).toString(),
          p.user || 'N/A',
          !p.projectId || p.projectId === 'extra' ? 'Pedido Extra' : getProjectName(p.projectId, p.userId),
          new Date(p.date).toLocaleDateString('es-ES'),
          p.orderType || getOrderType(p),
          p.status || 'Pendiente',
          `$${(p.total || 0).toFixed(2)}`
        ])
      },
      filters: {
        user: selectedUser ? getUserName(selectedUser) : 'Todos',
        project: selectedProject ? getProjectName(selectedProject, selectedUser) : 'Todos',
        month: monthFilter ? new Date(monthFilter).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }) : 'Todos',
        period: reportPeriod !== 'all' 
          ? (reportPeriod === 'week' ? 'Última Semana' : reportPeriod === 'month' ? 'Último Mes' : 'Último Año')
          : 'Todos'
      }
    };

    console.log('📊 Datos para PDF seleccionados:', reportData);

    //  Verificar que la función existe y llamarla correctamente
    if (typeof generateSelectedOrdersReportPDF === 'function') {
      generateSelectedOrdersReportPDF(reportData);
      addNotification({
        title: 'Reporte generado',
        message: `El PDF con ${selectedData.length} pedidos seleccionados se ha descargado correctamente`,
        type: 'success'
      });
    } else {
      throw new Error('La función generateSelectedOrdersReportPDF no está disponible');
    }

  } catch (error) {
    console.error('❌ Error generando reporte seleccionado:', error);
    addNotification({
      title: 'Error al generar PDF',
      message: 'No se pudo generar el reporte de pedidos seleccionados. Verifica la consola para más detalles.',
      type: 'error'
    });
  }
};


 const generateSelectedOrdersReportPDF = (data) => {
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

    // Encabezado
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
    doc.text('REPORTE DE PEDIDOS SELECCIONADOS', pageWidth / 2, y, { align: 'center' });
    y += 15;

    // Información
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Pedidos seleccionados: ${data.selectedOrders}`, margin, y);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, pageWidth - margin, y, { align: 'right' });
    y += 15;

    // Estadísticas
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    
    const stats = [
      `Total de pedidos: ${data.stats.selectedCount}`,
      `Pedidos regulares: ${data.stats.regularCount}`,
      `Pedidos extras: ${data.stats.extraCount}`,
      `Monto total: $${data.stats.totalAmount.toFixed(2)} CUP`,
      `Usuarios involucrados: ${data.stats.usersInvolved}`
    ];

    stats.forEach(stat => {
      doc.text(stat, margin, y, { maxWidth: pageWidth - 2 * margin });
      y += 7;
    });

    y += 10;

    // Tabla
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

    // Guardar
    const fileName = `REPORTE_SELECCIONADO_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);

    return true;
  } catch (error) {
    console.error('Error generando reporte seleccionado:', error);
    return false;
  }
};

const verifyPDFFunctions = () => {
  console.log('🔍 Verificando funciones de PDF:');
  console.log('generateProfessionalReportPDF:', typeof generateProfessionalReportPDF);
  console.log('generateSelectedOrdersReportPDF:', typeof generateSelectedOrdersReportPDF);
  console.log('jsPDF:', typeof jsPDF);
};

// Llamar la verificación al cargar el componente
useEffect(() => {
  verifyPDFFunctions();
}, []);


const handleGeneralReportClick = () => {
  console.log('🖱️ Click en botón General Report');
  console.log('Datos disponibles:', allDataForCharts);
  console.log('Funciones PDF disponibles:', {
    general: typeof generateProfessionalReportPDF,
    selected: typeof generateSelectedOrdersReportPDF
  });
  generateGeneralReport();
};


const debugSelectionState = () => {
  console.log('🔍 Estado de selección:', {
    selectedOrders,
    selectedOrdersLength: selectedOrders.length,
    selectedOrdersIsArray: Array.isArray(selectedOrders),
    allDataForChartsLength: allDataForCharts.length
  });
};

// Llamar esta función cuando se cambie la selección
useEffect(() => {
  debugSelectionState();
}, [selectedOrders]);


const handleSelectedReportClick = () => {
  console.log('🖱️ CLICK en botón Reporte Seleccionado');
  console.log('Estado actual de selectedOrders:', selectedOrders);
  console.log('Longitud de selectedOrders:', selectedOrders.length);
  console.log('¿Debería ejecutarse?', selectedOrders.length > 0);
  
  if (selectedOrders.length === 0) {
    console.log('❌ NO debería ejecutarse - selección vacía');
    addNotification({
      title: 'Selección requerida',
      message: 'Por favor selecciona al menos un pedido para generar el reporte',
      type: 'warning'
    });
    return;
  }
  
  console.log(' Ejecutando generateSelectedOrdersReport...');
  generateSelectedOrdersReport();
};


const fallbackPDFGenerator = (data, type = 'general') => {
  console.log('🔄 Usando generador de PDF de respaldo...', { data, type });
  
  try {
    const doc = new jsPDF();
    
    // Configuración básica del documento
    doc.setFontSize(16);
    doc.setTextColor(78, 1, 1); // Color borgundy
    doc.text(`Reporte de ${type === 'general' ? 'Todos los Pedidos' : 'Pedidos Seleccionados'}`, 20, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, 20, 30);
    doc.text(`Total de pedidos: ${data.stats?.totalRequests || data.stats?.selectedCount || 0}`, 20, 40);
    doc.text(`Monto total: $${data.stats?.totalAmount?.toFixed(2) || '0.00'} CUP`, 20, 50);
    
    // Tabla básica
    if (data.tableData && data.tableData.body.length > 0) {
      let yPosition = 70;
      
      // Encabezados de tabla
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.setFillColor(78, 1, 1);
      doc.rect(20, yPosition, 170, 8, 'F');
      doc.text('No.', 22, yPosition + 6);
      doc.text('Usuario', 35, yPosition + 6);
      doc.text('Proyecto', 80, yPosition + 6);
      doc.text('Total', 150, yPosition + 6);
      
      yPosition += 10;
      
      // Datos de la tabla
      doc.setTextColor(0, 0, 0);
      data.tableData.body.forEach((row, index) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.text(row[0] || '', 22, yPosition);
        doc.text(row[1] || '', 35, yPosition);
        doc.text(row[2] || '', 80, yPosition);
        doc.text(row[5] || row[6] || '', 150, yPosition);
        
        yPosition += 6;
      });
    }
    
    const fileName = `REPORTE_${type.toUpperCase()}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    return true;
  } catch (error) {
    console.error('❌ Error en generador de respaldo:', error);
    return false;
  }
};

  // Manejar selección/deselección de pedidos
const handleOrderSelection = (orderId) => {
  console.log('🔄 Cambiando selección:', { orderId, selectedOrders });
  
  setSelectedOrders(prev => {
    const newSelection = prev.includes(orderId) 
      ? prev.filter(id => id !== orderId)
      : [...prev, orderId];
    
    console.log('Nueva selección:', newSelection);
    return newSelection;
  });
};

  // Seleccionar/deseleccionar todos
const handleSelectAll = () => {
  console.log('🔄 Seleccionando/deseleccionando todos...');
  
  if (selectedOrders.length === allDataForCharts.length) {
    // Deseleccionar todos
    setSelectedOrders([]);
    console.log(' Todos deseleccionados');
  } else {
    // Seleccionar todos
    const allIds = allDataForCharts.map(order => order.id);
    setSelectedOrders(allIds);
    console.log(' Todos seleccionados:', allIds.length);
  }
};

  // Generar acta
  const generateConformity = (request) => {
    const project = projects.find(p => p.id === request.projectId);
    const user = clients.find(c => c.id === request.userId);
    
    setConformityData({
      project: project?.name || 'Pedido Extra',
      client: user?.fullName || request.user,
      date: new Date().toLocaleDateString('es-ES'),
      items: request.items || request.products || [],
      total: request.total || 0,
      notes: ''
    });
    setOpenConformity(true);
  };

  // Verificar si hay actas completadas
  const hasCompletedRequests = useMemo(() => {
    return allDataForCharts.some(p => p.status === 'Completado' || p.status === 'completado');
  }, [allDataForCharts]);

  return (
    <Box sx={{ 
      p: isMobile ? 2 : 3,
      color: colors.text,
      minHeight: '100vh',
      transition: 'all 0.3s ease',
      marginTop: isMobile ? '10%' : 3,
    }}>

      <Paper sx={{ 
        p: 3, 
        mb: 3, 
        borderRadius: 2, 
        boxShadow: 3,
        backgroundColor: colors.paper,
        mt: 0
      }}>
        {/* Título */}
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            mb: 2, 
            textAlign: 'center',
            color: colors.borgundy,
            fontWeight: 'bold'
          }}
        >
          Gestión de Reportes
        </Typography>

        {/* Pestañas centradas - CORREGIDAS para modo oscuro */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <Tabs 
            value={tab} 
            onChange={(_, v) => setTab(v)} 
            sx={{ 
              '& .MuiTab-root': {
                color: colors.borgundy,
                '&.Mui-selected': {
                  color: colors.tan, // Color Tan cuando está seleccionado
                },
                '& .MuiTab-iconWrapper': {
                  color: 'inherit' // Los iconos heredan el color del texto
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: colors.tan, // Indicador en color Tan
              }
            }}
          >
            <Tab value="dashboard" label="Dashboard" icon={<DashboardIcon />} />
            <Tab value="reports" label="Reportes" icon={<DescriptionIcon />} />
            <Tab value="conformity" label="Actas" icon={<AssignmentTurnedIn />} />
          </Tabs>
        </Box>

        {/* Filtros CENTRALIZADOS */}
        <Grid container spacing={2} sx={{ mb: 4, justifyContent: 'center' }}>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: colors.text }}>Período Reporte</InputLabel>
              <Select 
                value={reportPeriod} 
                onChange={(e) => setReportPeriod(e.target.value)} 
                label="Período Reporte"
                sx={{
                  backgroundColor: colors.paper,
                  color: colors.text,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.shellstone,
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.tan,
                  },
                  '& .MuiSvgIcon-root': {
                    color: colors.text
                  }
                }}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="week">Última Semana</MenuItem>
                <MenuItem value="month">Último Mes</MenuItem>
                <MenuItem value="year">Último Año</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: colors.text }}>Usuario</InputLabel>
              <Select 
                value={selectedUser} 
                onChange={(e) => {
                  setSelectedUser(e.target.value);
                  setSelectedProject('');
                }} 
                label="Usuario"
                sx={{
                  backgroundColor: colors.paper,
                  color: colors.text,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.shellstone,
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.tan,
                  },
                  '& .MuiSvgIcon-root': {
                    color: colors.text
                  }
                }}
              >
                <MenuItem value="">Todos los usuarios</MenuItem>
                {filteredClients.map(c => (
                  <MenuItem key={c.id} value={c.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Person fontSize="small" sx={{ color: colors.text }} />
                      <Typography sx={{ color: colors.text }}>{c.fullName}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: colors.text }}>Proyecto</InputLabel>
              <Select 
                value={selectedProject} 
                onChange={(e) => setSelectedProject(e.target.value)} 
                label="Proyecto"
                disabled={!selectedUser}
                sx={{
                  backgroundColor: colors.paper,
                  color: colors.text,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.shellstone,
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.tan,
                  },
                  '& .MuiSvgIcon-root': {
                    color: colors.text
                  }
                }}
              >
                <MenuItem value="">Todos los proyectos</MenuItem>
                {projects
                  .filter(p => !selectedUser || p.ownerId === selectedUser)
                  .map(p => (
                    <MenuItem key={p.id} value={p.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DescriptionIcon fontSize="small" sx={{ color: colors.text }} />
                        <Typography sx={{ color: colors.text }}>{`${p.costCenter} - ${p.projectNumber}`}</Typography>
                      </Box>
                    </MenuItem>
                  ))
                }
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              label="Filtrar por mes"
              type="month"
              fullWidth
              size="small"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              InputLabelProps={{ 
                shrink: true,
                sx: { color: colors.text }
              }}
              InputProps={{
                startAdornment: <CalendarMonth sx={{ mr: 1, color: colors.text }} />,
                sx: {
                  color: colors.text,
                  backgroundColor: colors.paper,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.shellstone,
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.tan,
                  }
                }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2} sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => {
                setSelectedUser('');
                setSelectedProject('');
                setMonthFilter('');
                setReportPeriod('all');
                setSelectedOrders([]);
              }}
              sx={{
                height: '40px',
                borderColor: colors.tan,
                color: colors.tan,
                '&:hover': {
                  backgroundColor: colors.tan,
                  color: colors.background
                }
              }}
            >
              Limpiar Filtros
            </Button>
          </Grid>
        </Grid>

        {/* Dashboard */}
        {tab === 'dashboard' && (
          <Grid container spacing={3} justifyContent="center">
            {/* Tarjetas de estadísticas CENTRALIZADAS - CORREGIDAS para modo oscuro */}
            <Grid item xs={12}>
              <Grid container spacing={3} justifyContent="center">
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ 
                    p: 3, 
                    borderRadius: 3, 
                    boxShadow: 4,
                    background: `linear-gradient(135deg, ${colors.borgundy}15, ${colors.tan}10)`,
                    border: `1px solid ${colors.shellstone}`,
                    textAlign: 'center',
                    minHeight: 160,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}>
                    <Typography variant="h6" sx={{ color: colors.text, mb: 1, fontWeight: 'bold' }}>
                      Total Solicitudes
                    </Typography>
                    <Typography variant="h3" fontWeight="bold" sx={{ color: colors.text }}>
                      {allDataForCharts.length}
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mt: 1 }}>
                      Regulares: {filteredPurchases.length} | Extras: {filteredOrders.length}
                    </Typography>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ 
                    p: 3, 
                    borderRadius: 3, 
                    boxShadow: 4,
                    background: `linear-gradient(135deg, ${colors.sapphire}15, ${colors.tan}10)`,
                    border: `1px solid ${colors.shellstone}`,
                    textAlign: 'center',
                    minHeight: 160,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}>
                    <Typography variant="h6" sx={{ color: colors.text, mb: 1, fontWeight: 'bold' }}>
                      Monto Total
                    </Typography>
                    <Typography variant="h3" fontWeight="bold" sx={{ color: colors.text }}>
                      ${allDataForCharts.reduce((sum, p) => sum + (p.total || 0), 0).toFixed(2)}
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mt: 1 }}>
                      CUP
                    </Typography>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ 
                    p: 3, 
                    borderRadius: 3, 
                    boxShadow: 4,
                    background: `linear-gradient(135deg, ${colors.tan}15, ${colors.borgundy}10)`,
                    border: `1px solid ${colors.shellstone}`,
                    textAlign: 'center',
                    minHeight: 160,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}>
                    <Typography variant="h6" sx={{ color: colors.text, mb: 1, fontWeight: 'bold' }}>
                      Usuarios Activos
                    </Typography>
                    <Typography variant="h3" fontWeight="bold" sx={{ color: colors.text }}>
                      {new Set(allDataForCharts.map(p => p.userId)).size}
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mt: 1 }}>
                      Este período
                    </Typography>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ 
                    p: 3, 
                    borderRadius: 3, 
                    boxShadow: 4,
                    background: `linear-gradient(135deg, ${colors.shellstone}15, ${colors.sapphire}10)`,
                    border: `1px solid ${colors.shellstone}`,
                    textAlign: 'center',
                    minHeight: 160,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}>
                    <Typography variant="h6" sx={{ color: colors.text, mb: 1, fontWeight: 'bold' }}>
                      Completados
                    </Typography>
                    <Typography variant="h3" fontWeight="bold" sx={{ color: colors.text }}>
                      {allDataForCharts.filter(p => p.status === 'Completado' || p.status === 'completado').length}
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mt: 1 }}>
                      Para actas
                    </Typography>
                  </Card>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ 
                    p: 1, 
                    borderRadius: 2, 
                    boxShadow: 2,
                    backgroundColor: colors.paper,
                    border: `1px solid ${colors.shellstone}`,
                    textAlign: 'center',
                    height: '100%'
                  }}>
                    <Typography variant="h6" gutterBottom sx={{ color: colors.text, mb: 3, fontWeight: 'bold' }}>
                      Distribución por Tipo
                    </Typography>
                    <Box sx={{ height: 250, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      {chartData.purchaseByType.length > 0 && chartData.purchaseByTypeData.some(val => val > 0) ? (
                        <PieChart
                          series={[{
                            data: chartData.purchaseByType.map((label, index) => ({
                              id: index,
                              value: chartData.purchaseByTypeData[index],
                              label: label
                            })),
                            innerRadius: 70,
                            outerRadius: 100,
                            paddingAngle: 5,
                            cornerRadius: 5,
                          }]}
                          width={300}
                          height={280}
                        />
                      ) : (
                        <Alert severity="info" sx={{ 
                          height: '100%', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          backgroundColor: colors.swanWhite,
                          color: colors.text
                        }}>
                          No hay datos para mostrar en el gráfico
                        </Alert>
                      )}
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ 
                    p: 1, 
                    borderRadius: 2, 
                    boxShadow: 2,
                    backgroundColor: colors.paper,
                    border: `1px solid ${colors.shellstone}`,
                    textAlign: 'center',
                    height: '100%'
                  }}>
                    <Typography variant="h6" gutterBottom sx={{ color: colors.text, mb: 3, fontWeight: 'bold' }}>
                      Tendencia Mensual
                    </Typography>
                    <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                      {chartData.monthlyTrends.length > 0 && chartData.monthlyTrends.some(t => t.productos > 0 || t.servicios > 0 || t.extras > 0) ? (
                        <LineChart
                          series={[
                            { 
                              data: chartData.monthlyTrends.map(t => t.productos), 
                              label: 'Productos',
                              color: colors.borgundy,
                              curve: 'linear' // Líneas rectas en lugar de curvadas
                            },
                            { 
                              data: chartData.monthlyTrends.map(t => t.servicios), 
                              label: 'Servicios',
                              color: colors.sapphire,
                              curve: 'linear' // Líneas rectas en lugar de curvadas
                            },
                            { 
                              data: chartData.monthlyTrends.map(t => t.extras), 
                              label: 'Extras',
                              color: colors.tan,
                              curve: 'linear' // Líneas rectas en lugar de curvadas
                            }
                          ]}
                          xAxis={[{ 
                            data: chartData.monthlyTrends.map(t => {
                              const [year, month] = t.month.split('-');
                              return `${month}/${year.slice(2)}`;
                            }),
                            scaleType: 'band'
                          }]}
                          grid={{ 
                            vertical: true, // Líneas verticales discontinuas
                            horizontal: true // Líneas horizontales discontinuas
                          }}
                          height={300}
                          width={450}
                        />
                      ) : (
                        <Alert severity="info" sx={{ 
                          height: '100%', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          backgroundColor: colors.swanWhite,
                          color: colors.text
                        }}>
                          No hay datos de tendencias para mostrar
                        </Alert>
                      )}
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        )}

        {/* Reportes */}
        {tab === 'reports' && (
          <>
            {allDataForCharts.length === 0 ? (
              <Alert severity="info" sx={{ 
                backgroundColor: colors.swanWhite,
                color: colors.text,
                textAlign: 'center'
              }}>
                No hay solicitudes que coincidan con los filtros seleccionados.
              </Alert>
            ) : (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ color: colors.text, fontWeight: 'bold' }}>
                    Detalle de Solicitudes ({allDataForCharts.length} registros)
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    {selectedOrders.length > 0 && (
                      <Typography variant="body2" sx={{ color: colors.text }}>
                        {selectedOrders.length} pedidos seleccionados
                      </Typography>
                    )}
                    
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedOrders.length === allDataForCharts.length && allDataForCharts.length > 0}
                          indeterminate={selectedOrders.length > 0 && selectedOrders.length < allDataForCharts.length}
                          onChange={handleSelectAll}
                          sx={{
                            color: colors.tan,
                            '&.Mui-checked': {
                              color: colors.tan,
                            },
                          }}
                        />
                      }
                      label="Seleccionar todos"
                      sx={{ color: colors.text }}
                    />
                  </Box>
                </Box>

                <TableContainer 
                  component={Paper} 
                  sx={{ 
                    backgroundColor: colors.paper,
                    border: `1px solid ${colors.shellstone}`
                  }}
                >
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: colors.swanWhite }}>
                        <TableCell sx={{ color: colors.text, fontWeight: 'bold', textAlign: 'center', width: 50 }}>
                          <Checkbox
                            checked={selectedOrders.length === allDataForCharts.length && allDataForCharts.length > 0}
                            indeterminate={selectedOrders.length > 0 && selectedOrders.length < allDataForCharts.length}
                            onChange={handleSelectAll}
                            sx={{
                              color: colors.tan,
                              '&.Mui-checked': {
                                color: colors.tan,
                              },
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: colors.text, fontWeight: 'bold', textAlign: 'center', width: 60 }}>#</TableCell>
                        <TableCell sx={{ color: colors.text, fontWeight: 'bold', textAlign: 'center', width: 80 }}>
                          <Tooltip title="Estado actual del pedido">
                            <ChangeCircle fontSize="small" sx={{ color: colors.tan }} />
                          </Tooltip>
                        </TableCell>
                        <TableCell sx={{ color: colors.text, fontWeight: 'bold', textAlign: 'center' }}>Usuario</TableCell>
                        <TableCell sx={{ color: colors.text, fontWeight: 'bold', textAlign: 'center' }}>Proyecto</TableCell>
                        <TableCell sx={{ color: colors.text, fontWeight: 'bold', textAlign: 'center' }}>Fecha</TableCell>
                        <TableCell sx={{ color: colors.text, fontWeight: 'bold', textAlign: 'center' }}>Tipo</TableCell>
                        <TableCell sx={{ color: colors.text, fontWeight: 'bold', textAlign: 'center' }}>Total</TableCell>
                        <TableCell sx={{ color: colors.text, fontWeight: 'bold', textAlign: 'center' }}>Estado</TableCell>
                        <TableCell sx={{ color: colors.text, fontWeight: 'bold', textAlign: 'center' }}>Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {allDataForCharts.map((p, i) => (
                        <TableRow 
                          key={i}
                          sx={{ 
                            '&:hover': {
                              backgroundColor: colors.swanWhite,
                            }
                          }}
                        >
                          <TableCell sx={{ textAlign: 'center' }}>
                            <Checkbox
                              checked={selectedOrders.includes(p.id)}
                              onChange={() => handleOrderSelection(p.id)}
                              sx={{
                                color: colors.tan,
                                '&.Mui-checked': {
                                  color: colors.tan,
                                },
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ color: colors.text, textAlign: 'center' }}>{i + 1}</TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>
                            <Tooltip title={`Estado actual: ${p.status || 'Pendiente'}`}>
                              <ChangeCircle 
                                fontSize="small" 
                                sx={{ 
                                  color: 
                                    p.status === 'Completado' || p.status === 'completado' ? '#4caf50' : 
                                    p.status === 'En proceso' ? colors.tan : colors.sapphire
                                }} 
                              />
                            </Tooltip>
                          </TableCell>
                          <TableCell sx={{ color: colors.text, textAlign: 'center' }}>{p.user}</TableCell>
                          <TableCell sx={{ color: colors.text, textAlign: 'center' }}>
                            {!p.projectId || p.projectId === 'extra' ? 'Pedido Extra' : 
                            getProjectName(p.projectId, p.userId)}
                          </TableCell>
                          <TableCell sx={{ color: colors.text, textAlign: 'center' }}>{new Date(p.date).toLocaleDateString('es-ES')}</TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>
                            <Chip 
                              label={p.orderType || getOrderType(p)} 
                              size="small" 
                              sx={{
                                backgroundColor: 
                                  p.orderType?.includes('P.Extra') ? colors.tan :
                                  p.orderType?.includes('Servicios') ? colors.sapphire :
                                  colors.borgundy,
                                color: 'white',
                                fontWeight: 'bold'
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ color: colors.text, fontWeight: 'bold', textAlign: 'center' }}>
                            ${(p.total || 0).toFixed(2)}
                          </TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>
                            <Chip 
                              label={p.status || 'Pendiente'} 
                              size="small" 
                              sx={{
                                backgroundColor: 
                                  p.status === 'Completado' || p.status === 'completado' ? '#4caf50' : 
                                  p.status === 'En proceso' ? colors.tan : colors.sapphire,
                                color: 'white',
                                fontWeight: 'bold'
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                              <Tooltip title="Generar PDF individual">
                                <IconButton 
                                  size="small"
                                  onClick={() => {
                                    // Generar reporte individual CORREGIDO
                                    const individualData = {
                                      selectedOrders: 1,
                                      stats: {
                                        selectedCount: 1,
                                        regularCount: p.projectId !== 'extra' ? 1 : 0,
                                        extraCount: p.projectId === 'extra' ? 1 : 0,
                                        totalAmount: p.total || 0,
                                        usersInvolved: 1
                                      },
                                      tableData: {
                                        head: [['No.', 'Usuario', 'Proyecto', 'Fecha', 'Tipo', 'Estado', 'Total (CUP)']],
                                        body: [[
                                          '1',
                                          p.user || 'N/A',
                                          !p.projectId || p.projectId === 'extra' ? 'Pedido Extra' : getProjectName(p.projectId, p.userId),
                                          new Date(p.date).toLocaleDateString('es-ES'),
                                          p.orderType || getOrderType(p),
                                          p.status || 'Pendiente',
                                          `$${(p.total || 0).toFixed(2)}`
                                        ]]
                                      },
                                      period: `Individual - ${new Date().toLocaleDateString('es-ES')}`,
                                      filters: {
                                        user: 'Individual',
                                        project: 'Individual', 
                                        month: 'Individual',
                                        period: 'Individual'
                                      }
                                    };
                                    
                                    console.log('📄 Generando reporte individual:', individualData);
                                    
                                    // Llamar a la función CORRECTA
                                    if (typeof generateSelectedOrdersReportPDF === 'function') {
                                      generateSelectedOrdersReportPDF(individualData);
                                      addNotification({
                                        title: 'Reporte generado',
                                        message: 'El PDF del pedido individual se ha descargado',
                                        type: 'success'
                                      });
                                    } else {
                                      console.error('❌ generateSelectedOrdersReportPDF no está disponible');
                                      // Generar PDF simple de emergencia
                                      generateSimpleIndividualPDF(p);
                                    }
                                  }}
                                  sx={{ 
                                    color: colors.tan
                                  }}
                                >
                                  <PictureAsPdf />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Generar acta">
                                <IconButton 
                                  size="small" 
                                  onClick={() => generateConformity(p)}
                                  disabled={!(p.status === 'Completado' || p.status === 'completado')}
                                  sx={{ 
                                    color: (p.status === 'Completado' || p.status === 'completado') ? colors.tan : colors.textSecondary 
                                  }}
                                >
                                  <AssignmentTurnedIn />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Botones para generar reportes - CORREGIDOS */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    startIcon={<PictureAsPdf sx={{ color: colors.background }} />}
                    onClick={handleGeneralReportClick}
                    sx={{
                      backgroundColor: colors.tan,
                      color: colors.background,
                      '&:hover': {
                        backgroundColor: colors.borgundy,
                        color: colors.swanWhite
                      }
                    }}
                  >
                    Generar PDF General de Todos los Pedidos
                  </Button>

                  {selectedOrders.length > 0 && (
                    <Button
                      variant="outlined"
                      startIcon={<PictureAsPdf sx={{ color: colors.tan }} />}
                      onClick={handleSelectedReportClick}
                      sx={{
                        borderColor: colors.tan,
                        color: colors.tan,
                        '&:hover': {
                          backgroundColor: colors.tan,
                          color: colors.background
                        }
                      }}
                    >
                      Generar PDF de Pedidos Seleccionados ({selectedOrders.length})
                    </Button>
                  )}
                </Box>
              </>
            )}
          </>
        )}

        {/* Actas de Conformidad */}
        {tab === 'conformity' && (
          <>
            {!hasCompletedRequests && (
              <Alert severity="info" sx={{ mb: 3, backgroundColor: colors.swanWhite, textAlign: 'center', color: colors.text }}>
                Las actas de conformidad solo pueden generarse para solicitudes con estado "Completado"
              </Alert>
            )}

            {allDataForCharts.filter(p => p.status === 'Completado' || p.status === 'completado').length === 0 ? (
              <Alert severity="warning" sx={{ backgroundColor: colors.swanWhite, textAlign: 'center', color: colors.text }}>
                No hay solicitudes completadas en este rango para generar actas de conformidad.
              </Alert>
            ) : (
              <>
                <Typography variant="h6" sx={{ mb: 3, color: colors.text, textAlign: 'center', fontWeight: 'bold' }}>
                  Solicitudes Completadas para Actas de Conformidad
                </Typography>
                <TableContainer 
                  component={Paper}
                  sx={{
                    backgroundColor: colors.paper,
                    border: `1px solid ${colors.shellstone}`
                  }}
                >
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: colors.swanWhite }}>
                        <TableCell sx={{ color: colors.text, fontWeight: 'bold', textAlign: 'center' }}>Usuario</TableCell>
                        <TableCell sx={{ color: colors.text, fontWeight: 'bold', textAlign: 'center' }}>Proyecto</TableCell>
                        <TableCell sx={{ color: colors.text, fontWeight: 'bold', textAlign: 'center' }}>Fecha</TableCell>
                        <TableCell sx={{ color: colors.text, fontWeight: 'bold', textAlign: 'center' }}>Tipo</TableCell>
                        <TableCell sx={{ color: colors.text, fontWeight: 'bold', textAlign: 'center' }}>Total</TableCell>
                        <TableCell sx={{ color: colors.text, fontWeight: 'bold', textAlign: 'center' }}>Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {allDataForCharts
                        .filter(p => p.status === 'Completado' || p.status === 'completado')
                        .map((p, i) => (
                          <TableRow 
                            key={i}
                            sx={{ 
                              '&:hover': {
                                backgroundColor: colors.swanWhite,
                              }
                            }}
                          >
                            <TableCell sx={{ color: colors.text, textAlign: 'center' }}>{p.user}</TableCell>
                            <TableCell sx={{ color: colors.text, textAlign: 'center' }}>
                              {!p.projectId || p.projectId === 'extra' ? 'Pedido Extra' : 
                              projects.find(pr => pr.id === p.projectId)?.name || 'N/A'}
                            </TableCell>
                            <TableCell sx={{ color: colors.text, textAlign: 'center' }}>{new Date(p.date).toLocaleDateString('es-ES')}</TableCell>
                            <TableCell sx={{ textAlign: 'center' }}>
                              <Chip 
                                label={p.orderType || getOrderType(p)} 
                                size="small" 
                                sx={{
                                  backgroundColor: 
                                    p.orderType?.includes('P.Extra') ? colors.tan :
                                    p.orderType?.includes('Servicios') ? colors.sapphire :
                                    colors.borgundy,
                                  color: 'white',
                                  fontWeight: 'bold'
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ color: colors.text, fontWeight: 'bold', textAlign: 'center' }}>${(p.total || 0).toFixed(2)}</TableCell>
                            <TableCell sx={{ textAlign: 'center' }}>
                              <Button
                                variant="outlined"
                                startIcon={<AssignmentTurnedIn sx={{ color: colors.tan }} />}
                                onClick={() => generateConformity(p)}
                                size="small"
                                sx={{
                                  borderColor: colors.tan,
                                  color: colors.tan,
                                  '&:hover': {
                                    backgroundColor: colors.tan,
                                    color: colors.background
                                  }
                                }}
                              >
                                Generar Acta
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </>
        )}
      </Paper>

      {/* Diálogo para Acta de Conformidad - CORREGIDO para modo oscuro */}
      <Dialog 
        open={openConformity} 
        onClose={() => setOpenConformity(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: colors.paper,
            color: colors.text,
            border: `1px solid ${colors.shellstone}`
          }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: colors.borgundy, 
          color: colors.text,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          borderBottom: `1px solid ${colors.shellstone}`
        }}>
          <AssignmentTurnedIn sx={{ color: colors.text }} />
          Acta de Conformidad
        </DialogTitle>
        <DialogContent>
          {conformityData && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Proyecto"
                    fullWidth
                    value={conformityData.project}
                    onChange={(e) => setConformityData({...conformityData, project: e.target.value})}
                    margin="normal"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: colors.text,
                        '& fieldset': {
                          borderColor: colors.shellstone,
                        },
                        '&:hover fieldset': {
                          borderColor: colors.tan,
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: colors.text,
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Usuario"
                    fullWidth
                    value={conformityData.client}
                    onChange={(e) => setConformityData({...conformityData, client: e.target.value})}
                    margin="normal"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: colors.text,
                        '& fieldset': {
                          borderColor: colors.shellstone,
                        },
                        '&:hover fieldset': {
                          borderColor: colors.tan,
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: colors.text,
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mt: 2, mb: 1, color: colors.text, fontWeight: 'bold' }}>Items</Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: colors.swanWhite }}>
                          <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>Descripción</TableCell>
                          <TableCell align="right" sx={{ color: colors.text, fontWeight: 'bold' }}>Cantidad</TableCell>
                          <TableCell align="right" sx={{ color: colors.text, fontWeight: 'bold' }}>Precio Unit.</TableCell>
                          <TableCell align="right" sx={{ color: colors.text, fontWeight: 'bold' }}>Total</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {conformityData.items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell sx={{ color: colors.text }}>
                              {item.name || item.service || 'Servicio/Producto'}
                            </TableCell>
                            <TableCell align="right" sx={{ color: colors.text }}>
                              {item.quantity || 1}
                            </TableCell>
                            <TableCell align="right" sx={{ color: colors.text }}>
                              ${(item.price || 0).toFixed(2)}
                            </TableCell>
                            <TableCell align="right" sx={{ color: colors.text, fontWeight: 'bold' }}>
                              ${((item.quantity || 1) * (item.price || 0)).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Notas adicionales"
                    fullWidth
                    multiline
                    rows={3}
                    value={conformityData.notes}
                    onChange={(e) => setConformityData({...conformityData, notes: e.target.value})}
                    margin="normal"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: colors.text,
                        '& fieldset': {
                          borderColor: colors.shellstone,
                        },
                        '&:hover fieldset': {
                          borderColor: colors.tan,
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: colors.text,
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ backgroundColor: colors.swanWhite }}>
          <Button 
            onClick={() => setOpenConformity(false)}
            sx={{ color: colors.text }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={() => {
              generateProfessionalConformity(conformityData);
              setOpenConformity(false);
              addNotification({
                title: 'Acta generada',
                message: 'El acta de conformidad ha sido generada exitosamente',
                type: 'success'
              });
            }}
            variant="contained"
            sx={{ 
              backgroundColor: colors.tan,
              color: colors.background,
              '&:hover': {
                backgroundColor: colors.borgundy,
                color: colors.text
              }
            }}
          >
            Generar PDF
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}