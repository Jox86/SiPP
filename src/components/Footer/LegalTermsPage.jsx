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
import { Home, Gavel } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const LegalTermsPage = () => {
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
            <Gavel sx={{ mr: 0.5 }} fontSize="inherit" />
            Términos de Servicio
          </Typography>
        </Breadcrumbs>

        <Paper elevation={isDarkMode ? 0 : 2} sx={styles.paper}>
          <Typography variant="h4" component="h1" gutterBottom color="primary" sx={{ mb: 3 }}>
            Términos de Servicio
          </Typography>
          <Typography variant="body1" sx={styles.bodyText}>
            Última actualización: {new Date().toLocaleDateString('es-ES')}
          </Typography>

          <Divider sx={styles.divider} />

          <Box component="section" sx={{ mb: 4 }}>
            <Typography variant="h5" sx={styles.sectionTitle}>
              1. Aceptación de los Términos
            </Typography>
            <Typography variant="body1" sx={styles.bodyText}>
              Al acceder y utilizar el Sistema Integral de Pedidos para Proyectos UH (SiPP), usted acepta 
              cumplir con estos términos de servicio y todas las leyes y regulaciones aplicables.
            </Typography>
          </Box>

          <Box component="section" sx={{ mb: 4 }}>
            <Typography variant="h5" sx={styles.sectionTitle}>
              2. Descripción del Servicio
            </Typography>
            <Typography variant="body1" sx={styles.bodyText}>
              SiPP es una plataforma digital desarrollada por la Universidad de La Habana para 
              gestionar pedidos de materiales, equipos y servicios relacionados con proyectos 
              académicos y de investigación.
            </Typography>
          </Box>

          <Box component="section" sx={{ mb: 4 }}>
            <Typography variant="h5" sx={styles.sectionTitle}>
              3. Registro y Cuenta
            </Typography>
            <Typography variant="body1" sx={styles.bodyText}>
              Para utilizar nuestros servicios, debe:
            </Typography>
            <Box component="ul" sx={{ pl: 3 }}>
              <li>
                <Typography variant="body1" sx={styles.listItem}>
                  Proporcionar información veraz y completa durante el registro
                </Typography>
              </li>
              <li>
                <Typography variant="body1" sx={styles.listItem}>
                  Mantener la confidencialidad de sus credenciales de acceso
                </Typography>
              </li>
              <li>
                <Typography variant="body1" sx={styles.listItem}>
                  Notificar inmediatamente cualquier uso no autorizado de su cuenta
                </Typography>
              </li>
            </Box>
          </Box>

          <Box component="section" sx={{ mb: 4 }}>
            <Typography variant="h5" sx={styles.sectionTitle}>
              4. Uso Aceptable
            </Typography>
            <Typography variant="body1" sx={styles.bodyText}>
              Usted se compromete a utilizar el sistema únicamente para fines legítimos relacionados 
              con actividades académicas y de investigación. Queda prohibido:
            </Typography>
            <Box component="ul" sx={{ pl: 3 }}>
              <li><Typography variant="body1" sx={styles.listItem}>Utilizar el sistema para actividades fraudulentas</Typography></li>
              <li><Typography variant="body1" sx={styles.listItem}>Intentar acceder a áreas restringidas sin autorización</Typography></li>
              <li><Typography variant="body1" sx={styles.listItem}>Cargar contenido malicioso o virus</Typography></li>
              <li><Typography variant="body1" sx={styles.listItem}>Realizar pedidos falsos o especulativos</Typography></li>
            </Box>
          </Box>

          <Box component="section" sx={{ mb: 4 }}>
            <Typography variant="h5" sx={styles.sectionTitle}>
              5. Propiedad Intelectual
            </Typography>
            <Typography variant="body1" sx={styles.bodyText}>
              Todos los derechos de propiedad intelectual sobre el sistema SiPP, incluyendo software, 
              diseño, logotipos y documentación, son propiedad de la Universidad de La Habana o de 
              sus licenciantes.
            </Typography>
          </Box>

          <Box component="section" sx={{ mb: 4 }}>
            <Typography variant="h5" sx={styles.sectionTitle}>
              6. Limitación de Responsabilidad
            </Typography>
            <Typography variant="body1" sx={styles.bodyText}>
              La Universidad de La Habana no será responsable por:
            </Typography>
            <Box component="ul" sx={{ pl: 3 }}>
              <li>
                <Typography variant="body1" sx={styles.listItem}>
                  Daños indirectos, incidentales o consecuentes
                </Typography>
              </li>
              <li>
                <Typography variant="body1" sx={styles.listItem}>
                  Interrupciones temporales del servicio por mantenimiento
                </Typography>
              </li>
              <li>
                <Typography variant="body1" sx={styles.listItem}>
                  Errores en la información proporcionada por los usuarios
                </Typography>
              </li>
            </Box>
          </Box>

          <Box component="section" sx={{ mb: 4 }}>
            <Typography variant="h5" sx={styles.sectionTitle}>
              7. Procesamiento de Pedidos
            </Typography>
            <Typography variant="body1" sx={styles.bodyText}>
              Todos los pedidos están sujetos a:
            </Typography>
            <Box component="ul" sx={{ pl: 3 }}>
              <li><Typography variant="body1" sx={styles.listItem}>Disponibilidad de recursos</Typography></li>
              <li><Typography variant="body1" sx={styles.listItem}>Aprobación del departamento correspondiente</Typography></li>
              <li><Typography variant="body1" sx={styles.listItem}>Presupuesto asignado al proyecto</Typography></li>
              <li><Typography variant="body1" sx={styles.listItem}>Plazos de entrega establecidos</Typography></li>
            </Box>
          </Box>

          <Box component="section" sx={{ mb: 4 }}>
            <Typography variant="h5" sx={styles.sectionTitle}>
              8. Modificaciones del Servicio
            </Typography>
            <Typography variant="body1" sx={styles.bodyText}>
              Nos reservamos el derecho de modificar, suspender o discontinuar cualquier aspecto del 
              servicio en cualquier momento, sin previo aviso.
            </Typography>
          </Box>

          <Box component="section" sx={{ mb: 4 }}>
            <Typography variant="h5" sx={styles.sectionTitle}>
              9. Ley Aplicable
            </Typography>
            <Typography variant="body1" sx={styles.bodyText}>
              Estos términos se rigen por las leyes de la República de Cuba. Cualquier disputa 
              relacionada con estos términos será resuelta en los tribunales competentes de La Habana.
            </Typography>
          </Box>

          <Box component="section" sx={{ mb: 4 }}>
            <Typography variant="h5" sx={styles.sectionTitle}>
              10. Modificaciones de los Términos
            </Typography>
            <Typography variant="body1" sx={styles.bodyText}>
              Podemos actualizar estos términos periódicamente. Las modificaciones entrarán en vigor 
              al ser publicadas en el sistema. El uso continuado del servicio constituye la aceptación 
              de los términos modificados.
            </Typography>
          </Box>

          <Box component="section">
            <Typography variant="h5" sx={styles.sectionTitle}>
              11. Contacto
            </Typography>
            <Typography variant="body1" sx={styles.bodyText}>
              Para consultas sobre estos términos de servicio, contacte a:
            </Typography>
            <Box component="ul" sx={{ pl: 3 }}>
              <li>
                <Typography variant="body1" sx={styles.listItem}>
                  <strong>Departamento:</strong> Vicerrectoría de Tecnología y Desarrollo
                </Typography>
              </li>
              <li>
                <Typography variant="body1" sx={styles.listItem}>
                  <strong>Email:</strong> legal@uh.cu
                </Typography>
              </li>
              <li>
                <Typography variant="body1" sx={styles.listItem}>
                  <strong>Teléfono:</strong> +53 7 7654321
                </Typography>
              </li>
            </Box>
          </Box>

          <Divider sx={styles.divider} />

          <Typography variant="body2" sx={{ 
            color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'text.secondary',
            textAlign: 'center'
          }}>
            © {new Date().getFullYear()} Universidad de La Habana. Todos los derechos reservados.
          </Typography>
        </Paper>
      </Container>
    </>
  );
};

export default LegalTermsPage;