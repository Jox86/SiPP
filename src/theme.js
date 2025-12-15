// src/theme.js
import { createTheme } from '@mui/material/styles';

export const getTheme = (mode) => {
  const isDark = mode === 'dark';
  
  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? '#6DA2A3' : '#4E0101', // Cambia según el modo
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: isDark ? '#4E0101' : '#DFDEBE',
        contrastText: isDark ? '#FFFFFF' : '#2C3E50',
      },
      background: {
        default: isDark ? '#121212' : '#F8F9FA',
        paper: isDark ? '#1E1E1E' : '#FFFFFF',
      },
      text: {
        primary: isDark ? '#E0EDED' : '#2C3E50',
        secondary: isDark ? '#B2DFDB' : '#7F8C8D',
      },
      divider: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
    },
    typography: {
      fontFamily: '"Glitten", "Inter", sans-serif',
      h1: {
        color: isDark ? '#6DA2A3' : '#4E0101',
        fontWeight: 700,
        fontSize: '2.5rem',
      },
      h2: {
        color: isDark ? '#6DA2A3' : '#4E0101',
        fontWeight: 600,
        fontSize: '2rem',
      },
      h3: {
        color: isDark ? '#E0EDED' : '#2C3E50',
        fontWeight: 500,
      },
      button: {
        textTransform: 'none',
        fontWeight: 500,
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            boxShadow: 'none',
            padding: '8px 16px',
            '&:hover': {
              boxShadow: isDark 
                ? '0 2px 8px rgba(109, 162, 163, 0.4)' 
                : '0 2px 8px rgba(78, 1, 1, 0.3)',
            },
          },
          containedPrimary: {
            '&:hover': {
              backgroundColor: isDark ? '#5C9192' : '#3D0101',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: isDark 
              ? '0 4px 12px rgba(0, 0, 0, 0.25)' 
              : '0 4px 12px rgba(0, 0, 0, 0.1)',
            transition: 'box-shadow 0.3s ease, transform 0.3s ease',
            '&:hover': {
              boxShadow: isDark
                ? '0 6px 16px rgba(0, 0, 0, 0.3)'
                : '0 6px 16px rgba(0, 0, 0, 0.15)',
              transform: 'translateY(-2px)',
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? '#1E1E1E' : '#4E0101',
            color: isDark ? '#6DA2A3' : '#FFFFFF',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: isDark ? '#121212' : '#FFFFFF',
            borderRight: isDark 
              ? '1px solid rgba(109, 162, 163, 0.2)' 
              : '1px solid rgba(78, 1, 1, 0.1)',
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            '&:hover': {
              backgroundColor: isDark 
                ? 'rgba(109, 162, 163, 0.2)' 
                : 'rgba(78, 1, 1, 0.1)',
            },
            '&.Mui-selected': {
              backgroundColor: isDark 
                ? 'rgba(109, 162, 163, 0.3)' 
                : 'rgba(78, 1, 1, 0.15)',
              '&:hover': {
                backgroundColor: isDark 
                  ? 'rgba(109, 162, 163, 0.4)' 
                  : 'rgba(78, 1, 1, 0.2)',
              },
            },
          },
        },
      },
    },
  });
};