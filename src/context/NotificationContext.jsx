// src/context/NotificationContext.jsx
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { Howl } from 'howler';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPushNotification, setShowPushNotification] = useState(false);
  const [currentPush, setCurrentPush] = useState(null);
  const soundRef = useRef(null);

  // Inicializar sonido de notificación
  useEffect(() => {
    soundRef.current = new Howl({
      src: ['/notification-sound.mp3'], // Reemplaza con tu archivo de sonido
      volume: 0.5,
      preload: true
    });
    
    return () => {
      if (soundRef.current) {
        soundRef.current.unload();
      }
    };
  }, []);

  // Reproducir sonido de notificación
  const playNotificationSound = () => {
    if (soundRef.current && !soundRef.current.playing()) {
      soundRef.current.play();
    }
  };

  // Mostrar notificación push
  const showPush = (notification) => {
    setCurrentPush(notification);
    setShowPushNotification(true);
    playNotificationSound();
    
    // Ocultar automáticamente después de 5 segundos
    setTimeout(() => {
      setShowPushNotification(false);
    }, 5000);
  };

  // Cargar notificaciones desde localStorage
  useEffect(() => {
    const saved = localStorage.getItem('SiPP_notifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setNotifications(parsed);
        setUnreadCount(parsed.filter(n => !n.read).length);
      } catch (error) {
        console.error('Error loading notifications:', error);
        setNotifications([]);
        setUnreadCount(0);
      }
    }
  }, []);

  // Verificar si hay notificaciones push disponibles
  useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, []);

  // Función para mostrar notificación push nativa del navegador
  const showNativePush = (notification) => {
    if ("Notification" in window && Notification.permission === "granted") {
      const nativeNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/logo.png',
        tag: notification.id,
        requireInteraction: false,
        silent: false
      });

      nativeNotification.onclick = () => {
        window.focus();
        if (notification.redirectTo) {
          window.location.href = notification.redirectTo;
        }
        nativeNotification.close();
      };
    }
  };

  // Sincronizar con mensajes del sistema SiPP
  useEffect(() => {
    if (!currentUser) return;

    const syncWithSystemMessages = () => {
      try {
        const purchases = JSON.parse(localStorage.getItem('SiPP_purchases') || '[]');
        const specialOrders = JSON.parse(localStorage.getItem('SiPP_special_orders') || '[]');
        const allOrders = [...purchases, ...specialOrders];
        
        // Cargar notificaciones existentes
        const existingNotifications = localStorage.getItem('SiPP_notifications');
        let currentNotifications = existingNotifications ? JSON.parse(existingNotifications) : [];
        
        // Filtrar pedidos recientes (últimas 24 horas)
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        const newOrders = allOrders.filter(order => {
          const orderDate = new Date(order.date);
          // Solo pedidos recientes y relevantes
          const isRecent = orderDate > twentyFourHoursAgo;
          const isRelevant = ['admin', 'comercial', 'gestor'].includes(currentUser?.role) 
            ? (order.status === 'Pendiente' || order.status === 'pending')
            : (order.userId === currentUser.id && (order.status === 'Pendiente' || order.status === 'pending'));
          
          return isRecent && isRelevant;
        });

        // Convertir nuevos pedidos en notificaciones
        const newNotifications = newOrders.map(order => {
          const isSpecial = order.type === 'special';
          const orderDate = new Date(order.date);
          const orderNumber = generateOrderNumber(order.id, orderDate.getFullYear());
          
          return {
            id: `order_${order.id}_${order.date}`,
            title: getOrderTitle(order, isSpecial),
            message: getOrderMessage(order, isSpecial),
            type: getOrderType(order),
            timestamp: order.date,
            read: false,
            source: 'order',
            orderId: order.id,
            orderType: isSpecial ? 'special' : 'regular',
            userId: order.userId,
            projectId: order.projectId,
            status: order.status,
            redirectTo: '/mensajes',
            showAsPush: true
          };
        });

        // Filtrar notificaciones que ya existen
        const existingIds = currentNotifications.map(n => n.id);
        const trulyNewNotifications = newNotifications.filter(n => !existingIds.includes(n.id));

        // Agregar nuevas notificaciones
        if (trulyNewNotifications.length > 0) {
          const updatedNotifications = [...trulyNewNotifications, ...currentNotifications];
          
          // Ordenar por timestamp
          const sortedNotifications = updatedNotifications.sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
          );

          // Limitar a 100 notificaciones
          const limitedNotifications = sortedNotifications.slice(0, 100);

          setNotifications(limitedNotifications);
          setUnreadCount(limitedNotifications.filter(n => !n.read).length);
          localStorage.setItem('SiPP_notifications', JSON.stringify(limitedNotifications));

          // Mostrar push para cada nueva notificación
          trulyNewNotifications.forEach(notification => {
            if (notification.showAsPush) {
              showPush(notification);
              showNativePush(notification);
            }
          });
        }

      } catch (error) {
        console.error('Error syncing with system messages:', error);
      }
    };

    // Funciones auxiliares (mantener las existentes)
    const generateOrderNumber = (orderId, year) => {
      const paddedId = orderId.toString().padStart(3, '0');
      return `PDD-${paddedId}-${year.toString().slice(-2)}`;
    };

    const getOrderTitle = (order, isSpecial) => {
      if (isSpecial) {
        return `📦 Pedido Extra - ${order.orderType === 'service' ? 'Servicio' : 'Producto'}`;
      }
      return '🛒 Nuevo Pedido Regular';
    };

    const getOrderMessage = (order, isSpecial) => {
      const userName = getUserName(order.userId);
      const projectName = getProjectName(order.projectId, order.userId);
      
      if (isSpecial) {
        return `${userName} ha solicitado un pedido extra para ${projectName}`;
      }
      return `${userName} ha realizado un nuevo pedido para ${projectName}`;
    };

    const getOrderType = (order) => {
      if (order.priority === 'high' || order.priority === 'Alta') return 'error';
      if (order.status === 'Completado') return 'success';
      return 'info';
    };

    const getUserName = (userId) => {
      try {
        const users = JSON.parse(localStorage.getItem('SiPP_users') || '[]');
        const user = users.find(u => u.id === userId);
        return user ? user.fullName : 'Usuario';
      } catch (error) {
        return 'Usuario';
      }
    };

    const getProjectName = (projectId, userId) => {
      try {
        if (!projectId || projectId === 'extra') return 'Pedido Extra';
        
        const userProjects = JSON.parse(localStorage.getItem(`SiPP_projects_${userId}`) || '[]');
        const project = userProjects.find(p => p.id === projectId);
        
        if (project) {
          return `${project.costCenter} - ${project.projectNumber}`;
        }
        return 'Proyecto';
      } catch (error) {
        return 'Proyecto';
      }
    };

    // Sincronizar inmediatamente
    syncWithSystemMessages();

    // Escuchar cambios en los pedidos del sistema
    const handleStorageChange = (e) => {
      if (e.key === 'SiPP_purchases' || e.key === 'SiPP_special_orders') {
        syncWithSystemMessages();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Sincronizar más frecuentemente (cada 10 segundos)
    const interval = setInterval(syncWithSystemMessages, 10000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [currentUser]);

  const markAsRead = (id) => {
    setNotifications(prev => {
      const updated = prev.map(n => 
        n.id === id ? { ...n, read: true } : n
      );
      localStorage.setItem('SiPP_notifications', JSON.stringify(updated));
      return updated;
    });
    setUnreadCount(prev => Math.max(0, prev - 1));
    
    // Cerrar notificación push si está abierta
    if (currentPush && currentPush.id === id) {
      setShowPushNotification(false);
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      localStorage.setItem('SiPP_notifications', JSON.stringify(updated));
      return updated;
    });
    setUnreadCount(0);
    setShowPushNotification(false);
  };

  const addNotification = (newNotif) => {
    const notification = {
      ...newNotif,
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      read: false,
      showAsPush: newNotif.showAsPush !== false
    };
    
    setNotifications(prev => {
      const updated = [notification, ...prev].slice(0, 100);
      localStorage.setItem('SiPP_notifications', JSON.stringify(updated));
      return updated;
    });
    setUnreadCount(prev => prev + 1);
    
    // Mostrar como push notification
    if (notification.showAsPush) {
      showPush(notification);
      showNativePush(notification);
    }
    
    return notification.id;
  };

  // Función para limpiar notificaciones antiguas
  const cleanupOldNotifications = () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    setNotifications(prev => {
      const filtered = prev.filter(n => new Date(n.timestamp) > thirtyDaysAgo);
      localStorage.setItem('SiPP_notifications', JSON.stringify(filtered));
      return filtered;
    });
  };

  // Limpiar notificaciones antiguas cada día
  useEffect(() => {
    cleanupOldNotifications();
    const interval = setInterval(cleanupOldNotifications, 24 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      unreadCount, 
      markAsRead, 
      markAllAsRead,
      addNotification,
      cleanupOldNotifications,
      showPushNotification,
      currentPush,
      setShowPushNotification
    }}>
      {children}
      {/* Componente para notificaciones push visuales */}
      {showPushNotification && currentPush && (
        <div style={pushNotificationStyles}>
          <div style={pushContentStyles}>
            <div style={pushHeaderStyles}>
              <strong>{currentPush.title}</strong>
              <button 
                onClick={() => setShowPushNotification(false)}
                style={pushCloseButtonStyles}
              >
                ✕
              </button>
            </div>
            <div style={pushBodyStyles}>
              {currentPush.message}
            </div>
            <div style={pushFooterStyles}>
              <span style={pushTimestampStyles}>
                {new Date(currentPush.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
              <button 
                onClick={() => {
                  markAsRead(currentPush.id);
                  if (currentPush.redirectTo) {
                    window.location.href = currentPush.redirectTo;
                  }
                }}
                style={pushActionButtonStyles}
              >
                Ver
              </button>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

// Estilos para la notificación push
const pushNotificationStyles = {
  position: 'fixed',
  top: '20px',
  right: '20px',
  zIndex: 9999,
  backgroundColor: 'white',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  width: '320px',
  maxWidth: '90vw',
  animation: 'slideIn 0.3s ease-out',
  borderLeft: '4px solid #4E0101',
  overflow: 'hidden',
};

const pushContentStyles = {
  padding: '12px',
};

const pushHeaderStyles = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '8px',
  color: '#4E0101',
  fontSize: '14px',
};

const pushCloseButtonStyles = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '16px',
  color: '#666',
  padding: '0',
  width: '20px',
  height: '20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const pushBodyStyles = {
  fontSize: '13px',
  color: '#333',
  marginBottom: '10px',
  lineHeight: '1.4',
};

const pushFooterStyles = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const pushTimestampStyles = {
  fontSize: '11px',
  color: '#888',
};

const pushActionButtonStyles = {
  backgroundColor: '#4E0101',
  color: 'white',
  border: 'none',
  padding: '4px 12px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: 'bold',
};

// Agregar animación CSS
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(styleSheet);

export const useNotifications = () => useContext(NotificationContext);