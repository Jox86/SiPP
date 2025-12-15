// src/pages/Auth/AuthLayout.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Container,
  Divider,
  Alert,
  InputAdornment,
  IconButton,
  useTheme,
  useMediaQuery,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  ShoppingBag,
} from '@mui/icons-material';
import Particles from 'react-particles';
import { loadSlim } from 'tsparticles-slim';

const AuthLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Estados para el efecto de focus en los inputs
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Nueva paleta de colores
  const colors = {
    borgundy: '#4E0101',
    borgundyLight: '#6A1A1A',
    borgundyLighter: '#853434',
    tan: '#d2b48c',
    sapphire: '#667080',
    swanWhite: '#F5F0E9',
    shellstone: '#D9CBC2',
    glass: 'rgba(255, 255, 255, 0.1)',
    glassBorder: 'rgba(255, 255, 255, 0.2)',
    glassHighlight: 'rgba(255, 255, 255, 0.05)'
  };

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: 'auto',
      backgroundColor: colors.borgundy,
      background: `linear-gradient(135deg, ${colors.borgundy} 0%, ${colors.borgundy} 50%, ${colors.borgundy} 100%)`,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      py: isMobile ? 4 : 6,
      px: isMobile ? 2 : 0
    }}>
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          fpsLimit: 60,
          interactivity: {
            events: {
              onHover: { 
                enable: true, 
                mode: "repulse",
                parallax: { enable: false, force: 60, smooth: 10 }
              },
              onClick: { enable: true, mode: "push" },
            },
            modes: {
              repulse: { 
                distance: 100, 
                duration: 0.4,
                speed: 1
              },
              push: { particles_nb: 4 },
            },
          },
          particles: {
            color: { value: colors.swanWhite },
            links: { 
              color: colors.swanWhite, 
              distance: 150, 
              enable: true, 
              opacity: 0.1, 
              width: 1 
            },
            move: { 
              direction: "none", 
              enable: true, 
              outModes: { default: "out" }, 
              speed: 0.5,
              random: true,
              straight: false,
            },
            number: { 
              density: { 
                enable: true, 
                area: 800 
              }, 
              value: 60 
            },
            opacity: { 
              value: { min: 0.1, max: 0.2 },
              animation: {
                enable: true,
                speed: 1,
                minimumValue: 0.1
              }
            },
            shape: { type: "circle" },
            size: { 
              value: { min: 1, max: 2 },
              animation: {
                enable: true,
                speed: 3,
                minimumValue: 0.1
              }
            },
          },
          detectRetina: true,
        }}
        style={{ 
          position: 'absolute', 
          width: '100%', 
          height: '100%', 
          zIndex: 0 
        }}
      />

      <Container 
        maxWidth="sm" 
        sx={{ 
          position: 'relative', 
          zIndex: 1,
          my: 'auto'
        }}
      >
        <Paper elevation={0} sx={{
          p: isMobile ? 3 : 4,
          borderRadius: 4,
          //  EFECTO GLASS MEJORADO
          backgroundColor: colors.shellstone,
          backdropFilter: 'blur(20px) saturate(80%)',
          border: `1px solid ${colors.glassBorder}`,
          boxShadow: `
            0 25px 50px -12px rgba(0, 0, 0, 0.5),
            inset 0 1px 0 ${colors.glassBorder},
            inset 0 -1px 0 rgba(0, 0, 0, 0.1)
          `,
          minHeight: isMobile ? 'auto' : '480px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            animation: 'float 8s ease-in-out infinite',
            zIndex: 0,
          }
        }}>
          {/* Título */}
          <Box sx={{ 
            textAlign: 'center', 
            mb: 4,
            position: 'relative',
            zIndex: 1
          }}>
            <Box sx={{
              display: 'inline-flex',
              p: 1,
              marginBottom: 2
            }}>
              <ShoppingBag 
                sx={{ 
                  fontSize: 40,
                  color: colors.tan,
                  filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))'
                }} 
              />
            </Box>
            <Typography 
              variant="h3" 
              component="h1" 
              sx={{ 
                fontFamily: '"Qurova", sans-serif',
                fontWeight: 'bold',
                background: `linear-gradient(135deg, ${colors.borgundy} 30%, ${colors.tan} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
                textShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
            >
              SiPP
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: colors.borgundy,
                fontFamily: '"Qurova", sans-serif',
                fontWeight: 300,
                letterSpacing: '0.1em',
                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
              }}
            >
              Sistema Integrado de Pedidos para Proyectos
            </Typography>
          </Box>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                backgroundColor: `rgba(211, 47, 47, 0.1)`,
                color: colors.borgundy,
                border: `1px solid rgba(211, 47, 47, 0.3)`,
                borderRadius: 2,
                position: 'relative',
                zIndex: 1,
                backdropFilter: 'blur(10px)'
              }}
            >
              {error}
            </Alert>
          )}

          <Box 
            component="form" 
            onSubmit={handleSubmit}
            sx={{ 
              flexGrow: 1, 
              display: 'flex', 
              flexDirection: 'column',
              position: 'relative',
              zIndex: 1
            }}
          >
            {/* Input de Email con Label Flotante */}
            <Box sx={{ position: 'relative', mb: 3 }}>
              <TextField
                fullWidth
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                required
                InputProps={{ 
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ 
                        color: emailFocused || email ? colors.borgundy : colors.borgundy,
                        transition: 'color 0.3s ease'
                      }} />
                    </InputAdornment>
                  )
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 3,
                    border: `1px solid ${colors.borgundy}`,
                    color: colors.swanWhite,
                    transition: 'all 0.3s ease',
                    '&:hover fieldset': { 
                      borderColor: colors.borgundy,
                      boxShadow: `0 0 0 2px ${colors.tan}20`
                    },
                    '&.Mui-focused fieldset': { 
                      borderColor: colors.borgundy,
                      boxShadow: `0 0 0 3px ${colors.tan}20`
                    },
                    '& fieldset': {
                      borderColor: colors.glassBorder,
                    }
                  },
                  '& .MuiInputBase-input': {
                    color: colors.borgundy,
                    '&::placeholder': {
                      color: colors.shellstone,
                      opacity: 1,
                    }
                  },
                }}
              />
              {/* Label flotante */}
              <Typography
                sx={{
                  position: 'absolute',
                  left: 40,
                  top: emailFocused || email ? -17 : 15,
                  fontSize: emailFocused || email ? '0.75rem' : '1rem',
                  color: emailFocused || email ? colors.borgundy : colors.borgundy,
                  px: 1,
                  transition: 'all 0.3s ease',
                  pointerEvents: 'none',
                  zIndex: 2,
                  fontWeight: emailFocused || email ? 600 : 400
                }}
              >
                Correo Electrónico
              </Typography>
            </Box>

            {/* Input de Contraseña con Label Flotante */}
            <Box sx={{ position: 'relative', mb: 2 }}>
              <TextField
                fullWidth
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ 
                        color: passwordFocused || password ? colors.borgundy : colors.borgundy,
                        transition: 'color 0.3s ease'
                      }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton 
                        onClick={toggleShowPassword}
                        sx={{ 
                          color: passwordFocused || password ? colors.borgundy : colors.borgundy,
                          transition: 'color 0.3s ease'
                        }}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 3,
                    border: `1px solid ${colors.borgundy}`,
                    color: colors.swanWhite,
                    transition: 'all 0.3s ease',
                    '&:hover fieldset': { 
                      borderColor: colors.tan,
                      boxShadow: `0 0 0 2px ${colors.tan}20`
                    },
                    '&.Mui-focused fieldset': { 
                      borderColor: colors.tan,
                      boxShadow: `0 0 0 3px ${colors.tan}20`
                    },
                    '& fieldset': {
                      borderColor: colors.glassBorder,
                    }
                  },
                  '& .MuiInputBase-input': {
                    color: colors.borgundy,
                    '&::placeholder': {
                      color: colors.borgundy,
                      opacity: 1,
                    }
                  },
                }}
              />
              {/* Label flotante */}
              <Typography
                sx={{
                  position: 'absolute',
                  left: 50,
                  top: passwordFocused || password ? -17 : 15,
                  fontSize: passwordFocused || password ? '0.75rem' : '1rem',
                  color: passwordFocused || password ? colors.borgundy : colors.borgundy,
                  px: 1,
                  transition: 'all 0.3s ease',
                  pointerEvents: 'none',
                  zIndex: 2,
                  fontWeight: passwordFocused || password ? 600 : 400
                }}
              >
                Contraseña
              </Typography>
            </Box>

            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  sx={{
                    color: colors.borgundy,
                    '&.Mui-checked': { 
                      color: colors.borgundy,
                    },
                    '& .MuiSvgIcon-root': {
                      fontSize: 20,
                    }
                  }}
                />
              }
              label="Recordar mis credenciales en este dispositivo"
              sx={{ 
                mb: 2, 
                color: colors.borgundy,
                '& .MuiFormControlLabel-label': {
                  fontSize: '0.85rem',
                  fontWeight: 300
                }
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                color: colors.swanWhite,
                mt: 'auto',
                mb: 1,
                py: 1,
                background: colors.tan,
                
                '&:hover': { 
                  background: `linear-gradient(135deg, ${colors.borgundy} 0%, ${colors.borgundyLighter} 100%)`,
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 25px ${colors.borgundy}60`,
                },
                '&:disabled': {
                  background: `linear-gradient(135deg, ${colors.shellstone}40 0%, ${colors.sapphire}40 100%)`,
                  transform: 'none',
                  boxShadow: 'none',
                  color: colors.shellstone
                },
                fontWeight: 'bold',
                fontSize: '1rem',
                transition: 'all 0.3s ease',
                borderRadius: 3,
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                  transition: 'left 0.5s ease',
                },
                '&:hover::before': {
                  left: '100%',
                }
              }}
            >
              {loading ? 'Cargando...' : 'Iniciar Sesión'}
            </Button>
          </Box>
        </Paper>
      </Container>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
        }
      `}</style>
    </Box>
  );
};

// Función alpha para transparencias
const alpha = (color, opacity) => {
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
};

export default AuthLayout;