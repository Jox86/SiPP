// src/utils/productImages.js

// Mapeo de palabras clave a imágenes
export const PRODUCT_IMAGES = {
  // Equipos de computación
  'laptop': '/assets/images/products/laptop.jpg',
  'computadora': '/assets/images/products/computer.jpg',
  'portátil': '/assets/images/products/laptop.jpg',
  'notebook': '/assets/images/products/laptop.jpg',
  'impresora': '/assets/images/products/printer.jpg',
  'monitor': '/assets/images/products/monitor.jpg',
  'teclado': '/assets/images/products/keyboard.jpg',
  'mouse': '/assets/images/products/mouse.jpg',
  'ratón': '/assets/images/products/mouse.jpg',
  'servidor': '/assets/images/products/server.jpg',
  'switch': '/assets/images/products/switch.jpg',
  'router': '/assets/images/products/router.jpg',
  'motherboard': '/assets/images/products/motherboard.jpg',
  'placa base': '/assets/images/products/motherboard.jpg',
  'tarjeta madre': '/assets/images/products/motherboard.jpg',
  
  // Almacenamiento
  'disco duro': '/assets/images/products/hdd.jpg',
  'ssd': '/assets/images/products/ssd.jpg',
  'hdd': '/assets/images/products/hdd.jpg',
  'externo': '/assets/images/products/external-hdd.jpg',
  'usb': '/assets/images/products/usb-drive.jpg',
  'memoria': '/assets/images/products/memory.jpg',
  'pendrive': '/assets/images/products/usb-drive.jpg',
  'lector': '/assets/images/products/card-reader.jpg',
  
  // Redes y conectividad
  'cable': '/assets/images/products/cable.jpg',
  'rj45': '/assets/images/products/rj45.jpg',
  'ethernet': '/assets/images/products/ethernet.jpg',
  'adaptador': '/assets/images/products/adapter.jpg',
  'hdmi': '/assets/images/products/hdmi.jpg',
  'vga': '/assets/images/products/vga.jpg',
  'access point': '/assets/images/products/access-point.jpg',
  'wifi': '/assets/images/products/wifi.jpg',
  
  // Accesorios
  'hub': '/assets/images/products/hub.jpg',
  'docking': '/assets/images/products/docking.jpg',
  'cargador': '/assets/images/products/charger.jpg',
  'batería': '/assets/images/products/battery.jpg',
  
  // Kits y paquetes
  'kit': '/assets/images/products/kit.jpg',
  'paquete': '/assets/images/products/package.jpg',
  'combo': '/assets/images/products/combo.jpg',
};

// Imagen por defecto
export const DEFAULT_IMAGE = '/assets/images/logo-sipp.png';

// Servicio de búsqueda online
export const searchProductImageOnline = async (productName) => {
  try {
    // Usar un servicio de imágenes como Unsplash, Google Custom Search, etc.
    const query = encodeURIComponent(productName + ' producto tecnología');
    const apiKey = 'TU_API_KEY'; // Configurar en variables de entorno
    const searchUrl = `https://api.unsplash.com/search/photos?query=${query}&per_page=1&client_id=${apiKey}`;
    
    const response = await fetch(searchUrl);
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      return data.results[0].urls.small;
    }
    
    return null; // No se encontró online
  } catch (error) {
    console.warn('Error buscando imagen online:', error);
    return null;
  }
};

// Función para obtener imagen por nombre
export const getImageForProduct = async (productName) => {
  if (!productName) return DEFAULT_IMAGE;

  const name = productName.toLowerCase();
  
  // 1. PRIMERO: Buscar online
  try {
    const onlineImage = await searchProductImageOnline(productName);
    if (onlineImage) {
      return onlineImage;
    }
  } catch (error) {
    console.warn('Falló búsqueda online, usando local:', error);
  }
  
  // 2. SEGUNDO: Buscar en mapeo local
  for (const [keyword, image] of Object.entries(PRODUCT_IMAGES)) {
    if (name.includes(keyword.toLowerCase())) {
      // Verificar que la imagen local exista
      if (await imageExists(image)) {
        return image;
      }
    }
  }
  
  // 3. TERCERO: Logo de la app
  return DEFAULT_IMAGE;
};

// Función para verificar si una imagen local existe
const imageExists = (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};

// Función para obtener todas las imágenes disponibles (útil para debugging)
export const getAllProductImages = () => {
  return PRODUCT_IMAGES;
};