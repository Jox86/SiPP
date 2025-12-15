// src/App.jsx
import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Contextos
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { CatalogsProvider } from './context/CatalogsContext';
import { ProjectsProvider } from './context/ProjectsContext';

// Componentes
import { ProtectedRoute, PublicRoute } from './components/Routes';
import MainLayout from './pages/MainLayout';
import AuthLayout from './pages/Auth/AuthLayout';
import NotFound from './pages/NotFound'; // Now this import will work

// Footer
import PrivacyPolicyPage from './components/Footer/PrivacyPolicyPage';
import LegalTermsPage from './components/Footer/LegalTermsPage';


// Páginas con carga perezosa
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Pedidos = lazy(() => import('./pages/Pedidos/Pedidos'));
const Proyectos = lazy(() => import('./pages/Proyectos/Proyectos'));
const Usuarios = lazy(() => import('./pages/Usuarios/Usuarios'));
const Reportes = lazy(() => import('./pages/Reportes/Reportes'));
const Mensajes = lazy(() => import('./pages/Mensajes/Mensajes'));
const Ayuda = lazy(() => import('./pages/Ayuda/Ayuda'));
const PerfilUsuario = lazy(() => import('./pages/PerfilUsuario/PerfilUsuario'));

// Componente de carga
const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f5f5f5'
  }}>
    <div className="spinner"></div>
    <style>{`
      .spinner {
        border: 4px solid rgba(0, 0, 0, 0.1);
        border-radius: 50%;
        border-top: 4px solid #4E0101;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <CatalogsProvider>
            <ProjectsProvider>
              <Routes>
                <Route path="/" element={
                  <ProtectedRoute>
                    <Navigate to="/dashboard" replace />
                  </ProtectedRoute>
                } />

                <Route path="/login" element={
                  <PublicRoute>
                    <AuthLayout />
                  </PublicRoute>
                } />

                <Route element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }>
                  <Route path="/dashboard" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <Dashboard />
                    </Suspense>
                  } />
                  <Route path="/pedidos/*" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <Pedidos />
                    </Suspense>
                  } />
                  <Route path="/proyectos/*" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <Proyectos />
                    </Suspense>
                  } />
                  <Route path="/usuarios/*" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <Usuarios />
                    </Suspense>
                  } />
                  <Route path="/reportes/*" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <Reportes />
                    </Suspense>
                  } />
                  <Route path="/mensajes/*" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <Mensajes />
                    </Suspense>
                  } />
                  <Route path="/ayuda/*" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <Ayuda />
                    </Suspense>
                  } />
                  <Route path="/perfilusuario/*" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <PerfilUsuario />
                    </Suspense>
                  } />
                </Route>
              
                <Route path="*" element={<NotFound />} />
                <Route path="/politica-privacidad" element={<PrivacyPolicyPage />} />
                <Route path="/terminos-servicio" element={<LegalTermsPage />} />

              </Routes>
            </ProjectsProvider>
          </CatalogsProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;