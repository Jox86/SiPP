import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  IconButton,
  LinearProgress,
  Tooltip,
  useTheme,
  alpha,
  CircularProgress
} from '@mui/material';
import {
  AssignmentTurnedIn,
  CheckCircle,
  PendingActions,
  TrendingUp,
  Visibility,
  Description,
  ErrorOutline
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const ConformitySection = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [pendingConformities, setPendingConformities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPendingConformities();
    const interval = setInterval(loadPendingConformities, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadPendingConformities = () => {
    try {
      // Leer datos reales desde localStorage
      const purchases = JSON.parse(localStorage.getItem('SiPP_purchases') || '[]');
      const orders = JSON.parse(localStorage.getItem('SiPP_orders') || '[]');
      
      // Obtener actas ya generadas
      const existingConformities = JSON.parse(localStorage.getItem('SiPP_conformities') || '[]');
      
      // Combinar solicitudes completadas
      const completedRequests = [
        ...purchases.filter(p => p.status === 'Completado'),
        ...orders.filter(o => o.status === 'Completado')
      ];
      
      // Filtrar solicitudes que no tienen acta generada
      const pendingRequests = completedRequests.filter(request => {
        return !existingConformities.some(acta => 
          acta.requestId === request.id || acta.projectId === request.projectId
        );
      });
      
      // Obtener los 10 más recientes
      const recentPending = pendingRequests
        .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
        .slice(0, 10)
        .map(request => ({
          id: request.id,
          project: request.project || 'Proyecto sin nombre',
          client: request.user || 'Usuario no especificado',
          date: request.date || request.createdAt || new Date().toISOString(),
          amount: request.total || 0,
          items: request.items?.length || 0,
          type: request.items ? 'Compra' : 'Pedido'
        }));

      setPendingConformities(recentPending);
    } catch (error) {
      console.error('Error loading pending conformities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateActa = (requestId) => {
    navigate(`/reportes?tab=conformity&generate=${requestId}`);
  };

  const handleViewDetails = () => {
    navigate('/reportes?tab=conformity');
  };

  const getStatusColor = () => {
    return 'warning';
  };

  const formatCurrency = (amount) => {
    return `$${parseFloat(amount || 0).toFixed(2)} CUP`;
  };

  if (loading) {
    return (
      <Card sx={{ 
        borderRadius: 3, 
        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        height: '100%',
        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`
      }}>
        <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={40} />
            <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
              Cargando pendientes...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ 
      borderRadius: 3, 
      boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
      height: '100%',
      background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
      border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 12px 28px rgba(0,0,0,0.12)'
      }
    }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PendingActions sx={{ color: '#4E0101' }} />
            <Typography variant="h6" component="span">
              Actas Pendientes
            </Typography>
          </Box>
        }
        subheader="Solicitudes completadas sin acta generada"
      />
      
      <CardContent>
        {pendingConformities.length > 0 ? (
          <Box sx={{ 
            maxHeight: 320, 
            overflow: 'auto',
            pr: 1,
            '&::-webkit-scrollbar': {
              width: 6,
            },
            '&::-webkit-scrollbar-track': {
              background: alpha(theme.palette.primary.main, 0.1),
              borderRadius: 3,
            },
            '&::-webkit-scrollbar-thumb': {
              background: alpha(theme.palette.primary.main, 0.4),
              borderRadius: 3,
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: alpha(theme.palette.primary.main, 0.6),
            }
          }}>
            <List dense>
              {pendingConformities.map((request, index) => (
                <ListItem 
                  key={request.id} 
                  sx={{ 
                    px: 0,
                    py: 1,
                    borderRadius: 1,
                    transition: 'background-color 0.2s',
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover
                    }
                  }}
                  secondaryAction={
                    <Tooltip title="Generar acta">
                      <IconButton 
                        size="small" 
                        onClick={() => handleGenerateActa(request.id)}
                        sx={{ color: 'warning.main' }}
                      >
                        <Description fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  }
                >
                  <ListItemAvatar>
                    <Avatar sx={{ 
                      width: 36, 
                      height: 36, 
                      bgcolor: alpha(theme.palette.warning.main, 0.1),
                      color: 'warning.main'
                    }}>
                      <PendingActions fontSize="small" />
                    </Avatar>
                  </ListItemAvatar>
                  
                  <ListItemText
                    primary={
                      <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
                        {request.project}
                      </Typography>
                    }
                    secondary={
                      <Box sx={{ mt: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Chip
                            label="Pendiente"
                            size="small"
                            color="warning"
                            variant="outlined"
                          />
                          <Typography variant="caption" color="text.secondary">
                            {new Date(request.date).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Typography variant="caption" display="block" color="text.secondary">
                          {request.client} • {formatCurrency(request.amount)} • {request.type}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        ) : (
          <Box sx={{ 
            textAlign: 'center', 
            py: 3,
            backgroundColor: theme.palette.action.hover,
            borderRadius: 2,
            mb: 2
          }}>
            <CheckCircle sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No hay actas pendientes
            </Typography>
            <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
              Todas las solicitudes completadas tienen su acta generada
            </Typography>
          </Box>
        )}

        {/* Resumen de estado */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          mt: 2,
          p: 1.5,
          backgroundColor: alpha('#4E0101', 0.08),
          borderRadius: 2
        }}>
          <ErrorOutline sx={{ fontSize: 16, mr: 1, color: 'warning.main' }} />
          <Typography variant="caption" color="text.primary" fontWeight="medium">
            {pendingConformities.length > 0 ? 
              `${pendingConformities.length} actas pendientes de generación` : 
              'Todas las solicitudes documentadas'
            }
          </Typography>
        </Box>

        {/* Acción rápida */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mt: 2,
          pt: 2,
          borderTop: `1px solid ${theme.palette.divider}`
        }}>
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'primary.main', 
              cursor: 'pointer',
              fontWeight: 'medium',
              '&:hover': { textDecoration: 'underline' }
            }}
            onClick={handleViewDetails}
          >
            Gestionar todas las actas →
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ConformitySection;