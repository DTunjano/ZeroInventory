import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { CompraWorkflowRepository } from '../../domain/repository/compra-workflow.repository';
import {
  CompraAccion,
  CompraDetalle,
  CompraDraft,
  CompraFiltros,
  CompraResumen,
  CompraSnapshot,
} from '../../domain/compra-workflow.types';
import { CompraEntityORM } from './compra.orm-entity';
import { CompraEventoEntityORM } from './compra-evento.orm-entity';
import { CompraDetalleEntityORM } from '../../../compra-detalle/infrastructure/persistence/compra-detalle.orm-entity';
import { ProductoEntityORM } from '../../../producto/infrastructure/persistence/producto.orm-entity';
import { ProveedorEntityORM } from '../../../proveedor/infrastructure/persistence/proveedor.orm-entity';
import {
  KardexEntityORM,
  TipoMovimientoEnum,
  TipoReferenciaEnum,
} from '../../../kardex/infrastructure/persistence/kardex.orm-entity';
import { validateStock } from '../../../inventory/infrastructure/stock-transaction';
import { calculateDraft } from '../../application/calculate-draft';
import { cents } from '../../../shared/money';

@Injectable()
export class TypeOrmCompraWorkflowRepository implements CompraWorkflowRepository {
  constructor(private readonly db: DataSource) {}
  async createDraft(data: CompraDraft, actor: number): Promise<CompraDetalle> {
    return this.db.transaction(async (manager) => {
      await this.validateReferences(manager, data, false);
      const purchase = await manager.save(
        CompraEntityORM,
        manager.create(CompraEntityORM, {
          proveedorId: data.proveedorId,
          usuarioId: actor,
          total: data.total,
          estado: 'BORRADOR',
          version: 1,
          observaciones: data.observaciones ?? null,
          registradaEn: new Date(),
        }),
      );
      await this.writeLines(manager, purchase.compraId, data);
      await this.recordEvent(manager, purchase.compraId, actor, 'CREADA');
      return this.hydrate(manager, purchase.compraId);
    });
  }
  async updateDraft(
    id: number,
    version: number,
    data: CompraDraft,
    actor: number,
  ): Promise<CompraDetalle> {
    return this.db.transaction(async (manager) => {
      const purchase = await this.lock(manager, id);
      this.requireDraft(purchase, version);
      await this.validateReferences(manager, data, false);
      purchase.proveedorId = data.proveedorId;
      purchase.total = data.total;
      purchase.observaciones = data.observaciones ?? null;
      purchase.version++;
      await manager.save(CompraEntityORM, purchase);
      // Draft lines may be replaced; immutable snapshots retain prior versions.
      await manager.delete(CompraDetalleEntityORM, { compraId: id });
      await this.writeLines(manager, id, data);
      await this.recordEvent(manager, id, actor, 'ACTUALIZADA');
      return this.hydrate(manager, id);
    });
  }
  async receive(
    id: number,
    version: number,
    actor: number,
  ): Promise<CompraDetalle> {
    return this.db.transaction(async (manager) => {
      const purchase = await this.lock(manager, id);
      // Retried confirmations return the original result without another entry.
      if (purchase.estado === 'RECIBIDA') return this.hydrate(manager, id);
      this.requireDraft(purchase, version);
      const lines = await manager.find(CompraDetalleEntityORM, {
        where: { compraId: id },
        order: { productoId: 'ASC' },
      });
      const draft = calculateDraft({
        proveedorId: purchase.proveedorId,
        lineas: lines.map((line) => ({
          productoId: line.productoId,
          cantidad: line.cantidad,
          costoUnitario: Number(line.costoUnitario),
        })),
      });
      if (
        cents(draft.total) !== cents(Number(purchase.total)) ||
        lines.some(
          (line, index) =>
            cents(Number(line.subtotal)) !==
            cents(draft.lineas[index].subtotal),
        )
      )
        throw new ConflictException(
          'Las líneas no coinciden con el total de la compra',
        );
      const products = await this.validateReferences(manager, draft, true);
      for (const line of draft.lineas) {
        const product = products.get(line.productoId)!;
        validateStock(product.cantidad + line.cantidad);
        product.cantidad += line.cantidad;
        product.updatedAt = new Date();
        await manager.save(ProductoEntityORM, product);
        await manager.insert(KardexEntityORM, {
          productoId: line.productoId,
          tipoMovimiento: TipoMovimientoEnum.ENTRADA,
          cantidad: line.cantidad,
          costoUnitario: line.costoUnitario,
          valorTotal: line.subtotal,
          tipoReferencia: TipoReferenciaEnum.RECEPCION_COMPRA,
          referenciaId: id,
          registradoEn: new Date(),
        });
      }
      purchase.estado = 'RECIBIDA';
      purchase.recibidaPor = actor;
      purchase.recibidaEn = new Date();
      purchase.version++;
      await manager.save(CompraEntityORM, purchase);
      await this.recordEvent(manager, id, actor, 'RECIBIDA');
      return this.hydrate(manager, id);
    });
  }
  async cancel(
    id: number,
    version: number,
    reason: string,
    actor: number,
  ): Promise<CompraDetalle> {
    return this.db.transaction(async (manager) => {
      const purchase = await this.lock(manager, id);
      if (purchase.estado === 'CANCELADA') return this.hydrate(manager, id);
      this.requireDraft(purchase, version);
      purchase.estado = 'CANCELADA';
      purchase.canceladaPor = actor;
      purchase.canceladaEn = new Date();
      purchase.motivoCancelacion = reason;
      purchase.version++;
      await manager.save(CompraEntityORM, purchase);
      await this.recordEvent(manager, id, actor, 'CANCELADA', reason);
      return this.hydrate(manager, id);
    });
  }
  get(id: number): Promise<CompraDetalle> {
    return this.db.transaction('REPEATABLE READ', async (manager) => {
      await manager.query('SET TRANSACTION READ ONLY');
      return this.hydrate(manager, id);
    });
  }
  async list(filters: CompraFiltros) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const query = this.db
      .getRepository(CompraEntityORM)
      .createQueryBuilder('compra')
      .leftJoinAndSelect('compra.proveedor', 'proveedor');
    if (filters.proveedorId)
      query.andWhere('compra.proveedorId=:supplier', {
        supplier: filters.proveedorId,
      });
    if (filters.usuarioId)
      query.andWhere('compra.usuarioId=:actor', { actor: filters.usuarioId });
    if (filters.estado)
      query.andWhere('compra.estado=:state', { state: filters.estado });
    const [rows, total] = await query
      .orderBy('compra.compraId', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return {
      data: rows.map((row) => this.summary(row)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
  private async lock(manager: EntityManager, id: number) {
    const purchase = await manager.findOne(CompraEntityORM, {
      where: { compraId: id },
      lock: { mode: 'pessimistic_write' },
    });
    if (!purchase) throw new NotFoundException('Compra no encontrada');
    return purchase;
  }
  private requireDraft(purchase: CompraEntityORM, version: number) {
    if (purchase.estado !== 'BORRADOR')
      throw new ConflictException(
        'Solo se modifican o reciben compras en borrador; el historial se conserva',
      );
    if (purchase.version !== version)
      throw new ConflictException(
        'La compra cambió. Actualiza el detalle antes de continuar',
      );
  }
  private async validateReferences(
    manager: EntityManager,
    data: CompraDraft,
    forReceipt: boolean,
  ) {
    const supplier = await manager.findOne(ProveedorEntityORM, {
      where: { proveedorId: data.proveedorId },
      lock: { mode: 'pessimistic_read' },
    });
    if (!supplier?.isActive)
      throw new BadRequestException('El proveedor no existe o está inactivo');
    const products = new Map<number, ProductoEntityORM>();
    for (const line of [...data.lineas].sort(
      (a, b) => a.productoId - b.productoId,
    )) {
      const product = await manager.findOne(ProductoEntityORM, {
        where: { productoId: line.productoId },
        lock: { mode: forReceipt ? 'pessimistic_write' : 'pessimistic_read' },
      });
      if (!product?.isActive || product.proveedorId !== data.proveedorId)
        throw new BadRequestException(
          'Cada producto debe estar activo y pertenecer al proveedor de la compra',
        );
      products.set(product.productoId, product);
    }
    return products;
  }
  private async writeLines(
    manager: EntityManager,
    id: number,
    data: CompraDraft,
  ) {
    for (const line of data.lineas)
      await manager.insert(CompraDetalleEntityORM, { ...line, compraId: id });
  }
  private summary(p: CompraEntityORM): CompraResumen {
    return {
      compraId: p.compraId,
      proveedorId: p.proveedorId,
      proveedorNombre: p.proveedor.nombre,
      usuarioId: p.usuarioId,
      total: Number(p.total),
      fechaCompra: p.registradaEn ?? p.fechaCompra,
      estado: p.estado,
      version: p.version,
      observaciones: p.observaciones,
      recibidaPor: p.recibidaPor,
      recibidaEn: p.recibidaEn,
      canceladaPor: p.canceladaPor,
      canceladaEn: p.canceladaEn,
      motivoCancelacion: p.motivoCancelacion,
    };
  }
  private async hydrate(
    manager: EntityManager,
    id: number,
  ): Promise<CompraDetalle> {
    const purchase = await manager.findOne(CompraEntityORM, {
      where: { compraId: id },
      relations: ['proveedor'],
    });
    if (!purchase) throw new NotFoundException('Compra no encontrada');
    const lines = await manager.find(CompraDetalleEntityORM, {
      where: { compraId: id },
      relations: ['producto'],
      order: { compraDetalleId: 'ASC' },
    });
    const events = await manager.find(CompraEventoEntityORM, {
      where: { compraId: id },
      order: { version: 'ASC' },
    });
    return {
      ...this.summary(purchase),
      lineas: lines.map((line) => ({
        compraDetalleId: line.compraDetalleId,
        productoId: line.productoId,
        productoNombre: line.producto.nombre,
        sku: line.producto.sku,
        cantidad: line.cantidad,
        costoUnitario: Number(line.costoUnitario),
        subtotal: Number(line.subtotal),
      })),
      historial: events.map((event) => ({
        eventoId: event.eventoId,
        accion: event.accion,
        usuarioId: event.usuarioId,
        version: event.version,
        fecha: event.fecha,
        motivo: event.motivo,
        snapshot: event.snapshot,
      })),
    };
  }
  private async recordEvent(
    manager: EntityManager,
    id: number,
    actor: number,
    action: CompraAccion,
    reason: string | null = null,
  ) {
    const purchase = await this.hydrate(manager, id);
    const snapshot: CompraSnapshot = {
      proveedorNombre: purchase.proveedorNombre,
      total: purchase.total,
      lineas: purchase.lineas.map(
        ({
          productoId,
          productoNombre,
          sku,
          cantidad,
          costoUnitario,
          subtotal,
        }) => ({
          productoId,
          productoNombre,
          sku,
          cantidad,
          costoUnitario,
          subtotal,
        }),
      ),
    };
    await manager.insert(CompraEventoEntityORM, {
      compraId: id,
      usuarioId: actor,
      accion: action,
      version: purchase.version,
      motivo: reason,
      snapshot,
      fecha: new Date(),
    });
  }
}
