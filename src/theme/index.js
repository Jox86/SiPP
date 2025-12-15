// src/theme/index.js
import { createTheme } from '@mui/material/styles';

const createAppTheme = (mode) => {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#4E0101', // Rojo oscuro
      },
      background: {
        default: mode === 'dark' ? '#121212' : '#F8F9FA',
        paper: mode === 'dark' ? '#1E1E1E' : '#FFFFFF',
      },
      text: {
        primary: mode === 'dark' ? '#FFFFFF' : '#2C3E50',
      },
    },
    typography: {
      fontFamily: '"Qurova", "Inter", sans-serif',
    },
  });
};

export default createAppTheme;