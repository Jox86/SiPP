// src/tests/Dashboard.test.js
import { render, screen, waitFor } from '@testing-library/react';
import Dashboard from '../pages/Dashboard/Dashboard';
import { getInitialProjects, getInitialOrders } from '../utils/data';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { NotificationProvider } from '../context/NotificationContext';

// Mock de currentUser
const currentUser = {
  id: 1,
  fullName: 'Administrador',
  role: 'admin'
};

const renderWithProviders = (ui) => {
  return render(
    <AuthProvider>
      <ThemeProvider>
        <NotificationProvider>
          {ui}
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

describe('Dashboard', () => {
  test('muestra el nombre del usuario', async () => {
    renderWithProviders(<Dashboard currentUser={currentUser} />);

    await waitFor(() => {
      expect(screen.getByText(/Bienvenido de vuelta, Administrador/i)).toBeInTheDocument();
    });
  });

  test('muestra estadísticas de proyectos', async () => {
    const projects = getInitialProjects();
    const totalProjects = projects.length;

    renderWithProviders(<Dashboard currentUser={currentUser} />);

    await waitFor(() => {
      expect(screen.getByText(new RegExp(totalProjects))).toBeInTheDocument();
    });
  });

  test('muestra porcentaje de presupuesto usado', async () => {
    const projects = getInitialProjects();
    const budgetTotal = projects.reduce((sum, p) => sum + p.budget, 0);
    const budgetUsed = projects.reduce((sum, p) => sum + p.budgetSpent, 0);
    const budgetPercentage = Math.round((budgetUsed / budgetTotal) * 100);

    renderWithProviders(<Dashboard currentUser={currentUser} />);

    await waitFor(() => {
      expect(screen.getByText(`${budgetPercentage}%`)).toBeInTheDocument();
    });
  });

  test('muestra tabla de pedidos recientes', async () => {
    const orders = getInitialOrders();

    renderWithProviders(<Dashboard currentUser={currentUser} />);

    await waitFor(() => {
      expect(screen.getByText(orders[0].id)).toBeInTheDocument();
    });
  });

  test('muestra gráficos', async () => {
    renderWithProviders(<Dashboard currentUser={currentUser} />);

    await waitFor(() => {
      const charts = screen.getAllByRole('graphics-document');
      expect(charts.length).toBe(3); // Pie, Line, Bar
    });
  });
});