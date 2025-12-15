// src/hooks/useCatalog.js
import { useState, useEffect } from 'react';

export const useCatalog = () => {
  const [catalogs, setCatalogs] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('SiPP_catalogs');
    if (saved) {
      setCatalogs(JSON.parse(saved));
    }
  }, []);

  const saveCatalog = (catalog) => {
    const existingIndex = catalogs.findIndex(c =>
      c.supplier === catalog.supplier &&
      c.company === catalog.company &&
      c.type === catalog.type &&
      c.dataType === catalog.dataType
    );

    let updated;
    if (existingIndex >= 0) {
      updated = [...catalogs];
      updated[existingIndex] = catalog;
    } else {
      updated = [...catalogs, catalog];
    }

    setCatalogs(updated);
    localStorage.setItem('SiPP_catalogs', JSON.stringify(updated));
  };

  const deleteProduct = (supplier, company, dataType, productId) => {
    const updated = catalogs.map(c => {
      if (c.supplier === supplier && c.company === company && c.dataType === dataType) {
        return {
          ...c,
          data: c.data.filter(p => p.id !== productId)
        };
      }
      return c;
    }).filter(c => c.data.length > 0);

    setCatalogs(updated);
    localStorage.setItem('SiPP_catalogs', JSON.stringify(updated));
  };

  const updateProduct = (supplier, company, dataType, product) => {
    const updated = catalogs.map(c => {
      if (c.supplier === supplier && c.company === company && c.dataType === dataType) {
        return {
          ...c,
          data: c.data.map(p => p.id === product.id ? product : p)
        };
      }
      return c;
    });

    setCatalogs(updated);
    localStorage.setItem('SiPP_catalogs', JSON.stringify(updated));
  };

  return { catalogs, saveCatalog, deleteProduct, updateProduct };
};