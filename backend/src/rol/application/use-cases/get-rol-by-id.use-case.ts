import { Injectable } from '@nestjs/common';
import { RolRepository } from '../../domain/repository/rol.repository';
import { Rol } from '../../domain/entity/rol.entity';

@Injectable()
export class GetRolByIdUseCase {
  constructor(private readonly rolRepo: RolRepository) {}

  async ejecutar(rolId: number): Promise<Rol | null> {
    return this.rolRepo.getById(rolId);
  }
}
