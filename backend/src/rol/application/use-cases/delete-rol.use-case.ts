import { Injectable } from '@nestjs/common';
import { RolRepository } from '../../domain/repository/rol.repository';

@Injectable()
export class DeleteRolUseCase {
  constructor(private readonly rolRepo: RolRepository) {}

  async ejecutar(rolId: number): Promise<boolean> {
    return this.rolRepo.delete(rolId);
  }
}
