import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  Chip,
  Tooltip,
  Grid,
  LinearProgress,
  Collapse,
  Divider,
  Snackbar,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import {
  Link as LinkIcon,
  Close as CloseIcon,
  Info as InfoIcon,
  ContentCopy as CopyIcon,
  ShoppingCart as ProductIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  OpenInNew as OpenInNewIcon,
  Refresh as RefreshIcon,
  CloudDownload as CloudDownloadIcon,
  CloudOff as CloudOffIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

// Simulación de API de scraping
const mockScrapingAPI = async (url, companyName) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulación de éxito/fallo
      const shouldSucceed = Math.random() > 0.3;
      
      if (shouldSucceed) {
        const mockProducts = Array.from({ length: 8 }, (_, i) => ({
          id: `prod_${Date.now()}_${i}`,
          name: `Producto ${companyName || 'Demo'} ${i + 1}`,
          model: `MOD-${1000 + i}`,
          price: parseFloat((Math.random() * 1000 + 50).toFixed(2)),
          description: `Descripción del producto ${i + 1} de ${companyName || 'la empresa'}`,
          stock: Math.floor(Math.random() * 100),
          category: ['Electrónica', 'Hogar', 'Oficina', 'Tecnología'][i % 4],
          availability: 'Disponible',
          scraped: true,
          timestamp: new Date().toISOString()
        }));
        resolve({
          success: true,
          products: mockProducts,
          metadata: {
            source: url,
            timestamp: new Date().toISOString(),
            itemsCount: mockProducts.length,
            estimatedValue: mockProducts.reduce((sum, p) => sum + p.price, 0).toFixed(2)
          }
        });
      } else {
        reject(new Error('No se pudo acceder al sitio web. Verifique la URL o intente más tarde.'));
      }
    }, 2000);
  });
};

