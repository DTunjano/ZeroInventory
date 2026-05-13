import { Injectable, NotFoundException } from '@nestjs/common';
import { UsuarioRepository } from '../../../usuario/domain/repository/usuario.repository';
import { ClienteRepository } from '../../../cliente/domain/repository/cliente.repository';
import { DireccionRepository } from '../../../direccion/domain/repository/direccion.repository';
import { Direccion } from '../../../direccion/domain/entity/direccion.entity';
import { UpdateSettingsDto } from '../dto/update-settings.dto';

@Injectable()
export class UpdateSettingsUseCase {
  constructor(
    private readonly usuarioRepo: UsuarioRepository,
    private readonly clienteRepo: ClienteRepository,
    private readonly direccionRepo: DireccionRepository,
  ) {}

  async ejecutar(usuarioId: number, body: UpdateSettingsDto): Promise<void> {
    const usuario = await this.usuarioRepo.getById(usuarioId);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Actualizar campos de usuario presentes en el body
    if (body.primerNombre !== undefined) {
      usuario.primerNombre = body.primerNombre ?? null;
    }
    if (body.segundoNombre !== undefined) {
      usuario.segundoNombre = body.segundoNombre ?? null;
    }
    if (body.primerApellido !== undefined) {
      usuario.primerApellido = body.primerApellido ?? null;
    }
    if (body.segundoApellido !== undefined) {
      usuario.segundoApellido = body.segundoApellido ?? null;
    }
    if (body.theme !== undefined) {
      usuario.theme = body.theme;
    }

    await this.usuarioRepo.update(usuario);

    // Actualizar o crear dirección si se proporciona y el usuario es cliente
    if (body.address) {
      const cliente = await this.clienteRepo.getByUsuarioId(usuarioId);
      if (cliente) {
        const direccionesResult = await this.direccionRepo.getAll({
          clienteId: cliente.clienteId,
          page: 1,
          limit: 1,
        });
        const existingDir = direccionesResult.data[0] ?? null;

        if (existingDir) {
          existingDir.lineaDir = body.address.lineaDir;
          existingDir.barrio = body.address.barrio;
          existingDir.codigoPostal = body.address.codigoPostal ?? null;
          existingDir.infoAdiccional = body.address.infoAdicional ?? null;
          await this.direccionRepo.update(existingDir);
        } else {
          const newDir = new Direccion(
            0,
            cliente.clienteId,
            body.address.lineaDir,
            body.address.barrio,
            body.address.codigoPostal ?? null,
            body.address.infoAdicional ?? null,
          );
          await this.direccionRepo.create(newDir);
        }
      }
    }
  }
}
