import { Module } from '@nestjs/common';
import databaseConfig from '../config/database.config';
import { ConfigModule } from '@nestjs/config/dist/config.module';
import { DatabaseModule } from '../infrastructure/database/database.module';
import { CloudinaryModule } from '../infrastructure/cloudinary/cloudinary.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
      load: [databaseConfig],
    }),
    DatabaseModule,
    CloudinaryModule,
  ],
})
export class AppModule {}
