import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('ZeroInventory API')
  .setDescription(
    'API de gestión de pedidos, productos, compras y más para ZeroInventory',
  )
  .setVersion('1.0.0')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Token JWT obtenido del endpoint /auth/login',
    },
    'JWT-auth',
  )
  .addTag('Productos', 'Gestión de productos')
  .build();
