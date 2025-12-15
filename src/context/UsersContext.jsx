// src/context/UsersContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const UsersContext = createContext();

export const UsersProvider = ({ children }) => {
  const [users, setUsers] = useState([]);

  // Cargar usuarios desde localStorage
  const loadUsers = () => {
    const saved = localStorage.getItem('SiPP_users');
    if (saved) {
      setUsers(JSON.parse(saved));
    }
  };

  // Guardar usuarios
  const saveUsers = (usersToSave) => {
    setUsers(usersToSave);
    localStorage.setItem('SiPP_users', JSON.stringify(usersToSave));
  };

  // Carga inicial
  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <UsersContext.Provider value={{ users, loadUsers, saveUsers }}>
      {children}
    </UsersContext.Provider>
  );
};

export const useUsers = () => useContext(UsersContext);