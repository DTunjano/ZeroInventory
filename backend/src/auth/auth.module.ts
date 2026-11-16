import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { PassportModule } from '@nestjs/passport'
import { TypeOrmModule } from '@nestjs/typeorm'

import { ClienteModule } from '../cliente/cliente.module'
import { RolModule } from '../rol/rol.module'
import { UsuarioModule } from '../usuario/usuario.module'
import { UsuarioRolModule } from '../usuario-rol/usuario-rol.module'
import { UsuarioEntityORM } from '../usuario/infrastructure/persistence/usuario.orm-entity'
import { UsuarioRolEntityORM } from '../usuario-rol/infrastructure/persistence/usuario-rol.orm-entity'

import { AuthController } from './adapters/controllers/auth.controller'
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy'
import { AuthUserRepository } from './domain/repository/auth-user.repository'
import { AuthUserRepositoryImpl } from './infrastructure/persistence/auth-user.repository-impl'
import { LoginUseCase } from './application/use-cases/login.use-case'
import { RefreshUseCase } from './application/use-cases/refresh.use-case'
import { RegisterUseCase } from './application/use-cases/register.use-case'

@Module({
  imports: [
    PassportModule,
    UsuarioModule,
    ClienteModule,
    UsuarioRolModule,
    RolModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_ACCESS_EXPIRES_IN') ?? '15m',
        },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([UsuarioEntityORM, UsuarioRolEntityORM]),
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    LoginUseCase,
    RefreshUseCase,
    RegisterUseCase,
    {
      provide: AuthUserRepository,
      useClass: AuthUserRepositoryImpl,
    },
  ],
  exports: [JwtModule, PassportModule],
})
export class AuthModule {}
