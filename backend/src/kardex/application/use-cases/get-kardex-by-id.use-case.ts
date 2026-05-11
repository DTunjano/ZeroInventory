import { Injectable } from '@nestjs/common';
import { KardexRepository } from '../../domain/repository/kardex.repository';
import { Kardex } from '../../domain/entity/kardex.entity';

@Injectable()
export class GetKardexByIdUseCase {
  constructor(private readonly kardexRepository: KardexRepository) {}

  async execute(id: number): Promise<Kardex | null> {
    return await this.kardexRepository.getById(id);
  }
}
