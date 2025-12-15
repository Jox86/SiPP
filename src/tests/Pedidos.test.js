import { PedidosUtils } from './Pedidos';

describe('Pedidos Utilities', () => {
  test('calculateTotal calculates correct total for equipment', () => {
    const form = {
      serviceType: 'compra_equipo',
      equipment: [
        { type: 'Switch', model: 'Cisco Catalyst 2960', quantity: 2 },
        { type: 'Procesador', model: 'Intel Core i7-12700K', quantity: 1 }
      ],
      mobileCards: 0
    };
    
    const total = PedidosUtils.calculateTotal(form);
    expect(total).toBe(2*1200 + 1*450);
  });

  test('findBestSupplier returns correct supplier', () => {
    const equipmentList = [
      { type: 'Switch', model: 'Cisco Catalyst 2960', quantity: 2 }
    ];
    
    const companyList = [
      {
        id: 1,
        company: 'TecnoSuministros',
        supplier: 'contacto@tecnosuministros.com',
        products: [
          { name: 'Switch', model: 'Cisco Catalyst 2960', price: '1100' }
        ]
      },
      {
        id: 2,
        company: 'ElectroComponentes',
        supplier: 'contacto@electro.com',
        products: [
          { name: 'Switch', model: 'Cisco Catalyst 2960', price: '1150' }
        ]
      }
    ];
    
    const bestSupplier = PedidosUtils.findBestSupplier(equipmentList, companyList);
    expect(bestSupplier.companyName).toBe('TecnoSuministros');
    expect(bestSupplier.total).toBe(2200);
  });
});