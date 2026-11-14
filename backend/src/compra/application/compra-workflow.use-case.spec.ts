import { calculateDraft } from './calculate-draft';

describe('Purchase draft totals', () => {
  it('calculates exact cent totals without accepting client subtotals', () => {
    const draft = calculateDraft({
      proveedorId: 1,
      lineas: [
        { productoId: 1, cantidad: 3, costoUnitario: 0.1 },
        { productoId: 2, cantidad: 2, costoUnitario: 10.15 },
      ],
    });
    expect(draft.total).toBe(20.6);
    expect(draft.lineas[0].subtotal).toBe(0.3);
  });
  it.each([0, -1, 0.001, 1.001, NaN, Infinity, 1000000000000])(
    'rejects invalid unit cost %s',
    (cost) => {
      expect(() =>
        calculateDraft({
          proveedorId: 1,
          lineas: [{ productoId: 1, cantidad: 1, costoUnitario: cost }],
        }),
      ).toThrow();
    },
  );
  it('rejects duplicate products and overflowing subtotals', () => {
    const line = { productoId: 1, cantidad: 1, costoUnitario: 1 };
    expect(() =>
      calculateDraft({ proveedorId: 1, lineas: [line, line] }),
    ).toThrow();
    expect(() =>
      calculateDraft({
        proveedorId: 1,
        lineas: [{ ...line, cantidad: 2, costoUnitario: 600000000000 }],
      }),
    ).toThrow();
  });
});
