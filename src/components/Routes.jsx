// src/components/Routes.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Ruta protegida: solo usuarios autenticados
export const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Ruta pública: solo usuarios no autenticados
export const PublicRoute = ({ children }) => {
  const { currentUser } = useAuth();
  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};