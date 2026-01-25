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
  Language as LanguageIcon
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
import { useTheme as useCustomTheme } from '../../context/ThemeContext';

import { getImageForProduct, DEFAULT_IMAGE } from '../../utils/productImages';
import ProductImage from '../../components/ProductImage/ProductImage';

// Nueva función para scraping de productos
const scrapeWebsiteProducts = async (websiteUrl) => {
  try {
    console.log('Iniciando scraping de:', websiteUrl);
    
    // Nota: En un entorno real necesitarías un backend para scraping
    // debido a restricciones CORS. Esto es un ejemplo simulado.
    
    // Simulación de scraping (reemplazar con llamada a backend)
    const mockProducts = [
      {
        id: Date.now() + 1,
        name: 'Producto Web 1',
        model: 'WEB-001',
        price: 100,
        image: DEFAULT_IMAGE,
        description: 'Producto obtenido desde la website',
        stock: 10,
        availability: 'Disponible',
        category: 'Web',
        fromWebsite: true,
        website: websiteUrl
      },
      {
        id: Date.now() + 2,
        name: 'Producto Web 2',
        model: 'WEB-002',
        price: 200,
        image: DEFAULT_IMAGE,
        description: 'Otro producto de la tienda online',
        stock: 5,
        availability: 'Disponible',
        category: 'Web',
        fromWebsite: true,
        website: websiteUrl
      }
    ];
    
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return mockProducts;
  } catch (error) {
    console.error('Error en scraping:', error);
    throw new Error('No se pudieron obtener productos del sitio web');
  }
};

// Función para obtener imagen online mejorada
const searchProductImageOnline = async (productName) => {
  try {
    // Usar servicio de placeholder si no hay API key
    const query = encodeURIComponent(productName + ' tecnología producto');
    
    // Servicio de placeholder para desarrollo
    const placeholderUrl = `https://via.placeholder.com/300/022147/FFFFFF?text=${encodeURIComponent(productName.substring(0, 30))}`;
    
    // Si tienes API key de Unsplash, úsala:
    const apiKey = process.env.REACT_APP_UNSPLASH_ACCESS_KEY;
    if (apiKey) {
      const searchUrl = `https://api.unsplash.com/search/photos?query=${query}&per_page=1&client_id=${apiKey}`;
      const response = await fetch(searchUrl);
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        return data.results[0].urls.small;
      }
    }
    
    return placeholderUrl;
  } catch (error) {
    console.warn('Error buscando imagen online:', error);
    return null;
  }
};

// Función mejorada para obtener imágenes
const getEnhancedImageForProduct = async (productName) => {
  if (!productName) return DEFAULT_IMAGE;

  const name = productName.toLowerCase();
  
  // 1. Buscar online
  try {
    const onlineImage = await searchProductImageOnline(productName);
    if (onlineImage) {
      return onlineImage;
    }
  } catch (error) {
    console.warn('Falló búsqueda online:', error);
  }
  
  // 2. Buscar en mapeo local
  const localImage = getImageForProduct(productName);
  if (localImage && localImage !== DEFAULT_IMAGE) {
    return localImage;
  }
  
  // 3. Logo por defecto
  return DEFAULT_IMAGE;
};

// Paleta de colores con modo oscuro mejorado
const COLORS = {
  light: {
    primary: '#4E0101',
    secondary: '#3C5070',
    accent: '#d2b48c',
    background: '#F5F0E9',
    paper: '#FFFFFF',
    text: '#1A202C',
    textSecondary: '#4A5568',
    border: '#E2E8F0',
    success: '#38A169',
    warning: '#D69E2E',
    error: '#E53E3E',
    info: '#3182CE',
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
    info: '#63B3ED',
  }
};

// Componente para vista previa de website
const WebsitePreview = ({ websiteUrl, companyName }) => {
  const [loading, setLoading] = useState(true);
  
  if (!websiteUrl) return null;
  
  return (
    <Box sx={{ 
      width: '100%', 
      height: '200px', 
      borderRadius: 2,
      overflow: 'hidden',
      border: '1px solid',
      borderColor: 'inherit',
      position: 'relative'
    }}>
      {loading && (
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.05)'
        }}>
          <CircularProgress size={40} />
        </Box>
      )}
      <iframe
        src={websiteUrl}
        title={`Tienda online de ${companyName}`}
        style={{
          width: '100%',
          height: '100%',
          border: 'none'
        }}
        onLoad={() => setLoading(false)}
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
      />
    </Box>
  );
};

