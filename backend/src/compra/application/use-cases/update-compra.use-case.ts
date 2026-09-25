import { Injectable, NotFoundException } from '@nestjs/common';
import { CompraRepository } from '../../domain/repository/compra.repository';
import { Compra } from '../../domain/entity/compra.entity';

@Injectable()
export class UpdateCompraUseCase {
  constructor(private readonly compraRepo: CompraRepository) {}

  async ejecutar(
    compraId: number,
    cambios: {
      proveedorId?: number;
      usuarioId?: number;
      total?: number;
    },
  ): Promise<Compra> {
    const actual = await this.compraRepo.getById(compraId);
    if (!actual) {
      throw new NotFoundException('Compra no encontrada');
    }

    const compra = new Compra(
      actual.compraId,
      cambios.proveedorId ?? actual.proveedorId,
      cambios.usuarioId ?? actual.usuarioId,
      cambios.total ?? actual.total,
      actual.fechaCompra,
    );
    return this.compraRepo.update(compra);
  }
}
