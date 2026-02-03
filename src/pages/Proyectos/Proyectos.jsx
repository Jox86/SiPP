// src/pages/Proyectos/Proyectos.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  TextField,
  Chip,
  Divider,
  useMediaQuery,
  useTheme,
  Alert,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Grid,
  CircularProgress,
  Avatar,
} from '@mui/material';
import { 
  Delete as DeleteIcon, 
  Search as SearchIcon,
  PictureAsPdf as PdfIcon,
  Visibility as ViewIcon,
  GridOn as ExcelIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

const Proyectos = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { currentUser } = useAuth();
  const { addNotification } = useNotifications();

  // Colores simplificados
  const colors = {
    primary: '#4E0101',
    secondary: '#667080',
    light: '#F5F0E9',
    border: '#D9CBC2',
  };

  // Estado local
  const [allProjects, setAllProjects] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [filter, setFilter] = useState('');
  const [areaFilter, setAreaFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Estado del diálogo
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [viewingProject, setViewingProject] = useState(null);
    const [form, setForm] = useState({
    name: '',
    description: '',
    budget: '',
    areaType: '',
    area: '',
    endDate: '',
    status: 'active',
    ownerId: '',
    costCenter: '', 
    projectNumber: '', 
  })
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Verificar si el usuario es admin
  const isAdmin = currentUser?.role === 'admin';

  // Cargar todos los proyectos y usuarios del sistema 
  useEffect(() => {
    const loadAllData = () => {
      try {
        const users = JSON.parse(localStorage.getItem('SiPP_users') || '[]');
        setAllUsers(users);

        // Cargar proyectos de todos los usuarios
        const allProjectsData = [];
        users.forEach(user => {
          const userProjects = JSON.parse(localStorage.getItem(`SiPP_projects_${user.id}`) || '[]');
          userProjects.forEach(project => {
            allProjectsData.push({
              ...project,
              ownerName: user.fullName,
              ownerEmail: user.email
            });
          });
        });
        setAllProjects(allProjectsData);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      }
    };

    loadAllData();

    // Escuchar cambios en localStorage
    const handleStorageChange = () => {
      loadAllData();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
  const loadAllData = () => {
    try {
      const users = JSON.parse(localStorage.getItem('SiPP_users') || '[]');
      setAllUsers(users);

      // Cargar proyectos de todos los usuarios
      const allProjectsData = [];
      users.forEach(user => {
        const userProjects = JSON.parse(localStorage.getItem(`SiPP_projects_${user.id}`) || '[]');
        
        // Si el usuario no tiene proyectos, crear uno de prueba automáticamente
        if (userProjects.length === 0 && user.role === 'user') {
          const testProject = {
            id: `proj_test_${user.id}`,
            costCenter: '100001',
            projectNumber: `DEMO${user.id.slice(0, 4).toUpperCase()}`,
            name: 'Proyecto de Demostración',
            description: 'Proyecto asignado automáticamente para demostración del sistema',
            budget: 50000,
            areaType: 'facultad',
            area: user.area || 'Matemática y Computación',
            endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 60 días desde hoy
            status: 'active',
            ownerId: user.id,
            ownerName: user.fullName,
            ownerEmail: user.email,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          userProjects.push(testProject);
          localStorage.setItem(`SiPP_projects_${user.id}`, JSON.stringify(userProjects));
        }
        
        userProjects.forEach(project => {
          allProjectsData.push({
            ...project,
            ownerName: user.fullName,
            ownerEmail: user.email
          });
        });
      });
      setAllProjects(allProjectsData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  };

  loadAllData();

  const handleStorageChange = () => {
    loadAllData();
  };
  
  window.addEventListener('storage', handleStorageChange);
  return () => window.removeEventListener('storage', handleStorageChange);
}, []);

  // Obtener áreas únicas para el filtro
  const uniqueAreas = useMemo(() => {
    const areas = allProjects
      .map(p => p.area)
      .filter(area => area && area !== 'N/A');
    return [...new Set(areas)].sort();
  }, [allProjects]);

  // Obtener usuarios únicos para el filtro (solo para admin)
  const uniqueUsers = useMemo(() => {
    if (!['admin'].includes(currentUser?.role)) return [];
    
    const users = allProjects
      .map(p => ({ id: p.ownerId, name: p.ownerName }))
      .filter(user => user.name)
      .reduce((acc, user) => {
        if (!acc.some(u => u.id === user.id)) {
          acc.push(user);
        }
        return acc;
      }, []);
    
    return users.sort((a, b) => a.name.localeCompare(b.name));
  }, [allProjects, currentUser?.role]);

  // Filtrar y ordenar proyectos según el rol del usuario
  const filteredProjects = useMemo(() => {
    let filtered = allProjects.filter((p) => {
      if (['admin'].includes(currentUser?.role)) return true;
      return p.ownerId === currentUser?.id;
    });

    // Aplicar filtros de búsqueda
    filtered = filtered.filter((p) =>
      p.costCenter?.toString().includes(filter) ||
      p.projectNumber?.toLowerCase().includes(filter.toLowerCase()) ||
      p.area?.toLowerCase().includes(filter.toLowerCase()) ||
      p.ownerName?.toLowerCase().includes(filter.toLowerCase())
    );

    // Aplicar filtro de área
    if (areaFilter !== 'all') {
      filtered = filtered.filter((p) => p.area === areaFilter);
    }

    // Aplicar filtro de usuario (solo para admin)
    if (userFilter !== 'all' && ['admin'].includes(currentUser?.role)) {
      filtered = filtered.filter((p) => p.ownerId === userFilter);
    }

    return filtered.sort((a, b) => new Date(b.endDate) - new Date(a.endDate));
  }, [allProjects, filter, areaFilter, userFilter, currentUser]);

  // Manejo de paginación
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Función para exportar proyectos a PDF - SIMPLIFICADA Y FUNCIONAL
  const handleExportPDF = useCallback(() => {
    try {
      if (filteredProjects.length === 0) {
        addNotification({
          title: 'No hay datos',
          message: 'No hay proyectos para exportar',
          type: 'warning'
        });
        return;
      }

      // Importar jsPDF dinámicamente
      import('jspdf').then(({ jsPDF }) => {
        import('jspdf-autotable').then((autoTableModule) => {
          const { default: autoTable } = autoTableModule;
          
          const doc = new jsPDF('landscape');
          
          // Título
          doc.setFontSize(16);
          doc.setTextColor(78, 1, 1);
          doc.text('Reporte de Proyectos - Sistema SiPP', 14, 15);

          // Información del reporte
          doc.setFontSize(10);
          doc.setTextColor(100, 100, 100);
          doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 25);
          doc.text(`Total: ${filteredProjects.length} proyectos`, 14, 32);
          doc.text(`Generado por: ${currentUser?.fullName || currentUser?.email}`, 14, 39);

          // Preparar datos de la tabla
          const tableData = filteredProjects.map((project) => [
            project.costCenter || 'N/A',
            project.projectNumber || 'N/A',
            project.ownerName || 'Sin asignar',
            project.area || 'N/A',
            `$${parseFloat(project.budget || 0).toLocaleString('es-ES')} CUP`,
            project.endDate ? new Date(project.endDate).toLocaleDateString('es-ES') : 'N/A',
            getStatusLabel(project.status)
          ]);

          // Generar tabla
          autoTable(doc, {
            startY: 45,
            head: [[
              'Centro Costo',
              'Número',
              'Jefe Proyecto',
              'Área',
              'Presupuesto',
              'Fecha Final',
              'Estado'
            ]],
            body: tableData,
            theme: 'grid',
            headStyles: {
              fillColor: [78, 1, 1],
              textColor: [255, 255, 255],
              fontStyle: 'bold',
              fontSize: 10
            },
            styles: {
              fontSize: 9,
              cellPadding: 3,
              overflow: 'linebreak'
            },
            columnStyles: {
              0: { cellWidth: 25 },
              1: { cellWidth: 25 },
              2: { cellWidth: 35 },
              3: { cellWidth: 30 },
              4: { cellWidth: 30 },
              5: { cellWidth: 25 },
              6: { cellWidth: 20 }
            },
            margin: { left: 14, right: 14 }
          });

          // Guardar archivo
          const fileName = `proyectos_${new Date().toISOString().split('T')[0]}.pdf`;
          doc.save(fileName);
          
          addNotification({
            title: 'PDF exportado',
            message: `Se ha descargado el reporte con ${filteredProjects.length} proyectos`,
            type: 'success'
          });
        });
      }).catch(error => {
        console.error('Error al cargar jsPDF:', error);
        addNotification({
          title: 'Error',
          message: 'No se pudo cargar la biblioteca de PDF',
          type: 'error'
        });
      });
      
    } catch (error) {
      console.error('Error al generar PDF:', error);
      addNotification({
        title: 'Error',
        message: 'No se pudo generar el reporte PDF',
        type: 'error'
      });
    }
  }, [filteredProjects, currentUser, addNotification]);

  // Cálculo de gastos reales del presupuesto
  const getRealExpenses = useCallback((projectId) => {
    try {
      const purchases = JSON.parse(localStorage.getItem('OASiS_purchases') || '[]');
      const specialOrders = JSON.parse(localStorage.getItem('OASiS_special_orders') || '[]');
      
      const allOrders = [...purchases, ...specialOrders];
      
      const projectOrders = allOrders.filter(order => 
        order.projectId === projectId || order.project === allProjects.find(p => p.id === projectId)?.name
      );
      
      const totalExpenses = projectOrders.reduce((sum, order) => {
        return sum + (parseFloat(order.total) || 0);
      }, 0);
      
      return totalExpenses;
    } catch (error) {
      console.error('Error calculando gastos:', error);
      return 0;
    }
  }, [allProjects]);

  // Presupuesto restante con gastos reales
  const getRemainingBudget = useCallback((project) => {
    const totalSpent = getRealExpenses(project.id);
    const budget = parseFloat(project.budget) || 0;
    return budget - totalSpent;
  }, [getRealExpenses]);

  // Función para exportar a Excel
  const handleExportExcel = useCallback(() => {
    try {
      if (filteredProjects.length === 0) {
        addNotification({
          title: 'No hay datos',
          message: 'No hay proyectos para exportar',
          type: 'warning'
        });
        return;
      }

      // Crear contenido CSV
      const headers = [
        'Centro de Costo',
        'Número de Proyecto',
        'Jefe de Proyecto',
        'Email Jefe',
        'Área',
        'Tipo de Área',
        'Presupuesto (CUP)',
        'Presupuesto Gastado (CUP)',
        'Presupuesto Restante (CUP)',
        'Fecha Final',
        'Estado',
        'Fecha de Creación',
        'Última Actualización',
      ];

      const rows = filteredProjects.map(project => {
        const gastado = getRealExpenses(project.id);
        const restante = getRemainingBudget(project);
        
        return [
          project.costCenter || '',
          project.projectNumber || '',
          project.ownerName || '',
          project.ownerEmail || '',
          project.area || '',
          project.areaType || '',
          parseFloat(project.budget || 0).toLocaleString('es-ES'),
          gastado.toLocaleString('es-ES', { minimumFractionDigits: 2 }),
          restante.toLocaleString('es-ES', { minimumFractionDigits: 2 }),
          project.endDate ? new Date(project.endDate).toLocaleDateString('es-ES') : '',
          getStatusLabel(project.status),
          project.createdAt ? new Date(project.createdAt).toLocaleDateString('es-ES') : '',
          project.updatedAt ? new Date(project.updatedAt).toLocaleDateString('es-ES') : '',
          (project.description || '').replace(/"/g, '""') // Escapar comillas dobles
        ];
      });

      // Convertir a CSV
      const csvContent = [
        headers.join(','),
        ...rows.map(row => 
          row.map(cell => 
            typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell
          ).join(',')
        )
      ].join('\n');

      // Crear blob y descargar
      const blob = new Blob(['\ufeff' + csvContent], { 
        type: 'text/csv;charset=utf-8;' 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `proyectos_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addNotification({
        title: 'Excel exportado',
        message: `Se ha descargado el archivo con ${filteredProjects.length} proyectos`,
        type: 'success'
      });

    } catch (error) {
      console.error('Error al exportar Excel:', error);
      addNotification({
        title: 'Error',
        message: 'No se pudo generar el archivo Excel',
        type: 'error'
      });
    }
  }, [filteredProjects, getRealExpenses, getRemainingBudget, addNotification]);

  // Función para ver detalles del proyecto
  const handleViewProject = (project) => {
    setViewingProject(project);
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setViewingProject(null);
  };

  // Manejar cambio en campos numéricos (centro de costo)
  const handleCostCenterChange = (e) => {
    const value = e.target.value;
    // Solo permite números
    if (/^\d*$/.test(value)) {
      setForm({ ...form, costCenter: value });
    }
  };

  // Manejar cambio en número de proyecto
  const handleProjectNumberChange = (e) => {
    const value = e.target.value.toUpperCase();
    // Permite letras, números, guiones y guiones bajos
    if (/^[A-Z0-9\-_]*$/.test(value)) {
      setForm({ ...form, projectNumber: value });
    }
  };

  // Validación del formulario
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (!form.costCenter || form.costCenter.trim() === '') {
      newErrors.costCenter = 'Centro de costo es requerido';
    } else if (!/^\d+$/.test(form.costCenter)) {
      newErrors.costCenter = 'Debe contener solo números';
    }
    
    if (!form.projectNumber || form.projectNumber.trim() === '') {
      newErrors.projectNumber = 'Número de proyecto es requerido';
    } else if (!/^[A-Z0-9\-_]+$/.test(form.projectNumber)) {
      newErrors.projectNumber = 'Debe ser alfanumérico (A-Z, 0-9, -, _)';
    }
    
    if (!form.budget || isNaN(form.budget) || form.budget <= 0) {
      newErrors.budget = 'Presupuesto válido es requerido';
    }
    
    if (!form.endDate) {
      newErrors.endDate = 'Fecha de fin es requerida';
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endDate = new Date(form.endDate);
      if (endDate < today) {
        newErrors.endDate = 'La fecha final no puede ser anterior a hoy';
      }
    }

    if (!form.areaType) newErrors.areaType = 'Tipo de área es requerido';
    if (!form.area) newErrors.area = 'Área es requerida';
    
    if (!form.ownerId) {
      newErrors.ownerId = 'Debe seleccionar un jefe de proyecto';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  // Función para guardar proyecto (solo admin)
  const handleSaveProject = useCallback(async () => {
    if (!isAdmin) return;
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const selectedUser = allUsers.find(u => u.id === form.ownerId);
      if (!selectedUser) {
        throw new Error('Usuario seleccionado no encontrado');
      }

      const projectData = {
        ...form,
        budget: parseFloat(form.budget),
        costCenter: form.costCenter,
        projectNumber: form.projectNumber,
        id: editingProject?.id || `proj_${Date.now()}`,
        ownerId: form.ownerId,
        ownerName: selectedUser.fullName,
        ownerEmail: selectedUser.email,
        areaType: form.areaType,
        area: form.area,
        updatedAt: new Date().toISOString(),
        createdAt: editingProject?.createdAt || new Date().toISOString(),
      };

      // Guardar en localStorage
      const userProjectsKey = `SiPP_projects_${form.ownerId}`;
      const existingProjects = JSON.parse(localStorage.getItem(userProjectsKey) || '[]');

      let updatedProjects;
      if (editingProject) {
        if (editingProject.ownerId !== form.ownerId) {
          const previousOwnerKey = `SiPP_projects_${editingProject.ownerId}`;
          const previousOwnerProjects = JSON.parse(localStorage.getItem(previousOwnerKey) || '[]');
          const filteredPrevious = previousOwnerProjects.filter(p => p.id !== editingProject.id);
          localStorage.setItem(previousOwnerKey, JSON.stringify(filteredPrevious));
        }
        
        updatedProjects = existingProjects.map(p => 
          p.id === projectData.id ? projectData : p
        );
      } else {
        updatedProjects = [...existingProjects, projectData];
      }

      localStorage.setItem(userProjectsKey, JSON.stringify(updatedProjects));

      // Actualizar estado local
      const allProjectsData = [];
      allUsers.forEach(user => {
        const userProjs = JSON.parse(localStorage.getItem(`SiPP_projects_${user.id}`) || '[]');
        userProjs.forEach(project => {
          allProjectsData.push({
            ...project,
            ownerName: user.fullName,
            ownerEmail: user.email
          });
        });
      });
      setAllProjects(allProjectsData);

      addNotification({
        title: editingProject ? 'Proyecto actualizado' : 'Proyecto creado',
        message: `Proyecto ${projectData.costCenter} - ${projectData.projectNumber} guardado correctamente.`,
        type: 'success'
      });

      handleCloseDialog();
    } catch (error) {
      console.error('Error al guardar proyecto:', error);
      addNotification({
        title: 'Error',
        message: `No se pudo ${editingProject ? 'actualizar' : 'crear'} el proyecto.`,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [form, validateForm, editingProject, isAdmin, allUsers, addNotification]);

  // Función para eliminar proyecto (solo admin)
  const handleDeleteProject = async (project) => {
    if (!isAdmin) return;

    if (!window.confirm(`¿Eliminar el proyecto "${project.costCenter} - ${project.projectNumber}"?`)) return;

    setLoading(true);
    try {
      const userProjectsKey = `SiPP_projects_${project.ownerId}`;
      const existingProjects = JSON.parse(localStorage.getItem(userProjectsKey) || '[]');
      const updatedProjects = existingProjects.filter(p => p.id !== project.id);
      localStorage.setItem(userProjectsKey, JSON.stringify(updatedProjects));

      // Actualizar estado local
      const allProjectsData = [];
      allUsers.forEach(user => {
        const userProjs = JSON.parse(localStorage.getItem(`SiPP_projects_${user.id}`) || '[]');
        userProjs.forEach(proj => {
          allProjectsData.push({
            ...proj,
            ownerName: user.fullName,
            ownerEmail: user.email
          });
        });
      });
      setAllProjects(allProjectsData);

      addNotification({
        title: 'Proyecto eliminado',
        message: `El proyecto ${project.costCenter} - ${project.projectNumber} fue eliminado.`,
        type: 'warning'
      });
    } catch (error) {
      console.error('Error al eliminar proyecto:', error);
      addNotification({
        title: 'Error',
        message: 'No se pudo eliminar el proyecto.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Etiquetas de estado
  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'paused': return 'En pausa';
      case 'completed': return 'Completado';
      default: return 'Desconocido';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'paused': return 'warning';
      case 'completed': return 'default';
      default: return 'error';
    }
  };

  // Obtener usuarios para el selector
  const availableUsers = useMemo(() => {
    return allUsers.filter(user => user.role !== 'admin');
  }, [allUsers]);

  return (
    <Box sx={{ 
      p: isMobile ? 2 : 3,
      backgroundColor: 'background.default',
      minHeight: '100vh',
    }}>
      <Typography 
        variant="h4" 
        gutterBottom 
        fontWeight="bold" 
        sx={{
          color: colors.primary,
          mb: 3,
          mt: 3
        }}
      >
        Gestión de Proyectos
      </Typography>

      {/* Panel de filtros */}
      <Paper sx={{ 
        p: 2, 
        mb: 3, 
        borderRadius: 2,
        backgroundColor: 'background.paper',
        border: `1px solid ${colors.border}`,
      }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: 2,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <TextField
            placeholder="Buscar por centro de costo, número, área o jefe..."
            variant="outlined"
            size="small"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: colors.secondary, mr: 1 }} />,
            }}
            sx={{ 
              flexGrow: 1, 
              maxWidth: isMobile ? '100%' : 300,
              backgroundColor: 'white',
            }}
          />

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Botones de exportación */}
            <Button
              startIcon={<PdfIcon />}
              onClick={handleExportPDF}
              variant="outlined"
              size="small"
              disabled={filteredProjects.length === 0}
              sx={{
                color: colors.secondary,
                borderColor: colors.secondary,
                '&:hover': {
                  backgroundColor: 'rgba(102, 112, 128, 0.1)',
                  borderColor: colors.secondary,
                },
              }}
            >
              PDF
            </Button>

            <Button
              startIcon={<ExcelIcon />}
              onClick={handleExportExcel}
              variant="outlined"
              size="small"
              disabled={filteredProjects.length === 0}
              sx={{
                color: '#217346',
                borderColor: '#217346',
                '&:hover': {
                  backgroundColor: 'rgba(33, 115, 70, 0.1)',
                  borderColor: '#217346',
                },
              }}
            >
              Excel
            </Button>

            {/* Filtro por área */}
            <TextField
              select
              label="Filtrar por área"
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
              size="small"
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="all">Todas las áreas</MenuItem>
              {uniqueAreas.map(area => (
                <MenuItem key={area} value={area}>{area}</MenuItem>
              ))}
            </TextField>

            {/* Filtro por usuario (solo para admin) */}
            {['admin'].includes(currentUser?.role) && (
              <TextField
                select
                label="Filtrar por usuario"
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                size="small"
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="all">Todos los usuarios</MenuItem>
                {uniqueUsers.map(user => (
                  <MenuItem key={user.id} value={user.id}>{user.name}</MenuItem>
                ))}
              </TextField>
            )}
          </Box>
        </Box>
      </Paper>

      {filteredProjects.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          No se encontraron proyectos con los filtros aplicados.
        </Alert>
      ) : (
        // Tabla de proyectos
        <Paper sx={{ 
          borderRadius: 2,
          overflow: 'hidden',
          backgroundColor: 'background.paper',
          border: `1px solid ${colors.border}`,
        }}>
          <TableContainer>
            <Table size={isMobile ? 'small' : 'medium'}>
              <TableHead sx={{ 
                backgroundColor: 'rgba(78, 1, 1, 0.05)' 
              }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: colors.primary }}>Centro Costo</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: colors.primary }}>Número</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: colors.primary }}>Jefe Proyecto</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: colors.primary }}>Área</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: colors.primary }}>Presupuesto</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: colors.primary }}>Fecha Final</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: colors.primary }}>Estado</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, color: colors.primary }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProjects
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((project) => {
                    const remainingBudget = getRemainingBudget(project);
                    const totalSpent = getRealExpenses(project.id);
                    
                    return (
                      <TableRow key={project.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold" color={colors.primary}>
                            {project.costCenter || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {project.projectNumber || 'N/A'}
                          </Typography>
                        </TableCell>
                        
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar 
                              sx={{ 
                                width: 32, 
                                height: 32,
                                backgroundColor: 'rgba(78, 1, 1, 0.1)',
                                color: colors.primary
                              }}
                            >
                              {project.ownerName?.charAt(0) || '?'}
                            </Avatar>
                            <Typography variant="body2">
                              {project.ownerName || 'Sin asignar'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{project.area || 'N/A'}</TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="bold" color={colors.primary}>
                            ${parseFloat(project.budget || 0).toLocaleString('es-ES')} CUP
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Gastado: ${totalSpent.toLocaleString('es-ES', { minimumFractionDigits: 2 })} CUP
                          </Typography>
                          <Typography variant="caption" 
                            color={remainingBudget < 0 ? 'error.main' : colors.secondary} 
                            display="block"
                          >
                            Restante: ${remainingBudget.toLocaleString('es-ES', { minimumFractionDigits: 2 })} CUP
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {project.endDate ? new Date(project.endDate).toLocaleDateString('es-ES') : 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(project.status)}
                            size="small"
                            color={getStatusColor(project.status)}
                          />
                        </TableCell>
                        
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                            <Tooltip title="Ver detalles">
                              <IconButton
                                size="small"
                                sx={{ 
                                  color: colors.secondary,
                                }}
                                onClick={() => handleViewProject(project)}
                              >
                                <ViewIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            {isAdmin && (
                              <>
                                <Tooltip title="Eliminar">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleDeleteProject(project)}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredProjects.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Filas por página"
            rowsPerPageOptions={[5, 10, 25]}
          />
        </Paper>
      )}

      {/* Diálogo para ver detalles */}
      <Dialog 
        open={openViewDialog} 
        onClose={handleCloseViewDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: colors.primary, fontWeight: 600 }}>
          Detalles del Proyecto
        </DialogTitle>
        <DialogContent>
          {viewingProject && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Centro de Costo
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {viewingProject.costCenter || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Número de Proyecto
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {viewingProject.projectNumber || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Jefe de Proyecto
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <Avatar 
                      sx={{ 
                        width: 28, 
                        height: 28,
                        fontSize: '0.9rem',
                        backgroundColor: 'rgba(78, 1, 1, 0.1)',
                        color: colors.primary
                      }}
                    >
                      {viewingProject.ownerName?.charAt(0) || '?'}
                    </Avatar>
                    <Box>
                      <Typography variant="body2">
                        {viewingProject.ownerName || 'Sin asignar'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {viewingProject.ownerEmail || ''}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Estado
                  </Typography>
                  <Chip
                    label={getStatusLabel(viewingProject.status)}
                    color={getStatusColor(viewingProject.status)}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Área
                  </Typography>
                  <Typography variant="body1">
                    {viewingProject.area || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Tipo de Área
                  </Typography>
                  <Typography variant="body1">
                    {viewingProject.areaType || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Presupuesto
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" color={colors.primary}>
                    ${parseFloat(viewingProject.budget || 0).toLocaleString('es-ES')} CUP
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Fecha Final
                  </Typography>
                  <Typography variant="body1">
                    {viewingProject.endDate ? new Date(viewingProject.endDate).toLocaleDateString('es-ES') : 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <Divider sx={{ my: 3, mt: 10 }} />

      <Typography variant="body2" color="text.secondary" align="center">
        Sistema SiPP • {filteredProjects.length} proyectos • {isAdmin ? 'Modo Administrador' : 'Modo Visualización'}
      </Typography>
    </Box>
  );
};

export default Proyectos;