import { Module } from '@nestjs/common';
import databaseConfig from '../config/database.config';
import { ConfigModule } from '@nestjs/config/dist/config.module';
import { DatabaseModule } from '../infrastructure/database/database.module';
import { CloudinaryModule } from '../infrastructure/cloudinary/cloudinary.module';
import { ProductoModule } from './producto/producto.module';
import { UsuarioModule } from './usuario/usuario.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
      load: [databaseConfig],
    }),
    DatabaseModule,
    CloudinaryModule,
    ProductoModule,
    UsuarioModule,
  ],
})
export class AppModule {}
