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
  FormHelperText,
  RadioGroup as MuiRadioGroup,
  FormControlLabel as MuiFormControlLabel,
  Radio as MuiRadio
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
  History as HistoryIcon,
  Add as AddIcon,
  PlayArrow as PlayArrowIcon
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
    orangeWarning: '#ff4d00',
    success: '#4caf50',
    error: '#f44336',
    warning: '#ff9800',
    info: '#2196f3',
    border: '#E2E8F0'
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
    success: '#388e3c',
    error: '#d32f2f',
    warning: '#f57c00',
    info: '#1976d2',
    border: '#4A5568'
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
    case 'Respondido':
      return <ReplyIcon sx={{ color: '#4caf50' }} />;
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

// Función para extraer tipo de servicio desde la solicitud
const extractServiceTypeFromRequest = (order) => {
  if (order.characteristics?.name) {
    const name = order.characteristics.name.toLowerCase();
    if (name.includes('capacitación')) return 'Capacitación';
    if (name.includes('consultoría')) return 'Consultoría';
    if (name.includes('mantenimiento')) return 'Mantenimiento';
    if (name.includes('instalación')) return 'Instalación';
    if (name.includes('training')) return 'Capacitación';
  }
  
  if (order.items && order.items.length > 0) {
    const firstItem = order.items[0];
    if (firstItem.serviceType) return firstItem.serviceType;
    if (firstItem.name) {
      const itemName = firstItem.name.toLowerCase();
      if (itemName.includes('capacitación') || itemName.includes('training')) {
        return 'Capacitación';
      }
    }
  }
  
  return order.orderType === 'service' ? 'Servicio General' : 'Producto';
};

// Hook useUserLocalStorage para almacenamiento específico por usuario
const useUserLocalStorage = (key, initialValue, userId) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const userKey = `${key}_${userId}`;
      const item = localStorage.getItem(userKey);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading ${key} for user ${userId}:`, error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      setStoredValue(value);
      const userKey = `${key}_${userId}`;
      localStorage.setItem(userKey, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving ${key} for user ${userId}:`, error);
    }
  };

  return [storedValue, setValue];
};

// Función para calcular la opción más óptima
const calculateOptimalOption = (companies) => {
  if (!companies || companies.length === 0) return null;
  
  const optimal = companies.reduce((best, current, index) => {
    const currentBudget = parseFloat(current.budget) || 0;
    const bestBudget = parseFloat(best.budget) || 0;
    
    const hasRecommended = current.company?.toLowerCase().includes('recomendad') || 
                          current.company?.toLowerCase().includes('preferent') ||
                          current.tariff?.toLowerCase().includes('recomendad') ||
                          current.tariff?.toLowerCase().includes('preferent');
    
    if (hasRecommended) return { ...current, index };
    
    if (currentBudget < bestBudget) return { ...current, index };
    
    if (currentBudget === bestBudget) {
      const currentHasGoodTariff = current.tariff?.toLowerCase().includes('favorable') || 
                                  current.tariff?.toLowerCase().includes('especial');
      const bestHasGoodTariff = best.tariff?.toLowerCase().includes('favorable') || 
                               best.tariff?.toLowerCase().includes('especial');
      
      if (currentHasGoodTariff && !bestHasGoodTariff) {
        return { ...current, index };
      }
    }
    
    return best;
  }, { ...companies[0], index: 0 });
  
  return optimal;
};

