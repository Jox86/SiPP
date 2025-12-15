// src/hooks/useProjects.js
import { useState, useEffect } from 'react';

// Hook personalizado para gestionar proyectos del usuario
export const useProjects = (userId) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar proyectos del usuario desde localStorage
  useEffect(() => {
    if (!userId) {
      setProjects([]);
      setLoading(false);
      return;
    }

    const loadProjects = () => {
      try {
        // Usar la clave específica del usuario
        const saved = localStorage.getItem(`SiPP_projects_${userId}`);
        const userProjects = saved ? JSON.parse(saved) : [];
        setProjects(userProjects);
      } catch (error) {
        console.error('Error al cargar proyectos:', error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, [userId]);

  // Crear nuevo proyecto
  const addProject = (newProject) => {
    if (!userId) return false;
    
    try {
      const saved = localStorage.getItem(`SiPP_projects_${userId}`);
      const userProjects = saved ? JSON.parse(saved) : [];
      
      const projectWithId = {
        id: `proj_${Date.now()}`,
        ownerId: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...newProject,
      };
      
      const updatedProjects = [...userProjects, projectWithId];
      localStorage.setItem(`SiPP_projects_${userId}`, JSON.stringify(updatedProjects));
      setProjects(updatedProjects);
      return true;
    } catch (error) {
      console.error('Error al crear proyecto:', error);
      return false;
    }
  };

  // Actualizar proyecto existente
  const updateProject = (updatedProject) => {
    if (!userId) return false;
    
    try {
      const saved = localStorage.getItem(`SiPP_projects_${userId}`);
      const userProjects = saved ? JSON.parse(saved) : [];
      
      const updatedProjects = userProjects.map((p) =>
        p.id === updatedProject.id ? { ...updatedProject, updatedAt: new Date().toISOString() } : p
      );
      
      localStorage.setItem(`SiPP_projects_${userId}`, JSON.stringify(updatedProjects));
      setProjects(updatedProjects);
      return true;
    } catch (error) {
      console.error('Error al actualizar proyecto:', error);
      return false;
    }
  };

  // Eliminar proyecto
  const deleteProject = (projectId) => {
    if (!userId) return false;
    
    try {
      const saved = localStorage.getItem(`SiPP_projects_${userId}`);
      const userProjects = saved ? JSON.parse(saved) : [];
      
      const updatedProjects = userProjects.filter((p) => p.id !== projectId);
      localStorage.setItem(`SiPP_projects_${userId}`, JSON.stringify(updatedProjects));
      setProjects(updatedProjects);
      return true;
    } catch (error) {
      console.error('Error al eliminar proyecto:', error);
      return false;
    }
  };

  return {
    projects,
    loading,
    addProject,
    updateProject,
    deleteProject,
  };
};