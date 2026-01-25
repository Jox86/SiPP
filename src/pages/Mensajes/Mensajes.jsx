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
  Collapse,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Switch,
  Radio,
  RadioGroup,
  FormHelperText
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
  PictureAsPdf as PictureAsPdfIcon,
  Send as SendIcon,
  ContentCopy as ContentCopyIcon,
  ShoppingCart as ShoppingCartIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
  Reply as ReplyIcon,
  History as HistoryIcon
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
    textSecondary: '#3C5070',
    orangeWarning: '#ff4d00'
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
    textSecondary: '#B0BEC5',
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
    case 'Modificado':
      return <EditIcon sx={{ color: '#9c27b0' }} />;
    case 'Propuesta enviada':
      return <SendIcon sx={{ color: '#3f51b5' }} />;
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

// Función para verificar si un pedido fue eliminado del historial
const isOrderDeletedFromHistory = (orderId) => {
  try {
    const purchases = JSON.parse(localStorage.getItem('OASiS_purchases') || '[]');
    const specialOrders = JSON.parse(localStorage.getItem('OASiS_special_orders') || '[]');
    
    const allOrders = [...purchases, ...specialOrders];
    return !allOrders.some(order => order.id === orderId);
  } catch (error) {
    console.error('Error verificando estado del pedido:', error);
    return false;
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
  const [catalogs, setCatalogs] = useLocalStorage('OASiS_catalogs', []);

  // Estados de UI
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedUser, setSelectedUser] = useState('all');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [viewMode, setViewMode] = useState('all');  // 'all', 'modified', 'responded', 'pending'
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [readFilter, setReadFilter] = useState('all'); // 'all', 'read', 'unread'

  // Estados para funcionalidades específicas
  const [statusEditDialog, setStatusEditDialog] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [denialReason, setDenialReason] = useState('');
  const [customDenialReason, setCustomDenialReason] = useState('');
  const [archivedOrdersDialog, setArchivedOrdersDialog] = useState(false);
  const [archivedOrders, setArchivedOrders] = useState([]);
  const [orderDetailsDialog, setOrderDetailsDialog] = useState(null);
  const [proposalDialog, setProposalDialog] = useState(null);
  const [selectionDialog, setSelectionDialog] = useState(null);
  
  // Estados para propuestas y selecciones
  const [proposalForm, setProposalForm] = useState({
    company: '',
    budget: '',
    items: [],
    date: new Date().toISOString().split('T')[0],
    status: 'Pendiente',
    proposalDetails: '',
    serviceDetails: {}
  });
  
  const [selectedItems, setSelectedItems] = useState([]);
  const [rejectionReasons, setRejectionReasons] = useState({});
  const [userResponse, setUserResponse] = useState('');
  const [userCheckboxes, setUserCheckboxes] = useState({});
  const [serviceDetailsForm, setServiceDetailsForm] = useState({
    serviceType: '',
    modality: '',
    participants: '',
    days: '',
    startDate: '',
    locationType: '',
    location: '',
    requirements: '',
    equipmentType: '',
    equipmentQuantity: '',
    softwareType: '',
    areaType: '',
    area: ''
  });

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

  // Opciones para detalles de servicios
  const serviceTypes = [
    'Capacitación',
    'Consultoría',
    'Mantenimiento',
    'Instalación',
    'Desarrollo de Software',
    'Soporte Técnico',
    'Auditoría',
    'Diseño'
  ];

  const modalityOptions = [
    'Online',
    'Presencial',
    'Híbrido'
  ];

  const locationTypeOptions = [
    'Facultad',
    'Dirección',
    'Área',
    'Departamento',
    'Oficina',
    'Otro'
  ];

  const equipmentTypeOptions = [
    'Computadoras',
    'Servidores',
    'Redes',
    'Impresoras',
    'Equipos de comunicación',
    'Equipos especializados',
    'Otro'
  ];

  const softwareTypeOptions = [
    'Sitio Web',
    'Aplicación Móvil',
    'App de Escritorio',
    'Sistema de Gestión',
    'Base de Datos',
    'API',
    'Integración de Sistemas',
    'Otro'
  ];

  const areaOptionsByType = {
    facultad: ['Artes y Letras', 'Biología', 'Colegio Universitario San Gerónimo de La Habana', 'Comunicación', 'Contabilidad y Finanzas', 'Derecho', 'Economía', 'Facultad de Educación a Distancia', 'Facultad de Español para No Hispanohablantes', 'Farmacia y Alimentos', 'Filosofía e Historia', 'Física', 'Geografía', 'Instituto Superior de Diseño', 'Instituto Superior de Tecnologías y Ciencias Aplicadas', 'Lenguas Extranjeras', 'Matemática y Computación', 'Psicología', 'Química', 'Turismo'],
    direccion: ['VRTD', 'DST', 'MC', 'Rectorado'],
    area: ['Comunicación', 'Artes y Letras', 'Jurídica', 'Técnica'],
    departamento: ['Desarrollo', 'Soporte', 'Infraestructura', 'Gestión'],
    oficina: ['Oficina Principal', 'Oficina Regional', 'Oficina Técnica']
  };

  // Marcar mensaje como leído
  const markAsRead = (messageId) => {
    const messageExists = messages.find(msg => msg.id === messageId);
    if (messageExists) {
      const updatedMessages = messages.map(msg =>
        msg.id === messageId ? { ...msg, read: true, readAt: new Date().toISOString() } : msg
      );
      setMessages(updatedMessages);
    } else {
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
    const updatedMessages = messages.map(msg =>
      msg.id === messageId ? { ...msg, read: false, readAt: null } : msg
    );
    setMessages(updatedMessages);
  };

  // Verificar si un pedido está en catálogos
  const isOrderInCatalogs = (order) => {
    if (!order.items || order.items.length === 0) return false;
    
    // Verificar si al menos un item existe en los catálogos
    return order.items.some(item => {
      if (item.dataType === 'products') {
        return catalogs.some(catalog => 
          catalog.dataType === 'products' && 
          catalog.data.some(product => 
            product.name === item.name || 
            product.model === item.model
          )
        );
      }
      return false;
    });
  };

  // Procesar mensajes según los requisitos
  const processedMessages = useMemo(() => {
    const allOrders = [...purchases, ...specialOrders];
    
    const filteredOrders = allOrders.filter(order => {
      // Para admin, comercial y gestor: ver todos los pedidos
      if (['admin', 'comercial', 'gestor'].includes(currentUser?.role)) {
        return true;
      }
      
      // Para usuarios normales: solo ver sus propios pedidos
      return order.userId === currentUser?.id;
    });

    const processed = filteredOrders.flatMap(order => {
      const isSpecial = order.type === 'special';
      const orderDate = new Date(order.date);
      const inCatalogs = isOrderInCatalogs(order);
      const isDeleted = isOrderDeletedFromHistory(order.id);
      
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
          read: messages.some(msg => msg.id === order.id + (isSpecial ? '-special' : '-normal')) || false,
          timestamp: order.date,
          denialReason: order.denialReason,
          statusUpdatedAt: order.statusUpdatedAt,
          statusUpdatedBy: order.statusUpdatedBy,
          archived: true,
          originalOrder: order,
          inCatalogs,
          isModified: order.status === 'Modificado',
          proposal: order.proposal,
          selectedItems: order.selectedItems,
          userResponse: order.userResponse,
          serviceDetails: order.serviceDetails || {},
          isDeleted: isDeleted
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
            total: parseFloat(productItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)) || 0,            
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
            originalOrder: { ...order, items: productItems },
            inCatalogs: isOrderInCatalogs({ ...order, items: productItems }),
            isModified: order.status === 'Modificado',
            proposal: order.proposal,
            selectedItems: order.selectedItems,
            userResponse: order.userResponse,
            rejectionReasons: order.rejectionReasons,
            serviceDetails: order.serviceDetails || {},
            isDeleted: isDeleted
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
            originalOrder: { ...order, items: serviceItems },
            inCatalogs: isOrderInCatalogs({ ...order, items: serviceItems }),
            isModified: order.status === 'Modificado',
            proposal: order.proposal,
            selectedItems: order.selectedItems,
            userResponse: order.userResponse,
            rejectionReasons: order.rejectionReasons,
            serviceDetails: order.serviceDetails || {},
            isDeleted: isDeleted
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
        read: messages.some(msg => msg.id === order.id + (isSpecial ? '-special' : '-normal')) || false,
        timestamp: order.date,
        denialReason: order.denialReason,
        statusUpdatedAt: order.statusUpdatedAt,
        statusUpdatedBy: order.statusUpdatedBy,
        archived: order.status === 'Archivado',
        originalOrder: order,
        inCatalogs: isOrderInCatalogs(order),
        isModified: order.status === 'Modificado',
        proposal: order.proposal,
        selectedItems: order.selectedItems,
        userResponse: order.userResponse,
        rejectionReasons: order.rejectionReasons,
        serviceDetails: order.serviceDetails || {},
        isDeleted: isOrderDeletedFromHistory(order.id)
      };
    }
  }, [purchases, specialOrders, messages, currentUser, catalogs]);

  // Separar mensajes en diferentes categorías
  const archivedOrdersList = useMemo(() => 
    processedMessages.filter(msg => msg.archived), [processedMessages]);

  const activeMessages = useMemo(() => 
    processedMessages.filter(msg => !msg.archived), [processedMessages]);

  const modifiedOrdersList = useMemo(() => 
    processedMessages.filter(msg => msg.isModified), [processedMessages]);

  const respondedOrdersList = useMemo(() => 
    processedMessages.filter(msg => msg.userResponse && !msg.archived), [processedMessages]);

  // Función de búsqueda mejorada
  const searchInMessages = (message, term) => {
    const searchTerm = term.toLowerCase();
    
    // Búsqueda en información básica
    if (
      message.user?.toLowerCase().includes(searchTerm) ||
      message.area?.toLowerCase().includes(searchTerm) ||
      message.project?.toLowerCase().includes(searchTerm) ||
      message.orderNumber?.toLowerCase().includes(searchTerm) ||
      message.type?.toLowerCase().includes(searchTerm)
    ) {
      return true;
    }
    
    // Búsqueda en empresa
    const company = getCompanyFromOrder(message.originalOrder || message);
    if (company.toLowerCase().includes(searchTerm)) {
      return true;
    }
    
    // Búsqueda en productos/servicios
    if (message.items && message.items.length > 0) {
      return message.items.some(item => 
        item.name?.toLowerCase().includes(searchTerm) ||
        item.model?.toLowerCase().includes(searchTerm) ||
        item.description?.toLowerCase().includes(searchTerm) ||
        item.service?.toLowerCase().includes(searchTerm) ||
        item.category?.toLowerCase().includes(searchTerm)
      );
    }
    
    return false;
  };

  // Función para determinar si un pedido está pendiente a procesar
const isOrderPendingProcessing = (message) => {
  // Excluir pedidos archivados, respondidos o modificados
  if (message.archived || message.userResponse || message.isModified) {
    return false;
  }
  
  // Estados que NO se consideran pendientes a procesar
  const excludedStatuses = ['Completado', 'Denegado'];
  if (excludedStatuses.includes(message.status)) {
    return false;
  }
  
  // Pedidos en catálogos: pendientes si admin/comercial no ha seleccionado items
  if (message.inCatalogs) {
    // Pendiente si no tiene selección de items por admin/comercial
    return !message.selectedItems || message.selectedItems.length === 0;
  }
  
  // Pedidos NO en catálogos: pendientes si no hay propuesta o propuesta no respondida
  if (!message.inCatalogs) {
    // Si no hay propuesta enviada, está pendiente
    if (!message.proposal) {
      return true;
    }
    
    // Si hay propuesta pero no hay respuesta, está pendiente
    if (message.proposal && !message.userResponse) {
      return true;
    }
    
    // Si hay propuesta y respuesta, no está pendiente
    return false;
  }
  
  return true;
};

// Filtrar pedidos pendientes a procesar
const pendingProcessingOrders = useMemo(() => 
  activeMessages.filter(msg => isOrderPendingProcessing(msg)), [activeMessages]);

  // Filtrar mensajes según vista seleccionada y filtros
const filteredMessages = useMemo(() => {
  let baseMessages = activeMessages;
  
  // Aplicar filtro de vista principal
  if (viewMode === 'modified') {
    baseMessages = baseMessages.filter(message => message.isModified);
  } else if (viewMode === 'responded') {
    baseMessages = baseMessages.filter(message => message.userResponse);
  } else if (viewMode === 'pending') {
    baseMessages = baseMessages.filter(message => isOrderPendingProcessing(message));
  }
  // 'all' muestra todos los mensajes activos

  // Aplicar filtro de leído/no leído
  if (readFilter === 'read') {
    baseMessages = baseMessages.filter(message => message.read);
  } else if (readFilter === 'unread') {
    baseMessages = baseMessages.filter(message => !message.read);
  }

  return baseMessages.filter(message => {
    const matchesSearch = searchTerm === '' || searchInMessages(message, searchTerm);
    
    const matchesStatus = selectedStatus === 'all' || message.status === selectedStatus;
    const matchesType = selectedType === 'all' || 
      (selectedType === 'Productos' && message.subType.includes('Productos')) ||
      (selectedType === 'Servicios' && message.subType.includes('Servicios')) ||
      (selectedType === 'P.Extra' && message.subType.includes('P.Extra'));
    const matchesUser = selectedUser === 'all' || message.user === selectedUser;

    return matchesSearch && matchesStatus && matchesType && matchesUser;
  });
}, [activeMessages, searchTerm, selectedStatus, selectedType, selectedUser, viewMode, readFilter]);

  // Marcar mensaje como leído automáticamente al expandir
  const handleExpandOrder = (messageId) => {
    const isOpening = expandedOrder !== messageId;
    setExpandedOrder(expandedOrder === messageId ? null : messageId);
    
    // Marcar como leído automáticamente al abrir detalles
    if (isOpening) {
      markAsRead(messageId);
    }
  };

  // Función para archivar pedido
  const handleArchiveOrder = (message) => {
    // Verificar si el pedido fue eliminado
    if (message.isDeleted) {
      addNotification({
        title: 'Acción no permitida',
        message: 'No se puede archivar un pedido eliminado del historial',
        type: 'warning'
      });
      return;
    }

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

    // Verificar si el pedido fue eliminado
    if (statusEditDialog.isDeleted) {
      addNotification({
        title: 'Acción no permitida',
        message: 'No se puede actualizar el estado de un pedido eliminado del historial',
        type: 'warning'
      });
      return;
    }

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

  // Función para manejar selección de items (admin/comercial)
  const handleOpenSelectionDialog = (message) => {
    // Verificar si el pedido fue eliminado
    if (message.isDeleted) {
      addNotification({
        title: 'Acción no permitida',
        message: 'No se puede gestionar un pedido eliminado del historial',
        type: 'warning'
      });
      return;
    }

    setSelectionDialog(message);
    // Inicializar todos los items como seleccionados
    const initialSelected = message.items.map((_, index) => index);
    setSelectedItems(initialSelected);
    setRejectionReasons({});
  };

  const handleSaveSelection = () => {
    if (!selectionDialog) return;

    const isSpecial = selectionDialog.type === 'Pedido Extra';
    const orderId = selectionDialog.orderId;

    try {
      const updateData = {
        status: 'Modificado',
        selectedItems: selectedItems,
        rejectionReasons: rejectionReasons,
        statusUpdatedAt: new Date().toISOString(),
        statusUpdatedBy: currentUser?.fullName || 'Sistema'
      };

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
        title: 'Selección guardada',
        message: 'Los items seleccionados han sido guardados',
        type: 'success'
      });

      setSelectionDialog(null);
      setSelectedItems([]);
      setRejectionReasons({});
      
    } catch (error) {
      console.error('Error guardando selección:', error);
      addNotification({
        title: 'Error',
        message: 'No se pudo guardar la selección',
        type: 'error'
      });
    }
  };

  // Función para manejar propuestas (admin/comercial para pedidos no en catálogos)
  const handleOpenProposalDialog = (message) => {
    // Verificar si el pedido fue eliminado
    if (message.isDeleted) {
      addNotification({
        title: 'Acción no permitida',
        message: 'No se puede enviar propuesta para un pedido eliminado del historial',
        type: 'warning'
      });
      return;
    }

    setProposalDialog(message);
    
    // Inicializar detalles de servicio si existen
    const serviceDetails = message.serviceDetails || {};
    setServiceDetailsForm({
      serviceType: serviceDetails.serviceType || '',
      modality: serviceDetails.modality || '',
      participants: serviceDetails.participants || '',
      days: serviceDetails.days || '',
      startDate: serviceDetails.startDate || '',
      locationType: serviceDetails.locationType || '',
      location: serviceDetails.location || '',
      requirements: serviceDetails.requirements || '',
      equipmentType: serviceDetails.equipmentType || '',
      equipmentQuantity: serviceDetails.equipmentQuantity || '',
      softwareType: serviceDetails.softwareType || '',
      areaType: serviceDetails.areaType || '',
      area: serviceDetails.area || ''
    });
    
    // Obtener todos los detalles de los items del pedido extra
    const itemsDetails = message.items.map(item => {
      let details = '';
      
      // Para pedidos extras de tipo servicio
      if (item.type === 'service' || message.orderType === 'service') {
        details = `Servicio: ${item.serviceType || item.name}\n`;
        details += `Descripción: ${item.description || 'Sin descripción'}\n`;
        if (item.scope) details += `Alcance: ${item.scope}\n`;
        if (item.requirements) details += `Requisitos: ${item.requirements}\n`;
        if (item.quantity) details += `Cantidad: ${item.quantity} días\n`;
      } 
      // Para pedidos extras de tipo producto
      else if (item.type === 'product' || message.orderType === 'product') {
        details = `Producto: ${item.name}\n`;
        details += `Descripción: ${item.description || 'Sin descripción'}\n`;
        if (item.equipmentType) details += `Tipo de equipo: ${item.equipmentType}\n`;
        if (item.characteristics && Object.keys(item.characteristics).length > 0) {
          details += `Características:\n`;
          Object.entries(item.characteristics).forEach(([key, value]) => {
            details += `  - ${key}: ${value}\n`;
          });
        }
        if (item.quantity) details += `Cantidad: ${item.quantity}\n`;
      }
      // Para pedidos normales
      else {
        details = `${item.name || item.service || 'Item'}\n`;
        details += `Descripción: ${item.description || 'Sin descripción'}\n`;
        if (item.price) details += `Precio: $${item.price} CUP\n`;
        if (item.quantity) details += `Cantidad: ${item.quantity}\n`;
        if (item.model) details += `Modelo: ${item.model}\n`;
        if (item.category) details += `Categoría: ${item.category}\n`;
      }
      
      return details;
    }).join('\n---\n\n');

    // Agregar detalles de servicio si existen
    if (Object.keys(serviceDetails).length > 0) {
      itemsDetails += '\nDetalles Específicos del Servicio:\n';
      if (serviceDetails.serviceType) itemsDetails += `Tipo de Servicio: ${serviceDetails.serviceType}\n`;
      if (serviceDetails.modality) itemsDetails += `Modalidad: ${serviceDetails.modality}\n`;
      if (serviceDetails.participants) itemsDetails += `Participantes: ${serviceDetails.participants}\n`;
      if (serviceDetails.days) itemsDetails += `Días: ${serviceDetails.days}\n`;
      if (serviceDetails.startDate) itemsDetails += `Fecha de inicio: ${serviceDetails.startDate}\n`;
      if (serviceDetails.locationType) itemsDetails += `Tipo de lugar: ${serviceDetails.locationType}\n`;
      if (serviceDetails.location) itemsDetails += `Lugar específico: ${serviceDetails.location}\n`;
      if (serviceDetails.requirements) itemsDetails += `Requisitos adicionales: ${serviceDetails.requirements}\n`;
      if (serviceDetails.equipmentType) itemsDetails += `Tipo de equipo: ${serviceDetails.equipmentType}\n`;
      if (serviceDetails.equipmentQuantity) itemsDetails += `Cantidad de equipos: ${serviceDetails.equipmentQuantity}\n`;
      if (serviceDetails.softwareType) itemsDetails += `Tipo de software: ${serviceDetails.softwareType}\n`;
      if (serviceDetails.areaType) itemsDetails += `Tipo de área: ${serviceDetails.areaType}\n`;
      if (serviceDetails.area) itemsDetails += `Área específica: ${serviceDetails.area}\n`;
    }

    setProposalForm({
      company: '',
      budget: '',
      items: message.items || [],
      date: new Date().toISOString().split('T')[0],
      status: 'Propuesta enviada',
      proposalDetails: itemsDetails,
      serviceDetails: serviceDetails
    });
  };

  const handleSendProposal = () => {
    if (!proposalDialog || !proposalForm.company || !proposalForm.budget) return;

    const isSpecial = proposalDialog.type === 'Pedido Extra';
    const orderId = proposalDialog.orderId;

    try {
      // Actualizar el total con el presupuesto de la propuesta
      const updatedTotal = parseFloat(proposalForm.budget) || 0;
      
      const updateData = {
        status: 'Propuesta enviada',
        proposal: {
          ...proposalForm,
          budget: proposalForm.budget,
          serviceDetails: serviceDetailsForm
        },
        total: updatedTotal, // Actualizar el total con el presupuesto de la propuesta
        statusUpdatedAt: new Date().toISOString(),
        statusUpdatedBy: currentUser?.fullName || 'Sistema'
      };

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

      // Agregar notificación push (simulada)
      addNotification({
        title: 'Propuesta enviada',
        message: `Se ha enviado una propuesta al usuario ${proposalDialog.user}`,
        type: 'success'
      });

      setProposalDialog(null);
      setProposalForm({
        company: '',
        budget: '',
        items: [],
        date: new Date().toISOString().split('T')[0],
        status: 'Pendiente',
        proposalDetails: '',
        serviceDetails: {}
      });
      setServiceDetailsForm({
        serviceType: '',
        modality: '',
        participants: '',
        days: '',
        startDate: '',
        locationType: '',
        location: '',
        requirements: '',
        equipmentType: '',
        equipmentQuantity: '',
        softwareType: '',
        areaType: '',
        area: ''
      });
      
    } catch (error) {
      console.error('Error enviando propuesta:', error);
      addNotification({
        title: 'Error',
        message: 'No se pudo enviar la propuesta',
        type: 'error'
      });
    }
  };

  // Función para manejar respuesta del usuario (para pedidos no en catálogos)
  const handleUserResponse = (message, response) => {
    // Solo permitir respuesta si ya hay una propuesta enviada
    if (!message.proposal) {
      addNotification({
        title: 'Error',
        message: 'No hay propuesta para responder',
        type: 'error'
      });
      return;
    }

    const isSpecial = message.type === 'Pedido Extra';
    const orderId = message.orderId;

    try {
      const updateData = {
        userResponse: response,
        status: response === 'Aceptar' ? 'En proceso' : 'Denegado',
        statusUpdatedAt: new Date().toISOString(),
        statusUpdatedBy: currentUser?.fullName || 'Sistema'
      };

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

      // Agregar notificación push (simulada) para admin/comercial
      addNotification({
        title: 'Respuesta recibida',
        message: `El usuario ${message.user} ha ${response === 'Aceptar' ? 'aceptado' : 'rechazado'} la propuesta`,
        type: 'success'
      });

      setUserResponse('');
      
    } catch (error) {
      console.error('Error enviando respuesta:', error);
      addNotification({
        title: 'Error',
        message: 'No se pudo enviar la respuesta',
        type: 'error'
      });
    }
  };

  // Función para manejar checkboxes del usuario (para pedidos no en catálogos)
  const handleUserCheckboxChange = (message, itemId, checked) => {
    setUserCheckboxes(prev => ({
      ...prev,
      [message.id]: {
        ...prev[message.id],
        [itemId]: checked
      }
    }));
  };

  const handleUserSelectionSubmit = (message) => {
    const selectedItems = message.items.filter((item, index) => 
      userCheckboxes[message.id]?.[item.id] || userCheckboxes[message.id]?.[index]
    );

    const isSpecial = message.type === 'Pedido Extra';
    const orderId = message.orderId;

    try {
      const updateData = {
        selectedItems: selectedItems,
        status: 'En proceso',
        statusUpdatedAt: new Date().toISOString(),
        statusUpdatedBy: currentUser?.fullName || 'Sistema'
      };

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
        title: 'Selección enviada',
        message: 'Tu selección ha sido enviada al administrador',
        type: 'success'
      });

      setUserCheckboxes({});
      
    } catch (error) {
      console.error('Error enviando selección:', error);
      addNotification({
        title: 'Error',
        message: 'No se pudo enviar la selección',
        type: 'error'
      });
    }
  };

  // Componente para mostrar detalles expandibles del pedido
  const OrderDetails = ({ order }) => {
    const company = getCompanyFromOrder(order.originalOrder || order);
    
    // Determinar el total a mostrar - Asegurarse de que sea un número
    const displayTotal = order.proposal?.budget 
      ? parseFloat(order.proposal.budget) 
      : parseFloat(order.total || 0);
      
    return (
      <Box sx={{ 
        mt: 2, 
        p: 2, 
        backgroundColor: colors.background, 
        borderRadius: 1,
        opacity: order.isDeleted ? 0.7 : 1,
        border: order.isDeleted ? `2px dashed ${colors.error}` : `1px solid ${colors.shellstone}`
      }}>
        {order.isDeleted && (
          <Alert severity="warning" sx={{ mb: 2, backgroundColor: colors.paper }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: colors.text }}>
              ⚠️ Pedido Eliminado del Historial
            </Typography>
            <Typography variant="body2" sx={{ color: colors.text }}>
              Este pedido ha sido eliminado del historial. Solo está disponible para lectura.
            </Typography>
          </Alert>
        )}
        
        <Typography variant="h6" gutterBottom sx={{ color: colors.text, fontWeight: 'bold' }}>
          Detalles del Pedido

          {/* En el encabezado del pedido */}
          {isOrderPendingProcessing(order) && !order.archived && (
            <Chip
              label="Pendiente a procesar"
              size="small"
              sx={{
                backgroundColor: colors.orangeWarning,
                color: colors.background,
                fontSize: '0.7rem',
                ml: 1
              }}
            />
          )}        
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
              Tipo de Pedido:
            </Typography>
            <Typography variant="body2" sx={{ color: colors.text }}>
              {order.type} - {order.subType}
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
              Total: ${typeof displayTotal === 'number' ? displayTotal.toFixed(2) : '0.00'} {order.currency}
              {order.proposal?.budget && parseFloat(order.proposal.budget) !== parseFloat(order.total || 0) && (
                <Typography component="span" variant="caption" sx={{ color: colors.success, ml: 1, fontStyle: 'italic' }}>
                  (actualizado por propuesta)
                </Typography>
              )}
            </Typography>
            <Typography variant="body2" sx={{ color: colors.text }}>
              Prioridad: {order.priority}
            </Typography>
            <Typography variant="body2" sx={{ color: colors.text }}>
              Estado: {order.status}
            </Typography>
          </Grid>
        </Grid>

        {/* Mostrar detalles específicos de servicio */}
        {order.serviceDetails && Object.keys(order.serviceDetails).length > 0 && (
          <Box sx={{ mt: 2, p: 2, backgroundColor: colors.paper, borderRadius: 1, border: `1px solid ${colors.shellstone}` }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: colors.text, mb: 1 }}>
              📋 Detalles Específicos del Servicio
            </Typography>
            <Grid container spacing={2}>
              {order.serviceDetails.serviceType && (
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: colors.textSecondary }}>
                    Tipo:
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.text }}>
                    {order.serviceDetails.serviceType}
                  </Typography>
                </Grid>
              )}
              {order.serviceDetails.modality && (
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: colors.textSecondary }}>
                    Modalidad:
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.text }}>
                    {order.serviceDetails.modality}
                  </Typography>
                </Grid>
              )}
              {order.serviceDetails.participants && (
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: colors.textSecondary }}>
                    Participantes:
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.text }}>
                    {order.serviceDetails.participants}
                  </Typography>
                </Grid>
              )}
              {order.serviceDetails.days && (
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: colors.textSecondary }}>
                    Días:
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.text }}>
                    {order.serviceDetails.days}
                  </Typography>
                </Grid>
              )}
              {order.serviceDetails.startDate && (
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: colors.textSecondary }}>
                    Fecha inicio:
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.text }}>
                    {order.serviceDetails.startDate}
                  </Typography>
                </Grid>
              )}
              {order.serviceDetails.locationType && (
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: colors.textSecondary }}>
                    Tipo lugar:
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.text }}>
                    {order.serviceDetails.locationType}
                  </Typography>
                </Grid>
              )}
              {order.serviceDetails.location && (
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: colors.textSecondary }}>
                    Lugar:
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.text }}>
                    {order.serviceDetails.location}
                  </Typography>
                </Grid>
              )}
              {order.serviceDetails.areaType && (
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: colors.textSecondary }}>
                    Tipo área:
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.text }}>
                    {order.serviceDetails.areaType}
                  </Typography>
                </Grid>
              )}
              {order.serviceDetails.area && (
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: colors.textSecondary }}>
                    Área:
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.text }}>
                    {order.serviceDetails.area}
                  </Typography>
                </Grid>
              )}
              {order.serviceDetails.equipmentType && (
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: colors.textSecondary }}>
                    Equipo:
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.text }}>
                    {order.serviceDetails.equipmentType}
                  </Typography>
                </Grid>
              )}
              {order.serviceDetails.equipmentQuantity && (
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: colors.textSecondary }}>
                    Cant. equipos:
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.text }}>
                    {order.serviceDetails.equipmentQuantity}
                  </Typography>
                </Grid>
              )}
              {order.serviceDetails.softwareType && (
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: colors.textSecondary }}>
                    Software:
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.text }}>
                    {order.serviceDetails.softwareType}
                  </Typography>
                </Grid>
              )}
              {order.serviceDetails.requirements && (
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: colors.textSecondary }}>
                    Requisitos:
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.text }}>
                    {order.serviceDetails.requirements}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Box>
        )}

        {/* Items del pedido */}
        {order.items && order.items.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: colors.textSecondary, mb: 1 }}>
              {order.subType.includes('Servicio') || order.orderType === 'service' ? 'Servicios Solicitados:' : 
               order.subType.includes('Producto') || order.orderType === 'product' ? 'Productos Solicitados:' : 
               'Items del Pedido:'}
            </Typography>
            {order.items.map((item, index) => (
              <Box key={index} sx={{ 
                p: 2, 
                mb: 1, 
                backgroundColor: colors.paper, 
                borderRadius: 1,
                border: `1px solid ${colors.shellstone}`
              }}>
                {/* Para pedidos extras de tipo servicio */}
                {(item.type === 'service' || order.orderType === 'service') && (
                  <>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: colors.text, mb: 1 }}>
                      Servicio: {item.serviceType || item.name || 'N/A'}
                    </Typography>
                    {item.description && (
                      <Typography variant="body2" sx={{ color: colors.text, mb: 0.5 }}>
                        <strong>Descripción:</strong> {item.description}
                      </Typography>
                    )}
                    {item.scope && (
                      <Typography variant="body2" sx={{ color: colors.text, mb: 0.5 }}>
                        <strong>Alcance:</strong> {item.scope}
                      </Typography>
                    )}
                    {item.requirements && (
                      <Typography variant="body2" sx={{ color: colors.text, mb: 0.5 }}>
                        <strong>Requisitos:</strong> {item.requirements}
                      </Typography>
                    )}
                    {item.quantity && (
                      <Typography variant="body2" sx={{ color: colors.text }}>
                        <strong>Cantidad:</strong> {item.quantity} {order.serviceDetails?.serviceType === 'Capacitación' ? 'días' : 'unidades'}
                      </Typography>
                    )}
                  </>
                )}
                
                {/* Para pedidos extras de tipo producto */}
                {(item.type === 'product' || order.orderType === 'product') && (
                  <>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: colors.text, mb: 1 }}>
                      Producto: {item.name || 'N/A'}
                    </Typography>
                    {item.description && (
                      <Typography variant="body2" sx={{ color: colors.text, mb: 0.5 }}>
                        <strong>Descripción:</strong> {item.description}
                      </Typography>
                    )}
                    {item.equipmentType && (
                      <Typography variant="body2" sx={{ color: colors.text, mb: 0.5 }}>
                        <strong>Tipo de equipo:</strong> {item.equipmentType}
                      </Typography>
                    )}
                    {item.characteristics && Object.keys(item.characteristics).length > 0 && (
                      <Box sx={{ mb: 0.5 }}>
                        <Typography variant="body2" sx={{ color: colors.text, fontWeight: 'bold' }}>
                          Características:
                        </Typography>
                        {Object.entries(item.characteristics).map(([key, value]) => (
                          <Typography key={key} variant="body2" sx={{ color: colors.text, ml: 2 }}>
                            • {key}: {value}
                          </Typography>
                        ))}
                      </Box>
                    )}
                    {item.quantity && (
                      <Typography variant="body2" sx={{ color: colors.text }}>
                        <strong>Cantidad:</strong> {item.quantity}
                      </Typography>
                    )}
                  </>
                )}
                
                {/* Para pedidos regulares */}
                {!item.type && order.orderType !== 'service' && order.orderType !== 'product' && (
                  <>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: colors.text, mb: 1 }}>
                      {item.name || item.service || 'Item'}
                    </Typography>
                    {item.description && (
                      <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                        {item.description}
                      </Typography>
                    )}
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
                    {item.model && (
                      <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                        Modelo: {item.model}
                      </Typography>
                    )}
                    {item.category && (
                      <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                        Categoría: {item.category}
                      </Typography>
                    )}
                  </>
                )}
              </Box>
            ))}
          </Box>
        )}

        {/* Información de pedidos modificados (solo lectura para usuarios) */}
        {order.isModified && order.inCatalogs && currentUser?.role === 'user' && (
          <Alert severity="info" sx={{ mt: 2, backgroundColor: colors.paper }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: colors.text }}>
              Pedido Modificado
            </Typography>
            <Typography variant="body2" sx={{ color: colors.text }}>
              N° Pedido: {order.orderNumber}
            </Typography>
            {order.rejectionReasons && Object.keys(order.rejectionReasons).length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: colors.text }}>
                  Motivos de no selección:
                </Typography>
                {Object.entries(order.rejectionReasons).map(([itemIndex, reason]) => (
                  order.items[itemIndex] && (
                    <Typography key={itemIndex} variant="body2" sx={{ color: colors.textSecondary, ml: 2 }}>
                      • {order.items[itemIndex].name || order.items[itemIndex].service}: {reason}
                    </Typography>
                  )
                ))}
              </Box>
            )}
          </Alert>
        )}

        {/* Propuesta para pedidos no en catálogos (usuario) - SOLO si hay propuesta */}
        {order.proposal && !order.inCatalogs && currentUser?.role === 'user' && (
          <Alert severity="info" sx={{ mt: 2, backgroundColor: colors.paper }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: colors.text, mb: 1 }}>
              Propuesta Recibida
            </Typography>
            
            <Typography variant="body2" sx={{ color: colors.text }}>
              <strong>Empresa:</strong> {order.proposal.company}
            </Typography>
            <Typography variant="body2" sx={{ color: colors.text }}>
              <strong>Presupuesto:</strong> ${order.proposal.budget} CUP
            </Typography>
            <Typography variant="body2" sx={{ color: colors.text }}>
              <strong>Fecha:</strong> {new Date(order.proposal.date).toLocaleDateString()}
            </Typography>
            
            {order.proposal.proposalDetails && (
              <Box sx={{ mt: 1, p: 1, backgroundColor: colors.background, borderRadius: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: colors.text, mb: 0.5 }}>
                  Detalles de la propuesta:
                </Typography>
                <Typography variant="body2" sx={{ color: colors.text, whiteSpace: 'pre-line', fontSize: '0.9rem' }}>
                  {order.proposal.proposalDetails}
                </Typography>
              </Box>
            )}
            
            {!order.userResponse && (
              <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => handleUserResponse(order, 'Aceptar')}
                  sx={{ 
                    backgroundColor: colors.success,
                    '&:hover': { backgroundColor: colors.success }
                  }}
                >
                  Aceptar
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={() => handleUserResponse(order, 'Rechazar')}
                  sx={{ 
                    borderColor: colors.error,
                    color: colors.error,
                    '&:hover': {
                      backgroundColor: colors.error,
                      color: 'white'
                    }
                  }}
                >
                  Rechazar
                </Button>
              </Box>
            )}
            
            {order.userResponse && (
              <Typography variant="body2" sx={{ mt: 1, color: colors.text, fontStyle: 'italic' }}>
                Ya has respondido: <strong>{order.userResponse}</strong>
              </Typography>
            )}
          </Alert>
        )}

        {/* Checkboxes para usuario en pedidos no en catálogos - SOLO si NO hay propuesta todavía */}
        {!order.inCatalogs && currentUser?.role === 'user' && !order.proposal && !order.userResponse && !order.isDeleted && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: colors.textSecondary, mb: 1 }}>
              Selecciona los productos/servicios que deseas:
            </Typography>
            <FormGroup>
              {order.items.map((item, index) => (
                <FormControlLabel
                  key={index}
                  control={
                    <Checkbox
                      checked={userCheckboxes[order.id]?.[item.id] || userCheckboxes[order.id]?.[index] || false}
                      onChange={(e) => handleUserCheckboxChange(order, item.id || index, e.target.checked)}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" sx={{ color: colors.text }}>
                        {item.name || item.service || item.serviceType || 'Item'}
                      </Typography>
                      {item.price && (
                        <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: '0.8rem' }}>
                          ${item.price} CUP
                        </Typography>
                      )}
                    </Box>
                  }
                />
              ))}
            </FormGroup>
            <Button
              variant="contained"
              onClick={() => handleUserSelectionSubmit(order)}
              sx={{ mt: 1 }}
            >
              Enviar Selección
            </Button>
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

        {/* Acciones según rol - BLOQUEADAS si pedido eliminado */}
        {!order.archived && !order.isDeleted && (
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {/* Rol Admin/Comercial */}
            {['admin', 'comercial'].includes(currentUser?.role) && (
              <>
                {order.inCatalogs ? (
                  <>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<AssignmentTurnedInIcon />}
                      onClick={() => handleOpenSelectionDialog(order)}
                      sx={{ 
                        borderColor: colors.sapphire,
                        color: colors.sapphire,
                        '&:hover': {
                          backgroundColor: colors.sapphire,
                          color: colors.background
                        }
                      }}
                    >
                      Seleccionar Items
                    </Button>
                  </>
                ) : (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<SendIcon />}
                    onClick={() => handleOpenProposalDialog(order)}
                    sx={{ 
                      borderColor: colors.tan,
                      color: colors.tan,
                      '&:hover': {
                        backgroundColor: colors.tan,
                        color: colors.borgundy
                      }
                    }}
                    disabled={order.proposal} // Deshabilitar si ya hay propuesta
                  >
                    {order.proposal ? 'Propuesta Enviada' : 'Enviar Propuesta'}
                  </Button>
                )}
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
              </>
            )}
            
            {/* Rol Admin/Comercial/Gestor puede archivar */}
            {['admin', 'comercial', 'gestor'].includes(currentUser?.role) && (
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
            )}
          </Box>
        )}

        {/* Mensaje si pedido eliminado */}
        {order.isDeleted && (
          <Alert severity="info" sx={{ mt: 2, backgroundColor: colors.paper }}>
            <Typography variant="body2" sx={{ color: colors.text }}>
              Este pedido ha sido eliminado del historial. Solo está disponible para lectura.
            </Typography>
          </Alert>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ 
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
      backgroundColor: colors.paper,
      color: colors.text,
    }}>
      {/* Contenido Principal */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden',
        marginTop: 6, 
      }}>
        {/* Header */}
        <AppBar 
          position="static" 
          sx={{ 
            backgroundColor: colors.paper,
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
              gap: 2,
            }}>
              <MailIcon sx={{ fontSize: 32, marginTop: 1, color: colors.text }} />
              Mensajes
            </Typography>
            
            {/* Botón para pedidos archivados */}
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
              Archivados {archivedOrdersList.length > 0 && `(${archivedOrdersList.length})`}
            </Button>
          </Toolbar>
        </AppBar>

        {/* Barra de herramientas */}
        <Box sx={{ 
          p: 2, 
          backgroundColor: colors.paper,
          borderBottom: `1px solid ${colors.shellstone}` 
        }}>
          <Grid container spacing={2} alignItems="center">
            {/* Búsqueda mejorada */}
            <Grid item xs={12} md={4}>
              <TextField
                placeholder="Buscar por empresa, producto, modelo, descripción..."
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
                  <MenuItem value="Modificado">Modificado</MenuItem>
                  <MenuItem value="Propuesta enviada">Propuesta enviada</MenuItem>
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
                </Select>
              </FormControl>
            </Grid>

            {/* Filtro de Leído/No leído */}
            <Grid item xs={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ color: colors.text }}>Estado lectura</InputLabel>
                <Select
                  value={readFilter}
                  label="Estado lectura"
                  onChange={(e) => setReadFilter(e.target.value)}
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
                  <MenuItem value="read">Leídos</MenuItem>
                  <MenuItem value="unread">No leídos</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Incluir roles admin, comercial y gestor */}
            {['admin', 'comercial', 'gestor'].includes(currentUser?.role) && (
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

          {/* Pestañas incluyendo "Modificados", "Respondidos" y "Pendientes" */}
          <Box sx={{ mt: 2 }}>
            <Tabs
              value={viewMode}
              onChange={(_, newValue) => setViewMode(newValue)}
              sx={{
                '& .MuiTab-root': {
                  color: colors.text,
                  '&.Mui-selected': {
                    color: colors.borgundy,
                  },
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: colors.borgundy,
                }
              }}
            >
              <Tab value="all" label="Todos" />
              <Tab value="pending" label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Pendientes
                  {pendingProcessingOrders.length > 0 && (
                    <Chip 
                      label={pendingProcessingOrders.length}
                      size="small"
                      sx={{ 
                        ml: 1, 
                        height: 20, 
                        minWidth: 20,
                        fontSize: '0.75rem',
                        backgroundColor: colors.warning,
                        color: colors.orangeWarning
                      }}
                    />
                  )}
                </Box>
              } />
              <Tab value="modified" label="Modificados" />
              <Tab value="responded" label="Respondidos" />
            </Tabs>
          </Box>
        </Box>

        {/* Contenido principal con scroll */}
        <Box sx={{ 
          flex: 1, 
          p: 2, 
          overflow: 'auto',
          backgroundColor: colors.paper
        }}>
          {/* Lista principal de mensajes */}
          <Typography variant="h6" gutterBottom sx={{ color: colors.text, fontWeight: 'bold' }}>
            {viewMode === 'modified' ? 'Pedidos Modificados' : 
            viewMode === 'responded' ? 'Pedidos Respondidos' : 
            viewMode === 'pending' ? 'Pendientes a Procesar' : 
            'Todos los Mensajes'}
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
              {viewMode === 'modified' 
                ? 'No hay pedidos modificados.' 
                : viewMode === 'responded'
                ? 'No hay pedidos respondidos.'
                : 'No hay mensajes que coincidan con los filtros seleccionados.'}
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
                    '&:last-child': { borderBottom: 'none' },
                    opacity: message.isDeleted ? 0.7 : 1,
                    backgroundColor: message.isDeleted ? colors.background : 'inherit'
                  }}
                >
                  <Box 
                    sx={{ 
                      p: 2,
                      cursor: 'pointer',
                      backgroundColor: expandedOrder === message.id ? colors.swanWhite : colors.paper,
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
                              if (message.read) {
                                markAsUnread(message.id);
                              } else {
                                markAsRead(message.id);
                              }
                            }}
                            sx={{ color: colors.text }}
                            disabled={message.isDeleted}
                          >
                            {message.read ? 
                              <MarkEmailReadIcon /> : 
                              <MarkEmailUnreadIcon />
                            }
                          </IconButton>
                        </Tooltip>
                        {/* Icono de estado del pedido */}
                        <Box sx={{ color: colors.text }}>
                          {getStatusIcon(message.status)}
                        </Box>                        
                        
                        <Box sx={{ flex: 1 }}>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontWeight: message.read ? 'normal' : 'bold', 
                              color: colors.text,
                              textDecoration: message.isDeleted ? 'line-through' : 'none'
                            }}
                          >
                            {message.orderNumber} - {message.user}
                            {message.isDeleted && (
                              <Typography component="span" variant="caption" sx={{ color: colors.error, ml: 1 }}>
                                (Eliminado)
                              </Typography>
                            )}
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
                            color: 'white',
                            fontWeight: 'bold',
                            opacity: message.isDeleted ? 0.6 : 1
                          }}
                        />
                        
                        {/* Indicador si está en catálogos */}
                        {message.inCatalogs && !message.isDeleted && (
                          <Tooltip title="Pedido en catálogos">
                            <ShoppingCartIcon sx={{ color: colors.success, fontSize: 18 }} />
                          </Tooltip>
                        )}
                        
                        {/* Indicador si está modificado */}
                        {message.isModified && !message.isDeleted && (
                          <Tooltip title="Pedido modificado">
                            <EditIcon sx={{ color: colors.warning, fontSize: 18 }} />
                          </Tooltip>
                        )}
                        
                        {/* Indicador si tiene propuesta */}
                        {message.proposal && !message.isDeleted && (
                          <Tooltip title="Propuesta enviada">
                            <SendIcon sx={{ color: colors.info, fontSize: 18 }} />
                          </Tooltip>
                        )}
                        
                        {/* Indicador si fue respondido */}
                        {message.userResponse && !message.isDeleted && (
                          <Tooltip title={`Respondido: ${message.userResponse}`}>
                            <ReplyIcon sx={{ 
                              color: message.userResponse === 'Aceptar' ? colors.success : colors.error, 
                              fontSize: 18 
                            }} />
                          </Tooltip>
                        )}
                        
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
              color: colors.paper,
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
                  <MenuItem value="Modificado">Modificado</MenuItem>
                  <MenuItem value="Propuesta enviada">Propuesta enviada</MenuItem>
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
                  color: colors.paper,
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

      {/* Diálogo de Selección de Items (Admin/Comercial para pedidos en catálogos) */}
      <Dialog 
        open={Boolean(selectionDialog)} 
        onClose={() => setSelectionDialog(null)} 
        maxWidth="md" 
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
        {selectionDialog && (
          <>
            <DialogTitle sx={{ 
              backgroundColor: colors.sapphire, 
              color: colors.paper,
              borderBottom: `1px solid ${colors.shellstone}`
            }}>
              Seleccionar Items del Pedido
            </DialogTitle>
            
            <DialogContent sx={{ mt: 2 }}>
              <Typography variant="body1" sx={{ mb: 2, color: colors.text }}>
                Pedido: <strong>{selectionDialog.orderNumber}</strong>
              </Typography>
              <Typography variant="body2" sx={{ mb: 3, color: colors.textSecondary }}>
                Seleccione los items que desea aprobar. Los items no seleccionados requerirán un motivo de rechazo.
              </Typography>
              
              <FormGroup>
                {selectionDialog.items.map((item, index) => (
                  <Box key={index} sx={{ 
                    mb: 2, 
                    p: 2, 
                    border: `1px solid ${colors.shellstone}`,
                    borderRadius: 1,
                    backgroundColor: selectedItems.includes(index) ? colors.swanWhite : colors.paper
                  }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedItems.includes(index)}
                          onChange={() => handleItemSelection(index)}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 'bold', color: colors.text }}>
                            {item.name || item.service || item.serviceType || 'Item'}
                          </Typography>
                          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                            {item.description || 'Sin descripción'}
                          </Typography>
                          {item.price && (
                            <Typography variant="body2" sx={{ color: colors.text }}>
                              Precio: ${item.price?.toFixed(2)} CUP
                            </Typography>
                          )}
                          {item.quantity && (
                            <Typography variant="body2" sx={{ color: colors.text }}>
                              Cantidad: {item.quantity}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                    
                    {/* Input para motivo de rechazo si no está seleccionado */}
                    {!selectedItems.includes(index) && (
                      <TextField
                        label="Motivo de no selección"
                        fullWidth
                        multiline
                        rows={2}
                        value={rejectionReasons[index] || ''}
                        onChange={(e) => setRejectionReasons(prev => ({
                          ...prev,
                          [index]: e.target.value
                        }))}
                        margin="normal"
                        size="small"
                        sx={{
                          mt: 1,
                          '& .MuiOutlinedInput-root': {
                            color: colors.text,
                            '& fieldset': {
                              borderColor: colors.shellstone,
                            },
                          }
                        }}
                      />
                    )}
                  </Box>
                ))}
              </FormGroup>
            </DialogContent>
            
            <DialogActions sx={{ p: 2, backgroundColor: colors.background }}>
              <Button 
                onClick={() => setSelectionDialog(null)}
                sx={{ color: colors.text }}
              >
                Cancelar
              </Button>
              <Button 
                variant="contained"
                onClick={handleSaveSelection}
                sx={{ 
                  backgroundColor: colors.sapphire,
                  color: colors.paper,
                  '&:hover': {
                    backgroundColor: colors.tan,
                  }
                }}
              >
                Guardar Selección
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Diálogo de Envío de Propuesta (Admin/Comercial para pedidos no en catálogos) - CON DETALLES DE SERVICIO */}
      <Dialog 
        open={Boolean(proposalDialog)} 
        onClose={() => setProposalDialog(null)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: colors.paper,
            color: colors.text,
            borderRadius: 2,
            border: `1px solid ${colors.shellstone}`,
            maxHeight: '90vh'
          }
        }}
      >
        {proposalDialog && (
          <>
            <DialogTitle sx={{ 
              backgroundColor: colors.tan, 
              color: colors.borgundy,
              borderBottom: `1px solid ${colors.shellstone}`
            }}>
              Enviar Propuesta al Usuario
            </DialogTitle>
            
            <DialogContent sx={{ mt: 2, overflow: 'auto' }}>
              <Typography variant="body1" sx={{ mb: 2, color: colors.text }}>
                Pedido: <strong>{proposalDialog.orderNumber}</strong> - Tipo: {proposalDialog.orderType === 'service' ? 'Servicio' : 'Producto'}
              </Typography>
              
              {/* Información básica de la propuesta */}
              <TextField
                label="Empresa Proveedora"
                fullWidth
                value={proposalForm.company}
                onChange={(e) => setProposalForm(prev => ({ ...prev, company: e.target.value }))}
                margin="normal"
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: colors.text,
                    '& fieldset': {
                      borderColor: colors.shellstone,
                    },
                  }
                }}
              />
              
              <TextField
                label="Presupuesto Total (CUP)"
                fullWidth
                type="number"
                value={proposalForm.budget}
                onChange={(e) => setProposalForm(prev => ({ ...prev, budget: e.target.value }))}
                margin="normal"
                required
                helperText="Este valor actualizará el total del pedido"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: colors.text,
                    '& fieldset': {
                      borderColor: colors.shellstone,
                    },
                  }
                }}
              />
              
              <TextField
                label="Fecha de propuesta"
                fullWidth
                type="date"
                value={proposalForm.date}
                onChange={(e) => setProposalForm(prev => ({ ...prev, date: e.target.value }))}
                margin="normal"
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: colors.text,
                    '& fieldset': {
                      borderColor: colors.shellstone,
                    },
                  }
                }}
              />
              
              {/* Detalles específicos de servicios */}
              {proposalDialog.orderType === 'service' && (
                <Box sx={{ mt: 3, p: 2, backgroundColor: colors.background, borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ color: colors.text, mb: 2, fontWeight: 'bold' }}>
                    📋 Detalles del Servicio
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth margin="normal" size="small">
                        <InputLabel>Tipo de Servicio</InputLabel>
                        <Select
                          value={serviceDetailsForm.serviceType}
                          onChange={(e) => setServiceDetailsForm(prev => ({ ...prev, serviceType: e.target.value }))}
                          label="Tipo de Servicio"
                        >
                          <MenuItem value="">Seleccionar</MenuItem>
                          {serviceTypes.map(type => (
                            <MenuItem key={type} value={type}>{type}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth margin="normal" size="small">
                        <InputLabel>Modalidad</InputLabel>
                        <Select
                          value={serviceDetailsForm.modality}
                          onChange={(e) => setServiceDetailsForm(prev => ({ ...prev, modality: e.target.value }))}
                          label="Modalidad"
                        >
                          <MenuItem value="">Seleccionar</MenuItem>
                          {modalityOptions.map(modality => (
                            <MenuItem key={modality} value={modality}>{modality}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    {/* Campos específicos según tipo de servicio */}
                    {serviceDetailsForm.serviceType && (
                      <>
                        {['Capacitación', 'Consultoría'].includes(serviceDetailsForm.serviceType) && (
                          <>
                            <Grid item xs={6} sm={3}>
                              <TextField
                                label="Participantes"
                                fullWidth
                                type="number"
                                value={serviceDetailsForm.participants}
                                onChange={(e) => setServiceDetailsForm(prev => ({ ...prev, participants: e.target.value }))}
                                margin="normal"
                                size="small"
                              />
                            </Grid>
                            <Grid item xs={6} sm={3}>
                              <TextField
                                label="Días"
                                fullWidth
                                type="number"
                                value={serviceDetailsForm.days}
                                onChange={(e) => setServiceDetailsForm(prev => ({ ...prev, days: e.target.value }))}
                                margin="normal"
                                size="small"
                              />
                            </Grid>
                            <Grid item xs={6} sm={3}>
                              <TextField
                                label="Fecha inicio"
                                fullWidth
                                type="date"
                                value={serviceDetailsForm.startDate}
                                onChange={(e) => setServiceDetailsForm(prev => ({ ...prev, startDate: e.target.value }))}
                                margin="normal"
                                size="small"
                                InputLabelProps={{ shrink: true }}
                              />
                            </Grid>
                            <Grid item xs={6} sm={3}>
                              <FormControl fullWidth margin="normal" size="small">
                                <InputLabel>Tipo de Área</InputLabel>
                                <Select
                                  value={serviceDetailsForm.areaType}
                                  onChange={(e) => setServiceDetailsForm(prev => ({ 
                                    ...prev, 
                                    areaType: e.target.value,
                                    area: ''
                                  }))}
                                  label="Tipo de Área"
                                >
                                  <MenuItem value="">Seleccionar</MenuItem>
                                  <MenuItem value="facultad">Facultad</MenuItem>
                                  <MenuItem value="direccion">Dirección</MenuItem>
                                  <MenuItem value="area">Área</MenuItem>
                                  <MenuItem value="departamento">Departamento</MenuItem>
                                  <MenuItem value="oficina">Oficina</MenuItem>
                                </Select>
                              </FormControl>
                            </Grid>
                            {serviceDetailsForm.areaType && (
                              <Grid item xs={12} sm={6}>
                                <FormControl fullWidth margin="normal" size="small">
                                  <InputLabel>Área específica</InputLabel>
                                  <Select
                                    value={serviceDetailsForm.area}
                                    onChange={(e) => setServiceDetailsForm(prev => ({ ...prev, area: e.target.value }))}
                                    label="Área específica"
                                    disabled={!serviceDetailsForm.areaType}
                                  >
                                    <MenuItem value="">Seleccionar</MenuItem>
                                    {areaOptionsByType[serviceDetailsForm.areaType]?.map(area => (
                                      <MenuItem key={area} value={area}>{area}</MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              </Grid>
                            )}
                          </>
                        )}
                        
                        {['Mantenimiento', 'Instalación'].includes(serviceDetailsForm.serviceType) && (
                          <>
                            <Grid item xs={6} sm={4}>
                              <FormControl fullWidth margin="normal" size="small">
                                <InputLabel>Tipo de equipo</InputLabel>
                                <Select
                                  value={serviceDetailsForm.equipmentType}
                                  onChange={(e) => setServiceDetailsForm(prev => ({ ...prev, equipmentType: e.target.value }))}
                                  label="Tipo de equipo"
                                >
                                  <MenuItem value="">Seleccionar</MenuItem>
                                  {equipmentTypeOptions.map(equipment => (
                                    <MenuItem key={equipment} value={equipment}>{equipment}</MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </Grid>
                            <Grid item xs={6} sm={4}>
                              <TextField
                                label="Cantidad de equipos"
                                fullWidth
                                type="number"
                                value={serviceDetailsForm.equipmentQuantity}
                                onChange={(e) => setServiceDetailsForm(prev => ({ ...prev, equipmentQuantity: e.target.value }))}
                                margin="normal"
                                size="small"
                              />
                            </Grid>
                          </>
                        )}
                        
                        {serviceDetailsForm.serviceType === 'Desarrollo de Software' && (
                          <Grid item xs={12} sm={6}>
                            <FormControl fullWidth margin="normal" size="small">
                              <InputLabel>Tipo de software</InputLabel>
                              <Select
                                value={serviceDetailsForm.softwareType}
                                onChange={(e) => setServiceDetailsForm(prev => ({ ...prev, softwareType: e.target.value }))}
                                label="Tipo de software"
                              >
                                <MenuItem value="">Seleccionar</MenuItem>
                                {softwareTypeOptions.map(software => (
                                  <MenuItem key={software} value={software}>{software}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                        )}
                        
                        <Grid item xs={12}>
                          <FormControl fullWidth margin="normal" size="small">
                            <InputLabel>Tipo de lugar</InputLabel>
                            <Select
                              value={serviceDetailsForm.locationType}
                              onChange={(e) => setServiceDetailsForm(prev => ({ ...prev, locationType: e.target.value }))}
                              label="Tipo de lugar"
                            >
                              <MenuItem value="">Seleccionar</MenuItem>
                              {locationTypeOptions.map(location => (
                                <MenuItem key={location} value={location}>{location}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        
                        <Grid item xs={12}>
                          <TextField
                            label="Requisitos adicionales"
                            fullWidth
                            multiline
                            rows={2}
                            value={serviceDetailsForm.requirements}
                            onChange={(e) => setServiceDetailsForm(prev => ({ ...prev, requirements: e.target.value }))}
                            margin="normal"
                            size="small"
                            placeholder={
                              serviceDetailsForm.modality === 'Online' 
                                ? 'Ej: Necesita wifi estable, cámara, computadora, micrófono...' 
                                : 'Ej: Proyector, sala con aire acondicionado, mobiliario...'
                            }
                          />
                        </Grid>
                      </>
                    )}
                  </Grid>
                </Box>
              )}
              
              {/* Detalles del pedido del usuario */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ color: colors.text, mb: 1, fontWeight: 'bold' }}>
                  Detalles del pedido del usuario:
                </Typography>
                <Paper sx={{ 
                  p: 2, 
                  backgroundColor: colors.background, 
                  borderRadius: 1,
                  border: `1px solid ${colors.shellstone}`,
                  maxHeight: '200px',
                  overflow: 'auto'
                }}>
                  <Typography variant="body2" sx={{ color: colors.text, whiteSpace: 'pre-line', fontSize: '0.9rem' }}>
                    {proposalForm.proposalDetails}
                  </Typography>
                </Paper>
              </Box>
              
              <TextField
                label="Detalles adicionales de la propuesta (opcional)"
                fullWidth
                multiline
                rows={3}
                value={proposalForm.additionalDetails || ''}
                onChange={(e) => setProposalForm(prev => ({ 
                  ...prev, 
                  additionalDetails: e.target.value 
                }))}
                margin="normal"
                sx={{
                  mt: 2,
                  '& .MuiOutlinedInput-root': {
                    color: colors.text,
                    '& fieldset': {
                      borderColor: colors.shellstone,
                    },
                  }
                }}
                placeholder="Agregue cualquier detalle adicional sobre la propuesta..."
              />
            </DialogContent>
            
            <DialogActions sx={{ p: 2, backgroundColor: colors.background }}>
              <Button 
                onClick={() => setProposalDialog(null)}
                sx={{ color: colors.text }}
              >
                Cancelar
              </Button>
              <Button 
                variant="contained"
                onClick={handleSendProposal}
                disabled={!proposalForm.company || !proposalForm.budget}
                sx={{ 
                  backgroundColor: colors.tan,
                  color: colors.borgundy,
                  '&:hover': {
                    backgroundColor: colors.borgundy,
                    color: colors.tan
                  }
                }}
              >
                Enviar Propuesta
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
          color: colors.paper,
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
                  border: `1px solid ${colors.shellstone}`,
                  opacity: order.isDeleted ? 0.7 : 1
                }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: colors.text }} />}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 'bold', color: colors.text }}>
                          {order.orderNumber} - {order.user}
                          {order.isDeleted && (
                            <Typography component="span" variant="caption" sx={{ color: colors.error, ml: 1 }}>
                              (Eliminado)
                            </Typography>
                          )}
                        </Typography>
                        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                          {order.project} • {new Date(order.date).toLocaleDateString()}
                        </Typography>
                      </Box>
                      {!order.isDeleted && (
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
                      )}
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