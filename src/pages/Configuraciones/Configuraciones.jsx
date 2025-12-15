// src/pages/Configuraciones/Configuraciones.jsx
import React, { useState, useEffect, useCallback } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon, PhotoCamera as PhotoCameraIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

const Configuraciones = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { currentUser, updateUser } = useAuth();
  const { addNotification } = useNotifications();

  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    areaType: '',
    area: '',
    avatar: '',
    mobile: '',
    phone: '',
  });
  const [managedProjects, setManagedProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Cargar datos iniciales del usuario desde localStorage
  useEffect(() => {
    if (currentUser) {
      //  CORREGIDO: Usar la clave correcta 'SiPP_users'
      const users = JSON.parse(localStorage.getItem('SiPP_users') || '[]');
      const updatedUser = users.find(u => u.id === currentUser.id) || currentUser;
      
      setProfile({
        fullName: updatedUser.fullName || '',
        email: updatedUser.email || '',
        areaType: updatedUser.areaType || '',
        area: updatedUser.area || '',
        avatar: updatedUser.avatar || '/src/assets/images/users/3d-user-icon.jpg',
        mobile: updatedUser.mobile || '',
        phone: updatedUser.phone || '',
      });

      // Cargar proyectos que el usuario gestiona
      loadManagedProjects(updatedUser.id);
    }
  }, [currentUser]);

  // Cargar proyectos que el usuario gestiona - VERSIÓN CORREGIDA
  const loadManagedProjects = useCallback((userId) => {
    try {
      console.log('🔍 Buscando proyectos para usuario:', userId);
      
      //  CORREGIDO: Buscar en todos los proyectos usando la clave correcta
      const allProjects = [];
      
      // Buscar en todos los usuarios para encontrar sus proyectos
      const allUsers = JSON.parse(localStorage.getItem('SiPP_users') || '[]');
      console.log('👥 Usuarios encontrados:', allUsers.length);
      
      allUsers.forEach(user => {
        const userProjectsKey = `SiPP_projects_${user.id}`;
        const userProjects = JSON.parse(localStorage.getItem(userProjectsKey) || '[]');
        console.log(`📂 Proyectos de ${user.fullName}:`, userProjects.length);
        allProjects.push(...userProjects);
      });

      console.log('📊 Total de proyectos en el sistema:', allProjects.length);

      //  CORREGIDO: Filtrar proyectos donde el usuario actual es el propietario
      const userManagedProjects = allProjects.filter(project => {
        const isOwner = project.ownerId === userId;
        if (isOwner) {
          console.log(` Proyecto asignado: ${project.name} para usuario ${userId}`);
        }
        return isOwner;
      });

      console.log('🎯 Proyectos gestionados por el usuario:', userManagedProjects.length);
      setManagedProjects(userManagedProjects);
    } catch (error) {
      console.error('❌ Error cargando proyectos gestionados:', error);
    }
  }, []);

  // Manejar cambios en el perfil
  const handleProfileChange = useCallback((e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  }, []);

  const validateProfile = useCallback(() => {
    const newErrors = {};
    if (!profile.fullName.trim()) newErrors.fullName = 'Nombre es requerido';
    if (!profile.email.trim()) newErrors.email = 'Correo es requerido';
    if (!profile.areaType) newErrors.areaType = 'Tipo de área es requerido';
    if (!profile.area) newErrors.area = 'Área es requerida';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [profile]);

  const handleSaveProfile = useCallback(async () => {
    if (!validateProfile()) return;

    setLoading(true);
    try {
      const updatedUser = {
        ...currentUser,
        fullName: profile.fullName,
        email: profile.email,
        areaType: profile.areaType,
        area: profile.area,
        mobile: profile.mobile,
        phone: profile.phone,
        avatar: profile.avatar,
        updatedAt: new Date().toISOString()
      };

      //  CORREGIDO: Actualizar en localStorage con clave correcta
      const users = JSON.parse(localStorage.getItem('SiPP_users') || '[]');
      const updatedUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
      localStorage.setItem('SiPP_users', JSON.stringify(updatedUsers));
      localStorage.setItem('SiPP_user', JSON.stringify(updatedUser));

      updateUser(updatedUser);
      addNotification({ title: 'Perfil actualizado', message: 'Tus datos han sido guardados', type: 'success' });
      showSnackbar('Perfil actualizado correctamente', 'success');
    } catch (error) {
      showSnackbar('Error al guardar el perfil', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentUser, profile, validateProfile, updateUser, addNotification]);

  // Función para manejar cambio de tipo de área
  const handleAreaTypeChange = useCallback((e) => {
    const newAreaType = e.target.value;
    setProfile(prev => ({ 
      ...prev, 
      areaType: newAreaType,
      area: '' 
    }));
  }, []);

  // Función para manejar cambio de área
  const handleAreaChange = useCallback((e) => {
    setProfile(prev => ({ ...prev, area: e.target.value }));
  }, []);

  // Subir avatar
  const handleAvatarChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showSnackbar('La imagen debe ser menor a 2MB', 'error');
        return;
      }
      if (!file.type.match(/image\/(jpeg|jpg|png|gif)/)) {
        showSnackbar('Solo se permiten imágenes', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setProfile((prev) => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Snackbar
  const showSnackbar = useCallback((message, severity) => {
    setSnackbar({ open: true, message, severity });
    setTimeout(() => setSnackbar(prev => ({ ...prev, open: false })), 4000);
  }, []);

  return (
    <Box sx={{ p: isMobile ? 2 : 4, position: 'relative' }}>
      {/* Avatar flotante en esquina superior derecha */}
      <Box 
        sx={{ 
          position: 'absolute',
          top: isMobile ? 16 : 24,
          right: isMobile ? 16 : 24,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: 3,
          p: 1.5,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          border: `1px solid ${theme.palette.divider}`,
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
            transform: 'translateY(-2px)'
          }
        }}
      >
        <Avatar
          src={profile.avatar}
          alt="Foto de perfil"
          sx={{ 
            width: 56, 
            height: 56, 
            border: `3px solid ${theme.palette.primary.main}`,
            backgroundColor: theme.palette.background.paper,
            cursor: 'pointer',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              transform: 'scale(1.05)',
              borderColor: theme.palette.primary.dark
            }
          }}
          onError={(e) => {
            e.target.src = '/src/assets/images/users/3d-user-icon.jpg';
          }}
        />
        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
          <Typography variant="subtitle2" fontWeight="bold" noWrap>
            {currentUser?.fullName}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {currentUser?.area || 'Usuario'}
          </Typography>
        </Box>
      </Box>

      <Typography variant="h4" gutterBottom fontWeight="bold" color="#4E0101" sx={{ mt: 1 }}>
        Perfil de Usuario
      </Typography>

      <Grid container spacing={4}>
        {/* Columna izquierda - Información Personal y Proyectos */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Información Personal</Typography>
                <Tooltip title="Recargar datos">
                  <IconButton onClick={() => {
                    //  CORREGIDO: Usar clave correcta
                    const users = JSON.parse(localStorage.getItem('SiPP_users') || '[]');
                    const updatedUser = users.find(u => u.id === currentUser.id) || currentUser;
                    
                    setProfile({
                      fullName: updatedUser.fullName || '',
                      email: updatedUser.email || '',
                      areaType: updatedUser.areaType || '',
                      area: updatedUser.area || '',
                      avatar: updatedUser.avatar || '/src/assets/images/users/3d-user-icon.jpg',
                      mobile: updatedUser.mobile || '',
                      phone: updatedUser.phone || '',
                    });
                    loadManagedProjects(updatedUser.id);
                  }}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              
              {/* Sección de Avatar */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, p: 2, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
                <Box sx={{ position: 'relative', display: 'inline-block', mr: 3 }}>
                  <Avatar
                    src={profile.avatar}
                    alt="Foto de perfil"
                    sx={{ 
                      width: 100, 
                      height: 100, 
                      border: `4px solid ${theme.palette.primary.main}`,
                      backgroundColor: '#f5f5f5'
                    }}
                    onError={(e) => {
                      e.target.src = '/src/assets/images/users/3d-user-icon.jpg';
                    }}
                  />
                  <input 
                    accept="image/*" 
                    style={{ display: 'none' }} 
                    id="avatar-upload" 
                    type="file" 
                    onChange={handleAvatarChange} 
                  />
                  <label htmlFor="avatar-upload">
                    <IconButton 
                      component="span" 
                      sx={{ 
                        position: 'absolute', 
                        bottom: 0, 
                        right: 0,
                        backgroundColor: theme.palette.primary.main,
                        '&:hover': { backgroundColor: theme.palette.primary.dark },
                        color: 'white',
                        width: 32,
                        height: 32
                      }}
                    >
                      <PhotoCameraIcon fontSize="small" />
                    </IconButton>
                  </label>
                </Box>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {currentUser?.fullName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {currentUser?.email}
                  </Typography>
                  <Chip 
                    label={currentUser?.area || 'Sin área asignada'} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                  />
                </Box>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Nombre Completo"
                    name="fullName"
                    fullWidth
                    value={profile.fullName}
                    onChange={handleProfileChange}
                    required
                    margin="normal"
                    error={!!errors.fullName}
                    helperText={errors.fullName}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Correo Electrónico"
                    name="email"
                    type="email"
                    fullWidth
                    value={profile.email}
                    onChange={handleProfileChange}
                    required
                    margin="normal"
                    error={!!errors.email}
                    helperText={errors.email}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal" error={!!errors.areaType} size="small">
                    <InputLabel>Tipo de Área</InputLabel>
                    <Select
                      value={profile.areaType}
                      onChange={handleAreaTypeChange}
                      label="Tipo de Área"
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
                    <InputLabel>Área</InputLabel>
                    <Select
                      value={profile.area}
                      onChange={handleAreaChange}
                      label="Área"
                      disabled={!profile.areaType}
                    >
                      <MenuItem value="">Seleccionar área</MenuItem>
                      {profile.areaType === 'facultad' && ['Facultad 1', 'Facultad 2', 'Facultad 3', 'Facultad 4'].map(a => (
                        <MenuItem key={a} value={a}>{a}</MenuItem>
                      ))}
                      {profile.areaType === 'direccion' && ['DST', 'VRTD', 'MC', 'Rectorado'].map(a => (
                        <MenuItem key={a} value={a}>{a}</MenuItem>
                      ))}
                      {profile.areaType === 'area' && ['Comunicación', 'Letras', 'Jurídica', 'Técnica'].map(a => (
                        <MenuItem key={a} value={a}>{a}</MenuItem>
                      ))}
                      {profile.areaType === 'departamento' && ['Desarrollo', 'Soporte', 'Infraestructura', 'Gestión'].map(a => (
                        <MenuItem key={a} value={a}>{a}</MenuItem>
                      ))}
                      {profile.areaType === 'oficina' && ['Oficina Principal', 'Oficina Regional', 'Oficina Técnica'].map(a => (
                        <MenuItem key={a} value={a}>{a}</MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{errors.area}</FormHelperText>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Teléfono Móvil"
                    name="mobile"
                    fullWidth
                    value={profile.mobile}
                    onChange={handleProfileChange}
                    margin="normal"
                    type="tel"
                    size="small"
                    placeholder="+53 5XXXXXXX"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Teléfono Fijo"
                    name="phone"
                    fullWidth
                    value={profile.phone}
                    onChange={handleProfileChange}
                    margin="normal"
                    type="tel"
                    size="small"
                    placeholder="7XXXXXXX"
                  />
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleSaveProfile}
                  startIcon={<SaveIcon />}
                  disabled={loading}
                  sx={{ 
                    backgroundColor: '#4E0101', 
                    '&:hover': { backgroundColor: '#6E0101' }, 
                    minWidth: 120 
                  }}
                >
                  {loading && <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} />}
                  Guardar Cambios
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setProfile({
                      fullName: currentUser.fullName || '',
                      email: currentUser.email || '',
                      areaType: currentUser.areaType || '',
                      area: currentUser.area || '',
                      avatar: currentUser.avatar || '/src/assets/images/users/3d-user-icon.jpg',
                      mobile: currentUser.mobile || '',
                      phone: currentUser.phone || '',
                    });
                  }}
                >
                  Cancelar
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Sección de Proyectos Gestionados */}
          <Card sx={{ mt: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Proyectos que Gestiono
              </Typography>
              
              {managedProjects.length === 0 ? (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No tienes proyectos asignados para gestionar. Los administradores y comerciales asignarán proyectos en la sección de Proyectos.
                </Typography>
              ) : (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Estos son los proyectos que tienes asignados como jefe de proyecto. Puedes utilizarlos para realizar pedidos.
                  </Typography>
                  
                  {/* Tabla estilo Excel moderna */}
                  <TableContainer component={Paper} sx={{ mt: 2, border: `1px solid ${theme.palette.divider}` }}>
                    <Table size="small">
                      <TableHead sx={{ backgroundColor: theme.palette.primary.main }}>
                        <TableRow>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nombre del Proyecto</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Área</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Presupuesto (CUP)</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fecha Final</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {managedProjects.map((project) => (
                          <TableRow 
                            key={project.id}
                            sx={{ 
                              '&:hover': { backgroundColor: theme.palette.action.hover },
                              '&:last-child td, &:last-child th': { border: 0 }
                            }}
                          >
                            <TableCell component="th" scope="row">
                              <Typography variant="body2" fontWeight="medium">
                                {project.name}
                              </Typography>
                              {project.description && (
                                <Typography variant="caption" color="text.secondary">
                                  {project.description.length > 50 
                                    ? `${project.description.substring(0, 50)}...` 
                                    : project.description}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={project.area || 'N/A'} 
                                size="small" 
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight="bold" color="#4E0101">
                                ${(project.budget || 0).toLocaleString()}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={project.status === 'active' ? 'Activo' : project.status === 'paused' ? 'En pausa' : 'Completado'}
                                size="small"
                                color={project.status === 'active' ? 'success' : project.status === 'paused' ? 'warning' : 'default'}
                                variant="filled"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Snackbar */}
      {snackbar.open && (
        <Alert
          severity={snackbar.severity}
          sx={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 9999,
            minWidth: 250,
          }}
        >
          {snackbar.message}
        </Alert>
      )}
    </Box>
  );
};

export default Configuraciones;