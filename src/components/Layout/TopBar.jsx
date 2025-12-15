// src/components/TopBar/TopBar.jsx
import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Box,
  Tooltip,
  Avatar,
  useMediaQuery,
  Divider,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Logout as LogoutIcon,
  WbSunny,
  NightsStay,
  AccountCircle,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { useTheme as useCustomTheme } from '../../context/ThemeContext';
import NotificationPanel from '../NotificationPanel/NotificationPanel';

// Paleta de colores con modo oscuro
const COLORS = {
  light: {
    borgundy: '#4E0101',
    tan: '#d2b48c',
    sapphire: '#3C5070',
    swanWhite: '#F5F0E9',
    shellstone: '#D9CBC2',
    background: '#F5F0E9',
    paper: '#F8F9FA',
    text: '#4E0101',
    textSecondary: '#3C5070'
  },
  dark: {
    borgundy: '#4E0101',
    tan: '#A78B6F',
    sapphire: '#4A6388',
    swanWhite: '#2D3748',
    shellstone: '#4A5568',
    background: '#1A202C',
    paper: '#2D3748',
    text: '#F7FAFC',
    textSecondary: '#E2E8F0'
  }
};

export default function TopBar({ open }) {
  const { logout, currentUser } = useAuth();
  const { darkMode, toggleTheme } = useCustomTheme();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery('(max-width:600px)');

  const [anchorEl, setAnchorEl] = useState(null);

  const colors = darkMode ? COLORS.dark : COLORS.light;

  const handleNotificationsClick = (event) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    const confirmed = window.confirm('¿Estás seguro de que deseas cerrar sesión?');
    if (confirmed) {
      logout();
      navigate('/login', { replace: true });
    }
  };

  const openPopper = Boolean(anchorEl);

  // Componente para iconos modernos 3D
  const ModernIcon = ({ children, sx = {} }) => (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        filter: `
          drop-shadow(0 2px 4px rgba(0,0,0,0.2))
          drop-shadow(0 4px 8px rgba(0,0,0,0.1))
        `,
        transition: 'all 0.3s ease',
        ...sx
      }}
    >
      {children}
    </Box>
  );

  // Estilo común para los iconos
  const iconButtonStyle = {
    color: colors.borgundy,
    background: 'transparent',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: `${colors.sapphire}40`,
      color: colors.tan,
      transform: 'scale(1.1)',
    },
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: 1100,
        ml: { md: open ? '280px' : '80px' },
        width: { md: open ? 'calc(100% - 280px)' : 'calc(100% - 80px)' },
        transition: 'margin 0.3s ease, width 0.3s ease',
        //  EFECTO GLASS MODERNO
        background: darkMode 
          ? `linear-gradient(135deg, 
              rgba(102, 112, 128, 0.15) 0%, 
              rgba(2, 33, 71, 0.12) 50%,
              rgba(102, 112, 128, 0.18) 100%)`
          : `linear-gradient(135deg, 
              rgba(2, 33, 71, 0.15) 0%, 
              rgba(102, 112, 128, 0.1) 50%,
              rgba(217, 203, 194, 0.12) 100%)`,
        backdropFilter: 'blur(20px) saturate(180%)',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderBottom: `1px solid ${darkMode ? colors.sapphire + '25' : colors.shellstone + '30'}`,
        color: colors.text,
        boxShadow: darkMode 
          ? `0 2px 20px ${colors.sapphire}10`
          : `0 2px 20px ${colors.borgundy}15`,
      }}
    >
      <Toolbar sx={{ 
        justifyContent: 'space-between', 
        minHeight: '70px !important',
        padding: '0 24px'
      }}>
        {/* Logo con margen ajustado para pantallas pequeñas */}
        <Typography
          variant="h4"
          sx={{
            fontWeight: 900,
            fontFamily: '"Qurova", sans-serif',
            letterSpacing: '0.5px',
            background: darkMode
              ? `linear-gradient(45deg, ${colors.sapphire}, ${colors.borgundy})`
              : `linear-gradient(45deg, ${colors.borgundy}, ${colors.sapphire})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            ml: isSmallScreen ? 8 : 0, // Margen izquierdo más grande en pantallas pequeñas
          }}
        >
          SiPP
        </Typography>

        {/* Acciones */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Información del usuario */}
            <Tooltip title={currentUser?.fullName || 'Usuario'}>
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                <Avatar
                  sx={{
                    width: 35,
                    height: 35,
                    fontSize: '1.4rem',
                    backgroundColor: 'transparent',
                    color: colors.borgundy,
                    fontWeight: 'bold',
                    border: `1px solid ${colors.borgundy}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      color: colors.tan,
                      border: `1px solid ${colors.tan}`,
                    },
                  }}
                >
                  {currentUser?.fullName?.charAt(0) || 'U'}
                </Avatar>
              </Box>
            </Tooltip>

          {/*  Botón de Toggle de Tema Mejorado */}
          <Tooltip title={darkMode ? "Modo claro" : "Modo oscuro"}>
            <IconButton
              size="medium"
              onClick={toggleTheme}
              sx={iconButtonStyle}
            >
              <ModernIcon>
                {darkMode ? (
                  <WbSunny sx={{ 
                    fontSize: 24,
                  }} />
                ) : (
                  <NightsStay sx={{ 
                    fontSize: 24,
                    color: colors.borgundy,
                    '&:hover': {
                      color: colors.tan
                    }
                  }} />
                )}
              </ModernIcon>
            </IconButton>
          </Tooltip>
          
          {/*  Botón de Notificaciones Actualizado */}
          <Tooltip title="Notificaciones">
            <IconButton
              size="medium"
              onClick={handleNotificationsClick}
              aria-describedby={openPopper ? 'notifications-popper' : undefined}
              sx={iconButtonStyle}
            >
              <ModernIcon>
                <Badge
                  badgeContent={unreadCount}
                  color="error"
                  sx={{
                    '& .MuiBadge-badge': {
                      color: colors.borgundy,
                      backgroundColor: colors.tan,
                      fontWeight: 'bold',
                      fontSize: '0.7rem',
                      minWidth: '18px',
                      height: '18px',
                    },
                  }}
                >
                  <NotificationsIcon sx={{ fontSize: 24 }} />
                </Badge>
              </ModernIcon>
            </IconButton>
          </Tooltip>

          {/*  Panel de Notificaciones */}
          <NotificationPanel 
            anchorEl={anchorEl}
            open={openPopper}
            onClose={handleNotificationsClose}
          />
          
          {/* Separador */}
          <Divider 
            orientation="vertical" 
            flexItem 
            sx={{ 
              mx: 1, 
              height: 28,
              backgroundColor: darkMode ? colors.sapphire + '40' : colors.swanWhite + '40',
            }} 
          />

          {/*  Botón de Cerrar Sesión Mejorado */}
          <Tooltip title="Cerrar sesión">
            <IconButton
              size="medium"
              edge="end"
              aria-label="cerrar sesión"
              onClick={handleLogout}
              sx={iconButtonStyle}
            >
              <ModernIcon>
                <LogoutIcon sx={{ fontSize: 24 }} />
              </ModernIcon>
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}