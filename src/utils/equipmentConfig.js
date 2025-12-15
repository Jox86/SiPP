// src/utils/equipmentConfig.js

export const EQUIPMENT_TYPES = {
  ROUTER: 'router',
  LAPTOP: 'laptop',
  RAM: 'ram',
  SWITCH: 'switch',
  SERVER: 'server',
  MONITOR: 'monitor'
};

export const EQUIPMENT_CONFIG = {
  [EQUIPMENT_TYPES.ROUTER]: {
    name: 'Router',
    description: 'Dispositivo de red para interconexión',
    characteristics: {
      velocidad: {
        label: 'Velocidad',
        type: 'select',
        options: [
          { value: 'wifi5', label: 'WiFi 5 (AC) - Hasta 1.3 Gbps' },
          { value: 'wifi6', label: 'WiFi 6 (AX) - Hasta 3.5 Gbps' },
          { value: 'wifi6e', label: 'WiFi 6E - Hasta 10.8 Gbps' }
        ]
      },
      puertos: {
        label: 'Puertos Ethernet',
        type: 'select',
        options: [
          { value: '4x1g', label: '4 puertos Gigabit' },
          { value: '8x1g', label: '8 puertos Gigabit' },
          { value: '4x2.5g', label: '4 puertos 2.5 Gigabit' }
        ]
      },
      bandas: {
        label: 'Bandas de Frecuencia',
        type: 'select',
        options: [
          { value: 'dual', label: 'Dual Band (2.4GHz + 5GHz)' },
          { value: 'triband', label: 'Tri-Band (2.4GHz + 5GHz + 5GHz)' }
        ]
      },
      seguridad: {
        label: 'Características de Seguridad',
        type: 'multiselect',
        options: [
          { value: 'wpa3', label: 'WPA3' },
          { value: 'firewall', label: 'Firewall integrado' },
          { value: 'vpn', label: 'Servidor VPN' },
          { value: 'parental', label: 'Control parental' }
        ]
      }
    }
  },
  [EQUIPMENT_TYPES.LAPTOP]: {
    name: 'Laptop',
    description: 'Computadora portátil',
    characteristics: {
      procesador: {
        label: 'Procesador',
        type: 'select',
        options: [
          { value: 'i3', label: 'Intel Core i3' },
          { value: 'i5', label: 'Intel Core i5' },
          { value: 'i7', label: 'Intel Core i7' },
          { value: 'i9', label: 'Intel Core i9' },
          { value: 'ryzen5', label: 'AMD Ryzen 5' },
          { value: 'ryzen7', label: 'AMD Ryzen 7' }
        ]
      },
      ram: {
        label: 'Memoria RAM',
        type: 'select',
        options: [
          { value: '8gb', label: '8 GB' },
          { value: '16gb', label: '16 GB' },
          { value: '32gb', label: '32 GB' },
          { value: '64gb', label: '64 GB' }
        ]
      },
      almacenamiento: {
        label: 'Almacenamiento',
        type: 'select',
        options: [
          { value: '256ssd', label: '256 GB SSD' },
          { value: '512ssd', label: '512 GB SSD' },
          { value: '1tbssd', label: '1 TB SSD' },
          { value: '2tbssd', label: '2 TB SSD' },
          { value: '1tbhdd', label: '1 TB HDD + 256 GB SSD' }
        ]
      },
      pantalla: {
        label: 'Pantalla',
        type: 'select',
        options: [
          { value: '14fhd', label: '14" FHD (1920x1080)' },
          { value: '15fhd', label: '15.6" FHD (1920x1080)' },
          { value: '14uhd', label: '14" UHD (3840x2160)' },
          { value: '16uhd', label: '16" UHD (3840x2160)' }
        ]
      },
      extras: {
        label: 'Características Adicionales',
        type: 'multiselect',
        options: [
          { value: 'touch', label: 'Pantalla táctil' },
          { value: 'fingerprint', label: 'Lector de huellas' },
          { value: 'backlit', label: 'Teclado retroiluminado' },
          { value: 'webcam', label: 'Cámara web HD' },
          { value: 'thunderbolt', label: 'Puertos Thunderbolt' }
        ]
      }
    }
  },
  [EQUIPMENT_TYPES.RAM]: {
    name: 'Memoria RAM',
    description: 'Memoria de acceso aleatorio',
    characteristics: {
      tipo: {
        label: 'Tipo de Memoria',
        type: 'select',
        options: [
          { value: 'ddr4', label: 'DDR4' },
          { value: 'ddr5', label: 'DDR5' }
        ]
      },
      capacidad: {
        label: 'Capacidad',
        type: 'select',
        options: [
          { value: '4gb', label: '4 GB' },
          { value: '8gb', label: '8 GB' },
          { value: '16gb', label: '16 GB' },
          { value: '32gb', label: '32 GB' }
        ]
      },
      velocidad: {
        label: 'Velocidad',
        type: 'select',
        options: [
          { value: '2400', label: '2400 MHz' },
          { value: '2666', label: '2666 MHz' },
          { value: '3200', label: '3200 MHz' },
          { value: '3600', label: '3600 MHz' },
          { value: '4800', label: '4800 MHz' },
          { value: '5200', label: '5200 MHz' }
        ]
      },
      formato: {
        label: 'Formato',
        type: 'select',
        options: [
          { value: 'sodimm', label: 'SODIMM (Laptop)' },
          { value: 'dimm', label: 'DIMM (Desktop)' }
        ]
      }
    }
  },
  [EQUIPMENT_TYPES.SWITCH]: {
    name: 'Switch de Red',
    description: 'Dispositivo para interconexión de redes',
    characteristics: {
      puertos: {
        label: 'Número de Puertos',
        type: 'select',
        options: [
          { value: '8port', label: '8 puertos' },
          { value: '16port', label: '16 puertos' },
          { value: '24port', label: '24 puertos' },
          { value: '48port', label: '48 puertos' }
        ]
      },
      velocidad: {
        label: 'Velocidad de Puertos',
        type: 'select',
        options: [
          { value: '100m', label: '10/100 Mbps' },
          { value: '1g', label: 'Gigabit (10/100/1000 Mbps)' },
          { value: '2.5g', label: '2.5 Gigabit' },
          { value: '10g', label: '10 Gigabit' }
        ]
      },
      gestion: {
        label: 'Tipo de Gestión',
        type: 'select',
        options: [
          { value: 'unmanaged', label: 'No gestionado' },
          { value: 'smart', label: 'Smart (Semi-gestionado)' },
          { value: 'managed', label: 'Completamente gestionado' }
        ]
      },
      poe: {
        label: 'PoE (Power over Ethernet)',
        type: 'select',
        options: [
          { value: 'none', label: 'Sin PoE' },
          { value: 'poe', label: 'Con PoE' },
          { value: 'poeplus', label: 'Con PoE+' }
        ]
      }
    }
  },
  [EQUIPMENT_TYPES.SERVER]: {
    name: 'Servidor',
    description: 'Servidor para infraestructura TI',
    characteristics: {
      tipo: {
        label: 'Tipo de Servidor',
        type: 'select',
        options: [
          { value: 'tower', label: 'Torre' },
          { value: 'rack', label: 'Rack (1U)' },
          { value: 'rack2u', label: 'Rack (2U)' },
          { value: 'blade', label: 'Blade' }
        ]
      },
      procesador: {
        label: 'Procesador',
        type: 'select',
        options: [
          { value: 'xeon1', label: 'Intel Xeon E-2300' },
          { value: 'xeon2', label: 'Intel Xeon Silver' },
          { value: 'xeon3', label: 'Intel Xeon Gold' },
          { value: 'epyc', label: 'AMD EPYC' }
        ]
      },
      ram: {
        label: 'Memoria RAM',
        type: 'select',
        options: [
          { value: '32gb', label: '32 GB' },
          { value: '64gb', label: '64 GB' },
          { value: '128gb', label: '128 GB' },
          { value: '256gb', label: '256 GB' }
        ]
      },
      almacenamiento: {
        label: 'Almacenamiento',
        type: 'select',
        options: [
          { value: '1tb', label: '1 TB HDD' },
          { value: '2tb', label: '2 TB HDD' },
          { value: '500ssd', label: '500 GB SSD' },
          { value: '1tbssd', label: '1 TB SSD' },
          { value: 'raid', label: 'Configuración RAID' }
        ]
      },
      redundancia: {
        label: 'Características de Redundancia',
        type: 'multiselect',
        options: [
          { value: 'psu', label: 'Fuente de poder redundante' },
          { value: 'fan', label: 'Ventiladores redundantes' },
          { value: 'raid', label: 'Controladora RAID' },
          { value: 'ilo', label: 'iLO/iDRAC' }
        ]
      }
    }
  },
  [EQUIPMENT_TYPES.MONITOR]: {
    name: 'Monitor',
    description: 'Monitor de computadora',
    characteristics: {
      tamaño: {
        label: 'Tamaño',
        type: 'select',
        options: [
          { value: '24', label: '24"' },
          { value: '27', label: '27"' },
          { value: '32', label: '32"' },
          { value: '34', label: '34" UltraWide' }
        ]
      },
      resolucion: {
        label: 'Resolución',
        type: 'select',
        options: [
          { value: '1080p', label: 'Full HD (1920x1080)' },
          { value: '1440p', label: 'QHD (2560x1440)' },
          { value: '4k', label: '4K UHD (3840x2160)' },
          { value: 'ultrawide', label: 'UltraWide (3440x1440)' }
        ]
      },
      panel: {
        label: 'Tipo de Panel',
        type: 'select',
        options: [
          { value: 'ips', label: 'IPS' },
          { value: 'va', label: 'VA' },
          { value: 'tn', label: 'TN' },
          { value: 'oled', label: 'OLED' }
        ]
      },
      frecuencia: {
        label: 'Frecuencia de Actualización',
        type: 'select',
        options: [
          { value: '60hz', label: '60 Hz' },
          { value: '75hz', label: '75 Hz' },
          { value: '144hz', label: '144 Hz' },
          { value: '240hz', label: '240 Hz' }
        ]
      },
      conectividad: {
        label: 'Conectividad',
        type: 'multiselect',
        options: [
          { value: 'hdmi', label: 'HDMI' },
          { value: 'displayport', label: 'DisplayPort' },
          { value: 'usbc', label: 'USB-C' },
          { value: 'vga', label: 'VGA' },
          { value: 'usbhub', label: 'Hub USB' }
        ]
      }
    }
  }
};

// Función para generar descripción automática basada en las selecciones
export const generateEquipmentDescription = (equipmentType, characteristics) => {
  const config = EQUIPMENT_CONFIG[equipmentType];
  if (!config) return '';

  const descriptionParts = [`${config.name} configurado con:`];
  
  Object.entries(characteristics).forEach(([key, value]) => {
    const charConfig = config.characteristics[key];
    if (charConfig && value) {
      if (Array.isArray(value)) {
        // Para multiselect
        const selectedOptions = value.map(val => {
          const option = charConfig.options.find(opt => opt.value === val);
          return option ? option.label : val;
        });
        if (selectedOptions.length > 0) {
          descriptionParts.push(`${charConfig.label}: ${selectedOptions.join(', ')}`);
        }
      } else {
        // Para select simple
        const option = charConfig.options.find(opt => opt.value === value);
        if (option) {
          descriptionParts.push(`${charConfig.label}: ${option.label}`);
        }
      }
    }
  });

  return descriptionParts.join('\n• ');
};

// Función para obtener opciones de equipos para el select
export const getEquipmentOptions = () => {
  return Object.entries(EQUIPMENT_CONFIG).map(([value, config]) => ({
    value,
    label: config.name
  }));
};