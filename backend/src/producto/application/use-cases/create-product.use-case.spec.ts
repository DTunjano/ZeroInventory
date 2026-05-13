import { ConflictException } from '@nestjs/common'

import { CreateProductUseCase } from './create-product.use-case'

describe('CreateProductUseCase', () => {
  const productoRepo = {
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    existsByNombre: jest.fn(),
    existsBySku: jest.fn(),
  }

  const proveedorRepo = {
    getById: jest.fn(),
  }

  const registerStockEntryUseCase = {
    ejecutar: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    productoRepo.existsByNombre.mockResolvedValue(false)
    proveedorRepo.getById.mockResolvedValue({ proveedorId: 1 })
    productoRepo.create.mockImplementation(async (producto) => ({ ...producto, productoId: 21 }))
    productoRepo.update.mockImplementation(async (producto) => producto)
    registerStockEntryUseCase.ejecutar.mockResolvedValue({ kardexId: 1 })
  })

  it('registers an ENTRADA movement when the new product starts with stock', async () => {
    const useCase = new CreateProductUseCase(productoRepo as never, proveedorRepo as never, registerStockEntryUseCase as never)

    const result = await useCase.ejecutar({
      proveedorId: 1,
      nombre: 'Producto demo',
      cantidad: 8,
      precio: 1200,
    })

    expect(result.productoId).toBe(21)
    expect(registerStockEntryUseCase.ejecutar).toHaveBeenCalledWith(expect.objectContaining({
      productoId: 21,
      cantidad: 8,
      costoUnitario: 1200,
      referenciaId: 21,
    }))
  })

  it('rejects duplicated product names', async () => {
    productoRepo.existsByNombre.mockResolvedValue(true)
    const useCase = new CreateProductUseCase(productoRepo as never, proveedorRepo as never, registerStockEntryUseCase as never)

    await expect(useCase.ejecutar({ nombre: 'Duplicado', cantidad: 1, precio: 100 })).rejects.toBeInstanceOf(ConflictException)
  })
})