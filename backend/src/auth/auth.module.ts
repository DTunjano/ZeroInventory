import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { TypeOrmModule } from '@nestjs/typeorm'

import { UsuarioEntityORM } from '../usuario/infrastructure/persistence/usuario.orm-entity'
import { UsuarioRolEntityORM } from '../usuario-rol/infrastructure/persistence/usuario-rol.orm-entity'

import { AuthController } from './adapters/controllers/auth.controller'
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy'
import { AuthUserRepository } from './domain/repository/auth-user.repository'
import { AuthUserRepositoryImpl } from './infrastructure/persistence/auth-user.repository-impl'
import { LoginUseCase } from './application/use-cases/login.use-case'
import { RefreshUseCase } from './application/use-cases/refresh.use-case'

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      useFactory: (configService: any) => ({
        secret: configService.get('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_ACCESS_EXPIRES_IN') ?? '15m',
        },
      }),
      inject: [require('@nestjs/config').ConfigService],
    }),
    TypeOrmModule.forFeature([UsuarioEntityORM, UsuarioRolEntityORM]),
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    LoginUseCase,
    RefreshUseCase,
    {
      provide: AuthUserRepository,
      useClass: AuthUserRepositoryImpl,
    },
  ],
  exports: [JwtModule, PassportModule],
})
export class AuthModule {}
