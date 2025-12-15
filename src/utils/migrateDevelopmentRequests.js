// src/utils/migrateDevelopmentRequests.js
export const migrateExistingDevelopmentRequests = () => {
  try {
    const specialOrders = JSON.parse(localStorage.getItem('OASiS_special_orders') || '[]');
    let migrated = 0;

    const updatedOrders = specialOrders.map(order => {
      // Si es un pedido de servicio que no tiene los campos de desarrollo
      if (order.orderType === 'service' && !order.assignedTo) {
        const hasDevelopmentContent = order.items?.some(item => {
          const text = `${item.serviceType} ${item.description} ${item.name}`.toLowerCase();
          return text.includes('software') || 
                 text.includes('desarrollo') || 
                 text.includes('programación') ||
                 text.includes('aplicación') ||
                 text.includes('sistema');
        });

        if (hasDevelopmentContent) {
          migrated++;
          return {
            ...order,
            status: order.status || 'Pendiente',
            assignedTo: order.assignedTo || '',
            progress: order.progress || 0,
            notes: order.notes || [],
            reports: order.reports || [],
            actas: order.actas || []
          };
        }
      }
      return order;
    });

    if (migrated > 0) {
      localStorage.setItem('OASiS_special_orders', JSON.stringify(updatedOrders));
      console.log(`✅ Migrados ${migrated} pedidos a desarrollo`);
    }

    return migrated;
  } catch (error) {
    console.error('❌ Error en migración:', error);
    return 0;
  }
};