// Función para determinar si es servicio regular del catálogo
const isRegularServiceFromCatalog = (order) => {
  return order.subType.includes('Servicios') && order.inCatalogs;
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

  // Estados para datos - USAR STORAGE ESPECÍFICO POR USUARIO
  const [purchases, setPurchases] = useLocalStorage('OASiS_purchases', []);
  const [specialOrders, setSpecialOrders] = useLocalStorage('OASiS_special_orders', []);
  const [catalogs, setCatalogs] = useLocalStorage('OASiS_catalogs', []);
  
  // Mensajes específicos por usuario
  const [messages, setMessages] = useUserLocalStorage(
    'OASiS_messages', 
    [], 
    currentUser?.id || 'guest'
  );

  // Estados de UI
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedUser, setSelectedUser] = useState('all');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [viewMode, setViewMode] = useState('all');  // 'all', 'responded', 'pending'
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
  const [proposalCompanies, setProposalCompanies] = useState([
    { company: '', budget: '', tariff: '' }
  ]);
  
  const [selectedCompanyIndex, setSelectedCompanyIndex] = useState(-1);
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
    area: '',
    equipment: []
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
    direccion: ['Vicerrectoría de Transformación Digital VRTD', 'Dirección de Servicios Tecnológicos DST', 'Dirección de Comunicaciones', 'Dirección de Innovación Digital DID', 'Rectorado'],
    area: ['Comunicación', 'Artes y Letras', 'Jurídica', 'Técnica'],
    departamento: ['Desarrollo', 'Soporte', 'Infraestructura', 'Gestión'],
    oficina: ['Oficina Principal', 'Oficina Regional', 'Oficina Técnica']
  };

  // Funciones para manejar múltiples empresas
  const handleCompanyChange = (index, field, value) => {
    const updatedCompanies = [...proposalCompanies];
    updatedCompanies[index][field] = value;
    setProposalCompanies(updatedCompanies);
  };

  const handleAddCompany = () => {
    setProposalCompanies([
      ...proposalCompanies,
      { company: '', budget: '', tariff: '' }
    ]);
  };

  const handleRemoveCompany = (index) => {
    if (proposalCompanies.length > 1) {
      const updatedCompanies = proposalCompanies.filter((_, i) => i !== index);
      setProposalCompanies(updatedCompanies);
    }
  };

  // Función para manejar equipamiento Online
  const handleEquipmentChange = (equipment, checked) => {
    setServiceDetailsForm(prev => {
      const equipmentArray = prev.equipment || [];
      if (checked) {
        return { ...prev, equipment: [...equipmentArray, equipment] };
      } else {
        return { ...prev, equipment: equipmentArray.filter(item => item !== equipment) };
      }
    });
  };

  // Marcar mensaje como leído - ESPECÍFICO POR USUARIO
  const markAsRead = (messageId) => {
    const messageExists = messages.find(msg => msg.id === messageId);
    if (messageExists) {
      const updatedMessages = messages.map(msg =>
        msg.id === messageId ? { 
          ...msg, 
          read: true, 
          readAt: new Date().toISOString(),
          readBy: currentUser?.id 
        } : msg
      );
      setMessages(updatedMessages);
    } else {
      const newMessage = {
        id: messageId,
        read: true,
        readAt: new Date().toISOString(),
        readBy: currentUser?.id
      };
      setMessages([...messages, newMessage]);
    }
  };

  // Marcar mensaje como no leído - ESPECÍFICO POR USUARIO
  const markAsUnread = (messageId) => {
    const updatedMessages = messages.map(msg =>
      msg.id === messageId ? { 
        ...msg, 
        read: false, 
        readAt: null,
        readBy: null 
      } : msg
    );
    setMessages(updatedMessages);
  };

  // Función para verificar si un mensaje está leído para el usuario actual
  const isMessageReadForCurrentUser = (messageId) => {
    const message = messages.find(msg => msg.id === messageId);
    return message ? message.read : false;
  };

  // Verificar si un pedido está en catálogos
  const isOrderInCatalogs = (order) => {
    if (!order.items || order.items.length === 0) return false;
    
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

  // Procesar mensajes según los requisitos - ORGANIZADOS POR NÚMERO DE PEDIDO
  const processedMessages = useMemo(() => {
    const allOrders = [...purchases, ...specialOrders];
    
    const filteredOrders = allOrders.filter(order => {
      if (['admin', 'comercial', 'gestor'].includes(currentUser?.role)) {
        return true;
      }
      
      return order.userId === currentUser?.id;
    });

    // Agrupar por número de pedido
    const ordersByNumber = {};
    
    filteredOrders.forEach(order => {
      const isSpecial = order.type === 'special';
      const orderDate = new Date(order.date);
      const inCatalogs = isOrderInCatalogs(order);
      const isDeleted = isOrderDeletedFromHistory(order.id);
      
      // Generar número de pedido base (sin sufijo para agrupar)
      const baseOrderNumber = generateOrderNumber(order.id, orderDate.getFullYear()).split('-')[0] + '-' + 
                            generateOrderNumber(order.id, orderDate.getFullYear()).split('-')[1];
      
      if (!ordersByNumber[baseOrderNumber]) {
        ordersByNumber[baseOrderNumber] = [];
      }
      
      // Si el pedido está archivado
      if (order.status === 'Archivado') {
        const orderNumber = generateOrderNumber(order.id, orderDate.getFullYear());
        let subType = '';
        
        if (isSpecial) {
          subType = `P.Extra-${order.orderType || 'producto'}`;
        } else {
          subType = 'Productos y Servicios';
        }
        
        ordersByNumber[baseOrderNumber].push({
          id: order.id + (isSpecial ? '-special' : '-regular'),
          orderId: order.id,
          orderNumber,
          type: isSpecial ? 'Pedido Extra' : 'Pedido Regular',
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
          read: isMessageReadForCurrentUser(order.id + (isSpecial ? '-special' : '-normal')),
          timestamp: order.date,
          denialReason: order.denialReason,
          statusUpdatedAt: order.statusUpdatedAt,
          statusUpdatedBy: order.statusUpdatedBy,
          archived: true,
          originalOrder: order,
          inCatalogs,
          isModified: currentUser?.role === 'user' 
            ? (order.proposal || order.selectedItems || order.status === 'Modificado')
            : (order.status === 'Modificado'),
          proposal: order.proposal,
          selectedItems: order.selectedItems,
          userResponse: order.userResponse,
          userResponded: order.userResponded,
          serviceDetails: order.serviceDetails || {},
          isDeleted: isDeleted,
          previousVersions: order.previousVersions || [],
          baseOrderNumber: baseOrderNumber
        });
        return;
      }

      // Para pedidos normales NO archivados
      if (!isSpecial && order.items && order.items.length > 0) {
        const productItems = order.items.filter(item => 
          item.dataType === 'products' || (!item.dataType && item.name)
        );
        
        const serviceItems = order.items.filter(item => 
          item.dataType === 'services' || (!item.dataType && item.service)
        );
        
        // Crear pedido separado para productos
        if (productItems.length > 0) {
          const productOrderNumber = generateOrderNumber(order.id, orderDate.getFullYear(), 'PROD');
          ordersByNumber[baseOrderNumber].push({
            id: order.id + '-products',
            orderId: order.id,
            orderNumber: productOrderNumber,
            type: 'Pedido Regular',
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
            read: isMessageReadForCurrentUser(order.id + '-products'),
            timestamp: order.date,
            denialReason: order.denialReason,
            statusUpdatedAt: order.statusUpdatedAt,
            statusUpdatedBy: order.statusUpdatedBy,
            archived: false,
            originalOrder: { ...order, items: productItems },
            inCatalogs: isOrderInCatalogs({ ...order, items: productItems }),
            isModified: currentUser?.role === 'user' 
              ? (order.proposal || order.selectedItems || order.status === 'Modificado')
              : (order.status === 'Modificado'),
            proposal: order.proposal,
            selectedItems: order.selectedItems,
            userResponse: order.userResponse,
            userResponded: order.userResponded,
            rejectionReasons: order.rejectionReasons,
            serviceDetails: order.serviceDetails || {},
            isDeleted: isDeleted,
            previousVersions: order.previousVersions || [],
            baseOrderNumber: baseOrderNumber
          });
        }
        
        // Crear pedido separado para servicios
        if (serviceItems.length > 0) {
          const serviceOrderNumber = generateOrderNumber(order.id, orderDate.getFullYear(), 'SERV');
          ordersByNumber[baseOrderNumber].push({
            id: order.id + '-services',
            orderId: order.id,
            orderNumber: serviceOrderNumber,
            type: 'Pedido Regular',
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
            read: isMessageReadForCurrentUser(order.id + '-services'),
            timestamp: order.date,
            denialReason: order.denialReason,
            statusUpdatedAt: order.statusUpdatedAt,
            statusUpdatedBy: order.statusUpdatedBy,
            archived: false,
            originalOrder: { ...order, items: serviceItems },
            inCatalogs: isOrderInCatalogs({ ...order, items: serviceItems }),
            isModified: currentUser?.role === 'user' 
              ? (order.proposal || order.selectedItems || order.status === 'Modificado')
              : (order.status === 'Modificado'),
            proposal: order.proposal,
            selectedItems: order.selectedItems,
            userResponse: order.userResponse,
            userResponded: order.userResponded,
            rejectionReasons: order.rejectionReasons,
            serviceDetails: order.serviceDetails || {},
            isDeleted: isDeleted,
            previousVersions: order.previousVersions || [],
            baseOrderNumber: baseOrderNumber
          });
        }
        
        return;
      }
      
      // Para pedidos especiales o sin items
      const orderNumber = generateOrderNumber(order.id, orderDate.getFullYear());
      let subType = '';
      
      if (isSpecial) {
        subType = `P.Extra-${order.orderType || 'producto'}`;
      }
      
      ordersByNumber[baseOrderNumber].push({
        id: order.id + (isSpecial ? '-special' : '-regular'),
        orderId: order.id,
        orderNumber,
        type: isSpecial ? 'Pedido Extra' : 'Pedido Regular',
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
        read: isMessageReadForCurrentUser(order.id + (isSpecial ? '-special' : '-regular')),
        timestamp: order.date,
        denialReason: order.denialReason,
        statusUpdatedAt: order.statusUpdatedAt,
        statusUpdatedBy: order.statusUpdatedBy,
        archived: order.status === 'Archivado',
        originalOrder: order,
        inCatalogs: isOrderInCatalogs(order),
        isModified: currentUser?.role === 'user' 
          ? (order.proposal || order.selectedItems || order.status === 'Modificado')
          : (order.status === 'Modificado'),
        proposal: order.proposal,
        selectedItems: order.selectedItems,
        userResponse: order.userResponse,
        userResponded: order.userResponded,
        rejectionReasons: order.rejectionReasons,
        serviceDetails: order.serviceDetails || {},
        isDeleted: isOrderDeletedFromHistory(order.id),
        previousVersions: order.previousVersions || [],
        baseOrderNumber: baseOrderNumber
      });
      
    });

    // Aplanar y ordenar por fecha (más reciente primero) y agrupar por número de pedido
    const result = [];
    Object.values(ordersByNumber).forEach(group => {
      // Ordenar dentro de cada grupo por fecha (más reciente primero)
      const sortedGroup = group.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      result.push(...sortedGroup);
    });

    return result;

  }, [purchases, specialOrders, messages, currentUser, catalogs]);

  // Separar mensajes en diferentes categorías
  const archivedOrdersList = useMemo(() => 
    processedMessages.filter(msg => msg.archived), [processedMessages]);

  const activeMessages = useMemo(() => 
    processedMessages.filter(msg => !msg.archived), [processedMessages]);

  // Función para determinar si un pedido está pendiente a procesar
  const isOrderPendingProcessing = (message) => {
    // Excluir pedidos archivados, respondidos o modificados
    if (message.archived || message.userResponse || message.userResponded) {
      return false;
    }
    
    // Estados que NO se consideran pendientes a procesar
    const excludedStatuses = ['Completado', 'Denegado', 'Respondido'];
    if (excludedStatuses.includes(message.status)) {
      return false;
    }
    
    // Pedidos en catálogos: pendientes si admin/comercial no ha seleccionado items
    if (message.inCatalogs) {
      return !message.selectedItems || message.selectedItems.length === 0;
    }
    
    // Pedidos NO en catálogos: pendientes si no hay propuesta o propuesta no respondida
    if (!message.inCatalogs) {
      if (!message.proposal) {
        return true;
      }
      
      if (message.proposal && !message.userResponse) {
        return true;
      }
      
      return false;
    }
    
    return true;
  };

  // Filtrar pedidos pendientes a procesar (incluyendo estado "Pendiente")
  const pendingProcessingOrders = useMemo(() => 
    activeMessages.filter(msg => 
      msg.status === 'Pendiente' || isOrderPendingProcessing(msg)
    ), [activeMessages]);

  // Contadores de mensajes no leídos para cada vista
  const unreadCounts = useMemo(() => {
    const counts = {
      all: 0,
      pending: 0,
      responded: 0
    };
    
    activeMessages.forEach(message => {
      if (!message.read) {
        counts.all++;
        
        if (message.status === 'Pendiente' || isOrderPendingProcessing(message)) {
          counts.pending++;
        }
        
        if (message.userResponse || message.userResponded || message.isModified) {
          counts.responded++;
        }
      }
    });
    
    return counts;
  }, [activeMessages]);

  // Función de búsqueda mejorada
  const searchInMessages = (message, term) => {
    const searchTerm = term.toLowerCase();
    
    if (
      message.user?.toLowerCase().includes(searchTerm) ||
      message.area?.toLowerCase().includes(searchTerm) ||
      message.project?.toLowerCase().includes(searchTerm) ||
      message.orderNumber?.toLowerCase().includes(searchTerm) ||
      message.type?.toLowerCase().includes(searchTerm)
    ) {
      return true;
    }
    
    const company = getCompanyFromOrder(message.originalOrder || message);
    if (company.toLowerCase().includes(searchTerm)) {
      return true;
    }
    
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

  // Filtrar mensajes según vista seleccionada y filtros
  const filteredMessages = useMemo(() => {
    let baseMessages = activeMessages;
    
    // Aplicar filtro de vista principal
    if (viewMode === 'responded') {
      baseMessages = baseMessages.filter(message => 
        message.userResponse || message.userResponded || message.isModified
      );
    } else if (viewMode === 'pending') {
      baseMessages = baseMessages.filter(message => 
        message.status === 'Pendiente' || isOrderPendingProcessing(message)
      );
    }

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
        (selectedType === 'P.Extra-Servicios' && message.subType.includes('P.Extra') && message.orderType === 'service') ||
        (selectedType === 'P.Extra-Productos' && message.subType.includes('P.Extra') && message.orderType === 'product');
      const matchesUser = selectedUser === 'all' || message.user === selectedUser;

      return matchesSearch && matchesStatus && matchesType && matchesUser;
    });
  }, [activeMessages, searchTerm, selectedStatus, selectedType, selectedUser, viewMode, readFilter]);

  // Marcar mensaje como leído automáticamente al expandir
  const handleExpandOrder = (messageId) => {
    const isOpening = expandedOrder !== messageId;
    setExpandedOrder(expandedOrder === messageId ? null : messageId);
    
    if (isOpening) {
      markAsRead(messageId);
    }
  };

  // Función para archivar pedido
  const handleArchiveOrder = (message) => {
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
  const handleItemSelection = (index) => {
    if (selectedItems.includes(index)) {
      setSelectedItems(selectedItems.filter(i => i !== index));
      const newRejectionReasons = { ...rejectionReasons };
      delete newRejectionReasons[index];
      setRejectionReasons(newRejectionReasons);
    } else {
      setSelectedItems([...selectedItems, index]);
    }
  };

  const handleOpenSelectionDialog = (message) => {
    if (message.isDeleted) {
      addNotification({
        title: 'Acción no permitida',
        message: 'No se puede gestionar un pedido eliminado del historial',
        type: 'warning'
      });
      return;
    }

    setSelectionDialog(message);
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
        selectedItems: selectionDialog.items.filter((_, index) => selectedItems.includes(index)),
        rejectionReasons: rejectionReasons,
        statusUpdatedAt: new Date().toISOString(),
        statusUpdatedBy: currentUser?.fullName || 'Sistema'
      };

      if (selectionDialog.userId && currentUser?.role !== 'user') {
        const userMessageId = selectionDialog.id;
        const userMessage = messages.find(msg => msg.id === userMessageId);
        
        if (!userMessage) {
          const newUserMessage = {
            id: userMessageId,
            read: false,
            readAt: null,
            readBy: null,
            type: 'selection_notification',
            senderId: currentUser?.id,
            senderRole: currentUser?.role,
            recipientId: selectionDialog.userId,
            timestamp: new Date().toISOString(),
            userAction: 'Seleccionó items del pedido'
          };
          setMessages([...messages, newUserMessage]);
        } else {
          const updatedMessages = messages.map(msg =>
            msg.id === userMessageId ? { ...msg, read: false, readAt: null, readBy: null } : msg
          );
          setMessages(updatedMessages);
        }
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
    if (message.isDeleted) {
      addNotification({
        title: 'Acción no permitida',
        message: 'No se puede enviar propuesta para un pedido eliminado del historial',
        type: 'warning'
      });
      return;
    }

    if (isRegularServiceFromCatalog(message)) {
      addNotification({
        title: 'Acción no disponible',
        message: 'Para servicios regulares del catálogo, use "Seleccionar Items"',
        type: 'info'
      });
      return;
    }

    setProposalDialog(message);
    
    setProposalCompanies([
      { company: '', budget: '', tariff: '' }
    ]);
    
    const extractedServiceType = extractServiceTypeFromRequest(message.originalOrder || message);
    
    const serviceDetails = message.serviceDetails || {};
    setServiceDetailsForm({
      serviceType: extractedServiceType || serviceDetails.serviceType || '',
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
      area: serviceDetails.area || '',
      equipment: serviceDetails.equipment || []
    });
  };

  const handleSendProposal = () => {
    if (!proposalDialog) return;

    const invalidCompany = proposalCompanies.find(company => !company.company || !company.budget);
    if (invalidCompany) {
      addNotification({
        title: 'Datos incompletos',
        message: 'Todas las empresas deben tener nombre y presupuesto',
        type: 'warning'
      });
      return;
    }

    const isSpecial = proposalDialog.type === 'Pedido Extra';
    const orderId = proposalDialog.orderId;

    try {
      const totalBudget = proposalCompanies.reduce((sum, company) => 
        sum + (parseFloat(company.budget) || 0), 0
      );
      
      const updateData = {
        status: 'Propuesta enviada',
        proposal: {
          companies: proposalCompanies,
          totalBudget: totalBudget,
          date: new Date().toISOString().split('T')[0],
          serviceDetails: serviceDetailsForm,
          status: 'Propuesta enviada'
        },
        total: totalBudget,
        statusUpdatedAt: new Date().toISOString(),
        statusUpdatedBy: currentUser?.fullName || 'Sistema'
      };

      if (proposalDialog.userId && currentUser?.role !== 'user') {
        const userMessageId = proposalDialog.id;
        const userMessage = messages.find(msg => msg.id === userMessageId);
        
        if (!userMessage) {
          const newUserMessage = {
            id: userMessageId,
            read: false,
            readAt: null,
            readBy: null,
            type: 'proposal_notification',
            senderId: currentUser?.id,
            senderRole: currentUser?.role,
            recipientId: proposalDialog.userId,
            timestamp: new Date().toISOString(),
            userAction: 'Envió propuesta para el pedido'
          };
          setMessages([...messages, newUserMessage]);
        } else {
          const updatedMessages = messages.map(msg =>
            msg.id === userMessageId ? { ...msg, read: false, readAt: null, readBy: null } : msg
          );
          setMessages(updatedMessages);
        }
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
        title: 'Propuesta enviada',
        message: `Se ha enviado una propuesta con ${proposalCompanies.length} empresa(s) al usuario ${proposalDialog.user}`,
        type: 'success'
      });

      setProposalDialog(null);
      setProposalCompanies([{ company: '', budget: '', tariff: '' }]);
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
        area: '',
        equipment: []
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
    if (!message.proposal) {
      addNotification({
        title: 'Error',
        message: 'No hay propuesta para responder',
        type: 'error'
      });
      return;
    }

    if (response === 'Aceptar' && selectedCompanyIndex === -1 && message.proposal.companies.length > 1) {
      addNotification({
        title: 'Selección requerida',
        message: 'Debes seleccionar una empresa antes de aceptar la propuesta',
        type: 'warning'
      });
      return;
    }

    const isSpecial = message.type === 'Pedido Extra';
    const orderId = message.orderId;

    try {
      const updateData = {
        userResponse: response,
        status: 'Respondido',
        statusUpdatedAt: new Date().toISOString(),
        statusUpdatedBy: currentUser?.fullName || 'Sistema',
        userResponded: true,
        responseDate: new Date().toISOString(),
        userAction: `${response} la propuesta`
      };

      if (response === 'Aceptar' && selectedCompanyIndex !== -1) {
        updateData.selectedCompany = message.proposal.companies[selectedCompanyIndex];
        updateData.userAction = `Aceptó la propuesta y seleccionó la empresa ${message.proposal.companies[selectedCompanyIndex].company}`;
      }

      if (response === 'Rechazar') {
        updateData.status = 'Denegado';
        updateData.denialReason = 'Rechazado por el usuario';
        updateData.userAction = 'Rechazó la propuesta';
      }

      if (currentUser?.role === 'user') {
        const adminMessageId = message.id;
        const adminMessage = messages.find(msg => msg.id === adminMessageId);
        
        if (!adminMessage) {
          const newAdminMessage = {
            id: adminMessageId,
            read: false,
            readAt: null,
            readBy: null,
            type: 'user_response',
            senderId: currentUser?.id,
            senderRole: 'user',
            recipientId: 'admin',
            timestamp: new Date().toISOString(),
            userAction: updateData.userAction
          };
          setMessages([...messages, newAdminMessage]);
        } else {
          const updatedMessages = messages.map(msg =>
            msg.id === adminMessageId ? { 
              ...msg, 
              read: false, 
              readAt: null, 
              readBy: null,
              userAction: updateData.userAction 
            } : msg
          );
          setMessages(updatedMessages);
        }
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

      const notificationMessage = response === 'Aceptar' 
        ? `El usuario ${message.user} ha aceptado la propuesta${updateData.selectedCompany ? ` y seleccionado la empresa ${updateData.selectedCompany.company}` : ''}`
        : `El usuario ${message.user} ha rechazado la propuesta`;

      addNotification({
        title: 'Respuesta recibida',
        message: notificationMessage,
        type: 'success'
      });

      markAsRead(message.id);
      
      if (['admin', 'comercial'].includes(currentUser?.role)) {
        addNotification({
          title: 'Pedido respondido',
          message: 'El pedido se ha movido a la vista de Respondidos',
          type: 'info'
        });
      }

      setUserResponse('');
      setSelectedCompanyIndex(-1);
      
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
        status: 'Respondido',
        statusUpdatedAt: new Date().toISOString(),
        statusUpdatedBy: currentUser?.fullName || 'Sistema',
        userResponded: true,
        responseDate: new Date().toISOString(),
        userAction: 'Seleccionó items del pedido'
      };

      if (currentUser?.role === 'user') {
        const adminMessageId = message.id;
        const adminMessage = messages.find(msg => msg.id === adminMessageId);
        
        if (!adminMessage) {
          const newAdminMessage = {
            id: adminMessageId,
            read: false,
            readAt: null,
            readBy: null,
            type: 'user_selection',
            senderId: currentUser?.id,
            senderRole: 'user',
            recipientId: 'admin',
            timestamp: new Date().toISOString(),
            userAction: 'Seleccionó items del pedido'
          };
          setMessages([...messages, newAdminMessage]);
        } else {
          const updatedMessages = messages.map(msg =>
            msg.id === adminMessageId ? { 
              ...msg, 
              read: false, 
              readAt: null, 
              readBy: null,
              userAction: 'Seleccionó items del pedido' 
            } : msg
          );
          setMessages(updatedMessages);
        }
      }

      setUserCheckboxes(prev => ({
        ...prev,
        [message.id]: null
      }));

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
        message: 'Tu selección ha sido enviada exitosamente',
        type: 'success'
      });

      markAsRead(message.id);
      
    } catch (error) {
      console.error('Error enviando selección:', error);
      addNotification({
        title: 'Error',
        message: 'No se pudo enviar la selección',
        type: 'error'
      });
    }
  };

  // Función para mostrar pedidos anteriores opacos
  const renderPreviousOrdersInResponse = (order) => {
    if (!order.originalOrder?.previousVersions || order.originalOrder.previousVersions.length === 0) return null;
    
    return (
      <Box sx={{ mt: 2, opacity: 0.6 }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', color: colors.textSecondary, mb: 1 }}>
          Versiones anteriores:
        </Typography>
        {order.originalOrder.previousVersions.map((version, index) => (
          <Paper 
            key={index} 
            sx={{ 
              p: 2, 
              mb: 1, 
              backgroundColor: colors.background,
              border: `1px dashed ${colors.shellstone}`,
              position: 'relative'
            }}
          >
            <Chip
              label={version.status || 'Anterior'}
              size="small"
              sx={{ 
                position: 'absolute', 
                top: -10, 
                right: 10,
                backgroundColor: colors.shellstone,
                color: colors.text,
                opacity: 0.8
              }}
            />
            
            <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block' }}>
              {new Date(version.date).toLocaleDateString()}
            </Typography>
            
            {version.items && version.items.map((item, itemIndex) => (
              <Typography key={itemIndex} variant="body2" sx={{ color: colors.text, fontSize: '0.8rem' }}>
                • {item.name || item.service || 'Item'}
              </Typography>
            ))}
            
            <Box sx={{ mt: 1, display: 'flex', gap: 1, opacity: 0.5, pointerEvents: 'none' }}>
              <Button size="small" variant="outlined" disabled>
                <EditIcon fontSize="small" />
              </Button>
              <Button size="small" variant="outlined" disabled>
                <DeleteIcon fontSize="small" />
              </Button>
            </Box>
          </Paper>
        ))}
      </Box>
    );
  };

  // Componente para mostrar detalles expandibles del pedido
  const OrderDetails = ({ order }) => {
    const company = getCompanyFromOrder(order.originalOrder || order);
    
    const displayTotal = order.proposal?.totalBudget 
      ? parseFloat(order.proposal.totalBudget) 
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
          Detalles del Mensaje

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

          {/* Mostrar icono de proceder y nota de acción del usuario */}
          {(order.userResponse || order.userResponded) && ['admin', 'comercial', 'gestor'].includes(currentUser?.role) && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <PlayArrowIcon sx={{ color: colors.success, fontSize: 16 }} />
              <Typography variant="caption" sx={{ color: colors.textSecondary, fontStyle: 'italic' }}>
                {order.userAction || 'El usuario respondió a este pedido'}
              </Typography>
            </Box>
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
              {order.proposal?.totalBudget && parseFloat(order.proposal.totalBudget) !== parseFloat(order.total || 0) && (
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
              {order.serviceDetails.equipment && order.serviceDetails.equipment.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: colors.textSecondary }}>
                    Equipamiento Online:
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.text }}>
                    {order.serviceDetails.equipment.map(eq => {
                      const names = {
                        'plataforma-evea': 'Plataforma EVEA',
                        'camara': 'Cámara',
                        'microfono': 'Micrófono',
                        'salon-virtual': 'Salón virtual'
                      };
                      return names[eq] || eq;
                    }).join(', ')}
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

        {/* Mostrar empresas propuestas para que el usuario elija */}
        {order.proposal?.companies && order.proposal.companies.length > 0 && currentUser?.role === 'user' && !order.userResponse && (
          <Alert severity="info" sx={{ mt: 2, backgroundColor: colors.paper }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: colors.text, mb: 1 }}>
              Propuesta Recibida - Selecciona una empresa:
            </Typography>
            
            <MuiRadioGroup
              value={selectedCompanyIndex}
              onChange={(e) => setSelectedCompanyIndex(parseInt(e.target.value))}
            >
              {order.proposal.companies.map((company, index) => {
                const isOptimal = calculateOptimalOption(order.proposal.companies)?.index === index;
                
                return (
                  <MuiFormControlLabel
                    key={index}
                    value={index}
                    control={<MuiRadio />}
                    label={
                      <Box sx={{ ml: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ color: colors.text, fontWeight: 'bold' }}>
                            {company.company}
                          </Typography>
                          {isOptimal && (
                            <Chip
                              label="RECOMENDADA"
                              size="small"
                              sx={{
                                backgroundColor: colors.success,
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '0.6rem'
                              }}
                            />
                          )}
                        </Box>
                        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                          Presupuesto: ${company.budget} CUP
                        </Typography>
                        {company.tariff && (
                          <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                            Tarifa: {company.tariff}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                );
              })}
            </MuiRadioGroup>
            
            {(() => {
              const optimal = calculateOptimalOption(order.proposal.companies);
              if (optimal && order.proposal.companies.length > 1) {
                return (
                  <Alert severity="info" sx={{ mt: 2, backgroundColor: `${colors.success}15` }}>
                    <Typography variant="body2" sx={{ color: colors.text, fontStyle: 'italic' }}>
                      💡 <strong>Recomendación del sistema:</strong> "{optimal.company}" por ${optimal.budget} CUP {optimal.tariff ? `(${optimal.tariff})` : ''}
                    </Typography>
                  </Alert>
                );
              }
              return null;
            })()}
            
            {!order.userResponse && (
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => handleUserResponse(order, 'Aceptar')}
                  disabled={order.proposal.companies.length > 1 && selectedCompanyIndex === -1}
                  sx={{ 
                    backgroundColor: colors.success,
                    '&:hover': { backgroundColor: colors.success }
                  }}
                >
                  Aceptar {order.proposal.companies.length > 1 && 'Empresa Seleccionada'}
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
          </Alert>
        )}

        {/* Propuesta para pedidos no en catálogos (usuario) - SOLO si hay una empresa */}
        {order.proposal && !order.proposal.companies && !order.inCatalogs && currentUser?.role === 'user' && (
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

        {/* Información de empresa seleccionada si ya respondió */}
        {order.selectedCompany && (
          <Alert severity="success" sx={{ mt: 2, backgroundColor: colors.paper }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: colors.text }}>
              Empresa Seleccionada:
            </Typography>
            <Typography variant="body2" sx={{ color: colors.text }}>
              <strong>{order.selectedCompany.company}</strong> - ${order.selectedCompany.budget} CUP
            </Typography>
            {order.selectedCompany.tariff && (
              <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                Tarifa: {order.selectedCompany.tariff}
              </Typography>
            )}
          </Alert>
        )}

        {/* Checkboxes para usuario en pedidos no en catálogos - SOLO si NO hay propuesta todavía */}
        {!order.inCatalogs && currentUser?.role === 'user' && !order.proposal && !order.userResponse && !order.isDeleted && !order.userResponded && (
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
                      disabled={order.userResponded}
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
            {!order.userResponded && (
              <Button
                variant="contained"
                onClick={() => handleUserSelectionSubmit(order)}
                sx={{ mt: 1 }}
              >
                Enviar Selección
              </Button>
            )}
            {order.userResponded && (
              <Alert severity="info" sx={{ mt: 1 }}>
                Ya has enviado tu selección. No puedes modificarla.
              </Alert>
            )}
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

        {/* Motivo de denegación - CON BOTONES DESHABILITADOS PARA USUARIO */}
        {order.status === 'Denegado' && order.denialReason && (
          <Alert severity="error" sx={{ mt: 2, backgroundColor: colors.paper }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: colors.text }}>
              Pedido Denegado
            </Typography>
            <Typography variant="body2" sx={{ color: colors.text }}>
              Motivo: {order.denialReason}
            </Typography>
            
            {currentUser?.role === 'user' && (
              <Box sx={{ mt: 1, pt: 1, borderTop: `1px solid ${colors.border}` }}>
                <Typography variant="caption" sx={{ color: colors.textSecondary, fontStyle: 'italic' }}>
                  Esta propuesta ha sido denegada y no está disponible para proceder.
                </Typography>
              </Box>
            )}
          </Alert>
        )}

        {/* Mostrar pedidos anteriores opacos */}
        {renderPreviousOrdersInResponse(order)}

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
                  !isRegularServiceFromCatalog(order) && (
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
                      disabled={order.proposal}
                    >
                      {order.proposal ? 'Propuesta Enviada' : 'Enviar Propuesta'}
                    </Button>
                  )
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
      flexDirection: 'column',
      height: '100vh',
      overflow: 'hidden',
      backgroundColor: colors.background,
      color: colors.text,
      transition: 'all 0.3s ease',
    }}>
      {/* Título */}
      <Box sx={{ 
        px: 3,
        py: 6,
        backgroundColor: colors.paper,
        //borderBottom: `1px solid ${colors.border}`
      }}>
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            color: colors.primary,
            fontWeight: 'bold',
            textAlign: 'center',
            marginTop: '8px'
          }}
        >
          Gestión de Mensajes
        </Typography>
      </Box>

      {/* Navbar estático fijo */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        position: 'sticky',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        backgroundColor: colors.paper,
        borderBottom: `1px solid ${colors.border}`,
      }}>
        <AppBar 
          position="static" 
          sx={{ 
            backgroundColor: colors.paper,
            color: colors.text,
            borderBottom: 'none',
            boxShadow: 'none',
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Tabs
              value={viewMode}
              onChange={(_, newValue) => setViewMode(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{
                '& .MuiTab-root': {
                  minWidth: 120,
                  fontWeight: 'bold',
                  textTransform: 'none',
                  color: colors.textSecondary,
                  '&.Mui-selected': { 
                    color: colors.primary, 
                    backgroundColor: colors.border, 
                    borderRadius: '8px 8px 0 0',
                  },
                  '&:hover': { 
                    color: colors.primary,
                    backgroundColor: colors.border
                  }
                },
                '& .MuiTabs-indicator': { 
                  backgroundColor: colors.primary, 
                  height: 3 
                }
              }}
            >
              <Tab value="all" label="Todos" icon={<MailIcon />} />
              <Tab value="pending" label="Pendientes" icon={<ScheduleIcon />} />
              <Tab value="responded" label="Respondidos" icon={<ReplyIcon />} />
            </Tabs>
            
            {/* Botón Archivados en lugar del carrito */}
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
      </Box>

      {/* Contenido principal con scroll */}
      <Box sx={{ 
        flex: 1, 
        p: isMobile ? 2 : 4, 
        overflow: 'auto',
        backgroundColor: colors.paper,
        marginTop: '1px',
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: colors.paper,
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: colors.border,
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          backgroundColor: colors.primary,
        },
        scrollbarWidth: 'thin',
        scrollbarColor: `${colors.border} ${colors.paper}`,
      }}>

        {/* Barra de herramientas con filtros integrados */}
        <Box sx={{ 
          p: 2, 
          backgroundColor: colors.paper,
          borderBottom: `1px solid ${colors.border}` 
        }}>
          <Grid container spacing={2} alignItems="center">
            {/* Búsqueda mejorada */}
            <Grid item xs={12} md={3}>
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
                      borderColor: colors.border,
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

            {/* Filtro de Leído/No leído */}
            <Grid item xs={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ color: colors.text }}>Leído</InputLabel>
                <Select
                  value={readFilter}
                  label="Leído"
                  onChange={(e) => setReadFilter(e.target.value)}
                  sx={{
                    color: colors.text,
                    backgroundColor: colors.paper,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: colors.border,
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
                  <MenuItem value="read">Leídos</MenuItem>
                  <MenuItem value="unread">No leídos</MenuItem>
                </Select>
              </FormControl>
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
                      borderColor: colors.border,
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
                  <MenuItem value="Respondido">Respondido</MenuItem>
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
                      borderColor: colors.border,
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: colors.tan,
                    }
                  }}
                >
                  <MenuItem value="all">Todos</MenuItem>
                  <MenuItem value="Productos">Productos</MenuItem>
                  <MenuItem value="Servicios">Servicios</MenuItem>
                  <MenuItem value="P.Extra-Servicios">Pedidos Extras - Servicios</MenuItem>
                  <MenuItem value="P.Extra-Productos">Pedidos Extras - Productos</MenuItem>
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
                        borderColor: colors.border,
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
        </Box>

        {/* Contenido principal con scroll */}
        <Box sx={{ 
          flex: 1, 
          p: 0.5, 
          overflow: 'auto',
          backgroundColor: colors.paper,
          // Estilos del scrollbar 
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: colors.paper, // Fondo de la pista
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: colors.border, // Color del "pulgar"
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: colors.primary, // Color al pasar el cursor
          },
          // Para Firefox (propiedades estándar)
          scrollbarWidth: 'thin',
          scrollbarColor: `${colors.border} ${colors.paper}`,
        }}>
          {/* Lista principal de mensajes */}
          <Typography variant="h6" gutterBottom sx={{ color: colors.text, fontWeight: 'bold' }}>
            {viewMode === 'responded' ? '' : 
            viewMode === 'pending' ? '' : 
            ''}
          </Typography>

          {filteredMessages.length === 0 ? (
            <Alert 
              severity="info" 
              sx={{ 
                backgroundColor: colors.paper,
                color: colors.text,
                border: `1px solid ${colors.border}`
              }}
            >
              {viewMode === 'responded' 
                ? 'No hay mensajes respondidos.' 
                : viewMode === 'pending'
                ? 'No hay mensajes pendientes.'
                : 'No hay mensajes que coincidan con los filtros seleccionados.'}
            </Alert>
          ) : (
            <Paper sx={{ 
              backgroundColor: colors.paper,
              border: `1px solid ${colors.border}`
            }}>
              {filteredMessages.map((message) => (
                <Box 
                  key={message.id} 
                  sx={{ 
                    borderBottom: `1px solid ${colors.border}`,
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
                        
                        {/* Indicador si fue respondido - CON ICONO DE PROCEDER */}
                        {(message.userResponse || message.userResponded) && !message.isDeleted && (
                          <Tooltip title={`Respondido: ${message.userResponse || 'Selección enviada'}`}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <PlayArrowIcon sx={{ 
                                color: (message.userResponse === 'Aceptar' || message.userResponded) ? colors.success : colors.error, 
                                fontSize: 18 
                              }} />
                              <ReplyIcon sx={{ 
                                color: (message.userResponse === 'Aceptar' || message.userResponded) ? colors.success : colors.error, 
                                fontSize: 16 
                              }} />
                            </Box>
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
            border: `1px solid ${colors.border}`
          }
        }}
      >
        {statusEditDialog && (
          <>
            <DialogTitle sx={{ 
              backgroundColor: colors.borgundy, 
              color: colors.paper,
              borderBottom: `1px solid ${colors.border}`
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
                      borderColor: colors.border,
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
                  <MenuItem value="Respondido">Respondido</MenuItem>
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
                          borderColor: colors.border,
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
                            borderColor: colors.border,
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
            border: `1px solid ${colors.border}`
          }
        }}
      >
        {selectionDialog && (
          <>
            <DialogTitle sx={{ 
              backgroundColor: colors.sapphire, 
              color: colors.paper,
              borderBottom: `1px solid ${colors.border}`
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
                    border: `1px solid ${colors.border}`,
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
                              borderColor: colors.border,
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

      {/* Diálogo de Envío de Propuesta (Admin/Comercial para pedidos no en catálogos) - CON MÚLTIPLES EMPRESAS */}
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
            border: `1px solid ${colors.border}`,
            maxHeight: '90vh'
          }
        }}
      >
        {proposalDialog && (
          <>
            <DialogTitle sx={{ 
              backgroundColor: colors.tan, 
              color: colors.borgundy,
              borderBottom: `1px solid ${colors.border}`
            }}>
              Enviar Propuesta al Usuario
            </DialogTitle>
            
            <DialogContent sx={{ mt: 2, overflow: 'auto' }}>
              <Typography variant="body1" sx={{ mb: 2, color: colors.text }}>
                Pedido: <strong>{proposalDialog.orderNumber}</strong> - Tipo: {proposalDialog.orderType === 'service' ? 'Servicio' : 'Producto'}
              </Typography>
              
              {/* Sección de múltiples empresas */}
              <Box sx={{ mt: 2, p: 2, backgroundColor: colors.background, borderRadius: 1 }}>
                <Typography variant="h6" sx={{ color: colors.text, mb: 2 }}>
                  📊 Empresas Propuestas
                </Typography>
                
                {proposalCompanies.map((company, index) => (
                  <Box key={index} sx={{ mb: 2, p: 2, border: `1px solid ${colors.border}`, borderRadius: 1 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={4}>
                        <TextField
                          label={`Empresa ${index + 1}`}
                          fullWidth
                          size="small"
                          value={company.company}
                          onChange={(e) => handleCompanyChange(index, 'company', e.target.value)}
                          required
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              color: colors.text,
                              '& fieldset': {
                                borderColor: colors.border,
                              },
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <TextField
                          label="Presupuesto (CUP)"
                          fullWidth
                          type="number"
                          size="small"
                          value={company.budget}
                          onChange={(e) => handleCompanyChange(index, 'budget', e.target.value)}
                          required
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              color: colors.text,
                              '& fieldset': {
                                borderColor: colors.border,
                              },
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          label="Tarifa/Detalles"
                          fullWidth
                          size="small"
                          value={company.tariff}
                          onChange={(e) => handleCompanyChange(index, 'tariff', e.target.value)}
                          placeholder="Ej: Tarifa por hora, costo unitario, etc."
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              color: colors.text,
                              '& fieldset': {
                                borderColor: colors.border,
                              },
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={1}>
                        {proposalCompanies.length > 1 && (
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveCompany(index)}
                            sx={{ color: colors.error }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </Grid>
                    </Grid>
                  </Box>
                ))}
                
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleAddCompany}
                  startIcon={<AddIcon />}
                  sx={{ 
                    mt: 1,
                    borderColor: colors.tan,
                    color: colors.tan,
                    '&:hover': {
                      backgroundColor: colors.tan,
                      color: colors.borgundy
                    }
                  }}
                >
                  Agregar otra empresa
                </Button>
              </Box>
              
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
                          sx={{
                            color: colors.text,
                            backgroundColor: colors.paper,
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: colors.border,
                            }
                          }}
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
                          sx={{
                            color: colors.text,
                            backgroundColor: colors.paper,
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: colors.border,
                            }
                          }}
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
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    color: colors.text,
                                    '& fieldset': {
                                      borderColor: colors.border,
                                    },
                                  }
                                }}
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
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    color: colors.text,
                                    '& fieldset': {
                                      borderColor: colors.border,
                                    },
                                  }
                                }}
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
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    color: colors.text,
                                    '& fieldset': {
                                      borderColor: colors.border,
                                    },
                                  }
                                }}
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
                                  sx={{
                                    color: colors.text,
                                    backgroundColor: colors.paper,
                                    '& .MuiOutlinedInput-notchedOutline': {
                                      borderColor: colors.border,
                                    }
                                  }}
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
                                    sx={{
                                      color: colors.text,
                                      backgroundColor: colors.paper,
                                      '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: colors.border,
                                      }
                                    }}
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
                                  sx={{
                                    color: colors.text,
                                    backgroundColor: colors.paper,
                                    '& .MuiOutlinedInput-notchedOutline': {
                                      borderColor: colors.border,
                                    }
                                  }}
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
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    color: colors.text,
                                    '& fieldset': {
                                      borderColor: colors.border,
                                    },
                                  }
                                }}
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
                                sx={{
                                  color: colors.text,
                                  backgroundColor: colors.paper,
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: colors.border,
                                  }
                                }}
                              >
                                <MenuItem value="">Seleccionar</MenuItem>
                                {softwareTypeOptions.map(software => (
                                  <MenuItem key={software} value={software}>{software}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                        )}
                      
                        {/* Mostrar opciones de equipamiento para modalidad Online */}
                        {serviceDetailsForm.modality === 'Online' && (
                          <Grid item xs={12}>
                            <Box sx={{ mt: 2, p: 2, backgroundColor: colors.paper, borderRadius: 1 }}>
                              <Typography variant="subtitle2" sx={{ color: colors.text, mb: 2, fontWeight: 'bold' }}>
                                Equipamiento para modalidad Online
                              </Typography>
                              <Grid container spacing={2}>
                                <Grid item xs={12} sm={3}>
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        checked={serviceDetailsForm.equipment?.includes('plataforma-evea')}
                                        onChange={(e) => handleEquipmentChange('plataforma-evea', e.target.checked)}
                                      />
                                    }
                                    label="Plataforma EVEA"
                                    sx={{ color: colors.text }}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        checked={serviceDetailsForm.equipment?.includes('camara')}
                                        onChange={(e) => handleEquipmentChange('camara', e.target.checked)}
                                      />
                                    }
                                    label="Cámara"
                                    sx={{ color: colors.text }}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        checked={serviceDetailsForm.equipment?.includes('microfono')}
                                        onChange={(e) => handleEquipmentChange('microfono', e.target.checked)}
                                      />
                                    }
                                    label="Micrófono"
                                    sx={{ color: colors.text }}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        checked={serviceDetailsForm.equipment?.includes('salon-virtual')}
                                        onChange={(e) => handleEquipmentChange('salon-virtual', e.target.checked)}
                                      />
                                    }
                                    label="Salón virtual"
                                    sx={{ color: colors.text }}
                                  />
                                </Grid>
                              </Grid>
                            </Box>
                          </Grid>
                        )}
                      
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
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                color: colors.text,
                                '& fieldset': {
                                  borderColor: colors.border,
                                },
                              }
                            }}
                          />
                        </Grid>
                      </>
                    )}
                  </Grid>
                </Box>
              )}
              
              {/* Resumen de presupuesto total */}
              <Box sx={{ mt: 3, p: 2, backgroundColor: colors.background, borderRadius: 1 }}>
                <Typography variant="h6" sx={{ color: colors.text, mb: 1 }}>
                  💰 Opciones de Presupuesto
                </Typography>
                
                {proposalCompanies.map((company, index) => {
                  const optimal = calculateOptimalOption(proposalCompanies);
                  const isOptimal = optimal?.index === index;
                  
                  return (
                    <Box 
                      key={index} 
                      sx={{ 
                        p: 1.5, 
                        mb: 1, 
                        border: `2px solid ${isOptimal ? colors.success : colors.border}`,
                        borderRadius: 1,
                        backgroundColor: isOptimal ? `${colors.success}15` : colors.paper,
                        position: 'relative'
                      }}
                    >
                      {isOptimal && (
                        <Chip
                          label="RECOMENDADA"
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: -10,
                            right: 10,
                            backgroundColor: colors.success,
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '0.7rem'
                          }}
                        />
                      )}
                      
                      <Typography variant="body2" sx={{ color: colors.text, fontWeight: 'bold' }}>
                        {company.company || 'Empresa ' + (index + 1)}
                      </Typography>
                      <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                        Presupuesto: ${company.budget || '0'} CUP
                      </Typography>
                      {company.tariff && (
                        <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                          Condiciones: {company.tariff}
                        </Typography>
                      )}
                    </Box>
                  );
                })}
                
                {proposalCompanies.length > 1 && (
                  <Box sx={{ mt: 2, p: 1.5, backgroundColor: `${colors.info}15`, borderRadius: 1, border: `1px solid ${colors.info}` }}>
                    <Typography variant="subtitle2" sx={{ color: colors.text, fontWeight: 'bold', mb: 0.5 }}>
                      💡 Recomendación del Sistema
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.text, fontStyle: 'italic' }}>
                      {(() => {
                        const optimal = calculateOptimalOption(proposalCompanies);
                        if (optimal) {
                          return `Sugerimos "${optimal.company}" por $${optimal.budget} CUP ${
                            optimal.tariff ? `(${optimal.tariff})` : ''
                          }`;
                        }
                        return 'Seleccione la opción que mejor se adapte a sus necesidades';
                      })()}
                    </Typography>
                  </Box>
                )}
              </Box>
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
                disabled={proposalCompanies.some(company => !company.company || !company.budget)}
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
            border: `1px solid ${colors.border}`
          }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: colors.borgundy, 
          color: colors.paper,
          borderBottom: `1px solid ${colors.border}`
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
                  border: `1px solid ${colors.border}`,
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