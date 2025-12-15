// src/context/ProjectsContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const ProjectsContext = createContext();

export const ProjectsProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // Obtener el usuario actual desde localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('SiPP_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  // Cargar proyectos del usuario actual desde localStorage
  const loadProjects = () => {
    if (!currentUser) return;
    
    const saved = localStorage.getItem(`SiPP_projects_${currentUser.id}`);
    if (saved) {
      setProjects(JSON.parse(saved));
    } else {
      setProjects([]);
    }
  };

  // Guardar proyectos del usuario actual
  const saveProjects = (projectsToSave) => {
    if (!currentUser) return;
    
    setProjects(projectsToSave);
    localStorage.setItem(`SiPP_projects_${currentUser.id}`, JSON.stringify(projectsToSave));
  };

  // Crear nuevo proyecto
  const createProject = (projectData) => {
    if (!currentUser) return null;
    
    const newProject = {
      id: Date.now(),
      ...projectData,
      ownerId: currentUser.id,
      ownerName: currentUser.fullName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      budgetSpent: 0
    };
    
    const updatedProjects = [...projects, newProject];
    saveProjects(updatedProjects);
    return newProject;
  };

  // Actualizar proyecto
  const updateProject = (id, updates) => {
    if (!currentUser) return null;
    
    const updatedProjects = projects.map(project => 
      project.id === id ? { ...project, ...updates, updatedAt: new Date().toISOString() } : project
    );
    saveProjects(updatedProjects);
    return updatedProjects.find(p => p.id === id);
  };

  // Eliminar proyecto
  const deleteProject = (id) => {
    if (!currentUser) return;
    
    const filteredProjects = projects.filter(p => p.id !== id);
    saveProjects(filteredProjects);
  };

  // Carga inicial de proyectos cuando cambia el usuario
  useEffect(() => {
    if (currentUser) {
      loadProjects();
    } else {
      setProjects([]);
    }
  }, [currentUser]);

  const value = {
    projects,
    createProject, 
    updateProject, 
    deleteProject,
    loadProjects
  };

  return (
    <ProjectsContext.Provider value={value}>
      {children}
    </ProjectsContext.Provider>
  );
};

export function useProjects() {
  const context = useContext(ProjectsContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectsProvider');
  }
  return context;
}