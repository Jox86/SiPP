import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

const AuthContext = createContext();

//  Usuarios predeterminados CORREGIDOS
const DEFAULT_USERS = [
  {
    id: 'admin_001',
    fullName: 'Administrador SiPP',
    email: 'admin@sipp.uh.cu',
    areaType: 'direccion',
    area: 'DST',
    role: 'admin',
    password: 'admin123', // Cambiado de passwordHash a password
    avatar: '/src/assets/images/users/3d-user-icon.jpg', // Ruta corregida
    mobile: '+53 78730119',
    phone: '+53 78730119',
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'comercial_002',
    fullName: 'Gestión Comercial DST',
    email: 'comercial@sipp.uh.cu',
    areaType: 'direccion', 
    area: 'Gestión Comercial',
    role: 'comercial',
    password: 'comercial123', // Cambiado de passwordHash a password
    avatar: '/src/assets/images/users/3d-user-icon.jpg', // Ruta corregida
    mobile: '+53 78730119',
    phone: '+53 78730119',
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'usuario_003',
    fullName: 'Usuario de Prueba',
    email: 'usuario@sipp.uh.cu',
    areaType: 'facultad', 
    area: 'Letras',
    role: 'user',
    password: 'usuario123', // Cambiado de passwordHash a password
    avatar: '/src/assets/images/users/3d-user-icon.jpg', // Ruta corregida
    mobile: '+53 51234567',
    phone: '78765432',
    createdAt: '2025-01-01T00:00:00Z',
  },
];

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  //  Inicializar tema y usuario - VERSIÓN MEJORADA
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 1. Inicializar tema
        const savedTheme = localStorage.getItem('SiPP_theme');
        if (savedTheme) {
          setDarkMode(savedTheme === 'dark');
        } else {
          localStorage.setItem('SiPP_theme', 'light');
        }

        // 2. Inicializar usuarios predeterminados
        let users = JSON.parse(localStorage.getItem('SiPP_users') || '[]');
        
        // Verificar si necesitamos crear/actualizar usuarios predeterminados
        const defaultUserEmails = DEFAULT_USERS.map(u => u.email);
        const existingEmails = users.map(u => u.email);
        
        let needsUpdate = false;
        
        DEFAULT_USERS.forEach(defaultUser => {
          const existingUser = users.find(u => u.email === defaultUser.email);
          
          if (!existingUser) {
            // Usuario no existe, agregarlo
            users.push(defaultUser);
            needsUpdate = true;
            console.log(` Usuario predeterminado creado: ${defaultUser.email}`);
          } else {
            // Usuario existe, verificar si necesita actualización
            const keysToCheck = ['fullName', 'areaType', 'area', 'password', 'avatar'];
            const needsRefresh = keysToCheck.some(key => 
              existingUser[key] !== defaultUser[key]
            );
            
            if (needsRefresh) {
              Object.assign(existingUser, defaultUser);
              needsUpdate = true;
              console.log(` Usuario predeterminado actualizado: ${defaultUser.email}`);
            }
          }
        });

        if (needsUpdate || users.length === 0) {
          localStorage.setItem('SiPP_users', JSON.stringify(users));
          console.log(' Base de datos de usuarios inicializada');
        }

        // 3. Cargar usuario de sesión si existe
        const savedUser = localStorage.getItem('SiPP_user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          // Verificar que el usuario aún existe en la base de datos
          const userStillExists = users.some(u => u.id === userData.id);
          if (userStillExists) {
            setCurrentUser(userData);
          } else {
            localStorage.removeItem('SiPP_user');
          }
        }

      } catch (error) {
        console.error('❌ Error inicializando la aplicación:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  //  Cambiar tema
  const toggleTheme = useCallback(() => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('SiPP_theme', newMode ? 'dark' : 'light');
  }, [darkMode]);

  //  Validar email
  const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  //  Inicio de sesión - VERSIÓN CORREGIDA
  const login = useCallback((email, password) => {
    if (!email || !password) {
      throw new Error('Email y contraseña son requeridos');
    }

    if (!isValidEmail(email)) {
      throw new Error('Formato de email inválido');
    }

    const users = JSON.parse(localStorage.getItem('SiPP_users') || '[]');
    const user = users.find((u) => u.email === email);

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    //  VERIFICACIÓN DE CONTRASEÑA CORREGIDA
    // Usar 'password' en lugar de 'passwordHash'
    const userPassword = user.password || user.passwordHash;
    
    if (password !== userPassword) {
      throw new Error('Contraseña incorrecta');
    }

    // Establecer usuario en sesión
    const userData = { 
      ...user, 
      // Asegurar que el rol esté definido
      role: user.role || 'user'
    };
    
    setCurrentUser(userData);
    localStorage.setItem('SiPP_user', JSON.stringify(userData));
    
    console.log(` Login exitoso: ${user.email} (${user.role})`);
    return true;
  }, []);

  //  Registro de usuario - VERSIÓN CORREGIDA
  const register = useCallback((userData) => {
    const { fullName, email, areaType, area, password } = userData;

    if (!fullName || !email || !areaType || !area || !password) {
      throw new Error('Todos los campos son requeridos');
    }

    if (!isValidEmail(email)) {
      throw new Error('Formato de email inválido');
    }

    const users = JSON.parse(localStorage.getItem('SiPP_users') || '[]');
    const exists = users.some((u) => u.email === email);
    if (exists) {
      throw new Error('Email ya registrado');
    }

    if (password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }

    // Crear nuevo usuario
    const newUser = {
      id: `user_${Date.now()}`,
      fullName,
      email,
      areaType,
      area,
      role: 'user',
      password: password, // Usar 'password' en lugar de 'passwordHash'
      avatar: '/src/assets/images/users/3d-user-icon.jpg',
      mobile: '',
      phone: '',
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem('SiPP_users', JSON.stringify(users));
    
    // Iniciar sesión automáticamente
    setCurrentUser(newUser);
    localStorage.setItem('SiPP_user', JSON.stringify(newUser));
    
    console.log(` Usuario registrado: ${newUser.email}`);
    return true;
  }, []);

  //  Cerrar sesión
  const logout = useCallback(() => {
    console.log(` Logout: ${currentUser?.email}`);
    setCurrentUser(null);
    localStorage.removeItem('SiPP_user');
  }, [currentUser]);

  //  Actualizar perfil de usuario
  const updateUser = useCallback((updatedUser) => {
    if (!updatedUser?.id) return false;

    try {
      const users = JSON.parse(localStorage.getItem('SiPP_users') || '[]');
      const updatedUsers = users.map((u) => (u.id === updatedUser.id ? updatedUser : u));
      localStorage.setItem('SiPP_users', JSON.stringify(updatedUsers));

      if (currentUser?.id === updatedUser.id) {
        setCurrentUser(updatedUser);
        localStorage.setItem('SiPP_user', JSON.stringify(updatedUser));
      }
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  }, [currentUser]);

  //  Cambiar contraseña - VERSIÓN CORREGIDA
  const changePassword = useCallback((userId, newPassword, currentPassword = null) => {
    try {
      const users = JSON.parse(localStorage.getItem('SiPP_users') || '[]');
      const userIndex = users.findIndex(u => u.id === userId);
      
      if (userIndex === -1) {
        throw new Error('Usuario no encontrado');
      }
      
      // Verificar contraseña actual si se proporciona
      const currentUserPassword = users[userIndex].password || users[userIndex].passwordHash;
      if (currentPassword && currentPassword !== currentUserPassword) {
        throw new Error('La contraseña actual es incorrecta');
      }
      
      // Actualizar contraseña
      users[userIndex].password = newPassword;
      // Mantener compatibilidad con passwordHash si existe
      if (users[userIndex].passwordHash) {
        users[userIndex].passwordHash = newPassword;
      }
      
      localStorage.setItem('SiPP_users', JSON.stringify(users));
      
      // Si es el usuario actual, actualizar en el estado
      if (currentUser?.id === userId) {
        const updatedUser = { 
          ...currentUser, 
          password: newPassword,
          passwordHash: newPassword 
        };
        setCurrentUser(updatedUser);
        localStorage.setItem('SiPP_user', JSON.stringify(updatedUser));
      }
      
      console.log(` Contraseña actualizada para usuario: ${users[userIndex].email}`);
      return true;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }, [currentUser]);

  //  Obtener todos los usuarios (solo para admin)
  const getAllUsers = useCallback(() => {
    if (currentUser?.role !== 'admin') {
      throw new Error('No autorizado: Se requiere acceso de administrador');
    }
    
    return JSON.parse(localStorage.getItem('SiPP_users') || '[]');
  }, [currentUser]);

  //  Eliminar usuario (solo para admin)
  const deleteUser = useCallback((userId) => {
    if (currentUser?.role !== 'admin') {
      throw new Error('No autorizado: Se requiere acceso de administrador');
    }
    
    if (userId === currentUser.id) {
      throw new Error('No puedes eliminar tu propia cuenta');
    }
    
    const users = JSON.parse(localStorage.getItem('SiPP_users') || '[]');
    const userToDelete = users.find(u => u.id === userId);
    const filteredUsers = users.filter(u => u.id !== userId);
    
    localStorage.setItem('SiPP_users', JSON.stringify(filteredUsers));
    
    // Si el usuario eliminado está en sesión, cerrar sesión
    const savedUser = localStorage.getItem('SiPP_user');
    if (savedUser && JSON.parse(savedUser).id === userId) {
      localStorage.removeItem('SiPP_user');
    }
    
    console.log(` Usuario eliminado: ${userToDelete?.email}`);
    return true;
  }, [currentUser]);

  //  Valor del contexto
  const value = useMemo(() => ({
    currentUser,
    darkMode,
    loading,
    toggleTheme,
    login,
    register,
    logout,
    updateUser,
    changePassword,
    getAllUsers,
    deleteUser,
  }), [
    currentUser, 
    darkMode, 
    loading,
    toggleTheme, 
    login, 
    register, 
    logout, 
    updateUser,
    changePassword,
    getAllUsers,
    deleteUser
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Asegúrate de que también exportes AuthContext
export { AuthContext };