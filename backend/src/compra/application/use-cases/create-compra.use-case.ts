import { Injectable } from '@nestjs/common';
import { CompraRepository } from '../../domain/repository/compra.repository';
import { Compra } from '../../domain/entity/compra.entity';

@Injectable()
export class CreateCompraUseCase {
  constructor(private readonly compraRepo: CompraRepository) {}

  async ejecutar(data: {
    proveedorId: number;
    usuarioId: number;
    total: number;
  }): Promise<Compra> {
    const compra = new Compra(
      0,
      data.proveedorId,
      data.usuarioId,
      data.total,
      new Date(),
    );
    return this.compraRepo.create(compra);
  }
}
