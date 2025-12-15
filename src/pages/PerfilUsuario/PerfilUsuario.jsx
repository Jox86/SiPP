// src/pages/PerfilUsuario/PerfilUsuario.jsx
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  IconButton,
  Divider,
  Alert,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Tooltip,
  FormHelperText,
  Chip,
  Paper,
  Stack,
  LinearProgress,
} from '@mui/material';
import { 
  Refresh as RefreshIcon, 
  Add as AddIcon,
  Assignment as AssignmentIcon,
  ShoppingCart as ShoppingCartIcon,
  Message as MessageIcon,
  AttachMoney as AttachMoneyIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

const PerfilUsuario = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { currentUser, updateUser } = useAuth();
  const { addNotification } = useNotifications();

  const [userData, setUserData] = useState(null);  

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Nuevos estados para datos reales
  const [userProjects, setUserProjects] = useState([]);
  const [userOrders, setUserOrders] = useState([]);
  const [userMessages, setUserMessages] = useState([]);
  const [userStats, setUserStats] = useState({
    totalProjects: 0,
    totalOrders: 0,
    totalMessages: 0,
    totalBudget: 0,
    spentBudget: 0,
    remainingBudget: 0
  });

  // Nueva paleta de colores
  const colors = {
    borgundy: '#4E0101',
    tan: '#d2b48c',
    sapphire: '#667080',
    swanWhite: '#F5F0E9',
    shellstone: '#D9CBC2',
  };

  // === FUNCIONES PARA CARGAR DATOS REALES ===

// Cargar datos del usuario desde localStorage
const loadUserData = useCallback(() => {
  if (!currentUser) return;

  try {
    // Obtener datos actualizados del usuario desde localStorage
    const users = JSON.parse(localStorage.getItem('SiPP_users') || '[]');
    const updatedUser = users.find(u => u.id === currentUser.id) || currentUser;
    
    // Solo establecer los datos, sin estado de edición
    setUserData(updatedUser);

    // Cargar proyectos del usuario
    loadUserProjects(currentUser.id);
    
    // Cargar pedidos del usuario
    loadUserOrders(currentUser.id);
    
    // Cargar mensajes del usuario
    loadUserMessages(currentUser.id);

  } catch (error) {
    console.error('Error al cargar datos del usuario:', error);
  }
}, [currentUser]);

  // Cargar proyectos del usuario
  const loadUserProjects = useCallback((userId) => {
    try {
      const projects = JSON.parse(localStorage.getItem(`SiPP_projects_${userId}`) || '[]');
      setUserProjects(projects);
      
      // Calcular presupuesto total
      const totalBudget = projects.reduce((sum, project) => 
        sum + (parseFloat(project.budget) || 0), 0
      );
      
      setUserStats(prev => ({
        ...prev,
        totalProjects: projects.length,
        totalBudget: totalBudget
      }));
    } catch (error) {
      console.error('Error al cargar proyectos del usuario:', error);
      setUserProjects([]);
    }
  }, []);

  // Cargar pedidos del usuario
  const loadUserOrders = useCallback((userId) => {
    try {
      const purchases = JSON.parse(localStorage.getItem('OASiS_purchases') || '[]');
      const specialOrders = JSON.parse(localStorage.getItem('OASiS_special_orders') || '[]');
      
      // Filtrar pedidos del usuario
      const userPurchases = purchases.filter(p => p.userId === userId);
      const userSpecialOrders = specialOrders.filter(o => o.userId === userId);
      const allUserOrders = [...userPurchases, ...userSpecialOrders];
      
      setUserOrders(allUserOrders);
      
      // Calcular gastos
      const spentBudget = allUserOrders.reduce((sum, order) => 
        sum + (parseFloat(order.total) || 0), 0
      );
      
      setUserStats(prev => ({
        ...prev,
        totalOrders: allUserOrders.length,
        spentBudget: spentBudget,
        remainingBudget: prev.totalBudget - spentBudget
      }));
    } catch (error) {
      console.error('Error al cargar pedidos del usuario:', error);
      setUserOrders([]);
    }
  }, []);

  // Cargar mensajes del usuario
  const loadUserMessages = useCallback((userId) => {
    try {
      const messages = JSON.parse(localStorage.getItem('SiPP_messages') || '[]');
      const userMessages = messages.filter(m => m.userId === userId);
      setUserMessages(userMessages);
      
      setUserStats(prev => ({
        ...prev,
        totalMessages: userMessages.length
      }));
    } catch (error) {
      console.error('Error al cargar mensajes del usuario:', error);
      setUserMessages([]);
    }
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // === MANEJO DEL PERFIL ===

  // Función para crear nuevo proyecto
  const handleCreateNewProject = useCallback(() => {
    window.location.href = '/proyectos?action=create';
  }, []);

  // Calcular estadísticas de proyectos
  const projectStats = useMemo(() => {
    const total = userProjects.length;
    const active = userProjects.filter(p => p.status === 'active').length;
    const completed = userProjects.filter(p => p.status === 'completed').length;
    const totalBudget = userProjects.reduce((sum, p) => sum + (parseFloat(p.budget) || 0), 0);
    
    return { total, active, completed, totalBudget };
  }, [userProjects]);

  // Detectar si es admin o comercial
  const isAdminOrCommercial = ['admin', 'comercial'].includes(currentUser?.role);


// Cargar datos iniciales
useEffect(() => {
  if (currentUser) {
    loadUserData();
  }
}, [currentUser, loadUserData]);

  return (
    <Box sx={{ p: isMobile ? 2 : 4, position: 'relative', marginTop: isMobile ? '10%' : 3 }}>
      <Typography 
        variant="h4" 
        gutterBottom 
        fontWeight="bold" 
        sx={{ 
          mt: 1, 
          mb: 4,
          color: colors.borgundy,
          background: `linear-gradient(135deg, ${colors.borgundy} 0%, ${colors.sapphire} 100%)`,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Perfil de Usuario
      </Typography>

      <Grid container spacing={4}>
        {/* Columna izquierda - Información personal */}
        <Grid item xs={12} md={8}>
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: 3,
            background: `linear-gradient(135deg, ${colors.swanWhite} 0%, ${colors.shellstone}20 100%)`,
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ color: colors.borgundy, fontWeight: 600 }}>
                  Información Personal
                </Typography>
                <Tooltip title="Recargar datos">
                  <IconButton 
                    onClick={loadUserData}
                    sx={{ color: colors.sapphire }}
                  >
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              
              {/* Sección de Avatar - SOLO LECTURA */}
              <Box sx={{ 
  display: 'flex', 
  alignItems: 'center', 
  mb: 4, 
  p: 2, 
  backgroundColor: alpha(colors.tan, 0.1), 
  borderRadius: 2 
}}>
  <Box sx={{ position: 'relative', display: 'inline-block', mr: 3 }}>
    <Avatar
      sx={{ 
        width: 100, 
        height: 100, 
        backgroundColor: colors.borgundy,
        color: colors.swanWhite,
        fontWeight: 'bold',
        fontSize: '2.5rem',
        border: `4px solid ${colors.tan}`,
      }}
    >
      {userData?.fullName ? userData.fullName.charAt(0).toUpperCase() : 'U'}
    </Avatar>
    {/* ELIMINAR completamente el input y botón de subir foto */}
  </Box>
  <Box>
    <Typography variant="h6" gutterBottom sx={{ color: colors.borgundy }}>
      {userData?.fullName || 'Nombre no disponible'}
    </Typography>
    <Typography variant="body2" color="text.secondary" gutterBottom>
      {userData?.email || 'Email no disponible'}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {userData?.role === 'admin' ? 'Administrador' : 
       userData?.role === 'comercial' ? 'Usuario Comercial' : 'Jefe de Proyecto'}
    </Typography>
  </Box>
</Box>

              {/* Campos de solo lectura */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Nombre Completo"
                    value={userData?.fullName || ''}
                    fullWidth
                    margin="normal"
                    size="small"
                    InputProps={{
                      readOnly: true,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: alpha(colors.shellstone, 0.1),
                        '& fieldset': {
                          borderColor: alpha(colors.sapphire, 0.3),
                        },
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Correo Electrónico"
                    value={userData?.email || ''}
                    fullWidth
                    margin="normal"
                    size="small"
                    InputProps={{
                      readOnly: true,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: alpha(colors.shellstone, 0.1),
                        '& fieldset': {
                          borderColor: alpha(colors.sapphire, 0.3),
                        },
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Tipo de Área"
                    value={userData?.areaType || 'No especificado'}
                    fullWidth
                    margin="normal"
                    size="small"
                    InputProps={{
                      readOnly: true,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: alpha(colors.shellstone, 0.1),
                        '& fieldset': {
                          borderColor: alpha(colors.sapphire, 0.3),
                        },
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Área"
                    value={userData?.area || 'No especificada'}
                    fullWidth
                    margin="normal"
                    size="small"
                    InputProps={{
                      readOnly: true,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: alpha(colors.shellstone, 0.1),
                        '& fieldset': {
                          borderColor: alpha(colors.sapphire, 0.3),
                        },
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Teléfono Móvil"
                    value={userData?.mobile || 'No especificado'}
                    fullWidth
                    margin="normal"
                    size="small"
                    InputProps={{
                      readOnly: true,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: alpha(colors.shellstone, 0.1),
                        '& fieldset': {
                          borderColor: alpha(colors.sapphire, 0.3),
                        },
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Teléfono Fijo"
                    value={userData?.phone || 'No especificado'}
                    fullWidth
                    margin="normal"
                    size="small"
                    InputProps={{
                      readOnly: true,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: alpha(colors.shellstone, 0.1),
                        '& fieldset': {
                          borderColor: alpha(colors.sapphire, 0.3),
                        },
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

        <Grid container spacing={4}>
          {/* Información del Sistema y Presupuesto */}
          <Grid item xs={12} md={4}>
            {/* Contenedor interno para las tarjetas lado a lado */}
            <Grid container spacing={2}>
              {/* Información del Sistema */}
              <Grid item xs={12}>
                <Card sx={{ 
                  mt: 4,
                  borderRadius: 3, 
                  boxShadow: 3,
                  background: `linear-gradient(135deg, ${colors.swanWhite} 0%, ${colors.shellstone}20 100%)`,
                  width: 800,
                }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: colors.borgundy, fontWeight: 600, mb: 2 }}>
                      Información del Sistema
                    </Typography>
                    
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Rol:</Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {userData?.role === 'admin' ? 'Administrador' : 
                          userData?.role === 'comercial' ? 'Comercial' : 'Jefe de Proyecto'}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Usuario desde:</Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Última actualización:</Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {userData?.updatedAt ? new Date(userData.updatedAt).toLocaleDateString() : 'N/A'}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* Tarjeta de Presupuesto - SOLO para usuarios comunes */}
              {!isAdminOrCommercial && (
                <Grid item xs={12}>
                  <Card sx={{ 
                    mt: 4,
                    borderRadius: 3, 
                    boxShadow: 3,
                    background: `linear-gradient(135deg, ${colors.swanWhite} 0%, ${colors.shellstone}20 100%)`,
                    width: 300,
                  }}>
                      <Paper sx={{ 
                        p: 1, 
                        textAlign: 'center',
                        backgroundColor: alpha('#4caf50', 0.1),
                        border: `1px solid ${alpha('#4caf50', 0.2)}`,
                        borderRadius: 2
                      }}>
                        <AttachMoneyIcon sx={{ fontSize: 40, color: '#4caf50', mb: 1 }} />
                        <Typography variant="h6" fontWeight="bold" color="#4caf50">
                          ${userStats.remainingBudget.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Presupuesto Restante
                        </Typography>
                        
                        {/* Barra de progreso CORREGIDA - Verde para gastado, Tan para restante */}
                        <LinearProgress 
                          variant="determinate" 
                          value={
                            userStats.totalBudget > 0 
                              ? Math.max((userStats.spentBudget / userStats.totalBudget) * 100, 1) // Mínimo 1% para que sea visible
                              : 0
                          }
                          sx={{ 
                            mt: 1,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: alpha(colors.tan, 0.3),
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: '#4caf50',
                              borderRadius: 4,
                              transition: 'all 0.3s ease'
                            }
                          }}
                        />

                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          Gastado: ${userStats.spentBudget.toLocaleString()} / ${userStats.totalBudget.toLocaleString()}
                        </Typography>
                      </Paper>
                  </Card>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>

          {/* Sección de Proyectos del Usuario - SOLO para usuarios comunes */}
          {!isAdminOrCommercial && (
            <Card sx={{ 
              mt: 4, 
              borderRadius: 3, 
              boxShadow: 3,
              background: `linear-gradient(135deg, ${colors.swanWhite} 0%, ${colors.shellstone}20 100%)`,
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ color: colors.borgundy, fontWeight: 600 }}>
                    Mis Proyectos
                  </Typography>
                </Box>

                {/* Estadísticas de proyectos */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                  <Chip 
                    label={`Total: ${projectStats.total}`} 
                    sx={{ 
                      backgroundColor: colors.borgundy, 
                      color: 'white',
                      fontWeight: 600
                    }}
                  />
                  <Chip 
                    label={`Activos: ${projectStats.active}`} 
                    sx={{ 
                      backgroundColor: '#4caf50', 
                      color: 'white',
                      fontWeight: 600
                    }}
                  />
                  <Chip 
                    label={`Completados: ${projectStats.completed}`} 
                    sx={{ 
                      backgroundColor: colors.sapphire, 
                      color: 'white',
                      fontWeight: 600
                    }}
                  />
                  <Chip 
                    label={`Presupuesto: $${projectStats.totalBudget.toLocaleString()}`} 
                    sx={{ 
                      backgroundColor: colors.tan, 
                      color: 'white',
                      fontWeight: 600
                    }}
                  />
                </Box>

                {userProjects.length === 0 ? (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    No tienes proyectos asignados. 
                  </Alert>
                ) : (
                  <Stack spacing={2}>
                    {userProjects.slice(0, 5).map((project) => (
                      <Paper 
                        key={project.id} 
                        sx={{ 
                          p: 2, 
                          border: '2px solid',
                          borderColor: alpha(colors.borgundy, 0.1),
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            borderColor: colors.borgundy,
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ color: colors.borgundy }}>
                              {project.costCenter} - {project.projectNumber}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {project.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {project.area} • ${project.budget?.toLocaleString()} CUP
                            </Typography>
                          </Box>
                          <Chip
                            label={project.status === 'active' ? 'Activo' : project.status === 'completed' ? 'Completado' : 'En pausa'}
                            size="small"
                            sx={{
                              backgroundColor: 
                                project.status === 'active' ? '#4caf50' : 
                                project.status === 'completed' ? colors.sapphire : colors.tan,
                              color: 'white',
                              fontWeight: 600
                            }}
                          />
                        </Box>
                        {project.description && (
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            {project.description.length > 100 
                              ? `${project.description.substring(0, 100)}...` 
                              : project.description}
                          </Typography>
                        )}
                      </Paper>
                    ))}
                    {userProjects.length > 5 && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
                        Y {userProjects.length - 5} proyectos más...
                      </Typography>
                    )}
                  </Stack>
                )}
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

// Función alpha para transparencias
const alpha = (color, opacity) => {
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
};

export default PerfilUsuario;