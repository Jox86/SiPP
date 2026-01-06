// src/components/Scraper/SimpleWebScraper.jsx
import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  Link as LinkIcon,
  Search as SearchIcon,
  AutoAwesome as AutoAwesomeIcon
} from '@mui/icons-material';

const SimpleWebScraper = ({ onProductsScraped, companyName }) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [products, setProducts] = useState([]);
  const [previewDialog, setPreviewDialog] = useState(false);

  const generateSampleProducts = (siteName) => {
    const categories = ['Electrónica', 'Computadoras', 'Periféricos', 'Redes', 'Accesorios'];
    const brands = ['HP', 'Dell', 'Lenovo', 'Samsung', 'Logitech', 'Cisco', 'TP-Link'];
    const types = ['Laptop', 'Monitor', 'Teclado', 'Mouse', 'Router', 'Switch', 'Disco Duro'];
    
    return Array.from({ length: 10 }, (_, i) => {
      const brand = brands[Math.floor(Math.random() * brands.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const name = `${brand} ${type} ${Math.floor(Math.random() * 1000) + 100}`;
      
      return {
        id: `sample_${Date.now()}_${i}`,
        name,
        model: `${brand.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 9000) + 1000}`,
        price: Math.floor(Math.random() * 500) + 50,
        image: '',
        description: `${type.toLowerCase()} de marca ${brand} obtenido de ${siteName}. Producto de calidad con garantía.`,
        stock: Math.floor(Math.random() * 20) + 5,
        availability: 'Disponible',
        category,
        scraped: true,
        sourceUrl: url,
        company: companyName || 'Empresa Web'
      };
    });
  };

  const scrapeWebsite = async () => {
    if (!url.trim()) {
      setError('Por favor ingrese una URL o nombre del sitio');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Simular procesamiento
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Extraer nombre del sitio para personalizar
      let siteName = 'la web';
      try {
        const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
        siteName = urlObj.hostname.replace('www.', '');
      } catch {
        siteName = url;
      }
      
      const sampleProducts = generateSampleProducts(siteName);
      setProducts(sampleProducts);
      
    } catch (err) {
      setError('Error al procesar. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const importProducts = () => {
    if (products.length > 0 && onProductsScraped) {
      onProductsScraped(products);
      setPreviewDialog(false);
      setProducts([]);
      setUrl('');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField
          fullWidth
          label="Sitio web o empresa"
          placeholder="ejemplo.com o nombre de la empresa"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          variant="outlined"
          size="small"
          InputProps={{
            startAdornment: <LinkIcon sx={{ mr: 1, color: 'action.active' }} />,
          }}
        />
        <Button
          variant="contained"
          onClick={scrapeWebsite}
          disabled={loading || !url.trim()}
          startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
          sx={{ minWidth: 120 }}
        >
          {loading ? 'Generando...' : 'Simular'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {products.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Alert 
            severity="success" 
            icon={<AutoAwesomeIcon />}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={() => setPreviewDialog(true)}
              >
                Ver productos
              </Button>
            }
            sx={{ mb: 2 }}
          >
            Se generaron {products.length} productos de muestra para {url}
          </Alert>
          
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={importProducts}
          >
            Importar {products.length} productos
          </Button>
        </Box>
      )}

      {/* Diálogo de preview */}
      <Dialog 
        open={previewDialog} 
        onClose={() => setPreviewDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Productos generados ({products.length})
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            {products.map((product) => (
              <Grid item xs={12} key={product.id}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {product.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Modelo: {product.model} | Precio: ${product.price} | Stock: {product.stock}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                      {product.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog(false)}>Cancelar</Button>
          <Button onClick={importProducts} variant="contained">Importar</Button>
        </DialogActions>
      </Dialog>

      {products.length === 0 && !loading && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            Este sistema genera productos de muestra basados en el nombre del sitio web.
            Ingrese cualquier URL o nombre de empresa para comenzar.
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default SimpleWebScraper;