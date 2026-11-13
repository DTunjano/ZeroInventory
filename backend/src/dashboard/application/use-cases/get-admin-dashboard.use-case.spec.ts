import { DataSource } from 'typeorm'

import { GetAdminDashboardUseCase } from './get-admin-dashboard.use-case'
import { EstadoPedidoEnum } from '../../../pedido/domain/entity/pedido.entity'

function createQueryBuilderMock() {
  const chain: Record<string, jest.Mock> = {
    innerJoin: jest.fn(),
    leftJoin: jest.fn(),
    select: jest.fn(),
    addSelect: jest.fn(),
    where: jest.fn(),
    andWhere: jest.fn(),
    groupBy: jest.fn(),
    addGroupBy: jest.fn(),
    orderBy: jest.fn(),
    limit: jest.fn(),
    skip: jest.fn(),
    take: jest.fn(),
    getRawOne: jest.fn(),
    getRawMany: jest.fn(),
    getCount: jest.fn(),
    clone: jest.fn(),
  }

  chain.innerJoin.mockReturnValue(chain)
  chain.leftJoin.mockReturnValue(chain)
  chain.select.mockReturnValue(chain)
  chain.addSelect.mockReturnValue(chain)
  chain.where.mockReturnValue(chain)
  chain.andWhere.mockReturnValue(chain)
  chain.groupBy.mockReturnValue(chain)
  chain.addGroupBy.mockReturnValue(chain)
  chain.orderBy.mockReturnValue(chain)
  chain.limit.mockReturnValue(chain)
  chain.skip.mockReturnValue(chain)
  chain.take.mockReturnValue(chain)
  chain.clone.mockReturnValue(chain)

  return chain
}

describe('GetAdminDashboardUseCase', () => {
  it('fills monthly series and builds recent orders from real data', async () => {
    const repositories = [
      { count: jest.fn().mockResolvedValue(6) },
      { count: jest.fn().mockResolvedValue(4) },
      { count: jest.fn().mockResolvedValue(8) },
      { count: jest.fn().mockResolvedValue(3) },
      (() => {
        const qb = createQueryBuilderMock()
        qb.getRawOne.mockResolvedValue({ value: 2500 })
        return { createQueryBuilder: jest.fn().mockReturnValue(qb) }
      })(),
      (() => {
        const qb = createQueryBuilderMock()
        qb.getCount.mockResolvedValue(2)
        return { createQueryBuilder: jest.fn().mockReturnValue(qb) }
      })(),
      (() => {
        const qb = createQueryBuilderMock()
        qb.getCount.mockResolvedValue(1)
        return { createQueryBuilder: jest.fn().mockReturnValue(qb) }
      })(),
      (() => {
        const qb = createQueryBuilderMock()
        qb.getRawMany.mockResolvedValue([
          { period: '2026-04', value: 1500 },
          { period: '2026-05', value: 1000 },
        ])
        return { createQueryBuilder: jest.fn().mockReturnValue(qb) }
      })(),
      (() => {
        const qb = createQueryBuilderMock()
        qb.getRawMany.mockResolvedValue([
          { period: '2026-04', value: 1 },
          { period: '2026-05', value: 1 },
        ])
        return { createQueryBuilder: jest.fn().mockReturnValue(qb) }
      })(),
      (() => {
        const qb = createQueryBuilderMock()
        qb.getRawMany.mockResolvedValue([
          { period: '2026-04', entradas: 2, salidas: 1 },
          { period: '2026-05', entradas: 3, salidas: 2 },
        ])
        return { createQueryBuilder: jest.fn().mockReturnValue(qb) }
      })(),
      (() => {
        const qb = createQueryBuilderMock()
        qb.getRawOne.mockResolvedValue({ value: 12 })
        return { createQueryBuilder: jest.fn().mockReturnValue(qb) }
      })(),
      (() => {
        const qb = createQueryBuilderMock()
        qb.getRawMany.mockResolvedValue([
          { productId: 1, name: 'Taza', soldQuantity: 7, revenue: 2100 },
        ])
        return { createQueryBuilder: jest.fn().mockReturnValue(qb) }
      })(),
      (() => {
        const qb = createQueryBuilderMock()
        qb.getRawMany.mockResolvedValue([
          {
            orderId: 33,
            customerName: null,
            username: 'admin',
            firstName: 'Admin',
            lastName: null,
            total: 2500,
            itemsCount: 4,
            state: EstadoPedidoEnum.COMPLETADO,
            paymentStatus: 'APROBADO',
            paymentMethod: 'EFECTIVO',
            date: new Date('2026-05-13T12:00:00.000Z'),
          },
        ])
        return { createQueryBuilder: jest.fn().mockReturnValue(qb) }
      })(),
      (() => {
        const qb = createQueryBuilderMock()
        qb.getRawMany.mockResolvedValue([
          { movementId: 1, productName: 'Taza', typeMovement: 'SALIDA', quantity: 2, referenceId: 33, date: new Date('2026-05-13T12:00:00.000Z') },
        ])
        return { createQueryBuilder: jest.fn().mockReturnValue(qb) }
      })(),
    ]

    const dataSource = {
      getRepository: jest
        .fn()
        .mockReturnValueOnce(repositories[0])
        .mockReturnValueOnce(repositories[1])
        .mockReturnValueOnce(repositories[2])
        .mockReturnValueOnce(repositories[3])
        .mockReturnValueOnce(repositories[4])
        .mockReturnValueOnce(repositories[5])
        .mockReturnValueOnce(repositories[6])
        .mockReturnValueOnce(repositories[7])
        .mockReturnValueOnce(repositories[8])
        .mockReturnValueOnce(repositories[9])
        .mockReturnValueOnce(repositories[10])
        .mockReturnValueOnce(repositories[11])
        .mockReturnValueOnce(repositories[12])
        .mockReturnValueOnce(repositories[13]),
    } as unknown as DataSource

    const useCase = new GetAdminDashboardUseCase(dataSource)
    const result = await useCase.ejecutar()

    expect(result.summary.totalIngresos).toBe(2500)
    expect(result.summary.pedidosCompletados).toBe(2)
    expect(result.summary.totalProductosVendidos).toBe(12)
    expect(result.revenueOverview.some((point) => point.period === '2026-05' && point.value === 1000)).toBe(true)
    expect(result.recentOrders).toHaveLength(1)
    expect(result.recentOrders[0]?.paymentMethod).toBe('EFECTIVO')
  })
})