import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Divider,
  Alert,
  IconButton,
  Tooltip,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  useMediaQuery,
  useTheme,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Collapse
} from '@mui/material';
import {
  Mail as MailIcon,
  MarkEmailRead as MarkEmailReadIcon,
  MarkEmailUnread as MarkEmailUnreadIcon,
  Assignment as AssignmentIcon,
  Store as StoreIcon,
  Category as CategoryIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  ExpandMore as ExpandMoreIcon,
  Archive as ArchiveIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  PictureAsPdf as PictureAsPdfIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useMessageNotifications } from '../../hooks/useMessageNotifications';

// Paleta de colores con modo oscuro mejorada
const COLORS = {
  light: {
    borgundy: '#4E0101',
    tan: '#d2b48c',
    sapphire: '#3C5070',
    swanWhite: '#F5F0E9',
    shellstone: '#D9CBC2',
    background: '#F5F0E9',
    paper: '#F8F9FA',
    text: '#4E0101',
    textSecondary: '#3C5070'
  },
  dark: {
    borgundy: '#4E0101',
    tan: '#A78B6F',
    sapphire: '#1E3A5F',
    swanWhite: '#132F4C',
    shellstone: '#1E3A5F',
    background: '#0A1929',
    paper: '#132F4C',
    text: '#FFFFFF',
    textSecondary: '#B0BEC5'
  }
};

// Hook useLocalStorage
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

// Marcar mensaje como leído
  const markAsRead = (messageId) => {
    const messageExists = messages.find(msg => msg.id === messageId);
    if (!messageExists) {
      const newMessage = {
        id: messageId,
        read: true,
        readAt: new Date().toISOString()
      };
      setMessages([...messages, newMessage]);
    }
  };

  // Marcar mensaje como no leído
  const markAsUnread = (messageId) => {
    setMessages(messages.filter(msg => msg.id !== messageId));
  };

