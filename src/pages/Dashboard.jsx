// src/pages/Dashboard/Dashboard.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Avatar,
  LinearProgress,
  Chip,
  Button,
  MenuItem,
  FormControl,
  Select,
  useMediaQuery,
  alpha,
  Stack,
  Tooltip,
  CircularProgress,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Assignment,
  People,
  AttachMoney,
  CheckCircle,
  Pending,
  Cancel,
  Download,
  Refresh,
  Warning,
  Error,
  Timeline as TimelineIcon,
  DataUsage,
  Assessment,
  Dashboard as DashboardIcon,
  Info,
  Store,
  Build,
  LocalShipping
} from '@mui/icons-material';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
// En la sección de importaciones de recharts
import { 
  LineChart as RechartsLineChart, 
  BarChart as RechartsBarChart, 
  Bar, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer, 
  Line, 
  Area
} from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// ============================================================================
// HOOK useLocalStorage 
// ============================================================================
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

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================
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

const getProjectName = (projectId, userId) => {
  try {
    if (!projectId || projectId === 'extra') return 'Pedido Extra';
    
    const userProjects = JSON.parse(localStorage.getItem(`SiPP_projects_${userId}`) || '[]');
    const project = userProjects.find(p => p.id === projectId);
    
    if (project) {
      return `${project.costCenter} - ${project.projectNumber}: ${project.name}`;
    }
    
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

// ============================================================================
// UTILS PARA EXPORTAR PDF
// ============================================================================
const exportToPDF = (data, chartType) => {
  const doc = new jsPDF();
  
  // Configuración inicial
  doc.setFontSize(16);
  doc.setTextColor(40, 40, 40);
  doc.text('Reporte del Dashboard - Sistema SiPP', 20, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generado el: ${new Date().toLocaleDateString('es-ES')}`, 20, 30);
  doc.text(`Tipo de gráfico: ${chartType}`, 20, 35);
  
  // Datos del gráfico
  let yPos = 45;
  
  if (chartType === 'Tendencia de Pedidos') {
    doc.setFontSize(12);
    doc.text('Tendencia de Pedidos (Últimos 12 meses)', 20, yPos);
    yPos += 10;
    
    doc.autoTable({
      startY: yPos,
      head: [['Mes', 'Pedidos Totales', 'Completados', 'Monto Total']],
      body: data.map(item => [
        item.label,
        item.pedidos,
        item.completados,
        `$${item.montoTotal.toLocaleString()}`
      ]),
      theme: 'grid',
      headStyles: { fillColor: [78, 1, 1] },
      margin: { top: 10 }
    });
  } else if (chartType === 'Top Productos') {
    doc.setFontSize(12);
    doc.text('Productos Más Solicitados', 20, yPos);
    yPos += 10;
    
    const total = data.reduce((sum, item) => sum + item.value, 0);
    doc.autoTable({
      startY: yPos,
      head: [['Producto', 'Cantidad', 'Porcentaje']],
      body: data.map(item => [
        item.name,
        item.value,
        `${((item.value / total) * 100).toFixed(1)}%`
      ]),
      theme: 'grid',
      headStyles: { fillColor: [60, 80, 112] }
    });
  } else if (chartType === 'Pedidos por Tipo') {
    doc.setFontSize(12);
    doc.text('Distribución de Pedidos por Tipo', 20, yPos);
    yPos += 10;
    
    doc.autoTable({
      startY: yPos,
      head: [['Tipo', 'Cantidad', 'Monto Total']],
      body: data.map(item => [
        item.tipo,
        item.cantidad,
        `$${item.monto.toLocaleString()}`
      ]),
      theme: 'grid',
      headStyles: { fillColor: [210, 180, 140] }
    });
  }
  
  // Guardar PDF
  doc.save(`reporte_dashboard_${chartType.toLowerCase().replace(/ /g, '_')}_${Date.now()}.pdf`);
};

// ============================================================================
// COMPONENTE PRINCIPAL DASHBOARD
// ============================================================================
export default function DashboardAnalitico() {
  const { darkMode, theme } = useTheme();
  const { currentUser } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [selectedChart, setSelectedChart] = useState('');

  // Hook para detectar si el sidebar está expandido
  const [sidebarExpanded, setSidebarExpanded] = useState(() => {
    const saved = localStorage.getItem('sidebar-expanded');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Actualizar estado del sidebar cuando cambie en localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('sidebar-expanded');
      if (saved !== null) {
        setSidebarExpanded(JSON.parse(saved));
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // ==========================================================================
  // PALETA DE COLORES MEJORADA
  // ==========================================================================
  const colors = {
    light: {
      borgundy: '#4E0101',
      tan: '#d2b48c',
      sapphire: '#3C5070',
      swanWhite: '#F5F0E9',
      shellstone: '#D9CBC2',
      background: '#F5F0E9',
      paper: '#FFFFFF',
      text: '#4E0101',
      textSecondary: '#3C5070',
      success: '#4caf50',
      warning: '#ff9800',
      error: '#f44336',
      info: '#2196f3',
      main: '#DFDEBE',
    },
    dark: {
      borgundy: '#4E0101',
      tan: '#A78B6F',
      sapphire: '#4A6388',
      swanWhite: '#2D3748',
      shellstone: '#4A5568',
      background: '#1a1a2e',
      paper: '#16213e',
      text: '#F7FAFC',
      textSecondary: '#E2E8F0',
      success: '#2e7d32',
      warning: '#ed6c02',
      error: '#d32f2f',
      info: '#1976d2'
    }
  };
  
  const currentColors = darkMode ? colors.dark : colors.light;

  // ==========================================================================
  // ESTADOS Y DATOS
  // ==========================================================================
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [purchases] = useLocalStorage('OASiS_purchases', []);
  const [specialOrders] = useLocalStorage('OASiS_special_orders', []);
  const [catalogs] = useLocalStorage('OASiS_catalogs', []);
  const [messages] = useLocalStorage('OASiS_messages', []);
  const [allProjects, setAllProjects] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  // ==========================================================================
  // FUNCIÓN PARA CALCULAR EL MARGEN IZQUIERDO BASADO EN EL SIDEBAR
  // ==========================================================================
  const getSidebarMargin = () => {
    if (isMobile) {
      return 0; // En móvil, el sidebar está oculto
    }
    
    if (isTablet) {
      return sidebarExpanded ? 100 : 80; // En tablet, tamaño variable
    }
    
    // En desktop
    return sidebarExpanded ? 1 : 80;
  };

  const sidebarMargin = getSidebarMargin();

  // ==========================================================================
  // CARGAR DATOS COMPLETOS
  // ==========================================================================
  useEffect(() => {
    const loadAllData = () => {
      try {
        // Cargar usuarios
        const users = JSON.parse(localStorage.getItem('SiPP_users') || '[]');
        setAllUsers(users);
        
        // Cargar todos los proyectos
        const allProjectsData = [];
        users.forEach(user => {
          const userProjects = JSON.parse(localStorage.getItem(`SiPP_projects_${user.id}`) || '[]');
          allProjectsData.push(...userProjects.map(p => ({
            ...p,
            ownerName: getUserName(p.ownerId)
          })));
        });
        setAllProjects(allProjectsData);
        
        // Procesar datos del dashboard
        processDashboardData();
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadAllData();
    
    // Escuchar cambios en localStorage
    const handleStorageChange = () => {
      loadAllData();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // ==========================================================================
  // PROCESAR DATOS PARA DASHBOARD
  // ==========================================================================
  const processDashboardData = () => {
    // Combinar todos los pedidos
    const allOrders = [...purchases, ...specialOrders];
    
    // 1. ESTADÍSTICAS POR TIPO DE PEDIDO
    const typeStats = {
      productos: { count: 0, total: 0, items: [] },
      servicios: { count: 0, total: 0, items: [] },
      extras: { count: 0, total: 0, items: [] }
    };
    
    // 2. CONTADOR DE PRODUCTOS MÁS SOLICITADOS
    const productCounter = {};
    const serviceCounter = {};
    
    // 3. ESTADÍSTICAS POR ESTADO
    const statusStats = {
      Pendiente: 0,
      'En proceso': 0,
      Completado: 0,
      Denegado: 0,
      Archivado: 0
    };
    
    // 4. TENDENCIAS MENSUALES (últimos 12 meses)
    const last12Months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return {
        key: `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`,
        label: date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
        mesCompleto: date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
        productos: 0,
        servicios: 0,
        extras: 0,
        total: 0,
        pedidos: 0,
        completados: 0,
        pendientes: 0,
        montoTotal: 0
      };
    }).reverse();
    
    // 5. PROCESAR CADA PEDIDO
    allOrders.forEach(order => {
      const orderDate = new Date(order.date);
      const monthKey = `${orderDate.getFullYear()}-${(orderDate.getMonth() + 1).toString().padStart(2, '0')}`;
      const monthData = last12Months.find(m => m.key === monthKey);
      
      if (monthData) {
        monthData.pedidos++;
        monthData.montoTotal += order.total || 0;
        
        if (order.status === 'Completado') {
          monthData.completados++;
        } else if (order.status === 'Pendiente') {
          monthData.pendientes++;
        }
      }
      
      // Determinar tipo
      if (order.type === 'special') {
        typeStats.extras.count++;
        typeStats.extras.total += order.total || 0;
        typeStats.extras.items.push(order);
        if (monthData) {
          monthData.extras += order.total || 0;
          monthData.total += order.total || 0;
        }
      } else {
        const hasProducts = order.items?.some(item => 
          item.dataType === 'products' || (!item.dataType && item.name)
        );
        const hasServices = order.items?.some(item => 
          item.dataType === 'services' || (!item.dataType && item.service)
        );
        
        if (hasProducts) {
          typeStats.productos.count++;
          typeStats.productos.total += order.total || 0;
          typeStats.productos.items.push(order);
          
          // Contar productos individuales
          order.items?.forEach(item => {
            if (item.dataType === 'products' || (!item.dataType && item.name)) {
              const productName = item.name;
              productCounter[productName] = (productCounter[productName] || 0) + (item.quantity || 1);
            }
          });
          
          if (monthData) {
            monthData.productos += order.total || 0;
            monthData.total += order.total || 0;
          }
        }
        
        if (hasServices) {
          typeStats.servicios.count++;
          typeStats.servicios.total += order.total || 0;
          typeStats.servicios.items.push(order);
          
          // Contar servicios individuales
          order.items?.forEach(item => {
            if (item.dataType === 'services' || (!item.dataType && item.service)) {
              const serviceName = item.service;
              serviceCounter[serviceName] = (serviceCounter[serviceName] || 0) + (item.quantity || 1);
            }
          });
          
          if (monthData) {
            monthData.servicios += order.total || 0;
            monthData.total += order.total || 0;
          }
        }
      }
      
      // Estadísticas por estado
      statusStats[order.status || 'Pendiente']++;
    });
    
    // 6. CALCULAR PROMEDIO MÓVIL DE 3 MESES PARA TENDENCIA
    const trendDataWithMovingAverage = last12Months.map((month, index, array) => {
      let movingAvg = 0;
      let movingAvgMonto = 0;
      
      // Calcular promedio de los últimos 3 meses
      const startIndex = Math.max(0, index - 2);
      const endIndex = index + 1;
      const slice = array.slice(startIndex, endIndex);
      
      if (slice.length > 0) {
        movingAvg = Math.round(slice.reduce((sum, m) => sum + m.pedidos, 0) / slice.length);
        movingAvgMonto = Math.round(slice.reduce((sum, m) => sum + m.montoTotal, 0) / slice.length);
      }
      
      return {
        ...month,
        movingAverage: movingAvg,
        movingAverageMonto: movingAvgMonto,
        tasaCompletados: month.pedidos > 0 ? (month.completados / month.pedidos) * 100 : 0,
        crecimiento: index > 0 ? 
          ((month.pedidos - array[index-1].pedidos) / array[index-1].pedidos * 100) : 0
      };
    });
    
    // 7. TOP 5 PRODUCTOS MÁS SOLICITADOS
    const topProducts = Object.entries(productCounter)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, value: count }));
    
    // Sumar "otros" productos
    const otherProducts = Object.entries(productCounter)
      .sort(([,a], [,b]) => b - a)
      .slice(5)
      .reduce((sum, [, count]) => sum + count, 0);
    
    if (otherProducts > 0) {
      topProducts.push({ name: 'Otros', value: otherProducts });
    }
    
    // 8. DATOS PARA GRÁFICO DE BARRAS 3D
    const barChartData = [
      {
        tipo: 'Productos',
        cantidad: typeStats.productos.count,
        monto: typeStats.productos.total,
        color: currentColors.borgundy,
        icon: <Store />
      },
      {
        tipo: 'Servicios',
        cantidad: typeStats.servicios.count,
        monto: typeStats.servicios.total,
        color: currentColors.sapphire,
        icon: <Build />
      },
      {
        tipo: 'Extras',
        cantidad: typeStats.extras.count,
        monto: typeStats.extras.total,
        color: currentColors.tan,
        icon: <LocalShipping />
      }
    ];
    
    // 9. DATOS PARA GRÁFICO DE PASTEL MODERNO
    const pieChartData = topProducts.map((item, index) => ({
      name: item.name.length > 15 ? item.name.substring(0, 12) + '...' : item.name,
      value: item.value,
      color: [
        currentColors.borgundy,
        currentColors.sapphire,
        currentColors.tan,
        alpha(currentColors.borgundy, 0.7),
        alpha(currentColors.sapphire, 0.7),
        currentColors.shellstone
      ][index % 6],
      fullName: item.name
    }));
    
    // 10. PEDIDOS RECIENTES (últimos 6 pedidos)
    const recentOrders = allOrders
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 6)
      .map(order => ({
        id: order.id,
        numero: `PDD-${order.id.toString().padStart(3, '0')}`,
        usuario: getUserName(order.userId),
        proyecto: getProjectName(order.projectId, order.userId),
        tipo: order.type === 'special' ? 'Extra' : getOrderType(order),
        monto: order.total || 0,
        estado: order.status || 'Pendiente',
        fecha: new Date(order.date).toLocaleDateString('es-ES'),
        prioridad: order.priority || 'Media'
      }));
    
    // 11. PROYECTOS MÁS ACTIVOS (por pedidos)
    const projectActivity = {};
    allOrders.forEach(order => {
      if (order.projectId && order.projectId !== 'extra') {
        const projectName = getProjectName(order.projectId, order.userId);
        projectActivity[projectName] = (projectActivity[projectName] || 0) + 1;
      }
    });
    
    const activeProjects = Object.entries(projectActivity)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 6)
      .map(([nombre, pedidos]) => {
        const project = allProjects.find(p => 
          `${p.costCenter} - ${p.projectNumber}: ${p.name}` === nombre
        );
        return {
          nombre: nombre.split(':')[0],
          nombreCompleto: nombre,
          jefe: project?.ownerName || 'N/A',
          pedidos,
          presupuesto: project?.budget || 0,
          gastado: allOrders
            .filter(o => o.projectId === project?.id)
            .reduce((sum, o) => sum + (o.total || 0), 0)
        };
      });
    
    // 12. ESTADÍSTICAS GENERALES
    const totalPedidos = allOrders.length;
    const pedidosPendientes = statusStats.Pendiente;
    const pedidosCompletados = statusStats.Completado;
    const pedidosProceso = statusStats['En proceso'];
    
    // Calcular presupuestos
    const presupuestoTotal = allProjects.reduce((sum, p) => sum + (parseFloat(p.budget) || 0), 0);
    const presupuestoUtilizado = allOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const presupuestoDisponible = Math.max(0, presupuestoTotal - presupuestoUtilizado);
    
    // Mensajes no leídos
    const mensajesNoLeidos = messages.filter(m => !m.read).length;
    
    // 13. ALERTAS Y NOTIFICACIONES
    const alerts = [];
    
    if (pedidosPendientes > 10) {
      alerts.push({
        tipo: 'warning',
        mensaje: `${pedidosPendientes} pedidos pendientes requieren atención`,
        icon: <Warning />
      });
    }
    
    // Contar pedidos en proceso REALES
    const pedidosEnProcesoReales = allOrders.filter(o => 
      o.status === 'En proceso' || 
      (o.status !== 'Completado' && o.status !== 'Pendiente' && o.status !== 'Denegado' && o.status !== 'Archivado')
    ).length;
     
    const proyectosSinPedidos = allProjects.filter(p => 
      !allOrders.some(o => o.projectId === p.id)
    ).length;
    
    if (proyectosSinPedidos > 5) {
      alerts.push({
        tipo: 'info',
        mensaje: `${proyectosSinPedidos} proyectos sin pedidos`,
        icon: <Info />
      });
    }
    
    // 14. EFICIENCIA POR ÁREA/DEPARTAMENTO
    const areaEfficiency = {};
    allOrders.forEach(order => {
      const user = allUsers.find(u => u.id === order.userId);
      if (user && user.area) {
        if (!areaEfficiency[user.area]) {
          areaEfficiency[user.area] = { pedidos: 0, completados: 0, total: 0 };
        }
        areaEfficiency[user.area].pedidos++;
        areaEfficiency[user.area].total += order.total || 0;
        if (order.status === 'Completado') {
          areaEfficiency[user.area].completados++;
        }
      }
    });
    
    const areaEfficiencyData = Object.entries(areaEfficiency)
      .map(([area, stats]) => ({
        area,
        eficiencia: stats.pedidos > 0 ? (stats.completados / stats.pedidos) * 100 : 0,
        pedidos: stats.pedidos,
        monto: stats.total
      }))
      .sort((a, b) => b.eficiencia - a.eficiencia)
      .slice(0, 5);
    
    // ========================================================================
    // CONSOLIDAR TODOS LOS DATOS
    // ========================================================================
    setDashboardData({
      // Estadísticas principales
      stats: {
        totalPedidos,
        pedidosPendientes,
        pedidosCompletados,
        pedidosProceso: pedidosEnProcesoReales,
        presupuestoUtilizado,
        presupuestoDisponible,
        presupuestoTotal,
        usuariosActivos: new Set(allOrders.map(o => o.userId)).size,
        proyectosActivos: new Set(allOrders.filter(o => o.projectId && o.projectId !== 'extra').map(o => o.projectId)).size,
        mensajesNoLeidos,
        alertas: alerts.length,
      },
      
      // Datos para gráficos
      barChartData,
      pieChartData,
      trendLineData: trendDataWithMovingAverage,
      monthlyData: last12Months.map(m => ({
        mes: m.label,
        productos: m.productos,
        servicios: m.servicios,
        extras: m.extras,
        total: m.total,
        pedidos: m.pedidos,
        completados: m.completados
      })),
      
      // Listas y tablas
      recentOrders,
      activeProjects,
      alerts,
      areaEfficiencyData,
      
      // Estadísticas detalladas
      typeStats,
      statusStats,
      
      // Datos crudos para filtros
      allOrders,
      allProjects,
      allUsers
    });
  };

  // ==========================================================================
  // FILTRAR DATOS SEGÚN ROL
  // ==========================================================================
  const filteredData = useMemo(() => {
    if (!dashboardData) return null;
    
    const data = { ...dashboardData };
    
    switch(currentUser?.role) {
      case 'admin':
        return data;
        
      case 'comercial':
        return {
          ...data,
          stats: {
            ...data.stats,
            presupuestoTotal: null,
            presupuestoDisponible: null
          },
          activeProjects: data.activeProjects.map(p => ({
            ...p,
            presupuesto: null,
            gastado: null
          }))
        };
        
      case 'user':
        const userOrders = [...purchases, ...specialOrders].filter(o => o.userId === currentUser.id);
        const userProjects = allProjects.filter(p => p.ownerId === currentUser.id);
        
        const userPresupuestoUtilizado = userOrders.reduce((sum, o) => sum + (o.total || 0), 0);
        const userPresupuestoTotal = userProjects.reduce((sum, p) => sum + (parseFloat(p.budget) || 0), 0);
        const userPresupuestoDisponible = Math.max(0, userPresupuestoTotal - userPresupuestoUtilizado);
        
        return {
          ...data,
          stats: {
            totalPedidos: userOrders.length,
            pedidosPendientes: userOrders.filter(o => o.status === 'Pendiente').length,
            pedidosCompletados: userOrders.filter(o => o.status === 'Completado').length,
            pedidosProceso: userOrders.filter(o => 
              o.status === 'En proceso' || 
              (o.status !== 'Completado' && o.status !== 'Pendiente' && o.status !== 'Denegado' && o.status !== 'Archivado')
            ).length,
            presupuestoUtilizado: userPresupuestoUtilizado,
            presupuestoDisponible: userPresupuestoDisponible,
            presupuestoTotal: userPresupuestoTotal,
            usuariosActivos: 1,
            proyectosActivos: userProjects.length,
            mensajesNoLeidos: messages.filter(m => !m.read && m.userId === currentUser.id).length,
            alertas: 0
          },
          recentOrders: data.recentOrders.filter(ro => 
            userOrders.some(uo => uo.id === ro.id)
          ),
          activeProjects: data.activeProjects.filter(ap => 
            userProjects.some(up => up.ownerId === currentUser.id)
          )
        };
        
      default:
        return data;
    }
  }, [dashboardData, currentUser, purchases, specialOrders, allProjects, messages]);

  // ==========================================================================
  // FUNCIONES DE EXPORTACIÓN
  // ==========================================================================
  const handleExportChart = (chartType) => {
    if (!filteredData) return;
    
    switch(chartType) {
      case 'Tendencia de Pedidos':
        exportToPDF(filteredData.trendLineData, chartType);
        break;
      case 'Top Productos':
        exportToPDF(filteredData.pieChartData, chartType);
        break;
      case 'Pedidos por Tipo':
        exportToPDF(filteredData.barChartData, chartType);
        break;
    }
    
    setExportDialogOpen(false);
  };

  // ==========================================================================
  // COMPONENTES DE UI
  // ==========================================================================
  
  // 1. Tarjeta de estadística RESPONSIVA
  
  // ==========================================================================
// COMPONENTES DE UI
// ==========================================================================

// 1. Tarjeta de estadística RESPONSIVA y ADAPTABLE al sidebar
const StatCard = ({ title, value, icon, change, color, subtitle, onClick }) => {
  // Calcular tamaño dinámico basado en el estado del sidebar
  const getCardSize = () => {
    if (isMobile) {
      return {
        minHeight: 100,
        fontSize: '0.8rem',
        avatarSize: 36,
        padding: 1.5
      };
    }
    
    if (isTablet) {
      return {
        minHeight: sidebarExpanded ? 120 : 140,
        fontSize: sidebarExpanded ? '0.8rem' : '0.9rem',
        avatarSize: sidebarExpanded ? 40 : 44,
        padding: sidebarExpanded ? 1.5 : 2
      };
    }
    
    // Desktop
    return {
      minHeight: sidebarExpanded ? 130 : 150,
      fontSize: sidebarExpanded ? '0.85rem' : '1rem',
      avatarSize: sidebarExpanded ? 40 : 48,
      padding: sidebarExpanded ? 2.8 : 2.5,
    };
  };

  const cardSize = getCardSize();

  return (
    <Card 
      onClick={onClick}
      sx={{ 
        height: '100%',
        minHeight: cardSize.minHeight,
        background: `linear-gradient(135deg, ${alpha(color || currentColors.borgundy, 0.15)} 0%, ${alpha(currentColors.sapphire, 0.1)} 100%)`,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${alpha(currentColors.shellstone, 0.3)}`,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        flex: '1 1 auto',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 20px ${alpha(color || currentColors.borgundy, 0.2)}`,
          borderColor: alpha(color || currentColors.borgundy, 0.5)
        } : {},
      }}
    >
      <Box sx={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: 60,
        height: 60,
        background: `linear-gradient(135deg, ${alpha(color || currentColors.borgundy, 0.2)} 0%, transparent 70%)`,
        borderBottomLeftRadius: 50,
        transition: 'all 0.3s ease'
      }} />
      
      <CardContent sx={{ 
        p: cardSize.padding, 
        flexGrow: 1,
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          mb: 1.5,
          flex: 1
        }}>
          <Box sx={{ 
            flex: 1, 
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <Box>
              <Typography 
                variant="caption"
                color={currentColors.textSecondary} 
                gutterBottom
                sx={{ 
                  fontSize: isMobile ? '0.7rem' : (sidebarExpanded ? '0.75rem' : '0.85rem'),
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  lineHeight: 1.2,
                  display: 'block'
                }}
              >
                {title}
              </Typography>
              <Typography 
                variant="h6" 
                fontWeight="bold" 
                color={currentColors.text}
                sx={{ 
                  fontSize: isMobile ? '1.1rem' : (sidebarExpanded ? '1.3rem' : '1.5rem'),
                  lineHeight: 1.2,
                  mb: 0.5,
                  transition: 'font-size 0.3s ease'
                }}
              >
                {value}
              </Typography>
            </Box>
            
            {subtitle && (
              <Typography 
                variant="caption" 
                color={currentColors.textSecondary}
                sx={{ 
                  fontSize: isMobile ? '0.65rem' : (sidebarExpanded ? '0.7rem' : '0.8rem'),
                  display: 'block',
                  mt: 'auto',
                  pt: 0.5
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          
          <Avatar sx={{ 
            bgcolor: alpha(color || currentColors.borgundy, 0.1),
            color: color || currentColors.borgundy,
            width: cardSize.avatarSize,
            height: cardSize.avatarSize,
            minWidth: cardSize.avatarSize,
            minHeight: cardSize.avatarSize,
            border: `2px solid ${alpha(color || currentColors.borgundy, 0.2)}`,
            ml: 1,
            transition: 'all 0.3s ease'
          }}>
            {React.cloneElement(icon, { 
              fontSize: isMobile ? "small" : (sidebarExpanded ? "medium" : "large"),
              sx: { transition: 'font-size 0.3s ease' }
            })}
          </Avatar>
        </Box>
        
        {change !== undefined && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 0.5,
            mt: 1.5,
            pt: 1,
            borderTop: `1px solid ${alpha(currentColors.shellstone, 0.2)}`
          }}>
            {change > 0 ? (
              <TrendingUp sx={{ 
                color: currentColors.success, 
                fontSize: isMobile ? 14 : (sidebarExpanded ? 14 : 16),
                transition: 'font-size 0.3s ease'
              }} />
            ) : (
              <TrendingDown sx={{ 
                color: currentColors.error, 
                fontSize: isMobile ? 14 : (sidebarExpanded ? 14 : 16),
                transition: 'font-size 0.3s ease'
              }} />
            )}
            <Typography 
              variant="caption" 
              color={change > 0 ? currentColors.success : currentColors.error}
              sx={{ 
                fontSize: isMobile ? '0.6rem' : (sidebarExpanded ? '0.65rem' : '0.75rem'),
                fontWeight: 500,
                transition: 'font-size 0.3s ease'
              }}
            >
              {change > 0 ? '+' : ''}{change}%
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// ==========================================================================
// ESTADÍSTICAS PRINCIPALES - RESPONSIVO Y ADAPTABLE AL SIDEBAR
// ==========================================================================
const renderStatsCards = () => (
  <Box sx={{ 
    mb: isMobile ? 2 : 3,
    width: '100%'
  }}>
    <Grid 
      container 
      spacing={isMobile ? 1 : (sidebarExpanded ? 1.5 : 2)}
      sx={{
        transition: 'gap 0.3s ease'
      }}
    >
      {filteredData && (
        <>
          {/* Grid responsivo que se adapta al sidebar */}
          <Grid item xs={6} sm={4} md={sidebarExpanded ? 2.4 : 2.4}>
            <StatCard
              title="Total Pedidos"
              value={filteredData.stats.totalPedidos}
              icon={<ShoppingCart />}
              color={currentColors.borgundy}
              subtitle="Todos los tipos"
            />
          </Grid>
          
          <Grid item xs={6} sm={4} md={sidebarExpanded ? 2.4 : 2.4}>
            <StatCard
              title="Pendientes"
              value={filteredData.stats.pedidosPendientes}
              icon={<Pending />}
              color={currentColors.warning}
              subtitle="Requieren atención"
            />
          </Grid>
          
          <Grid item xs={6} sm={4} md={sidebarExpanded ? 2.4 : 2.4}>
            <StatCard
              title="Completados"
              value={filteredData.stats.pedidosCompletados}
              icon={<CheckCircle />}
              color={currentColors.success}
              subtitle="Finalizados exitosamente"
            />
          </Grid>
          
          <Grid item xs={6} sm={4} md={sidebarExpanded ? 2.4 : 2.4}>
            <StatCard
              title="En Proceso"
              value={filteredData.stats.pedidosProceso}
              icon={<Build />}
              color={currentColors.info}
              subtitle="En ejecución"
            />
          </Grid>
          
          <Grid item xs={6} sm={4} md={sidebarExpanded ? 2.4 : 2.4}>
            <StatCard
              title="Presupuesto"
              value={`$${filteredData.stats.presupuestoUtilizado?.toLocaleString() || '0'}`}
              icon={<AttachMoney />}
              color={currentColors.sapphire}
              subtitle={`de $${filteredData.stats.presupuestoTotal?.toLocaleString() || '0'}`}
            />
          </Grid>
        </>
      )}
    </Grid>
  </Box>
);

  // 2. Componente de estado de pedido
  const EstadoPedido = ({ estado }) => {
    const config = {
      Completado: { 
        color: currentColors.success, 
        icon: <CheckCircle fontSize="small" />, 
        label: 'Completado' 
      },
      Pendiente: { 
        color: currentColors.warning, 
        icon: <Pending fontSize="small" />, 
        label: 'Pendiente' 
      },
      'En proceso': { 
        color: currentColors.info, 
        icon: <Build fontSize="small" />, 
        label: 'En proceso' 
      },
      Denegado: { 
        color: currentColors.error, 
        icon: <Cancel fontSize="small" />, 
        label: 'Denegado' 
      },
      Archivado: { 
        color: currentColors.textSecondary, 
        icon: <Assignment fontSize="small" />, 
        label: 'Archivado' 
      },
    };
    
    const { color, icon, label } = config[estado] || config.Pendiente;
    
    return (
      <Chip
        icon={icon}
        label={label}
        size="small"
        sx={{
          backgroundColor: alpha(color, 0.1),
          color: color,
          border: `1px solid ${alpha(color, 0.3)}`,
          fontWeight: 500,
          fontSize: isMobile ? '0.65rem' : '0.75rem',
          height: isMobile ? 24 : 28
        }}
      />
    );
  };

  // 3. Gráfico de barras 3D personalizado
  const render3DBarChart = () => {
    if (!filteredData?.barChartData) return null;
    
    // Ajustar tamaño del gráfico según sidebar y pantalla
    const chartHeight = isMobile ? 250 : isTablet ? 300 : 350;
    
    return (
      <Box sx={{ height: chartHeight, width: '100%', position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart
            data={filteredData.barChartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <defs>
              {filteredData.barChartData.map((entry, index) => (
                <linearGradient
                  key={`gradient-${index}`}
                  id={`gradient-${index}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={entry.color} stopOpacity={0.8} />
                  <stop offset="100%" stopColor={entry.color} stopOpacity={0.4} />
                </linearGradient>
              ))}
              
              <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="3" dy="3" stdDeviation="3" floodOpacity="0.2" />
              </filter>
            </defs>
            
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={alpha(currentColors.sapphire, 0.1)} 
              vertical={false}
            />
            
            <XAxis 
              dataKey="tipo" 
              stroke={currentColors.textSecondary}
              fontSize={isMobile ? 10 : 12}
              tickLine={false}
              axisLine={false}
            />
            
            <YAxis 
              stroke={currentColors.textSecondary}
              fontSize={isMobile ? 10 : 12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value.toLocaleString()}
            />
            
            <RechartsTooltip 
              contentStyle={{
                backgroundColor: currentColors.paper,
                border: `1px solid ${alpha(currentColors.shellstone, 0.3)}`,
                borderRadius: 8,
                fontSize: isMobile ? 10 : 12,
                color: currentColors.text,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
              formatter={(value, name) => {
                if (name === 'cantidad') return [`${value} pedidos`, 'Cantidad'];
                if (name === 'monto') return [`$${value.toLocaleString()}`, 'Monto Total'];
                return [value, name];
              }}
              labelStyle={{ fontWeight: 'bold', color: currentColors.borgundy }}
            />
            
            <Legend 
              wrapperStyle={{ 
                fontSize: isMobile ? 10 : 12,
                paddingTop: 10
              }}
            />
            
            <Bar 
              dataKey="cantidad" 
              name="Cantidad de Pedidos"
              radius={[6, 6, 0, 0]}
              maxBarSize={isMobile ? 40 : 60}
              filter="url(#shadow)"
            >
              {filteredData.barChartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`url(#gradient-${index})`}
                  stroke={alpha(entry.color, 0.8)}
                  strokeWidth={1}
                />
              ))}
            </Bar>
            
            <Bar 
              dataKey="monto" 
              name="Monto Total (CUP)"
              radius={[4, 4, 0, 0]}
              maxBarSize={isMobile ? 30 : 40}
              fill={alpha(currentColors.borgundy, 0.3)}
              yAxisId="right"
            />
          </RechartsBarChart>
        </ResponsiveContainer>
      </Box>
    );
  };

  // 4. Gráfico de pastel moderno con etiquetas dentro
  const renderModernPieChart = () => {
    if (!filteredData?.pieChartData || filteredData.pieChartData.length === 0) {
      return (
        <Box sx={{ 
          height: 200,
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 2
        }}>
          <Store sx={{ 
            fontSize: 60, 
            color: currentColors.shellstone,
            opacity: 0.5 
          }} />
          <Typography 
            variant="body2" 
            color={currentColors.textSecondary}
            align="center"
            sx={{ px: 2 }}
          >
            No hay datos de productos solicitados
          </Typography>
        </Box>
      );
    }
    
    // Ajustar tamaño del gráfico según sidebar y pantalla
    const chartHeight = isMobile ? 250 : isTablet ? 300 : 350;
    
    return (
      <Box sx={{ height: chartHeight, width: '100%', position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPieChart>
            <Pie
              data={filteredData.pieChartData}
              cx="50%"
              cy="50%"
              innerRadius={isMobile ? 40 : 60}
              outerRadius={isMobile ? 80 : 90}
              paddingAngle={1}
              dataKey="value"
              label={({ name, percent }) => 
                percent > 0.05 ? `${name}\n${(percent * 100).toFixed(1)}%` : ''
              }
              labelLine={false}
            >
              {filteredData.pieChartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  stroke={currentColors.paper}
                  strokeWidth={2}
                />
              ))}
            </Pie>
            
            <RechartsTooltip 
              formatter={(value, name, props) => [
                `${value} unidades (${((value / filteredData.pieChartData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%)`,
                props.payload.fullName || name
              ]}
              contentStyle={{
                backgroundColor: currentColors.paper,
                border: `1px solid ${alpha(currentColors.shellstone, 0.3)}`,
                borderRadius: 8,
                fontSize: isMobile ? 10 : 12,
                color: currentColors.text,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            />
          </RechartsPieChart>
        </ResponsiveContainer>
        
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
            background: `radial-gradient(circle, ${alpha(currentColors.swanWhite, 0.9)} 0%, transparent 70%)`,
            borderRadius: '50%',
            width: isMobile ? 70 : 100,
            height: isMobile ? 70 : 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
          }}
        >
          <Typography 
            variant="caption" 
            color={currentColors.textSecondary}
            sx={{ 
              fontSize: isMobile ? '0.6rem' : '0.7rem',
              fontWeight: 500
            }}
          >
            Total
          </Typography>
          <Typography 
            variant={isMobile ? "h6" : "h5"} 
            fontWeight="bold"
            color={currentColors.text}
            sx={{ lineHeight: 1 }}
          >
            {filteredData.pieChartData.reduce((sum, item) => sum + item.value, 0)}
          </Typography>
          <Typography 
            variant="caption" 
            color={currentColors.textSecondary}
            sx={{ fontSize: isMobile ? '0.6rem' : '0.7rem' }}
          >
            unidades
          </Typography>
        </Box>
      </Box>
    );
  };

  // 5. Gráfico de tendencia mensual
  const renderTrendLineChart = () => {
    if (!filteredData?.trendLineData || filteredData.trendLineData.length === 0) {
      return (
        <Box sx={{ 
          height: 300,
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 2
        }}>
          <TimelineIcon sx={{ 
            fontSize: 64, 
            color: currentColors.shellstone,
            opacity: 0.5 
          }} />
          <Typography 
            variant="body2" 
            color={currentColors.textSecondary}
            align="center"
            sx={{ px: 2 }}
          >
            No hay datos suficientes para mostrar tendencia
          </Typography>
        </Box>
      );
    }
    
    // Ajustar tamaño del gráfico según sidebar y pantalla
    const chartHeight = isMobile ? 300 : isTablet ? 350 : 400;
    
    return (
      <Box sx={{ height: chartHeight, width: '100%', position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart
            data={filteredData.trendLineData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <defs>
              <linearGradient id="colorPedidos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={currentColors.borgundy} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={currentColors.borgundy} stopOpacity={0.1}/>
              </linearGradient>
              
              <linearGradient id="colorMovingAvg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={currentColors.sapphire} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={currentColors.sapphire} stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={alpha(currentColors.sapphire, 0.1)} 
              vertical={false}
            />
            
            <XAxis 
              dataKey="label" 
              stroke={currentColors.textSecondary}
              fontSize={isMobile ? 10 : 12}
              tickLine={false}
              axisLine={false}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            
            <YAxis 
              yAxisId="left"
              stroke={currentColors.textSecondary}
              fontSize={isMobile ? 10 : 12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value.toLocaleString()}
            />
            
            <YAxis 
              yAxisId="right"
              orientation="right"
              stroke={currentColors.textSecondary}
              fontSize={isMobile ? 10 : 12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            
            <RechartsTooltip 
              contentStyle={{
                backgroundColor: currentColors.paper,
                border: `1px solid ${alpha(currentColors.shellstone, 0.3)}`,
                borderRadius: 8,
                fontSize: isMobile ? 10 : 12,
                color: currentColors.text,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
              formatter={(value, name) => {
                if (name === 'pedidos') return [`${value} pedidos`, 'Pedidos Totales'];
                if (name === 'completados') return [`${value} pedidos`, 'Completados'];
                if (name === 'pendientes') return [`${value} pedidos`, 'Pendientes'];
                if (name === 'montoTotal') return [`$${value.toLocaleString()}`, 'Monto Total'];
                if (name === 'movingAverage') return [`${value} pedidos`, 'Promedio Móvil (3 meses)'];
                if (name === 'movingAverageMonto') return [`$${value.toLocaleString()}`, 'Promedio Monto'];
                if (name === 'tasaCompletados') return [`${value.toFixed(1)}%`, 'Tasa de Completados'];
                if (name === 'crecimiento') return [`${value > 0 ? '+' : ''}${value.toFixed(1)}%`, 'Crecimiento'];
                return [value, name];
              }}
              labelStyle={{ fontWeight: 'bold', color: currentColors.borgundy }}
            />
            
            <Legend 
              wrapperStyle={{ 
                fontSize: isMobile ? 10 : 12,
                paddingTop: 10
              }}
            />
            
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="pedidos"
              name="Pedidos Totales"
              stroke={currentColors.borgundy}
              strokeWidth={3}
              dot={{ r: 4, fill: currentColors.borgundy }}
              activeDot={{ r: 6, fill: currentColors.borgundy }}
            />
            
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="completados"
              name="Completados"
              stroke={currentColors.success}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 3, fill: currentColors.success }}
            />
            
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="movingAverage"
              name="Tendencia (3 meses)"
              stroke={currentColors.sapphire}
              strokeWidth={2}
              dot={false}
            />
            
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="montoTotal"
              name="Monto Total"
              stroke={currentColors.tan}
              fill="url(#colorMovingAvg)"
              strokeWidth={2}
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      </Box>
    );
  };

  // ==========================================================================
  // RENDER PRINCIPAL
  // ==========================================================================

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: currentColors.swanWhite,
        marginLeft: `${sidebarMargin}px`,
        transition: 'margin-left 0.3s ease'
      }}>
        <CircularProgress sx={{ color: currentColors.borgundy }} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: isMobile ? 1 : 2,
      backgroundColor: currentColors.swanWhite,
      minHeight: '100vh',
      overflowX: 'hidden',
      marginLeft: `${sidebarMargin}px`,
      transition: 'margin-left 0.3s ease',
      width: `calc(100% - ${sidebarMargin}px)`,
      '&::-webkit-scrollbar': {
        width: '8px',
      },
      '&::-webkit-scrollbar-track': {
        backgroundColor: currentColors.background,
      },
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: currentColors.shellstone,
        borderRadius: '4px',
      }
    }}>
      {/* ======================================================================
         HEADER - AJUSTADO AL SIDEBAR
      ====================================================================== */}
      <Box sx={{ 
        marginTop: isMobile ? '10%' : 5, 
        mb: isMobile ? 2 : 3,
        ml: isMobile ? 0 : sidebarExpanded ? 0 : 2
      }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ 
                bgcolor: alpha(currentColors.borgundy, 0.1),
                color: currentColors.borgundy,
                width: isMobile ? 48 : 56,
                height: isMobile ? 48 : 56,
              }}>
                <DashboardIcon fontSize={isMobile ? "medium" : "large"} />
              </Avatar>
              <Box>
                <Typography 
                  variant={isMobile ? "h5" : "h4"} 
                  fontWeight="bold" 
                  sx={{ 
                    color: currentColors.text,
                    mb: 0.5, 
                  }}
                >
                  Dashboard Analítico
                </Typography>
                <Typography 
                  variant={isMobile ? "body2" : "body1"} 
                  color={currentColors.textSecondary}
                >
                  {currentUser?.role === 'admin' ? 'Vista general del sistema' :
                   currentUser?.role === 'comercial' ? 'Gestión de pedidos - Departamento Comercial' :
                   'Mis proyectos y pedidos'}
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{
              display: 'flex', 
              gap: 1, 
              flexWrap: 'wrap',
              justifyContent: isMobile ? 'flex-start' : 'flex-end'
            }}>
              <Tooltip title="Actualizar datos">
                <IconButton 
                  onClick={() => processDashboardData()}
                  sx={{ 
                    backgroundColor: alpha(currentColors.borgundy, 0.1),
                    color: currentColors.borgundy,
                    width: isMobile ? 40 : 44,
                    height: isMobile ? 40 : 44
                }}>
                  <Refresh fontSize={isMobile ? "small" : "medium"} />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* ======================================================================
         ALERTAS Y NOTIFICACIONES
      ====================================================================== */}
      {filteredData?.alerts && filteredData.alerts.length > 0 && (
        <Box sx={{ 
          mb: isMobile ? 2 : 3,
          ml: isMobile ? 0 : sidebarExpanded ? 0 : 2
        }}>
          <Grid container spacing={1}>
            {filteredData.alerts.map((alert, index) => (
              <Grid item xs={12} key={index}>
                <Paper
                  sx={{
                    p: 2,
                    backgroundColor: alpha(
                      alert.tipo === 'error' ? currentColors.error :
                      alert.tipo === 'warning' ? currentColors.warning :
                      currentColors.info, 0.1
                    ),
                    borderLeft: `4px solid ${
                      alert.tipo === 'error' ? currentColors.error :
                      alert.tipo === 'warning' ? currentColors.warning :
                      currentColors.info
                    }`,
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}
                >
                  <Box sx={{ color: alert.tipo === 'error' ? currentColors.error :
                               alert.tipo === 'warning' ? currentColors.warning :
                               currentColors.info }}>
                    {alert.icon}
                  </Box>
                  <Typography 
                    variant="body2" 
                    color={currentColors.text}
                    sx={{ flex: 1 }}
                  >
                    {alert.mensaje}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* ======================================================================
         ESTADÍSTICAS PRINCIPALES - RESPONSIVO Y AJUSTADO AL SIDEBAR
      ====================================================================== */}
      <Grid container spacing={isMobile ? 1 : 2} sx={{ 
        mb: isMobile ? 2 : 3,
        ml: isMobile ? 0 : sidebarExpanded ? 0 : 2
      }}>
        {filteredData && (
          <>
            {/* En móvil: 2 por fila, tablet: 3 por fila, desktop: 5 por fila */}
            <Grid item xs={6} sm={4} md={2.4}>
              <StatCard
                title="Total Pedidos"
                value={filteredData.stats.totalPedidos}
                icon={<ShoppingCart />}
                color={currentColors.borgundy}
                subtitle="Todos los tipos"
              />
            </Grid>
            
            <Grid item xs={6} sm={4} md={2.4}>
              <StatCard
                title="Pendientes"
                value={filteredData.stats.pedidosPendientes}
                icon={<Pending />}
                color={currentColors.warning}
                subtitle="Requieren atención"
              />
            </Grid>
            
            <Grid item xs={6} sm={4} md={2.4}>
              <StatCard
                title="Completados"
                value={filteredData.stats.pedidosCompletados}
                icon={<CheckCircle />}
                color={currentColors.success}
                subtitle="Finalizados exitosamente"
              />
            </Grid>
            
            <Grid item xs={6} sm={4} md={2.4}>
              <StatCard
                title="En Proceso"
                value={filteredData.stats.pedidosProceso}
                icon={<Build />}
                color={currentColors.info}
                subtitle="En ejecución"
              />
            </Grid>
            
            <Grid item xs={6} sm={4} md={2.4}>
              <StatCard
                title="Presupuesto"
                value={`$${filteredData.stats.presupuestoUtilizado?.toLocaleString() || '0'}`}
                icon={<AttachMoney />}
                color={currentColors.sapphire}
                subtitle={`de $${filteredData.stats.presupuestoTotal?.toLocaleString() || '0'}`}
              />
            </Grid>
          </>
        )}
      </Grid>

      {/* ======================================================================
         GRÁFICOS PRINCIPALES - RESPONSIVO Y AJUSTADO AL SIDEBAR
      ====================================================================== */}
      <Grid container spacing={isMobile ? 1.5 : 2} sx={{ 
        mb: isMobile ? 1 : 2,
        ml: isMobile ? 0 : sidebarExpanded ? 0 : 2
      }}>
        {/* Gráfico de Líneas de Tendencias */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ 
            height: '100%',
            width: '100%',
            minHeight: isMobile ? 350 : 400,
            backgroundColor: currentColors.swanWhite,
            border: `1px solid ${alpha(currentColors.shellstone, 0.3)}`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <CardHeader
              title="Tendencia de Pedidos (Últimos 12 meses)"
              titleTypographyProps={{
                variant: isMobile ? "subtitle1" : "h6",
                color: currentColors.text,
                fontWeight: 'bold'
              }}
              action={
                <Tooltip title="Exportar datos">
                  <IconButton 
                    size="small"
                    onClick={() => {
                      setSelectedChart('Tendencia de Pedidos');
                      setExportDialogOpen(true);
                    }}
                  >
                    <Download />
                  </IconButton>
                </Tooltip>
              }
              sx={{ 
                borderBottom: `1px solid ${alpha(currentColors.shellstone, 0.2)}`,
                pb: 1.5
              }}
            />
            <CardContent sx={{ 
              flexGrow: 1, 
              p: isMobile ? 1.5 : 2,
              '&:last-child': { pb: isMobile ? 1.5 : 2 }
            }}>
              {renderTrendLineChart()}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Gráficos de pastel y barras */}
        <Grid item xs={12} lg={4}>
          <Grid container spacing={isMobile ? 1.5 : 2}>
            {/* Gráfico de pastel */}
            <Grid item xs={12}>
              <Card sx={{ 
                height: '117%',
                width: '160%',
                minHeight: isMobile ? 250 : 300,
                backgroundColor: currentColors.swanWhite,
                border: `1px solid ${alpha(currentColors.shellstone, 0.3)}`,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}>
                <CardHeader
                  title="Top Productos"
                  titleTypographyProps={{
                    variant: isMobile ? "subtitle2" : "subtitle1",
                    color: currentColors.text,
                    fontWeight: 'bold'
                  }}
                  action={
                    <Tooltip title="Exportar datos">
                      <IconButton 
                        size="small"
                        onClick={() => {
                          setSelectedChart('Top Productos');
                          setExportDialogOpen(true);
                        }}
                      >
                        <Download />
                      </IconButton>
                    </Tooltip>
                  }
                  sx={{ 
                    borderBottom: `1px solid ${alpha(currentColors.shellstone, 0.2)}`,
                    pb: 1,
                    pt: 1.5
                  }}
                />
                <CardContent sx={{ 
                  flexGrow: 1, 
                  p: isMobile ? 1 : 1.5,
                  '&:last-child': { pb: isMobile ? 1 : 1.5 }
                }}>
                  {renderModernPieChart()}
                </CardContent>
              </Card>
            </Grid>
            
            {/* Gráfico de barras */}
            <Grid item xs={12}>
              <Card sx={{ 
                height: '117%',
                width: '130%',
                marginLeft: 12,
                minHeight: isMobile ? 250 : 300,
                backgroundColor: currentColors.swanWhite,
                border: `1px solid ${alpha(currentColors.shellstone, 0.3)}`,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}>
                <CardHeader
                  title="Pedidos por Tipo"
                  titleTypographyProps={{
                    variant: isMobile ? "subtitle2" : "subtitle1",
                    color: currentColors.text,
                    fontWeight: 'bold'
                  }}
                  action={
                    <Tooltip title="Exportar datos">
                      <IconButton 
                        size="small"
                        onClick={() => {
                          setSelectedChart('Pedidos por Tipo');
                          setExportDialogOpen(true);
                        }}
                      >
                        <Download />
                      </IconButton>
                    </Tooltip>
                  }
                  sx={{ 
                    borderBottom: `1px solid ${alpha(currentColors.shellstone, 0.2)}`,
                    pb: 1,
                    pt: 1.5
                  }}
                />
                <CardContent sx={{ 
                  flexGrow: 1, 
                  p: isMobile ? 1 : 0.20,
                  '&:last-child': { pb: isMobile ? 1 : 1.5 }
                }}>
                  {render3DBarChart()}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* ======================================================================
         TABLAS - RESPONSIVO Y AJUSTADO AL SIDEBAR
      ====================================================================== */}
      <Grid container spacing={isMobile ? 1.5 : 2} sx={{ 
        mb: isMobile ? 2 : 3,
        ml: isMobile ? 0 : sidebarExpanded ? 0 : 2
      }}>
        {/* Pedidos Recientes */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ 
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: currentColors.swanWhite,
            border: `1px solid ${alpha(currentColors.shellstone, 0.3)}`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            minHeight: isMobile ? 350 : 400,
          }}>
            <CardHeader
              title="Pedidos Recientes"
              titleTypographyProps={{
                variant: isMobile ? "subtitle1" : "h6",
                color: currentColors.text,
                fontWeight: 'bold'
              }}
              action={
                <Tooltip title="Exportar">
                  <IconButton size="small">
                    <Download />
                  </IconButton>
                </Tooltip>
              }
              sx={{ 
                borderBottom: `1px solid ${alpha(currentColors.shellstone, 0.2)}`,
                pb: 1.5,
                pt: 2
              }}
            />
            <CardContent sx={{ 
              flex: 1,
              p: 0,
              display: 'flex',
              flexDirection: 'column',
              minHeight: isMobile ? 250 : 300
            }}>
              <TableContainer sx={{ flex: 1, maxHeight: '100%', overflow: 'auto' }}>
                <Table size={isMobile ? "small" : "medium"} stickyHeader>
                  <TableHead>
                    <TableRow sx={{ 
                      backgroundColor: alpha(currentColors.shellstone, 0.1)
                    }}>
                      <TableCell sx={{ 
                        color: currentColors.text,
                        fontWeight: 'bold',
                        fontSize: isMobile ? '0.7rem' : '0.8rem',
                        minWidth: 120
                      }}>
                        Pedido
                      </TableCell>
                      {!isMobile && (
                        <TableCell sx={{ 
                          color: currentColors.text,
                          fontWeight: 'bold',
                          fontSize: isMobile ? '0.7rem' : '0.8rem',
                          minWidth: 150
                        }}>
                          Usuario
                        </TableCell>
                      )}
                      <TableCell sx={{ 
                        color: currentColors.text,
                        fontWeight: 'bold',
                        fontSize: isMobile ? '0.7rem' : '0.8rem'
                      }}>
                        Tipo
                      </TableCell>
                      <TableCell sx={{ 
                        color: currentColors.text,
                        fontWeight: 'bold',
                        fontSize: isMobile ? '0.7rem' : '0.8rem'
                      }}>
                        Estado
                      </TableCell>
                      <TableCell sx={{ 
                        color: currentColors.text,
                        fontWeight: 'bold',
                        fontSize: isMobile ? '0.7rem' : '0.8rem'
                      }}>
                        Monto
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredData?.recentOrders && filteredData.recentOrders.slice(0, 6).length > 0 ? (
                      filteredData.recentOrders.slice(0, 6).map((pedido) => (
                        <TableRow 
                          key={pedido.id}
                          hover
                          sx={{ 
                            '&:hover': {
                              backgroundColor: alpha(currentColors.shellstone, 0.05)
                            }
                          }}
                        >
                          <TableCell sx={{ 
                            color: currentColors.text,
                            fontSize: isMobile ? '0.7rem' : '0.8rem'
                          }}>
                            <Typography variant="caption" fontWeight="bold">
                              {pedido.numero}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              color={currentColors.textSecondary}
                              sx={{ display: 'block', fontSize: '0.65rem' }}
                            >
                              {pedido.fecha}
                            </Typography>
                          </TableCell>
                          {!isMobile && (
                            <TableCell sx={{ 
                              color: currentColors.text,
                              fontSize: isMobile ? '0.7rem' : '0.8rem'
                            }}>
                              {pedido.usuario}
                            </TableCell>
                          )}
                          <TableCell sx={{ 
                            color: currentColors.text,
                            fontSize: isMobile ? '0.7rem' : '0.8rem'
                          }}>
                            <Chip
                              label={pedido.tipo}
                              size="small"
                              sx={{
                                backgroundColor: 
                                  pedido.tipo === 'Productos' ? alpha(currentColors.borgundy, 0.1) :
                                  pedido.tipo === 'Servicios' ? alpha(currentColors.sapphire, 0.1) :
                                  alpha(currentColors.tan, 0.1),
                                color: 
                                  pedido.tipo === 'Productos' ? currentColors.borgundy :
                                  pedido.tipo === 'Servicios' ? currentColors.sapphire :
                                  currentColors.tan,
                                fontWeight: 500
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <EstadoPedido estado={pedido.estado} />
                          </TableCell>
                          <TableCell sx={{ 
                            color: currentColors.text,
                            fontSize: isMobile ? '0.7rem' : '0.8rem',
                            fontWeight: 'bold'
                          }}>
                            ${pedido.monto.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={isMobile ? 4 : 5} align="center" sx={{ py: 3 }}>
                          <Typography 
                            variant="body2" 
                            color={currentColors.textSecondary}
                          >
                            No hay pedidos recientes
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Proyectos Más Activos - Oculto para comercial */}
        {currentUser?.role !== 'comercial' && (
          <Grid item xs={12} lg={4}>
            <Card sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: currentColors.swanWhite,
              border: `1px solid ${alpha(currentColors.shellstone, 0.3)}`,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              minHeight: isMobile ? 350 : 400,
            }}>
              <CardHeader
                title="Proyectos Más Activos"
                titleTypographyProps={{
                  variant: isMobile ? "subtitle1" : "h6",
                  color: currentColors.text,
                  fontWeight: 'bold'
                }}
                sx={{ 
                  borderBottom: `1px solid ${alpha(currentColors.shellstone, 0.2)}`,
                  pb: 1.5,
                  pt: 2
                }}
              />
              <CardContent sx={{ 
                flex: 1,
                p: 0,
                display: 'flex',
                flexDirection: 'column',
                minHeight: isMobile ? 250 : 300
              }}>
                <TableContainer sx={{ flex: 1, maxHeight: '100%', overflow: 'auto' }}>
                  <Table size={isMobile ? "small" : "medium"} stickyHeader>
                    <TableHead>
                      <TableRow sx={{ 
                        backgroundColor: alpha(currentColors.shellstone, 0.1)
                      }}>
                        <TableCell sx={{ 
                          color: currentColors.text,
                          fontWeight: 'bold',
                          fontSize: isMobile ? '0.7rem' : '0.8rem'
                        }}>
                          Proyecto
                        </TableCell>
                        <TableCell sx={{ 
                          color: currentColors.text,
                          fontWeight: 'bold',
                          fontSize: isMobile ? '0.7rem' : '0.8rem'
                        }}>
                          Pedidos
                        </TableCell>
                        <TableCell sx={{ 
                          color: currentColors.text,
                          fontWeight: 'bold',
                          fontSize: isMobile ? '0.7rem' : '0.8rem'
                        }}>
                          Presupuesto
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredData?.activeProjects && filteredData.activeProjects.length > 0 ? (
                        filteredData.activeProjects.map((proyecto, index) => (
                          <TableRow 
                            key={index}
                            hover
                            sx={{ 
                              '&:hover': {
                                backgroundColor: alpha(currentColors.shellstone, 0.05)
                              }
                            }}
                          >
                            <TableCell sx={{ 
                              color: currentColors.text,
                              fontSize: isMobile ? '0.7rem' : '0.8rem'
                            }}>
                              <Typography variant="caption" fontWeight="bold">
                                {proyecto.nombre}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ 
                              color: currentColors.text,
                              fontSize: isMobile ? '0.7rem' : '0.8rem'
                            }}>
                              <Chip
                                label={proyecto.pedidos}
                                size="small"
                                sx={{
                                  backgroundColor: alpha(currentColors.borgundy, 0.1),
                                  color: currentColors.borgundy,
                                  fontWeight: 'bold'
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ 
                              color: currentColors.text,
                              fontSize: isMobile ? '0.7rem' : '0.8rem'
                            }}>
                              <Box>
                                <Typography variant="caption" fontWeight="bold">
                                  ${proyecto.gastado?.toLocaleString() || '0'}
                                </Typography>
                                <Typography 
                                  variant="caption" 
                                  color={currentColors.textSecondary}
                                  sx={{ display: 'block', fontSize: '0.65rem' }}
                                >
                                  de ${proyecto.presupuesto?.toLocaleString() || '0'}
                                </Typography>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={proyecto.presupuesto > 0 ? 
                                    (proyecto.gastado / proyecto.presupuesto) * 100 : 0}
                                  sx={{ 
                                    mt: 0.5,
                                    height: 4,
                                    borderRadius: 2,
                                    backgroundColor: alpha(currentColors.shellstone, 0.2),
                                    '& .MuiLinearProgress-bar': {
                                      backgroundColor: currentColors.borgundy,
                                      borderRadius: 2
                                    }
                                  }}
                                />
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                            <Typography 
                              variant="body2" 
                              color={currentColors.textSecondary}
                            >
                              No hay proyectos activos
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* ======================================================================
         DIALOGO DE EXPORTACIÓN
      ====================================================================== */}
      <Dialog 
        open={exportDialogOpen} 
        onClose={() => setExportDialogOpen(false)}
        sx={{
          '& .MuiDialog-paper': {
            width: isMobile ? '90%' : '400px',
            maxWidth: '90%',
            marginLeft: `${sidebarMargin}px`,
            transition: 'margin-left 0.3s ease'
          }
        }}
      >
        <DialogTitle>Exportar Datos del Gráfico</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Está seguro que desea exportar los datos de "{selectedChart}" a PDF?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)} color="primary">
            Cancelar
          </Button>
          <Button 
            onClick={() => handleExportChart(selectedChart)} 
            color="primary"
            variant="contained"
          >
            Exportar
          </Button>
        </DialogActions>
      </Dialog>

      {/* ======================================================================
         FOOTER - AJUSTADO AL SIDEBAR
      ====================================================================== */}
      <Box sx={{ 
        mt: isMobile ? 2 : 3, 
        pt: 2, 
        borderTop: `1px solid ${alpha(currentColors.shellstone, 0.3)}`,
        ml: isMobile ? 0 : sidebarExpanded ? 0 : 2
      }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography 
              variant="caption" 
              color={currentColors.textSecondary}
              sx={{ fontSize: isMobile ? '0.65rem' : '0.75rem' }}
            >
              Sistema SiPP - Universidad de La Habana • Dirección de Servicios Tecnológicos
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: isMobile ? 'flex-start' : 'flex-end',
              gap: 2,
              flexWrap: 'wrap'
            }}>
              <Typography 
                variant="caption" 
                color={currentColors.textSecondary}
                sx={{ fontSize: isMobile ? '0.65rem' : '0.75rem' }}
              >
                Última actualización: {new Date().toLocaleDateString('es-ES')}
              </Typography>
              <Typography 
                variant="caption" 
                color={currentColors.textSecondary}
                sx={{ fontSize: isMobile ? '0.65rem' : '0.75rem' }}
              >
                • {filteredData?.allOrders?.length || 0} pedidos procesados
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}