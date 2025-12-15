export const getInitialUsers = () => {
  try {
    const saved = localStorage.getItem('SiPP_users');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error loading users', e);
  }
  return [
    {
      id: 1,
      username: 'admin',
      password: 'admin',
      fullName: 'Administrador',
      area: 'DST',
      avatar: 'https://i.pravatar.cc/150?u=admin',
      role: 'admin'
    }
  ];
};

export const getInitialProjects = () => {
  try {
    const saved = localStorage.getItem('SiPP_projects');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error loading projects', e);
  }
  return [
    {
      id: 1,
      name: 'Actualización Redes F1',
      ownerId: 1,
      budget: 50000,
      budgetSpent: 12500,
      endDate: '2023-12-31',
      createdAt: '2023-01-15'
    },
    {
      id: 2,
      name: 'Equipos DST 2023',
      ownerId: 1,
      budget: 75000,
      budgetSpent: 45000,
      endDate: '2023-11-15',
      createdAt: '2023-02-20'
    }
  ];
};

export const getInitialOrders = () => {
  try {
    const saved = localStorage.getItem('SiPP_orders');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error loading orders', e);
  }
  return [
    {
      id: 'ORD-2023-105',
      projectId: 1,
      projectName: 'Actualización Redes F1',
      type: 'Compra',
      date: '2023-10-15',
      status: 'Completado',
      priority: 'Baja',
      progress: 100,
      description: 'Red F1',
      archived: false
    }
  ];
};

//  Esta función estaba faltando
export const getInitialSession = () => {
  try {
    const saved = sessionStorage.getItem('SiPP_currentUser');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error loading session', e);
  }
  return null;
};

export const getInitialCatalogs = () => {
  try {
    const saved = localStorage.getItem('SiPP_catalogs');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error loading catalogs', e);
  }
  return [];
};

export const getInitialMessages = () => {
  try {
    const saved = localStorage.getItem('SiPP_messages');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error loading messages', e);
  }
  return [];
};

export const getInitialReports = () => {
  try {
    const saved = localStorage.getItem('SiPP_reports');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error loading reports', e);
  }
  return [
    { id: 1, type: 'mensual', date: '2023-10-01', generatedBy: 'admin' },
    { id: 2, type: 'acta', orderId: 'ORD-2023-105', date: '2023-10-16' }
  ];
};