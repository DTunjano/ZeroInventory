import { Injectable } from '@nestjs/common';
import { UsuarioRolRepository } from '../../domain/repository/usuario-rol.repository';
import { FiltersUsuarioRolDTO } from '../dto/filters-usuario-rol-dto';
import { UsuarioRol } from '../../domain/entity/usuario-rol.entity';

@Injectable()
export class GetAllUsuarioRolUseCase {
  constructor(private readonly usuarioRolRepo: UsuarioRolRepository) {}

  async ejecutar(filters?: FiltersUsuarioRolDTO): Promise<{
    data: UsuarioRol[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.usuarioRolRepo.getAll(filters);
  }
}