// Plantillas predefinidas
const TEMPLATES = {
  products: {
    headers: ['nombre', 'modelo', 'precio', 'imagen', 'descripcion', 'stock', 'disponibilidad', 'categoria'],
    sampleData: [
      ['Teclado Mecánico RGB', 'Redragon Kumara K552', '45', '/assets/images/teclado.jpg', 'Teclado gaming mecánico retroiluminado', '25', 'Disponible', 'Periféricos'],
      ['Mouse Inalámbrico', 'Logitech M720 Triathlon', '35', '/assets/images/mouse.jpg', 'Mouse ergonómico multi-dispositivo', '30', 'Disponible', 'Periféricos'],
    ]
  },
  services: {
    headers: ['servicio', 'tipo', 'precio', 'duracion', 'descripcion', 'nota'],
    sampleData: [
      ['Mantenimiento', 'Preventivo', '150', '4 horas', 'Revisión general', 'Precio puede variar'],
      ['Instalación', 'Software', '80', '2 horas', 'Configuración', 'Precio puede variar'],
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
  
  // Hook para modo oscuro
  const { darkMode } = useCustomTheme(); // Elimina toggleDarkMode si no se usa
  const colors = darkMode ? COLORS.dark : COLORS.light;

  // Estados para ordenamiento
  const [sortOrder, setSortOrder] = useState('newest');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');

  // Estado para editar pedido
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
  
  // Estado del formulario actualizado con website
  const [form, setForm] = useState({
    id: null,
    supplier: '',
    company: '',
    businessType: '',
    website: '', // Nuevo campo para website
    dataType: 'both',
    companyImage: null,
    currency: 'CUP',
    contractActive: false,
    productsCount: 0,
    servicesCount: 0,
    scrapingStatus: 'not_started', // Estado del scraping
    scrapedProducts: [] // Productos obtenidos por scraping
  });
  
  const [files, setFiles] = useState({
    products: null,
    services: null
  });
  const [loading, setLoading] = useState(false);
  const [scrapingLoading, setScrapingLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [openPreview, setOpenPreview] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [previewType, setPreviewType] = useState('products');
  const [orderDetailsDialog, setOrderDetailsDialog] = useState(null);

  // Estado para pedidos extras
  const [specialOrderForm, setSpecialOrderForm] = useState({
    orderType: 'product',
    products: [{ 
      name: '', 
      description: '',
      equipmentType: '',
      characteristics: {},
      quantity: 1
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

  // Datos con productos de scraping incluidos
  const allProducts = useMemo(() => {
    const catalogProducts = catalogs
      .filter(c => c.dataType === 'products')
      .flatMap(c => c.data.map(p => ({
        ...p,
        id: p.id || Date.now() + Math.random(),
        company: c.company,
        supplier: c.supplier,
        businessType: c.businessType,
        companyColor: c.color || colors.primary,
        contractActive: c.contractActive || false,
        fromWebsite: p.fromWebsite || false,
        website: p.website
      })));
    
    // Agregar productos de scraping de las empresas
    const scrapedProducts = catalogs
      .filter(c => c.scrapedProducts && c.scrapedProducts.length > 0)
      .flatMap(c => c.scrapedProducts.map(p => ({
        ...p,
        id: p.id || `scraped-${Date.now()}-${Math.random()}`,
        company: c.company,
        supplier: c.supplier,
        businessType: c.businessType,
        companyColor: c.color || colors.primary,
        contractActive: c.contractActive || false,
        fromWebsite: true,
        website: c.website
      })));
    
    return [...catalogProducts, ...scrapedProducts];
  }, [catalogs, colors.primary]);

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
            keysToRemove.push(key);
          }
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
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
      if (!productName) {
        setImageUrl(DEFAULT_IMAGE);
        setLoading(false);
        return;
      }

      const cachedImage = localStorage.getItem(cacheKey);
      if (cachedImage) {
        try {
          const cacheData = JSON.parse(cachedImage);
          const cacheAge = Date.now() - cacheData.timestamp;
          const CACHE_DURATION = 24 * 60 * 60 * 1000;
          
          if (cacheAge < CACHE_DURATION) {
            setImageUrl(cacheData.url);
            setLoading(false);
            return;
          }
        } catch (error) {
          localStorage.removeItem(cacheKey);
        }
      }

      setLoading(true);
      
      const debounceTimer = setTimeout(async () => {
        try {
          const url = await getEnhancedImageForProduct(productName);
          
          const cacheData = {
            url: url,
            timestamp: Date.now(),
            productName: productName
          };
          
          try {
            localStorage.setItem(cacheKey, JSON.stringify(cacheData));
          } catch (storageError) {
            clearOldImageCaches();
          }
          
          setImageUrl(url);
        } catch (error) {
          console.error('Error cargando imagen:', error);
          setImageUrl(DEFAULT_IMAGE);
          
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
      }, 300);

      return () => {
        clearTimeout(debounceTimer);
      };
    }, [productName, cacheKey]);

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
              color: colors.primary
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
          loading="lazy"
          onError={(e) => {
            console.warn(`Error cargando imagen para: ${productName}`);
            e.target.src = DEFAULT_IMAGE;
          }}
        />
      </Box>
    );
  };

  // Añadir al carrito
  const addToCart = (item) => {
    // Restringir si es comercial o gestor
    if (currentUser?.role === 'comercial' || currentUser?.role === 'gestor') {
      addNotification({
        title: 'Acción no permitida',
        message: 'Solo los Jefes de Proyectos pueden realizar compras',
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

  // Función para eliminar items del carrito
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
          const productItems = purchase.items.filter(item => 
            item.dataType === 'products' || (!item.dataType && item.name)
          );
          
          const serviceItems = purchase.items.filter(item => 
            item.dataType === 'services' || (!item.dataType && item.service)
          );
          
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
          const orderType = purchase.items[0].dataType === 'services' ? 'SERV' : 'PROD';
          separatedPurchases.push({
            ...purchase,
            category: purchase.items[0].dataType === 'services' ? 'Servicios' : 'Productos',
            orderNumber: generateOrderNumber(purchase.id, new Date(purchase.date).getFullYear(), orderType)
          });
        }
      } else {
        separatedPurchases.push({
          ...purchase,
          category: 'General',
          orderNumber: generateOrderNumber(purchase.id, new Date(purchase.date).getFullYear())
        });
      }

    });
    
    return separatedPurchases;
  };

  // Función para validar si se puede finalizar la compra
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

    // Validar presupuesto
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const budget = parseFloat(project.budget) || 0;
    
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

    return totalSpent <= budget;
  }, [cart, selectedProject, projects, catalogs, editingOrderId]);

  // Finalizar compra
  const checkout = () => {
    if (!canFinalizePurchase()) {
      addNotification({
        title: 'No se puede finalizar la compra',
        message: 'No se cumplen las condiciones para finalizar la compra.',
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

    try {
      let updatedPurchases = [...purchases];
      
      if (editingOrderId) {
        updatedPurchases = purchases.filter(p => p.id !== editingOrderId);
      }

      const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
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

      updatedPurchases = [...updatedPurchases, newPurchase];
      setPurchases(updatedPurchases);
      localStorage.setItem('OASiS_purchases', JSON.stringify(updatedPurchases));

      // Actualizar inventario
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
              if (editingOrderId) {
                const originalOrder = purchases.find(p => p.id === editingOrderId);
                if (originalOrder) {
                  const originalItem = originalOrder.items.find(i => i.id === cartItem.id);
                  if (originalItem) {
                    updatedCatalogs[catalogIndex].data[productIndex].stock += originalItem.quantity;
                  }
                }
              }
              
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

      setCatalogs(updatedCatalogs);
      localStorage.setItem('OASiS_catalogs', JSON.stringify(updatedCatalogs));

      clearCart();
      setSelectedProject('');
      setShowCart(false);
      setEditingOrderId(null); 
      
      const budget = parseFloat(project.budget) || 0;
      const existingPurchases = JSON.parse(localStorage.getItem('OASiS_purchases') || '[]');
      const existingSpecialOrders = JSON.parse(localStorage.getItem('OASiS_special_orders') || '[]');
      const projectExistingOrders = [...existingPurchases, ...existingSpecialOrders].filter(order => 
        order.projectId === project.id
      );
      const totalSpent = projectExistingOrders.reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0);
      const remainingBudget = budget - totalSpent;

      addNotification({
        title: editingOrderId ? 'Solicitud actualizada' : 'Solicitud enviada',
        message: `Tu solicitud de compra para el proyecto "${project.name}" ha sido ${editingOrderId ? 'actualizada' : 'enviada'} exitosamente. Presupuesto restante: $${remainingBudget.toFixed(2)} CUP.`,
        type: 'success'
      });

      setViewMode('history');
      
    } catch (error) {
      console.error('Error al procesar la compra:', error);
      addNotification({
        title: 'Error',
        message: 'Ocurrió un error al procesar tu solicitud.',
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
                  note: obj.nota || 'El precio total puede variar'
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

  // Función para realizar scraping de website
  const handleWebsiteScraping = async () => {
    if (!form.website) {
      setErrors({ ...errors, website: 'Ingrese una URL válida' });
      return;
    }

    try {
      setScrapingLoading(true);
      
      // Validar URL
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      if (!urlPattern.test(form.website)) {
        throw new Error('URL inválida');
      }

      // Agregar https:// si no tiene protocolo
      const websiteUrl = form.website.startsWith('http') ? form.website : `https://${form.website}`;
      
      // Realizar scraping
      const scrapedProducts = await scrapeWebsiteProducts(websiteUrl);
      
      // Actualizar estado del formulario
      setForm(prev => ({
        ...prev,
        scrapingStatus: 'success',
        scrapedProducts: scrapedProducts
      }));
      
      addNotification({
        title: 'Scraping completado',
        message: `Se encontraron ${scrapedProducts.length} productos en la tienda online`,
        type: 'success'
      });
      
    } catch (error) {
      console.error('Error en scraping:', error);
      setForm(prev => ({
        ...prev,
        scrapingStatus: 'error'
      }));
      addNotification({
        title: 'Error en scraping',
        message: error.message || 'No se pudieron obtener productos del sitio web',
        type: 'error'
      });
    } finally {
      setScrapingLoading(false);
    }
  };

  // Función para guardar empresa con scraping
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
    
    // CORRECCIÓN: Generar ID único para nueva empresa
    const newCompanyId = editMode ? form.id : Date.now().toString();
    
    // CORRECCIÓN: En modo edición, buscar por ID específico
    // En modo creación, verificar si ya existe empresa con el mismo nombre
    let existingCompanyCatalogs = [];
    let oldCompanyName = form.company;
    
    if (editMode) {
      // En modo edición: buscar por ID
      existingCompanyCatalogs = catalogs.filter(c => {
        const baseId = c.id ? c.id.replace('-products', '').replace('-services', '') : '';
        return baseId === form.id;
      });
      
      if (existingCompanyCatalogs.length > 0) {
        oldCompanyName = existingCompanyCatalogs[0].company;
      }
    } else {
      // En modo creación: verificar si ya existe empresa con el mismo nombre
      existingCompanyCatalogs = catalogs.filter(c => 
        c.company.toLowerCase() === form.company.toLowerCase()
      );
      
      // Si ya existe una empresa con el mismo nombre, mostrar error
      if (existingCompanyCatalogs.length > 0) {
        throw new Error(`Ya existe una empresa registrada con el nombre "${form.company}". Use otro nombre o edite la empresa existente.`);
      }
    }
    
    const existingProductCatalog = existingCompanyCatalogs.find(c => c.dataType === 'products');
    const existingServiceCatalog = existingCompanyCatalogs.find(c => c.dataType === 'services');
    
    console.log('🔄 Datos para actualización:', {
      editMode,
      existingCompanyCatalogs: existingCompanyCatalogs.length,
      oldCompanyName,
      newCompanyName: form.company,
      newCompanyId
    });

    // Procesar catálogo de productos
    let productData = [];
    if (files.products && files.products instanceof File) {
      productData = await parseExcel(files.products, 'products');
    } else if (editMode && existingProductCatalog) {
      productData = existingProductCatalog.data;
    }

    // Incluir productos de scraping solo si se realizó scraping
    const finalProductData = files.products ? 
      [...productData] : // Si hay archivo nuevo, usar solo esos datos
      [...productData, ...form.scrapedProducts]; // Si no hay archivo, agregar scraping

    if (finalProductData.length > 0 || (editMode && files.products === null && existingProductCatalog)) {
      const productCatalog = {
        id: `${newCompanyId}-products`,
        supplier: form.supplier,
        company: form.company,
        businessType: form.businessType,
        website: form.website,
        dataType: 'products',
        data: finalProductData,
        scrapedProducts: form.scrapedProducts,
        companyImage: form.companyImage,
        currency: form.currency,
        contractActive: form.contractActive,
        createdAt: editMode ? (existingProductCatalog?.createdAt || timestamp) : timestamp,
        updatedAt: timestamp,
      };

      // CORRECCIÓN: En modo creación, solo agregar, no eliminar
      if (editMode) {
        // En modo edición: eliminar catálogo existente y agregar nuevo
        updatedCatalogs = updatedCatalogs.filter(c => 
          !(c.id === `${newCompanyId}-products`)
        );
      }
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
        id: `${newCompanyId}-services`,
        supplier: form.supplier,
        company: form.company,
        businessType: form.businessType,
        website: form.website,
        dataType: 'services',
        data: serviceData,
        companyImage: form.companyImage,
        currency: form.currency,
        contractActive: form.contractActive,
        createdAt: editMode ? (existingServiceCatalog?.createdAt || timestamp) : timestamp,
        updatedAt: timestamp,
      };

      // CORRECCIÓN: En modo creación, solo agregar, no eliminar
      if (editMode) {
        // En modo edición: eliminar catálogo existente y agregar nuevo
        updatedCatalogs = updatedCatalogs.filter(c => 
          !(c.id === `${newCompanyId}-services`)
        );
      }
      updatedCatalogs.push(serviceCatalog);
    }

    // CORRECCIÓN: Solo actualizar referencias si estamos editando y el nombre cambió
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
      website: '',
      dataType: 'both',
      companyImage: null,
      currency: 'CUP',
      contractActive: false,
      productsCount: 0,
      servicesCount: 0,
      scrapingStatus: 'not_started',
      scrapedProducts: []
    });
    setFiles({ products: null, services: null });
    setUploadModal(false);
    setOpenPreview(false);
    setEditMode(false);
    setErrors({});
    
    console.log('✅ Empresa guardada exitosamente');
    
    addNotification({
      title: editMode ? 'Empresa actualizada' : 'Nueva empresa creada',
      message: `Se ${editMode ? 'actualizó' : 'creó'} la empresa "${form.company}" exitosamente`,
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
  // Función para editar catálogo - CORREGIDA
const handleEditCatalog = (companyData) => {
  console.log('🔄 Iniciando edición de empresa:', companyData);
  
  const companyCatalogs = catalogs.filter(c => c.company === companyData.company);
  const productCatalog = companyCatalogs.find(c => c.dataType === 'products');
  const serviceCatalog = companyCatalogs.find(c => c.dataType === 'services');
  const baseCatalog = productCatalog || serviceCatalog || companyCatalogs[0] || {};
  
  // CORRECCIÓN: Extraer el ID base correctamente
  const baseId = baseCatalog.id ? 
    baseCatalog.id.replace('-products', '').replace('-services', '') : 
    Date.now().toString();
  
  setForm({
    id: baseId, // Usar el ID existente
    supplier: baseCatalog.supplier || '',
    company: baseCatalog.company || '',
    businessType: baseCatalog.businessType || '',
    website: baseCatalog.website || '',
    dataType: 'both',
    companyImage: baseCatalog.companyImage || null,
    currency: baseCatalog.currency || 'CUP',
    contractActive: baseCatalog.contractActive || false,
    productsCount: productCatalog ? productCatalog.data.length : 0,
    servicesCount: serviceCatalog ? serviceCatalog.data.length : 0,
    scrapingStatus: baseCatalog.scrapingStatus || 'not_started',
    scrapedProducts: baseCatalog.scrapedProducts || []
  });
  
  setFiles({ products: null, services: null });
  setEditMode(true);
  setUploadModal(true);
  setErrors({});
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

  // Función para eliminar empresa - MEJORADA
const handleDeleteCompany = (companyName) => {
  if (window.confirm(`¿Está seguro de eliminar la empresa "${companyName}" y todos sus catálogos?`)) {
    try {
      // Eliminar solo los catálogos de esta empresa específica
      const updated = catalogs.filter(c => c.company !== companyName);
      setCatalogs(updated);
      localStorage.setItem('OASiS_catalogs', JSON.stringify(updated));
      
      addNotification({
        title: 'Empresa eliminada',
        message: `La empresa "${companyName}" ha sido eliminada del sistema`,
        type: 'warning'
      });
    } catch (error) {
      console.error('Error eliminando empresa:', error);
      addNotification({
        title: 'Error',
        message: 'No se pudo eliminar la empresa',
        type: 'error'
      });
    }
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
  
  const remainingBudget = selectedProjectObj ? getRemainingBudget(selectedProjectObj) - cartTotal : 0;

  // Funciones para manejar pedidos extras
  const handleAddProductField = () => {
    setSpecialOrderForm({
      ...specialOrderForm,
      products: [...specialOrderForm.products, { 
        name: '', 
        description: '', 
        equipmentType: '', 
        characteristics: {},
        quantity: 1
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

  const handleAddServiceField = () => {
    setSpecialOrderForm({
      ...specialOrderForm,
      services: [...specialOrderForm.services, { 
        serviceType: '', 
        description: '', 
        scope: '', 
        requirements: '',
        quantity: 1
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

  const handleGenerateDescription = (index) => {
    const product = specialOrderForm.products[index];
    if (product.equipmentType && Object.keys(product.characteristics).length > 0) {
      const baseDescription = generateEquipmentDescription(product.equipmentType, product.characteristics);
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

  // Función para enviar pedidos extras
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
              quantity: product.quantity || 1,
              type: 'product'
            };
          }
          return {
            name: product.name,
            description: product.description,
            equipmentType: null,
            characteristics: {},
            quantity: product.quantity || 1,
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
          quantity: service.quantity || 1,
          type: 'service'
        }));
    }

    const calculatePriority = (endDate) => {
      const today = new Date();
      const end = new Date(endDate);
      const diffTime = Math.abs(end - today);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 7) return 'Alta';
      if (diffDays <= 30) return 'Media';
      return 'Baja';
    };

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
      date: editingOrderId ? specialOrders.find(so => so.id === editingOrderId)?.date || new Date().toISOString() : new Date().toISOString(),
      status: 'Pendiente',
      priority: calculatePriority(project.endDate),
      type: 'special',
      category: `P.Extra-${specialOrderForm.orderType}`
    };

    try {
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
        content: `Se ha solicitado un pedido extra para el proyecto ${project.name}`,
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

      setEditingOrderId(null);

      addNotification({
        title: 'Pedido extra enviado',
        message: `Tu pedido extra ha sido enviado y está pendiente de aprobación`,
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

  const handleDeleteOrder = (orderId, isSpecial = false) => {
    if (window.confirm('¿Está seguro de eliminar este pedido?')) {
      try {
        if (isSpecial) {
          const updated = specialOrders.filter(order => order.id !== orderId);
          setSpecialOrders(updated);
          localStorage.setItem('OASiS_special_orders', JSON.stringify(updated));
        } else {
          const isSeparatedOrder = orderId && typeof orderId === 'string' && 
                                  (orderId.includes('-products') || orderId.includes('-services'));
          
          if (isSeparatedOrder) {
            const updated = purchases.filter(order => order.id !== orderId);
            setPurchases(updated);
            localStorage.setItem('OASiS_purchases', JSON.stringify(updated));
          } else {
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

        setEditingOrderId(order.id);
        
        setViewMode('special-orders');
        
        addNotification({
          title: 'Pedido cargado para edición',
          message: 'El pedido extra ha sido cargado para su modificación',
          type: 'info'
        });
      } else {
        setEditingOrderId(order.id);

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

  const handleViewOrderDetails = (order) => {
    setOrderDetailsDialog(order);
  };

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
      
      const companyCatalog = catalogs.find(c => 
        c.company === p.company && c.dataType === 'products'
      );
      const isCompanyActive = companyCatalog ? companyCatalog.contractActive : false;
      
      return matchesSearch && matchesCompany && matchesCategory && matchesPrice() && isCompanyActive;
    });
  }, [allProducts, searchTerm, selectedCompany, selectedCategory, priceRange, catalogs]);

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
      
      const companyCatalog = catalogs.find(c => 
        c.company === s.company && c.dataType === 'services'
      );
      const isCompanyActive = companyCatalog ? companyCatalog.contractActive : false;
      
      return matchesSearch && matchesPrice() && isCompanyActive;
    });
  }, [allServices, searchTerm, priceRange, catalogs]);

  const filteredPurchases = useMemo(() => {
    const allOrders = [...purchases, ...specialOrders];
    const separatedOrders = processPurchasesForHistory(allOrders);
    
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
      website: '', // Nuevo campo
      dataType: 'both',
      companyImage: null,
      currency: 'CUP',
      contractActive: false,
      productsCount: 0,
      servicesCount: 0,
      scrapingStatus: 'not_started',
      scrapedProducts: []
    });
  };

  // Función para visitar tienda online
  const visitWebsite = (url) => {
    if (!url) return;
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    window.open(fullUrl, '_blank', 'noopener,noreferrer');
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
        borderBottom: `1px solid ${colors.border}`
      }}>
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            color: colors.primary,
            fontWeight: 'bold',
            textAlign: 'center',
          }}
        >
          Gestión de Pedidos
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
          <Toolbar>
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
              <Tab value="products" label="Productos" icon={<StoreIcon />} />
              <Tab value="services" label="Servicios" icon={<CategoryIcon />} />
              <Tab value="special-orders" label="Pedidos Extra" icon={<AssignmentIcon />} />
              <Tab value="history" label="Historial" icon={<CheckCircleIcon />} />
              {currentUser?.role === 'admin' && <Tab value="companies" label="Empresas" icon={<BusinessIcon />} />}
            </Tabs>
            
            {currentUser?.role !== 'moderator' && (
              <IconButton 
                color="inherit" 
                onClick={() => setShowCart(!showCart)}
                sx={{
                  color: colors.primary,
                  '&:hover': {
                    backgroundColor: colors.border
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
          backgroundColor: colors.border,
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          backgroundColor: colors.primary,
        }
      }}>

        {/* Vista de Productos */}
        {viewMode === 'products' && (
          <Box sx={{ backgroundColor: colors.paper, p: 3, borderRadius: 2 }}>
            {/* Filtros */}
            <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2, mb: 3 }}>
              <TextField
                placeholder="Buscar por nombre o modelo..."
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: colors.textSecondary }} />,
                }}
                fullWidth
                sx={{
                  backgroundColor: colors.paper,
                  '& .MuiOutlinedInput-root': {
                    color: colors.text,
                    '& fieldset': {
                      borderColor: colors.border,
                    },
                    '&:hover fieldset': {
                      borderColor: colors.primary,
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
                      borderColor: colors.primary,
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
                      borderColor: colors.primary,
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
            
            {/* Productos */}
            <Grid container spacing={2}>
              {filteredProducts.length === 0 ? (
                <Grid item xs={12}>
                  <Alert severity="info" sx={{ backgroundColor: colors.paper, color: colors.text }}>
                    {searchTerm || selectedCompany !== 'all' || selectedCategory !== 'all' || priceRange !== 'all'
                      ? 'No se encontraron productos que coincidan con los filtros.'
                      : 'No hay productos disponibles.'}
                  </Alert>
                </Grid>
              ) : (
                filteredProducts.map((product) => {
                  const companyCatalog = catalogs.find(c => 
                    c.company === product.company && c.dataType === 'products'
                  );
                  const isCompanyActive = companyCatalog ? companyCatalog.contractActive : false;
                  const isOutOfStock = product.stock <= 0 || product.availability === 'Agotado';
                  const isScrapedProduct = product.fromWebsite;
                  
                  return (
                    <Grid item xs={12} sm={6} md={4} key={product.id}>
                      <Card sx={{ 
                        height: '320px', 
                        width: '260px',
                        display: 'flex', 
                        flexDirection: 'column',
                        borderRadius: 2,
                        boxShadow: 1,
                        overflow: 'hidden',
                        backgroundColor: colors.paper,
                        transition: 'all 0.2s ease',
                        opacity: isOutOfStock ? 0.7 : 1,
                        border: `1px solid ${colors.border}`,
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 2,
                          borderColor: colors.primary
                        }
                      }}>
                        {/* Badge para productos de scraping */}
                        {isScrapedProduct && (
                          <Box sx={{ 
                            position: 'absolute', 
                            top: 8, 
                            left: 8, 
                            zIndex: 1 
                          }}>
                            <Chip
                              label="Online"
                              size="small"
                              sx={{ 
                                backgroundColor: colors.info,
                                color: 'white',
                                fontSize: '0.6rem'
                              }}
                            />
                          </Box>
                        )}
                        
                        {/* Contenedor de imagen */}
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
                                backgroundColor: isOutOfStock ? 'grey' : colors.primary,
                                color: 'white',
                                fontSize: '0.75rem',
                                height: '24px'
                              }}
                            />
                          </Box>
                        </Box>

                        {/* Contenido de la tarjeta */}
                        <CardContent sx={{ 
                          flex: '1 0 auto',
                          p: 1.5, 
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          minHeight: '150px' 
                        }}>
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
                                color: isOutOfStock ? 'text.disabled' : colors.text,
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
                                color: isOutOfStock ? 'grey' : colors.primary,
                                '&:hover': { 
                                  backgroundColor: 'rgba(78, 1, 1, 0.1)', 
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
                        <CardActions sx={{ p: 1, pt: 0 }}>
                          <Button
                            fullWidth
                            size="small"
                            startIcon={<VisibilityIcon />}
                            onClick={() => openProductDialog(product)}
                            sx={{
                              top: -18,
                              color: isOutOfStock ? 'grey' : colors.primary,
                              fontSize: '0.8rem',
                              fontWeight: 'bold',
                              '&:hover': { 
                                backgroundColor: 'rgba(210, 180, 140, 0.2)', 
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

        {/* Vista de Servicios */}
        {viewMode === 'services' && (
          <Box sx={{ backgroundColor: colors.paper, p: 3, borderRadius: 2 }}>
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
                  startAdornment: <SearchIcon sx={{ color: colors.textSecondary }} />,
                }}
                fullWidth
                sx={{
                  backgroundColor: colors.paper,
                  '& .MuiOutlinedInput-root': {
                    color: colors.text,
                    '& fieldset': {
                      borderColor: colors.border,
                    },
                    '&:hover fieldset': {
                      borderColor: colors.primary,
                    },
                  }
                }}
              />
            </Box>

            <Grid container spacing={3}>
              {filteredServices.length === 0 ? (
                <Grid item xs={12}>
                  <Alert severity="info" sx={{ backgroundColor: colors.paper, color: colors.text }}>
                    No se encontraron servicios que coincidan con la búsqueda.
                  </Alert>
                </Grid>
              ) : (
                filteredServices.map((service) => {
                  const isOutOfStock = false;
                  
                  return (
                    <Grid item xs={12} sm={6} md={4} key={service.id}>
                      <Card sx={{ 
                        height: '100%', 
                        width: 250,
                        display: 'flex', 
                        flexDirection: 'column',
                        borderRadius: 2,
                        boxShadow: 1,
                        backgroundColor: colors.paper,
                        opacity: isOutOfStock ? 0.7 : 1,
                        transition: 'all 0.2s ease',
                        border: `1px solid ${colors.border}`,
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 2,
                          borderColor: colors.primary
                        }
                      }}>
                        <CardContent sx={{ flexGrow: 1, position: 'relative' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                            <Typography variant="h6" component="div" sx={{ 
                              fontSize: '1.1rem', 
                              color: isOutOfStock ? 'text.disabled' : colors.text 
                            }}>
                              {service.service}
                            </Typography>
                            <Chip
                              label={service.company}
                              size="small"
                              sx={{ 
                                backgroundColor: isOutOfStock ? 'grey' : colors.primary, 
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
                          <Typography variant="h6" color={isOutOfStock ? 'text.disabled' : 'error'} sx={{ fontWeight: 'bold', mt: 1 }}>
                            ${service.price} CUP
                          </Typography>
                        </CardContent>
                        <CardActions sx={{ justifyContent: 'flex-end' }}>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => addToCart(service)}
                            disabled={isOutOfStock}
                            sx={{ 
                              backgroundColor: isOutOfStock ? 'grey' : colors.primary,
                              '&:hover': { backgroundColor: colors.secondary }
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

        {/* Vista de Pedidos Extras */}
        {viewMode === 'special-orders' && (
          <Box sx={{ 
            maxWidth: 1000, 
            margin: '0 auto', 
            width: '100%',
          }}>
            <Paper sx={{ 
              p: 3, 
              borderRadius: 2, 
              boxShadow: 1,
              backgroundColor: colors.paper,
              border: `1px solid ${colors.border}`,
              position: 'relative',
              overflow: 'hidden',
            }}>
              <Typography variant="h5" align="center" gutterBottom sx={{ mb: 3, color: colors.primary, fontWeight: 'bold' }}>
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
                    backgroundColor: colors.paper,
                    color: colors.text,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: colors.primary,
                    }
                  }}
                >
                  <MenuItem value="product">Producto</MenuItem>
                  <MenuItem value="service">Servicio</MenuItem>
                </Select>
              </FormControl>

              {/* Campos para Productos */}
              {specialOrderForm.orderType === 'product' && specialOrderForm.products.map((product, index) => (
                <Box key={index} sx={{ 
                  mb: 3, 
                  p: 2, 
                  border: `1px solid ${colors.border}`, 
                  borderRadius: 2,
                  backgroundColor: colors.background,
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ color: colors.primary }}>
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
                  
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel sx={{ color: colors.textSecondary }}>Tipo de Equipo</InputLabel>
                    <Select
                      value={product.equipmentType}
                      label="Tipo de Equipo"
                      onChange={(e) => handleEquipmentTypeChange(index, e.target.value)}
                      sx={{
                        backgroundColor: colors.paper,
                        color: colors.text,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: colors.primary,
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
                        backgroundColor: colors.paper,
                        color: colors.text,
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: colors.primary,
                          },
                        }
                      }}
                    />
                  )}

                  {product.equipmentType && product.equipmentType !== 'other' && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: colors.primary }}>
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
                                  backgroundColor: colors.paper,
                                  color: colors.text,
                                  '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: colors.primary,
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
                        </Box>
                      ))}
                      
                      <TextField
                        label="Cantidad"
                        type="number"
                        fullWidth
                        value={product.quantity}
                        onChange={(e) => handleProductFieldChange(index, 'quantity', parseInt(e.target.value) || 1)}
                        margin="normal"
                        inputProps={{ min: 1 }}
                        sx={{
                          backgroundColor: colors.paper,
                          color: colors.text,
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: colors.primary,
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
                          borderColor: colors.primary,
                          color: colors.primary,
                          '&:hover': {
                            borderColor: colors.secondary,
                            backgroundColor: colors.border
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
                    sx={{
                      backgroundColor: colors.paper,                      
                      color: colors.text,
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: colors.primary,
                        },
                      }
                    }}
                  />
                </Box>
              ))}
              
              {/* Botón para añadir producto */}
              {specialOrderForm.orderType === 'product' && (
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddProductField}
                  fullWidth
                  sx={{ 
                    mb: 3,
                    borderColor: colors.primary,
                    color: colors.primary,
                    '&:hover': {
                      borderColor: colors.secondary,
                      backgroundColor: colors.border
                    }
                  }}
                >
                  Añadir otro producto
                </Button>
              )}
              
              {/* Campos para Servicios */}
              {specialOrderForm.orderType === 'service' && specialOrderForm.services.map((service, index) => (
                <Box key={index} sx={{ 
                  mb: 3, 
                  p: 2, 
                  border: `1px solid ${colors.border}`, 
                  borderRadius: 2,
                  backgroundColor: colors.background,
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ color: colors.primary }}>
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
                        backgroundColor: colors.paper,
                        color: colors.text,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: colors.primary,
                        }
                      }}
                    >
                      <MenuItem value="">Seleccionar tipo de servicio</MenuItem>
                      <MenuItem value="software">Desarrollo de Software</MenuItem>
                      <MenuItem value="hardware">Instalación de Hardware</MenuItem>
                      <MenuItem value="consulting">Consultoría TI</MenuItem>
                      <MenuItem value="maintenance">Mantenimiento</MenuItem>
                      <MenuItem value="training">Capacitación</MenuItem>
                      <MenuItem value="other">Otro Servicio</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <TextField
                    label="Descripción Detallada del Servicio"
                    fullWidth
                    multiline
                    rows={3}
                    value={service.description}
                    onChange={(e) => handleServiceFieldChange(index, 'description', e.target.value)}
                    margin="normal"
                    placeholder="Describa en detalle el servicio requerido"
                    sx={{
                      backgroundColor: colors.paper,
                      color: colors.text,
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: colors.primary,
                        },
                      }
                    }}
                  />
                </Box>
              ))}
              
              {/* Botón para añadir servicio */}
              {specialOrderForm.orderType === 'service' && (
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddServiceField}
                  fullWidth
                  sx={{ 
                    mb: 3,
                    borderColor: colors.primary,
                    color: colors.primary,
                    '&:hover': {
                      borderColor: colors.secondary,
                      backgroundColor: colors.border
                    }
                  }}
                >
                  Añadir otro servicio
                </Button>
              )}
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel sx={{ color: colors.textSecondary }}>Tipo de Pago</InputLabel>
                <Select
                  value={specialOrderForm.currency}
                  label="Tipo de Pago"
                  onChange={(e) => setSpecialOrderForm({...specialOrderForm, currency: e.target.value})}
                  sx={{
                    backgroundColor: colors.paper,
                    color: colors.text,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: colors.primary,
                    }
                  }}
                >
                  <MenuItem value="CUP">CUP (Peso Cubano)</MenuItem>
                  <MenuItem value="MLC">MLC (Moneda Libremente Convertible)</MenuItem>
                  <MenuItem value="CL">CL (Cuenta de Liquidación)</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel sx={{ color: colors.textSecondary }}>Proyecto</InputLabel>
                <Select
                  value={specialOrderForm.projectId}
                  label="Proyecto"
                  onChange={(e) => setSpecialOrderForm({...specialOrderForm, projectId: e.target.value})}
                  sx={{
                    backgroundColor: colors.paper,
                    color: colors.text,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: colors.primary,
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
                  backgroundColor: colors.primary,
                  '&:hover': { backgroundColor: colors.secondary }
                }}
              >
                Solicitar Pedido Extra
              </Button>
            </Paper>
          </Box>
        )}

        {/* Vista de Historial */}
        {viewMode === 'history' && (
          <Box sx={{ backgroundColor: colors.paper, p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2, mb: 3 }}>
              <TextField
                placeholder="Buscar por usuario, área, tipo, proyecto o número de pedido..."
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: colors.textSecondary }} />,
                }}
                fullWidth
                sx={{
                  backgroundColor: colors.paper,
                  '& .MuiOutlinedInput-root': {
                    color: colors.text,
                    '& fieldset': {
                      borderColor: colors.border,
                    },
                    '&:hover fieldset': {
                      borderColor: colors.primary,
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
                        borderColor: colors.primary,
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
                boxShadow: 1, 
                border: `1px solid ${colors.border}`,
                backgroundColor: colors.paper
              }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: colors.background }}>
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
                      const project = allProjects.find(p => p.id === purchase.projectId);
                      const textColor = colors.text;

                      return (
                        <TableRow 
                          key={purchase.id} 
                          hover 
                          sx={{ 
                            '&:hover': { backgroundColor: colors.border },
                            backgroundColor: colors.paper,
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
                                  purchase.category === 'Productos' ? colors.primary : 
                                  purchase.category === 'Servicios' ? colors.secondary : 
                                  purchase.category?.includes('P.Extra-producto') ? colors.info :
                                  purchase.category?.includes('P.Extra-servicio') ? colors.warning :
                                  colors.accent,
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
                                  backgroundColor: colors.border,
                                  color: colors.text
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
                                  purchase.priority === 'Alta' ? colors.error : 
                                  purchase.priority === 'Media' ? colors.warning : colors.success,
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
                                    color: colors.secondary,
                                    '&:hover': {
                                      backgroundColor: colors.border
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
                                    color: colors.primary,
                                    '&:hover': {
                                      backgroundColor: colors.border
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
                                    color: colors.error,
                                    '&:hover': {
                                      backgroundColor: colors.border
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

        {/* Vista de Empresas vertical (solo admin) - MODIFICADA */}
        {viewMode === 'companies' && currentUser?.role === 'admin' && (
          <Box sx={{ 
            maxWidth: 1200, 
            margin: '0 auto',
            width: '100%',
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ color: colors.primary, fontWeight: 'bold' }}>
                Gestión de Empresas
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  // CORRECCIÓN: Generar nuevo ID único
                  const newId = Date.now().toString();
                  setForm({ 
                    id: newId, // Asignar ID único
                    supplier: '', 
                    company: '', 
                    businessType: '', 
                    website: '',
                    dataType: 'both',
                    companyImage: null,
                    currency: 'CUP',
                    contractActive: false,
                    productsCount: 0,
                    servicesCount: 0,
                    scrapingStatus: 'not_started',
                    scrapedProducts: []
                  });
                  setFiles({ products: null, services: null });
                  setEditMode(false);
                  setUploadModal(true);
                }}
                sx={{ 
                  backgroundColor: colors.primary, 
                  '&:hover': { backgroundColor: colors.secondary }
                }}
              >
                Agregar Empresa
              </Button>
            </Box>
            
            {catalogs.length === 0 ? (
              <Alert severity="info" sx={{ mt: 2, backgroundColor: colors.paper, color: colors.text, borderRadius: 2 }}>
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
                        boxShadow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        height: '100%',
                        position: 'relative',
                        transition: 'all 0.2s ease',
                        border: `1px solid ${colors.border}`,
                        backgroundColor: colors.paper,
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 2,
                          borderColor: colors.primary
                        }
                      }}>
                        
                        {/* Avatar de la empresa */}
                        <Avatar
                          src={companyData.companyImage}
                          sx={{ 
                            width: 60, 
                            height: 60, 
                            mb: 2,
                            backgroundColor: colors.primary
                          }}
                        >
                          {companyName.charAt(0)}
                        </Avatar>
                        
                        {/* Información de la empresa */}
                        <Box sx={{ flexGrow: 1, width: '100%' }}>
                          <Typography variant="h6" fontWeight="bold" noWrap sx={{ color: colors.primary, mb: 1 }}>
                            {companyName}
                          </Typography>
                          
                          <Typography variant="body2" color={colors.textSecondary} noWrap sx={{ mb: 2 }}>
                            {companyData.businessType} • {companyData.supplier}
                          </Typography>
                          
                          {/* Mostrar website si existe */}
                          {companyData.website && (
                            <Box sx={{ mb: 2 }}>
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<LanguageIcon />}
                                onClick={() => visitWebsite(companyData.website)}
                                sx={{ 
                                  borderColor: colors.primary,
                                  color: colors.primary,
                                  fontSize: '0.75rem',
                                  '&:hover': {
                                    borderColor: colors.secondary,
                                    backgroundColor: colors.border
                                  }
                                }}
                              >
                                Visitar Tienda Online
                              </Button>
                            </Box>
                          )}
                          
                          {/* Vista previa de website si existe */}
                          {companyData.website && (
                            <Box sx={{ mb: 2 }}>
                              <WebsitePreview 
                                websiteUrl={companyData.website}
                                companyName={companyName}
                              />
                            </Box>
                          )}
                          
                          {/* Estadísticas */}
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-around',
                            mt: 2,
                            width: '100%'
                          }}>
                            <Box sx={{ textAlign: 'center' }}>
                              <StoreIcon fontSize="small" sx={{ color: colors.primary }} />
                              <Typography variant="body2" fontSize="0.9rem" sx={{ color: colors.primary }}>
                                {productCatalog ? productCatalog.data.length : 0}
                              </Typography>
                              <Typography variant="caption" color={colors.textSecondary}>
                                Productos
                              </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center' }}>
                              <CategoryIcon fontSize="small" sx={{ color: colors.secondary }} />
                              <Typography variant="body2" fontSize="0.9rem" sx={{ color: colors.secondary }}>
                                {serviceCatalog ? serviceCatalog.data.length : 0}
                              </Typography>
                              <Typography variant="caption" color={colors.textSecondary}>
                                Servicios
                              </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center' }}>
                              <CheckCircleIcon 
                                fontSize="small" 
                                sx={{ color: companyData.contractActive ? colors.success : colors.error }} 
                              />
                              <Typography variant="body2" fontSize="0.9rem" sx={{ 
                                color: companyData.contractActive ? colors.success : colors.error 
                              }}>
                                {companyData.contractActive ? "Sí" : "No"}
                              </Typography>
                              <Typography variant="caption" color={colors.textSecondary}>
                                Contrato
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                        
                        {/* Botones de acción */}
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
                            onClick={() => handleDeleteCompany(companyName)} // Usar la nueva función
                            sx={{ flex: 1 }}
                          >
                            Eliminar
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<EditIcon />}
                            onClick={() => {
                              const baseCatalog = productCatalog || serviceCatalog || companyCatalogs[0] || {};
                              handleEditCatalog(baseCatalog);
                            }}
                            sx={{ 
                              flex: 1,
                              backgroundColor: colors.primary,
                              '&:hover': { backgroundColor: colors.secondary }
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
              borderRadius: 2
            }
          }}
        >
          {productDialog && (
            <>
              <DialogTitle sx={{ backgroundColor: colors.paper, color: colors.primary, borderBottom: `1px solid ${colors.border}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {productDialog.name}
                  {productDialog.fromWebsite && (
                    <Chip
                      label="Tienda Online"
                      size="small"
                      sx={{ 
                        backgroundColor: colors.info,
                        color: 'white',
                        fontSize: '0.7rem'
                      }}
                    />
                  )}
                </Box>
              </DialogTitle>
              <DialogContent sx={{ backgroundColor: colors.paper }}>
                <Box sx={{ mt: 2 }}>
                  {/* IMAGEN */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    mb: 3,
                    borderRadius: 2,
                    overflow: 'hidden',
                    height: '250px',
                    backgroundColor: colors.background,
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
                  
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: colors.text }}>
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
                  
                  {/* Botón para visitar tienda si es producto de scraping */}
                  {productDialog.fromWebsite && productDialog.website && (
                    <Box sx={{ mb: 2 }}>
                      <Button
                        variant="outlined"
                        startIcon={<LanguageIcon />}
                        onClick={() => visitWebsite(productDialog.website)}
                        fullWidth
                        sx={{ 
                          borderColor: colors.primary,
                          color: colors.primary,
                          '&:hover': {
                            borderColor: colors.secondary,
                            backgroundColor: colors.border
                          }
                        }}
                      >
                        Visitar Tienda Online
                      </Button>
                    </Box>
                  )}
                  
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    mb: 2,
                    p: 2,
                    backgroundColor: colors.background,
                    borderRadius: 2,
                    border: `1px solid ${colors.border}`
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
              <DialogActions sx={{ backgroundColor: colors.paper, borderTop: `1px solid ${colors.border}` }}>
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
                        backgroundColor: isOutOfStock ? 'grey' : colors.primary,
                        '&:hover': { backgroundColor: isOutOfStock ? 'grey' : colors.secondary },
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
              boxShadow: 2
            }
          }}
        >
          {orderDetailsDialog && (
            <>
              <DialogTitle sx={{ 
                backgroundColor: colors.primary, 
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <AssignmentIcon />
                Detalles del Pedido - {orderDetailsDialog.orderNumber || 'N/A'}
              </DialogTitle>
              
              <DialogContent sx={{ mt: 2 }}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ color: colors.primary, borderBottom: `2px solid ${colors.primary}`, pb: 1 }}>
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
                            orderDetailsDialog.category === 'Productos' ? colors.primary : 
                            orderDetailsDialog.category === 'Servicios' ? colors.secondary : 
                            orderDetailsDialog.category?.includes('P.Extra-producto') ? colors.info :
                            orderDetailsDialog.category?.includes('P.Extra-servicio') ? colors.warning :
                            colors.accent,
                          color: 'white',
                          fontSize: '0.75rem'
                        }}
                        size="small"
                      />
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
                            backgroundColor: colors.primary,
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
                            orderDetailsDialog.priority === 'Alta' ? colors.error : 
                            orderDetailsDialog.priority === 'Media' ? colors.warning : colors.success,
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
                  <Typography variant="h6" gutterBottom sx={{ color: colors.primary, borderBottom: `2px solid ${colors.accent}`, pb: 1 }}>
                    {orderDetailsDialog.orderType === 'service' ? 'Servicios Solicitados' : 'Productos Solicitados'}
                  </Typography>
                  
                  {(!orderDetailsDialog.items || orderDetailsDialog.items.length === 0) ? (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      No hay items en este pedido
                    </Alert>
                  ) : (
                    <TableContainer component={Paper} sx={{ mt: 2, boxShadow: 0, backgroundColor: colors.background }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ backgroundColor: colors.border }}>
                            <TableCell sx={{ fontWeight: 'bold', color: colors.text }}>Nombre</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: colors.text }}>Cantidad</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: colors.text }}>Precio Unitario</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: colors.text }}>Subtotal</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {orderDetailsDialog.items.map((item, index) => (
                            <TableRow key={index} hover sx={{ backgroundColor: colors.paper }}>
                              <TableCell sx={{ color: colors.text }}>
                                {item.name || item.serviceType || 'N/A'}
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
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Box>
              </DialogContent>
              
              <DialogActions sx={{ p: 2, backgroundColor: colors.paper, borderTop: `1px solid ${colors.border}` }}>
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
                    backgroundColor: colors.primary,
                    '&:hover': { backgroundColor: colors.secondary }
                  }}
                >
                  Editar Pedido
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Modal de Subida y Edición - FORMULARIO MODERNIZADO */}
        <Dialog 
          open={uploadModal} 
          onClose={handleCancelEdit} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: colors.paper,
              border: `1px solid ${colors.border}`,
              borderRadius: 2,
            }
          }}
        >
          <DialogTitle sx={{ 
            backgroundColor: colors.paper, 
            color: colors.primary,
            borderBottom: `1px solid ${colors.border}`,
            fontWeight: 'bold'
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
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: colors.text,
                        '& fieldset': {
                          borderColor: colors.border,
                        },
                        '&:hover fieldset': {
                          borderColor: colors.primary,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: colors.primary,
                        }
                      },
                      '& .MuiInputLabel-root': {
                        color: colors.textSecondary,
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: colors.primary,
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
                      setForm({ ...form, company: e.target.value });
                    }}
                    required
                    margin="normal"
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: colors.text,
                        '& fieldset': {
                          borderColor: colors.border,
                        },
                        '&:hover fieldset': {
                          borderColor: colors.primary,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: colors.primary,
                        }
                      },
                      '& .MuiInputLabel-root': {
                        color: colors.textSecondary,
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: colors.primary,
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
                        color: colors.text,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: colors.primary,
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: colors.primary,
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

                {/* NUEVO CAMPO: Website */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Website de la Tienda Online"
                    fullWidth
                    value={form.website}
                    onChange={(e) => setForm({ ...form, website: e.target.value })}
                    margin="normal"
                    variant="outlined"
                    placeholder="https://ejemplo.com"
                    InputProps={{
                      endAdornment: form.website && (
                        <IconButton 
                          size="small" 
                          onClick={handleWebsiteScraping}
                          disabled={scrapingLoading}
                          sx={{ color: colors.primary }}
                        >
                          {scrapingLoading ? <CircularProgress size={20} /> : <LanguageIcon />}
                        </IconButton>
                      )
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: colors.text,
                        '& fieldset': {
                          borderColor: colors.border,
                        },
                        '&:hover fieldset': {
                          borderColor: colors.primary,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: colors.primary,
                        }
                      },
                      '& .MuiInputLabel-root': {
                        color: colors.textSecondary,
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: colors.primary,
                      }
                    }}
                  />
                  {form.website && (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<LanguageIcon />}
                      onClick={handleWebsiteScraping}
                      disabled={scrapingLoading}
                      sx={{ 
                        mt: 1,
                        borderColor: colors.primary,
                        color: colors.primary,
                        '&:hover': {
                          borderColor: colors.secondary,
                          backgroundColor: colors.border
                        }
                      }}
                    >
                      {scrapingLoading ? 'Buscando productos...' : 'Extraer productos del sitio web'}
                    </Button>
                  )}
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel sx={{ color: colors.textSecondary }}>Moneda</InputLabel>
                    <Select
                      value={form.currency}
                      label="Moneda"
                      onChange={(e) => setForm({ ...form, currency: e.target.value })}
                      sx={{
                        color: colors.text,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: colors.primary,
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
                      <Switch
                        checked={form.contractActive}
                        onChange={(e) => setForm({ ...form, contractActive: e.target.checked })}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: colors.primary,
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: colors.primary,
                          },
                        }}
                      />
                      <Typography variant="body2" sx={{ color: colors.text }}>Contrato vigente</Typography>
                    </Box>
                  </FormControl>
                </Grid>
                
                {/* Mostrar resultados de scraping */}
                {form.scrapedProducts.length > 0 && (
                  <Grid item xs={12}>
                    <Paper sx={{ 
                      p: 2, 
                      backgroundColor: colors.background, 
                      borderRadius: 2,
                      border: `1px solid ${colors.success}`,
                      mt: 2
                    }}>
                      <Typography variant="subtitle2" gutterBottom fontWeight="bold" sx={{ color: colors.success }}>
                        ✓ Productos encontrados en la tienda online: {form.scrapedProducts.length}
                      </Typography>
                      <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block' }}>
                        Estos productos se agregarán automáticamente al catálogo de la empresa
                      </Typography>
                    </Paper>
                  </Grid>
                )}

                {/* Mostrar error de scraping */}
                {form.scrapingStatus === 'error' && (
                  <Grid item xs={12}>
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      No se pudieron extraer productos del sitio web. 
                      Los usuarios verán un botón "Visitar Tienda" en lugar de productos.
                    </Alert>
                  </Grid>
                )}
                
                {editMode && (
                  <Grid item xs={12}>
                    <Paper sx={{ 
                      p: 2, 
                      backgroundColor: colors.background, 
                      borderRadius: 2,
                      border: `1px solid ${colors.border}`,
                      mt: 2
                    }}>
                      <Typography variant="subtitle2" gutterBottom fontWeight="bold" sx={{ color: colors.primary }}>
                        Estadísticas actuales de la empresa:
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 4, mt: 1 }}>
                        <Box sx={{ textAlign: 'center' }}>
                          <StoreIcon sx={{ fontSize: 24, color: colors.primary }} />
                          <Typography variant="h6" sx={{ color: colors.primary }}>
                            {form.productsCount}
                          </Typography>
                          <Typography variant="body2" sx={{ color: colors.textSecondary }}>Productos</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                          <CategoryIcon sx={{ fontSize: 24, color: colors.secondary }} />
                          <Typography variant="h6" sx={{ color: colors.secondary }}>
                            {form.servicesCount}
                          </Typography>
                          <Typography variant="body2" sx={{ color: colors.textSecondary }}>Servicios</Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                )}

                {/* Sección de Catálogos */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2, borderColor: colors.border }} />
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ color: colors.primary }}>
                    Catálogos de la empresa
                  </Typography>
                </Grid>

                {/* Diseño responsive para catálogos */}
                <Grid container spacing={2}>
                  {/* Subida de Productos */}
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 3, p: 2, border: `1px solid ${colors.border}`, borderRadius: 2, backgroundColor: colors.background }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6" sx={{ color: colors.primary }}>Catálogo de Productos</Typography>
                        <Button
                          startIcon={<DownloadIcon />}
                          onClick={() => generateTemplate('products')}
                          size="small"
                          variant="outlined"
                          sx={{ 
                            borderColor: colors.primary, 
                            color: colors.primary,
                            '&:hover': {
                              borderColor: colors.secondary,
                              backgroundColor: colors.border
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
                          borderColor: files.products ? colors.primary : colors.border,
                          color: files.products ? colors.primary : colors.text,
                          backgroundColor: colors.paper,
                          '&:hover': {
                            borderColor: colors.primary,
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
                            sx={{ color: colors.error }}
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
                    <Box sx={{ mb: 3, p: 2, border: `1px solid ${colors.border}`, borderRadius: 2, backgroundColor: colors.background }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6" sx={{ color: colors.primary }}>Catálogo de Servicios</Typography>
                        <Button
                          startIcon={<DownloadIcon />}
                          onClick={() => generateTemplate('services')}
                          size="small"
                          variant="outlined"
                          sx={{ 
                            borderColor: colors.primary, 
                            color: colors.primary,
                            '&:hover': {
                              borderColor: colors.secondary,
                              backgroundColor: colors.border
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
                          borderColor: files.services ? colors.primary : colors.border,
                          color: files.services ? colors.primary : colors.text,
                          backgroundColor: colors.paper,
                          '&:hover': {
                            borderColor: colors.primary,
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
                            sx={{ color: colors.error }}
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
            borderTop: `1px solid ${colors.border}`,
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
                backgroundColor: colors.primary,
                '&:hover': { backgroundColor: colors.secondary },
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

        {/* Carrito */}
        <Dialog open={showCart} onClose={() => setShowCart(false)} maxWidth="sm" fullWidth
          PaperProps={{
            sx: {
              backgroundColor: colors.paper,
              border: `1px solid ${colors.border}`,
              borderRadius: 2
            }
          }}
        >
          <DialogTitle sx={{ color: colors.primary }}>Carrito de Compras</DialogTitle>
          <DialogContent>
            {cart.length === 0 ? (
              <Alert severity="info" sx={{ backgroundColor: colors.background, color: colors.text }}>
                Tu carrito está vacío
              </Alert>
            ) : (
              <Box sx={{ mt: 2 }}>
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
                      borderBottom: `1px solid ${colors.border}`,
                      backgroundColor: !isCompanyActive ? colors.warning + '10' : 'transparent',
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
                            sx={{ 
                              mt: 0.5,
                              backgroundColor: colors.warning,
                              color: 'white'
                            }} 
                          />
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton 
                          size="small" 
                          onClick={() => updateQuantity(item.id, -1)}
                          disabled={item.quantity <= 1}
                          sx={{ color: colors.primary }}
                        >
                          <RemoveCircleIcon fontSize="small" />
                        </IconButton>
                        <Typography variant="body2" sx={{ color: colors.text }}>{item.quantity}</Typography>
                        <IconButton 
                          size="small" 
                          onClick={() => updateQuantity(item.id, 1)}
                          sx={{ color: colors.primary }}
                        >
                          <AddCircleIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => removeFromCart(item.id)}
                          sx={{ color: colors.error }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  );
                })}
                
                <Box sx={{ mt: 3, p: 2, backgroundColor: colors.background, borderRadius: 2, border: `1px solid ${colors.border}` }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1" sx={{ color: colors.text, fontWeight: 'bold' }}>Total:</Typography>
                    <Typography variant="body1" sx={{ color: colors.error, fontWeight: 'bold' }}>
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
                      <Typography variant="body1" sx={{ color: remainingBudget >= 0 ? colors.success : colors.error, fontWeight: 'bold' }}>
                        ${remainingBudget.toFixed(2)} CUP
                      </Typography>
                    </Box>
                  )}
                </Box>

                <FormControl fullWidth sx={{ mb: 3, mt: 2 }}>
                  <InputLabel sx={{ color: colors.textSecondary }}>Proyecto</InputLabel>
                  <Select
                    value={selectedProject}
                    label="Proyecto"
                    onChange={(e) => setSelectedProject(e.target.value)}
                    sx={{
                      color: colors.text,
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: colors.primary,
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
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2, borderTop: `1px solid ${colors.border}` }}>
            <Button onClick={() => setShowCart(false)} sx={{ color: colors.textSecondary }}>Cerrar</Button>
            {cart.length > 0 && (
              <>
                <Button 
                  onClick={clearCart} 
                  sx={{ color: colors.error }}
                  disabled={loading}
                >
                  Vaciar
                </Button>
                <Button
                  onClick={checkout}
                  variant="contained"
                  disabled={!canFinalizePurchase() || loading}
                  sx={{ 
                    backgroundColor: colors.primary,
                    '&:hover': { backgroundColor: colors.secondary },
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