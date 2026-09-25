import { Injectable } from '@nestjs/common';
import { KardexRepository } from '../../domain/repository/kardex.repository';
import { Kardex } from '../../domain/entity/kardex.entity';
import { CreateKardexDTO } from '../dto/create-kardex-dto';

@Injectable()
export class CreateKardexUseCase {
  constructor(private readonly kardexRepository: KardexRepository) {}

  async execute(createKardexDTO: CreateKardexDTO): Promise<Kardex> {
    const total = createKardexDTO.cantidad * createKardexDTO.costoUnitario;

    const kardex = new Kardex(
      0,
      createKardexDTO.productoId,
      createKardexDTO.tipoMovimiento,
      createKardexDTO.cantidad,
      createKardexDTO.costoUnitario,
      total,
      createKardexDTO.referenciaId,
      createKardexDTO.tipoReferencia,
      new Date(),
    );

    return await this.kardexRepository.create(kardex);
  }
}
