// src/pages/Reportes/Reportes.jsx
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
  FormControlLabel,
  Divider
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
const DIRECTOR_CARGO = 'Director de Servicios Tecnológicos';
const DEPARTAMENTO_NOMBRE = 'Dirección de Servicios Tecnológicos (DST)';

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

// Función para determinar el tipo de pedido
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

// Función para generar acta
const generateProfessionalConformity = (data, addNotification) => {
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
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('UNIVERSIDAD DE LA HABANA', marginLeft, 15);
      doc.text('Dirección de Servicios Tecnológicos', marginLeft, 20);
    
      // Título principal con mejor espaciado
      doc.setFontSize(18);
      doc.setTextColor(78, 1, 1);
      doc.text('ACTA DE CONFORMIDAD', pageWidth / 2, y, { align: 'center' });
      y += 15;

      doc.setDrawColor(78, 1, 1);
      doc.setLineWidth(0.8);
      doc.line(marginLeft, 38, pageWidth - marginRight, 38);
    };

    // Pie de página
    const addFooter = () => {
      const footerY = doc.internal.pageSize.getHeight() - 15;
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`Página ${currentPage}`, pageWidth / 2, footerY, { align: 'center' });
      doc.text('Documento generado automáticamente por el Sistema SiPP', pageWidth / 2, footerY + 6, { align: 'center' });
    };

    const checkNewPage = (requiredSpace = 25) => {
      if (y + requiredSpace > doc.internal.pageSize.getHeight() - 40) {
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
    y = marginTop + 25;

    // Código y fecha con mejor espaciado
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const docCode = `AC-DST-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    
    doc.text(`Código: ${docCode}`, marginLeft, y);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    })}`, pageWidth - marginRight, y, { align: 'right' });
    y += 20;

    // Datos del proyecto con mejor espaciado
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    const projectData = [
      'A: Departamento de Economía',
      '',
      'Por medio del presente documento, el Departamento de Servicios Tecnológicos',
      'hace constar que ha completado satisfactoriamente el pedido asociado al proyecto:',
      '',
      `PROYECTO: ${data.project || 'No especificado'}`,
      `SOLICITANTE: ${data.client || 'No especificado'}`,
      `FECHA DE ENTREGA: ${data.date || new Date().toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric' 
      })}`,
      '',
      `El usuario ${data.client || 'Solicitante'} manifiesta su completa conformidad con los`,
      `productos y/o servicios recibidos, reconociendo que han sido entregados de acuerdo`,
      `a las especificaciones solicitadas y dentro de los parámetros de calidad establecidos.`,
      '',
    ];
    
    projectData.forEach(line => {
      checkNewPage(8);
      if (line === '') {
        y += 6; // Espaciado mayor entre párrafos
      } else if (line.includes('ACTA DE CONFORMIDAD')) {
        doc.setFont('helvetica', 'bold');
        doc.text(line, marginLeft, y, { maxWidth: pageWidth - marginLeft - marginRight });
        doc.setFont('helvetica', 'normal');
        y += 10;
      } else {
        doc.text(line, marginLeft, y, { maxWidth: pageWidth - marginLeft - marginRight });
        y += 7; // Espaciado mayor entre líneas
      }
    });
    
    y += 12;

    // Tabla de items
    if (data.items && data.items.length > 0) {
      checkNewPage(60);
      
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
            cellPadding: 4,
            textColor: [0, 0, 0],
            lineColor: [200, 200, 200],
            lineWidth: 0.1
          },
          headStyles: { 
            fillColor: [78, 1, 1], 
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center',
            fontSize: 10
          },
          margin: { left: marginLeft, right: marginRight },
          tableWidth: 'auto'
        });
        
        y = doc.lastAutoTable.finalY + 20; // Mayor espaciado después de la tabla
      } catch (tableError) {
        console.error('Error generando tabla:', tableError);
        y += 15;
      }
    } else {
      checkNewPage(15);
      doc.text('No hay items especificados', marginLeft, y);
      y += 20;
    }

    // Notas adicionales
    if (data.notes && data.notes.trim() !== '') {
      checkNewPage(30);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('NOTAS ADICIONALES:', marginLeft, y);
      y += 8;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const notesLines = doc.splitTextToSize(data.notes, pageWidth - marginLeft - marginRight);
      notesLines.forEach(line => {
        checkNewPage(6);
        doc.text(line, marginLeft, y);
        y += 6;
      });
      y += 15;
    }

    // FIRMAS CON MEJOR ESPACIADO
    checkNewPage(180); // Más espacio para firmas

    // Sección de firma del solicitante
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    const lineWidth = 120;
    const lineY = y + 25; // Mover más abajo
    
    // Línea para firma del solicitante
    doc.line(marginLeft, lineY, marginLeft + lineWidth, lineY);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(data.client || 'Solicitante', marginLeft + (lineWidth / 2), lineY + 8, { align: 'center' });
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Jefe de Proyecto', marginLeft + (lineWidth / 2), lineY + 15, { align: 'center' });
    doc.text('________________________', marginLeft + (lineWidth / 2), lineY + 20, { align: 'center' });

    // Sección de firma del director con mayor separación
    const directorLineX = pageWidth - marginRight - lineWidth;
    doc.setDrawColor(0, 0, 0);
    doc.line(directorLineX, lineY, pageWidth - marginRight, lineY);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(DIRECTOR_NOMBRE, pageWidth - marginRight - (lineWidth / 2), lineY + 8, { align: 'center' });
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(DIRECTOR_CARGO, pageWidth - marginRight - (lineWidth / 2), lineY + 15, { align: 'center' });
    doc.text(DEPARTAMENTO_NOMBRE, pageWidth - marginRight - (lineWidth / 2), lineY + 20, { align: 'center' });
    doc.text('________________________', pageWidth - marginRight - (lineWidth / 2), lineY + 25, { align: 'center' });

    // Texto entre firmas con mejor espaciado
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('Firma del Solicitante', marginLeft + 60, lineY + 40, { align: 'center' });
    doc.text('Firma del Director', pageWidth - marginRight - 60, lineY + 40, { align: 'center' });

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
  }
};

