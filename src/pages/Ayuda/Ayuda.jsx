// src/pages/Ayuda/Ayuda.jsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Snackbar,
  Alert,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Grid,
  Card,
  CardContent,
  Chip,
  Tooltip,
  Link,
  Container
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Help as HelpIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Send as SendIcon,
  Article as ArticleIcon,
  Checklist as ChecklistIcon,
  Receipt as ReceiptIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  People as PeopleIcon,
  ShoppingBag as ShoppingBagIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
  Message as MessageIcon,
  Description as DescriptionIcon,
  Assignment as AssignmentIcon,
  AccountCircle as AccountCircleIcon,
  Security as SecurityIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { generarGuiaSiPP } from '../../utils/generarGuiaSiPP';
import { 
  generarPlantillaActa, 
  generarPlantillaReporte, 
} from '../../utils/plantillasUtils';

const COLORS = {
  borgundy: '#4E0101',
  tan: '#d2b48c',
  sapphire: '#3C5070',
  swanWhite: '#F5F0E9',
  shellstone: '#D9CBC2'
};

// Componente Footer actualizado
const FooterAyuda = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: COLORS.borgundy,
        color: 'white',
        py: 3,
        px: 2,
        marginTop: isMobile ? '10%' : 5, 
        borderTop: `4px solid ${COLORS.tan}` 
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={3} alignItems="center">
          {/* Información de Copyright */}
          <Grid item xs={12} md={4}>
            <Typography 
              variant="body2" 
              align={isMobile ? 'center' : 'left'}
              sx={{ mb: 1 }}
            >
              © {new Date().getFullYear()} Sistema SiPP - Universidad de La Habana
            </Typography>
            <Typography 
              variant="caption" 
              color="grey.400"
              align={isMobile ? 'center' : 'left'}
            >
              Todos los derechos reservados
            </Typography>
          </Grid>

          {/* Versión del Sistema - ACTUALIZADO */}
          <Grid item xs={12} md={4}>
            <Typography 
              variant="body2" 
              align="center"
              sx={{ 
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1
              }}
            >
              <InfoIcon fontSize="small" />
              Versión 1.0
            </Typography>
            <Typography 
              variant="caption" 
              color="grey.400"
              align="center"
              sx={{ display: 'block' }}
            >
              Última actualización: Noviembre 2025
            </Typography>
          </Grid>

          {/* Desarrollado por - ACTUALIZADO */}
          <Grid item xs={12} md={4}>
            <Typography 
              variant="body2" 
              align={isMobile ? 'center' : 'right'}
              sx={{ mb: 1 }}
            >
              Desarrollado por:
            </Typography>
            <Typography 
              variant="caption" 
              color="grey.400"
              align={isMobile ? 'center' : 'right'}
              sx={{ display: 'block' }}
            >
              Grupo de Desarrollo VRTD
              <br />
              Universidad de La Habana
            </Typography>
          </Grid>
        </Grid>

        {/* Línea divisoria */}
        <Divider sx={{ my: 2, backgroundColor: 'rgba(255,255,255,0.2)' }} />

        {/* Información adicional */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" color="grey.400">
            Sistema Integral de Pedidos para Proyectos (SiPP) - 
            Plataforma oficial de gestión de pedidos para proyectos universitarios
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

const Ayuda = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { currentUser } = useAuth();
  const { addNotification } = useNotifications();

  const [expanded, setExpanded] = useState(null);
  const [formData, setFormData] = useState({
    name: currentUser?.fullName || '',
    email: currentUser?.email || '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState({
    loading: false,
    success: false,
    error: null
  });

  // Preguntas frecuentes ACTUALIZADAS según especificaciones
  const faqs = [
    {
      question: "¿Cómo navegar en el sistema SiPP?",
      answer: (
        <Box>
          <Typography gutterBottom>
            Guía completa de navegación por interfaz:
          </Typography>
          <List sx={{ pl: 2 }}>
            <ListItem sx={{ display: 'list-item' }}>
              <ListItemText primary="1. Dashboard: Vista general de proyectos y pedidos activos" />
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
              <ListItemText primary="2. Proyectos: Gestión de proyectos con centro de costo y número único" />
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
              <ListItemText primary="3. Pedidos: Catálogo de productos y servicios, pedidos extras" />
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
              <ListItemText primary="4. Mensajes: Comunicación y seguimiento de pedidos" />
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
              <ListItemText primary="5. Reportes: Generación de reportes y actas de conformidad" />
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
              <ListItemText primary="6. Perfil: Gestión de cuenta y configuración personal" />
            </ListItem>
          </List>
        </Box>
      ),
      category: 'navegacion'
    },
    {
      question: "¿Cómo crear y gestionar proyectos?",
      answer: (
        <Box>
          <Typography gutterBottom>
            Gestión completa de proyectos por roles:
          </Typography>
          <List sx={{ pl: 2 }}>
            <ListItem sx={{ display: 'list-item' }}>
              <ListItemText primary="• Administradores: Pueden crear proyectos para cualquier usuario" />
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
              <ListItemText primary="• Usuarios normales: Solo pueden crear y gestionar sus propios proyectos" />
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
              <ListItemText primary="• Campos requeridos: Centro de costo (numérico) y número de proyecto (alfanumérico)" />
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
              <ListItemText primary="• El sistema valida automáticamente la unicidad de los proyectos" />
            </ListItem>
          </List>
          <Alert severity="info" sx={{ mt: 2 }}>
            <strong>Importante:</strong> El centro de costo y número de proyecto son la llave principal del sistema y no se pueden duplicar.
          </Alert>
        </Box>
      ),
      category: 'proyectos'
    },
    {
      question: "¿Cómo realizar pedidos y qué roles pueden hacer qué?",
      answer: (
        <Box>
          <Typography gutterBottom>
            Capacidades por rol en el módulo de pedidos:
          </Typography>
          <List sx={{ pl: 2 }}>
            <ListItem sx={{ display: 'list-item' }}>
              <ListItemText primary="• Todos los usuarios: Pueden realizar pedidos de productos y servicios" />
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
              <ListItemText primary="• Comerciales: Solo pueden ver catálogos, no realizar compras" />
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
              <ListItemText primary="• Administradores/Comerciales: Gestionan empresas y catálogos" />
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
              <ListItemText primary="• Validación automática de presupuesto con submayor oficial" />
            </ListItem>
          </List>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Los comerciales tienen acceso de solo lectura al catálogo y no pueden realizar pedidos.
          </Alert>
        </Box>
      ),
      category: 'pedidos'
    },
  {
    question: "¿Qué configuraciones puedo personalizar en las plantillas?",
    answer: (
      <Box>
        <Typography gutterBottom>
          Personalización avanzada de plantillas:
        </Typography>
        <List sx={{ pl: 2 }}>
          <ListItem sx={{ display: 'list-item' }}>
            <ListItemText primary="Encabezado institucional personalizable" />
          </ListItem>
          <ListItem sx={{ display: 'list-item' }}>
            <ListItemText primary="Logotipo de la universidad y departamento" />
          </ListItem>
          <ListItem sx={{ display: 'list-item' }}>
            <ListItemText primary="Información de contacto automática" />
          </ListItem>
          <ListItem sx={{ display: 'list-item' }}>
            <ListItemText primary="Firmas digitales preconfiguradas" />
          </ListItem>
          <ListItem sx={{ display: 'list-item' }}>
            <ListItemText primary="Campos de proyecto y presupuesto dinámicos" />
          </ListItem>
        </List>
      </Box>
    ),
    category: 'reportes'
  },
    {
      question: "¿Cómo generar plantillas de acta y reportes?",
      answer: (
        <Box>
          <Typography gutterBottom>
            Sistema de reportes y actas:
          </Typography>
          <Typography gutterBottom>
            Nueva funcionalidad: Generación de plantillas anticipadas
          </Typography>
          <List sx={{ pl: 2 }}>
            <ListItem sx={{ display: 'list-item' }}>
              <ListItemText primary="En la interfaz de Ayuda, selecciona la pestaña 'Reportes' y al final se encuentra la sección 'Plantillas y Herramientas'" />
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
              <ListItemText primary="Elige entre plantillas de acta o reportes técnicos" />
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
              <ListItemText primary="Descarga en formato PDF listo para usar" />
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
              <ListItemText primary="Completa los datos requeridos" />
            </ListItem>
          </List>
          
          {/* Sección de Plantillas y Herramientas */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ color: COLORS.borgundy, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              <DescriptionIcon />
              Plantillas y Herramientas
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card sx={{ border: `1px solid ${COLORS.shellstone}`, backgroundColor: COLORS.swanWhite }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color: COLORS.borgundy }}>
                      Plantillas de Acta de Conformidad
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2, color: COLORS.sapphire }}>
                      Descarga plantillas predefinidas para actas de conformidad
                    </Typography>
                    <Button
                      variant="outlined"
                      onClick={generarPlantillaActa}
                      startIcon={<DownloadIcon />}
                      sx={{ 
                        borderColor: COLORS.borgundy, 
                        color: COLORS.borgundy,
                        '&:hover': { backgroundColor: `${COLORS.borgundy}10` }
                      }}
                    >
                      Descargar Plantilla Acta Básica
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card sx={{ border: `1px solid ${COLORS.shellstone}`, backgroundColor: COLORS.swanWhite }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color: COLORS.borgundy }}>
                      Plantillas de Reportes
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2, color: COLORS.sapphire }}>
                      Modelos para reportes técnicos y estadísticos
                    </Typography>
                    <Button
                      variant="outlined"
                      onClick={generarPlantillaReporte}
                      startIcon={<DownloadIcon />}
                      sx={{ 
                        borderColor: COLORS.borgundy, 
                        color: COLORS.borgundy,
                        '&:hover': { backgroundColor: `${COLORS.borgundy}10` }
                      }}
                    >
                      Descargar Plantilla Reporte
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
          <Alert severity="success" sx={{ mt: 2 }}>
            <strong>IMPORTANTE:</strong> Las plantillas generadas están validadas por la Dirección DST.
          </Alert>
        </Box>
      ),
      category: 'reportes'
    },
    {
      question: "¿Cómo funciona el sistema de mensajes y notificaciones?",
      answer: (
        <Box>
          <Typography gutterBottom>
            Comunicación y seguimiento en tiempo real:
          </Typography>
          <List sx={{ pl: 2 }}>
            <ListItem sx={{ display: 'list-item' }}>
              <ListItemText primary="• Notificaciones automáticas para cambios de estado de pedidos" />
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
              <ListItemText primary="• Mensajes directos con administradores para consultas específicas" />
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
              <ListItemText primary="• Sistema de archivado para organizar pedidos antiguos" />
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
              <ListItemText primary="• Los pedidos se separan automáticamente en Productos y Servicios" />
            </ListItem>
          </List>
        </Box>
      ),
      category: 'mensajes'
    },
    {
      question: "Guía de solución de problemas técnicos",
      answer: (
        <Box>
          <Typography gutterBottom>
            Solución inmediata a inconvenientes frecuentes:
          </Typography>
          <List sx={{ pl: 2 }}>
            <ListItem sx={{ display: 'list-item' }}>
              <ListItemText primary="1. Error de carga: Verificar conexión a internet y limpiar cache del navegador" />
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
              <ListItemText primary="2. Problemas con PDF: Actualizar lector de PDF o usar Chrome/Edge" />
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
              <ListItemText primary="3. Acceso denegado: Verificar permisos de usuario con administrador" />
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
              <ListItemText primary="4. Datos no actualizados: Recargar página (F5) o cerrar sesión y volver a entrar" />
            </ListItem>
          </List>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Si el problema persiste, contacte al soporte técnico usando el formulario de contacto.
          </Typography>
        </Box>
      ),
      category: 'soporte'
    }
  ];

  const categories = [
    { key: 'all', label: 'Todas', icon: HelpIcon },
    { key: 'navegacion', label: 'Navegación', icon: DashboardIcon },
    { key: 'proyectos', label: 'Proyectos', icon: AssessmentIcon },
    { key: 'pedidos', label: 'Pedidos', icon: ShoppingBagIcon },
    { key: 'reportes', label: 'Reportes', icon: DescriptionIcon },
    { key: 'mensajes', label: 'Mensajes', icon: MessageIcon },
    { key: 'soporte', label: 'Soporte', icon: EmailIcon },
  ];

  const [activeCategory, setActiveCategory] = useState('all');
  const filteredFaqs = activeCategory === 'all'
    ? faqs
    : faqs.filter(faq => faq.category === activeCategory);

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.message.trim() || !formData.subject.trim()) {
      setStatus({
        loading: false,
        success: false,
        error: 'El asunto y mensaje son obligatorios'
      });
      return;
    }

    setStatus({ loading: true, success: false, error: null });

    try {
      // Simular envío de correo al administrador
      const adminEmail = "admin.sipp@uh.cu";
      const emailData = {
        to: adminEmail,
        from: formData.email,
        subject: `[SOPORTE SiPP] ${formData.subject}`,
        message: `
          Nueva solicitud de soporte del sistema SiPP:
          
          Usuario: ${formData.name}
          Email: ${formData.email}
          Área: ${currentUser?.area || 'No especificada'}
          Rol: ${currentUser?.role || 'No especificado'}
          Fecha: ${new Date().toLocaleString('es-ES')}
          
          Asunto: ${formData.subject}
          
          Mensaje:
          ${formData.message}
          
          ---
          Este mensaje fue generado automáticamente desde el sistema SiPP.
        `
      };

      // Guardar en el sistema de mensajes
      const systemMessage = {
        id: `help-${Date.now()}`,
        type: 'soporte',
        title: `Solicitud de Soporte: ${formData.subject}`,
        content: formData.message,
        user: formData.name,
        userId: currentUser?.id,
        userEmail: formData.email,
        userRole: currentUser?.role,
        date: new Date().toISOString(),
        status: 'pendiente',
        priority: 'alta',
        area: currentUser?.area || 'Soporte'
      };

      const savedMessages = JSON.parse(localStorage.getItem('OASiS_messages') || '[]');
      localStorage.setItem('OASiS_messages', JSON.stringify([systemMessage, ...savedMessages]));

      // También guardar en mensajes de ayuda específicos
      const helpMessages = JSON.parse(localStorage.getItem('OASiS_help_requests') || '[]');
      localStorage.setItem('OASiS_help_requests', JSON.stringify([systemMessage, ...helpMessages]));

      // Notificación al usuario
      addNotification({
        title: 'Mensaje enviado',
        message: 'Tu consulta ha sido enviada al administrador. Recibirás respuesta por correo electrónico.',
        type: 'success'
      });

      setStatus({ loading: false, success: true, error: null });
      setFormData(prev => ({ ...prev, message: '', subject: '' }));
      
    } catch (error) {
      setStatus({
        loading: false,
        success: false,
        error: 'Error al enviar el mensaje. Por favor intenta nuevamente.'
      });
      console.error('Error al enviar mensaje:', error);
    }
  };

  const handleCloseSnackbar = () => {
    setStatus(prev => ({ ...prev, error: null, success: false }));
  };

  const handleDownloadGuide = () => {
    generarGuiaSiPP();
    addNotification({
      title: 'Guía descargada',
      message: 'La guía completa de usuario se está descargando en formato PDF',
      type: 'info'
    });
  };

  return (
    <Box sx={{ 
      p: isMobile ? 2 : 4,
      minHeight: '100vh',
      backgroundColor: COLORS.paper, 
      mt: 2
    }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 700,
            color: COLORS.borgundy, // Cambiado
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            flexWrap: 'wrap'
          }}
        >
          <HelpIcon sx={{ fontSize: '2.5rem', color: COLORS.borgundy }} /> {/* Cambiado */}
          Centro de Ayuda SiPP
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Encuentra respuestas a tus preguntas y guías completas del sistema
        </Typography>
        
        {/* Botón de descarga de guía */}
        <Button
          variant="contained"
          startIcon={<ArticleIcon />}
          onClick={handleDownloadGuide}
          sx={{
            backgroundColor: COLORS.borgundy, // Cambiado
            '&:hover': { 
              backgroundColor: COLORS.sapphire, // Cambiado
              transform: 'translateY(-2px)',
              boxShadow: `0 4px 12px ${COLORS.borgundy}40`
            },
            mb: 3,
            px: 4,
            py: 1.5,
            fontWeight: 'bold',
            transition: 'all 0.3s ease'
          }}
        >
          Descargar Guía Completa de Usuario (PDF)
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Preguntas Frecuentes - Mejorada la responsividad */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: 3,
            height: '100%',
            backgroundColor: COLORS.swanWhite, // Cambiado
            border: `1px solid ${COLORS.shellstone}` // Cambiado
          }}>
            <CardContent sx={{ p: isMobile ? 2 : 3 }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 3,
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? 2 : 0
              }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    color: COLORS.borgundy, // Cambiado
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <ArticleIcon sx={{ color: COLORS.borgundy }} /> {/* Cambiado */}
                  Preguntas Frecuentes
                </Typography>
                
                {/* Filtros responsive mejorados */}
                <Box sx={{ 
                  display: 'flex', 
                  gap: 1, 
                  flexWrap: 'wrap',
                  justifyContent: isMobile ? 'center' : 'flex-end',
                  maxWidth: isMobile ? '100%' : 'auto'
                }}>
                  {categories.map((cat) => (
                    <Tooltip key={cat.key} title={cat.label}>
                      <Chip
                        icon={<cat.icon sx={{ color: 'inherit' }} />}
                        label={isMobile ? '' : cat.label}
                        onClick={() => setActiveCategory(cat.key)}
                        color={activeCategory === cat.key ? 'primary' : 'default'}
                        variant={activeCategory === cat.key ? 'filled' : 'outlined'}
                        sx={{ 
                          fontWeight: 500,
                          mb: isMobile ? 0.5 : 0,
                          minWidth: isMobile ? 40 : 'auto',
                          backgroundColor: activeCategory === cat.key ? COLORS.borgundy : 'transparent', // Cambiado
                          color: activeCategory === cat.key ? 'white' : COLORS.borgundy, // Cambiado
                          borderColor: COLORS.shellstone, // Cambiado
                          '&:hover': {
                            backgroundColor: activeCategory === cat.key ? COLORS.sapphire : COLORS.tan, // Cambiado
                            color: 'white'
                          }
                        }}
                        size={isMobile ? 'small' : 'medium'}
                      />
                    </Tooltip>
                  ))}
                </Box>
              </Box>

              {/* FAQs */}
              <Box sx={{ 
                maxHeight: isMobile ? '500px' : '600px',
                overflowY: 'auto',
                pr: 1,
                '&::-webkit-scrollbar': {
                  width: '6px'
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: COLORS.swanWhite // Cambiado
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: COLORS.borgundy, // Cambiado
                  borderRadius: '3px'
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  backgroundColor: COLORS.sapphire // Cambiado
                }
              }}>
                {filteredFaqs.length === 0 ? (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    No hay preguntas en esta categoría.
                  </Alert>
                ) : (
                  filteredFaqs.map((faq, index) => (
                    <Accordion
                      key={index}
                      expanded={expanded === `panel${index}`}
                      onChange={handleAccordionChange(`panel${index}`)}
                      sx={{
                        mb: 1,
                        borderRadius: 2,
                        '&:before': { display: 'none' },
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        border: `1px solid ${COLORS.shellstone}`, // Cambiado
                        backgroundColor: COLORS.swanWhite, // Cambiado
                        '&:hover': {
                          borderColor: COLORS.tan, // Cambiado
                          backgroundColor: `${COLORS.tan}15` // Color con transparencia
                      }
                    }}
                    >
                      <AccordionSummary 
                        expandIcon={<ExpandMoreIcon />}
                        sx={{ 
                          minHeight: '60px',
                          '&:hover': {
                            backgroundColor: '#f5f5f5'
                          }
                        }}
                      >
                        <Typography fontWeight="500" variant={isMobile ? "body2" : "body1"} sx={{ color: COLORS.borgundy }}> {/* Cambiado */}
                          {faq.question}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails sx={{ 
                        backgroundColor: `${COLORS.swanWhite}`, // Cambiado
                        borderTop: `1px solid ${COLORS.shellstone}` // Cambiado
                      }}>
                      {faq.answer}
                      </AccordionDetails>
                    </Accordion>
                  ))
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Contacto */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: 3,
            height: '100%',
            backgroundColor: COLORS.swanWhite, // Cambiado
            border: `1px solid ${COLORS.shellstone}` // Cambiado
          }}>
            <CardContent sx={{ p: isMobile ? 2 : 3 }}>
              <Typography
                variant="h5"
                gutterBottom
                sx={{
                  fontWeight: 600,
                  color: COLORS.borgundy, // Cambiado
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 3
                }}
              >
                <EmailIcon sx={{ color: COLORS.borgundy }} /> {/* Cambiado */}
                Contactar Soporte
              </Typography>

              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Nombre Completo"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                  disabled
                  size={isMobile ? "small" : "medium"}
                  sx={{ 
                    backgroundColor: `${COLORS.swanWhite}`, // Cambiado
                    borderRadius: 1,
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: COLORS.shellstone, // Cambiado
                      },
                      '&:hover fieldset': {
                        borderColor: COLORS.tan, // Cambiado
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: COLORS.borgundy, // Cambiado
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: COLORS.sapphire, // Cambiado
                    },
                    '& .MuiInputBase-input.Mui-disabled': {
                      WebkitTextFillColor: COLORS.borgundy // Cambiado
                    }
                  }}
                />

                <TextField
                  fullWidth
                  label="Correo Electrónico"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                  disabled
                  size={isMobile ? "small" : "medium"}
                  sx={{ 
                    backgroundColor: `${COLORS.swanWhite}`, // Cambiado
                    borderRadius: 1,
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: COLORS.shellstone, // Cambiado
                      },
                      '&:hover fieldset': {
                        borderColor: COLORS.tan, // Cambiado
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: COLORS.borgundy, // Cambiado
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: COLORS.sapphire, // Cambiado
                    },
                    '& .MuiInputBase-input.Mui-disabled': {
                      WebkitTextFillColor: COLORS.borgundy // Cambiado
                    }
                  }}
                />

                <TextField
                  fullWidth
                  label="Asunto"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                  size={isMobile ? "small" : "medium"}
                  placeholder="Ej: Problema con pedidos, duda sobre reportes..."
                />

                <TextField
                  fullWidth
                  label="Describe tu consulta o problema"
                  name="message"
                  multiline
                  rows={4}
                  value={formData.message}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                  size={isMobile ? "small" : "medium"}
                  placeholder="Proporciona todos los detalles necesarios para ayudarte mejor..."
                />

                <Button
                  type="submit"
                  variant="contained"
                  disabled={status.loading || !formData.message.trim() || !formData.subject.trim()}
                  startIcon={status.loading ? <CircularProgress size={20} /> : <SendIcon />}
                  fullWidth
                  sx={{
                    backgroundColor: COLORS.borgundy, // Cambiado
                    '&:hover': { 
                      backgroundColor: COLORS.sapphire, // Cambiado
                      transform: 'translateY(-2px)',
                      boxShadow: `0 4px 12px ${COLORS.borgundy}40`
                    },
                    mt: 2,
                    py: 1.5,
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {status.loading ? 'Enviando...' : 'Enviar al Administrador'}
                </Button>
              </form>

               <Divider sx={{ 
                my: 3, 
                backgroundColor: COLORS.shellstone // Cambiado
              }} />

              {/* Información de Contacto con fondo crema */}
              <Paper 
                sx={{ 
                  backgroundColor: `${COLORS.tan}15`, // Color con transparencia
                  borderRadius: 2,
                  p: 2,
                  border: `1px solid ${COLORS.tan}` // Cambiado
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    color: COLORS.borgundy, // Cambiado
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <InfoIcon sx={{ color: COLORS.borgundy }} /> {/* Cambiado */}
                  Información de Contacto
                </Typography>

                <List dense>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <EmailIcon sx={{ color: COLORS.borgundy }} fontSize="small" /> {/* Cambiado */}
                    </ListItemIcon>
                    <ListItemText
                      primary="gestion.dst@iris.uh.cu"
                      secondary="Grupo de Gestión Comercial DST"
                      primaryTypographyProps={{ sx: { color: COLORS.borgundy, fontWeight: 500 } }} // Cambiado
                      secondaryTypographyProps={{ sx: { color: COLORS.sapphire } }} // Cambiado
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <PhoneIcon sx={{ color: COLORS.borgundy }} fontSize="small" /> {/* Cambiado */}
                    </ListItemIcon>
                    <ListItemText
                      primary="+53 7 8730 1190"
                      secondary="Lunes a Viernes, 8:00 AM - 4:00 PM"
                      primaryTypographyProps={{ sx: { color: COLORS.borgundy, fontWeight: 500 } }} // Cambiado
                      secondaryTypographyProps={{ sx: { color: COLORS.sapphire } }} // Cambiado
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <PeopleIcon sx={{ color: COLORS.borgundy }} fontSize="small" /> {/* Cambiado */}
                    </ListItemIcon>
                    <ListItemText
                      primary="Grupo de Desarrollo VRTD"
                      secondary="Universidad de La Habana"
                      primaryTypographyProps={{ sx: { color: COLORS.borgundy, fontWeight: 500 } }} // Cambiado
                      secondaryTypographyProps={{ sx: { color: COLORS.sapphire } }} // Cambiado
                    />
                  </ListItem>
                </List>

              </Paper>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={status.success || !!status.error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={status.success ? 'success' : 'error'}
          sx={{ 
            width: isMobile ? '90%' : 'auto',
            '& .MuiAlert-icon': {
              color: status.success ? COLORS.borgundy : undefined // Cambiado
            }
          }}
        >
          {status.success
            ? 'Mensaje enviado con éxito. El administrador te contactará pronto por correo electrónico.'
            : status.error}
        </Alert>
      </Snackbar>

      {/* Footer actualizado */}
      <FooterAyuda />
    </Box>
  );
};

export default Ayuda;