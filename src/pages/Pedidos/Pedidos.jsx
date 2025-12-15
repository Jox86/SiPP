// src/pages/Pedidos/Pedidos.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
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
  Checkbox,
  CircularProgress,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemText,
  FormGroup,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel as MuiFormControlLabel
} from '@mui/material';
import {
  Store as StoreIcon,
  ShoppingCart as ShoppingCartIcon,
  Search as SearchIcon,
  Category as CategoryIcon,
  Business as BusinessIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  AddCircle as AddCircleIcon,
  RemoveCircle as RemoveCircleIcon,
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
  Assignment as AssignmentIcon,
  ExpandMore as ExpandMoreIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon
} from '@mui/icons-material';
import { 
  EQUIPMENT_CONFIG, 
  EQUIPMENT_TYPES, 
  generateEquipmentDescription, 
  getEquipmentOptions 
} from '../../utils/equipmentConfig';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useProjects } from '../../hooks/useProjects';

import { getImageForProduct, DEFAULT_IMAGE } from '../../utils/productImages';
import ProductImage from '../../components/ProductImage/ProductImage';

// Función para buscar imagen online
const searchProductImageOnline = async (productName) => {
  try {
    // Ejemplo con Unsplash (configura tu API key)
    const query = encodeURIComponent(productName + ' producto tecnología');
    const apiKey = process.env.REACT_APP_UNSPLASH_ACCESS_KEY;
    
    if (!apiKey) {
      console.warn('No hay API key configurada para búsqueda de imágenes');
      return null;
    }
    
    const searchUrl = `https://api.unsplash.com/search/photos?query=${query}&per_page=1&client_id=${apiKey}`;
    
    const response = await fetch(searchUrl);
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      return data.results[0].urls.small;
    }
    
    return null;
  } catch (error) {
    console.warn('Error buscando imagen online:', error);
    return null;
  }
};

// Función mejorada para obtener imágenes
const getEnhancedImageForProduct = async (productName) => {
  if (!productName) return DEFAULT_IMAGE;

  const name = productName.toLowerCase();
  
  // 1. PRIMERO: Buscar online (puedes desactivar esto si no quieres API)
  try {
    const onlineImage = await searchProductImageOnline(productName);
    if (onlineImage) {
      return onlineImage;
    }
  } catch (error) {
    console.warn('Falló búsqueda online, usando local:', error);
  }
  
  // 2. SEGUNDO: Buscar en mapeo local (tu función original)
  // Copia la función getImageForProduct aquí si no está importada
  const localImage = getImageForProduct(productName);
  if (localImage && localImage !== DEFAULT_IMAGE) {
    return localImage;
  }
  
  // 3. TERCERO: Logo de la app
  return DEFAULT_IMAGE;
};

// Paleta de colores con modo oscuro
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
    sapphire: '#4A6388',
    swanWhite: '#2D3748',
    shellstone: '#4A5568',
    background: '#2c1a1aff',
    paper: '#2D3748',
    text: '#F7FAFC',
    textSecondary: '#E2E8F0'
  }
};

// Plantillas predefinidas
const TEMPLATES = {
  products: {
    headers: ['nombre', 'modelo', 'precio', 'imagen', 'descripcion', 'stock', 'disponibilidad', 'categoria'],
    sampleData: [
      ['Teclado Mecánico RGB', 'Redragon Kumara K552', '45', '/assets/images/teclado.jpg', 'Teclado gaming mecánico retroiluminado', '25', 'Disponible', 'Periféricos'],
      ['Mouse Inalámbrico', 'Logitech M720 Triathlon', '35', '/assets/images/mouse.jpg', 'Mouse ergonómico multi-dispositivo', '30', 'Disponible', 'Periféricos'],
      ['Disco Duro Externo', 'Seagate Expansion 1TB', '60', '/assets/images/discoex.jpg', 'Almacenamiento portátil USB 3.0', '15', 'Disponible', 'Almacenamiento'],
      ['Memoria USB 64GB', 'SanDisk Ultra Flair', '15', '/assets/images/usb.jpg', 'Memoria USB 3.0 de alta velocidad', '50', 'Disponible', 'Almacenamiento'],
      ['Hub USB-C', 'UGREEN 4 en 1', '22', '/assets/images/hub.jpg', 'Adaptador multipuerto para laptop', '18', 'Disponible', 'Accesorios'],
      ['Router WiFi 6', 'TP-Link Archer AX10', '80', '/assets/images/router.jpg', 'Router inalámbrico AX1500', '8', 'Disponible', 'Redes'],
      ['Adaptador HDMI a VGA', 'UGREEN HDMI2VGA', '18', '/assets/images/AdaptHDMI.jpg', 'Convertidor digital a analógico', '45', 'Disponible', 'Conectividad'],
      ['Lector de Tarjetas SD', 'Anker USB 3.0', '12', '/assets/images/AllComponents.jpg', 'Lector múltiple para tarjetas de memoria', '60', 'Disponible', 'Accesorios'],
      ['Switch HDMI', 'Cable Matters 3x1', '35', '/assets/images/switch.jpg', 'Selector de fuentes HDMI automático', '15', 'Disponible', 'Video'],
      ['Cable Ethernet CAT6', 'Amazon Basics 3m', '8', '/assets/images/AllComponents.jpg', 'Cable de red de alta velocidad', '100', 'Disponible', 'Redes'],
    ]
  },
  services: {
    headers: ['servicio', 'tipo', 'precio', 'duracion', 'descripcion', 'nota'],
    sampleData: [
      ['Mantenimiento', 'Preventivo', '150', '4 horas', 'Revisión general', 'Precio puede variar'],
      ['Instalación', 'Software', '80', '2 horas', 'Configuración', 'Precio puede variar'],
      ['Consultoría TI', 'Tecnología', '85.00', '40', 'Carlos Rodríguez', 'Infraestructura', 'Inmediata', '8'],
      ['Asesoría Legal', 'Legal', '120.00', '20', 'María González', 'Derecho Corporativo', '1 semana', '12']
    ]
  }
};

// Sinónimos para cabeceras
const HEADER_SYNONYMS = {
  nombre: ['nombre', 'producto', 'item', 'title', 'descripción', 'artículo'],
  modelo: ['modelo', 'referencia', 'ref', 'sku', 'código'],
  precio: ['precio', 'costo', 'price', 'value', 'monto'],
  imagen: ['imagen', 'foto', 'picture', 'url', 'link'],
  descripcion: ['descripcion', 'desc', 'details', 'info', 'detalle'],
  stock: ['stock', 'cantidad', 'inventario', 'units', 'existencias'],
  disponibilidad: ['disponibilidad', 'estado', 'status', 'availability'],
  categoria: ['categoria', 'categoría', 'category', 'clasificación'],
  servicio: ['servicio', 'service', 'trabajo'],
  tipo: ['tipo', 'category', 'categoría'],
  duracion: ['duracion', 'duration', 'tiempo'],
  nota: ['nota', 'note', 'observación', 'comentario']
};

