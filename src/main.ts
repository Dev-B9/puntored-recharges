import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  // Crea la aplicación Nest usando el módulo raíz
  const app = await NestFactory.create(AppModule);

  // Habilita validación global de DTOs en toda la app
  app.useGlobalPipes(
    new ValidationPipe({
      // Elimina propiedades que no estén definidas en los DTOs
      whitelist: true,
      // Lanza error si llegan propiedades extra (no permitidas)
      forbidNonWhitelisted: true,
      // Intenta castear tipos de entrada según el DTO (por ejemplo, strings a numbers)
      transform: true,
      // Devuelve solo el primer error por propiedad (evita mensajes redundantes)
      stopAtFirstError: true,
    }),
  );

  // Inicia el servidor en el puerto configurado o 3000 por defecto
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
