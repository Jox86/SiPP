import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';

const ThemeContext = createContext();

// Paleta de colores específica para las interfaces de Pedidos y Mensajes
const COLORS = {
  light: {
    borgundy: '#4E0101',
    tan: '#d2b48c',
    sapphire: '#3C5070',
    swanWhite: '#F5F0E9',
    shellstone: '#D9CBC2',
    background: '#F5F0E9',
    paper: '#FFFFFF',
    text: '#4E0101',
    textSecondary: '#3C5070'
  },
  dark: {
    borgundy: '#1E3A5F',
    tan: '#A78B6F',
    sapphire: '#4A6388',
    swanWhite: '#2D3748',
    shellstone: '#4A5568',
    background: '#1A202C',
    paper: '#2D3748',
    text: '#F7FAFC',
    textSecondary: '#E2E8F0'
  }
};

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('SiPP_theme');
    return saved ? saved === 'dark' : false;
  });

  // Colores actuales basados en el modo
  const currentColors = darkMode ? COLORS.dark : COLORS.light;

  // Memoizar el tema para evitar recrearlo en cada render
  const theme = useMemo(() => createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: darkMode ? '#6DA2A3' : '#4E0101',
      },
      secondary: {
        main: darkMode ? '#4E0101' : '#6DA2A3',
      },
      background: {
        default: darkMode ? '#121212' : '#F8F9FA',
        paper: darkMode ? '#1E1E1E' : '#FFFFFF',
      },
      text: {
        primary: darkMode ? '#E0EDED' : '#2C3E50',
        secondary: darkMode ? '#BBBBBB' : '#7F8C8D',
      },
      // Paleta extendida para las interfaces específicas
      custom: {
        borgundy: currentColors.borgundy,
        tan: currentColors.tan,
        sapphire: currentColors.sapphire,
        swanWhite: currentColors.swanWhite,
        shellstone: currentColors.shellstone,
        background: currentColors.background,
        paper: currentColors.paper,
        text: currentColors.text,
        textSecondary: currentColors.textSecondary
      }
    },
    typography: {
      fontFamily: '"Inter", "Roboto", sans-serif',
      h1: {
        color: darkMode ? '#6DA2A3' : '#4E0101',
      },
      h2: {
        color: darkMode ? '#6DA2A3' : '#4E0101',
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: darkMode ? '0 2px 4px rgba(109, 162, 163, 0.3)' : '0 2px 4px rgba(78, 1, 1, 0.3)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: darkMode ? '0 4px 6px rgba(0,0,0,0.2)' : '0 4px 6px rgba(0,0,0,0.1)',
            backgroundImage: 'none',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: darkMode ? 'rgba(33, 33, 33, 0.98)' : 'rgba(255, 255, 255, 0.98)',
            borderRight: darkMode ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.12)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: currentColors.background,
            color: currentColors.text,
            boxShadow: 'none',
            borderBottom: `2px solid ${currentColors.shellstone}`,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: currentColors.paper,
            color: currentColors.text,
          },
        },
      },
    },
  }), [darkMode, currentColors]);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('SiPP_theme', newMode ? 'dark' : 'light');
  };

  // Valor del contexto que incluye tanto el tema como los colores específicos
  const contextValue = useMemo(() => ({
    darkMode,
    toggleTheme,
    theme,
    colors: currentColors
  }), [darkMode, theme, currentColors]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe usarse dentro de un ThemeProvider');
  }
  return context;
};