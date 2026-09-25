import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClienteRepository } from '../../domain/repository/cliente.repository';
import { Cliente, TipoDocumentoEnum } from '../../domain/entity/cliente.entity';

@Injectable()
export class UpdateClienteUseCase {
  constructor(private readonly clienteRepo: ClienteRepository) {}

  async ejecutar(
    clienteId: number,
    cambios: {
      usuarioId?: number;
      tipoDocumento?: TipoDocumentoEnum;
      documento?: string;
    },
  ): Promise<Cliente> {
    const actual = await this.clienteRepo.getById(clienteId);
    if (!actual) {
      throw new NotFoundException('Cliente no encontrado');
    }

    if (cambios.documento && cambios.documento !== actual.documento) {
      const existingClienteByDocumento = await this.clienteRepo.getByDocumento(
        cambios.documento,
      );
      if (
        existingClienteByDocumento &&
        existingClienteByDocumento.clienteId !== clienteId
      ) {
        throw new ConflictException(
          'Ya existe un cliente con ese número de documento',
        );
      }
    }

    if (cambios.usuarioId && cambios.usuarioId !== actual.usuarioId) {
      const existingClienteByUsuario = await this.clienteRepo.getByUsuarioId(
        cambios.usuarioId,
      );
      if (
        existingClienteByUsuario &&
        existingClienteByUsuario.clienteId !== clienteId
      ) {
        throw new ConflictException('El usuario ya tiene un cliente asociado');
      }
    }

    const cliente = new Cliente(
      actual.clienteId,
      cambios.usuarioId ?? actual.usuarioId,
      cambios.tipoDocumento ?? actual.tipoDocumento,
      cambios.documento ?? actual.documento,
      actual.createdAt,
      new Date(),
    );
    return this.clienteRepo.update(cliente);
  }
}
