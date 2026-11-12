import { Injectable } from '@nestjs/common';
import { KardexRepository } from '../../domain/repository/kardex.repository';
import { Kardex } from '../../domain/entity/kardex.entity';
import { FilterKardexDTO } from '../dto/filters-kardex-dto';

@Injectable()
export class GetAllKardexUseCase {
  constructor(private readonly kardexRepository: KardexRepository) {}

  async execute(filters?: FilterKardexDTO): Promise<{
    data: Kardex[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return await this.kardexRepository.getAll(filters);
  }
}