// Función para obtener el área del usuario
const getUserArea = (userId) => {
  try {
    const users = JSON.parse(localStorage.getItem('SiPP_users') || '[]');
    const user = users.find(u => u.id === userId);
    return user ? user.area || 'N/A' : 'N/A';
  } catch (error) {
    console.error('Error obteniendo área del usuario:', error);
    return 'N/A';
  }
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

// Función para generar número de pedido
const generateOrderNumber = (orderId, year, type = '') => {
  const paddedId = orderId.toString().padStart(3, '0');
  const typeSuffix = type ? `-${type.charAt(0).toUpperCase()}` : '';
  return `PDD-${paddedId}${typeSuffix}-${year.toString().slice(-2)}`;
};

// Función para obtener nombre del proyecto
const getProjectName = (projectId, userId) => {
  try {
    if (!projectId || projectId === 'extra') return 'Pedido Extra';
    
    const userProjects = JSON.parse(localStorage.getItem(`SiPP_projects_${userId}`) || '[]');
    const project = userProjects.find(p => p.id === projectId);
    
    if (project) {
      return `${project.costCenter} - ${project.projectNumber}`;
    }
    
    const allUsers = JSON.parse(localStorage.getItem('SiPP_users') || '[]');
    for (let user of allUsers) {
      const userProjs = JSON.parse(localStorage.getItem(`SiPP_projects_${user.id}`) || '[]');
      const foundProject = userProjs.find(p => p.id === projectId);
      if (foundProject) {
        return `${foundProject.costCenter} - ${foundProject.projectNumber}`;
      }
    }
    
    return 'Proyecto No Encontrado';
  } catch (error) {
    console.error('Error obteniendo nombre del proyecto:', error);
    return 'N/A';
  }
};

// Función para obtener presupuesto restante del proyecto
const getProjectRemainingBudget = (projectId, userId) => {
  try {
    if (!projectId || projectId === 'extra') return 0;
    
    const userProjects = JSON.parse(localStorage.getItem(`SiPP_projects_${userId}`) || '[]');
    const project = userProjects.find(p => p.id === projectId);
    
    if (project) {
      const purchases = JSON.parse(localStorage.getItem('OASiS_purchases') || '[]');
      const specialOrders = JSON.parse(localStorage.getItem('OASiS_special_orders') || '[]');
      
      const projectExpenses = [...purchases, ...specialOrders]
        .filter(order => order.projectId === projectId)
        .reduce((total, order) => total + (order.total || 0), 0);
      
      return (project.budget || 0) - projectExpenses;
    }
    
    return 0;
  } catch (error) {
    console.error('Error obteniendo presupuesto del proyecto:', error);
    return 0;
  }
};

// Función para obtener nombre de empresa desde los items del pedido
const getCompanyFromOrder = (order) => {
  try {
    if (order.items && order.items.length > 0) {
      const firstItemWithCompany = order.items.find(item => item.company);
      return firstItemWithCompany?.company || 'N/A';
    }
    return 'N/A';
  } catch (error) {
    console.error('Error obteniendo empresa del pedido:', error);
    return 'N/A';
  }
};

// Función para obtener icono según el estado del pedido
const getStatusIcon = (status) => {
  switch (status) {
    case 'Pendiente':
      return <ScheduleIcon sx={{ color: '#ff9800' }} />;
    case 'En proceso':
      return <WarningIcon sx={{ color: '#2196f3' }} />;
    case 'Completado':
      return <CheckCircleIcon sx={{ color: '#4caf50' }} />;
    case 'Denegado':
      return <ErrorIcon sx={{ color: '#f44336' }} />;
    case 'Archivado':
      return <ArchiveIcon sx={{ color: '#9e9e9e' }} />;
    default:
      return <AssignmentIcon sx={{ color: '#757575' }} />;
  }
};

// Función para obtener icono según el tipo de pedido
const getOrderTypeIcon = (subType) => {
  if (subType.includes('Productos')) {
    return <StoreIcon sx={{ color: 'inherit' }} />;
  } else if (subType.includes('Servicios')) {
    return <CategoryIcon sx={{ color: 'inherit' }} />;
  } else if (subType.includes('P.Extra')) {
    return <AssignmentIcon sx={{ color: 'inherit' }} />;
  } else {
    return <AssignmentIcon sx={{ color: 'inherit' }} />;
  }
};

// Componente principal de Mensajes
export default function Mensajes() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { currentUser } = useAuth();
  const { addNotification } = useNotifications();

  // Estados para modo oscuro
  const { darkMode } = useTheme();
  const colors = darkMode ? COLORS.dark : COLORS.light;

  // Estados para datos
  const [purchases, setPurchases] = useLocalStorage('OASiS_purchases', []);
  const [specialOrders, setSpecialOrders] = useLocalStorage('OASiS_special_orders', []);
  const [messages, setMessages] = useLocalStorage('OASiS_messages', []);

  // Estados de UI
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedUser, setSelectedUser] = useState('all');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [viewMode, setViewMode] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Estados para archivar y denegar pedidos
  const [statusEditDialog, setStatusEditDialog] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [denialReason, setDenialReason] = useState('');
  const [customDenialReason, setCustomDenialReason] = useState('');
  const [archivedOrdersDialog, setArchivedOrdersDialog] = useState(false);
  const [archivedOrders, setArchivedOrders] = useState([]);
  const [orderDetailsDialog, setOrderDetailsDialog] = useState(null);

  // Integrar notificaciones de mensajes
  useMessageNotifications();

  // Opciones predefinidas para estados denegados
  const denialReasons = [
    'Falta de presupuesto',
    'Denegado por departamento jurídico',
    'Denegado por departamento económico', 
    'Cancelado por el usuario',
    'Producto/servicio no disponible',
    'No cumple con las políticas internas',
    'Documentación incompleta',
    'Otra razón'
  ];

  // Procesar mensajes según los requisitos
  const processedMessages = useMemo(() => {
    const allOrders = [...purchases, ...specialOrders];
    
    const filteredOrders = allOrders.filter(order => {
      // Para admin y comercial: ver todos los pedidos
      if (['admin', 'comercial'].includes(currentUser?.role)) {
        return true;
      }
      
      // Para usuarios normales: solo ver sus propios pedidos
      return order.userId === currentUser?.id;
    });

    const processed = filteredOrders.flatMap(order => {
      const isSpecial = order.type === 'special';
      const orderDate = new Date(order.date);
      
      // Si el pedido está archivado, procesarlo individualmente
      if (order.status === 'Archivado') {
        const orderNumber = generateOrderNumber(order.id, orderDate.getFullYear());
        let subType = '';
        
        if (isSpecial) {
          subType = `P.Extra-${order.orderType || 'producto'}`;
        } else {
          subType = 'Productos y Servicios';
        }
        
        return [{
          id: order.id + (isSpecial ? '-special' : '-normal'),
          orderId: order.id,
          orderNumber,
          type: isSpecial ? 'Pedido Extra' : 'Pedido Normal',
          subType: subType,
          user: getUserName(order.userId),
          userId: order.userId,
          area: getUserArea(order.userId),
          project: getProjectName(order.projectId, order.userId),
          projectId: order.projectId,
          date: order.date,
          total: order.total || 0,
          currency: order.currency || 'CUP',
          status: order.status || 'Pendiente',
          priority: order.priority || 'Media',
          items: order.items || [],
          orderType: order.orderType,
          characteristics: order.characteristics,
          read: messages.some(msg => msg.id === order.id) || false,
          timestamp: order.date,
          denialReason: order.denialReason,
          statusUpdatedAt: order.statusUpdatedAt,
          statusUpdatedBy: order.statusUpdatedBy,
          archived: true,
          originalOrder: order
        }];
      }

      // Para pedidos normales NO archivados, separar productos y servicios
      if (!isSpecial && order.items && order.items.length > 0) {
        const productItems = order.items.filter(item => 
          item.dataType === 'products' || (!item.dataType && item.name)
        );
        
        const serviceItems = order.items.filter(item => 
          item.dataType === 'services' || (!item.dataType && item.service)
        );
        
        const result = [];
        
        // Crear pedido separado para productos
        if (productItems.length > 0) {
          const productOrderNumber = generateOrderNumber(order.id, orderDate.getFullYear(), 'PROD');
          result.push({
            id: order.id + '-products',
            orderId: order.id,
            orderNumber: productOrderNumber,
            type: 'Pedido Normal',
            subType: 'Productos',
            user: getUserName(order.userId),
            userId: order.userId,
            area: getUserArea(order.userId),
            project: getProjectName(order.projectId, order.userId),
            projectId: order.projectId,
            date: order.date,
            total: productItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            currency: order.currency || 'CUP',
            status: order.status || 'Pendiente',
            priority: order.priority || 'Media',
            items: productItems,
            read: messages.some(msg => msg.id === order.id + '-products') || false,
            timestamp: order.date,
            denialReason: order.denialReason,
            statusUpdatedAt: order.statusUpdatedAt,
            statusUpdatedBy: order.statusUpdatedBy,
            archived: false,
            originalOrder: { ...order, items: productItems }
          });
        }
        
        // Crear pedido separado para servicios
        if (serviceItems.length > 0) {
          const serviceOrderNumber = generateOrderNumber(order.id, orderDate.getFullYear(), 'SERV');
          result.push({
            id: order.id + '-services',
            orderId: order.id,
            orderNumber: serviceOrderNumber,
            type: 'Pedido Normal',
            subType: 'Servicios',
            user: getUserName(order.userId),
            userId: order.userId,
            area: getUserArea(order.userId),
            project: getProjectName(order.projectId, order.userId),
            projectId: order.projectId,
            date: order.date,
            total: serviceItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            currency: order.currency || 'CUP',
            status: order.status || 'Pendiente',
            priority: order.priority || 'Media',
            items: serviceItems,
            read: messages.some(msg => msg.id === order.id + '-services') || false,
            timestamp: order.date,
            denialReason: order.denialReason,
            statusUpdatedAt: order.statusUpdatedAt,
            statusUpdatedBy: order.statusUpdatedBy,
            archived: false,
            originalOrder: { ...order, items: serviceItems }
          });
        }
        
        return result.length > 0 ? result : [createDefaultOrder(order, isSpecial, orderDate)];
      }
      
      // Para pedidos especiales o sin items, procesar normalmente
      return [createDefaultOrder(order, isSpecial, orderDate)];
      
    }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return processed;

    // Función auxiliar para crear pedido por defecto
    function createDefaultOrder(order, isSpecial, orderDate) {
      const orderNumber = generateOrderNumber(order.id, orderDate.getFullYear());
      let subType = '';
      
      if (isSpecial) {
        subType = `P.Extra-${order.orderType || 'producto'}`;
      } else {
        subType = 'General';
      }
      
      return {
        id: order.id + (isSpecial ? '-special' : '-normal'),
        orderId: order.id,
        orderNumber,
        type: isSpecial ? 'Pedido Extra' : 'Pedido Normal',
        subType: subType,
        user: getUserName(order.userId),
        userId: order.userId,
        area: getUserArea(order.userId),
        project: getProjectName(order.projectId, order.userId),
        projectId: order.projectId,
        date: order.date,
        total: order.total || 0,
        currency: order.currency || 'CUP',
        status: order.status || 'Pendiente',
        priority: order.priority || 'Media',
        items: order.items || [],
        orderType: order.orderType,
        characteristics: order.characteristics,
        read: messages.some(msg => msg.id === order.id) || false,
        timestamp: order.date,
        denialReason: order.denialReason,
        statusUpdatedAt: order.statusUpdatedAt,
        statusUpdatedBy: order.statusUpdatedBy,
        archived: order.status === 'Archivado',
        originalOrder: order
      };
    }
  }, [purchases, specialOrders, messages, currentUser]);

  // Separar mensajes en diferentes categorías
  const archivedOrdersList = useMemo(() => 
    processedMessages.filter(msg => msg.archived), [processedMessages]);

  const activeMessages = useMemo(() => 
    processedMessages.filter(msg => !msg.archived), [processedMessages]);

  //  CORREGIDO: Filtrar mensajes según vista seleccionada
  const filteredMessages = useMemo(() => {
    let baseMessages = activeMessages;
    
    // Aplicar filtro de vista (No leídos vs Leídos)
    if (viewMode === 'unread') {
      baseMessages = baseMessages.filter(message => !message.read);
    } else if (viewMode === 'read') {
      baseMessages = baseMessages.filter(message => message.read);
    }
    // 'all' muestra todos los mensajes activos

    return baseMessages.filter(message => {
      const matchesSearch = 
        message.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.type.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = selectedStatus === 'all' || message.status === selectedStatus;
      const matchesType = selectedType === 'all' || 
        (selectedType === 'Productos' && message.subType.includes('Productos')) ||
        (selectedType === 'Servicios' && message.subType.includes('Servicios')) ||
        (selectedType === 'P.Extra' && message.subType.includes('P.Extra')) ||
        (selectedType === 'General' && message.subType === 'General');
      const matchesUser = selectedUser === 'all' || message.user === selectedUser;

      return matchesSearch && matchesStatus && matchesType && matchesUser;
    });
  }, [activeMessages, searchTerm, selectedStatus, selectedType, selectedUser, viewMode]);

  //  CORREGIDO: Marcar mensaje como leído automáticamente al expandir
  const handleExpandOrder = (messageId) => {
    setExpandedOrder(expandedOrder === messageId ? null : messageId);
    
    // Marcar como leído automáticamente al expandir
    if (expandedOrder !== messageId) {
      const messageExists = messages.find(msg => msg.id === messageId);
      if (!messageExists) {
        const newMessage = {
          id: messageId,
          read: true,
          readAt: new Date().toISOString()
        };
        setMessages([...messages, newMessage]);
      }
    }
  };

  // Función para archivar pedido
  const handleArchiveOrder = (message) => {
    const isSpecial = message.type === 'Pedido Extra';
    const orderId = message.orderId;

    try {
      if (isSpecial) {
        const updatedOrders = specialOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: 'Archivado', statusUpdatedAt: new Date().toISOString() }
            : order
        );
        setSpecialOrders(updatedOrders);
      } else {
        const updatedPurchases = purchases.map(purchase => 
          purchase.id === orderId 
            ? { ...purchase, status: 'Archivado', statusUpdatedAt: new Date().toISOString() }
            : purchase
        );
        setPurchases(updatedPurchases);
      }

      addNotification({
        title: 'Pedido archivado',
        message: 'El pedido ha sido movido a la sección de archivados',
        type: 'success'
      });
      
    } catch (error) {
      console.error('Error archivando pedido:', error);
      addNotification({
        title: 'Error',
        message: 'No se pudo archivar el pedido',
        type: 'error'
      });
    }
  };

  // Función para desarchivar pedido
  const handleUnarchiveOrder = (message) => {
    const isSpecial = message.originalOrder?.type === 'special';
    const orderId = message.orderId;

    try {
      if (isSpecial) {
        const updatedOrders = specialOrders.map(item => 
          item.id === orderId 
            ? { ...item, status: 'Pendiente' }
            : item
        );
        setSpecialOrders(updatedOrders);
      } else {
        const updatedPurchases = purchases.map(item => 
          item.id === orderId 
            ? { ...item, status: 'Pendiente' }
            : item
        );
        setPurchases(updatedPurchases);
      }

      addNotification({
        title: 'Pedido desarchivado',
        message: 'El pedido ha sido movido a pendientes',
        type: 'success'
      });
      
    } catch (error) {
      console.error('Error desarchivando pedido:', error);
      addNotification({
        title: 'Error',
        message: 'No se pudo desarchivar el pedido',
        type: 'error'
      });
    }
  };

  // Función para actualizar el estado del pedido
  const handleUpdateStatus = () => {
    if (!statusEditDialog || !newStatus) return;

    const isSpecial = statusEditDialog.type === 'Pedido Extra';
    const orderId = statusEditDialog.orderId;

    try {
      const updateData = {
        status: newStatus,
        statusUpdatedAt: new Date().toISOString(),
        statusUpdatedBy: currentUser?.fullName || 'Sistema'
      };

      // Si es denegado, agregar motivo
      if (newStatus === 'Denegado') {
        updateData.denialReason = denialReason === 'Otra razón' ? customDenialReason : denialReason;
      }

      if (isSpecial) {
        const updatedOrders = specialOrders.map(order => 
          order.id === orderId ? { ...order, ...updateData } : order
        );
        setSpecialOrders(updatedOrders);
      } else {
        const updatedPurchases = purchases.map(purchase => 
          purchase.id === orderId ? { ...purchase, ...updateData } : purchase
        );
        setPurchases(updatedPurchases);
      }

      addNotification({
        title: 'Estado actualizado',
        message: `El estado del pedido se ha actualizado a "${newStatus}"`,
        type: 'success'
      });

      setStatusEditDialog(null);
      setNewStatus('');
      setDenialReason('');
      setCustomDenialReason('');
      
    } catch (error) {
      console.error('Error actualizando estado:', error);
      addNotification({
        title: 'Error',
        message: 'No se pudo actualizar el estado del pedido',
        type: 'error'
      });
    }
  };

  // Función para cargar los pedidos archivados
  const loadArchivedOrders = () => {
    try {
      const allPurchases = JSON.parse(localStorage.getItem('OASiS_purchases') || '[]');
      const allSpecialOrders = JSON.parse(localStorage.getItem('OASiS_special_orders') || '[]');
      
      const archived = [...allPurchases, ...allSpecialOrders].filter(order => 
        order.status === 'Archivado'
      );
      
      setArchivedOrders(archived);
    } catch (error) {
      console.error('Error cargando pedidos archivados:', error);
    }
  };

  // Componente para mostrar detalles expandibles del pedido
  const OrderDetails = ({ order }) => {
    const company = getCompanyFromOrder(order.originalOrder || order);
    
    return (
      <Box sx={{ marginTop: isMobile ? '10%' : 5, mt: 2, p: 2, backgroundColor: colors.background, borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom sx={{ color: colors.text, fontWeight: 'bold' }}>
          Detalles del Pedido
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: colors.textSecondary }}>
              Información del Proyecto:
            </Typography>
            <Typography variant="body2" sx={{ color: colors.text }}>
              {order.project}
            </Typography>
            
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: colors.textSecondary, mt: 1 }}>
              Empresa:
            </Typography>
            <Typography variant="body2" sx={{ color: colors.text }}>
              {company}
            </Typography>
            
            {order.projectId && order.projectId !== 'extra' && (
              <Typography variant="body2" sx={{ color: colors.text, mt: 1 }}>
                Presupuesto restante: ${getProjectRemainingBudget(order.projectId, order.userId).toFixed(2)} CUP
              </Typography>
            )}
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: colors.textSecondary }}>
              Detalles de Pago:
            </Typography>
            <Typography variant="body2" sx={{ color: colors.text }}>
              Total: ${order.total.toFixed(2)} {order.currency}
            </Typography>
            <Typography variant="body2" sx={{ color: colors.text }}>
              Prioridad: {order.priority}
            </Typography>
          </Grid>
        </Grid>

        {/* Items del pedido */}
        {order.items && order.items.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: colors.textSecondary, mb: 1 }}>
              {order.subType.includes('Servicio') ? 'Servicios:' : 'Productos:'}
            </Typography>
            {order.items.map((item, index) => (
              <Box key={index} sx={{ 
                p: 1, 
                mb: 1, 
                backgroundColor: colors.paper, 
                borderRadius: 1,
                border: `1px solid ${colors.shellstone}`
              }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: colors.text }}>
                  {item.name || item.serviceType || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                  {item.description || 'Sin descripción'}
                </Typography>
                {item.price && (
                  <Typography variant="body2" sx={{ color: colors.text }}>
                    Precio: ${item.price.toFixed(2)} {order.currency}
                  </Typography>
                )}
                {item.quantity && (
                  <Typography variant="body2" sx={{ color: colors.text }}>
                    Cantidad: {item.quantity}
                  </Typography>
                )}
                {item.company && (
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                    Empresa: {item.company}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        )}

        {/* Información de contacto DST para pedidos completados */}
        {order.status === 'Completado' && (
          <Alert severity="success" sx={{ mt: 2, backgroundColor: colors.paper }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: colors.text }}>
              Pedido Completado
            </Typography>
            <Typography variant="body2" sx={{ color: colors.text }}>
              Para coordinar la entrega, contacte al departamento DST:
            </Typography>
            <Typography variant="body2" sx={{ color: colors.text }}>
              📞 Teléfono: +53 123 456 789 | 📧 Email: dst@empresa.com
            </Typography>
          </Alert>
        )}

        {/* Motivo de denegación */}
        {order.status === 'Denegado' && order.denialReason && (
          <Alert severity="error" sx={{ mt: 2, backgroundColor: colors.paper }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: colors.text }}>
              Pedido Denegado
            </Typography>
            <Typography variant="body2" sx={{ color: colors.text }}>
              Motivo: {order.denialReason}
            </Typography>
          </Alert>
        )}

        {/*  CORREGIDO: Solo mostrar acciones si NO está archivado y el usuario es admin o comercial */}
        {!order.archived && ['admin', 'comercial'].includes(currentUser?.role) && (
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => setStatusEditDialog(order)}
              sx={{ 
                borderColor: colors.tan,
                color: colors.tan,
                '&:hover': {
                  backgroundColor: colors.tan,
                  color: colors.background
                }
              }}
            >
              Cambiar Estado
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleArchiveOrder(order)}
              sx={{ 
                borderColor: colors.borgundy,
                color: colors.borgundy,
                '&:hover': {
                  backgroundColor: colors.borgundy,
                  color: colors.text
                }
              }}
            >
              Archivar
            </Button>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ 
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
      backgroundColor: colors.background,
      color: colors.text,
    }}>
      {/* Contenido Principal */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden',
        marginTop: 4, 
      }}>
        {/* Header */}
        <AppBar 
          position="static" 
          sx={{ 
            backgroundColor: colors.paper, //  Cambiado a paper
            color: colors.text,
            boxShadow: 'none',
            borderBottom: `2px solid ${colors.tan}`
          }}
        >
          <Toolbar>
            <Typography variant="h4" component="h1" sx={{ 
              flexGrow: 1, 
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}>
              <MailIcon sx={{ fontSize: 32, marginTop: 1, color: colors.text }} />
              Mensajes
            </Typography>
            
            <Button
              variant="outlined"
              onClick={() => {
                loadArchivedOrders();
                setArchivedOrdersDialog(true);
              }}
              sx={{
                borderColor: colors.tan,
                color: colors.tan,
                '&:hover': {
                  backgroundColor: colors.tan,
                  color: colors.borgundy
                }
              }}
            >
              <ArchiveIcon sx={{ mr: 1 }} />
              Archivados
            </Button>
          </Toolbar>
        </AppBar>

        {/* Barra de herramientas */}
        <Box sx={{ 
          p: 2, 
          backgroundColor: colors.paper, //  Cambiado a paper
          borderBottom: `1px solid ${colors.shellstone}` 
        }}>
          <Grid container spacing={2} alignItems="center">
            {/* Búsqueda */}
            <Grid item xs={12} md={4}>
              <TextField
                placeholder="Buscar en mensajes..."
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: colors.text, mr: 1 }} />,
                }}
                sx={{
                  backgroundColor: colors.paper,
                  '& .MuiOutlinedInput-root': {
                    color: colors.text,
                    '& fieldset': {
                      borderColor: colors.shellstone,
                    },
                    '&:hover fieldset': {
                      borderColor: colors.tan,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: colors.tan,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: colors.text,
                  }
                }}
              />
            </Grid>

            {/* Filtros */}
            <Grid item xs={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ color: colors.text }}>Estado</InputLabel>
                <Select
                  value={selectedStatus}
                  label="Estado"
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  sx={{
                    color: colors.text,
                    backgroundColor: colors.paper,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: colors.shellstone,
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: colors.tan,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: colors.tan,
                    }
                  }}
                >
                  <MenuItem value="all">Todos</MenuItem>
                  <MenuItem value="Pendiente">Pendiente</MenuItem>
                  <MenuItem value="En proceso">En proceso</MenuItem>
                  <MenuItem value="Completado">Completado</MenuItem>
                  <MenuItem value="Denegado">Denegado</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ color: colors.text }}>Tipo</InputLabel>
                <Select
                  value={selectedType}
                  label="Tipo"
                  onChange={(e) => setSelectedType(e.target.value)}
                  sx={{
                    color: colors.text,
                    backgroundColor: colors.paper,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: colors.shellstone,
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: colors.tan,
                    }
                  }}
                >
                  <MenuItem value="all">Todos</MenuItem>
                  <MenuItem value="Productos">Productos</MenuItem>
                  <MenuItem value="Servicios">Servicios</MenuItem>
                  <MenuItem value="P.Extra">Pedidos Extra</MenuItem>
                  <MenuItem value="General">General</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/*  CORREGIDO: Incluir rol comercial */}
            {['admin', 'comercial'].includes(currentUser?.role) && (
              <Grid item xs={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ color: colors.text }}>Usuario</InputLabel>
                  <Select
                    value={selectedUser}
                    label="Usuario"
                    onChange={(e) => setSelectedUser(e.target.value)}
                    sx={{
                      color: colors.text,
                      backgroundColor: colors.paper,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: colors.shellstone,
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: colors.tan,
                      }
                    }}
                  >
                    <MenuItem value="all">Todos</MenuItem>
                    {Array.from(new Set(processedMessages.map(msg => msg.user))).map(user => (
                      <MenuItem key={user} value={user}>{user}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>

          {/*  CORREGIDO: Pestañas con color borgundy para la seleccionada */}
          <Box sx={{ mt: 2 }}>
            <Tabs
              value={viewMode}
              onChange={(_, newValue) => setViewMode(newValue)}
              sx={{
                '& .MuiTab-root': {
                  color: colors.text,
                  '&.Mui-selected': {
                    color: colors.borgundy, //  Color borgundy para pestaña seleccionada
                  },
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: colors.borgundy, //  Color borgundy para el indicador
                }
              }}
            >
              <Tab value="all" label="Todos" />
              <Tab value="unread" label="No leídos" />
              <Tab value="read" label="Leídos" />
            </Tabs>
          </Box>
        </Box>

        {/* Contenido principal con scroll */}
        <Box sx={{ 
          flex: 1, 
          p: 2, 
          overflow: 'auto',
          backgroundColor: colors.background
        }}>
          {/* Lista principal de mensajes */}
          <Typography variant="h6" gutterBottom sx={{ color: colors.text, fontWeight: 'bold' }}>
            {viewMode === 'unread' ? 'Mensajes No Leídos' : 
             viewMode === 'read' ? 'Mensajes Leídos' : 'Todos los Mensajes'}
          </Typography>

          {filteredMessages.length === 0 ? (
            <Alert 
              severity="info" 
              sx={{ 
                backgroundColor: colors.paper,
                color: colors.text,
                border: `1px solid ${colors.shellstone}`
              }}
            >
              No hay mensajes que coincidan con los filtros seleccionados.
            </Alert>
          ) : (
            <Paper sx={{ 
              backgroundColor: colors.paper,
              border: `1px solid ${colors.shellstone}`
            }}>
              {filteredMessages.map((message) => (
                <Box 
                  key={message.id} 
                  sx={{ 
                    borderBottom: `1px solid ${colors.shellstone}`,
                    '&:last-child': { borderBottom: 'none' }
                  }}
                >
                  <Box 
                    sx={{ 
                      p: 2,
                      cursor: 'pointer',
                      backgroundColor: expandedOrder === message.id ? colors.swanWhite : colors.paper, //  Cambiado a paper
                      '&:hover': {
                        backgroundColor: colors.swanWhite
                      }
                    }}
                    onClick={() => handleExpandOrder(message.id)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                        <Tooltip title={message.read ? "Marcar como no leído" : "Marcar como leído"}>
                          <IconButton 
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              message.read ? markAsUnread(message.id) : markAsRead(message.id);
                            }}
                            sx={{ color: colors.text }}
                          >
                            {message.read ? 
                              <MarkEmailReadIcon /> : 
                              <MarkEmailUnreadIcon />
                            }
                          </IconButton>
                        </Tooltip>
                        {/*  CORREGIDO: Icono de estado del pedido */}
                        <Box sx={{ color: colors.text }}>
                          {getStatusIcon(message.status)}
                        </Box>                        
                        
                        <Box sx={{ flex: 1 }}>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontWeight: message.read ? 'normal' : 'bold', 
                              color: colors.text 
                            }}
                          >
                            {message.orderNumber} - {message.user}
                          </Typography>
                          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                            {message.project} • {message.area}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={message.subType}
                          size="small"
                          sx={{
                            backgroundColor: 
                              message.subType.includes('Productos') ? colors.borgundy : 
                              message.subType.includes('Servicios') ? colors.sapphire : 
                              message.subType.includes('P.Extra') ? colors.tan : colors.shellstone,
                            color: 'white', //  Texto blanco para chips con fondo de color
                            fontWeight: 'bold'
                          }}
                        />
                        
                        <Typography variant="body2" sx={{ color: colors.textSecondary, minWidth: 100, textAlign: 'right' }}>
                          {new Date(message.date).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Collapse in={expandedOrder === message.id}>
                    <OrderDetails order={message} />
                  </Collapse>
                </Box>
              ))}
            </Paper>
          )}
        </Box>
      </Box>

      {/* Diálogo para Editar Estado */}
      <Dialog 
        open={Boolean(statusEditDialog)} 
        onClose={() => setStatusEditDialog(null)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: colors.paper,
            color: colors.text,
            borderRadius: 2,
            border: `1px solid ${colors.shellstone}`
          }
        }}
      >
        {statusEditDialog && (
          <>
            <DialogTitle sx={{ 
              backgroundColor: colors.borgundy, 
              color: colors.paper, //  Texto claro sobre fondo borgundy
              borderBottom: `1px solid ${colors.shellstone}`
            }}>
              Editar Estado del Pedido
            </DialogTitle>
            
            <DialogContent sx={{ mt: 2 }}>
              <Typography variant="body1" sx={{ mb: 2, color: colors.text }}>
                Pedido: <strong>{statusEditDialog.orderNumber}</strong>
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel sx={{ color: colors.text }}>Nuevo Estado</InputLabel>
                <Select
                  value={newStatus}
                  label="Nuevo Estado"
                  onChange={(e) => setNewStatus(e.target.value)}
                  sx={{
                    color: colors.text,
                    backgroundColor: colors.paper,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: colors.shellstone,
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: colors.tan,
                    }
                  }}
                >
                  <MenuItem value="Pendiente">Pendiente</MenuItem>
                  <MenuItem value="En proceso">En proceso</MenuItem>
                  <MenuItem value="Completado">Completado</MenuItem>
                  <MenuItem value="Denegado">Denegado</MenuItem>
                  <MenuItem value="Archivado">Archivado</MenuItem>
                </Select>
              </FormControl>

              {newStatus === 'Denegado' && (
                <>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel sx={{ color: colors.text }}>Motivo de Denegación</InputLabel>
                    <Select
                      value={denialReason}
                      label="Motivo de Denegación"
                      onChange={(e) => setDenialReason(e.target.value)}
                      sx={{
                        color: colors.text,
                        backgroundColor: colors.paper,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: colors.shellstone,
                        }
                      }}
                    >
                      {denialReasons.map((reason, index) => (
                        <MenuItem key={index} value={reason}>
                          {reason}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {denialReason === 'Otra razón' && (
                    <TextField
                      label="Especificar motivo"
                      fullWidth
                      multiline
                      rows={3}
                      value={customDenialReason}
                      onChange={(e) => setCustomDenialReason(e.target.value)}
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
                  )}
                </>
              )}

              {newStatus === 'Completado' && (
                <Alert severity="success" sx={{ mt: 2, backgroundColor: colors.paper }}>
                  Al marcar como "Completado", se mostrará la información de contacto del departamento DST al usuario.
                </Alert>
              )}
            </DialogContent>
            
            <DialogActions sx={{ p: 2, backgroundColor: colors.background }}>
              <Button 
                onClick={() => setStatusEditDialog(null)}
                sx={{ color: colors.text }}
              >
                Cancelar
              </Button>
              <Button 
                variant="contained"
                onClick={handleUpdateStatus}
                disabled={newStatus === 'Denegado' && !denialReason}
                sx={{ 
                  backgroundColor: colors.borgundy,
                  color: colors.paper, //  Texto claro sobre fondo borgundy
                  '&:hover': {
                    backgroundColor: colors.tan,
                  }
                }}
              >
                Actualizar Estado
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Diálogo de Pedidos Archivados */}
      <Dialog 
        open={archivedOrdersDialog} 
        onClose={() => setArchivedOrdersDialog(false)} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: colors.paper,
            color: colors.text,
            borderRadius: 2,
            border: `1px solid ${colors.shellstone}`
          }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: colors.borgundy, 
          color: colors.paper, //  Texto claro sobre fondo borgundy
          borderBottom: `1px solid ${colors.shellstone}`
        }}>
          Pedidos Archivados
        </DialogTitle>
        
        <DialogContent sx={{ mt: 2, maxHeight: '70vh', overflow: 'auto' }}>
          {archivedOrdersList.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2, backgroundColor: colors.paper }}>
              No hay pedidos archivados en el sistema.
            </Alert>
          ) : (
            <Box>
              {archivedOrdersList.map((order) => (
                <Accordion key={order.id} sx={{ 
                  mb: 1, 
                  backgroundColor: colors.paper,
                  border: `1px solid ${colors.shellstone}`
                }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: colors.text }} />}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 'bold', color: colors.text }}>
                          {order.orderNumber} - {order.user}
                        </Typography>
                        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                          {order.project} • {new Date(order.date).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnarchiveOrder(order);
                        }}
                        sx={{
                          borderColor: colors.tan,
                          color: colors.tan,
                          '&:hover': {
                            backgroundColor: colors.tan,
                            color: colors.borgundy
                          }
                        }}
                      >
                        Desarchivar
                      </Button>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <OrderDetails order={order} />
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 2, backgroundColor: colors.background }}>
          <Button 
            onClick={() => setArchivedOrdersDialog(false)}
            sx={{ color: colors.text }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}