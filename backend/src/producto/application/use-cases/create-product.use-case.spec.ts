import { Producto } from '../../domain/entity/producto.entity';
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
    productoRepo.create.mockImplementation((producto: Producto) => Promise.resolve({ ...producto, productoId: 21 }))
    productoRepo.update.mockImplementation((producto: Producto) => Promise.resolve(producto))
    registerStockEntryUseCase.ejecutar.mockResolvedValue({ kardexId: 1 })
  })

  it('delegates product and initial stock persistence to the atomic repository', async () => {
    const useCase = new CreateProductUseCase(productoRepo as never, proveedorRepo as never)

    const result = await useCase.ejecutar({
      proveedorId: 1,
      nombre: 'Producto demo',
      cantidad: 8,
      precio: 1200,
    })

    expect(result.productoId).toBe(21)
    expect(productoRepo.create).toHaveBeenCalledWith(expect.objectContaining({ cantidad: 8, precio: 1200 }))
  })

  it('rejects duplicated product names', async () => {
    productoRepo.existsByNombre.mockResolvedValue(true)
    const useCase = new CreateProductUseCase(productoRepo as never, proveedorRepo as never)

    await expect(useCase.ejecutar({ nombre: 'Duplicado', cantidad: 1, precio: 100 })).rejects.toBeInstanceOf(ConflictException)
  })
})