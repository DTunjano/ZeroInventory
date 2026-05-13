import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Empleado, EmpleadoEstadoEnum, EmpleadoConRoles } from '../../domain/entity/empleado.entity';
import { EmpleadoRepositoryPort } from '../../domain/port/out/empleado.repository.port';
import { CrearEmpleadoDTO } from '../dto/crear-empleado.dto';
import { UsuarioRepository } from '../../../usuario/domain/repository/usuario.repository';
import { RolRepository } from '../../../rol/domain/repository/rol.repository';
import { UsuarioRolRepository } from '../../../usuario-rol/domain/repository/usuario-rol.repository';
import { Usuario } from '../../../usuario/domain/entity/usuario.entity';
import { UsuarioRol } from '../../../usuario-rol/domain/entity/usuario-rol.entity';
import { RolNombreEnum } from '../../../rol/domain/entity/rol.entity';

@Injectable()
export class CrearEmpleadoUseCase {
  constructor(
    private readonly empleadoRepo: EmpleadoRepositoryPort,
    private readonly usuarioRepo: UsuarioRepository,
    private readonly rolRepo: RolRepository,
    private readonly usuarioRolRepo: UsuarioRolRepository,
  ) {}

  async ejecutar(dto: CrearEmpleadoDTO): Promise<EmpleadoConRoles> {
    try {
      const emailExistente = await this.empleadoRepo.obtenerPorEmail(dto.email);
      if (emailExistente) {
        throw new ConflictException('Ya existe un empleado con ese email');
      }

      if (dto.documento) {
        const documentoExistente = await this.empleadoRepo.obtenerPorDocumento(dto.documento);
        if (documentoExistente) {
          throw new ConflictException('Ya existe un empleado con ese documento');
        }
      }

      const hashPassword = await bcrypt.hash(dto.password, 10);

      const empleado = new Empleado(
        null,
        dto.nombre,
        dto.email,
        EmpleadoEstadoEnum.ACTIVO,
        null,
        dto.telefono ?? null,
        dto.documento ?? null,
        new Date(),
        new Date(),
      );

      const empleadoCreado = await this.empleadoRepo.crear(empleado);

      // Crear Usuario con username = email del empleado
      const usuario = new Usuario(
        0,
        dto.email,
        hashPassword,
        dto.nombre,
        null,
        null,
        null,
        'dark',
        true,
        new Date(),
        new Date(),
      );

      const usuarioCreado = await this.usuarioRepo.create(usuario);

      // Buscar rol EMPLOYEE
      const rolesResult = await this.rolRepo.getAll({ nombre: RolNombreEnum.EMPLOYEE });
      const rolEmpleado = rolesResult.data[0];
      if (!rolEmpleado) {
        throw new NotFoundException('Rol EMPLOYEE no encontrado');
      }

      // Crear UsuarioRol
      const usuarioRol = new UsuarioRol(
        0,
        usuarioCreado.usuarioId,
        rolEmpleado.rolId,
      );
      await this.usuarioRolRepo.create(usuarioRol);

      // Actualizar empleado con el usuarioId creado
      await this.empleadoRepo.actualizar(empleadoCreado.empleadoId!, {
        usuarioId: usuarioCreado.usuarioId,
      } as any);

      const empleadoActualizado = await this.empleadoRepo.obtenerPorId(empleadoCreado.empleadoId!);

      return {
        ...empleadoActualizado!,
        roles: ['EMPLOYEE'],
        nombreCompleto: dto.nombre,
      } as EmpleadoConRoles;
    } catch (error) {
      if (error instanceof ConflictException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al crear el empleado: ' + (error as Error).message,
      );
    }
  }
}
