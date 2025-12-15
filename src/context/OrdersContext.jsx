// src/context/OrdersContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const OrdersContext = createContext();

export const OrdersProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);

  // Cargar pedidos desde localStorage
  const loadOrders = () => {
    const saved = localStorage.getItem('SiPP_orders');
    if (saved) {
      setOrders(JSON.parse(saved));
    }
  };

  // Guardar pedidos
  const saveOrders = (ordersToSave) => {
    setOrders(ordersToSave);
    localStorage.setItem('SiPP_orders', JSON.stringify(ordersToSave));
  };

  // Añadir pedido
  const addOrder = (newOrder) => {
    const updatedOrders = [newOrder, ...orders];
    saveOrders(updatedOrders);
    return newOrder;
  };

  // Actualizar estado de pedido
  const updateOrderStatus = (orderId, newStatus) => {
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    saveOrders(updatedOrders);
  };

  // Carga inicial
  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <OrdersContext.Provider value={{ 
      orders, 
      addOrder, 
      updateOrderStatus,
      loadOrders
    }}>
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrders = () => useContext(OrdersContext);