// src/hooks/useClients.js
import { useState, useEffect, useCallback } from 'react';

export const useClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar usuarios desde localStorage
  const loadClients = useCallback(() => {
    try {
      const saved = localStorage.getItem('SiPP_users');
      let users = [];

      if (saved) {
        users = JSON.parse(saved);
      }

      // Validar y mapear datos
      const validClients = users
        .filter(u => u && typeof u === 'object')
        .map(u => ({
          id: u.id,
          fullName: u.fullName || 'Sin nombre',
          email: u.email || 'sin-correo@sipp.uh.cu',
          area: u.area || 'Sin área',
          role: u.role || 'user',
          createdAt: u.createdAt || new Date().toISOString(),
          avatar: u.avatar || '/assets/images/avatar-default.png',
        }));

      setClients(validClients);
      setError(null);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      setError('No se pudieron cargar los usuarios.');
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar al inicio
  useEffect(() => {
    loadClients();

    // Escuchar cambios en localStorage
    const handleStorage = () => loadClients();
    window.addEventListener('storage', handleStorage);

    return () => window.removeEventListener('storage', handleStorage);
  }, [loadClients]);

  // Función para recargar manualmente
  const refreshClients = useCallback(() => {
    setLoading(true);
    loadClients();
  }, [loadClients]);

  return {
    clients,
    loading,
    error,
    refreshClients, // útil si se crea un nuevo usuario
  };
};