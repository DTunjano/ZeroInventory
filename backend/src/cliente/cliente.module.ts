import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClienteEntityORM } from './infrastructure/persistence/cliente.orm-entity';
import { ClienteController } from './adapters/controllers/cliente.controller';
import { ClienteRepositoryImpl } from './infrastructure/persistence/cliente.repository-impl';
import { ClienteRepository } from './domain/repository/cliente.repository';
import { CreateClienteUseCase } from './application/use-cases/create-cliente.use-case';
import { GetAllClientesUseCase } from './application/use-cases/get-all-cliente.use-case';
import { GetClienteByIdUseCase } from './application/use-cases/get-cliente-by-id.use-case';
import { UpdateClienteUseCase } from './application/use-cases/update-cliente.use-case';
import { DeleteClienteUseCase } from './application/use-cases/delete-cliente.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([ClienteEntityORM])],
  controllers: [ClienteController],
  providers: [
    CreateClienteUseCase,
    UpdateClienteUseCase,
    DeleteClienteUseCase,
    GetAllClientesUseCase,
    GetClienteByIdUseCase,
    {
      provide: ClienteRepository,
      useClass: ClienteRepositoryImpl,
    },
  ],
})
export class ClienteModule {}
