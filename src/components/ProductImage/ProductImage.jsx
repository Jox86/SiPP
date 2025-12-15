// src/components/ProductImage/ProductImage.jsx
import React, { useState, useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { getImageForProduct, DEFAULT_IMAGE } from '../../utils/productImages';

const ProductImage = ({ productName, alt, className, sx, ...props }) => {
  const [imageUrl, setImageUrl] = useState(DEFAULT_IMAGE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      if (!productName) {
        setImageUrl(DEFAULT_IMAGE);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(false);

      try {
        // Obtener imagen usando la lógica mejorada
        const url = await getImageForProduct(productName);
        setImageUrl(url);
        
        // Verificar si la imagen se carga correctamente
        const img = new Image();
        img.onload = () => {
          setLoading(false);
        };
        img.onerror = () => {
          setImageUrl(DEFAULT_IMAGE);
          setError(true);
          setLoading(false);
        };
        img.src = url;
      } catch (err) {
        console.error('Error cargando imagen:', err);
        setImageUrl(DEFAULT_IMAGE);
        setError(true);
        setLoading(false);
      }
    };

    loadImage();
  }, [productName]);

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.paper',
        ...sx,
      }}
      className={className}
      {...props}
    >
      {loading && (
        <CircularProgress 
          size={24} 
          sx={{ 
            position: 'absolute',
            color: 'primary.main'
          }} 
        />
      )}
      
      <img
        src={imageUrl}
        alt={alt || productName || 'Producto'}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          opacity: loading ? 0 : 1,
          transition: 'opacity 0.3s ease',
        }}
        onError={(e) => {
          if (imageUrl !== DEFAULT_IMAGE) {
            e.target.src = DEFAULT_IMAGE;
            setError(true);
          }
        }}
      />
      
      {/* Indicador visual de error */}
      {error && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 4,
            right: 4,
            fontSize: '0.6rem',
            color: 'error.main',
            backgroundColor: 'rgba(255,255,255,0.8)',
            padding: '2px 4px',
            borderRadius: 1,
          }}
        >
          Usando logo
        </Box>
      )}
    </Box>
  );
};

export default ProductImage;