const WebScraper = ({ 
  onProductsScraped, 
  onScrapingFailure, 
  companyName = '',
  websiteUrl = '',
  onUrlChange = () => {},
  autoScrape = false
}) => {
  const theme = useTheme();
  const colors = {
    primary: theme.palette.primary.main,
    secondary: theme.palette.secondary.main,
    background: theme.palette.background.paper,
    paper: theme.palette.background.paper,
    text: {
      primary: theme.palette.text.primary,
      secondary: theme.palette.text.secondary
    },
    error: theme.palette.error.main,
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    info: theme.palette.info.main
  };

  // Estados
  const [url, setUrl] = useState(websiteUrl);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [scrapedProducts, setScrapedProducts] = useState([]);
  const [showInstructions, setShowInstructions] = useState(true);
  const [scrapingMetadata, setScrapingMetadata] = useState(null);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Efecto para auto-scrape
  useEffect(() => {
    if (autoScrape && url && url.trim() !== '') {
      handleScrape();
    }
  }, [autoScrape, url]);

  // Simular progreso durante scraping
  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setProgress((oldProgress) => {
          if (oldProgress >= 90) {
            clearInterval(interval);
            return 90;
          }
          return oldProgress + 10;
        });
      }, 300);
    }
    return () => {
      clearInterval(interval);
    };
  }, [loading]);

  // Función de scraping
  const handleScrape = useCallback(async () => {
    if (!url.trim()) {
      setError('Por favor, ingrese una URL válida');
      showNotification('Ingrese una URL válida', 'warning');
      return;
    }

    // Validar URL
    try {
      new URL(url);
    } catch (e) {
      setError('URL inválida. Debe comenzar con http:// o https://');
      showNotification('URL inválida', 'error');
      return;
    }

    setLoading(true);
    setError('');
    setProgress(0);
    setScrapedProducts([]);
    setScrapingMetadata(null);

    try {
      const response = await mockScrapingAPI(url, companyName);
      
      setProgress(100);
      
      if (response.success && response.products.length > 0) {
        setScrapedProducts(response.products);
        setScrapingMetadata(response.metadata);
        
        showNotification(`${response.products.length} productos extraídos exitosamente`, 'success');
        
        if (onProductsScraped) {
          onProductsScraped(response.products, response.metadata);
        }
      } else {
        throw new Error('No se encontraron productos en la página');
      }
    } catch (err) {
      console.error('Error en scraping:', err);
      setError(err.message || 'Error al extraer productos');
      setProgress(0);
      
      showNotification('Error al extraer productos', 'error');
      
      if (onScrapingFailure) {
        onScrapingFailure(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [url, companyName, onProductsScraped, onScrapingFailure]);

  const handleClear = () => {
    setUrl('');
    setScrapedProducts([]);
    setError('');
    setScrapingMetadata(null);
    setProgress(0);
    onUrlChange('');
    showNotification('Campos limpiados', 'info');
  };

  const handleUrlChange = (e) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    onUrlChange(newUrl);
    setError('');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => showNotification('URL copiada al portapapeles', 'success'))
      .catch(() => showNotification('Error al copiar', 'error'));
  };

  const showNotification = (message, severity = 'info') => {
    setSnackbarMessage(message);
    setShowSnackbar(true);
  };

  const handleCloseSnackbar = () => {
    setShowSnackbar(false);
  };

  // Calcular estadísticas
  const calculateStats = () => {
    if (scrapedProducts.length === 0) return null;
    
    const totalValue = scrapedProducts.reduce((sum, p) => sum + p.price, 0);
    const avgPrice = totalValue / scrapedProducts.length;
    const minPrice = Math.min(...scrapedProducts.map(p => p.price));
    const maxPrice = Math.max(...scrapedProducts.map(p => p.price));
    
    return {
      totalValue: totalValue.toFixed(2),
      avgPrice: avgPrice.toFixed(2),
      minPrice: minPrice.toFixed(2),
      maxPrice: maxPrice.toFixed(2)
    };
  };

  const stats = calculateStats();

  return (
    <>
      <Paper sx={{ 
        p: 3, 
        backgroundColor: colors.paper,
        borderRadius: 2,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: `1px solid ${theme.palette.divider}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 6px 24px rgba(0,0,0,0.12)'
        }
      }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3 
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LinkIcon color="primary" />
            <Typography variant="h6" sx={{ color: colors.primary, fontWeight: 600 }}>
              Web Scraper
            </Typography>
            {companyName && (
              <Chip 
                label={companyName} 
                size="small" 
                color="primary" 
                variant="outlined"
              />
            )}
          </Box>
          
          <Tooltip title={showInstructions ? "Ocultar instrucciones" : "Mostrar instrucciones"}>
            <IconButton 
              size="small" 
              onClick={() => setShowInstructions(!showInstructions)}
              sx={{ color: colors.text.secondary }}
            >
              {showInstructions ? <CloseIcon /> : <InfoIcon />}
            </IconButton>
          </Tooltip>
        </Box>

        {/* Instrucciones */}
        <Collapse in={showInstructions}>
          <Alert 
            severity="info" 
            icon={<InfoIcon />}
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => setShowInstructions(false)}
          >
            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
              Instrucciones para scraping web
            </Typography>
            <Typography variant="body2">
              1. Ingrese la URL del catálogo de productos<br />
              2. Asegúrese que la página sea accesible públicamente<br />
              3. El sistema extraerá productos automáticamente<br />
              4. Revise los productos extraídos antes de confirmar
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Chip 
                size="small" 
                label="Sitios compatibles" 
                variant="outlined" 
                sx={{ mr: 1 }}
              />
              <Chip 
                size="small" 
                label="E-commerce" 
                variant="outlined" 
                sx={{ mr: 1 }}
              />
              <Chip 
                size="small" 
                label="Catálogos HTML" 
                variant="outlined"
              />
            </Box>
          </Alert>
        </Collapse>

        {/* Campo de URL */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" gutterBottom fontWeight="medium" color={colors.text.secondary}>
            URL del sitio web
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <TextField
              fullWidth
              placeholder="https://www.ejemplo.com/productos"
              value={url}
              onChange={handleUrlChange}
              disabled={loading}
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: (
                  <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
                )
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: colors.primary,
                  },
                }
              }}
            />
            {url && (
              <Tooltip title="Copiar URL">
                <IconButton 
                  size="small" 
                  onClick={() => copyToClipboard(url)}
                  sx={{ 
                    border: 1, 
                    borderColor: theme.palette.divider,
                    color: colors.primary 
                  }}
                >
                  <CopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
          
          {error && (
            <Alert 
              severity="error" 
              sx={{ mt: 1 }}
              icon={<ErrorIcon />}
            >
              <Typography variant="body2">{error}</Typography>
            </Alert>
          )}
        </Box>

        {/* Progress Bar */}
        {loading && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color={colors.text.secondary}>
                Extrayendo productos...
              </Typography>
              <Typography variant="caption" color="primary" fontWeight="medium">
                {progress}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>
        )}

        {/* Botones de acción */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleScrape}
              disabled={loading || !url.trim()}
              startIcon={
                loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <CloudDownloadIcon />
                )
              }
              sx={{
                py: 1.2,
                borderRadius: 2,
                fontWeight: 600
              }}
            >
              {loading ? 'Procesando...' : 'Iniciar Scraping'}
            </Button>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleClear}
              disabled={loading}
              sx={{
                py: 1.2,
                borderRadius: 2
              }}
            >
              Limpiar todo
            </Button>
          </Grid>
        </Grid>

        {/* Resultados */}
        {scrapedProducts.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 3 }} />
            
            {/* Encabezado de resultados */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 2 
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ProductIcon color="success" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Productos Extraídos
                </Typography>
                <Chip 
                  label={`${scrapedProducts.length} items`} 
                  size="small" 
                  color="success"
                  sx={{ 
                    backgroundColor: colors.success,
                    color: 'white'
                  }}
                />
              </Box>
              
              {scrapingMetadata && (
                <Typography variant="caption" color={colors.text.secondary}>
                  {new Date(scrapingMetadata.timestamp).toLocaleTimeString()}
                </Typography>
              )}
            </Box>

            {/* Estadísticas */}
            {stats && (
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 2, 
                mb: 3,
                p: 2,
                backgroundColor: theme.palette.background.default,
                borderRadius: 2
              }}>
                <Box sx={{ textAlign: 'center', minWidth: 80 }}>
                  <Typography 
                    variant="caption" 
                    color={colors.text.secondary}
                    component="span"
                    sx={{ display: 'block' }}
                  >
                    Valor Total
                  </Typography>
                  <Typography variant="h6" color={colors.success} fontWeight="bold">
                    ${stats.totalValue}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', minWidth: 80 }}>
                  <Typography 
                    variant="caption" 
                    color={colors.text.secondary}
                    component="span"
                    sx={{ display: 'block' }}
                  >
                    Precio Promedio
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    ${stats.avgPrice}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', minWidth: 80 }}>
                  <Typography 
                    variant="caption" 
                    color={colors.text.secondary}
                    component="span"
                    sx={{ display: 'block' }}
                  >
                    Rango de Precios
                  </Typography>
                  <Typography variant="body2">
                    ${stats.minPrice} - ${stats.maxPrice}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Lista de productos */}
            <List dense sx={{ 
              maxHeight: 250, 
              overflow: 'auto',
              borderRadius: 2,
              border: 1,
              borderColor: theme.palette.divider,
              backgroundColor: colors.background
            }}>
              {scrapedProducts.map((product, index) => (
                <ListItem 
                  key={product.id}
                  sx={{ 
                    borderBottom: index < scrapedProducts.length - 1 ? 1 : 0,
                    borderColor: theme.palette.divider,
                    py: 1.5
                  }}
                  secondaryAction={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip 
                        label={`$${product.price}`} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                      <Chip 
                        label={`Stock: ${product.stock}`} 
                        size="small" 
                        color="default"
                      />
                    </Box>
                  }
                >
                  <ListItemAvatar sx={{ minWidth: 40 }}>
                    <Box sx={{ 
                      width: 32, 
                      height: 32, 
                      borderRadius: '50%', 
                      backgroundColor: colors.primary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white'
                    }}>
                      {index + 1}
                    </Box>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="body1" fontWeight="medium" noWrap component="div">
                        {product.name}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography 
                          variant="caption" 
                          color={colors.text.secondary} 
                          component="span"
                          sx={{ display: 'block', mb: 0.5 }}
                        >
                          {product.model} • {product.category}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          color={colors.text.secondary} 
                          component="span"
                          sx={{ display: 'block' }}
                        >
                          {product.description.substring(0, 60)}...
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Metadata */}
        {scrapingMetadata && (
          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: theme.palette.divider }}>
            <Typography variant="caption" color={colors.text.secondary}>
              <strong>Fuente:</strong> {scrapingMetadata.source.substring(0, 50)}...
              <br />
              <strong>Extraído el:</strong> {new Date(scrapingMetadata.timestamp).toLocaleString()}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity="info" 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

WebScraper.defaultProps = {
  companyName: '',
  websiteUrl: '',
  autoScrape: false,
  onUrlChange: () => {},
  onProductsScraped: () => {},
  onScrapingFailure: () => {}
};

export default WebScraper;