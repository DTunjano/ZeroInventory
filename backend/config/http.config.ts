import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { DatabaseExceptionFilter } from '../src/shared/database-exception.filter';

export function configureHttp(app: INestApplication) {
  const config = app.get(ConfigService);
  app.use(cookieParser());
  app.useGlobalFilters(new DatabaseExceptionFilter());
  app.enableCors({
    origin: (config.get<string>('CORS_ORIGINS') ?? 'http://localhost:5173,http://localhost:5174')
      .split(',').map((origin) => origin.trim()),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
}
