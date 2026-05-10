import { Injectable } from '@nestjs/common';
import { CompraRepository } from '../../domain/repository/compra.repository';
import { Compra } from '../../domain/entity/compra.entity';

@Injectable()
export class GetCompraByIdUseCase {
  constructor(private readonly compraRepo: CompraRepository) {}

  async ejecutar(id: number): Promise<Compra | null> {
    return this.compraRepo.getById(id);
  }
}
