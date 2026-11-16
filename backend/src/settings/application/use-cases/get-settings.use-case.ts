import { Injectable, NotFoundException } from '@nestjs/common';
import { UserSettings, Theme, UserAddress } from '../../domain/settings.entity';
import { UsuarioRepository } from '../../../usuario/domain/repository/usuario.repository';
import { ClienteRepository } from '../../../cliente/domain/repository/cliente.repository';
import { DireccionRepository } from '../../../direccion/domain/repository/direccion.repository';

@Injectable()
export class GetSettingsUseCase {
  constructor(
    private readonly usuarioRepo: UsuarioRepository,
    private readonly clienteRepo: ClienteRepository,
    private readonly direccionRepo: DireccionRepository,
  ) {}

  async ejecutar(usuarioId: number): Promise<UserSettings> {
    const usuario = await this.usuarioRepo.getById(usuarioId);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const cliente = await this.clienteRepo.getByUsuarioId(usuarioId);
    let address: UserAddress | null = null;
    if (cliente) {
      const direccionesResult = await this.direccionRepo.getAll({
        clienteId: cliente.clienteId,
        page: 1,
        limit: 1,
      });
      const dir = direccionesResult.data[0] ?? null;
      if (dir) {
        address = {
          lineaDir: dir.lineaDir,
          barrio: dir.barrio,
          codigoPostal: dir.codigoPostal,
          infoAdicional: dir.infoAdiccional,
        };
      }
    }

    return {
      profile: {
        username: usuario.username,
        email: usuario.email ?? '',
        telefono: usuario.telefono,
        primerNombre: usuario.primerNombre,
        segundoNombre: usuario.segundoNombre,
        primerApellido: usuario.primerApellido,
        segundoApellido: usuario.segundoApellido,
        theme: (usuario.theme as Theme) ?? Theme.DARK,
      },
      address,
      theme: (usuario.theme as Theme) ?? Theme.DARK,
    };
  }
}
