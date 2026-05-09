import { Injectable } from '@nestjs/common';
import { RolRepository } from '../../domain/repository/rol.repository';
import { Rol, RolNombreEnum } from '../../domain/entity/rol.entity';

@Injectable()
export class CreateRolUseCase {
  constructor(private readonly rolRepo: RolRepository) {}

  async ejecutar(data: { nombre: RolNombreEnum }): Promise<Rol> {
    const rol = new Rol(0, data.nombre);
    return this.rolRepo.create(rol);
  }
}
