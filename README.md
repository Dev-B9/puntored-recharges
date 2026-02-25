# PuntoRed Backend – Nivel 0 (NestJS + TypeScript)

## Ejecución rápida
1. Instalar dependencias:
npm install

2. Configurar variables de entorno en `.env`:
PORT=3000
JWT_SECRET=super-secret-jwt-key
JWT_EXPIRES_IN=3600s

3. Levantar servidor en desarrollo:
npm run start:dev

4. Probar endpoint:
POST http://localhost:3000/auth/login
Body (JSON):
{ "username": "testuser", "password": "password123" }

## Objetivo
Nivel 0 enfocado en:
- Endpoint POST /auth/login
- Usuario hardcodeado en memoria
- Generación de token JWT
- Validación con DTO + ValidationPipe
- Preparación para futura arquitectura DDD
- Sin persistencia ni tests aún

## Stack y librerías
- Framework: NestJS
- Lenguaje: TypeScript
- JWT: @nestjs/jwt, jsonwebtoken
- Configuración: @nestjs/config
- Validación: class-validator, class-transformer

## Estructura del proyecto
src/
  main.ts
  app.module.ts
  modules/
    auth/
      auth.module.ts
      auth.controller.ts
      auth.service.ts
      user.service.ts
      dto/login.dto.ts
      password-length.validator.ts
  domain/
    .gitkeep
.env

## Casos de prueba – POST /auth/login

1. Login ejemplo de la prueba técnica (oficial)
Request body:
{ "username": "testuser", "password": "password123" }
Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

2. Login correcto (general)
{ "username": "testuser", "password": "password123" }
HTTP 200 OK
Respuesta:
{ "access_token": "<JWT válido>" }

3. Usuario o contraseña incorrectos
HTTP 401 Unauthorized
{
  "statusCode": 401,
  "message": "Invalid username or password",
  "error": "Unauthorized"
}

Errores de validación
- Username vacío → 400 + ["username should not be empty"]
- Password vacío → 400 + ["password should not be empty"]
- Password < 6 caracteres → 400 + ["password must be longer than or equal to 6 characters"]
- Username no string → 400 + ["username must be a string"]
- Password no string → 400 + ["password must be a string"]

## Decisiones técnicas
- DTO + ValidationPipe global: centraliza validaciones y mantiene los servicios limpios
- SRP:
  - UserService: valida credenciales
  - AuthService: genera JWT y maneja errores de autenticación
- ConfigModule global: acceso fácil a variables de entorno
- Preparación DDD: carpeta domain/ lista para lógica de dominio futura

## Notas
- Nivel 0 enfocado en autenticación y estructura inicial
- Futuras implementaciones (recargas, persistencia, tests) se documentarán en subsecciones por nivel
