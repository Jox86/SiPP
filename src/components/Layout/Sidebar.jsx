import React, { useState, useEffect } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Box,
  useMediaQuery,
  Avatar,
  Switch,
  Menu,
  MenuItem,
  Divider
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Inventory,
  Category,
  People,
  AccountCircle,
  Assessment,
  Email,
  Settings,
  HelpOutline,
  WbSunny,
  NightsStay,
  Menu as MenuIcon,
  Close as CloseIcon,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Logout,
  MoreVert, 
} from '@mui/icons-material';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Sidebar() {
  const { darkMode, toggleTheme, theme } = useTheme();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(!isSmallScreen);
  const [sidebarExpanded, setSidebarExpanded] = useState(!isTablet);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);

  // Nueva paleta de colores
  const colors = {
    borgundy: '#4E0101',
    tan: '#d2b48c',
    sapphire: '#667080',
    swanWhite: '#F5F0E9',
    shellstone: '#D9CBC2',
  };

  const handleImageError = (event) => {
    event.target.src = '';
    event.target.style.background = colors.shellstone;
    event.target.style.display = 'flex';
    event.target.style.alignItems = 'center';
    event.target.style.justifyContent = 'center';
    event.target.style.fontWeight = 'bold';
    event.target.style.color = colors.borgundy;
    event.target.style.fontSize = '1.2rem';
    event.target.innerHTML = 'SiPP';
  };

  const toggleSidebar = () => {
    const newState = !open;
    setOpen(newState);
    localStorage.setItem('sidebar-open', JSON.stringify(newState));
  };

  const toggleExpand = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = () => {
    logout();
    handleUserMenuClose();
    navigate('/login');
  };

  const handleProfileUser = () => {
    navigate('/PerfilUsuario');
    handleUserMenuClose();
  };

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-open');
    if (saved !== null) {
      setOpen(JSON.parse(saved));
    }
  }, []);

  // Menú organizado según las pestañas solicitadas (sin Configuración)
  const getMenuItems = () => {
    const baseItems = [
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
      { text: 'Pedidos', icon: <ShoppingBag />, path: '/pedidos' },
      { text: 'Usuarios', icon: <People />, path: '/usuarios' },
      { text: 'Proyectos', icon: <Category />, path: '/proyectos' },
      { text: 'Mensajes', icon: <Email />, path: '/mensajes' },
      { text: 'Reportes', icon: <Assessment />, path: '/reportes' },
      { text: 'Ayuda', icon: <HelpOutline />, path: '/ayuda' },
    ];

    // Filtrar según el rol del usuario
    if (currentUser?.role === 'admin') {
      return baseItems; // Admin ve todo
    } else if (currentUser?.role === 'comercial') {
      return baseItems.filter(item => //Comercial de Depto. Comercial DST
        item.text !== 'Usuarios' && item.text !== 'Proyectos' && item.text !== 'Reportes' 
      );
    } else {
      // Usuario normal (jefe de proyecto)
      return baseItems.filter(item => 
        item.text !== 'Usuarios' && item.text !== 'Reportes' && item.text !== 'Proyectos' 
      );
    }
  };

  const menuItems = getMenuItems();

  // Colores dinámicos según el modo
  const getTextColor = () => darkMode ? colors.swanWhite : colors.borgundy;
  const getIconColor = () => colors.borgundy; // Iconos siempre borgundy
  const getHoverTextColor = () => colors.sapphire; // Hover siempre sapphire
  const getHoverColor = () => darkMode ? `${colors.sapphire}10` : `${colors.sapphire}05`;
  const getSelectedColor = () => darkMode ? `${colors.sapphire}15` : `${colors.sapphire}10`;

  return (
    <>
      {/* Botón de menú hamburguesa para pantallas pequeñas */}
      {isSmallScreen && (
        <IconButton
          onClick={toggleSidebar}
          sx={{
            position: 'fixed',
            top: 16,
            left: 16,
            zIndex: 1301,
            backgroundColor: darkMode ? colors.sapphire : colors.borgundy,
            color: colors.swanWhite,
            backdropFilter: 'blur(10px)',
            '&:hover': {
              backgroundColor: darkMode ? '#4A6188' : colors.sapphire,
            },
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      <Drawer
        variant={isSmallScreen ? "temporary" : "permanent"}
        open={open}
        onClose={() => isSmallScreen && setOpen(false)}
        sx={{
          width: sidebarExpanded ? 270 : 80,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: sidebarExpanded ? 240 : 80,
            overflowX: 'hidden',
            //  EFECTO GLASS DINÁMICO SEGÚN MODO
            background: darkMode 
              ? `linear-gradient(135deg, 
                  rgba(60, 80, 112, 0.1) 0%, 
                  rgba(2, 33, 71, 0.08) 50%,
                  rgba(60, 80, 112, 0.12) 100%)`
              : `linear-gradient(135deg, 
                  rgba(2, 33, 71, 0.1) 0%, 
                  rgba(245, 240, 233, 0.05) 50%,
                  rgba(217, 203, 194, 0.08) 100%)`,
            backdropFilter: 'blur(20px) saturate(180%)',
            backgroundColor: darkMode ? 'rgba(2, 33, 71, 0.03)' : 'rgba(255, 255, 255, 0.05)',
            borderRight: `1px solid ${darkMode ? colors.sapphire + '30' : colors.shellstone + '30'}`,
            color: getTextColor(),
            transition: 'all 0.3s ease',
            height: '100vh',
            position: 'fixed',
            '&::-webkit-scrollbar': { display: 'none' },
            boxShadow: darkMode 
              ? `0 8px 32px ${colors.sapphire}10`
              : `0 8px 32px ${colors.borgundy}15`,
          },
        }}
      >
        {/* Header */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: `1px solid ${darkMode ? colors.sapphire + '25' : colors.shellstone + '40'}`,
          minHeight: '50px',
          background: darkMode
            ? `linear-gradient(90deg, 
                ${colors.sapphire}08 0%, 
                ${colors.borgundy}06 50%,
                ${colors.sapphire}08 100%)`
            : `linear-gradient(90deg, 
                ${colors.borgundy}08 0%, 
                ${colors.sapphire}05 50%,
                ${colors.borgundy}08 100%)`,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {sidebarExpanded && (
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  fontFamily: '"Qurova", sans-serif',
                  background: darkMode
                    ? `linear-gradient(45deg, ${colors.sapphire}, ${colors.borgundy})`
                    : `linear-gradient(45deg, ${colors.borgundy}, ${colors.sapphire})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                SiPP
              </Typography>
            )}
          </Box>
          
          {isSmallScreen && (
            <IconButton 
              onClick={() => setOpen(false)}
              sx={{ 
                color: colors.borgundy,
                '&:hover': {
                  backgroundColor: getHoverColor(),
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </Box>

        {/* Menú principal */}
        <Box sx={{ 
          overflowY: 'auto', 
          height: 'calc(100% - 180px)', 
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}>
          <List sx={{ px: 0.5, py: 1 }}>
            {menuItems.map((item) => (
              <ListItem
                button
                key={item.text}
                component={Link}
                to={item.path}
                title={sidebarExpanded ? '' : item.text}
                onClick={() => isSmallScreen && setOpen(false)}
                sx={{
                  borderRadius: '0 12px 12px 0',
                  mb: 0.5,
                  color: getTextColor(),
                  justifyContent: sidebarExpanded ? 'flex-start' : 'center',
                  px: sidebarExpanded ? 2 : 1,
                  mx: 0.5,
                  mr: 2,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  background: 'transparent',
                  '&:hover': {
                    backgroundColor: getHoverColor(),
                    transform: 'translateX(4px)',
                    color: getHoverTextColor(),
                    '& .MuiListItemIcon-root': {
                      color: getHoverTextColor(),
                      transform: 'scale(1.1)',
                    },
                    '& .MuiTypography-root': {
                      color: getHoverTextColor(),
                    },
                  },
                  '&.Mui-selected': {
                    backgroundColor: getSelectedColor(),
                    color: getHoverTextColor(),
                    borderLeft: `3px solid ${colors.borgundy}`,
                    '& .MuiListItemIcon-root': {
                      color: getHoverTextColor(),
                    },
                    '& .MuiTypography-root': {
                      color: getHoverTextColor(),
                    },
                  },
                }}
              >
                <ListItemIcon sx={{
                  color: getIconColor(),
                  minWidth: sidebarExpanded ? 48 : 0,
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    opacity: sidebarExpanded ? 1 : 0,
                    transition: 'opacity 0.2s, transform 0.2s',
                    '& .MuiTypography-root': {
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      color: 'inherit',
                    },
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Footer con información de usuario y toggle de tema */}
        <Box sx={{
          mt: 'auto',
          p: 1.5,
          minHeight: '80px', // Menos alta
          background: darkMode
            ? `linear-gradient(180deg, 
                rgba(245, 240, 233, 0.05) 0%, 
                rgba(217, 203, 194, 0.1) 100%)`
            : colors.text,
        }}>
          {/* Toggle de tema moderno */}
          {sidebarExpanded && (
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 1,
            p: 1,
            borderRadius: '12px',
            background: darkMode
              ? `linear-gradient(135deg, 
                  rgba(245, 240, 233, 0.05) 0%, 
                  rgba(217, 203, 194, 0.1) 100%)`
              : `linear-gradient(135deg, 
                  rgba(245, 240, 233, 0.8) 0%, 
                  rgba(217, 203, 194, 0.6) 100%)`,
          }}>
            {/* Icono de Sol (Modo Claro) */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              flex: 1,
              justifyContent: 'center',
              opacity: darkMode ? 0.5 : 1,
              transition: 'all 0.3s ease',
              transform: darkMode ? 'scale(0.9)' : 'scale(1)',
            }}>
              <WbSunny sx={{ 
                color: darkMode ? colors.swanWhite : colors.tan,
                fontSize: '1.2rem',
              }} />
            </Box>

            {/* Switch moderno */}
            <Switch
              checked={darkMode}
              onChange={toggleTheme}
              size="small"
              sx={{
                '& .MuiSwitch-switchBase': {
                  color: colors.swanWhite,
                  '&.Mui-checked': {
                    color: colors.borgundy,
                  },
                  '&.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: colors.tan,
                    opacity: 1,
                  },
                },
                '& .MuiSwitch-track': {
                  backgroundColor: colors.borgundy,
                  opacity: 0.8,
                  borderRadius: 20,
                },
                '& .MuiSwitch-thumb': {
                  backgroundColor: darkMode ? colors.borgundy : colors.swanWhite,
                },
              }}
            />

            {/* Icono de Luna (Modo Oscuro) */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              flex: 1,
              justifyContent: 'center',
              opacity: darkMode ? 1 : 0.5,
              transition: 'all 0.3s ease',
              transform: darkMode ? 'scale(1)' : 'scale(0.9)',
            }}>
              <NightsStay sx={{ 
                color: darkMode ? colors.tan : colors.sapphire,
                fontSize: '1.2rem',
              }} />
            </Box>
          </Box>
        )}

          {/* Sección de usuario clickeable */}
          <Box 
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              justifyContent: sidebarExpanded ? 'space-between' : 'center',
              flexDirection: sidebarExpanded ? 'row' : 'column',
              cursor: 'pointer',
              borderRadius: '12px',
              p: 1,
              background: darkMode
                ? `linear-gradient(135deg, 
                    rgba(245, 240, 233, 0.05) 0%, 
                    rgba(217, 203, 194, 0.1) 100%)`
                : `linear-gradient(135deg, 
                    rgba(245, 240, 233, 0.8) 0%, 
                    rgba(217, 203, 194, 0.6) 100%)`,
              '&:hover': {
                backgroundColor: getHoverColor(),
                '& .MuiTypography-root': {
                  color: getHoverTextColor(),
                },
              },
            }}
          >
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              justifyContent: sidebarExpanded ? 'flex-start' : 'center',
            }}>
              <Avatar
                src={currentUser?.avatar || '/src/assets/images/3d-user-icon.jpeg'}
                alt="Avatar"
                onError={handleImageError}
                sx={{
                  width: 32,
                  height: 32,
                  border: `2px solid ${colors.borgundy}`,
                  backgroundColor: colors.shellstone,
                  color: colors.borgundy,
                  fontWeight: 'bold',
                  fontSize: '0.8rem',
                }}
              />
              {sidebarExpanded && (
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="body2" sx={{
                    fontWeight: 600,
                    color: getTextColor(),
                    fontSize: '0.9rem',
                    lineHeight: 1.2,
                  }}>
                    {currentUser?.fullName?.split(' ')[0] || 'Usuario'}
                  </Typography>
                  <Typography variant="caption" sx={{
                    color: colors.sapphire,
                    fontSize: '0.7rem',
                    lineHeight: 1,
                    fontWeight: 500,
                  }}>
                    {currentUser?.role === 'admin' ? 'Administrador' : 
                     currentUser?.role === 'comercial' ? 'Comercial' : 'Usuario'}
                  </Typography>
                </Box>
              )}
            </Box>    
            {/* Icono de tres puntos (solo visible cuando el sidebar está expandido) */}
            {sidebarExpanded && (
              <IconButton 
                size="small"
                onClick={handleUserMenuOpen}
                sx={{
                  color: colors.borgundy,
                  '&:hover': {
                    backgroundColor: getHoverColor(),
                    color: colors.sapphire,
                  }
                }}
              >
                <MoreVert fontSize="small" />
              </IconButton>
            )}        
          </Box>
        </Box>
      </Drawer>

      {/* MENÚ DESPLEGABLE DEL USUARIO */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
        PaperProps={{
          sx: {
            marginTop: '10px',
            marginLeft: '60px',
            background: darkMode
              ? `linear-gradient(135deg, 
                  rgba(78, 1, 1, 0.95) 0%, 
                  rgba(210, 180, 140, 0.9) 100%)`
              : `linear-gradient(135deg, 
                  rgba(245, 240, 233, 0.95) 0%, 
                  rgba(217, 203, 194, 0.9) 100%)`,
            backdropFilter: 'blur(20px)',
            color: darkMode ? colors.swanWhite : colors.borgundy,
            border: `1px solid ${darkMode ? colors.tan + '40' : colors.borgundy + '40'}`,
            boxShadow: darkMode 
              ? `0 8px 32px ${colors.borgundy}20`
              : `0 8px 32px ${colors.shellstone}40`,
            '& .MuiMenuItem-root': {
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: getHoverColor(),
                color: getHoverTextColor(),
              },
            },
          },
        }}
      >
      <MenuItem onClick={handleProfileUser}>
          <ListItemIcon>
            <Settings fontSize="small" sx={{ color: colors.borgundy }} />
          </ListItemIcon>
          Perfil de usuario
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" sx={{ color: colors.borgundy }} />
          </ListItemIcon>
          Cerrar Sesión
        </MenuItem>
      </Menu>

      {/* BOTÓN DE EXPANSIÓN CON EFECTO GLASS */}
      {!isSmallScreen && (
        <IconButton 
          onClick={toggleExpand}
          size="small" 
          sx={{
            position: 'fixed',
            top: 16,
            left: sidebarExpanded ? 248 : 60,
            zIndex: 1300,
            backgroundColor: darkMode 
              ? `rgba(78, 1, 1, 0.9)` 
              : `rgba(245, 240, 233, 0.9)`,
            backdropFilter: 'blur(10px)',
            color: colors.borgundy,
            border: `1px solid ${darkMode ? colors.tan + '40' : colors.borgundy + '40'}`,
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: colors.borgundy,
              color: colors.swanWhite,
              transform: 'scale(1.1)',
            },
            width: 32,
            height: 32,
            boxShadow: darkMode 
              ? `0 4px 12px ${colors.borgundy}30`
              : `0 4px 12px ${colors.shellstone}40`,
          }}
        >
          {sidebarExpanded ? <ChevronLeft /> : <ChevronRight />}
        </IconButton>
      )}
    </>
  );
}