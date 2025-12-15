import { hasPermission } from '../../utils/roles';

describe('Sistema de Roles - Permisos', () => {
  test('admin debe tener acceso a todas las funciones', () => {
    expect(hasPermission('admin', 'reportes')).toBe(true);
    expect(hasPermission('admin', 'catalogos')).toBe(true);
  });

  test('comercial solo puede ver mensajes, no responder', () => {
    expect(hasPermission('comercial', 'messages:view')).toBe(true);
    expect(hasPermission('comercial', 'messages:reply')).toBe(false);
  });

  test('usuario común puede ver catálogos y añadir al carrito', () => {
    expect(hasPermission('user', 'catalogos:view')).toBe(true);
    expect(hasPermission('user', 'pedidos')).toBe(true);
  });
});