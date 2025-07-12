import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // Desactivamos el body parser predeterminado
  });
  
  // Configurar Express para aumentar el límite de tamaño
  const express = require('express');
  app.use(express.json({ limit: '50mb' })); // Aumentamos el límite a 50MB
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  
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

  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: http://0.0.0.0:${port}`);
}
bootstrap();