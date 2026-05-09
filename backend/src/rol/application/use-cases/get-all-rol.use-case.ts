import { Injectable } from '@nestjs/common';
import { RolRepository } from '../../domain/repository/rol.repository';
import { FiltersRolDTO } from '../dto/filters-rol-dto';
import { Rol } from '../../domain/entity/rol.entity';

@Injectable()
export class GetAllRolUseCase {
  constructor(private readonly rolRepo: RolRepository) {}

  async ejecutar(filters?: FiltersRolDTO): Promise<{
    data: Rol[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.rolRepo.getAll(filters);
  }
}