const normalizeHeader = (header) => {
  return header?.toString().trim().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

const validateHeaders = (fileHeaders, requiredHeaders) => {
  const normalizedFile = fileHeaders.map(normalizeHeader);
  return requiredHeaders.every(req =>
    normalizedFile.some(fileHeader =>
      HEADER_SYNONYMS[req]?.includes(fileHeader) || fileHeader === normalizeHeader(req)
    )
  );
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

// Función para obtener el área del usuario desde su perfil
const getUserArea = (userId) => {
  try {
    const users = JSON.parse(localStorage.getItem('SiPP_users') || '[]');
    const user = users.find(u => u.id === userId);
    
    if (user) {
      return user.area || 'N/A';
    } else {
      return 'N/A';
    }
  } catch (error) {
    console.error('Error obteniendo área del usuario:', error);
    return 'N/A';
  }
};

// FUNCIÓN PARA OBTENER NOMBRE DE USUARIO
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

// Variable global para el contador de pedidos
let orderCounter = 1;

// Función para generar número de pedido único por tipo
const generateOrderNumber = (orderId, year, type = '') => {
  const paddedId = orderId.toString().padStart(3, '0');
  const typeSuffix = type ? `-${type.charAt(0).toUpperCase()}` : '';
  return `PDD-${paddedId}${typeSuffix}-${year.toString().slice(-2)}`;
};

// FUNCIÓN PARA CALCULAR PRESUPUESTO RESTANTE - CORREGIDA
const getRemainingBudget = (project) => {
  try {
    const purchases = JSON.parse(localStorage.getItem('OASiS_purchases') || '[]');
    const specialOrders = JSON.parse(localStorage.getItem('OASiS_special_orders') || '[]');
    
    const projectOrders = [...purchases, ...specialOrders].filter(order => 
      order.projectId === project.id
    );
    
    const totalSpent = projectOrders.reduce((sum, order) => 
      sum + (parseFloat(order.total) || 0), 0
    );
    
    const remaining = (parseFloat(project.budget) || 0) - totalSpent;
    
    console.log(`[Pedidos] Proyecto ${project.costCenter}-${project.projectNumber}:`, {
      budget: project.budget,
      totalSpent,
      remaining,
      ordersCount: projectOrders.length
    });
    
    return remaining;
  } catch (error) {
    console.error('[Pedidos] Error calculando presupuesto:', error);
    return parseFloat(project.budget) || 0;
  }
};

export default function Catalogos() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { currentUser } = useAuth();
  const { addNotification } = useNotifications();
  const { projects } = useProjects(currentUser?.id);

  // Estados para modo oscuro
  const { darkMode } = useTheme();
  const colors = darkMode ? COLORS.dark : COLORS.light;

  // Estados para ordenamiento - siempre mostrar más reciente primero por defecto
  const [sortOrder, setSortOrder] = useState('newest');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');

  // Estado para editar pedido y modificarlo
  const [editingOrderId, setEditingOrderId] = useState(null);

  // Redirigir a productos si es usuario común
  const [viewMode, setViewMode] = useState(currentUser?.role === 'admin' ? 'products' : 'products');
  
  // Estado persistente en useLocalStorage
  const [catalogs, setCatalogs] = useLocalStorage('OASiS_catalogs', []);
  const [purchases, setPurchases] = useLocalStorage('OASiS_purchases', []);
  const [specialOrders, setSpecialOrders] = useLocalStorage('OASiS_special_orders', []);
  const [cart, setCart] = useState([]);

  // Estados locales
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [selectedUser, setSelectedUser] = useState('all');
  const [selectedProject, setSelectedProject] = useState('');
  const [allProjects, setAllProjects] = useState([]);
  const [productDialog, setProductDialog] = useState(null);
  const [uploadModal, setUploadModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    id: null,
    supplier: '',
    company: '',
    businessType: '',
    dataType: 'both',
    companyImage: null,
    currency: 'CUP',
    contractActive: false,
    productsCount: 0,
    servicesCount: 0
  });
  const [files, setFiles] = useState({
    products: null,
    services: null
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [openPreview, setOpenPreview] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [previewType, setPreviewType] = useState('products');
  const [orderDetailsDialog, setOrderDetailsDialog] = useState(null);

  // Estado para pedidos extras - CORREGIDO: agregar campo cantidad
  const [specialOrderForm, setSpecialOrderForm] = useState({
    orderType: 'product',
    products: [{ 
      name: '', 
      description: '',
      equipmentType: '',
      characteristics: {},
      quantity: 1 // agregar campo cantidad
    }],
    currency: 'CUP',
    projectId: ''
  });

  // Inicializar el contador de pedidos
  useEffect(() => {
    const allOrders = [...purchases, ...specialOrders];
    if (allOrders.length > 0) {
      const maxId = Math.max(...allOrders.map(order => 
        typeof order.id === 'number' ? order.id : 0
      ));
      orderCounter = maxId + 1;
    } else {
      orderCounter = 1;
    }
  }, [purchases, specialOrders]);

  // Cargar datos
  useEffect(() => {
    const savedCatalogs = localStorage.getItem('OASiS_catalogs');
    const savedCart = localStorage.getItem(`OASiS_cart_${currentUser?.id}`);
    const savedPurchases = localStorage.getItem('OASiS_purchases') || '[]';
    const savedSpecialOrders = localStorage.getItem('OASiS_special_orders') || '[]';

    if (savedCatalogs) setCatalogs(JSON.parse(savedCatalogs));
    if (savedCart) setCart(JSON.parse(savedCart));
    setPurchases(JSON.parse(savedPurchases));
    setSpecialOrders(JSON.parse(savedSpecialOrders));
  }, [currentUser]);

  // Cargar todos los proyectos del sistema
  const loadAllProjects = useCallback(() => {
    try {
      const users = JSON.parse(localStorage.getItem('SiPP_users') || '[]');
      const allProjectsData = [];
      
      users.forEach(user => {
        const userProjects = JSON.parse(localStorage.getItem(`SiPP_projects_${user.id}`) || '[]');
        allProjectsData.push(...userProjects);
      });
      
      setAllProjects(allProjectsData);
      console.log('Proyectos cargados en Pedidos:', allProjectsData.length);
    } catch (error) {
      console.error('Error al cargar proyectos en Pedidos:', error);
    }
  }, []);

  // Cargar proyectos al inicializar
  useEffect(() => {
    loadAllProjects();
  }, [loadAllProjects]);

  // Guardar carrito
  const saveCart = (updatedCart) => {
    setCart(updatedCart);
    localStorage.setItem(`OASiS_cart_${currentUser?.id}`, JSON.stringify(updatedCart));
  };

  // Datos
  const allProducts = useMemo(() => {
    return catalogs
      .filter(c => c.dataType === 'products')
      .flatMap(c => c.data.map(p => ({
        ...p,
        id: p.id || Date.now() + Math.random(),
        company: c.company,
        supplier: c.supplier,
        businessType: c.businessType,
        companyColor: c.color || colors.borgundy,
        contractActive: c.contractActive || false
      })));
  }, [catalogs, colors.borgundy]);

  const allServices = useMemo(() => {
    return catalogs
      .filter(c => c.dataType === 'services')
      .flatMap(c => c.data.map(s => ({
        ...s,
        id: s.id || Date.now() + Math.random(),
        company: c.company,
        supplier: c.supplier,
        contractActive: c.contractActive || false
      })));
  }, [catalogs]);

  const companies = useMemo(() => {
    const list = new Set();
    catalogs.forEach(c => list.add(c.company));
    return ['all', ...Array.from(list)];
  }, [catalogs]);

  const categories = useMemo(() => {
    const list = new Set();
    allProducts.forEach(p => list.add(p.category || 'Sin categoría'));
    return ['all', ...Array.from(list)];
  }, [allProducts]);

  const users = useMemo(() => {
    const list = new Set();
    purchases.forEach(p => list.add(p.user));
    return ['all', ...Array.from(list)];
  }, [purchases]);

  // Filtrar productos y servicios basado en contrato activo
  const availableProducts = useMemo(() => {
    return allProducts.filter(product => {
      const companyCatalog = catalogs.find(c => 
        c.company === product.company && c.dataType === 'products'
      );
      return companyCatalog ? companyCatalog.contractActive : false;
    });
  }, [allProducts, catalogs]);

  const availableServices = useMemo(() => {
    return allServices.filter(service => {
      const companyCatalog = catalogs.find(c => 
        c.company === service.company && c.dataType === 'services'
      );
      return companyCatalog ? companyCatalog.contractActive : false;
    });
  }, [allServices, catalogs]);

  // Verificar si hay items en el carrito de empresas inactivas
  const checkInactiveItemsInCart = () => {
    const inactiveItems = cart.filter(item => {
      const companyCatalog = catalogs.find(c => 
        c.company === item.company && 
        c.dataType === (item.dataType || (item.name ? 'products' : 'services'))
      );
      return companyCatalog && !companyCatalog.contractActive;
    });

    return inactiveItems.length > 0;
  };

  // Navegación lateral
  const views = currentUser?.role === 'admin' 
    ? ['products', 'services', 'special-orders', 'history', 'companies']
    : ['products', 'services', 'special-orders', 'history'];
  const currentIndex = views.indexOf(viewMode);
  const prevView = currentIndex > 0 ? views[currentIndex - 1] : null;
  const nextView = currentIndex < views.length - 1 ? views[currentIndex + 1] : null;

  const goToPrev = () => {
    if (prevView) setViewMode(prevView);
  };

  const goToNext = () => {
    if (nextView) setViewMode(nextView);
  };

// Función para limpiar cachés viejas
const clearOldImageCaches = () => {
  try {
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    const keysToRemove = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('image_cache_')) {
        try {
          const cacheData = JSON.parse(localStorage.getItem(key));
          if (cacheData.timestamp < oneDayAgo) {
            keysToRemove.push(key);
          }
        } catch (e) {
          // Si el cache está corrupto, eliminarlo
          keysToRemove.push(key);
        }
      }
    }
    
    // Eliminar cachés viejas
    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log(`Limpiadas ${keysToRemove.length} cachés viejas`);
  } catch (error) {
    console.error('Error limpiando cachés:', error);
  }
};

// Componente de imagen con CACHÉ y DEBOUNCE
const EnhancedProductImage = ({ productName, alt, sx, ...props }) => {
  const [imageUrl, setImageUrl] = useState(DEFAULT_IMAGE);
  const [loading, setLoading] = useState(true);
  const [cacheKey] = useState(() => `image_cache_${productName?.toLowerCase()?.trim()}`);

  useEffect(() => {
    // Si no hay nombre de producto, usar imagen por defecto
    if (!productName) {
      setImageUrl(DEFAULT_IMAGE);
      setLoading(false);
      return;
    }

    // 1. VERIFICAR CACHÉ LOCAL PRIMERO
    const cachedImage = localStorage.getItem(cacheKey);
    if (cachedImage) {
      // Verificar si la imagen cacheada todavía es válida (menos de 24 horas)
      try {
        const cacheData = JSON.parse(cachedImage);
        const cacheAge = Date.now() - cacheData.timestamp;
        const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas
        
        if (cacheAge < CACHE_DURATION) {
          setImageUrl(cacheData.url);
          setLoading(false);
          return;
        }
      } catch (error) {
        // Si hay error al parsear, limpiar cache corrupta
        localStorage.removeItem(cacheKey);
      }
    }

    // 2. DEBOUNCE: Esperar antes de cargar
    setLoading(true);
    
    // Crear un timer para evitar múltiples llamadas rápidas
    const debounceTimer = setTimeout(async () => {
      try {
        const url = await getEnhancedImageForProduct(productName);
        
        // 3. GUARDAR EN CACHÉ
        const cacheData = {
          url: url,
          timestamp: Date.now(),
          productName: productName
        };
        
        try {
          localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        } catch (storageError) {
          // Si localStorage está lleno, limpiar cachés viejas
          console.warn('LocalStorage lleno, limpiando cachés viejas...');
          clearOldImageCaches();
        }
        
        setImageUrl(url);
      } catch (error) {
        console.error('Error cargando imagen:', error);
        setImageUrl(DEFAULT_IMAGE);
        
        // Guardar en caché la imagen por defecto para evitar reintentos
        const defaultCacheData = {
          url: DEFAULT_IMAGE,
          timestamp: Date.now(),
          productName: productName,
          isDefault: true
        };
        
        try {
          localStorage.setItem(cacheKey, JSON.stringify(defaultCacheData));
        } catch (e) {
          // Ignorar errores de almacenamiento
        }
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms de debounce

    // Limpiar timer si el componente se desmonta o cambia el productName
    return () => {
      clearTimeout(debounceTimer);
    };
  }, [productName, cacheKey]); // Solo dependencias necesarias

  return (
    <Box sx={{ 
      position: 'relative',
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      ...sx 
    }}>
      {loading && (
        <CircularProgress 
          size={20} 
          sx={{ 
            position: 'absolute',
            color: colors.borgundy
          }} 
        />
      )}
      
      <img
        src={imageUrl}
        alt={alt || productName || 'Producto'}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          opacity: loading ? 0.5 : 1,
          transition: 'opacity 0.3s ease',
        }}
        loading="lazy" // Carga diferida
        onError={(e) => {
          console.warn(`Error cargando imagen para: ${productName}`);
          e.target.src = DEFAULT_IMAGE;
        }}
      />
    </Box>
  );
};

// FUNCIONES AUXILIARES PARA EL CACHÉ

// Función para precargar imágenes comunes
const preloadCommonImages = () => {
  const commonProducts = [
    'teclado', 'mouse', 'laptop', 'monitor', 'impresora',
    'disco duro', 'memoria usb', 'router', 'cable'
  ];
  
  commonProducts.forEach(product => {
    const cacheKey = `image_cache_${product}`;
    if (!localStorage.getItem(cacheKey)) {
      // Precargar en segundo plano
      setTimeout(() => {
        getEnhancedImageForProduct(product).then(url => {
          const cacheData = {
            url: url,
            timestamp: Date.now(),
            productName: product,
            preloaded: true
          };
          localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        }).catch(() => {
          // Ignorar errores de precarga
        });
      }, 1000); // Retrasar la precarga 1 segundo
    }
  });
};

  // Añadir al carrito
  const addToCart = (item) => {
    // Restringir si es comercial
    if (currentUser?.role === 'comercial') {
      addNotification({
        title: 'Acción no permitida',
        message: 'Los comerciales no pueden realizar compras',
        type: 'error'
      });
      return;
    }

    // Validar si el producto está disponible
    if (item.dataType === 'products' || item.stock !== undefined) {
      // Verificar stock
      if (item.stock <= 0 || item.availability === 'Agotado') {
        addNotification({
          title: 'Producto no disponible',
          message: `${item.name} está agotado y no se puede agregar al carrito`,
          type: 'warning'
        });
        return;
      }

      // Verificar contrato de la empresa
      const productCompany = catalogs.find(c => 
        c.company === item.company && c.dataType === 'products'
      );
      
      if (productCompany && !productCompany.contractActive) {
        addNotification({
          title: 'Empresa no disponible',
          message: `Los productos de ${item.company} no están disponibles temporalmente`,
          type: 'warning'
        });
        return;
      }
    } else if (item.dataType === 'services') {
      // Verificar contrato de la empresa para servicios
      const serviceCompany = catalogs.find(c => 
        c.company === item.company && c.dataType === 'services'
      );
      
      if (serviceCompany && !serviceCompany.contractActive) {
        addNotification({
          title: 'Empresa no disponible',
          message: `Los servicios de ${item.company} no están disponibles temporalmente`,
          type: 'warning'
        });
        return;
      }
    }

    const existing = cart.find(c => c.id === item.id);
    const updated = existing
      ? cart.map(c => c.id === item.id ? { 
          ...c, 
          quantity: c.quantity + 1,
          dataType: c.dataType || (c.name ? 'products' : 'services')
        } : c)
      : [...cart, { 
          ...item, 
          quantity: 1,
          dataType: item.dataType || (item.name ? 'products' : 'services')
        }];

    saveCart(updated);
    addNotification({
      title: 'Producto añadido',
      message: `${item.name || item.service} añadido al carrito`,
      type: 'success'
    });
  };

  // Cambiar cantidad
  const updateQuantity = (id, delta) => {
    setCart(prev => {
      const updated = prev.map(item =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      ).filter(item => item.quantity > 0);
      saveCart(updated);
      return updated;
    });
  };

  // Vaciar carrito
  const clearCart = () => {
    saveCart([]);
  };

  // CORREGIDO: Función para eliminar items del carrito
  const removeFromCart = (id) => {
    setCart(prev => {
      const updated = prev.filter(item => item.id !== id);
      saveCart(updated);
      return updated;
    });
    
    addNotification({
      title: 'Producto eliminado',
      message: 'El producto ha sido removido del carrito',
      type: 'info'
    });
  };

  // Separar servicios y productos en el historial
  const processPurchasesForHistory = (purchases) => {
    const separatedPurchases = [];
    
    purchases.forEach(purchase => {
      if (purchase.type === 'special') {
        // PROCESAR PEDIDOS EXTRA (productos o servicios)
        separatedPurchases.push({
          ...purchase,
          id: purchase.id + '-special',
          items: purchase.items || [],
          total: purchase.total || 0,
          category: `P.Extra-${purchase.orderType || 'producto'}`,
          orderType: purchase.orderType,
          orderNumber: generateOrderNumber(purchase.id, new Date(purchase.date).getFullYear(), 'EXTRA')
        });
        
      } else if (purchase.items && purchase.items.length > 0) {
        const hasMixedItems = purchase.items.some(item => 
          item.dataType === 'products' || (!item.dataType && item.name)
        ) && purchase.items.some(item => 
          item.dataType === 'services' || (!item.dataType && item.service)
        );

        if (hasMixedItems) {
          // Separar productos y servicios en solicitudes distintas con números diferentes
          const productItems = purchase.items.filter(item => 
            item.dataType === 'products' || (!item.dataType && item.name)
          );
          
          const serviceItems = purchase.items.filter(item => 
            item.dataType === 'services' || (!item.dataType && item.service)
          );
          
          // Crear solicitudes separadas para productos
          if (productItems.length > 0) {
            separatedPurchases.push({
              ...purchase,
              id: purchase.id + '-products',
              items: productItems,
              total: productItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
              category: 'Productos',
              orderNumber: generateOrderNumber(purchase.id, new Date(purchase.date).getFullYear(), 'PROD')
            });
          }
          
          // Crear solicitudes separadas para servicios
          if (serviceItems.length > 0) {
            separatedPurchases.push({
              ...purchase,
              id: purchase.id + '-services',
              items: serviceItems,
              total: serviceItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
              category: 'Servicios',
              orderNumber: generateOrderNumber(purchase.id, new Date(purchase.date).getFullYear(), 'SERV')
            });
          }
        } else {
          // Si no hay items mezclados, mantener como está
          const orderType = purchase.items[0].dataType === 'services' ? 'SERV' : 'PROD';
          separatedPurchases.push({
            ...purchase,
            category: purchase.items[0].dataType === 'services' ? 'Servicios' : 'Productos',
            orderNumber: generateOrderNumber(purchase.id, new Date(purchase.date).getFullYear(), orderType)
          });
        }
      } else {
        // Para pedidos sin items
        separatedPurchases.push({
          ...purchase,
          category: 'General',
          orderNumber: generateOrderNumber(purchase.id, new Date(purchase.date).getFullYear())
        });
      }

    });
    
    return separatedPurchases;
  };

  // CORREGIDO: Función para validar si se puede finalizar la compra
  const canFinalizePurchase = useCallback(() => {
    if (cart.length === 0) return false;
    if (!selectedProject) return false;

    const project = projects.find(p => p.id === selectedProject);
    if (!project) return false;

    // Verificar items de empresas inactivas
    const inactiveItems = cart.filter(item => {
      const companyCatalog = catalogs.find(c => 
        c.company === item.company && 
        c.dataType === (item.dataType || (item.name ? 'products' : 'services'))
      );
      return companyCatalog && !companyCatalog.contractActive;
    });

    if (inactiveItems.length > 0) return false;

    // Verificar disponibilidad de productos
    const outOfStockItems = cart.filter(item => {
      if (item.dataType === 'products' || item.stock !== undefined) {
        return item.availability === 'Agotado' || item.stock === 0;
      }
      return false;
    });

    if (outOfStockItems.length > 0) return false;

    // Verificar stock insuficiente
    const insufficientStockItems = cart.filter(item => {
      if (item.dataType === 'products' || item.stock !== undefined) {
        return item.quantity > item.stock;
      }
      return false;
    });

    if (insufficientStockItems.length > 0) return false;

    // CORREGIDO: Validar presupuesto - debe ser menor o igual al presupuesto restante
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const budget = parseFloat(project.budget) || 0;
    
    // Calcular gastos existentes excluyendo el pedido en edición
    const existingPurchases = JSON.parse(localStorage.getItem('OASiS_purchases') || '[]');
    const existingSpecialOrders = JSON.parse(localStorage.getItem('OASiS_special_orders') || '[]');
    const projectExistingOrders = [...existingPurchases, ...existingSpecialOrders].filter(order => 
      order.projectId === project.id && order.id !== editingOrderId
    );

    const existingSpent = projectExistingOrders.reduce((sum, order) => 
      sum + (parseFloat(order.total) || 0), 0
    );

    const totalSpent = existingSpent + total;
    const remainingBudget = budget - totalSpent;

    // CORRECCIÓN: Permitir compra si el total es menor o igual al presupuesto restante
    return totalSpent <= budget;
  }, [cart, selectedProject, projects, catalogs, editingOrderId]);

  // CORREGIDO: Finalizar compra - FUNCIÓN PRINCIPAL
  const checkout = () => {
    if (!canFinalizePurchase()) {
      addNotification({
        title: 'No se puede finalizar la compra',
        message: 'No se cumplen las condiciones para finalizar la compra. Verifique el presupuesto, disponibilidad y empresas activas.',
        type: 'error'
      });
      return;
    }

    const project = projects.find(p => p.id === selectedProject);
    if (!project) {
      addNotification({
        title: 'Error',
        message: 'Proyecto no encontrado',
        type: 'error'
      });
      return;
    }

    // Si todas las validaciones pasan, proceder con la compra
    try {
      let updatedPurchases = [...purchases];
      
      // CORREGIDO: Si estamos editando, eliminar el pedido anterior
      if (editingOrderId) {
        updatedPurchases = purchases.filter(p => p.id !== editingOrderId);
      }

      const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // Crear nueva solicitud de compra
      const newPurchase = {
        id: editingOrderId || orderCounter++,
        user: currentUser.fullName,
        userId: currentUser.id,
        project: project.name,
        projectId: project.id,
        projectNumber: project.projectNumber, 
        costCenter: project.costCenter,       
        area: getUserArea(currentUser.id),
        items: cart.map(item => ({
          id: item.id,
          name: item.name || item.service,
          price: item.price,
          quantity: item.quantity,
          model: item.model,
          company: item.company,
          category: item.category || 'N/A',
          dataType: item.dataType || (item.name ? 'products' : 'services')
        })),
        total,
        date: editingOrderId ? purchases.find(p => p.id === editingOrderId)?.date || new Date().toISOString() : new Date().toISOString(),
        status: 'Pendiente',
        priority: 'Media',
        currency: 'CUP' 
      };

      // Agregar el nuevo pedido
      updatedPurchases = [...updatedPurchases, newPurchase];
      setPurchases(updatedPurchases);
      localStorage.setItem('OASiS_purchases', JSON.stringify(updatedPurchases));

      // CORREGIDO: Actualizar inventario
      const updatedCatalogs = [...catalogs];
      cart.forEach(cartItem => {
        if (cartItem.dataType === 'products') {
          const catalogIndex = updatedCatalogs.findIndex(c => 
            c.company === cartItem.company && c.dataType === 'products'
          );
          
          if (catalogIndex !== -1) {
            const productIndex = updatedCatalogs[catalogIndex].data.findIndex(
              p => p.id === cartItem.id
            );
            
            if (productIndex !== -1) {
              // Si estamos editando, revertir cambios anteriores
              if (editingOrderId) {
                const originalOrder = purchases.find(p => p.id === editingOrderId);
                if (originalOrder) {
                  const originalItem = originalOrder.items.find(i => i.id === cartItem.id);
                  if (originalItem) {
                    updatedCatalogs[catalogIndex].data[productIndex].stock += originalItem.quantity;
                  }
                }
              }
              
              // Aplicar la nueva cantidad
              updatedCatalogs[catalogIndex].data[productIndex].stock -= cartItem.quantity;
              if (updatedCatalogs[catalogIndex].data[productIndex].stock <= 0) {
                updatedCatalogs[catalogIndex].data[productIndex].availability = 'Agotado';
                updatedCatalogs[catalogIndex].data[productIndex].stock = 0;
              } else {
                updatedCatalogs[catalogIndex].data[productIndex].availability = 'Disponible';
              }
            }
          }
        }
      });

      // Guardar cambios en inventario
      setCatalogs(updatedCatalogs);
      localStorage.setItem('OASiS_catalogs', JSON.stringify(updatedCatalogs));

      // Limpiar carrito y estado
      clearCart();
      setSelectedProject('');
      setShowCart(false);
      setEditingOrderId(null); 
      
      // Calcular presupuesto restante para el mensaje
      const budget = parseFloat(project.budget) || 0;
      const existingPurchases = JSON.parse(localStorage.getItem('OASiS_purchases') || '[]');
      const existingSpecialOrders = JSON.parse(localStorage.getItem('OASiS_special_orders') || '[]');
      const projectExistingOrders = [...existingPurchases, ...existingSpecialOrders].filter(order => 
        order.projectId === project.id
      );
      const totalSpent = projectExistingOrders.reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0);
      const remainingBudget = budget - totalSpent;

      // Mostrar confirmación al usuario
      addNotification({
        title: editingOrderId ? 'Solicitud actualizada' : 'Solicitud enviada',
        message: `Tu solicitud de compra para el proyecto "${project.name}" ha sido ${editingOrderId ? 'actualizada' : 'enviada'} exitosamente. Presupuesto restante: $${remainingBudget.toFixed(2)} CUP.`,
        type: 'success'
      });

      // Redirigir al historial
      setViewMode('history');
      
    } catch (error) {
      console.error('Error al procesar la compra:', error);
      addNotification({
        title: 'Error',
        message: 'Ocurrió un error al procesar tu solicitud. Por favor, intenta nuevamente.',
        type: 'error'
      });
    }
  };

  // Parsear Excel
  const parseExcel = (file, dataType) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

          if (jsonData.length <= 1) {
            return reject(new Error('El archivo está vacío o no tiene datos'));
          }

          const headers = jsonData[0];
          const required = TEMPLATES[dataType].headers;

          if (!validateHeaders(headers, required)) {
            const expected = required.map(h => HEADER_SYNONYMS[h].join('/')).join(', ');
            return reject(new Error(`Columnas inválidas. Use: ${expected}`));
          }

          const result = jsonData.slice(1).map(row => {
            const obj = {};
            headers.forEach((h, i) => {
              const norm = normalizeHeader(h);
              const key = Object.keys(HEADER_SYNONYMS).find(k => HEADER_SYNONYMS[k].includes(norm));
              if (key) obj[key] = row[i];
            });

            return dataType === 'products'
              ? {
                  id: Date.now() + Math.random(),
                  name: obj.nombre || 'Sin nombre',
                  model: obj.modelo || '',
                  price: parseFloat(obj.precio) || 0,
                  image: obj.imagen || DEFAULT_IMAGE,
                  description: obj.descripcion || '',
                  stock: parseInt(obj.stock) || 0,
                  availability: obj.disponibilidad || 'Agotado',
                  category: obj.categoria || 'Sin categoría'
                }
              : {
                  id: Date.now() + Math.random(),
                  service: obj.servicio || 'Sin nombre',
                  type: obj.tipo || 'General',
                  price: parseFloat(obj.precio) || 0,
                  duration: obj.duracion || 'N/A',
                  description: obj.descripcion || '',
                  note: obj.nota || 'El precio total puede variar dependiendo de la dificultad'
                };
          }).filter(item => item.name !== 'Sin nombre');

          resolve(result);
        } catch (err) {
          reject(new Error('Error al procesar el archivo: ' + err.message));
        }
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.readAsArrayBuffer(file);
    });
  };

  // Manejar subida de archivos
  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!(file instanceof File)) {
      setErrors({ ...errors, [type]: 'Archivo no válido' });
      return;
    }
    
    if (file.size > 50 * 1024 * 1024) {
      setErrors({ ...errors, [type]: 'El archivo no debe exceder 50MB' });
      return;
    }
    
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      setErrors({ ...errors, [type]: 'Solo se permiten archivos Excel (.xlsx, .xls)' });
      return;
    }
    
    setFiles({ ...files, [type]: file });
    setErrors({ ...errors, [type]: null });
  };

  // Funciones para servicios
  const handleAddServiceField = () => {
    setSpecialOrderForm({
      ...specialOrderForm,
      services: [...specialOrderForm.services, { 
        serviceType: '', 
        description: '', 
        scope: '', 
        requirements: '',
      }]
    });
  };

  const handleRemoveServiceField = (index) => {
    if (specialOrderForm.services.length > 1) {
      const newServices = [...specialOrderForm.services];
      newServices.splice(index, 1);
      setSpecialOrderForm({
        ...specialOrderForm,
        services: newServices
      });
    }
  };

  const handleServiceFieldChange = (index, field, value) => {
    const newServices = [...specialOrderForm.services];
    newServices[index][field] = value;
    setSpecialOrderForm({
      ...specialOrderForm,
      services: newServices
    });
  };

  // Función para manejar cambios en equipos
  const handleEquipmentTypeChange = (index, equipmentType) => {
    const newProducts = [...specialOrderForm.products];
    newProducts[index] = {
      ...newProducts[index],
      equipmentType,
      characteristics: {}
    };
    setSpecialOrderForm({
      ...specialOrderForm,
      products: newProducts
    });
  };

  // Función para manejar cambios en características
  const handleCharacteristicChange = (index, charKey, value) => {
    const newProducts = [...specialOrderForm.products];
    newProducts[index] = {
      ...newProducts[index],
      characteristics: {
        ...newProducts[index].characteristics,
        [charKey]: value
      }
    };
    setSpecialOrderForm({
      ...specialOrderForm,
      products: newProducts
    });
  };

  // Función para generar descripción automática
  const handleGenerateDescription = (index) => {
    const product = specialOrderForm.products[index];
    if (product.equipmentType && Object.keys(product.characteristics).length > 0) {
      const baseDescription = generateEquipmentDescription(product.equipmentType, product.characteristics);
      
      // Agregar cantidad a la descripción
      const quantity = product.quantity || 1;
      const descriptionWithQuantity = `${baseDescription} | Cantidad: ${quantity}`;
      
      const newProducts = [...specialOrderForm.products];
      newProducts[index].description = descriptionWithQuantity;
      setSpecialOrderForm({
        ...specialOrderForm,
        products: newProducts
      });
      
      addNotification({
        title: 'Descripción generada',
        message: 'Se ha generado automáticamente la descripción del equipo incluyendo cantidad',
        type: 'success'
      });
    }
  };

  // Función para guardar empresa
  const handleSubmit = async () => {
    console.log('🚀 Iniciando guardado de empresa...', { form, editMode });
    
    if (!form.supplier || !form.company || !form.businessType) {
      setErrors({ ...errors, form: 'Todos los campos son obligatorios' });
      return;
    }

    setLoading(true);
    try {
      let updatedCatalogs = [...catalogs];
      const timestamp = new Date().toISOString();
      
      // Buscar empresa existente por ID en lugar de solo por nombre
      const existingCompanyCatalogs = editMode 
        ? catalogs.filter(c => {
            const baseId = c.id ? c.id.replace('-products', '').replace('-services', '') : '';
            return baseId === form.id;
          })
        : [];

      const existingProductCatalog = existingCompanyCatalogs.find(c => c.dataType === 'products');
      const existingServiceCatalog = existingCompanyCatalogs.find(c => c.dataType === 'services');
      
      // Obtener el nombre ANTIGUO de la empresa para actualizar referencias
      const oldCompanyName = editMode && existingCompanyCatalogs.length > 0 
        ? existingCompanyCatalogs[0].company 
        : form.company;

      console.log('🔄 Datos para actualización:', {
        existingCompanyCatalogs: existingCompanyCatalogs.length,
        oldCompanyName,
        newCompanyName: form.company
      });

      // Procesar catálogo de productos
      let productData = [];
      if (files.products && files.products instanceof File) {
        productData = await parseExcel(files.products, 'products');
      } else if (editMode && existingProductCatalog) {
        productData = existingProductCatalog.data;
      }

      if (productData.length > 0 || (editMode && files.products === null && existingProductCatalog)) {
        const productCatalog = {
          id: `${form.id}-products`,
          supplier: form.supplier,
          company: form.company,
          businessType: form.businessType,
          dataType: 'products',
          data: productData,
          companyImage: form.companyImage,
          currency: form.currency,
          contractActive: form.contractActive,
          createdAt: editMode ? (existingProductCatalog?.createdAt || timestamp) : timestamp,
          updatedAt: timestamp,
        };

        // Eliminar catálogos existentes por ID en lugar de solo por nombre
        updatedCatalogs = updatedCatalogs.filter(c => 
          !(c.id === `${form.id}-products`)
        );
        updatedCatalogs.push(productCatalog);
      }

      // Procesar catálogo de servicios
      let serviceData = [];
      if (files.services && files.services instanceof File) {
        serviceData = await parseExcel(files.services, 'services');
      } else if (editMode && existingServiceCatalog) {
        serviceData = existingServiceCatalog.data;
      }

      if (serviceData.length > 0 || (editMode && files.services === null && existingServiceCatalog)) {
        const serviceCatalog = {
          id: `${form.id}-services`,
          supplier: form.supplier,
          company: form.company,
          businessType: form.businessType,
          dataType: 'services',
          data: serviceData,
          companyImage: form.companyImage,
          currency: form.currency,
          contractActive: form.contractActive,
          createdAt: editMode ? (existingServiceCatalog?.createdAt || timestamp) : timestamp,
          updatedAt: timestamp,
        };

        // Eliminar catálogos existentes por ID
        updatedCatalogs = updatedCatalogs.filter(c => 
          !(c.id === `${form.id}-services`)
        );
        updatedCatalogs.push(serviceCatalog);
      }

      // Actualizar referencias SOLO si el nombre de la empresa cambió
      let updatedPurchases = [...purchases];
      let updatedSpecialOrders = [...specialOrders];
      
      if (editMode && oldCompanyName !== form.company) {
        console.log('🔄 Actualizando referencias por cambio de nombre de empresa');
        
        const updateOrderReferences = (orders) => {
          return orders.map(order => ({
            ...order,
            items: order.items?.map(item => ({
              ...item,
              company: item.company === oldCompanyName ? form.company : item.company,
              supplier: item.supplier === oldCompanyName ? form.supplier : item.supplier
            })) || [],
            ...(order.company === oldCompanyName && {
              company: form.company,
              supplier: form.supplier
            })
          }));
        };

        updatedPurchases = updateOrderReferences(purchases);
        updatedSpecialOrders = updateOrderReferences(specialOrders);
        
        // Actualizar carrito si hay cambios
        const updatedCart = cart.map(item => ({
          ...item,
          company: item.company === oldCompanyName ? form.company : item.company,
          supplier: item.supplier === oldCompanyName ? form.supplier : item.supplier
        }));
        
        if (JSON.stringify(cart) !== JSON.stringify(updatedCart)) {
          saveCart(updatedCart);
        }
      }

      // Guardar cambios
      setPurchases(updatedPurchases);
      setSpecialOrders(updatedSpecialOrders);
      setCatalogs(updatedCatalogs);

      localStorage.setItem('OASiS_purchases', JSON.stringify(updatedPurchases));
      localStorage.setItem('OASiS_special_orders', JSON.stringify(updatedSpecialOrders));      
      localStorage.setItem('OASiS_catalogs', JSON.stringify(updatedCatalogs));
      
      // Resetear formulario correctamente
      setForm({ 
        id: null, 
        supplier: '', 
        company: '', 
        businessType: '', 
        dataType: 'both',
        companyImage: null,
        currency: 'CUP',
        contractActive: false,
        productsCount: 0,
        servicesCount: 0
      });
      setFiles({ products: null, services: null });
      setUploadModal(false);
      setOpenPreview(false);
      setEditMode(false);
      setErrors({});
      
      console.log('✅ Empresa guardada exitosamente');
      
      addNotification({
        title: editMode ? 'Empresa actualizada' : 'Nueva empresa',
        message: `Se ${editMode ? 'actualizó' : 'agregó'} la empresa ${form.company}`,
        type: 'success'
      });
    } catch (err) {
      console.error('❌ Error al guardar:', err);
      setErrors({ ...errors, form: err.message });
      addNotification({
        title: 'Error',
        message: `No se pudo ${editMode ? 'actualizar' : 'crear'} la empresa: ${err.message}`,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Abrir diálogo de producto
  const openProductDialog = (product) => {
    setProductDialog(product);
  };

  // Función para editar catálogo
  const handleEditCatalog = (companyData) => {
    console.log('🔄 Iniciando edición de empresa:', companyData);
    
    // Buscar TODOS los catálogos de esta empresa
    const companyCatalogs = catalogs.filter(c => c.company === companyData.company);
    const productCatalog = companyCatalogs.find(c => c.dataType === 'products');
    const serviceCatalog = companyCatalogs.find(c => c.dataType === 'services');
    
    // Obtener el primer catálogo para datos base (puede ser products o services)
    const baseCatalog = productCatalog || serviceCatalog || companyCatalogs[0] || {};
    
    console.log('📊 Catálogos encontrados:', {
      companyCatalogs: companyCatalogs.length,
      productCatalog: !!productCatalog,
      serviceCatalog: !!serviceCatalog,
      baseCatalog
    });
    
    // Usar los datos REALES del catálogo base
    setForm({
      id: baseCatalog.id ? baseCatalog.id.replace('-products', '').replace('-services', '') : Date.now().toString(),
      supplier: baseCatalog.supplier || '',
      company: baseCatalog.company || '',
      businessType: baseCatalog.businessType || '',
      dataType: 'both',
      companyImage: baseCatalog.companyImage || null,
      currency: baseCatalog.currency || 'CUP',
      contractActive: baseCatalog.contractActive || false,
      productsCount: productCatalog ? productCatalog.data.length : 0,
      servicesCount: serviceCatalog ? serviceCatalog.data.length : 0,
    });
    
    setFiles({ products: null, services: null });
    setEditMode(true);
    setUploadModal(true);
    setErrors({});
    
    console.log('✅ Formulario cargado para edición:', form);
  };

  const handleDeleteCatalog = (id) => {
    if (window.confirm('¿Está seguro de eliminar este catálogo?')) {
      const updated = catalogs.filter(c => c.id !== id);
      setCatalogs(updated);
      localStorage.setItem('OASiS_catalogs', JSON.stringify(updated));
      addNotification({
        title: 'Catálogo eliminado',
        message: 'El catálogo ha sido removido del sistema',
        type: 'warning'
      });
    }
  };

  // Generar plantilla
  const generateTemplate = (type) => {
    const template = TEMPLATES[type];
    const ws = XLSX.utils.aoa_to_sheet([template.headers, ...template.sampleData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Plantilla');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    saveAs(blob, `plantilla_catalogo_${type}.xlsx`);
  };

  // Exportar catálogos
  const exportToExcel = () => {
    const data = catalogs.flatMap(c =>
      c.data.map(item => ({
        Empresa: c.company,
        Proveedor: c.supplier,
        Tipo: c.dataType,
        Nombre: item.name || item.service,
        Modelo: item.modelo || '',
        Precio: item.price,
        Categoría: item.category || '',
        Disponibilidad: item.availability || 'Agotado'
      }))
    );

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Catálogos');
    XLSX.writeFile(wb, `catalogos_oasis_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Total del carrito
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const selectedProjectObj = projects.find(p => p.id === selectedProject);
  
  // CORREGIDO: Calcular presupuesto restante correctamente
  const remainingBudget = selectedProjectObj ? getRemainingBudget(selectedProjectObj) - cartTotal : 0;

  // Funciones para manejar pedidos extras - CORREGIDAS: incluir cantidad
  const handleAddProductField = () => {
    setSpecialOrderForm({
      ...specialOrderForm,
      products: [...specialOrderForm.products, { 
        name: '', 
        description: '', 
        equipmentType: '', 
        characteristics: {},
        quantity: 1 // agregar campo cantidad
      }]
    });
  };

  const handleRemoveProductField = (index) => {
    if (specialOrderForm.products.length > 1) {
      const newProducts = [...specialOrderForm.products];
      newProducts.splice(index, 1);
      setSpecialOrderForm({
        ...specialOrderForm,
        products: newProducts
      });
    }
  };

  const handleProductFieldChange = (index, field, value) => {
    const newProducts = [...specialOrderForm.products];
    newProducts[index][field] = value;
    setSpecialOrderForm({
      ...specialOrderForm,
      products: newProducts
    });
  };

  // Función para enviar pedidos extras con cantidad
  const handleSpecialOrderSubmit = () => {
    if (!specialOrderForm.projectId) {
      addNotification({
        title: 'Error',
        message: 'Debe seleccionar un proyecto para el pedido extra',
        type: 'error'
      });
      return;
    }

    const project = projects.find(p => p.id === specialOrderForm.projectId);
    if (!project) {
      addNotification({
        title: 'Error',
        message: 'Proyecto no encontrado',
        type: 'error'
      });
      return;
    }

    let hasValidItems = false;

    if (specialOrderForm.orderType === 'product') {
      hasValidItems = specialOrderForm.products.some(p => 
        p.name.trim() !== '' || (p.equipmentType && p.equipmentType !== 'other')
      );
    } else {
      hasValidItems = specialOrderForm.services.some(s => 
        s.serviceType.trim() !== '' && s.description.trim() !== ''
      );
    }

    if (!hasValidItems) {
      addNotification({
        title: 'Error',
        message: `Debe agregar al menos un ${specialOrderForm.orderType === 'product' ? 'producto' : 'servicio'} al pedido extra`,
        type: 'error'
      });
      return;
    }

    let processedItems = [];
    let totalAmount = 0;
    
    if (specialOrderForm.orderType === 'product') {
      processedItems = specialOrderForm.products
        .filter(p => p.name.trim() !== '' || (p.equipmentType && p.equipmentType !== 'other'))
        .map(product => {
          if (product.equipmentType && product.equipmentType !== 'other') {
            const equipmentName = EQUIPMENT_CONFIG[product.equipmentType]?.name || 'Equipo';
            return {
              name: product.name || equipmentName,
              description: product.description,
              equipmentType: product.equipmentType,
              characteristics: product.characteristics,
              quantity: product.quantity || 1, // incluir cantidad
              type: 'product'
            };
          }
          return {
            name: product.name,
            description: product.description,
            equipmentType: null,
            characteristics: {},
            quantity: product.quantity || 1, // incluir cantidad
            type: 'product'
          };
        });
    } else {
      processedItems = specialOrderForm.services
        .filter(s => s.serviceType.trim() !== '' && s.description.trim() !== '')
        .map(service => ({
          serviceType: service.serviceType,
          description: service.description,
          scope: service.scope,
          requirements: service.requirements,
          quantity: service.quantity || 1, // incluir cantidad
          type: 'service'
        }));
    }

    // Calcular prioridad basada en la fecha de vencimiento del proyecto
    const calculatePriority = (endDate) => {
      const today = new Date();
      const end = new Date(endDate);
      const diffTime = Math.abs(end - today);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 7) return 'Alta';
      if (diffDays <= 30) return 'Media';
      return 'Baja';
    };

    // En handleSpecialOrderSubmit, actualiza la creación del special order:
    const newSpecialOrder = {
      id: editingOrderId || orderCounter++,
      userId: currentUser.id,
      user: currentUser.fullName,
      projectId: project.id,
      project: project.name,
      projectNumber: project.projectNumber, 
      costCenter: project.costCenter,       
      area: getUserArea(currentUser.id),
      orderType: specialOrderForm.orderType,
      items: processedItems,
      currency: specialOrderForm.currency,
      date: editingOrderId ? specialOrders.find(so => so.id === editingOrderId)?.date || new Date().toISOString() : new Date().toISOString(), // Mantener fecha original
      status: 'Pendiente',
      priority: calculatePriority(project.endDate),
      type: 'special',
      category: `P.Extra-${specialOrderForm.orderType}`
    };

    console.log('Nuevo pedido extra creado con datos:', {
      projectNumber: newSpecialOrder.projectNumber,
      costCenter: newSpecialOrder.costCenter,
      project: newSpecialOrder.project
    });

    try {
      // Si estamos editando, eliminar el pedido anterior
      let updatedSpecialOrders = [...specialOrders];
      if (editingOrderId) {
        updatedSpecialOrders = specialOrders.filter(so => so.id !== editingOrderId);
      }

      updatedSpecialOrders = [...updatedSpecialOrders, newSpecialOrder];
      setSpecialOrders(updatedSpecialOrders);
      localStorage.setItem('OASiS_special_orders', JSON.stringify(updatedSpecialOrders));

      const notificationMsg = {
        id: `notif_${Date.now()}`,
        type: 'extra_order',
        title: `Nuevo Pedido Extra - ${specialOrderForm.orderType === 'product' ? 'Producto' : 'Servicio'}`,
        content: `Se ha solicitado un pedido extra de ${specialOrderForm.orderType === 'product' ? 'producto' : 'servicio'} para el proyecto ${project.name}`,
        senderId: currentUser.id,
        senderName: currentUser.fullName,
        recipientId: 'admin',
        recipientName: 'Administrador',
        projectId: project.id,
        projectName: project.name,
        timestamp: new Date().toISOString(),
        read: false,
        status: 'pending',
        details: JSON.stringify({
          orderType: specialOrderForm.orderType,
          items: processedItems,
          currency: specialOrderForm.currency
        }, null, 2)
      };

      const existingMessages = JSON.parse(localStorage.getItem('SiPP_messages') || '[]');
      localStorage.setItem('SiPP_messages', JSON.stringify([...existingMessages, notificationMsg]));

      setSpecialOrderForm({
        orderType: 'product',
        products: [{ name: '', description: '', equipmentType: '', characteristics: {}, quantity: 1 }],
        services: [{ serviceType: '', description: '', scope: '', requirements: '', quantity: 1 }],
        currency: 'CUP',
        projectId: ''
      });

      // Limpiar el estado de edición
      setEditingOrderId(null);

      addNotification({
        title: 'Pedido extra enviado',
        message: `Tu pedido extra de ${specialOrderForm.orderType === 'product' ? 'producto' : 'servicio'} ha sido enviado y está pendiente de aprobación`,
        type: 'success'
      });

      setViewMode('history');
      
    } catch (error) {
      console.error('Error guardando pedido extra:', error);
      addNotification({
        title: 'Error',
        message: 'No se pudo guardar el pedido extra. Intente nuevamente.',
        type: 'error'
      });
    }
  };

  // Función para eliminar pedido mejorada - NO elimina pedidos relacionados no seleccionados
  const handleDeleteOrder = (orderId, isSpecial = false) => {
    if (window.confirm('¿Está seguro de eliminar este pedido?')) {
      try {
        if (isSpecial) {
          // Solo eliminar el pedido específico, no todos los relacionados
          const updated = specialOrders.filter(order => order.id !== orderId);
          setSpecialOrders(updated);
          localStorage.setItem('OASiS_special_orders', JSON.stringify(updated));
        } else {
          // Para pedidos normales, verificar si es un pedido separado
          const isSeparatedOrder = orderId && typeof orderId === 'string' && 
                                  (orderId.includes('-products') || orderId.includes('-services'));
          
          if (isSeparatedOrder) {
            // Solo eliminar este pedido específico separado
            const updated = purchases.filter(order => order.id !== orderId);
            setPurchases(updated);
            localStorage.setItem('OASiS_purchases', JSON.stringify(updated));
          } else {
            // Si es un pedido original conjunto, eliminar TODOS los pedidos relacionados
            const baseOrderId = orderId.toString();
            const updated = purchases.filter(order => {
              if (typeof order.id === 'string' && order.id.includes('-')) {
                const baseIdFromOrder = order.id.split('-')[0];
                return baseIdFromOrder !== baseOrderId;
              }
              return order.id !== orderId;
            });
            setPurchases(updated);
            localStorage.setItem('OASiS_purchases', JSON.stringify(updated));
          }
        }
        
        addNotification({
          title: 'Pedido eliminado',
          message: 'El pedido ha sido eliminado del sistema',
          type: 'warning'
        });
      } catch (error) {
        console.error('Error eliminando pedido:', error);
        addNotification({
          title: 'Error',
          message: 'No se pudo eliminar el pedido',
          type: 'error'
        });
      }
    }
  };

  // Función para editar pedido - maneja correctamente la edición sin duplicar
  const handleEditOrder = (order) => {
    if (order.userId !== currentUser.id && currentUser.role !== 'admin') {
      addNotification({
        title: 'Acceso denegado',
        message: 'Solo puedes editar tus propios pedidos',
        type: 'error'
      });
      return;
    }

    if (window.confirm('¿Está seguro de editar este pedido?')) {
      if (order.type === 'special') {
        // Lógica para pedidos extra
        const productsData = order.items && order.items.length > 0 
          ? order.items.filter(item => item.type === 'product').map(item => ({
              name: item.name || '',
              description: item.description || '',
              equipmentType: item.equipmentType || '',
              characteristics: item.characteristics || {},
              quantity: item.quantity || 1
            }))
          : [{ name: '', description: '', equipmentType: '', characteristics: {}, quantity: 1 }];

        const servicesData = order.items && order.items.length > 0
          ? order.items.filter(item => item.type === 'service').map(item => ({
              serviceType: item.serviceType || '',
              description: item.description || '',
              scope: item.scope || '',
              requirements: item.requirements || '',
              quantity: item.quantity || 1
            }))
          : [{ serviceType: '', description: '', scope: '', requirements: '', quantity: 1 }];

        setSpecialOrderForm({
          orderType: order.orderType || 'product',
          products: productsData,
          services: servicesData,
          currency: order.currency || 'CUP',
          projectId: order.projectId || ''
        });

        // Guardar el ID del pedido que se está editando
        setEditingOrderId(order.id);
        
        setViewMode('special-orders');
        
        addNotification({
          title: 'Pedido cargado para edición',
          message: 'El pedido extra ha sido cargado para su modificación',
          type: 'info'
        });
      } else {
        // Para pedidos normales - guardar el ID del pedido que se está editando
        setEditingOrderId(order.id);

        // Cargar items en el carrito
        const cartItems = order.items.map(item => ({
          ...item,
          quantity: item.quantity,
          dataType: item.dataType || (item.name ? 'products' : 'services')
        }));
        
        saveCart(cartItems);
        setSelectedProject(order.projectId || '');
        setShowCart(true);
        
        addNotification({
          title: 'Pedido cargado para edición',
          message: 'El pedido ha sido cargado en el carrito para su modificación',
          type: 'info'
        });
      }
    }
  };

  // Función para ver detalles del pedido
  const handleViewOrderDetails = (order) => {
    setOrderDetailsDialog(order);
  };

  // Filtrar productos basado en disponibilidad y contrato activo
  const filteredProducts = useMemo(() => {
    return allProducts.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            p.model.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCompany = selectedCompany === 'all' || p.company === selectedCompany;
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesPrice = () => {
        const price = p.price;
        switch (priceRange) {
          case '0-500': return price < 500;
          case '500-1000': return price >= 500 && price < 1000;
          case '1000-2000': return price >= 1000 && price < 2000;
          case '2000+': return price >= 2000;
          default: return true;
        }
      };
      
      // Verificar contrato activo de la empresa
      const companyCatalog = catalogs.find(c => 
        c.company === p.company && c.dataType === 'products'
      );
      const isCompanyActive = companyCatalog ? companyCatalog.contractActive : false;
      
      return matchesSearch && matchesCompany && matchesCategory && matchesPrice() && isCompanyActive;
    });
  }, [allProducts, searchTerm, selectedCompany, selectedCategory, priceRange, catalogs]);

  // Filtrar servicios basado en contrato activo
  const filteredServices = useMemo(() => {
    return allServices.filter(s => {
      const matchesSearch = s.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             s.company.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPrice = () => {
        const price = s.price;
        switch (priceRange) {
          case '0-500': return price < 500;
          case '500-1000': return price >= 500 && price < 1000;
          case '1000-2000': return price >= 1000 && price < 2000;
          case '2000+': return price >= 2000;
          default: return true;
        }
      };
      
      // Verificar contrato activo de la empresa
      const companyCatalog = catalogs.find(c => 
        c.company === s.company && c.dataType === 'services'
      );
      const isCompanyActive = companyCatalog ? companyCatalog.contractActive : false;
      
      return matchesSearch && matchesPrice() && isCompanyActive;
    });
  }, [allServices, searchTerm, priceRange, catalogs]);

  // Filtrar historial con ordenamiento por defecto (más reciente primero)
  const filteredPurchases = useMemo(() => {
    const allOrders = [...purchases, ...specialOrders];
    const separatedOrders = processPurchasesForHistory(allOrders);
    
    // Ordenar según la selección
    const sortedOrders = separatedOrders.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
    
    return sortedOrders.filter(p => {
      const matchesSearch = 
        p.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.area && p.area.toLowerCase().includes(searchTerm.toLowerCase())) ||
        p.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.orderNumber && p.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()));
      
      if (currentUser?.role !== 'admin') {
        return p.userId === currentUser?.id && matchesSearch;
      }
      return matchesSearch && (selectedUser === 'all' || p.user === selectedUser);
    });
  }, [purchases, specialOrders, searchTerm, selectedUser, currentUser, sortOrder]);

  // CORREGIDO: Resetear el formulario correctamente al cerrar
  const handleCancelEdit = () => {
    setUploadModal(false);
    setEditMode(false);
    setFiles({ products: null, services: null });
    setErrors({});
    setForm({ 
      id: null, 
      supplier: '', 
      company: '', 
      businessType: '', 
      dataType: 'both',
      companyImage: null,
      currency: 'CUP',
      contractActive: false,
      productsCount: 0,
      servicesCount: 0
    });
  };

  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'hidden',
      backgroundColor: colors.paper,
      color: colors.text,
      transition: 'all 0.3s ease',
    }}>
      {/* Título */}
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            mb: 2, 
            textAlign: 'center',
            color: colors.borgundy,
            fontWeight: 'bold',
            marginTop: '40px',
          }}
        >
          Gestión de Pedidos
        </Typography>

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
        borderBottom: `2px solid ${colors.shellstone}`,
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
          <Toolbar>

            {/* Pestañas existentes */}
            <Tabs
              value={viewMode}
              onChange={(_, newValue) => setViewMode(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{
                flexGrow: 1,
                '& .MuiTab-root': {
                  minWidth: 120,
                  fontWeight: 'bold',
                  textTransform: 'none',
                  color: colors.sapphire,
                  '&.Mui-selected': { 
                    color: colors.borgundy, 
                    backgroundColor: 'rgba(2, 33, 71, 0.1)', 
                    borderRadius: '8px 8px 0 0',
                    borderTop: `2px solid ${colors.borgundy}`,
                    borderLeft: `2px solid ${colors.borgundy}`,
                    borderRight: `2px solid ${colors.borgundy}`
                  },
                  '&:hover': { 
                    color: colors.borgundy,
                    backgroundColor: 'rgba(210, 180, 140, 0.1)'
                  }
                },
                '& .MuiTabs-indicator': { 
                  backgroundColor: colors.borgundy, 
                  height: 3 
                }
              }}
            >
              <Tab value="products" label="Productos" icon={<StoreIcon />} />
              <Tab value="services" label="Servicios" icon={<CategoryIcon />} />
              <Tab value="special-orders" label="Pedidos Extra" icon={<AssignmentIcon />} />
              <Tab value="history" label="Historial" icon={<CheckCircleIcon />} />
              {currentUser?.role === 'admin' && <Tab value="companies" label="Empresas" icon={<BusinessIcon />} />}
            </Tabs>
            
            {/* Carrito */}
            {currentUser?.role !== 'moderator' && (
              <IconButton 
                color="inherit" 
                onClick={() => setShowCart(!showCart)}
                sx={{
                  color: colors.borgundy,
                  '&:hover': {
                    backgroundColor: 'rgba(210, 180, 140, 0.2)'
                  }
                }}
              >
                <Badge badgeContent={cart.length} color="error">
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>
            )}
          </Toolbar>
        </AppBar>
      </Box>

      {/* Contenido principal con scroll */}
      <Box sx={{ 
        flex: 1, 
        p: isMobile ? 2 : 4, 
        overflow: 'auto',
        backgroundColor: colors.paper,
        marginTop: '3px',
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: colors.paper,
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: colors.shellstone,
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          backgroundColor: colors.borgundy,
        }
      }}>

        {/* Vista de Productos - CORREGIDA: mostrar solo productos de empresas con contrato activo */}
        {viewMode === 'products' && (
          <Box sx={{ backgroundColor: colors.paper }}>
            {/* Filtros */}
            <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2, mb: 3 }}>
              <TextField
                placeholder="Buscar por nombre o modelo..."
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon color= "actions" />,
                }}
                fullWidth
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
                  }
                }}
              />
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel sx={{ color: colors.textSecondary }}>Empresa</InputLabel>
                <Select
                  value={selectedCompany}
                  label="Empresa"
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  sx={{
                    backgroundColor: colors.paper,
                    color: colors.text,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: colors.borgundy,
                    }
                  }}
                >
                  <MenuItem value="all">Todas</MenuItem>
                  {companies.filter(c => c !== 'all').map(company => (
                    <MenuItem key={company} value={company}>{company}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel sx={{ color: colors.textSecondary }}>Categoría</InputLabel>
                <Select
                  value={selectedCategory}
                  label="Categoría"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  sx={{
                    backgroundColor: colors.paper,
                    color: colors.text,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: colors.borgundy,
                    }
                  }}
                >
                  <MenuItem value="all">Todas</MenuItem>
                  {categories.filter(c => c !== 'all').map(category => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Grid container spacing={2}>
              {filteredProducts.length === 0 ? (
                <Grid item xs={12}>
                  <Alert severity="info" sx={{ backgroundColor: colors.paper, color: colors.text }}>
                    {searchTerm || selectedCompany !== 'all' || selectedCategory !== 'all' || priceRange !== 'all'
                      ? 'No se encontraron productos que coincidan con los filtros.'
                      : 'No hay productos disponibles. Contacte al administrador.'}
                  </Alert>
                </Grid>
              ) : (
                filteredProducts.map((product) => {
                  const companyCatalog = catalogs.find(c => 
                    c.company === product.company && c.dataType === 'products'
                  );
                  const isCompanyActive = companyCatalog ? companyCatalog.contractActive : false;
                  const isOutOfStock = product.stock <= 0 || product.availability === 'Agotado';
                  
                  return (
                    <Grid item xs={12} sm={6} md={4} key={product.id}>
                      <Card sx={{ 
                        height: '320px', 
                        width: '260px',
                        display: 'flex', 
                        flexDirection: 'column',
                        borderRadius: 2,
                        boxShadow: 3,
                        overflow: 'hidden',
                        backgroundColor: 'transparent',
                        transition: 'all 0.3s ease',
                        opacity: isOutOfStock ? 0.7 : 1,
                        border: `1px solid ${colors.shellstone}`,
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: 6,
                          borderColor: colors.borgundy
                        }
                      }}>
                        {/* Contenedor de imagen - MÁS GRANDE */}
                        <Box sx={{ 
                          position: 'relative',
                          height: 180, 
                          width: '100%',
                          overflow: 'hidden',
                          backgroundColor: colors.paper,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          p: 1 
                        }}>
                          <Box sx={{ 
                            position: 'relative',
                            height: '100%', 
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            filter: isOutOfStock ? 'grayscale(100%)' : 'none',
                          }}>
                            <EnhancedProductImage 
                              productName={product.name}
                              alt={product.name}
                              sx={{
                                height: '100%',
                                width: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain'
                              }}
                            />
                            
                            {/* Chip de precio */}
                            <Chip
                              label={`$${product.price}`}
                              sx={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                fontWeight: 'bold',
                                backgroundColor: isOutOfStock ? 'grey' : colors.borgundy,
                                color: 'white',
                                fontSize: '0.75rem',
                                height: '24px'
                              }}
                            />

                            {isOutOfStock && (
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  zIndex: 1
                                }}
                              >
                                <Typography 
                                  variant="h6" 
                                  sx={{ 
                                    color: 'white', 
                                    textAlign: 'center',
                                    p: 1,
                                    backgroundColor: 'rgba(0,0,0,0.7)',
                                    borderRadius: 1,
                                    fontSize: '0.9rem'
                                  }}
                                >
                                  Agotado
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Box>

                        {/* Contenido de la tarjeta  */}
                        <CardContent sx={{ 
                          flex: '1 0 auto',
                          p: 1.5, 
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          minHeight: '150px' 
                        }}>
                          {/* Nombre del producto y botón de carrito */}
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'flex-start',
                            mb: 0.5,
                            minHeight: '40px' 
                          }}>
                            <Typography 
                              variant="h6" 
                              fontWeight="bold" 
                              sx={{ 
                                flexGrow: 1, 
                                color: isOutOfStock ? 'text.disabled' : colors.borgundy,
                                fontSize: '1rem', 
                                lineHeight: 1.2,
                                height: '2.4em', 
                                overflow: 'hidden',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                pr: 1 
                              }}
                            >
                              {product.name}
                            </Typography>
                            <IconButton 
                              size="small" 
                              onClick={() => addToCart(product)}
                              disabled={isOutOfStock}
                              sx={{ 
                                color: isOutOfStock ? 'grey' : colors.borgundy,
                                '&:hover': { 
                                  backgroundColor: isOutOfStock ? 'inherit' : 'rgba(78, 1, 1, 0.1)', 
                                  color: isOutOfStock ? 'grey' : colors.borgundy,
                                },
                                '&.Mui-disabled': { 
                                  color: 'rgba(0, 0, 0, 0.26)',
                                  backgroundColor: 'transparent' 
                                },
                                padding: '4px',
                                marginTop: '-4px' 
                              }}
                            >
                              <ShoppingCartIcon fontSize="small" />
                            </IconButton>
                          </Box>
                          
                          {/* Información del producto */}
                          <Box sx={{ 
                            mb: 0.5,
                            minHeight: '90px' 
                          }}>
                            <Typography variant="body2" color={isOutOfStock ? 'text.disabled' : colors.textSecondary} 
                              sx={{ 
                                fontSize: '0.80rem', 
                                mb: 0.25,
                                display: 'flex',
                                alignItems: 'center'
                              }}>
                              <strong style={{ minWidth: '60px' }}>Modelo:</strong> 
                              <span style={{ 
                                flex: 1, 
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                {product.model}
                              </span>
                            </Typography>
                            
                            <Typography variant="body2" color={isOutOfStock ? 'text.disabled' : colors.textSecondary} 
                              sx={{ 
                                fontSize: '0.80rem',
                                mb: 0.25,
                                display: 'flex',
                                alignItems: 'center'
                              }}>
                              <strong style={{ minWidth: '60px' }}>Stock:</strong> 
                              <span style={{ flex: 1 }}>
                                {product.stock}
                              </span>
                              {isOutOfStock && (
                                <Chip 
                                  label="Agotado" 
                                  size="small" 
                                  color="error" 
                                  sx={{ 
                                    ml: 0.5, 
                                    height: 16, 
                                    fontSize: '0.55rem',
                                    '& .MuiChip-label': {
                                      px: 0.5
                                    }
                                  }} 
                                />
                              )}
                            </Typography>
                            
                            <Typography variant="body2" color={isOutOfStock ? 'text.disabled' : colors.textSecondary} 
                              sx={{ 
                                fontSize: '0.80rem',
                                display: 'flex',
                                alignItems: 'center'
                              }}>
                              <strong style={{ minWidth: '60px' }}>Empresa:</strong>
                              <span style={{ 
                                flex: 1,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                {product.company}
                              </span>
                            </Typography>
                          </Box>
                        </CardContent>
                        
                        {/* Botón Ver Detalles */}
                        <CardActions sx={{ 
                          p: 1, pt: 0 
                        }}>
                          <Button
                            fullWidth
                            size="small"
                            startIcon={<VisibilityIcon />}
                            onClick={() => openProductDialog(product)}
                            sx={{
                              top: -18,
                              color: isOutOfStock ? 'grey' : colors.borgundy,
                              fontSize: '0.8rem',
                              fontWeight: 'bold',
                              '&:hover': { 
                                backgroundColor: isOutOfStock ? 'inherit' : 'rgba(210, 180, 140, 0.2)', 
                                color: colors.borgundy,
                              },
                            }}
                          >
                            Ver detalles
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  );
                })
              )}
            </Grid>
          </Box>
        )}

        {/* Vista de Servicios - CORREGIDA: mostrar solo servicios de empresas con contrato activo */}
        {viewMode === 'services' && (
          <Box sx={{ backgroundColor: colors.paper }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row', 
              gap: 2, 
              mb: 3,
            }}>
              <TextField
                placeholder="Buscar servicios..."
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon color="actions" />,
                }}
                fullWidth
                sx={{
                  backgroundColor: colors.paper,
                  '& .MuiOutlinedInput-root': {
                    color: colors.text,
                    '& fieldset': {
                      borderColor: colors.shellstone,
                    },
                    '&:hover fieldset': {
                      borderColor: colors.borgundy,
                    },
                  }
                }}
              />
            </Box>

            <Grid container spacing={3}>
              {filteredServices.length === 0 ? (
                <Grid item xs={12}>
                  <Alert severity="info" sx={{ backgroundColor: colors.paper, color: colors.text }}>
                    {searchTerm || priceRange !== 'all'
                      ? 'No se encontraron servicios que coincidan con la búsqueda.'
                      : 'No hay servicios disponibles. Contacte al administrador.'}
                  </Alert>
                </Grid>
              ) : (
                filteredServices.map((service) => {
                  const isOutOfStock = false; // Los servicios no tienen stock
                  
                  return (
                    <Grid item xs={12} sm={6} md={4} key={service.id}>
                      <Card sx={{ 
                        height: '100%', 
                        width: 250,
                        display: 'flex', 
                        flexDirection: 'column',
                        borderRadius: 2,
                        boxShadow: 2,
                        backgroundColor: colors.paper,
                        opacity: isOutOfStock ? 0.7 : 1,
                        transition: 'all 0.3s ease',
                        border: `1px solid ${colors.shellstone}`,
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: 6,
                          borderColor: colors.borgundy
                        }
                      }}>
                        <CardContent sx={{ flexGrow: 1, position: 'relative' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                            <Typography variant="h6" component="div" sx={{ 
                              fontSize: '1.1rem', 
                              color: isOutOfStock ? 'text.disabled' : colors.borgundy 
                            }}>
                              {service.service}
                            </Typography>
                            <Chip
                              label={service.company}
                              size="small"
                              sx={{ 
                                backgroundColor: isOutOfStock ? 'grey' : colors.borgundy, 
                                color: 'white',
                                fontWeight: 'bold'
                              }}
                            />
                          </Box>
                          <Typography variant="body2" color={isOutOfStock ? 'text.disabled' : colors.textSecondary} sx={{ mb: 1 }}>
                            Tipo: {service.type}
                          </Typography>
                          <Typography variant="body2" color={isOutOfStock ? 'text.disabled' : colors.textSecondary} sx={{ mb: 1 }}>
                            Duración: {service.duration}
                          </Typography>
                          <Typography variant="body2" color={isOutOfStock ? 'text.disabled' : colors.textSecondary} sx={{ mb: 1 }}>
                            Descripción: {service.description}
                          </Typography>
                          <Typography variant="h6" color={isOutOfStock ? 'text.disabled' : 'error'} sx={{ fontWeight: 'bold', mt: 1 }}>
                            ${service.price} CUP
                          </Typography>
                          <Typography variant="body2" color={isOutOfStock ? 'text.disabled' : colors.textSecondary} sx={{ mt: 1, fontStyle: 'italic' }}>
                            {service.note}
                          </Typography>
                        </CardContent>
                        <CardActions sx={{ justifyContent: 'flex-end' }}>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => addToCart(service)}
                            disabled={isOutOfStock}
                            sx={{ 
                              backgroundColor: isOutOfStock ? 'grey' : colors.borgundy,
                              '&:hover': { backgroundColor: isOutOfStock ? 'grey' : colors.sapphire }
                            }}
                          >
                            Solicitar
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  );
                })
              )}
            </Grid>
          </Box>
        )}

        {/* Vista de Pedidos Extras - CORREGIDA: agregar campo cantidad */}
        {viewMode === 'special-orders' && (
          <Box sx={{ 
            maxWidth: 1000, 
            margin: '0 auto', 
            width: '100%',
            backgroundColor: colors.paper
          }}>
            <Paper sx={{ 
              p: 3, 
              borderRadius: 2, 
              boxShadow: 3,
              paper: `rgba(${darkMode ? '45, 55, 72' : '245, 240, 233'}, 0.8)`,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${colors.shellstone}`,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(90deg, ${colors.borgundy}, ${colors.tan})`
              }
            }}>
              <Typography variant="h5" align="center" gutterBottom sx={{ mb: 3, color: colors.borgundy, fontWeight: 'bold' }}>
                <AssignmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Solicitud de Pedidos Extra
              </Typography>
              
              {/* Selector de Tipo de Pedido */}
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel sx={{ color: colors.textSecondary }}>Tipo de Pedido Extra</InputLabel>
                <Select
                  value={specialOrderForm.orderType}
                  label="Tipo de Pedido Extra"
                  onChange={(e) => setSpecialOrderForm({
                    ...specialOrderForm, 
                    orderType: e.target.value,
                    products: e.target.value === 'product' ? [{ name: '', description: '', equipmentType: '', characteristics: {}, quantity: 1 }] : [],
                    services: e.target.value === 'service' ? [{ serviceType: '', description: '', scope: '', requirements: '', quantity: 1 }] : []
                  })}
                  sx={{
                    backgroundColor: 'transparent',
                    color: colors.text,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: colors.borgundy,
                    }
                  }}
                >
                  <MenuItem value="product">Producto</MenuItem>
                  <MenuItem value="service">Servicio</MenuItem>
                </Select>
              </FormControl>

              {/* Campos para Productos - CORREGIDO: agregar campo cantidad */}
              {specialOrderForm.orderType === 'product' && specialOrderForm.products.map((product, index) => (
                <Box key={index} sx={{ 
                  mb: 3, 
                  p: 2, 
                  border: `1px solid ${colors.shellstone}`, 
                  borderRadius: 2,
                  backgroundColor: 'transparent',
                  backdropFilter: 'blur(5px)'
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ color: colors.borgundy }}>
                      Producto {index + 1}
                    </Typography>
                    {specialOrderForm.products.length > 1 && (
                      <IconButton 
                        color="error" 
                        onClick={() => handleRemoveProductField(index)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                  
                  {/* Selector de Tipo de Equipo */}
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel sx={{ color: colors.textSecondary }}>Tipo de Equipo</InputLabel>
                    <Select
                      value={product.equipmentType}
                      label="Tipo de Equipo"
                      onChange={(e) => handleEquipmentTypeChange(index, e.target.value)}
                      sx={{
                        backgroundColor: 'transparent',
                        color: colors.text,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: colors.borgundy,
                        }
                      }}
                    >
                      <MenuItem value="">Seleccionar tipo de equipo</MenuItem>
                      {getEquipmentOptions().map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                      <MenuItem value="other">Otro equipo</MenuItem>
                    </Select>
                  </FormControl>

                  {product.equipmentType === 'other' && (
                    <TextField
                      label="Nombre del producto"
                      fullWidth
                      value={product.name}
                      onChange={(e) => handleProductFieldChange(index, 'name', e.target.value)}
                      margin="normal"
                      sx={{
                        backgroundColor: 'transparent',
                        color: colors.text,
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: colors.borgundy,
                          },
                        }
                      }}
                    />
                  )}

                  {product.equipmentType && product.equipmentType !== 'other' && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: colors.borgundy }}>
                        Características de {EQUIPMENT_CONFIG[product.equipmentType]?.name}
                      </Typography>
                      
                      {Object.entries(EQUIPMENT_CONFIG[product.equipmentType]?.characteristics || {}).map(([charKey, charConfig]) => (
                        <Box key={charKey} sx={{ mb: 2 }}>
                          {charConfig.type === 'select' && (
                            <FormControl fullWidth>
                              <InputLabel sx={{ color: colors.textSecondary}}>{charConfig.label}</InputLabel>
                              <Select
                                value={product.characteristics[charKey] || ''}
                                label={charConfig.label}
                                onChange={(e) => handleCharacteristicChange(index, charKey, e.target.value)}
                                sx={{
                                  backgroundColor: 'transparent',
                                  color: colors.text,
                                  '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: colors.borgundy,
                                  }
                                }}
                              >
                                <MenuItem value="">Seleccionar {charConfig.label.toLowerCase()}</MenuItem>
                                {charConfig.options.map(option => (
                                  <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          )}
                          
                          {charConfig.type === 'multiselect' && (
                            <Accordion sx={{ mb: 1, border: `1px solid ${colors.shellstone}`, backgroundColor: 'transparent' }}>
                              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography sx={{ color: colors.borgundy }}>{charConfig.label}</Typography>
                              </AccordionSummary>
                              <AccordionDetails>
                                <FormGroup>
                                  {charConfig.options.map(option => (
                                    <FormControlLabel
                                      key={option.value}
                                      control={
                                        <Checkbox
                                          checked={Array.isArray(product.characteristics[charKey]) && 
                                                  product.characteristics[charKey].includes(option.value)}
                                          onChange={(e) => {
                                            const currentValues = Array.isArray(product.characteristics[charKey]) 
                                              ? product.characteristics[charKey] 
                                              : [];
                                            let newValues;
                                            if (e.target.checked) {
                                              newValues = [...currentValues, option.value];
                                            } else {
                                              newValues = currentValues.filter(val => val !== option.value);
                                            }
                                            handleCharacteristicChange(index, charKey, newValues);
                                          }}
                                          sx={{
                                            color: colors.borgundy,
                                            '&.Mui-checked': {
                                              color: colors.borgundy,
                                            },
                                          }}
                                        />
                                      }
                                      label={option.label}
                                    />
                                  ))}
                                </FormGroup>
                              </AccordionDetails>
                            </Accordion>
                          )}
                        </Box>
                      ))}
                      
                      {/* Campo cantidad para productos */}
                      <TextField
                        label="Cantidad"
                        type="number"
                        fullWidth
                        value={product.quantity}
                        onChange={(e) => handleProductFieldChange(index, 'quantity', parseInt(e.target.value) || 1)}
                        margin="normal"
                        inputProps={{ min: 1 }}
                        sx={{
                          backgroundColor: 'transparent',
                          color: colors.text,
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: colors.borgundy,
                            },
                          }
                        }}
                      />

                      <Button
                        variant="outlined"
                        onClick={() => handleGenerateDescription(index)}
                        disabled={!product.equipmentType || Object.keys(product.characteristics).length === 0}
                        sx={{ 
                          mb: 2,
                          borderColor: colors.borgundy,
                          color: colors.borgundy,
                          '&:hover': {
                            borderColor: colors.sapphire,
                            backgroundColor: 'rgba(2, 33, 71, 0.04)'
                          }
                        }}
                      >
                        Generar Descripción Automática
                      </Button>
                    </Box>
                  )}
                  
                  <TextField
                    label="Descripción del producto"
                    fullWidth
                    multiline
                    rows={3}
                    value={product.description}
                    onChange={(e) => handleProductFieldChange(index, 'description', e.target.value)}
                    margin="normal"
                    inputProps={{ maxLength: 500 }}
                    helperText={`${product.description.length}/500 caracteres`}
                    sx={{
                      backgroundColor: 'transparent',                      
                      color: colors.text,
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: colors.borgundy,
                        },
                      }
                    }}
                  />
                </Box>
              ))}
              
              {/* Campos para Servicios - CORREGIDO: agregar campo cantidad */}
              {specialOrderForm.orderType === 'service' && specialOrderForm.services.map((service, index) => (
                <Box key={index} sx={{ 
                  mb: 3, 
                  p: 2, 
                  border: `1px solid ${colors.shellstone}`, 
                  borderRadius: 2,
                  backgroundColor: 'transparent',
                  backdropFilter: 'blur(5px)'
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ color: colors.borgundy }}>
                      Servicio {index + 1}
                    </Typography>
                    {specialOrderForm.services.length > 1 && (
                      <IconButton 
                        color="error" 
                        onClick={() => handleRemoveServiceField(index)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel sx={{ color: colors.textSecondary }}>Tipo de Servicio</InputLabel>
                    <Select
                      value={service.serviceType}
                      label="Tipo de Servicio"
                      onChange={(e) => handleServiceFieldChange(index, 'serviceType', e.target.value)}
                      sx={{
                        backgroundColor: 'transparent',
                        color: colors.text,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: colors.borgundy,
                        }
                      }}
                    >
                      <MenuItem value="">Seleccionar tipo de servicio</MenuItem>
                      <MenuItem value="software">Desarrollo de Software</MenuItem>
                      <MenuItem value="hardware">Instalación de Hardware</MenuItem>
                      <MenuItem value="consulting">Consultoría TI</MenuItem>
                      <MenuItem value="maintenance">Mantenimiento</MenuItem>
                      <MenuItem value="training">Capacitación</MenuItem>
                      <MenuItem value="networking">Redes y Comunicaciones</MenuItem>
                      <MenuItem value="security">Ciberseguridad</MenuItem>
                      <MenuItem value="cloud">Servicios en la Nube</MenuItem>
                      <MenuItem value="other">Otro Servicio</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    label="Alcance del Servicio"
                    fullWidth
                    multiline
                    rows={2}
                    value={service.scope}
                    onChange={(e) => handleServiceFieldChange(index, 'scope', e.target.value)}
                    margin="normal"
                    placeholder="Describa el alcance y objetivos del servicio..."
                    sx={{
                      backgroundColor: 'transparent',
                      color: colors.text,
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: colors.borgundy,
                        },
                      }
                    }}
                  />
                  
                  <TextField
                    label="Requisitos Específicos"
                    fullWidth
                    multiline
                    rows={2}
                    value={service.requirements}
                    onChange={(e) => handleServiceFieldChange(index, 'requirements', e.target.value)}
                    margin="normal"
                    placeholder="Especifique requisitos técnicos, hardware, software, etc."
                    sx={{
                      backgroundColor: 'transparent',
                      color: colors.text,
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: colors.borgundy,
                        },
                      }
                    }}
                  />
                  
                  <TextField
                    label="Descripción Detallada del Servicio"
                    fullWidth
                    multiline
                    rows={3}
                    value={service.description}
                    onChange={(e) => handleServiceFieldChange(index, 'description', e.target.value)}
                    margin="normal"
                    inputProps={{ maxLength: 500 }}
                    helperText={`${service.description.length}/500 caracteres`}
                    placeholder="Describa en detalle el servicio requerido, incluyendo especificaciones técnicas, plazo de ejecución, etc."
                    sx={{
                      backgroundColor: 'transparent',
                      color: colors.text,
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: colors.borgundy,
                        },
                      }
                    }}
                  />
                </Box>
              ))}
              
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={specialOrderForm.orderType === 'product' ? handleAddProductField : handleAddServiceField}
                fullWidth
                sx={{ 
                  mb: 3,
                  borderColor: colors.borgundy,
                  color: colors.borgundy,
                  '&:hover': {
                    borderColor: colors.sapphire,
                    backgroundColor: 'rgba(2, 33, 71, 0.04)'
                  }
                }}
              >
                Añadir otro {specialOrderForm.orderType === 'product' ? 'producto' : 'servicio'}
              </Button>
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel sx={{ color: colors.textSecondary }}>Tipo de Pago</InputLabel>
                <Select
                  value={specialOrderForm.currency}
                  label="Tipo de Pago"
                  onChange={(e) => setSpecialOrderForm({...specialOrderForm, currency: e.target.value})}
                  sx={{
                    backgroundColor: 'transparent',
                    color: colors.text,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: colors.borgundy,
                    }
                  }}
                >
                  <MenuItem value="CUP">CUP (Peso Cubano)</MenuItem>
                  <MenuItem value="MLC">MLC (Moneda Libremente Convertible)</MenuItem>
                  <MenuItem value="CL">CL (Cuenta de Liquidación)</MenuItem>
                </Select>
              </FormControl>
              
              {/* En el carrito */}
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel sx={{ color: colors.textSecondary }}>Proyecto</InputLabel>
                <Select
                  value={specialOrderForm.projectId}
                  label="Proyecto"
                  onChange={(e) => setSpecialOrderForm({...specialOrderForm, projectId: e.target.value})}
                  sx={{
                    backgroundColor: 'transparent',
                    color: colors.text,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: colors.borgundy,
                    }
                  }}
                >
                  <MenuItem value="">Seleccionar proyecto</MenuItem>
                  {projects.map((project) => {
                    const remainingBudget = getRemainingBudget(project);
                    return (
                      <MenuItem key={project.id} value={project.id}>
                        {project.costCenter} - {project.projectNumber} | {project.name} | 
                        Presupuesto: ${remainingBudget.toFixed(2)} CUP
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
              
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleSpecialOrderSubmit}
                sx={{ 
                  backgroundColor: colors.borgundy,
                  '&:hover': { backgroundColor: colors.sapphire }
                }}
              >
                Solicitar Pedido Extra
              </Button>
            </Paper>
          </Box>
        )}

        {/* Vista de Historial - CORREGIDA: ordenar por más reciente primero y evitar duplicación */}
        {viewMode === 'history' && (
          <Box sx={{ backgroundColor: colors.paper }}>
            <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2, mb: 3 }}>
              <TextField
                placeholder="Buscar por usuario, área, tipo, proyecto o número de pedido..."
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon color="action" />,
                }}
                fullWidth
                sx={{
                  backgroundColor: colors.paper,
                  '& .MuiOutlinedInput-root': {
                    color: colors.text,
                    '& fieldset': {
                      borderColor: colors.sapphire,
                    },
                    '&:hover fieldset': {
                      borderColor: colors.borgundy,
                    },
                  }
                }}
              />
              
              {currentUser?.role === 'admin' && (
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel sx={{ color: colors.textSecondary }}>Usuario</InputLabel>
                  <Select
                    value={selectedUser}
                    label="Usuario"
                    onChange={(e) => setSelectedUser(e.target.value)}
                    sx={{
                      backgroundColor: colors.paper,
                      color: colors.text,
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: colors.borgundy,
                      }
                    }}
                  >
                    {users.map(user => (
                      <MenuItem key={user} value={user}>{user}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel sx={{ color: colors.textSecondary }}>Ordenar por</InputLabel>
                <Select
                  value={sortOrder}
                  label="Ordenar por"
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <MenuItem value="newest">Más recientes</MenuItem>
                  <MenuItem value="oldest">Más antiguos</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {filteredPurchases.length === 0 ? (
              <Alert severity="info" sx={{ backgroundColor: colors.paper, color: colors.text }}>
                No hay pedidos registrados.
              </Alert>
            ) : (
              <TableContainer component={Paper} sx={{ 
                borderRadius: 2, 
                boxShadow: 2, 
                border: `1px solid ${colors.shellstone}`,
                backgroundColor: colors.paper
              }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: colors.shellstone }}>
                      <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>N° Pedido</TableCell>
                      <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>Tipo</TableCell>
                      <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>Jefe de Proyecto</TableCell>
                      <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>Área</TableCell>
                      <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>Proyecto ID</TableCell>
                      <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>Centro Costo</TableCell>
                      <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>Fecha</TableCell>
                      <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>Total</TableCell>
                      <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>Prioridad</TableCell>
                      <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>Acciones</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {filteredPurchases.map((purchase) => {
                      //  Buscar información actualizada del proyecto
                      const project = allProjects.find(p => p.id === purchase.projectId);
                      const textColor = colors.text;

                      return (
                        <TableRow 
                          key={purchase.id} 
                          hover 
                          sx={{ 
                            '&:hover': { backgroundColor: colors.paper },
                            backgroundColor: colors.paper,
                            color: colors.borgundy
                          }}
                        >
                          <TableCell sx={{ color: textColor }}>
                            {purchase.orderNumber || 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={
                                purchase.category === 'Pedidos Extra' || purchase.category?.includes('P.Extra')
                                  ? `P.Extra-${purchase.orderType || 'producto'}`
                                  : purchase.category
                              }
                              sx={{
                                backgroundColor: 
                                  purchase.category === 'Productos' ? colors.borgundy : 
                                  purchase.category === 'Servicios' ? colors.sapphire : 
                                  purchase.category?.includes('P.Extra-producto') ? '#1976d2' :
                                  purchase.category?.includes('P.Extra-servicio') ? '#ed6c02' :
                                  colors.tan,
                                color: 'white',
                                fontSize: '0.75rem'
                              }}
                              size="small"
                            />
                          </TableCell>
                          <TableCell sx={{ color: textColor }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar 
                                sx={{ 
                                  width: 32, 
                                  height: 32, 
                                  fontSize: '0.8rem',
                                  backgroundColor: colors.shellstone,
                                  color: 'white'
                                }}
                              >
                                {getUserName(purchase.userId)?.charAt(0)}
                              </Avatar>
                              <Typography variant="body2" sx={{ color: textColor }}>
                                {getUserName(purchase.userId)}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ color: textColor }}>
                            {getUserArea(purchase.userId)}
                          </TableCell>
                          {/*  Mostrar información REAL del proyecto */}
                          <TableCell sx={{ color: textColor, fontWeight: 'bold' }}>
                            {purchase.projectNumber || project?.projectNumber || 'N/A'}
                          </TableCell>
                          <TableCell sx={{ color: textColor, fontWeight: 'bold' }}>
                            {purchase.costCenter || project?.costCenter || 'N/A'}
                          </TableCell>
                          <TableCell sx={{ color: textColor }}>
                            {new Date(purchase.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell sx={{ color: textColor }}>
                            {purchase.total ? `$${purchase.total.toFixed(2)} ${purchase.currency || 'CUP'}` : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={purchase.priority || 'Media'}
                              sx={{
                                backgroundColor: 
                                  purchase.priority === 'Alta' ? '#f44336' : 
                                  purchase.priority === 'Media' ? colors.tan : '#4caf50',
                                color: 'white'
                              }}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Tooltip title="Ver detalles del pedido">
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleViewOrderDetails(purchase)}
                                  sx={{ 
                                    color: colors.sapphire,
                                    '&:hover': {
                                      backgroundColor: 'rgba(2, 33, 71, 0.1)'
                                    }
                                  }}
                                >
                                  <VisibilityIcon />
                                </IconButton>
                              </Tooltip>
                              
                              <Tooltip title="Editar pedido">
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleEditOrder(purchase)}
                                  sx={{ 
                                    color: colors.borgundy,
                                    '&:hover': {
                                      backgroundColor: 'rgba(2, 33, 71, 0.1)'
                                    }
                                  }}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Eliminar pedido">
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleDeleteOrder(
                                    purchase.id,
                                    purchase.type === 'special'
                                  )}
                                  sx={{ 
                                    color: '#f44336',
                                    '&:hover': {
                                      backgroundColor: 'rgba(244, 67, 54, 0.1)'
                                    }
                                  }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* Vista de Empresas vertical (solo admin) */}
        {viewMode === 'companies' && currentUser?.role === 'admin' && (
          <Box sx={{ 
            maxWidth: 1000, 
            margin: '0',
            width: '100%',
            backgroundColor: colors.paper
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setForm({ 
                    id: null, 
                    supplier: '', 
                    company: '', 
                    businessType: '', 
                    dataType: 'both',
                    companyImage: null,
                    currency: 'CUP',
                    contractActive: false,
                    productsCount: 0,
                    servicesCount: 0
                  });
                  setFiles({ products: null, services: null });
                  setEditMode(false);
                  setUploadModal(true);
                }}
                sx={{ 
                  backgroundColor: colors.borgundy, 
                  '&:hover': { backgroundColor: colors.sapphire }
                }}
              >
                Agregar Empresa
              </Button>
            </Box>
            
            {catalogs.length === 0 ? (
              <Alert severity="info" sx={{ mt: 2, backgroundColor: colors.paper, color: colors.text }}>
                No hay empresas registradas. Comience agregando un catálogo.
              </Alert>
            ) : (
              <Grid container spacing={3}>
                {Array.from(new Set(catalogs.map(c => c.company))).map((companyName) => {
                  const companyCatalogs = catalogs.filter(c => c.company === companyName);
                  const productCatalog = companyCatalogs.find(c => c.dataType === 'products');
                  const serviceCatalog = companyCatalogs.find(c => c.dataType === 'services');
                  const companyData = productCatalog || serviceCatalog || {};
                  
                  return (
                    <Grid item xs={12} sm={6} md={4} key={companyName}>
                      <Paper sx={{ 
                        p: 2, 
                        borderRadius: 2, 
                        boxShadow: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        height: '100%',
                        position: 'relative',
                        transition: 'all 0.3s ease',
                        border: `1px solid ${colors.shellstone}`,
                        backgroundColor: colors.paper,
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: 4,
                          borderColor: colors.borgundy
                        }
                      }}>
                        
                        <Avatar
                          src={companyData.companyImage}
                          sx={{ 
                            width: 60, 
                            height: 60, 
                            mb: 2,
                            backgroundColor: colors.borgundy
                          }}
                        >
                          {companyName.charAt(0)}
                        </Avatar>
                        
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" fontWeight="bold" noWrap sx={{ color: colors.borgundy }}>
                            {companyName}
                          </Typography>
                          <Typography variant="body2" color={colors.textSecondary} noWrap>
                            {companyData.businessType} • {companyData.supplier}
                          </Typography>
                          
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-around',
                            mt: 2,
                            width: '100%'
                          }}>
                            <Box sx={{ textAlign: 'center' }}>
                              <StoreIcon fontSize="small" sx={{ color: colors.borgundy }} />
                              <Typography variant="body2" fontSize="0.9rem" sx={{ color: colors.borgundy }}>
                                {productCatalog ? productCatalog.data.length : 0}
                              </Typography>
                              <Typography variant="caption" color={colors.textSecondary}>
                                Productos
                              </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center' }}>
                              <CategoryIcon fontSize="small" sx={{ color: colors.sapphire }} />
                              <Typography variant="body2" fontSize="0.9rem" sx={{ color: colors.sapphire }}>
                                {serviceCatalog ? serviceCatalog.data.length : 0}
                              </Typography>
                              <Typography variant="caption" color={colors.textSecondary}>
                                Servicios
                              </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center' }}>
                              <CheckCircleIcon 
                                fontSize="small" 
                                sx={{ color: companyData.contractActive ? "#4caf50" : "#f44336" }} 
                              />
                              <Typography variant="body2" fontSize="0.9rem" sx={{ 
                                color: companyData.contractActive ? "#4caf50" : "#f44336" 
                              }}>
                                {companyData.contractActive ? "Sí" : "No"}
                              </Typography>
                              <Typography variant="caption" color={colors.textSecondary}>
                                Contrato
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                        
                        <Box sx={{ 
                          display: 'flex', 
                          gap: 1,
                          mt: 2,
                          width: '100%'
                        }}>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => {
                              if (window.confirm(`¿Eliminar todos los catálogos de ${companyName}?`)) {
                                const updated = catalogs.filter(c => c.company !== companyName);
                                setCatalogs(updated);
                                localStorage.setItem('OASiS_catalogs', JSON.stringify(updated));
                                addNotification({
                                  title: 'Empresa eliminada',
                                  message: `Se eliminaron todos los catálogos de ${companyName}`,
                                  type: 'warning'
                                });
                              }
                            }}
                            sx={{ flex: 1 }}
                          >
                            Eliminar
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<EditIcon />}
                            onClick={() => {
                              // Pasar el catálogo base correcto
                              const baseCatalog = productCatalog || serviceCatalog || companyCatalogs[0] || {};
                              handleEditCatalog(baseCatalog);
                            }}
                            sx={{ 
                              flex: 1,
                              backgroundColor: colors.borgundy,
                              '&:hover': { backgroundColor: colors.sapphire }
                            }}
                          >
                            Editar
                          </Button>
                        </Box>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Box>
        )}

        {/* Diálogo de Producto */}
        <Dialog open={Boolean(productDialog)} onClose={() => setProductDialog(null)} maxWidth="sm" fullWidth
          PaperProps={{
            sx: {
              backgroundColor: colors.paper,
              color: colors.text,
            }
          }}
        >
          {productDialog && (
            <>
              <DialogTitle sx={{ backgroundColor: colors.paper, color: colors.borgundy }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {productDialog.name}
                </Box>
              </DialogTitle>
              <DialogContent sx={{ backgroundColor: colors.paper }}>
                <Box sx={{ mt: 2 }}>
                  {/* IMAGEN MEJORADA */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    mb: 3,
                    borderRadius: 2,
                    overflow: 'hidden',
                    height: '250px',
                    backgroundColor: colors.paper,
                    position: 'relative'
                  }}>
                    <EnhancedProductImage 
                      productName={productDialog.name}
                      alt={productDialog.name}
                      sx={{
                        width: '100%',
                        height: '100%',
                        padding: '10px'
                      }}
                    />
                  </Box>
                  
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: colors.borgundy }}>
                    {productDialog.name}
                  </Typography>
                  
                  <Typography variant="body1" sx={{ mb: 1, color: colors.textSecondary }}>
                    <strong>Modelo:</strong> {productDialog.model}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1, color: colors.textSecondary }}>
                    <strong>Descripción:</strong> {productDialog.description}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1, color: colors.textSecondary }}>
                    <strong>Categoría:</strong> {productDialog.category}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1, color: colors.textSecondary }}>
                    <strong>Empresa:</strong> {productDialog.company}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1, color: colors.textSecondary }}>
                    <strong>Proveedor:</strong> {productDialog.supplier}
                  </Typography>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    mb: 2,
                    p: 2,
                    backgroundColor: colors.paper,
                    borderRadius: 2,
                    border: `1px solid ${colors.shellstone}`
                  }}>
                    <Typography variant="h5" color="error" sx={{ fontWeight: 'bold' }}>
                      ${productDialog.price} CUP
                    </Typography>
                    <Chip
                      label={`Stock: ${productDialog.stock}`}
                      color={productDialog.stock > 0 ? "success" : "error"}
                      variant="outlined"
                    />
                  </Box>

                  {(() => {
                    const companyCatalog = catalogs.find(c => 
                      c.company === productDialog.company && c.dataType === 'products'
                    );
                    const isCompanyActive = companyCatalog ? companyCatalog.contractActive : false;
                    const isOutOfStock = productDialog.stock <= 0 || productDialog.availability === 'Agotado';
                    
                    if (isOutOfStock) {
                      return (
                        <Alert 
                          severity="error" 
                          sx={{ mt: 2 }}
                        >
                          Este producto está agotado y no está disponible para compra.
                        </Alert>
                      );
                    }
                    return null;
                  })()}
                </Box>
              </DialogContent>
              <DialogActions sx={{ backgroundColor: colors.paper }}>
                <Button onClick={() => setProductDialog(null)} sx={{ color: colors.textSecondary }}>Cerrar</Button>
                {(() => {
                  const isOutOfStock = productDialog.stock <= 0 || productDialog.availability === 'Agotado';
                  
                  return (
                    <Button
                      variant="contained"
                      onClick={() => {
                        addToCart(productDialog);
                        setProductDialog(null);
                      }}
                      disabled={isOutOfStock}
                      sx={{ 
                        backgroundColor: isOutOfStock ? 'grey' : colors.borgundy,
                        '&:hover': { backgroundColor: isOutOfStock ? 'grey' : colors.sapphire },
                        '&.Mui-disabled': { backgroundColor: 'rgba(2, 33, 71, 0.3)' }
                      }}
                    >
                      Añadir al carrito
                    </Button>
                  );
                })()}
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Diálogo de Detalles del Pedido */}
        <Dialog 
          open={Boolean(orderDetailsDialog)} 
          onClose={() => setOrderDetailsDialog(null)} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: colors.paper,
              color: colors.text,
              borderRadius: 2,
              boxShadow: 3
            }
          }}
        >
          {orderDetailsDialog && (
            <>
              <DialogTitle sx={{ 
                backgroundColor: colors.borgundy, 
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <AssignmentIcon />
                Detalles del Pedido - {orderDetailsDialog.orderNumber || 'N/A'}
              </DialogTitle>
              
              <DialogContent sx={{ mt: 2 }}>
                {/* Información General del Pedido */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ color: colors.borgundy, borderBottom: `2px solid ${colors.borgundy}`, pb: 1 }}>
                    Información General
                  </Typography>
                  
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', color: colors.textSecondary }}>
                        Tipo:
                      </Typography>
                      <Chip
                        label={
                          orderDetailsDialog.category === 'Pedidos Extra' || orderDetailsDialog.category?.includes('P.Extra')
                            ? `Pedido Extra - ${orderDetailsDialog.orderType || 'producto'}`
                            : orderDetailsDialog.category
                        }
                        sx={{
                          backgroundColor: 
                            orderDetailsDialog.category === 'Productos' ? colors.borgundy : 
                            orderDetailsDialog.category === 'Servicios' ? colors.sapphire : 
                            orderDetailsDialog.category?.includes('P.Extra-producto') ? '#1976d2' :
                            orderDetailsDialog.category?.includes('P.Extra-servicio') ? '#ed6c02' :
                            colors.tan,
                          color: 'white',
                          fontSize: '0.75rem'
                        }}
                        size="small"
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', color: colors.textSecondary }}>
                        Empresa:
                      </Typography>
                      <Typography variant="body2" sx={{ color: colors.text }}>
                        {orderDetailsDialog.company || 
                        (orderDetailsDialog.items && orderDetailsDialog.items[0]?.company) || 
                        'N/A'}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', color: colors.textSecondary }}>
                        Jefe de Proyecto:
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Avatar 
                          sx={{ 
                            width: 32, 
                            height: 32, 
                            fontSize: '0.8rem',
                            backgroundColor: colors.borgundy,
                            color: 'white'
                          }}
                        >
                          {getUserName(orderDetailsDialog.userId)?.charAt(0)}
                        </Avatar>
                        <Typography variant="body2" sx={{ color: colors.text }}>
                          {getUserName(orderDetailsDialog.userId)}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', color: colors.textSecondary }}>
                        Área:
                      </Typography>
                      <Typography variant="body2" sx={{ color: colors.text }}>
                        {getUserArea(orderDetailsDialog.userId)}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', color: colors.textSecondary }}>
                        Proyecto ID:
                      </Typography>
                      <Typography variant="body2" sx={{ color: colors.text, fontWeight: 'bold' }}>
                        {orderDetailsDialog.projectNumber || 'N/A'}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', color: colors.textSecondary }}>
                        Centro de Costo:
                      </Typography>
                      <Typography variant="body2" sx={{ color: colors.text, fontWeight: 'bold' }}>
                        {orderDetailsDialog.costCenter || 'N/A'}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', color: colors.textSecondary }}>
                        Fecha:
                      </Typography>
                      <Typography variant="body2" sx={{ color: colors.text }}>
                        {new Date(orderDetailsDialog.date).toLocaleDateString()} {new Date(orderDetailsDialog.date).toLocaleTimeString()}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', color: colors.textSecondary }}>
                        Estado:
                      </Typography>
                      <Chip
                        label={orderDetailsDialog.status || 'Pendiente'}
                        color={
                          orderDetailsDialog.status === 'Aprobado' ? 'success' :
                          orderDetailsDialog.status === 'Rechazado' ? 'error' : 'warning'
                        }
                        size="small"
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', color: colors.textSecondary }}>
                        Prioridad:
                      </Typography>
                      <Chip
                        label={orderDetailsDialog.priority || 'Media'}
                        sx={{
                          backgroundColor: 
                            orderDetailsDialog.priority === 'Alta' ? '#f44336' : 
                            orderDetailsDialog.priority === 'Media' ? colors.tan : '#4caf50',
                          color: 'white'
                        }}
                        size="small"
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', color: colors.textSecondary }}>
                        Total:
                      </Typography>
                      <Typography variant="h6" sx={{ color: 'red', fontWeight: 'bold' }}>
                        {orderDetailsDialog.total ? `$${orderDetailsDialog.total.toFixed(2)} ${orderDetailsDialog.currency || 'CUP'}` : 'N/A'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>

                {/* Detalles de los Items */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ color: colors.borgundy, borderBottom: `2px solid ${colors.tan}`, pb: 1 }}>
                    {orderDetailsDialog.orderType === 'service' ? 'Servicios Solicitados' : 'Productos Solicitados'}
                  </Typography>
                  
                  {(!orderDetailsDialog.items || orderDetailsDialog.items.length === 0) ? (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      No hay items en este pedido
                    </Alert>
                  ) : (
                    <TableContainer component={Paper} sx={{ mt: 2, boxShadow: 1, backgroundColor: colors.background }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ backgroundColor: colors.paper }}>
                            <TableCell sx={{ fontWeight: 'bold', color: colors.text }}>Nombre</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: colors.text }}>Empresa</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: colors.text }}>Cantidad</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: colors.text }}>Precio Unitario</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: colors.text }}>Subtotal</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: colors.text }}>Descripción</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {orderDetailsDialog.items.map((item, index) => (
                            <TableRow key={index} hover sx={{ backgroundColor: colors.paper }}>
                              <TableCell sx={{ color: colors.text }}>
                                {item.name || item.serviceType || 'N/A'}
                              </TableCell>
                              <TableCell sx={{ color: colors.text }}>
                                {item.company || 'N/A'}
                              </TableCell>
                              <TableCell sx={{ color: colors.text }}>
                                {item.quantity || 1}
                              </TableCell>
                              <TableCell sx={{ color: colors.text }}>
                                ${item.price ? item.price.toFixed(2) : 'N/A'} {orderDetailsDialog.currency || 'CUP'}
                              </TableCell>
                              <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>
                                ${item.price && item.quantity ? (item.price * item.quantity).toFixed(2) : 'N/A'} {orderDetailsDialog.currency || 'CUP'}
                              </TableCell>
                              <TableCell sx={{ color: colors.text, maxWidth: 200 }}>
                                <Typography variant="body2" noWrap title={item.description}>
                                  {item.description || 'Sin descripción'}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Box>

                {/* Información Adicional para Pedidos Extra */}
                {(orderDetailsDialog.type === 'special' || orderDetailsDialog.category?.includes('P.Extra')) && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ color: colors.borgundy, borderBottom: `2px solid ${colors.tan}`, pb: 1 }}>
                      Información Adicional del Pedido Extra
                    </Typography>
                    
                    <Box sx={{ p: 2, backgroundColor: colors.paper, borderRadius: 2, mt: 2 }}>
                      <Typography variant="body2" sx={{ color: colors.textSecondary, fontStyle: 'italic' }}>
                        Este es un pedido especial que requiere aprobación adicional. 
                        {orderDetailsDialog.orderType === 'product' 
                          ? ' Los productos solicitados no están en el catálogo regular.' 
                          : ' Los servicios solicitados requieren cotización especial.'}
                      </Typography>
                      
                      {orderDetailsDialog.items && orderDetailsDialog.items.some(item => item.equipmentType) && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: colors.borgundy }}>
                            Especificaciones Técnicas:
                          </Typography>
                          {orderDetailsDialog.items
                            .filter(item => item.equipmentType && item.equipmentType !== 'other')
                            .map((item, index) => (
                              <Box key={index} sx={{ mt: 1, p: 1, backgroundColor: colors.paper, borderRadius: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 'bold', color: colors.sapphire }}>
                                  {item.name} ({EQUIPMENT_CONFIG[item.equipmentType]?.name})
                                </Typography>
                                {item.characteristics && Object.keys(item.characteristics).length > 0 && (
                                  <Box sx={{ mt: 0.5 }}>
                                    {Object.entries(item.characteristics).map(([key, value]) => (
                                      <Typography key={key} variant="caption" sx={{ display: 'block', color: colors.textSecondary }}>
                                        • {EQUIPMENT_CONFIG[item.equipmentType]?.characteristics[key]?.label}: {Array.isArray(value) ? value.join(', ') : value}
                                      </Typography>
                                    ))}
                                  </Box>
                                )}
                              </Box>
                            ))}
                        </Box>
                      )}
                    </Box>
                  </Box>
                )}
              </DialogContent>
              
              <DialogActions sx={{ p: 2, backgroundColor: colors.paper }}>
                <Button 
                  onClick={() => setOrderDetailsDialog(null)}
                  sx={{ color: colors.textSecondary }}
                >
                  Cerrar
                </Button>
                <Button 
                  variant="contained"
                  onClick={() => {
                    handleEditOrder(orderDetailsDialog);
                    setOrderDetailsDialog(null);
                  }}
                  sx={{ 
                    backgroundColor: colors.borgundy,
                    '&:hover': { backgroundColor: colors.sapphire }
                  }}
                >
                  Editar Pedido
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Modal de Subida y Edición con diseño mejorado */}
        <Dialog 
          open={uploadModal} 
          onClose={handleCancelEdit} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: {
              background: `rgba(${darkMode ? '45, 55, 72' : '245, 240, 233'}, 0.9)`,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${colors.shellstone}`,
              borderRadius: 3,
              boxShadow: '0 8px 32px 0 rgba(2, 33, 71, 0.2)'
            }
          }}
        >
          <DialogTitle sx={{ 
            backgroundColor: colors.paper, 
            color: colors.borgundy,
            borderBottom: `1px solid ${colors.shellstone}`
          }}>
            {editMode ? 'Editar Empresa' : 'Nueva Empresa'}
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Proveedor"
                    fullWidth
                    value={form.supplier}
                    onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                    required
                    margin="normal"
                    sx={{
                      backgroundColor: colors.paper,
                      '& .MuiOutlinedInput-root': {
                        color: colors.text,
                        '& fieldset': {
                          borderColor: colors.shellstone,
                        },
                        '&:hover fieldset': {
                          borderColor: colors.borgundy,
                        },
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Empresa"
                    fullWidth
                    value={form.company}
                    onChange={(e) => {
                      console.log('✏️ Cambiando nombre de empresa:', e.target.value);
                      setForm({ ...form, company: e.target.value });
                    }}
                    required
                    margin="normal"
                    sx={{
                      backgroundColor: colors.paper,
                      '& .MuiOutlinedInput-root': {
                        color: colors.text,
                        '& fieldset': {
                          borderColor: colors.shellstone,
                        },
                        '&:hover fieldset': {
                          borderColor: colors.borgundy,
                        },
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel sx={{ color: colors.textSecondary }}>Tipo de Negocio</InputLabel>
                    <Select
                      value={form.businessType}
                      label="Tipo de Negocio"
                      onChange={(e) => setForm({ ...form, businessType: e.target.value })}
                      required
                      sx={{
                        backgroundColor: colors.paper,
                        color: colors.text,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: colors.borgundy,
                        }
                      }}
                    >
                      <MenuItem value="">Seleccionar tipo</MenuItem>
                      <MenuItem value="Estatal">Estatal</MenuItem>
                      <MenuItem value="PYME">PYME</MenuItem>
                      <MenuItem value="TCP">TCP</MenuItem>
                      <MenuItem value="Extranjera">Extranjera</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel sx={{ color: colors.textSecondary }}>Moneda</InputLabel>
                    <Select
                      value={form.currency}
                      label="Moneda"
                      onChange={(e) => setForm({ ...form, currency: e.target.value })}
                      sx={{
                        backgroundColor: colors.paper,
                        color: colors.text,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: colors.borgundy,
                        }
                      }}
                    >
                      <MenuItem value="CUP">CUP (Peso Cubano)</MenuItem>
                      <MenuItem value="MLC">MLC (Moneda Libremente Convertible)</MenuItem>
                      <MenuItem value="USD">USD (Dólar Americano)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal">
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                      <Checkbox
                        checked={form.contractActive}
                        onChange={(e) => setForm({ ...form, contractActive: e.target.checked })}
                        sx={{
                          color: colors.borgundy,
                          '&.Mui-checked': {
                            color: colors.borgundy,
                          },
                        }}
                      />
                      <Typography variant="body2" sx={{ color: colors.text }}>Contrato vigente</Typography>
                    </Box>
                  </FormControl>
                </Grid>
                
                {editMode && (
                  <Grid item xs={12}>
                    <Paper sx={{ 
                      p: 2, 
                      backgroundColor: colors.paper, 
                      borderRadius: 2,
                      border: `1px solid ${colors.shellstone}`
                    }}>
                      <Typography variant="subtitle2" gutterBottom fontWeight="bold" sx={{ color: colors.borgundy }}>
                        Estadísticas actuales de la empresa:
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 4, mt: 1 }}>
                        <Box sx={{ textAlign: 'center' }}>
                          <StoreIcon sx={{ fontSize: 24, color: colors.borgundy }} />
                          <Typography variant="h6" sx={{ color: colors.borgundy }}>
                            {form.productsCount}
                          </Typography>
                          <Typography variant="body2" sx={{ color: colors.textSecondary }}>Productos</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                          <CategoryIcon sx={{ fontSize: 24, color: colors.sapphire }} />
                          <Typography variant="h6" sx={{ color: colors.sapphire }}>
                            {form.servicesCount}
                          </Typography>
                          <Typography variant="body2" sx={{ color: colors.textSecondary }}>Servicios</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                          <CheckCircleIcon 
                            sx={{ fontSize: 24, color: form.contractActive ? "#4caf50" : "#f44336" }} 
                          />
                          <Typography 
                            variant="h6" 
                            sx={{ color: form.contractActive ? "#4caf50" : "#f44336" }}
                          >
                            {form.contractActive ? "Sí" : "No"}
                          </Typography>
                          <Typography variant="body2" sx={{ color: colors.textSecondary }}>Contrato Activo</Typography>
                        </Box>
                      </Box>
                    </Paper>
                    <Typography variant="caption" sx={{ mt: 1, display: 'block', color: colors.textSecondary }}>
                      ⓘ Para actualizar los catálogos, suba nuevos archivos Excel
                    </Typography>
                  </Grid>
                )}

                {/* Sección de Catálogos mejorada */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2, borderColor: colors.shellstone }} />
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ color: colors.borgundy }}>
                    Catálogos de la empresa
                  </Typography>
                </Grid>

                {/* Diseño responsive para catálogos */}
                <Grid container spacing={2}>
                  {/* Subida de Productos */}
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 3, p: 2, border: `1px solid ${colors.shellstone}`, borderRadius: 2, backgroundColor: colors.paper }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6" sx={{ color: colors.borgundy }}>Catálogo de Productos</Typography>
                        <Button
                          startIcon={<DownloadIcon />}
                          onClick={() => generateTemplate('products')}
                          size="small"
                          variant="outlined"
                          sx={{ 
                            borderColor: colors.borgundy, 
                            color: colors.borgundy,
                            '&:hover': {
                              borderColor: colors.sapphire,
                              backgroundColor: 'rgba(2, 33, 71, 0.04)'
                            }
                          }}
                        >
                          Descargar Plantilla
                        </Button>
                      </Box>
                      <Button
                        variant="outlined"
                        component="label"
                        fullWidth
                        startIcon={<UploadIcon />}
                        sx={{ 
                          justifyContent: 'flex-start',
                          borderColor: files.products ? colors.borgundy : colors.shellstone,
                          color: files.products ? colors.borgundy : colors.text,
                          backgroundColor: files.products ? colors.paper : 'transparent',
                          '&:hover': {
                            borderColor: colors.borgundy,
                            backgroundColor: colors.paper,
                          }
                        }}
                      >
                        {files.products ? files.products.name : 'Seleccionar archivo Excel de productos'}
                        <input
                          type="file"
                          accept=".xlsx, .xls"
                          hidden
                          onChange={(e) => handleFileChange(e, 'products')}
                        />
                      </Button>
                      {errors.products && <Alert severity="error" sx={{ mt: 1 }}>{errors.products}</Alert>}
                      {files.products && (
                        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                            Archivo seleccionado: {files.products.name}
                          </Typography>
                          <IconButton 
                            size="small" 
                            onClick={() => setFiles({ ...files, products: null })}
                            sx={{ color: '#f44336' }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      )}
                      {editMode && !files.products && (
                        <Typography variant="caption" sx={{ mt: 1, display: 'block', color: colors.textSecondary }}>
                          ⓘ Dejar vacío para mantener el catálogo actual de productos
                        </Typography>
                      )}
                    </Box>
                  </Grid>

                  {/* Subida de Servicios */}
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 3, p: 2, border: `1px solid ${colors.shellstone}`, borderRadius: 2, backgroundColor: colors.paper }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6" sx={{ color: colors.borgundy }}>Catálogo de Servicios</Typography>
                        <Button
                          startIcon={<DownloadIcon />}
                          onClick={() => generateTemplate('services')}
                          size="small"
                          variant="outlined"
                          sx={{ 
                            borderColor: colors.borgundy, 
                            color: colors.borgundy,
                            '&:hover': {
                              borderColor: colors.sapphire,
                              backgroundColor: 'rgba(2, 33, 71, 0.04)'
                            }
                          }}
                        >
                          Descargar Plantilla
                        </Button>
                      </Box>
                      <Button
                        variant="outlined"
                        component="label"
                        fullWidth
                        startIcon={<UploadIcon />}
                        sx={{ 
                          justifyContent: 'flex-start',
                          borderColor: files.services ? colors.borgundy : colors.shellstone,
                          color: files.services ? colors.borgundy : colors.text,
                          backgroundColor: files.services ? colors.paper : 'transparent',
                          '&:hover': {
                            borderColor: colors.borgundy,
                            backgroundColor: colors.paper,
                          }
                        }}
                      >
                        {files.services ? files.services.name : 'Seleccionar archivo Excel de servicios'}
                        <input
                          type="file"
                          accept=".xlsx, .xls"
                          hidden
                          onChange={(e) => handleFileChange(e, 'services')}
                        />
                      </Button>
                      {errors.services && <Alert severity="error" sx={{ mt: 1 }}>{errors.services}</Alert>}
                      {files.services && (
                        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                            Archivo seleccionado: {files.services.name}
                          </Typography>
                          <IconButton 
                            size="small" 
                            onClick={() => setFiles({ ...files, services: null })}
                            sx={{ color: '#f44336' }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      )}
                      {editMode && !files.services && (
                        <Typography variant="caption" sx={{ mt: 1, display: 'block', color: colors.textSecondary }}>
                          ⓘ Dejar vacío para mantener el catálogo actual de servicios
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              
                {errors.form && (
                  <Grid item xs={12}>
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {errors.form}
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions sx={{ 
            backgroundColor: colors.paper, 
            borderTop: `1px solid ${colors.shellstone}`,
            p: 3 
          }}>
            <Button 
              onClick={handleCancelEdit}
              disabled={loading}
              sx={{ color: colors.textSecondary }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              variant="contained"
              sx={{ 
                backgroundColor: colors.borgundy,
                '&:hover': { backgroundColor: colors.sapphire },
                '&:disabled': { backgroundColor: '#cccccc' }
              }}
            >
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                  Guardando...
                </Box>
              ) : editMode ? 'Actualizar Empresa' : 'Crear Empresa'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Carrito con notificación de empresas inactivas */}
        <Dialog open={showCart} onClose={() => setShowCart(false)} maxWidth="sm" fullWidth
          PaperProps={{
            sx: {
              backdropFilter: 'blur(10px)',
              border: `1px solid ${colors.shellstone}`,
              borderRadius: 3
            }
          }}
        >
          <DialogTitle sx={{ color: colors.borgundy }}>Carrito de Compras</DialogTitle>
          <DialogContent>
            {cart.length === 0 ? (
              <Alert severity="info" sx={{ backgroundColor: colors.paper, color: colors.text }}>
                Tu carrito está vacío
              </Alert>
            ) : (
              <Box sx={{ mt: 2 }}>
                {/* Notificación para items de empresas inactivas */}
                {checkInactiveItemsInCart() && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Algunos productos y servicios en tu carrito pertenecen a empresas que actualmente no tienen contrato activo. 
                    No podrás proceder con la compra hasta que los elimines del carrito.
                  </Alert>
                )}

                {cart.map((item) => {
                  const companyCatalog = catalogs.find(c => 
                    c.company === item.company && 
                    c.dataType === (item.dataType || (item.name ? 'products' : 'services'))
                  );
                  const isCompanyActive = companyCatalog ? companyCatalog.contractActive : false;
                  
                  return (
                    <Box key={item.id} sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      p: 1, 
                      borderBottom: `1px solid ${colors.shellstone}`,
                      backgroundColor: !isCompanyActive ? 'rgba(255, 152, 0, 0.1)' : 'transparent',
                      '&:last-child': { borderBottom: 'none' }
                    }}>
                      <Box>
                        <Typography variant="body1" sx={{ color: colors.text }}>{item.name || item.service}</Typography>
                        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                          ${item.price} x {item.quantity} = ${parseFloat(item.price * item.quantity).toFixed(2)} CUP
                        </Typography>
                        {!isCompanyActive && (
                          <Chip 
                            label="Empresa inactiva" 
                            size="small" 
                            color="warning" 
                            sx={{ mt: 0.5 }} 
                          />
                        )}
                      </Box>
                      {/* En el diálogo del carrito - CORREGIDO */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton 
                          size="small" 
                          onClick={() => updateQuantity(item.id, -1)}
                          disabled={item.quantity <= 1}
                          sx={{ color: colors.borgundy }}
                        >
                          <RemoveCircleIcon fontSize="small" />
                        </IconButton>
                        <Typography variant="body2" sx={{ color: colors.text }}>{item.quantity}</Typography>
                        <IconButton 
                          size="small" 
                          onClick={() => updateQuantity(item.id, 1)}
                          sx={{ color: colors.borgundy }}
                        >
                          <AddCircleIcon fontSize="small" />
                        </IconButton>
                        {/* CORREGIDO: Botón de eliminar completamente */}
                        <IconButton 
                          size="small" 
                          onClick={() => removeFromCart(item.id)}
                          sx={{ color: '#f44336' }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  );
                })}
                
                <Box sx={{ mt: 3, p: 2, backgroundColor: colors.paper, borderRadius: 2, border: `1px solid ${colors.shellstone}` }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1" sx={{ color: colors.text, fontWeight: 'bold' }}>Total:</Typography>
                    <Typography variant="body1" sx={{ color: 'red', fontWeight: 'bold' }}>
                      ${cartTotal.toFixed(2)} CUP
                    </Typography>
                  </Box>
                  
                  {selectedProjectObj && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1" sx={{ color: colors.text, fontWeight: 'bold' }}>Presupuesto:</Typography>
                      <Typography variant="body1" sx={{ color: colors.textSecondary }}>
                        ${parseFloat(selectedProjectObj.budget).toFixed(2)} CUP
                      </Typography>
                    </Box>
                  )}
                  
                  {selectedProjectObj && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body1" sx={{ color: colors.text, fontWeight: 'bold' }}>Restante:</Typography>
                      <Typography variant="body1" sx={{ color: remainingBudget >= 0 ? 'green' : 'red', fontWeight: 'bold' }}>
                        ${remainingBudget.toFixed(2)} CUP
                      </Typography>
                    </Box>
                  )}
                </Box>

                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel sx={{ color: colors.textSecondary }}>Proyecto</InputLabel>
                  <Select
                    value={selectedProject}
                    label="Proyecto"
                    onChange={(e) => setSelectedProject(e.target.value)}
                    sx={{
                      backgroundColor: 'transparent',
                      color: colors.text,
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: colors.borgundy,
                      }
                    }}
                  >
                    <MenuItem value="">Seleccionar proyecto</MenuItem>
                    {projects.map((project) => {
                      const remainingBudget = getRemainingBudget(project);
                      return (
                        <MenuItem key={project.id} value={project.id}>
                          {/*  Mostrar información completa como en Proyectos.jsx */}
                          {project.costCenter} - {project.projectNumber} | {project.name} | 
                          Presupuesto: ${remainingBudget.toFixed(2)} CUP
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setShowCart(false)} sx={{ color: colors.textSecondary }}>Cerrar</Button>
            {cart.length > 0 && (
              <>
                <Button 
                  onClick={clearCart} 
                  sx={{ color: '#f44336' }}
                  disabled={loading}
                >
                  Vaciar
                </Button>
                {/* CORREGIDO: Botón Finalizar Compra - ahora se activa correctamente */}
                <Button
                  onClick={checkout}
                  variant="contained"
                  disabled={!canFinalizePurchase() || loading}
                  sx={{ 
                    backgroundColor: colors.borgundy,
                    '&:hover': { backgroundColor: colors.sapphire },
                    '&:disabled': { backgroundColor: '#cccccc' }
                  }}
                >
                  {loading ? 'Procesando...' : 'Finalizar Compra'}
                </Button>
              </>
            )}
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}