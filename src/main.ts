import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configurar validación global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));
  
  // Configurar CORS
  app.enableCors();
  
  // Obtener el puerto de las variables de entorno
  const configService = app.get(ConfigService);
  const port = configService.get('PORT') || 10000; // Default to Render's expected port
  
  // Explicitly bind to 0.0.0.0 for Render
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: http://0.0.0.0:${port}`);
}
bootstrap();