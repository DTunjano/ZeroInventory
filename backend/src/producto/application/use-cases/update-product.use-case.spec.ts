import { UpdateProductUseCase } from './update-product.use-case'

describe('UpdateProductUseCase', () => {
  const productoRepo = {
    getById: jest.fn(),
    update: jest.fn(),
    existsByNombre: jest.fn(),
    existsBySku: jest.fn(),
  }

  const proveedorRepo = {
    getById: jest.fn(),
  }

  const registerStockAdjustmentUseCase = {
    ejecutar: jest.fn(),
  }

  const registerStockEntryUseCase = {
    ejecutar: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    productoRepo.getById.mockResolvedValue({
      productoId: 9,
      proveedorId: 2,
      nombre: 'Taza',
      cantidad: 10,
      precio: 300,
      descripcion: null,
      sku: 'SKU-1',
      marca: null,
      material: null,
      peso: null,
      medida: null,
      isActive: true,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    })
    productoRepo.existsByNombre.mockResolvedValue(false)
    productoRepo.existsBySku.mockResolvedValue(false)
    productoRepo.update.mockImplementation(async (producto) => producto)
    proveedorRepo.getById.mockResolvedValue({ proveedorId: 2 })
    registerStockAdjustmentUseCase.ejecutar.mockResolvedValue({ ajusteInventarioId: 1 })
    registerStockEntryUseCase.ejecutar.mockResolvedValue({ kardexId: 1 })
  })

  it('registers entry and adjustment when stock increases', async () => {
    const useCase = new UpdateProductUseCase(
      productoRepo as never,
      proveedorRepo as never,
      registerStockAdjustmentUseCase as never,
      registerStockEntryUseCase as never,
    )

    const result = await useCase.ejecutar(9, 5, { cantidad: 15 })

    expect(result.cantidad).toBe(15)
    expect(registerStockEntryUseCase.ejecutar).toHaveBeenCalledWith(expect.objectContaining({
      productoId: 9,
      cantidad: 5,
      referenciaId: 9,
    }))
    expect(registerStockAdjustmentUseCase.ejecutar).toHaveBeenCalledWith(5, expect.objectContaining({
      productoId: 9,
      stockAnterior: 10,
      stockNuevo: 15,
    }))
  })

  it('registers only adjustment when stock decreases', async () => {
    const useCase = new UpdateProductUseCase(
      productoRepo as never,
      proveedorRepo as never,
      registerStockAdjustmentUseCase as never,
      registerStockEntryUseCase as never,
    )

    await useCase.ejecutar(9, 5, { cantidad: 4 })

    expect(registerStockEntryUseCase.ejecutar).not.toHaveBeenCalled()
    expect(registerStockAdjustmentUseCase.ejecutar).toHaveBeenCalledWith(5, expect.objectContaining({
      stockAnterior: 10,
      stockNuevo: 4,
    }))
  })
})