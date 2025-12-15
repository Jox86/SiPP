// src/components/NotificationPanel/NotificationPanel.jsx
import React from 'react';
import {
  Popper,
  Paper,
  ClickAwayListener,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  Button,
  Chip,
  useTheme,
  alpha,
  IconButton
} from '@mui/material';
import {
  CheckCircle,
  Warning,
  Error,
  Info,
  MarkEmailRead,
  ShoppingCart,
  Mail,
  Assignment,
  Support,
  Close
} from '@mui/icons-material';
import { useNotifications } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

const NotificationPanel = ({ anchorEl, open, onClose }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const getNotificationIcon = (notification) => {
    // Para notificaciones de pedidos
    if (notification.source === 'order') {
      if (notification.orderType === 'special') {
        return notification.title.includes('Servicio') ? 
          <Support sx={{ color: theme.palette.secondary.main }} /> : 
          <ShoppingCart sx={{ color: theme.palette.primary.main }} />;
      }
      return <Assignment sx={{ color: theme.palette.info.main }} />;
    }

    // Para notificaciones generales por tipo
    switch (notification.type) {
      case 'warning':
        return <Warning sx={{ color: theme.palette.warning.main }} />;
      case 'error':
        return <Error sx={{ color: theme.palette.error.main }} />;
      case 'success':
        return <CheckCircle sx={{ color: theme.palette.success.main }} />;
      default:
        return <Info sx={{ color: theme.palette.info.main }} />;
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ahora mismo';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)} h`;
    
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleNotificationClick = (notification) => {
    // Marcar como leída
    markAsRead(notification.id);
    
    // Redirigir a la sección de mensajes
    if (notification.redirectTo) {
      navigate(notification.redirectTo);
    } else {
      // Redirección por defecto a mensajes
      navigate('/mensajes');
    }
    
    onClose();
  };

  const handleMarkAllAsRead = (event) => {
    event.stopPropagation();
    markAllAsRead();
  };

  const handleMarkAsRead = (notificationId, event) => {
    event.stopPropagation();
    markAsRead(notificationId);
  };

  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  // Agrupar notificaciones por fecha
  const groupNotificationsByDate = (notifs) => {
    const groups = {};
    notifs.forEach(notification => {
      const date = new Date(notification.timestamp);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let groupKey;
      if (date.toDateString() === today.toDateString()) {
        groupKey = 'Hoy';
      } else if (date.toDateString() === yesterday.toDateString()) {
        groupKey = 'Ayer';
      } else {
        groupKey = date.toLocaleDateString('es-ES', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(notification);
    });
    
    return groups;
  };

  const unreadGroups = groupNotificationsByDate(unreadNotifications);
  const readGroups = groupNotificationsByDate(readNotifications);

  return (
    <Popper
      id="notifications-popper"
      open={open}
      anchorEl={anchorEl}
      placement="bottom-end"
      sx={{ zIndex: 1300 }}
    >
      <ClickAwayListener onClickAway={onClose}>
        <Paper
          sx={{
            width: 400,
            maxHeight: 500,
            overflow: 'hidden',
            mt: 1,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
            borderRadius: 2,
            background: theme.palette.mode === 'dark'
              ? `linear-gradient(135deg, ${alpha('#667080', 0.95)} 0%, ${alpha('#4E0101', 0.95)} 100%)`
              : `linear-gradient(135deg, ${alpha('#F5F0E9', 0.95)} 0%, ${alpha('#FFFFFF', 0.95)} 100%)`,
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* Header del panel */}
          <Box
            sx={{
              p: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              background: alpha(theme.palette.background.paper, 0.8),
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Notificaciones
              {unreadCount > 0 && (
                <Chip
                  label={unreadCount}
                  size="small"
                  color="error"
                  sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                />
              )}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {unreadCount > 0 && (
                <Button
                  size="small"
                  startIcon={<MarkEmailRead />}
                  onClick={handleMarkAllAsRead}
                  sx={{ fontSize: '0.75rem' }}
                >
                  Marcar todas
                </Button>
              )}
              <IconButton
                size="small"
                onClick={onClose}
                sx={{ color: 'text.secondary' }}
              >
                <Close />
              </IconButton>
            </Box>
          </Box>

          {/* Lista de notificaciones */}
          <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
            {notifications.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Info sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  No hay notificaciones
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  Las notificaciones se generan automáticamente desde los pedidos del sistema
                </Typography>
              </Box>
            ) : (
              <>
                {/* Notificaciones no leídas */}
                {Object.keys(unreadGroups).map(groupKey => (
                  <Box key={`unread-${groupKey}`}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        px: 2,
                        pt: 2,
                        pb: 1,
                        color: 'text.secondary',
                        fontWeight: 600,
                        backgroundColor: alpha(theme.palette.primary.main, 0.05),
                      }}
                    >
                      {groupKey}
                    </Typography>
                    <List dense sx={{ py: 0 }}>
                      {unreadGroups[groupKey].map((notification) => (
                        <ListItem
                          key={notification.id}
                          sx={{
                            py: 1.5,
                            px: 2,
                            borderLeft: `3px solid ${theme.palette.primary.main}`,
                            backgroundColor: alpha(theme.palette.primary.main, 0.04),
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.08),
                            },
                            cursor: 'pointer',
                          }}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            {getNotificationIcon(notification)}
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {notification.title}
                              </Typography>
                            }
                            secondary={
                              <Box>
                                <Typography variant="caption" display="block">
                                  {notification.message}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{ color: 'text.secondary', mt: 0.5 }}
                                >
                                  {formatTimestamp(notification.timestamp)}
                                </Typography>
                              </Box>
                            }
                          />
                          <IconButton
                            size="small"
                            onClick={(e) => handleMarkAsRead(notification.id, e)}
                            sx={{ ml: 1 }}
                          >
                            <MarkEmailRead fontSize="small" />
                          </IconButton>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                ))}

                {/* Notificaciones leídas */}
                {Object.keys(readGroups).length > 0 && (
                  <>
                    <Divider />
                    {Object.keys(readGroups).map(groupKey => (
                      <Box key={`read-${groupKey}`}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            px: 2,
                            pt: 2,
                            pb: 1,
                            color: 'text.secondary',
                            fontWeight: 600,
                          }}
                        >
                          {groupKey}
                        </Typography>
                        <List dense sx={{ py: 0 }}>
                          {readGroups[groupKey].map((notification) => (
                            <ListItem
                              key={notification.id}
                              sx={{
                                py: 1.5,
                                px: 2,
                                opacity: 0.7,
                                '&:hover': {
                                  backgroundColor: theme.palette.action.hover,
                                  opacity: 1,
                                },
                                cursor: 'pointer',
                              }}
                              onClick={() => handleNotificationClick(notification)}
                            >
                              <ListItemIcon sx={{ minWidth: 40 }}>
                                {getNotificationIcon(notification)}
                              </ListItemIcon>
                              <ListItemText
                                primary={
                                  <Typography variant="body2">
                                    {notification.title}
                                  </Typography>
                                }
                                secondary={
                                  <Box>
                                    <Typography variant="caption" display="block">
                                      {notification.message}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      sx={{ color: 'text.secondary', mt: 0.5 }}
                                    >
                                      {formatTimestamp(notification.timestamp)}
                                    </Typography>
                                  </Box>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    ))}
                  </>
                )}
              </>
            )}
          </Box>

          {/* Footer con botón para ver todos los mensajes */}
          <Box
            sx={{
              p: 1,
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              textAlign: 'center',
              backgroundColor: alpha(theme.palette.background.paper, 0.8),
            }}
          >
            <Button
              size="small"
              onClick={() => {
                navigate('/mensajes');
                onClose();
              }}
              sx={{ fontSize: '0.75rem' }}
            >
              Ver todos los mensajes
            </Button>
          </Box>
        </Paper>
      </ClickAwayListener>
    </Popper>
  );
};

export default NotificationPanel;