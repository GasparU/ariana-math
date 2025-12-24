import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // 1. Habilitar CORS
  // Esto permite que tu Frontend (que correrá en otro puerto) pueda pedirle datos al Backend.
  app.enableCors({
    origin: '*', // Deja pasar a CUALQUIER dominio (Vercel, localhost, etc.)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // 2. Habilitar Validaciones Globales
  // Esto activa los decoradores @IsString, @IsNotEmpty de tus DTOs.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina propiedades que no estén definidas en el DTO (seguridad)
      forbidNonWhitelisted: false, // Lanza error si envían datos basura extra
      transform: true, // Convierte los tipos de datos automáticamente
    }),
  );

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  await app.listen(3000);
  console.log('🚀 Server is running on http://localhost:3000');
}
bootstrap();
