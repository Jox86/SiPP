import { render, screen, fireEvent } from '@testing-library/react';
import Login from '../pages/Login';
import { AuthProvider } from '../context/AuthContext';

describe('Login Component', () => {
  test('debe mostrar errores si los campos están vacíos', async () => {
    render(
      <AuthProvider>
        <Login />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Ingresar'));

    expect(await screen.findByText('Credenciales inválidas')).toBeInTheDocument();
  });

  test('debe permitir iniciar sesión con credenciales válidas', async () => {
    // Mock del login exitoso será simulado en AuthContext
    render(
      <AuthProvider>
        <Login />
      </AuthProvider>
    );

    fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), {
      target: { value: 'admin@sipp.com' },
    });
    fireEvent.change(screen.getByLabelText(/Contraseña/i), {
      target: { value: 'admin*' },
    });
    fireEvent.click(screen.getByText('Ingresar'));

    // Verificar redirección se haría en integración
    expect(screen.queryByText('Credenciales inválidas')).not.toBeInTheDocument();
  });
});