import { Injectable, NotFoundException } from '@nestjs/common';
import { CarritoRepository } from '../../domain/repository/carrito.repository';
import { Carrito, EstadoCarritoEnum } from '../../domain/entity/carrito.entity';

@Injectable()
export class UpdateCarritoUseCase {
  constructor(private readonly carritoRepo: CarritoRepository) {}

  async ejecutar(
    carritoId: number,
    cambios: {
      estado?: EstadoCarritoEnum;
    },
  ): Promise<Carrito> {
    const actual = await this.carritoRepo.getById(carritoId);
    if (!actual) {
      throw new NotFoundException('Carrito no encontrado');
    }

    if (actual.estado === EstadoCarritoEnum.CERRADO) {
      throw new NotFoundException('No se puede modificar un carrito cerrado');
    }

    const carrito = new Carrito(
      actual.carritoId,
      actual.usuarioId,
      cambios.estado ?? actual.estado,
      actual.createdAt,
      new Date(),
    );
    return this.carritoRepo.update(carrito);
  }
}
