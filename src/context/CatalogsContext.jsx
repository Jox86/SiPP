// src/context/CatalogsContext.jsx
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

// Crear el contexto
const CatalogsContext = createContext(null);

// Hook personalizado
export const useCatalogs = () => {
  const context = useContext(CatalogsContext);
  if (!context) {
    throw new Error('useCatalogs debe usarse dentro de un CatalogsProvider');
  }
  return context;
};

// Proveedor del contexto
export const CatalogsProvider = ({ children }) => {
  const [catalogs, setCatalogs] = useState([]);

  // Cargar catálogos desde localStorage
  useEffect(() => {
    const saved = localStorage.getItem('SiPP_catalogs');
    if (saved) {
      setCatalogs(JSON.parse(saved));
    }
  }, []);

  // Guardar en localStorage cuando cambie
  useEffect(() => {
    if (catalogs.length > 0) {
      localStorage.setItem('SiPP_catalogs', JSON.stringify(catalogs));
    }
  }, [catalogs]);

  // Agrupar por empresa
  const companyList = useMemo(() => {
    return catalogs.reduce((acc, c) => {
      const key = `${c.company}-${c.supplier}`;
      if (!acc[key]) {
        acc[key] = { ...c, products: [], services: [], lastUpdated: c.updatedAt };
      }
      if (c.dataType === 'products') acc[key].products = c.data;
      if (c.dataType === 'services') acc[key].services = c.data;
      if (new Date(c.updatedAt) > new Date(acc[key].lastUpdated)) {
        acc[key].lastUpdated = c.updatedAt;
      }
      return acc;
    }, {});
  }, [catalogs]);

  const companies = useMemo(() => Object.values(companyList), [companyList]);

  const allProducts = useMemo(() => {
    return catalogs
      .filter((c) => c.dataType === 'products')
      .flatMap((c) =>
        c.data.map((p) => ({
          ...p,
          company: c.company,
          supplier: c.supplier,
          companyColor: c.color || '#4E0101',
        }))
      );
  }, [catalogs]);

  const allServices = useMemo(() => {
    return catalogs
      .filter((c) => c.dataType === 'services')
      .flatMap((c) =>
        c.data.map((s) => ({
          ...s,
          company: c.company,
          supplier: c.supplier,
        }))
      );
  }, [catalogs]);

  return (
    <CatalogsContext.Provider
      value={{
        catalogs,
        setCatalogs,
        companyList,
        companies,
        allProducts,
        allServices,
      }}
    >
      {children}
    </CatalogsContext.Provider>
  );
};

// Exportar el contexto para uso avanzado
export { CatalogsContext };