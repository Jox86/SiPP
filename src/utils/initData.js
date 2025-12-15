//Archivo con datos de prueba para inicializar
// src/utils/initData.js
export const initSampleData = () => {
  // Solo ejecutar si no hay datos existentes
  if (!localStorage.getItem('SiPP_projects')) {
    const sampleProjects = [
      {
        id: 1,
        name: 'Actualización Redes F1',
        area: 'F1',
        budget: 50000,
        budgetSpent: 12500,
        ownerId: 1,
        endDate: '2024-12-31',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Equipos DST 2023',
        area: 'DST',
        budget: 75000,
        budgetSpent: 45000,
        ownerId: 2,
        endDate: '2024-11-15',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    localStorage.setItem('SiPP_projects', JSON.stringify(sampleProjects));
  }

  if (!localStorage.getItem('SiPP_users')) {
    const sampleUsers = [
      {
        id: 1,
        username: 'admin',
        fullName: 'Administrador',
        role: 'admin',
        area: 'General',
        avatar: '/avatars/admin.png'
      },
      {
        id: 2,
        username: 'jefe1',
        fullName: 'Jefe Proyecto 1',
        role: 'project_leader',
        area: 'F1',
        avatar: '/avatars/default.png'
      }
    ];
    localStorage.setItem('SiPP_users', JSON.stringify(sampleUsers));
  }
};