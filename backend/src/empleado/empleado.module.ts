import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmpleadoEntityORM } from './infrastructure/adapters/persistence/empleado.orm-entity';
import { EmpleadoRepositoryImpl } from './infrastructure/adapters/repository/empleado.repository-impl';
import { EmpleadoRepositoryPort } from './domain/port/out/empleado.repository.port';
import { EmpleadoController } from './interfaces/empleado.controller';
import { CrearEmpleadoUseCase } from './application/use-case/crear-empleado.use-case';
import { ListarEmpleadosUseCase } from './application/use-case/listar-empleados.use-case';
import { ObtenerEmpleadoUseCase } from './application/use-case/obtener-empleado.use-case';
import { ActualizarEmpleadoUseCase } from './application/use-case/actualizar-empleado.use-case';
import { ToggleEmpleadoUseCase } from './application/use-case/toggle-empleado.use-case';
import { DesactivarEmpleadoUseCase } from './application/use-case/desactivar-empleado.use-case';
import { ActivarEmpleadoUseCase } from './application/use-case/activar-empleado.use-case';
import { UsuarioModule } from '../usuario/usuario.module';
import { RolModule } from '../rol/rol.module';
import { UsuarioRolModule } from '../usuario-rol/usuario-rol.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmpleadoEntityORM]),
    UsuarioModule,
    RolModule,
    UsuarioRolModule,
  ],
  controllers: [EmpleadoController],
  providers: [
    {
      provide: EmpleadoRepositoryPort,
      useClass: EmpleadoRepositoryImpl,
    },
    CrearEmpleadoUseCase,
    ListarEmpleadosUseCase,
    ObtenerEmpleadoUseCase,
    ActualizarEmpleadoUseCase,
    ToggleEmpleadoUseCase,
    DesactivarEmpleadoUseCase,
    ActivarEmpleadoUseCase,
  ],
  exports: [EmpleadoRepositoryPort],
})
export class EmpleadoModule {}
