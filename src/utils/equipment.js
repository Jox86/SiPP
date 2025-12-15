// utils/equipment.js
export const parseExcelCatalog = (file) => {
  // Simulación: en producción usa `xlsx` o `sheetjs`
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { name: 'Switch', model: 'Cisco 2960', price: 1200 },
        { name: 'Procesador', model: 'Intel i7', price: 800 }
      ]);
    }, 1000);
  });
};

export const updateStock = (catalogId, itemId, quantity) => {
  // Actualiza stock en el catálogo
};