// src/components/GuiaDescarga.jsx
import React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  Divider,
  Link
} from '@mui/material';
import { Article as ArticleIcon, Download as DownloadIcon } from '@mui/icons-material';

const GuiaDescarga = () => {
  // Función para descargar la guía
  const handleDownload = () => {
    // Simulación de descarga
    const link = document.createElement('a');
    link.href = '/src/docs/guia-sipp.pdf'; // Asegúrate de tener este archivo en public/docs/
    link.download = 'guia-sipp.pdf';
    link.click();
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 2, mt: 3, backgroundColor: '#f9f9f9' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <ArticleIcon color="primary" />
        <Typography variant="h6" fontWeight="bold" color="#4E0101">
          Guía del Sistema SiPP
        </Typography>
      </Box>

      <Typography variant="body1" paragraph>
        <strong>Descarga la guía oficial del sistema SiPP:</strong> Todo lo que necesitas saber sobre cómo utilizar el sistema, crear pedidos, gestionar proyectos, generar reportes y actas de conformidad.
      </Typography>

      <Alert severity="info" sx={{ mb: 2 }}>
        Incluye capturas de pantalla, flujos de trabajo, ejemplos prácticos y consejos para usuarios y administradores.
      </Alert>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
          sx={{
            backgroundColor: '#4E0101',
            '&:hover': { backgroundColor: '#6E0101' },
            fontWeight: 600
          }}
        >
          Descargar Guía (PDF)
        </Button>

        <Typography variant="body2" color="text.secondary">
          Tamaño: 2.4 MB • Formato: PDF • Versión: 1.0
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        ¿Tienes dudas? Consulta también el apartado de{' '}
        <Link
          component="button"
          variant="body2"
          onClick={() => {/* Navegar a Ayuda */}}
          sx={{ color: '#4E0101', textDecoration: 'underline' }}
        >
          Preguntas Frecuentes
        </Link>
        .
      </Typography>
    </Paper>
  );
};

export default GuiaDescarga;