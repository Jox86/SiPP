import { render, screen } from '@testing-library/react';
import Dashboard from '../pages/Dashboard';
import { AuthProvider } from '../context/AuthContext';
import { BrowserRouter } from 'react-router-dom';

jest.mock('../hooks/useProjects', () => ({
  useProjects: () => ({
    projects: [
      { id: '1', name: 'Proyecto A', budget: 5000, status: 'active' },
    ],
    loading: false,
  }),
}));

describe('Dashboard Component', () => {
  test('debe mostrar tarjetas con datos del usuario', () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <Dashboard />
        </BrowserRouter>
      </AuthProvider>
    );

    expect(screen.getByText(/Proyecto A/i)).toBeInTheDocument();
    expect(screen.getByText(/Solicitudes recientes/i)).toBeInTheDocument();
  });

  test('debe mostrar gráficos de distribución de equipos', () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <Dashboard />
        </BrowserRouter>
      </AuthProvider>
    );

    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });
});