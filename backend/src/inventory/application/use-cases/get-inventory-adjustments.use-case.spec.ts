import { DataSource } from 'typeorm'

import { GetInventoryAdjustmentsUseCase } from './get-inventory-adjustments.use-case'
import { TipoCambioEnum } from '../../../ajuste-inventario/infrastructure/persistence/ajuste-inventario.orm-entity'

function createQueryBuilderMock() {
  const chain: Record<string, jest.Mock> = {
    innerJoin: jest.fn(),
    select: jest.fn(),
    addSelect: jest.fn(),
    where: jest.fn(),
    andWhere: jest.fn(),
    orderBy: jest.fn(),
    skip: jest.fn(),
    take: jest.fn(),
    clone: jest.fn(),
    getCount: jest.fn(),
    getRawMany: jest.fn(),
  }

  chain.innerJoin.mockReturnValue(chain)
  chain.select.mockReturnValue(chain)
  chain.addSelect.mockReturnValue(chain)
  chain.where.mockReturnValue(chain)
  chain.andWhere.mockReturnValue(chain)
  chain.orderBy.mockReturnValue(chain)
  chain.skip.mockReturnValue(chain)
  chain.take.mockReturnValue(chain)
  chain.clone.mockReturnValue(chain)

  return chain
}

describe('GetInventoryAdjustmentsUseCase', () => {
  it('returns a paginated list with search and filters applied', async () => {
    const queryBuilder = createQueryBuilderMock()
    queryBuilder.getCount.mockResolvedValue(1)
    queryBuilder.getRawMany.mockResolvedValue([
      {
        adjustmentId: 41,
        productId: 9,
        productName: 'Taza',
        productSku: 'SKU-9',
        userId: 2,
        userUsername: 'admin',
        userFirstName: 'Admin',
        userLastName: null,
        cantidad: 5,
        stockAnterior: 10,
        stockNuevo: 15,
        tipoCambio: TipoCambioEnum.AUMENTO,
        motivo: 'Ajuste manual',
        fecha: new Date('2026-05-13T12:00:00.000Z'),
      },
    ])

    const dataSource = {
      getRepository: jest.fn().mockReturnValue({ createQueryBuilder: jest.fn().mockReturnValue(queryBuilder) }),
    } as unknown as DataSource

    const useCase = new GetInventoryAdjustmentsUseCase(dataSource)
    const result = await useCase.ejecutar({ page: 2, limit: 15, search: 'taza', tipoCambio: TipoCambioEnum.AUMENTO })

    expect(result.total).toBe(1)
    expect(result.page).toBe(2)
    expect(result.limit).toBe(15)
    expect(result.data[0]?.productoNombre).toBe('Taza')
    expect(result.data[0]?.usuarioNombre).toBe('Admin')
  })
})