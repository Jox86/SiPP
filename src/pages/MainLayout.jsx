import { CssBaseline, Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Layout/Sidebar';
import TopBar from '../components/Layout/TopBar';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { styled } from '@mui/material/styles';

// Componente estilizado sin pasar theme como prop
const MainContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  backgroundColor: theme.palette.background.default,
  minHeight: '100vh',
  transition: 'background-color 0.3s ease',
  overflow: 'hidden',
}));

// Componente estilizado sin pasar theme como prop
const MainContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  marginLeft: { md: theme.spacing(7.5) }, // 60px
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  height: '100vh',
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: theme.palette.mode === 'dark' ? '#6da2a3' : '#4E0101',
    borderRadius: '3px',
  },
}));

const ThemedContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  backgroundColor: theme.palette.background.default,
  minHeight: '100vh',
  transition: 'background-color 0.3s ease',
  overflow: 'hidden',
}));

const ThemedMainContent = styled('main')(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  marginLeft: { md: theme.spacing(7.5) },
  height: '100vh',
  overflowY: 'auto',
  /* estilos del scrollbar */
}));

export default function MainLayout() {
  const { currentUser } = useAuth();
  const theme = useTheme(); // Obtiene el theme del contexto

  if (!currentUser) {
    return <Box>Cargando...</Box>;
  }

  return (
    <>
      <CssBaseline />
      <MainContainer> {/* No pasar theme como prop */}
        <Sidebar />
        <MainContent component="main"> {/* No pasar theme como prop */}
          <TopBar />
          <Outlet />
        </MainContent>
      </MainContainer>
    </>
  );
}