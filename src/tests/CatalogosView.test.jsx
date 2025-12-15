import { render, screen, fireEvent } from '@testing-library/react';
import CatalogosView from '../pages/Catalogos/CatalogosView';
import { CatalogsProvider } from '../../context/CatalogsContext';
import { AuthProvider } from '../../context/AuthContext';
import { BrowserRouter } from 'react-router-dom';

// Mock de catálogos
jest.mock('../../hooks/useCatalogs', () => ({
  useCatalogs: () => ({
    catalogs: [
      {
        company: 'TechStore',
        dataType: 'products',
        data: [
          { id: '1', name: 'Laptop', price: 1200, availability: 'Disponible' },
        ],
      },
    ],
    loading: false,
  }),
}));

describe('CatalogosView Component', () => {
  test('debe mostrar productos del catálogo', () => {
    render(
      <AuthProvider>
        <CatalogsProvider>
          <BrowserRouter>
            <CatalogosView />
          </BrowserRouter>
        </CatalogsProvider>
      </AuthProvider>
    );

    expect(screen.getByText(/Laptop/i)).toBeInTheDocument();
    expect(screen.getByText(/1200/i)).toBeInTheDocument();
  });

  test('debe permitir añadir producto al carrito', () => {
    render(
      <AuthProvider>
        <CatalogsProvider>
          <BrowserRouter>
            <CatalogosView />
          </BrowserRouter>
        </CatalogsProvider>
      </AuthProvider>
    );

    fireEvent.click(screen.getByText(/Añadir al carrito/i));
    expect(screen.getByTestId('cart-badge')).toHaveTextContent('1');
  });
});