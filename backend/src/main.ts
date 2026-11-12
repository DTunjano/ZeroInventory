import { configureHttp } from '../config/http.config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger/dist/swagger-module';
import { swaggerConfig } from '../config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureHttp(app);

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`Server is running on http://localhost:${port}`);
}
void bootstrap().catch((error: Error) => { console.error(error.message); process.exitCode = 1; });
