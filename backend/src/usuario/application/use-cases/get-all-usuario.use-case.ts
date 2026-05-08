import { Injectable } from '@nestjs/common';
import { UsuarioRepository } from '../../domain/repository/usuario.repository';
import { Usuario } from '../../domain/entity/usuario.entity';
import { FiltersUsuarioDTO } from '../dto/filters-usuario-dto';

@Injectable()
export class GetAllUsuariosUseCase {
  constructor(private readonly usuarioRepo: UsuarioRepository) {}

  async ejecutar(filters?: FiltersUsuarioDTO): Promise<{
    data: Usuario[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.usuarioRepo.getAll(filters);
  }
}