export default function Reportes() {
  const { theme, darkMode } = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const { currentUser } = useAuth();
  const { addNotification } = useNotifications();
 
  // Paleta de colores corregida para modo oscuro
  const colors = {
    light: {
      primary: '#4E0101',
      secondary: '#3C5070',
      accent: '#d2b48c',
      background: '#F5F0E9',
      paper: '#FFFFFF',
      text: '#000000',
      textSecondary: '#4A5568',
      border: '#E2E8F0',
      success: '#38A169',
      warning: '#D69E2E',
      error: '#E53E3E',
      info: '#3182CE'
    },
    dark: {
      primary: '#FF6B6B',
      secondary: '#4FD1C5',
      accent: '#A78B6F',
      background: '#1A202C',
      paper: '#2D3748',
      text: '#F7FAFC',
      textSecondary: '#CBD5E0',
      border: '#4A5568',
      success: '#68D391',
      warning: '#F6E05E',
      error: '#FC8181',
      info: '#63B3ED'
    }
  }[darkMode ? 'dark' : 'light'];

  const [tab, setTab] = useState('dashboard');
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [reportPeriod, setReportPeriod] = useState('all');
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

  // Filtrar usuarios - excluir comercial, gestor y admin
  const filteredClients = useMemo(() => {
    return clients.filter(user => 
      user.role !== 'admin' && 
      user.role !== 'comercial' && 
      user.role !== 'gestor'
    );
  }, [clients]);

  // Filtrar datos
  const filteredPurchases = useMemo(() => {
    let filtered = purchases;
    
    if (selectedUser) {
      filtered = filtered.filter(p => p.userId === selectedUser);
    }
    
    if (selectedProject) {
      filtered = filtered.filter(p => p.projectId === selectedProject);
    }
    
    if (monthFilter) {
      filtered = filtered.filter(p => {
        const purchaseDate = new Date(p.date);
        const filterDate = new Date(monthFilter);
        return purchaseDate.getMonth() === filterDate.getMonth() && 
               purchaseDate.getFullYear() === filterDate.getFullYear();
      });
    }
    
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
    
    if (selectedUser) {
      filtered = filtered.filter(o => o.userId === selectedUser);
    }
    
    if (monthFilter) {
      filtered = filtered.filter(o => {
        const orderDate = new Date(o.date);
        const filterDate = new Date(monthFilter);
        return orderDate.getMonth() === filterDate.getMonth() && 
               orderDate.getFullYear() === filterDate.getFullYear();
      });
    }
    
    if (reportPeriod !== 'all') {
      const { start, end } = getDateRange(reportPeriod);
      filtered = filtered.filter(o => {
        const orderDate = new Date(o.date);
        return orderDate >= start && orderDate <= end;
      });
    }
    
    return filtered;
  }, [specialOrders, selectedUser, monthFilter, reportPeriod]);

  // Combinar datos para estadísticas
  const allDataForCharts = useMemo(() => {
    const purchasesWithUserNames = filteredPurchases.map(purchase => ({
      ...purchase,
      user: getUserName(purchase.userId),
      projectName: getProjectName(purchase.projectId, purchase.userId),
      orderType: getOrderType(purchase),
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

    return [...purchasesWithUserNames, ...ordersWithUserNames];
  }, [filteredPurchases, filteredOrders]);

  // Datos para gráficos
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
      const orderType = p.orderType || getOrderType(p);
      
      if (orderType.includes('P.Extra')) {
        purchaseByType['Pedidos Extra'] += (p.total || 0);
      } else if (orderType.includes('Servicios')) {
        purchaseByType['Servicios'] += (p.total || 0);
      } else if (orderType.includes('Productos')) {
        purchaseByType['Productos'] += (p.total || 0);
      }

      const user = p.user || 'Desconocido';
      purchaseByUser[user] = (purchaseByUser[user] || 0) + (p.total || 0);

      const status = p.status || 'Pendiente';
      orderByStatus[status] = (orderByStatus[status] || 0) + 1;

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

  // Función para generar reporte general
  const generateGeneralReport = () => {
    try {
      console.log('🔄 Generando reporte general...');
      
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
          totalAmount: allDataForCharts.reduce((sum, p) => sum + (p.total || 0), 0),
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
        }
      };

      if (typeof generateProfessionalReportPDF === 'function') {
        generateProfessionalReportPDF(reportData);
      } else {
        // Fallback
        const success = generateProfessionalReportPDFFallback(reportData);
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
        message: 'No se pudo generar el reporte general',
        type: 'error'
      });
    }
  };

  // Función para generar reporte de pedidos seleccionados
  const generateSelectedOrdersReport = () => {
    if (!selectedOrders || selectedOrders.length === 0) {
      addNotification({
        title: 'Selección requerida',
        message: 'Por favor selecciona al menos un pedido para generar el reporte',
        type: 'warning'
      });
      return;
    }

    try {
      const selectedData = allDataForCharts.filter(p => selectedOrders.includes(p.id));
      
      if (selectedData.length === 0) {
        addNotification({
          title: 'Datos no encontrados',
          message: 'Los pedidos seleccionados no se encontraron en los datos actuales',
          type: 'error'
        });
        return;
      }

      const reportData = {
        selectedOrders: selectedOrders.length,
        stats: {
          selectedCount: selectedData.length,
          regularCount: selectedData.filter(p => p.projectId !== 'extra').length,
          extraCount: selectedData.filter(p => p.projectId === 'extra').length,
          totalAmount: selectedData.reduce((sum, p) => sum + (p.total || 0), 0),
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
        }
      };

      if (typeof generateSelectedOrdersReportPDF === 'function') {
        generateSelectedOrdersReportPDF(reportData);
        addNotification({
          title: 'Reporte generado',
          message: `El PDF con ${selectedData.length} pedidos seleccionados se ha descargado`,
          type: 'success'
        });
      } else {
        throw new Error('La función generateSelectedOrdersReportPDF no está disponible');
      }

    } catch (error) {
      console.error('❌ Error generando reporte seleccionado:', error);
      addNotification({
        title: 'Error al generar PDF',
        message: 'No se pudo generar el reporte de pedidos seleccionados',
        type: 'error'
      });
    }
  };

  // Función de fallback para reporte general
  const generateProfessionalReportPDFFallback = (data) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      
      // Encabezado
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('UNIVERSIDAD DE LA HABANA', margin, 15);
      doc.setFontSize(12);
      doc.setTextColor(78, 1, 1);
      doc.text('REPORTE GENERAL DE PEDIDOS', pageWidth / 2, 25, { align: 'center' });
      doc.setDrawColor(78, 1, 1);
      doc.setLineWidth(0.5);
      doc.line(margin, 30, pageWidth - margin, 30);
      
      let y = 45;
      
      // Información del período
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(`Período: ${data.period}`, margin, y);
      y += 8;
      doc.text(`Total de pedidos: ${data.stats.totalRequests}`, margin, y);
      y += 8;
      doc.text(`Pedidos regulares: ${data.stats.regularRequests}`, margin, y);
      y += 8;
      doc.text(`Pedidos extras: ${data.stats.extraRequests}`, margin, y);
      y += 8;
      doc.text(`Monto total: $${data.stats.totalAmount.toFixed(2)} CUP`, margin, y);
      y += 8;
      doc.text(`Usuarios activos: ${data.stats.activeUsers}`, margin, y);
      y += 8;
      doc.text(`Proyectos involucrados: ${data.stats.projectsCount}`, margin, y);
      y += 15;
      
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
            fillColor: [78, 1, 1],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center'
          },
          margin: { left: margin, right: margin }
        });
      }
      
      const fileName = `REPORTE_GENERAL_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      return true;
    } catch (error) {
      console.error('Error generando reporte general de fallback:', error);
      return false;
    }
  };

  // Manejar selección de pedidos
  const handleOrderSelection = (orderId) => {
    setSelectedOrders(prev => {
      const newSelection = prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId];
      return newSelection;
    });
  };

  // Seleccionar/deseleccionar todos
  const handleSelectAll = () => {
    if (selectedOrders.length === allDataForCharts.length) {
      setSelectedOrders([]);
    } else {
      const allIds = allDataForCharts.map(order => order.id);
      setSelectedOrders(allIds);
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

  // Limpiar todos los filtros
  const clearAllFilters = () => {
    setSelectedUser('');
    setSelectedProject('');
    setMonthFilter('');
    setReportPeriod('all');
    setSelectedOrders([]);
  };

  return (
    <Box sx={{ 
      p: isMobile ? 2 : 3,
      color: colors.text,
      minHeight: '100vh',
      backgroundColor: colors.background,
      marginTop: isMobile ? '10%' : 3,
    }}>

      <Paper sx={{ 
        p: 3, 
        mb: 3, 
        borderRadius: 2, 
        boxShadow: 2,
        backgroundColor: colors.paper,
        border: `1px solid ${colors.border}`,
        mt: 0
      }}>
        {/* Título principal */}
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            mb: 4, 
            textAlign: 'center',
            color: colors.primary,
            fontWeight: 'bold'
          }}
        >
          Gestión de Reportes
        </Typography>

        {/* Pestañas */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <Tabs 
            value={tab} 
            onChange={(_, v) => setTab(v)} 
            sx={{ 
              '& .MuiTab-root': {
                color: colors.textSecondary,
                '&.Mui-selected': {
                  color: colors.primary,
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: colors.primary,
              }
            }}
          >
            <Tab value="dashboard" label="Dashboard" icon={<DashboardIcon />} />
            <Tab value="reports" label="Reportes" icon={<DescriptionIcon />} />
            <Tab value="conformity" label="Actas" icon={<AssignmentTurnedIn />} />
          </Tabs>
        </Box>

        {/* Filtros */}
        <Grid container spacing={2} sx={{ mb: 4, justifyContent: 'center' }}>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: colors.text }}>Período</InputLabel>
              <Select 
                value={reportPeriod} 
                onChange={(e) => setReportPeriod(e.target.value)} 
                label="Período"
                sx={{
                  color: colors.text,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.border,
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.primary,
                  },
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
                  color: colors.text,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.border,
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.primary,
                  },
                }}
              >
                <MenuItem value="">Todos</MenuItem>
                {filteredClients.map(c => (
                  <MenuItem key={c.id} value={c.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Person fontSize="small" />
                      {c.fullName}
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
                  color: colors.text,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.border,
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.primary,
                  },
                }}
              >
                <MenuItem value="">Todos</MenuItem>
                {projects
                  .filter(p => !selectedUser || p.ownerId === selectedUser)
                  .map(p => (
                    <MenuItem key={p.id} value={p.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DescriptionIcon fontSize="small" />
                        {`${p.costCenter} - ${p.projectNumber}`}
                      </Box>
                    </MenuItem>
                  ))
                }
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              label="Mes"
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
                startAdornment: <CalendarMonth sx={{ mr: 1 }} />,
                sx: {
                  color: colors.text,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.border,
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.primary,
                  }
                }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2} sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              variant="outlined"
              fullWidth
              onClick={clearAllFilters}
              sx={{
                height: '40px',
                borderColor: colors.primary,
                color: colors.primary,
                '&:hover': {
                  backgroundColor: colors.primary,
                  color: colors.paper
                }
              }}
            >
              Limpiar
            </Button>
          </Grid>
        </Grid>

        {/* Dashboard */}
        {tab === 'dashboard' && (
          <Grid container spacing={3} justifyContent="center">
            {/* Tarjetas de estadísticas */}
            <Grid item xs={12}>
              <Grid container spacing={3} justifyContent="center">
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ 
                    p: 3, 
                    borderRadius: 2, 
                    backgroundColor: colors.paper,
                    border: `1px solid ${colors.border}`,
                    textAlign: 'center',
                    height: '100%'
                  }}>
                    <Typography variant="h6" sx={{ color: colors.text, mb: 2 }}>
                      Total Solicitudes
                    </Typography>
                    <Typography variant="h3" fontWeight="bold" sx={{ color: colors.primary, mb: 1 }}>
                      {allDataForCharts.length}
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                      Regulares: {filteredPurchases.length} | Extras: {filteredOrders.length}
                    </Typography>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ 
                    p: 3, 
                    borderRadius: 2, 
                    backgroundColor: colors.paper,
                    border: `1px solid ${colors.border}`,
                    textAlign: 'center',
                    height: '100%'
                  }}>
                    <Typography variant="h6" sx={{ color: colors.text, mb: 2 }}>
                      Monto Total
                    </Typography>
                    <Typography variant="h3" fontWeight="bold" sx={{ color: colors.primary, mb: 1 }}>
                      ${allDataForCharts.reduce((sum, p) => sum + (p.total || 0), 0).toFixed(2)}
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                      CUP
                    </Typography>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ 
                    p: 3, 
                    borderRadius: 2, 
                    backgroundColor: colors.paper,
                    border: `1px solid ${colors.border}`,
                    textAlign: 'center',
                    height: '100%'
                  }}>
                    <Typography variant="h6" sx={{ color: colors.text, mb: 2 }}>
                      Usuarios Activos
                    </Typography>
                    <Typography variant="h3" fontWeight="bold" sx={{ color: colors.primary, mb: 1 }}>
                      {new Set(allDataForCharts.map(p => p.userId)).size}
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                      Este período
                    </Typography>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ 
                    p: 3, 
                    borderRadius: 2, 
                    backgroundColor: colors.paper,
                    border: `1px solid ${colors.border}`,
                    textAlign: 'center',
                    height: '100%'
                  }}>
                    <Typography variant="h6" sx={{ color: colors.text, mb: 2 }}>
                      Completados
                    </Typography>
                    <Typography variant="h3" fontWeight="bold" sx={{ color: colors.primary, mb: 1 }}>
                      {allDataForCharts.filter(p => p.status === 'Completado' || p.status === 'completado').length}
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                      Para actas
                    </Typography>
                  </Card>
                </Grid>
              </Grid>
            </Grid>

            {/* Gráficos */}
            <Grid item xs={12}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    backgroundColor: colors.paper,
                    border: `1px solid ${colors.border}`,
                    textAlign: 'center',
                    height: '100%'
                  }}>
                    <Typography variant="h6" gutterBottom sx={{ color: colors.text, mb: 2 }}>
                      Distribución por Tipo
                    </Typography>
                    <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      {chartData.purchaseByType.length > 0 ? (
                        <PieChart
                          series={[{
                            data: chartData.purchaseByType.map((label, index) => ({
                              id: index,
                              value: chartData.purchaseByTypeData[index],
                              label: label
                            }))
                          }]}
                          width={400}
                          height={300}
                        />
                      ) : (
                        <Alert severity="info" sx={{ width: '100%' }}>
                          No hay datos para mostrar
                        </Alert>
                      )}
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    backgroundColor: colors.paper,
                    border: `1px solid ${colors.border}`,
                    textAlign: 'center',
                    height: '100%'
                  }}>
                    <Typography variant="h6" gutterBottom sx={{ color: colors.text, mb: 2 }}>
                      Tendencia Mensual
                    </Typography>
                    <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                      {chartData.monthlyTrends.length > 0 ? (
                        <LineChart
                          series={[
                            { 
                              data: chartData.monthlyTrends.map(t => t.productos), 
                              label: 'Productos',
                              color: colors.primary
                            },
                            { 
                              data: chartData.monthlyTrends.map(t => t.servicios), 
                              label: 'Servicios',
                              color: colors.secondary
                            },
                            { 
                              data: chartData.monthlyTrends.map(t => t.extras), 
                              label: 'Extras',
                              color: colors.accent
                            }
                          ]}
                          xAxis={[{ 
                            data: chartData.monthlyTrends.map(t => {
                              const [year, month] = t.month.split('-');
                              return `${month}/${year.slice(2)}`;
                            }),
                            scaleType: 'band'
                          }]}
                          height={300}
                          width={500}
                        />
                      ) : (
                        <Alert severity="info" sx={{ width: '100%' }}>
                          No hay datos de tendencias
                        </Alert>
                      )}
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Grid>

            {/* Gráfico adicional: Distribución por usuario */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ 
                p: 2, 
                borderRadius: 2, 
                backgroundColor: colors.paper,
                border: `1px solid ${colors.border}`,
                textAlign: 'center'
              }}>
                <Typography variant="h6" gutterBottom sx={{ color: colors.text, mb: 2 }}>
                  Top Usuarios
                </Typography>
                <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  {chartData.purchaseByUser.length > 0 ? (
                    <BarChart
                      series={[{ 
                        data: chartData.purchaseByUserData 
                      }]}
                      xAxis={[{ 
                        data: chartData.purchaseByUser,
                        scaleType: 'band',
                        tickLabelStyle: {
                          angle: 45,
                          textAnchor: 'start',
                          fontSize: 10
                        }
                      }]}
                      height={300}
                      width={500}
                    />
                  ) : (
                    <Alert severity="info" sx={{ width: '100%' }}>
                      No hay datos de usuarios
                    </Alert>
                  )}
                </Box>
              </Paper>
            </Grid>

            {/* Gráfico adicional: Distribución por estado */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ 
                p: 2, 
                borderRadius: 2, 
                backgroundColor: colors.paper,
                border: `1px solid ${colors.border}`,
                textAlign: 'center'
              }}>
                <Typography variant="h6" gutterBottom sx={{ color: colors.text, mb: 2 }}>
                  Distribución por Estado
                </Typography>
                <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  {chartData.orderByStatus.length > 0 ? (
                    <PieChart
                      series={[{
                        data: chartData.orderByStatus.map((label, index) => ({
                          id: index,
                          value: chartData.orderByStatusData[index],
                          label: label
                        }))
                      }]}
                      width={400}
                      height={300}
                    />
                  ) : (
                    <Alert severity="info" sx={{ width: '100%' }}>
                      No hay datos de estados
                    </Alert>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Reportes */}
        {tab === 'reports' && (
          <>
            {allDataForCharts.length === 0 ? (
              <Alert severity="info" sx={{ textAlign: 'center' }}>
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
                            color: colors.primary,
                            '&.Mui-checked': {
                              color: colors.primary,
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
                    border: `1px solid ${colors.border}`,
                    mb: 3
                  }}
                >
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: colors.border }}>
                        <TableCell sx={{ color: colors.text, fontWeight: 'bold', textAlign: 'center', width: 50 }}>
                          <Checkbox
                            checked={selectedOrders.length === allDataForCharts.length && allDataForCharts.length > 0}
                            indeterminate={selectedOrders.length > 0 && selectedOrders.length < allDataForCharts.length}
                            onChange={handleSelectAll}
                            sx={{
                              color: colors.primary,
                              '&.Mui-checked': {
                                color: colors.primary,
                              },
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: colors.text, fontWeight: 'bold', textAlign: 'center', width: 60 }}>#</TableCell>
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
                              backgroundColor: colors.border,
                            }
                          }}
                        >
                          <TableCell sx={{ textAlign: 'center' }}>
                            <Checkbox
                              checked={selectedOrders.includes(p.id)}
                              onChange={() => handleOrderSelection(p.id)}
                              sx={{
                                color: colors.primary,
                                '&.Mui-checked': {
                                  color: colors.primary,
                                },
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ color: colors.text, textAlign: 'center' }}>{i + 1}</TableCell>
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
                                backgroundColor: colors.primary,
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
                                  p.status === 'Completado' || p.status === 'completado' ? colors.success : 
                                  p.status === 'En proceso' ? colors.warning : colors.error,
                                color: 'white',
                                fontWeight: 'bold'
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                              <Tooltip title="Generar acta">
                                <IconButton 
                                  size="small" 
                                  onClick={() => generateConformity(p)}
                                  disabled={!(p.status === 'Completado' || p.status === 'completado')}
                                  sx={{ 
                                    color: (p.status === 'Completado' || p.status === 'completado') ? colors.primary : colors.textSecondary 
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

                {/* Botones para generar reportes */}
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    startIcon={<PictureAsPdf />}
                    onClick={generateGeneralReport}
                    sx={{
                      backgroundColor: colors.primary,
                      color: colors.paper,
                      px: 4,
                      py: 1.5,
                      '&:hover': {
                        backgroundColor: colors.secondary
                      }
                    }}
                  >
                    Generar PDF General
                  </Button>

                  {selectedOrders.length > 0 && (
                    <Button
                      variant="outlined"
                      startIcon={<PictureAsPdf />}
                      onClick={generateSelectedOrdersReport}
                      sx={{
                        borderColor: colors.primary,
                        color: colors.primary,
                        px: 4,
                        py: 1.5,
                        '&:hover': {
                          backgroundColor: colors.primary,
                          color: colors.paper
                        }
                      }}
                    >
                      Generar PDF Seleccionados ({selectedOrders.length})
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
              <Alert severity="info" sx={{ mb: 3, textAlign: 'center' }}>
                Las actas de conformidad solo pueden generarse para solicitudes con estado "Completado"
              </Alert>
            )}

            {allDataForCharts.filter(p => p.status === 'Completado' || p.status === 'completado').length === 0 ? (
              <Alert severity="warning" sx={{ textAlign: 'center' }}>
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
                    border: `1px solid ${colors.border}`
                  }}
                >
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: colors.border }}>
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
                                backgroundColor: colors.border,
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
                                  backgroundColor: colors.primary,
                                  color: 'white',
                                  fontWeight: 'bold'
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ color: colors.text, fontWeight: 'bold', textAlign: 'center' }}>${(p.total || 0).toFixed(2)}</TableCell>
                            <TableCell sx={{ textAlign: 'center' }}>
                              <Button
                                variant="outlined"
                                startIcon={<AssignmentTurnedIn />}
                                onClick={() => generateConformity(p)}
                                size="small"
                                sx={{
                                  borderColor: colors.primary,
                                  color: colors.primary,
                                  '&:hover': {
                                    backgroundColor: colors.primary,
                                    color: colors.paper
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

      {/* Diálogo para Acta de Conformidad */}
      <Dialog 
        open={openConformity} 
        onClose={() => setOpenConformity(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: colors.paper,
            color: colors.text,
            border: `1px solid ${colors.border}`
          }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: colors.primary, 
          color: colors.paper,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          borderBottom: `1px solid ${colors.border}`
        }}>
          <AssignmentTurnedIn />
          Acta de Conformidad
        </DialogTitle>
        <DialogContent>
          {conformityData && (
            <Box sx={{ mt: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Proyecto"
                    fullWidth
                    value={conformityData.project}
                    onChange={(e) => setConformityData({...conformityData, project: e.target.value})}
                    margin="normal"
                    sx={{
                      mb: 2
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
                      mb: 2
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mt: 2, mb: 3, fontWeight: 'bold' }}>Items</Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: colors.border }}>
                          <TableCell sx={{ fontWeight: 'bold' }}>Descripción</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>Cantidad</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>Precio Unit.</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {conformityData.items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              {item.name || item.service || 'Servicio/Producto'}
                            </TableCell>
                            <TableCell align="right">
                              {item.quantity || 1}
                            </TableCell>
                            <TableCell align="right">
                              ${(item.price || 0).toFixed(2)}
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>
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
                    rows={4}
                    value={conformityData.notes}
                    onChange={(e) => setConformityData({...conformityData, notes: e.target.value})}
                    margin="normal"
                    sx={{
                      mt: 3
                    }}
                    placeholder="Ingrese cualquier nota adicional para el acta..."
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: `1px solid ${colors.border}` }}>
          <Button 
            onClick={() => setOpenConformity(false)}
            sx={{ color: colors.textSecondary }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={() => {
              generateProfessionalConformity(conformityData, addNotification);
              setOpenConformity(false);
            }}
            variant="contained"
            sx={{ 
              backgroundColor: colors.primary,
              color: colors.paper,
              '&:hover': {
                backgroundColor: colors.secondary
              }
            }}
          >
            Generar PDF del Acta
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}