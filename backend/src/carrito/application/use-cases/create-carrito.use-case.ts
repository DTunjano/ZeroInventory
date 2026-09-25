import { ConflictException, Injectable } from '@nestjs/common';
import { CarritoRepository } from '../../domain/repository/carrito.repository';
import { Carrito, EstadoCarritoEnum } from '../../domain/entity/carrito.entity';

@Injectable()
export class CreateCarritoUseCase {
  constructor(private readonly carritoRepo: CarritoRepository) {}

  async ejecutar(data: {
    usuarioId: number;
    estado: EstadoCarritoEnum;
  }): Promise<Carrito> {
    const existingOpenCart = await this.carritoRepo.getOpenCartByUsuarioId(
      data.usuarioId,
    );
    if (existingOpenCart) {
      throw new ConflictException('El usuario ya tiene un carrito abierto');
    }

    const carrito = new Carrito(
      0,
      data.usuarioId,
      data.estado,
      new Date(),
      new Date(),
    );
    return this.carritoRepo.create(carrito);
  }
}
