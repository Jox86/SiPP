// src/context/NotificationContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Cargar notificaciones desde localStorage al inicializar
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

  // Sincronizar con mensajes del sistema OASiS
  useEffect(() => {
    if (!currentUser) return;

    const syncWithSystemMessages = () => {
      try {
        // Cargar pedidos del sistema (que son los "mensajes")
        const purchases = JSON.parse(localStorage.getItem('OASiS_purchases') || '[]');
        const specialOrders = JSON.parse(localStorage.getItem('OASiS_special_orders') || '[]');
        
        const allOrders = [...purchases, ...specialOrders];
        
        // Filtrar pedidos relevantes para el usuario actual
        const relevantOrders = allOrders.filter(order => {
          if (['admin', 'comercial'].includes(currentUser?.role)) {
            // Admin y comercial ven todos los pedidos pendientes
            return order.status === 'Pendiente' || order.status === 'pending';
          } else {
            // Usuarios normales solo ven sus propios pedidos pendientes
            return order.userId === currentUser.id && 
                  (order.status === 'Pendiente' || order.status === 'pending');
          }
        });

        // Convertir pedidos relevantes en notificaciones
        const orderNotifications = relevantOrders.map(order => {
          const isSpecial = order.type === 'special';
          const orderDate = new Date(order.date);
          const orderNumber = generateOrderNumber(order.id, orderDate.getFullYear());
          
          return {
            id: `order_${order.id}`,
            title: getOrderTitle(order, isSpecial),
            message: getOrderMessage(order, isSpecial),
            type: getOrderType(order),
            timestamp: order.date,
            read: false,
            source: 'order',
            orderId: order.id,
            orderType: isSpecial ? 'special' : 'normal',
            userId: order.userId,
            projectId: order.projectId,
            status: order.status,
            redirectTo: '/mensajes'
          };
        });

        // Cargar notificaciones existentes
        const existingNotifications = localStorage.getItem('SiPP_notifications');
        let currentNotifications = [];
        
        if (existingNotifications) {
          currentNotifications = JSON.parse(existingNotifications);
        }

        // Combinar y eliminar duplicados
        const allNotifications = [...orderNotifications];
        currentNotifications.forEach(existing => {
          if (!allNotifications.find(n => n.id === existing.id)) {
            allNotifications.push(existing);
          }
        });

        // Ordenar por timestamp (más reciente primero)
        const sortedNotifications = allNotifications.sort((a, b) => 
          new Date(b.timestamp) - new Date(a.timestamp)
        );

        setNotifications(sortedNotifications);
        setUnreadCount(sortedNotifications.filter(n => !n.read).length);
        localStorage.setItem('SiPP_notifications', JSON.stringify(sortedNotifications));

      } catch (error) {
        console.error('Error syncing with system messages:', error);
      }
    };

    // Función auxiliar para generar número de pedido
    const generateOrderNumber = (orderId, year) => {
      const paddedId = orderId.toString().padStart(3, '0');
      return `PDD-${paddedId}-${year.toString().slice(-2)}`;
    };

    // Función auxiliar para determinar el título
    const getOrderTitle = (order, isSpecial) => {
      if (isSpecial) {
        return `Pedido Extra - ${order.orderType === 'service' ? 'Servicio' : 'Producto'}`;
      }
      return 'Nuevo Pedido Normal';
    };

    // Función auxiliar para determinar el mensaje
    const getOrderMessage = (order, isSpecial) => {
      const userName = getUserName(order.userId);
      const projectName = getProjectName(order.projectId, order.userId);
      
      if (isSpecial) {
        return `${userName} ha solicitado un pedido extra para ${projectName}`;
      }
      return `${userName} ha realizado un nuevo pedido para ${projectName}`;
    };

    // Función auxiliar para determinar el tipo
    const getOrderType = (order) => {
      if (order.priority === 'high' || order.priority === 'Alta') return 'error';
      if (order.status === 'Completado') return 'success';
      return 'info';
    };

    // Función auxiliar para obtener nombre de usuario
    const getUserName = (userId) => {
      try {
        const users = JSON.parse(localStorage.getItem('SiPP_users') || '[]');
        const user = users.find(u => u.id === userId);
        return user ? user.fullName : 'Usuario';
      } catch (error) {
        return 'Usuario';
      }
    };

    // Función auxiliar para obtener nombre del proyecto
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
      if (e.key === 'OASiS_purchases' || e.key === 'OASiS_special_orders') {
        syncWithSystemMessages();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Sincronizar periódicamente (cada 30 segundos)
    const interval = setInterval(syncWithSystemMessages, 30000);

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
  };

  const markAllAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      localStorage.setItem('SiPP_notifications', JSON.stringify(updated));
      return updated;
    });
    setUnreadCount(0);
  };

  const addNotification = (newNotif) => {
    const notification = {
      ...newNotif,
      id: `custom_${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    setNotifications(prev => {
      const updated = [notification, ...prev];
      localStorage.setItem('SiPP_notifications', JSON.stringify(updated));
      return updated;
    });
    setUnreadCount(prev => prev + 1);
  };

  // Función para limpiar notificaciones antiguas (más de 30 días)
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
      cleanupOldNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);