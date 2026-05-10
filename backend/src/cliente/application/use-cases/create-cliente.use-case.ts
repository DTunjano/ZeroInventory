import { ConflictException, Injectable } from '@nestjs/common';
import { ClienteRepository } from '../../domain/repository/cliente.repository';
import { Cliente, TipoDocumentoEnum } from '../../domain/entity/cliente.entity';

@Injectable()
export class CreateClienteUseCase {
  constructor(private readonly clienteRepo: ClienteRepository) {}

  async ejecutar(data: {
    usuarioId: number;
    tipoDocumento: TipoDocumentoEnum;
    documento: string;
  }): Promise<Cliente> {
    const existingClienteByDocumento = await this.clienteRepo.getByDocumento(
      data.documento,
    );
    if (existingClienteByDocumento) {
      throw new ConflictException(
        'Ya existe un cliente con ese número de documento',
      );
    }

    const existingClienteByUsuario = await this.clienteRepo.getByUsuarioId(
      data.usuarioId,
    );
    if (existingClienteByUsuario) {
      throw new ConflictException('El usuario ya tiene un cliente asociado');
    }

    const cliente = new Cliente(
      0,
      data.usuarioId,
      data.tipoDocumento,
      data.documento,
      new Date(),
      new Date(),
    );
    return this.clienteRepo.create(cliente);
  }
}
