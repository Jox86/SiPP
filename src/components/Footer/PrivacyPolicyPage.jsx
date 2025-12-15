import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Link,
  Breadcrumbs,
  Divider,
  useTheme,
  CssBaseline
} from '@mui/material';
import { Home, PrivacyTip } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicyPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Detectar si el modo oscuro está activado
    const sidebar = document.querySelector('.sidebar');
    const darkModeEnabled = sidebar?.getAttribute('data-theme') === 'dark' || 
                           document.body.getAttribute('data-theme') === 'dark' ||
                           theme.palette.mode === 'dark';
    setIsDarkMode(darkModeEnabled);

    // Aplicar estilos de scrollbar
    const style = document.createElement('style');
    style.innerHTML = `
      ::-webkit-scrollbar {
        width: 12px;
      }
      ::-webkit-scrollbar-track {
        background: ${isDarkMode ? '#2a2a2a' : '#f1f1f1'};
        border-radius: 6px;
      }
      ::-webkit-scrollbar-thumb {
        background: ${isDarkMode ? '#555' : '#888'};
        border-radius: 6px;
        border: 3px solid ${isDarkMode ? '#2a2a2a' : '#f1f1f1'};
      }
      ::-webkit-scrollbar-thumb:hover {
        background: ${isDarkMode ? '#777' : '#666'};
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [isDarkMode, theme.palette.mode]);

  const styles = {
    container: {
      py: 4,
      minHeight: '100vh',
      backgroundColor: isDarkMode ? '#121212' : '#f5f5f5',
      transition: 'background-color 0.3s ease',
      overflow: 'auto'
    },
    paper: {
      p: 4,
      backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
      color: isDarkMode ? '#ffffff' : 'text.primary',
      border: isDarkMode ? '1px solid #333' : '1px solid #e0e0e0',
      transition: 'all 0.3s ease',
      maxHeight: '80vh',
      overflow: 'auto'
    },
    breadcrumbLink: {
      display: 'flex',
      alignItems: 'center',
      color: isDarkMode ? '#90caf9' : 'primary.main',
      textDecoration: 'none',
      '&:hover': {
        textDecoration: 'underline'
      }
    },
    sectionTitle: {
      color: isDarkMode ? '#ffffff' : 'text.primary',
      mb: 2,
      fontWeight: 'bold'
    },
    bodyText: {
      color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'text.secondary',
      lineHeight: 1.6,
      mb: 2
    },
    listItem: {
      color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'text.secondary',
      mb: 1
    },
    divider: {
      my: 3,
      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'
    }
  };

  return (
    <>
      <CssBaseline />
      <Container maxWidth="lg" sx={styles.container}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3, color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.primary' }}>
          <Link
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
            }}
            sx={styles.breadcrumbLink}
          >
            <Home sx={{ mr: 0.5 }} fontSize="inherit" />
            Inicio
          </Link>
          <Typography color="inherit" sx={{ display: 'flex', alignItems: 'center' }}>
            <PrivacyTip sx={{ mr: 0.5 }} fontSize="inherit" />
            Política de Privacidad
          </Typography>
        </Breadcrumbs>

        <Paper elevation={isDarkMode ? 0 : 2} sx={styles.paper}>
          <Typography variant="h4" component="h1" gutterBottom color="primary" sx={{ mb: 3 }}>
            Política de Privacidad
          </Typography>
          <Typography variant="body1" sx={styles.bodyText}>
            Última actualización: {new Date().toLocaleDateString('es-ES')}
          </Typography>

          <Divider sx={styles.divider} />

          <Box component="section" sx={{ mb: 4 }}>
            <Typography variant="h5" sx={styles.sectionTitle}>
              1. Introducción
            </Typography>
            <Typography variant="body1" sx={styles.bodyText}>
              En el Sistema Integral de Pedidos para Proyectos UH (SiPP), valoramos y respetamos su privacidad. 
              Esta política describe cómo recopilamos, usamos y protegemos su información personal cuando 
              utiliza nuestro sistema.
            </Typography>
          </Box>

          <Box component="section" sx={{ mb: 4 }}>
            <Typography variant="h5" sx={styles.sectionTitle}>
              2. Información que Recopilamos
            </Typography>
            <Typography variant="body1" sx={styles.bodyText}>
              Recopilamos la siguiente información:
            </Typography>
            <Box component="ul" sx={{ pl: 3 }}>
              <li>
                <Typography variant="body1" sx={styles.listItem}>
                  <strong>Información personal:</strong> Nombre completo, dirección de correo electrónico, 
                  número de teléfono, área de trabajo.
                </Typography>
              </li>
              <li>
                <Typography variant="body1" sx={styles.listItem}>
                  <strong>Información de proyectos:</strong> Datos relacionados con los proyectos 
                  académicos y de investigación.
                </Typography>
              </li>
              <li>
                <Typography variant="body1" sx={styles.listItem}>
                  <strong>Datos de uso:</strong> Información sobre cómo interactúa con nuestro sistema.
                </Typography>
              </li>
            </Box>
          </Box>

          <Box component="section" sx={{ mb: 4 }}>
            <Typography variant="h5" sx={styles.sectionTitle}>
              3. Uso de la Información
            </Typography>
            <Typography variant="body1" sx={styles.bodyText}>
              Utilizamos su información para:
            </Typography>
            <Box component="ul" sx={{ pl: 3 }}>
              <li><Typography variant="body1" sx={styles.listItem}>Gestionar y procesar pedidos de proyectos</Typography></li>
              <li><Typography variant="body1" sx={styles.listItem}>Comunicarnos sobre el estado de sus solicitudes</Typography></li>
              <li><Typography variant="body1" sx={styles.listItem}>Mejorar nuestros servicios</Typography></li>
              <li><Typography variant="body1" sx={styles.listItem}>Cumplir con obligaciones legales</Typography></li>
            </Box>
          </Box>

          <Box component="section" sx={{ mb: 4 }}>
            <Typography variant="h5" sx={styles.sectionTitle}>
              4. Protección de Datos
            </Typography>
            <Typography variant="body1" sx={styles.bodyText}>
              Implementamos medidas de seguridad técnicas y organizativas para proteger su información 
              contra accesos no autorizados, pérdida o alteración. Todos los datos se almacenan en 
              servidores seguros y el acceso está restringido al personal autorizado.
            </Typography>
          </Box>

          <Box component="section" sx={{ mb: 4 }}>
            <Typography variant="h5" sx={styles.sectionTitle}>
              5. Derechos del Usuario
            </Typography>
            <Typography variant="body1" sx={styles.bodyText}>
              Usted tiene derecho a:
            </Typography>
            <Box component="ul" sx={{ pl: 3 }}>
              <li><Typography variant="body1" sx={styles.listItem}>Acceder a sus datos personales</Typography></li>
              <li><Typography variant="body1" sx={styles.listItem}>Rectificar información inexacta</Typography></li>
              <li><Typography variant="body1" sx={styles.listItem}>Solicitar la eliminación de sus datos</Typography></li>
              <li><Typography variant="body1" sx={styles.listItem}>Oponerse al procesamiento de sus datos</Typography></li>
              <li><Typography variant="body1" sx={styles.listItem}>Portabilidad de datos</Typography></li>
            </Box>
          </Box>

          <Box component="section" sx={{ mb: 4 }}>
            <Typography variant="h5" sx={styles.sectionTitle}>
              6. Cookies y Tecnologías Similares
            </Typography>
            <Typography variant="body1" sx={styles.bodyText}>
              Utilizamos cookies para mejorar su experiencia en nuestro sitio web. Puede configurar 
              su navegador para rechazar cookies, aunque esto puede afectar la funcionalidad del sistema.
            </Typography>
          </Box>

          <Box component="section" sx={{ mb: 4 }}>
            <Typography variant="h5" sx={styles.sectionTitle}>
              7. Cambios en la Política
            </Typography>
            <Typography variant="body1" sx={styles.bodyText}>
              Nos reservamos el derecho de modificar esta política de privacidad. Las actualizaciones 
              se publicarán en esta página con la fecha de última modificación.
            </Typography>
          </Box>

          <Box component="section">
            <Typography variant="h5" sx={styles.sectionTitle}>
              8. Contacto
            </Typography>
            <Typography variant="body1" sx={styles.bodyText}>
              Para cualquier pregunta sobre esta política de privacidad o el tratamiento de sus datos, 
              puede contactarnos a través de:
            </Typography>
            <Box component="ul" sx={{ pl: 3 }}>
              <li>
                <Typography variant="body1" sx={styles.listItem}>
                  <strong>Correo electrónico:</strong> privacidad@uh.cu
                </Typography>
              </li>
              <li>
                <Typography variant="body1" sx={styles.listItem}>
                  <strong>Teléfono:</strong> +53 7 1234567
                </Typography>
              </li>
              <li>
                <Typography variant="body1" sx={styles.listItem}>
                  <strong>Dirección:</strong> Departamento de Servicios Tecnológicos, Universidad de La Habana
                </Typography>
              </li>
            </Box>
          </Box>

          <Divider sx={styles.divider} />

          <Typography variant="body2" sx={{ 
            color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'text.secondary',
            textAlign: 'center'
          }}>
            Esta política de privacidad está sujeta a las leyes de protección de datos de la República de Cuba.
          </Typography>
        </Paper>
      </Container>
    </>
  );
};

export default PrivacyPolicyPage;