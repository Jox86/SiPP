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
  alpha,
} from '@mui/material';
import { Edit as EditIcon, 
  Delete as DeleteIcon, 
  Search as SearchIcon, 
  Add as AddIcon,
  PictureAsPdf as PdfIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

// AGREGAR al inicio del archivo, después de los otros imports:
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const Proyectos = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { currentUser } = useAuth();
  const { addNotification } = useNotifications();

  // Nueva paleta de colores
  const colors = {
    borgundy: '#4E0101',
    tan: '#d2b48c',
    sapphire: '#667080',
    swanWhite: '#F5F0E9',
    shellstone: '#D9CBC2',
    error: '#ca0000ff',
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
  const [editingProject, setEditingProject] = useState(null);
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
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Cargar todos los proyectos y usuarios del sistema 
  useEffect(() => {
    const loadAllData = () => {
      try {
        // CORREGIDO: Usar la misma clave que Usuarios.jsx
        const users = JSON.parse(localStorage.getItem('SiPP_users') || '[]');
        setAllUsers(users);
        console.log('Usuarios cargados en Proyectos:', users.length);

        // Cargar proyectos de todos los usuarios
        const allProjectsData = [];
        users.forEach(user => {
          const userProjects = JSON.parse(localStorage.getItem(`SiPP_projects_${user.id}`) || '[]');
          allProjectsData.push(...userProjects);
        });
        setAllProjects(allProjectsData);
        console.log('Proyectos cargados:', allProjectsData.length);
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

  // Obtener áreas únicas para el filtro
  const uniqueAreas = useMemo(() => {
    const areas = allProjects
      .map(p => p.area)
      .filter(area => area && area !== 'N/A');
    return [...new Set(areas)].sort();
  }, [allProjects]);

  // Obtener usuarios únicos para el filtro (solo para admin/comercial)
  const uniqueUsers = useMemo(() => {
    if (!['admin', 'comercial'].includes(currentUser?.role)) return [];
    
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
    // Filtrar proyectos según el rol del usuario
    let filtered = allProjects.filter((p) => {
      // Si es administrador o comercial, puede ver todos los proyectos
      if (['admin', 'comercial'].includes(currentUser?.role)) return true;
      // Si no, solo puede ver sus propios proyectos
      return p.ownerId === currentUser?.id;
    });

    // Aplicar filtros de búsqueda
    filtered = filtered.filter((p) =>
      p.name.toLowerCase().includes(filter.toLowerCase()) ||
      p.area?.toLowerCase().includes(filter.toLowerCase()) ||
      p.ownerName?.toLowerCase().includes(filter.toLowerCase()) ||
      p.costCenter?.toString().includes(filter) || //  BUSCAR POR CENTRO DE COSTO
      p.projectNumber?.toLowerCase().includes(filter.toLowerCase()) //  BUSCAR POR NÚMERO DE PROYECTO
    );

    // Aplicar filtro de área
    if (areaFilter !== 'all') {
      filtered = filtered.filter((p) => p.area === areaFilter);
    }

    // Aplicar filtro de usuario (solo para admin/comercial)
    if (userFilter !== 'all' && ['admin', 'comercial'].includes(currentUser?.role)) {
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

  // AGREGAR esta función después de las otras funciones (después de handleDeleteProject):

// Función para exportar proyectos a PDF
const handleExportPDF = () => {
  try {
    const doc = new jsPDF();
    
    // Configuración del documento
    doc.setFontSize(18);
    doc.setTextColor(78, 1, 1); // Color borgundy
    doc.text('Sistema SiPP - Reporte de Proyectos', 14, 22);

    doc.setFontSize(12);
    doc.setTextColor(102, 112, 128); // Color sapphire
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 32);
    doc.text(`Total de proyectos: ${filteredProjects.length}`, 14, 42);

    // Datos de la tabla
    const tableData = filteredProjects.map((project) => [
      project.costCenter || 'N/A',
      project.projectNumber || 'N/A',
      project.ownerName || 'Sin asignar',
      project.area || 'N/A',
      `$${(project.budget || 0).toLocaleString()} CUP`,
      project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A',
      getStatusLabel(project.status)
    ]);

    // Generar tabla
    doc.autoTable({
      head: [
        [
          'Centro de Costo',
          'Número',
          'Jefe de Proyecto', 
          'Área',
          'Presupuesto',
          'Fecha Final',
          'Estado'
        ]
      ],
      body: tableData,
      startY: 50,
      theme: 'grid',
      styles: { 
        fontSize: 9,
        cellPadding: 3,
        textColor: [0, 0, 0]
      },
      headStyles: { 
        fillColor: [78, 1, 1], // Color borgundy
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { cellWidth: 25 }, // Centro de Costo
        1: { cellWidth: 25 }, // Número
        2: { cellWidth: 30 }, // Jefe de Proyecto
        3: { cellWidth: 25 }, // Área
        4: { cellWidth: 25 }, // Presupuesto
        5: { cellWidth: 25 }, // Fecha Final
        6: { cellWidth: 20 }  // Estado
      },
      margin: { left: 14, right: 14 }
    });

    // Información adicional
    const finalY = doc.lastAutoTable.finalY + 10;
    if (finalY < 280) {
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Sistema SiPP - Gestión de Proyectos', 14, finalY);
    }

    // Guardar archivo
    doc.save(`proyectos_sipp_${new Date().toISOString().split('T')[0]}.pdf`);
    
    addNotification({
      title: 'PDF generado',
      message: `El reporte de ${filteredProjects.length} proyectos se ha descargado correctamente`,
      type: 'success'
    });
    
  } catch (error) {
    console.error('Error al generar PDF:', error);
    addNotification({
      title: 'Error',
      message: 'No se pudo generar el reporte PDF',
      type: 'error'
    });
  }
};

  // Cálculo de gastos reales del presupuesto
  const getRealExpenses = useCallback((projectId) => {
    try {
      // Cargar todos los pedidos del sistema
      const purchases = JSON.parse(localStorage.getItem('OASiS_purchases') || '[]');
      const specialOrders = JSON.parse(localStorage.getItem('OASiS_special_orders') || '[]');
      
      // Combinar todos los pedidos
      const allOrders = [...purchases, ...specialOrders];
      
      // Filtrar pedidos del proyecto y sumar totales
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

  // Diálogo Editar Proyecto
  const handleOpenDialog = (project = null) => {
  // Solo permitir abrir el diálogo si el usuario tiene permisos
  if (project && project.ownerId !== currentUser?.id && !['admin', 'comercial'].includes(currentUser?.role)) {
    addNotification({
      title: 'Acceso denegado',
      message: 'No tienes permisos para editar este proyecto.',
      type: 'error'
    });
    return;
  }
  
  if (project) {
    setEditingProject(project);
    setForm({
      name: project.name,
      description: project.description || '',
      budget: project.budget || '',
      areaType: project.areaType || '',
      area: project.area || '',
      endDate: project.endDate || '',
      status: project.status || 'active',
      ownerId: project.ownerId || currentUser?.id,
      costCenter: project.costCenter || '', 
      projectNumber: project.projectNumber || '', 
    });
  } else {
    setEditingProject(null);
    setForm({
      name: '',
      description: '',
      budget: '',
      areaType: '',
      area: '',
      endDate: '',
      status: 'active',
      ownerId: currentUser?.id || '', //  Asegurar que tenga el ID del usuario actual
      costCenter: '', 
      projectNumber: '', 
    });
  }
  setErrors({});
  setOpenDialog(true);
};

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProject(null);
  };

  //  VALIDACIÓN ACTUALIZADA CON NUEVOS CAMPOS
const validateForm = useCallback(() => {
  const newErrors = {};
  
  //  Centro de costo es obligatorio y debe ser numérico
  if (!form.costCenter || !/^\d+$/.test(form.costCenter)) {
    newErrors.costCenter = 'Centro de costo es requerido y debe contener solo números';
  }
  
  //  Número de proyecto es obligatorio y debe ser alfanumérico
  if (!form.projectNumber || !/^[a-zA-Z0-9\-_]+$/.test(form.projectNumber)) {
    newErrors.projectNumber = 'Número de proyecto es requerido y debe ser alfanumérico';
  }
  
  if (!form.budget || isNaN(form.budget) || form.budget <= 0) {
    newErrors.budget = 'Presupuesto válido es requerido';
  }
  
  if (!form.endDate) {
    newErrors.endDate = 'Fecha de fin es requerida';
  }
  
  // Validar que la fecha final no sea anterior a la fecha actual
  if (form.endDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(form.endDate);
    if (endDate < today) {
      newErrors.endDate = 'La fecha final no puede ser anterior a la fecha actual';
    }
  }

  if (!form.areaType) newErrors.areaType = 'Tipo de área es requerido';
  if (!form.area) newErrors.area = 'Área es requerida';
  
  // Solo validar ownerId si el usuario es admin/comercial
  if (['admin', 'comercial'].includes(currentUser?.role) && !form.ownerId) {
    newErrors.ownerId = 'Debe seleccionar un jefe de proyecto';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
}, [form, currentUser?.role]);

  // Función para guardar proyecto (crear o actualizar)
  const handleSaveProject = useCallback(async () => {
    if (!validateForm()) return;

    // Verificar permisos para editar
    if (editingProject && editingProject.ownerId !== currentUser?.id && !['admin', 'comercial'].includes(currentUser?.role)) {
      addNotification({
        title: 'Acceso denegado',
        message: 'No tienes permisos para editar este proyecto.',
        type: 'error'
      });
      return;
    }

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
        areaType: form.areaType,
        area: form.area,
        updatedAt: new Date().toISOString(),
        createdAt: editingProject?.createdAt || new Date().toISOString(),
      };

      // Guardar en el localStorage del usuario correspondiente
      const userProjectsKey = `SiPP_projects_${form.ownerId}`;
      const existingProjects = JSON.parse(localStorage.getItem(userProjectsKey) || '[]');

      let updatedProjects;
      if (editingProject) {
        // Si estamos editando y cambió el dueño, eliminar del dueño anterior y agregar al nuevo
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
        allProjectsData.push(...userProjs);
      });
      setAllProjects(allProjectsData);

      addNotification({
        title: editingProject ? 'Proyecto actualizado' : 'Proyecto creado',
        message: `Proyecto ${projectData.costCenter} - ${projectData.projectNumber} fue ${editingProject ? 'actualizado' : 'creado'} correctamente.`,
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
  }, [form, validateForm, editingProject, currentUser, allUsers, addNotification]);

  // Función para eliminar proyecto
  const handleDeleteProject = async (project) => {
    // Verificar permisos para eliminar
    if (project.ownerId !== currentUser?.id && !['admin', 'comercial'].includes(currentUser?.role)) {
      addNotification({
        title: 'Acceso denegado',
        message: 'No tienes permisos para eliminar este proyecto.',
        type: 'error'
      });
      return;
    }

    if (!window.confirm(`¿Eliminar el proyecto "${project.costCenter} - ${project.projectNumber}"? Esta acción no se puede deshacer.`)) return;

    setLoading(true);
    try {
      // Eliminar del localStorage del dueño
      const userProjectsKey = `SiPP_projects_${project.ownerId}`;
      const existingProjects = JSON.parse(localStorage.getItem(userProjectsKey) || '[]');
      const updatedProjects = existingProjects.filter(p => p.id !== project.id);
      localStorage.setItem(userProjectsKey, JSON.stringify(updatedProjects));

      // Actualizar estado local
      const allProjectsData = [];
      allUsers.forEach(user => {
        const userProjs = JSON.parse(localStorage.getItem(`SiPP_projects_${user.id}`) || '[]');
        allProjectsData.push(...userProjs);
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

  // Verificar si el usuario puede gestionar el proyecto
const canManageProject = (project) => {
  return project.ownerId === currentUser?.id || ['admin', 'comercial'].includes(currentUser?.role);
};

  // Obtener usuarios para el selector (solo usuarios normales, no admin/comercial)
  const availableUsers = useMemo(() => {
    return allUsers.filter(user => 
      user.role !== 'admin' && user.role !== 'comercial'
    );
  }, [allUsers]);

  return (
    <Box sx={{ 
      p: isMobile ? 2 : 4,
      backgroundColor: colors.paper,
      minHeight: '100vh',
      marginTop: isMobile ? '10%' : 3, 
    }}>
      <Typography 
        variant="h4" 
        gutterBottom 
        fontWeight="bold" 
        sx={{
          color: theme.palette.mode === 'dark' ? colors.swanWhite : colors.borgundy,
          mb: 3
        }}
      >
        Gestión de Proyectos
      </Typography>

      {/*  PAPER CON EFECTO GLASS */}
      <Paper sx={{ 
        p: 3, 
        mb: 3, 
        borderRadius: 3,
        background: theme.palette.mode === 'dark'
          ? `linear-gradient(135deg, ${alpha(colors.sapphire, 0.15)} 0%, ${alpha(colors.borgundy, 0.1)} 100%)`
          : `linear-gradient(135deg, ${colors.swanWhite} 0%, ${colors.shellstone}20 100%)`,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
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
              startAdornment: <SearchIcon sx={{ color: colors.sapphire, mr: 1 }} />,
            }}
            sx={{ 
              flexGrow: 1, 
              maxWidth: isMobile ? '100%' : 300,
              '& .MuiOutlinedInput-root': {
                backgroundColor: colors.swanWhite,
                '&:hover fieldset': { borderColor: colors.sapphire },
              }
            }}
          />

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            {/*  AGREGAR botón de exportar PDF */}
            <Button
              startIcon={<PdfIcon />}
              onClick={handleExportPDF}
              variant="outlined"
              size="small"
              disabled={filteredProjects.length === 0}
              sx={{
                color: colors.sapphire,
                borderColor: colors.sapphire,
                '&:hover': {
                  backgroundColor: alpha(colors.sapphire, 0.1),
                  borderColor: colors.sapphire,
                },
                '&:disabled': {
                  color: colors.shellstone,
                  borderColor: colors.shellstone,
                }
              }}
            >
              Exportar PDF
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

            {/* Filtro por usuario (solo para admin/comercial) */}
            {['admin', 'comercial'].includes(currentUser?.role) && (
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
        //  TABLA CON EFECTO GLASS
        <Paper sx={{ 
          borderRadius: 3, 
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          background: theme.palette.mode === 'dark'
            ? `linear-gradient(135deg, ${alpha(colors.swanWhite, 0.15)} 0%, ${alpha(colors.borgundy, 0.1)} 100%)`
            : `linear-gradient(135deg, ${colors.swanWhite} 0%, ${colors.shellstone}20 100%)`,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
        }}>
          <TableContainer>
            <Table size={isMobile ? 'small' : 'medium'}>
              <TableHead sx={{ 
                backgroundColor: theme.palette.mode === 'dark' 
                  ? alpha(colors.borgundy, 0.3) 
                  : alpha(colors.borgundy, 0.1) 
              }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: colors.borgundy }}>Centro de Costo</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: colors.borgundy }}>Número</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: colors.borgundy }}>Jefe de Proyecto</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: colors.borgundy }}>Área</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: colors.borgundy }}>Presupuesto</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: colors.borgundy }}>Fecha Final</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: colors.borgundy }}>Estado</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, color: colors.borgundy }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProjects
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((project) => {
                    const remainingBudget = getRemainingBudget(project);
                    const totalSpent = getRealExpenses(project.id);
                    const canManage = canManageProject(project);
                    return (
                      <TableRow key={project.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold" color={colors.borgundy}>
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
                              src={allUsers.find(u => u.id === project.ownerId)?.avatar} 
                              sx={{ width: 32, height: 32 }}
                              onError={(e) => {
                                e.target.src = '/src/assets/images/users/3d-user-icon.jpg';
                              }}
                            >
                              {project.ownerName?.charAt(0)}
                            </Avatar>
                            <Typography variant="body2">
                              {project.ownerName || 'Sin asignar'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{project.area || 'N/A'}</TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="bold" color={colors.borgundy}>
                            ${(project.budget || 0).toLocaleString()} CUP
                          </Typography>
                          <Typography variant="caption" color={remainingBudget < 0 ? 'error.main' : 'text.secondary'}>
                            Gastado: ${totalSpent.toFixed(2)} CUP
                          </Typography>
                          <Typography variant="caption" color={remainingBudget < 0 ? 'error.main' : colors.sapphire} display="block">
                            Restante: ${remainingBudget.toFixed(2)} CUP
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(project.status)}
                            size="small"
                            color={getStatusColor(project.status)}
                            variant="outlined"
                          />
                        </TableCell>
                        
                        <TableCell align="center">
                          {canManage && (
                            <>
<Tooltip title="Editar">
  <IconButton
    size="small"
    sx={{ 
      color: colors.sapphire,
      mr: 1,
      '&:hover': { backgroundColor: alpha(colors.sapphire, 0.1) }
    }}
    onClick={() => handleOpenDialog(project)} //  AGREGAR ESTA LÍNEA
  >
    <EditIcon fontSize="small" />
  </IconButton>
</Tooltip>
                              <Tooltip title="Eliminar">
                                <IconButton
                                  size="small"
                                  color="error"
                                  sx={{ 
                                    '&:hover': { backgroundColor: alpha('#f44336', 0.1)  }
                                  }}
                                  onClick={() => handleDeleteProject(project)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                          {!canManage && (
                            <Typography variant="caption" color="text.secondary">
                              Solo vista
                            </Typography>
                          )}
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
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} de ${count}`
            }
          />
        </Paper>
      )}

      {/*  BOTÓN CON NUEVA PALETA */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ 
            background: `linear-gradient(135deg, ${colors.borgundy} 0%, ${colors.sapphire} 100%)`,
            '&:hover': { 
              background: `linear-gradient(135deg, ${colors.sapphire} 0%, ${colors.borgundy} 100%)`,
              transform: 'translateY(-2px)',
              boxShadow: `0 8px 25px ${colors.borgundy}40`,
            },
            borderRadius: 2,
            fontWeight: 'bold',
          }}
        >
          Nuevo Proyecto
        </Button>
      </Box>

      {/*  DIÁLOGO CON EFECTO GLASS */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: theme.palette.mode === 'dark'
              ? `linear-gradient(135deg, ${alpha(colors.sapphire, 0.15)} 0%, ${alpha(colors.borgundy, 0.1)} 100%)`
              : `linear-gradient(135deg, ${colors.swanWhite} 0%, ${colors.shellstone}20 100%)`,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
          }
        }}
      >
        <DialogTitle sx={{ color: colors.borgundy, fontWeight: 600 }}>
          {editingProject ? 'Editar Proyecto' : 'Nuevo Proyecto'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Número de Proyecto"
                  fullWidth
                  value={form.projectNumber}
                  onChange={(e) => setForm({ ...form, projectNumber: e.target.value.toUpperCase() })}
                  required
                  margin="normal"
                  error={!!errors.projectNumber}
                  helperText={errors.projectNumber}
                  placeholder="Ej: PROY2024A"
                  inputProps={{ 
                    pattern: "[a-zA-Z0-9]*",
                    style: { textTransform: 'uppercase' }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Centro de Costo"
                  fullWidth
                  value={form.costCenter}
                  onChange={(e) => setForm({ ...form, costCenter: e.target.value })}
                  required
                  margin="normal"
                  error={!!errors.costCenter}
                  helperText={errors.costCenter}
                  placeholder="Ej: 123456"
                  inputProps={{ 
                    pattern: "[0-9]*",
                    inputMode: "numeric"
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Descripción"
                  fullWidth
                  multiline
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  margin="normal"
                  placeholder="Descripción detallada del proyecto..."
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Presupuesto (CUP) *"
                  type="number"
                  fullWidth
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                  required
                  margin="normal"
                  error={!!errors.budget}
                  helperText={errors.budget}
                  InputProps={{
                    startAdornment: <span style={{ marginRight: 4, color: colors.sapphire }}>$</span>,
                  }}
                />
              </Grid>
              
              {/* Selector de usuario (solo para admin/comercial) */}
              {['admin', 'comercial'].includes(currentUser?.role) && (
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal" error={!!errors.ownerId}>
                    <InputLabel>Jefe de Proyecto *</InputLabel>
                    <Select
                      value={form.ownerId}
                      onChange={(e) => setForm({ ...form, ownerId: e.target.value })}
                      label="Jefe de Proyecto *"
                    >
                      <MenuItem value="">Seleccionar usuario</MenuItem>
                      {availableUsers.map(user => (
                        <MenuItem key={user.id} value={user.id}>
                          {user.fullName} - {user.area}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{errors.ownerId}</FormHelperText>
                  </FormControl>
                </Grid>
              )}

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal" error={!!errors.areaType} size="small">
                  <InputLabel>Tipo de Área *</InputLabel>
                  <Select
                    value={form.areaType}
                    onChange={(e) => setForm({ ...form, areaType: e.target.value, area: '' })}
                    label="Tipo de Área *"
                  >
                    <MenuItem value="">Seleccionar tipo</MenuItem>
                    <MenuItem value="facultad">Facultad</MenuItem>
                    <MenuItem value="direccion">Dirección</MenuItem>
                    <MenuItem value="area">Área</MenuItem>
                    <MenuItem value="departamento">Departamento</MenuItem>
                    <MenuItem value="oficina">Oficina</MenuItem>
                  </Select>
                  <FormHelperText>{errors.areaType}</FormHelperText>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal" error={!!errors.area} size="small">
                  <InputLabel>Área *</InputLabel>
                  <Select
                    value={form.area}
                    onChange={(e) => setForm({ ...form, area: e.target.value })}
                    label="Área *"
                    disabled={!form.areaType}
                  >
                    <MenuItem value="">Seleccionar área</MenuItem>
                    {form.areaType === 'facultad' && ['Artes y Letras', 'Biología', 'Colegio Universitario San Gerónimo de La Habana', 'Comunicación', 'Contabilidad y Finanzas', 'Derecho', 'Economía', 'Facultad de Educación a Distancia', 'Facultad de Español para No Hispanohablantes', 'Farmacia y Alimentos', 'Filosofía e Historia', 'Física', 'Geografía', 'Instituto Superior de Diseño', 'Instituto Superior de Tecnologías y Ciencias Aplicadas', 'Lenguas Extranjeras', 'Matemática y Computación', 'Psicología', 'Química', 'Turismo'].map(a => (
                      <MenuItem key={a} value={a}>{a}</MenuItem>
                    ))}
                    {form.areaType === 'direccion' && ['VRTD', 'DST', 'MC', 'Rectorado'].map(a => (
                      <MenuItem key={a} value={a}>{a}</MenuItem>
                    ))}
                    {form.areaType === 'area' && ['Comunicación', 'Artes y Letras', 'Jurídica', 'Técnica'].map(a => (
                      <MenuItem key={a} value={a}>{a}</MenuItem>
                    ))}
                    {form.areaType === 'departamento' && ['Desarrollo', 'Soporte', 'Infraestructura', 'Gestión'].map(a => (
                      <MenuItem key={a} value={a}>{a}</MenuItem>
                    ))}
                    {form.areaType === 'oficina' && ['Oficina Principal', 'Oficina Regional', 'Oficina Técnica'].map(a => (
                      <MenuItem key={a} value={a}>{a}</MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{errors.area}</FormHelperText>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Fecha de Finalización *"
                  type="date"
                  fullWidth
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.endDate}
                  helperText={errors.endDate}
                  inputProps={{
                    min: new Date().toISOString().split('T')[0]
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    label="Estado"
                  >
                    <MenuItem value="active">Activo</MenuItem>
                    <MenuItem value="paused">En pausa</MenuItem>
                    <MenuItem value="completed">Completado</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button
            onClick={handleSaveProject}
            variant="contained"
            disabled={loading}
            sx={{ 
              background: `linear-gradient(135deg, ${colors.borgundy} 0%, ${colors.sapphire} 100%)`,
              '&:hover': { 
                background: `linear-gradient(135deg, ${colors.sapphire} 0%, ${colors.borgundy} 100%)`,
              },
              fontWeight: 'bold',
            }}
          >
            {loading && <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} />}
            {editingProject ? 'Actualizar' : 'Crear'} Proyecto
          </Button>
        </DialogActions>
      </Dialog>

      <Divider sx={{ my: 4 }} />

      <Typography variant="body2" color="text.secondary" align="center">
        Sistema SiPP • Mostrando {filteredProjects.length} proyectos • Centro de Costo es la llave principal
      </Typography>
    </Box>
  );
};

export default Proyectos;