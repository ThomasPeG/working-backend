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
  
  // Obtener el puerto y entorno de las variables de entorno
  const configService = app.get(ConfigService);
  const port = configService.get('PORT') || 10000; // Default to Render's expected port
  const nodeEnv = configService.get('NODE_ENV') || 'development';
  
  // Configurar host según el entorno
  const host = nodeEnv === 'production' ? '0.0.0.0' : 'localhost';
  
  await app.listen(port, 'localhost');
  console.log(`Application is running on: http://${host}:${port}`);
  console.log(`Environment: ${nodeEnv}`);
}
bootstrap();