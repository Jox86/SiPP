// src/utils/imageCache.js
const imageCache = new Map();

export const getCachedImage = async (productName) => {
  const cacheKey = productName.toLowerCase();
  
  // Verificar caché
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey);
  }
  
  // Buscar imagen
  const imageUrl = await getImageForProduct(productName);
  
  // Almacenar en caché (con expiración opcional)
  imageCache.set(cacheKey, imageUrl);
  
  return imageUrl;
};

// Limpiar caché periódicamente
setInterval(() => {
  imageCache.clear();
}, 1000 * 60 * 60); // Cada hora