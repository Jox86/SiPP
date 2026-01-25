// src/pages/Usuarios/Usuarios.jsx
import React, { useState, useEffect, useMemo } from 'react';
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
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  useMediaQuery,
  useTheme,
  Alert,
  IconButton,
  InputLabel,
  Tooltip,
  Button,
  Grid,
  Avatar,
  MenuItem,
  Select,
  FormControl,
  alpha
} from '@mui/material';
import { Search as SearchIcon, Edit as EditIcon, Delete as DeleteIcon, PictureAsPdf as PdfIcon, GridOn as ExcelIcon } from '@mui/icons-material';

import { useAuth } from '../../context/AuthContext';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const Usuarios = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const { currentUser } = useAuth();

  // Nueva paleta de colores
  const colors = {
    borgundy: '#4E0101',
    tan: '#d2b48c',
    sapphire: '#667080',
    swanWhite: '#F5F0E9',
    shellstone: '#D9CBC2',
    background: '#F5F0E9',
    paper: '#FFFFFF',
  };

  // Estados
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    area: '',
    role: ''
  });

  // Cargar usuarios desde localStorage
  const loadClients = () => {
    try {
      const saved = localStorage.getItem('SiPP_users');
      const users = saved ? JSON.parse(saved) : [];
      
      //  CORRECCIÓN: Filtrar SOLO usuarios con rol 'user' (roles comunes)
      const validClients = users
        .filter((u) => u && typeof u === 'object')
        .filter((u) => u.role === 'user') //  SOLO usuarios con rol 'user'
        .map((u) => ({
          id: u.id,
          fullName: u.fullName || 'Sin nombre',
          email: u.email || 'sin-correo@sipp.uh.cu',
          area: u.area || 'Sin área',
          role: u.role || 'user',
          createdAt: u.createdAt || new Date().toISOString(),
          avatar: u.avatar || '/assets/images/avatar-default.png',
        }));
      
      console.log('👥 Usuarios cargados (solo roles comunes):', validClients.length);
      setClients(validClients);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar al inicio y escuchar cambios
  useEffect(() => {
    loadClients();

    const handleStorageChange = () => {
      loadClients(); // Recargar si hay cambios (registro, actualización)
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Añadir esta función en Usuarios.jsx
const createTestProjectForUser = (userId, userName) => {
  try {
    const testProject = {
      id: `proj_${Date.now()}`,
      costCenter: '123456',
      projectNumber: 'TEST2024',
      name: 'Proyecto de Prueba',
      description: 'Proyecto asignado automáticamente para pruebas del sistema',
      budget: 100000,
      areaType: 'facultad',
      area: 'Matemática y Computación',
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 días desde hoy
      status: 'active',
      ownerId: userId,
      ownerName: userName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const userProjectsKey = `SiPP_projects_${userId}`;
    const existingProjects = JSON.parse(localStorage.getItem(userProjectsKey) || '[]');
    const updatedProjects = [...existingProjects, testProject];
    localStorage.setItem(userProjectsKey, JSON.stringify(updatedProjects));

    console.log(`Proyecto de prueba creado para usuario ${userName}`);
  } catch (error) {
    console.error('Error al crear proyecto de prueba:', error);
  }
};

// Llamar esta función al crear o cargar usuarios

  // Función para eliminar usuario
  const handleDeleteUser = (userId) => {
    if (window.confirm('¿Está seguro de que desea eliminar este usuario?')) {
      try {
        const saved = localStorage.getItem('SiPP_users');
        const users = saved ? JSON.parse(saved) : [];
        const updatedUsers = users.filter(user => user.id !== userId);
        localStorage.setItem('SiPP_users', JSON.stringify(updatedUsers));
        loadClients(); // Recargar la lista
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
        alert('Error al eliminar el usuario');
      }
    }
  };

  // Filtrar usuarios
  const filteredClients = useMemo(() => {
    return clients.filter((c) =>
      c.fullName.toLowerCase().includes(filter.toLowerCase()) ||
      c.email.toLowerCase().includes(filter.toLowerCase()) ||
      c.area.toLowerCase().includes(filter.toLowerCase()) ||
      c.role.toLowerCase().includes(filter.toLowerCase())
    );
  }, [clients, filter]);

  // Paginación
  const paginatedClients = useMemo(() => {
    return filteredClients.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredClients, page, rowsPerPage]);

  // Manejo de paginación
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

// Exportar a Excel
const handleExportExcel = () => {
  const data = filteredClients.map((c) => ({
    'Nombre': c.fullName,
    'Correo': c.email,
    'Área': c.area,
    'Rol': 'Jefe de Proyecto',
    'Fecha de Creación': new Date(c.createdAt).toLocaleDateString(),
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Usuarios');
  XLSX.writeFile(workbook, `usuarios_sipp_${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Exportar a PDF
const handleExportPDF = () => {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.setTextColor(78, 1, 1);
  doc.text('Sistema SiPP - Usuarios (Jefes de Proyecto)', 14, 22); //  Título actualizado

  doc.setFontSize(12);
  doc.setTextColor(102, 112, 128);
  doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 32);

  const tableData = filteredClients.map((c) => [
    c.fullName,
    c.email,
    c.area,
    'Jefe de Proyecto', 
    new Date(c.createdAt).toLocaleDateString(),
  ]);

  doc.autoTable({
    head: [['Nombre', 'Correo', 'Área', 'Rol', 'Fecha de Creación']],
    body: tableData,
    startY: 40,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [78, 1, 1] },
  });

  doc.save(`usuarios_sipp_${new Date().toISOString().split('T')[0]}.pdf`);
};

  // Obtener color del rol
  const getRoleColor = (role) => {
    return colors.tan; // Tan para jefe de proyecto
  };

  // Opciones de filas por página adaptadas para pantallas pequeñas
  const rowsPerPageOptions = isMobile ? [5, 10] : [5, 10, 25];

// Función para abrir el modal de edición
const handleEditUser = (userId) => {
  const user = clients.find(u => u.id === userId);
  if (user) {
    setSelectedUser(user);
    setEditForm({
      fullName: user.fullName,
      email: user.email,
      area: user.area,
      role: user.role
    });
    setEditModalOpen(true);
  }
};

// Función para guardar los cambios
const handleSaveEdit = () => {
  if (!selectedUser) {
    alert('No se ha seleccionado ningún usuario para editar');
    return;
  }

  // Validación adicional
  if (!editForm.fullName?.trim() || !editForm.email?.trim() || !editForm.area || !editForm.role) {
    alert('Por favor complete todos los campos requeridos');
    return;
  }

  // Validar que no se pueda asignar rol admin o comercial o gestor
  if (editForm.role === 'admin' || editForm.role === 'comercial' || editForm.role === 'gestor') {
    alert('No se puede asignar el rol de administrador, comercial o gestor a usuarios comunes');
    return;
  }

  try {
    const saved = localStorage.getItem('SiPP_users');
    const users = saved ? JSON.parse(saved) : [];
    
    // Verificar que el usuario existe
    const userExists = users.find(user => user.id === selectedUser.id);
    if (!userExists) {
      alert('El usuario no existe en la base de datos');
      return;
    }
    
    const updatedUsers = users.map(user => 
      user.id === selectedUser.id 
        ? { 
            ...user, 
            fullName: editForm.fullName.trim(),
            email: editForm.email.trim(),
            area: editForm.area,
            role: editForm.role,
            updatedAt: new Date().toISOString() 
          }
        : user
    );
    
    localStorage.setItem('SiPP_users', JSON.stringify(updatedUsers));
    loadClients(); // Recargar la lista
    setEditModalOpen(false);
    setSelectedUser(null);
    
    alert('Usuario actualizado correctamente');
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    alert('Error al actualizar el usuario: ' + error.message);
  }
};

{editModalOpen && (
<Dialog 
  open={editModalOpen} 
  onClose={() => setEditModalOpen(false)}
  maxWidth="sm" 
  fullWidth
>
  <DialogTitle sx={{ 
    backgroundColor: colors.borgundy, 
    color: 'white',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }}>
    Editar Usuario
    <IconButton 
      onClick={() => setEditModalOpen(false)}
      sx={{ color: 'white' }}
    >
      <DeleteIcon /> 
    </IconButton>
  </DialogTitle>
  
  <DialogContent sx={{ mt: 2 }}>
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          label="Nombre Completo *"
          fullWidth
          value={editForm.fullName}
          onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
          margin="normal"
          error={!editForm.fullName.trim()}
          helperText={!editForm.fullName.trim() ? "Nombre es requerido" : ""}
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          label="Correo Electrónico *"
          fullWidth
          type="email"
          value={editForm.email}
          onChange={(e) => setEditForm({...editForm, email: e.target.value})}
          margin="normal"
          error={!editForm.email.trim()}
          helperText={!editForm.email.trim() ? "Email es requerido" : ""}
        />
      </Grid>
      
      <Grid item xs={12}>
        <FormControl fullWidth margin="normal" error={!editForm.area}>
          <InputLabel>Área *</InputLabel>
          <Select
            value={editForm.area}
            label="Área *"
            onChange={(e) => setEditForm({...editForm, area: e.target.value})}
          >
            <MenuItem value="Dirección">Dirección</MenuItem>
            <MenuItem value="Contabilidad">Contabilidad</MenuItem>
            <MenuItem value="Recursos Humanos">Recursos Humanos</MenuItem>
            <MenuItem value="TI">TI</MenuItem>
            <MenuItem value="Operaciones">Operaciones</MenuItem>
            <MenuItem value="Comercial">Comercial</MenuItem>
            <MenuItem value="Proyectos">Proyectos</MenuItem>
          </Select>
          {!editForm.area && <FormHelperText>Área es requerida</FormHelperText>}
        </FormControl>
      </Grid>
      
      <Grid item xs={12}>
        <FormControl fullWidth margin="normal" error={!editForm.role}>
          <InputLabel>Rol *</InputLabel>
          <Select
            value={editForm.role}
            label="Rol *"
            onChange={(e) => setEditForm({...editForm, role: e.target.value})}
          >
            {/* SOLO permitir rol 'user' para usuarios comunes */}
            <MenuItem value="user">Jefe de Proyecto</MenuItem>
          </Select>
          {!editForm.role && <FormHelperText>Rol es requerido</FormHelperText>}
        </FormControl>
      </Grid>
    </Grid>
  </DialogContent>
  
  <DialogActions sx={{ p: 3 }}>
    <Button 
      onClick={() => setEditModalOpen(false)}
      sx={{ color: colors.sapphire }}
    >
      Cancelar
    </Button>
    <Button
      onClick={handleSaveEdit}
      variant="contained"
      sx={{ 
        backgroundColor: colors.borgundy,
        '&:hover': { backgroundColor: colors.sapphire }
      }}
      disabled={!editForm.fullName?.trim() || !editForm.email?.trim() || !editForm.area || !editForm.role}
    >
      Guardar Cambios
    </Button>
  </DialogActions>
</Dialog>
)}

  return (
    <Box sx={{ 
      p: isMobile ? 2 : 4,
      backgroundColor: theme.palette.background.default,
      minHeight: '100vh',
      marginTop: isMobile ? '10%' : 3 , 
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
        Gestión de Usuarios
      </Typography>

      {/* PAPER CON EFECTO GLASS */}
      <Paper sx={{ 
        p: 3, 
        mb: 3, 
        borderRadius: 3,
        background: theme.palette.mode === 'dark'
          ? `linear-gradient(135deg, ${alpha(colors.sapphire, 0.15)} 0%, ${alpha(colors.borgundy, 0.1)} 100%)`
          : `linear-gradient(135deg, ${colors.paper} 0%, ${colors.shellstone}20 100%)`,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={6}>
            <TextField
              placeholder="Buscar usuario por nombre, correo o área..."
              variant="outlined"
              size="small"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: colors.sapphire, mr: 1 }} />,
              }}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: colors.paper,
                  '&:hover fieldset': { borderColor: colors.sapphire },
                }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={6} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button
              startIcon={<ExcelIcon />}
              onClick={handleExportExcel}
              variant="outlined"
              size="small"
              sx={{
                color: colors.borgundy,
                borderColor: colors.borgundy,
                '&:hover': {
                  backgroundColor: alpha(colors.borgundy, 0.1),
                  borderColor: colors.borgundy,
                }
              }}
            >
              Excel
            </Button>
            <Button
              startIcon={<PdfIcon />}
              onClick={handleExportPDF}
              variant="outlined"
              size="small"
              sx={{
                color: colors.sapphire,
                borderColor: colors.sapphire,
                '&:hover': {
                  backgroundColor: alpha(colors.sapphire, 0.1),
                  borderColor: colors.sapphire,
                }
              }}
            >
              PDF
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Alert severity="info">Cargando usuarios...</Alert>
      ) : filteredClients.length === 0 ? (
        <Alert severity="info">No hay usuarios registrados aún.</Alert>
      ) : (
        // TABLA CON EFECTO GLASS
        <Paper sx={{ 
          borderRadius: 3, 
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          background: theme.palette.mode === 'dark'
            ? colors.sapphire
            : colors.paper,
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
                  <TableCell sx={{ fontWeight: 600, color: colors.borgundy }}>Usuario</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: colors.borgundy }}>Correo</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: colors.borgundy }}>Área</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: colors.borgundy }}>Rol</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: colors.borgundy }}>Fecha de Registro</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: colors.borgundy }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedClients.map((client) => (
                  <TableRow key={client.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar 
                          src={client.avatar} 
                          alt={client.fullName} 
                          sx={{ 
                            width: 32, 
                            height: 32,
                            border: `1px solid ${colors.shellstone}`
                          }} 
                        />
                        <Typography variant="body2" fontWeight="medium">
                          {client.fullName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color={colors.sapphire}>
                        {client.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={client.area} 
                        size="small" 
                        sx={{
                          backgroundColor: alpha(colors.borgundy, 0.1),
                          color: colors.borgundy,
                          border: `1px solid ${alpha(colors.borgundy, 0.3)}`,
                          fontWeight: 500
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          client.role === 'admin'
                            ? 'Administrador'
                            : client.role === 'comercial'
                            ? 'Comercial'
                            : client.role === 'gestor'
                            ? 'Gestor'
                            : 'Jefe de Proyecto'
                        }
                        size="small"
                        sx={{
                          backgroundColor: alpha(getRoleColor(client.role), 0.1),
                          color: getRoleColor(client.role),
                          border: `1px solid ${alpha(getRoleColor(client.role), 0.3)}`,
                          fontWeight: 500
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color={colors.sapphire}>
                        {new Date(client.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Eliminar usuario">
                          <IconButton 
                            size="small" 
                            color="error" 
                            onClick={() => handleDeleteUser(client.id)}
                            sx={{
                              '&:hover': { 
                                backgroundColor: alpha('#f44336', 0.1) 
                              }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredClients.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={rowsPerPageOptions}
            labelRowsPerPage="Filas por página:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} de ${count}`
            }
            sx={{
              '& .MuiTablePagination-selectRoot': {
                marginRight: isTablet ? 1 : 2,
                marginLeft: isTablet ? 0.5 : 1,
              },
              '& .MuiTablePagination-toolbar': {
                flexWrap: isTablet ? 'wrap' : 'nowrap',
                justifyContent: 'flex-start',
                minHeight: '52px',
                padding: isTablet ? '8px' : '16px',
                backgroundColor: theme.palette.mode === 'dark' 
                  ? alpha(colors.borgundy, 0.05)
                  : alpha(colors.swanWhite, 0.5),
              },
              '& .MuiTablePagination-spacer': {
                flex: isTablet ? '1' : 'none',
              },
              '& .MuiTablePagination-actions': {
                marginLeft: isTablet ? 'auto' : '0',
              }
            }}
          />
        </Paper>
      )}

      <Divider sx={{ my: 4 }} />

      <Typography variant="body2" color={colors.sapphire} align="center">
        Sistema SiPP • Gestión de Jefes de Proyecto
      </Typography>
    </Box>
  );
};

export default Usuarios;