import { NotificationProvider } from './context/NotificationContext';
import './styles/main.scss'; //  Este archivo importa el resto de SCSS
// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext'; // Asegúrate de que exista
import './index.css';
import { ThemeProvider } from './context/ThemeContext';
import './utils/reportScheduler';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <NotificationProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </NotificationProvider>
    </AuthProvider>
  </React.StrictMode>
);

