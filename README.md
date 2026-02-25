# PuntoRed Backend – NestJS + TypeScript

## Ejecución rápida

1. Instalar dependencias:
   npm install

2. Configurar variables de entorno en `.env`:
   PORT=3000
   JWT_SECRET=super-secret-jwt-key
   JWT_EXPIRES_IN=3600s

3. Levantar servidor en desarrollo:
   npm run start:dev

4. Probar endpoints:

* Login: POST [http://localhost:3000/auth/login](http://localhost:3000/auth/login)
  Body (JSON):
  { "username": "testuser", "password": "password123" }
* Comprar recarga: POST [http://localhost:3000/recharges/buy](http://localhost:3000/recharges/buy)
  Body (JSON):
  { "amount": 5000, "phoneNumber": "3101234567" }
  Requiere Authorization: Bearer <JWT> obtenido en login.

## Objetivo

Nivel 0 y 1 enfocados en:

* Endpoint POST /auth/login con usuario hardcodeado
* Endpoint POST /recharges/buy protegido por JWT Guard
* Validación de DTOs para login y recargas
* Simulación de respuesta de recarga con id, amount, phoneNumber, userId y createdAt
* Preparación para futura arquitectura DDD

## Stack y librerías

* Framework: NestJS
* Lenguaje: TypeScript
* JWT: @nestjs/jwt, jsonwebtoken
* Configuración: @nestjs/config
* Validación: class-validator, class-transformer

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
recharges/
recharges.module.ts
recharges.controller.ts
recharges.service.ts
dto/buy-recharge.dto.ts
validators/amount-range.validator.ts
validators/phone-number-format.validator.ts
auth/guards/jwt-auth.guard.ts
auth/strategies/jwt.strategy.ts
domain/
.gitkeep
.env

## Casos de prueba – POST /auth/login (Nivel 0)

1. Login correcto
   Request body:
   { "username": "testuser", "password": "password123" }
   HTTP 200 OK
   Response:
   { "access_token": "<JWT válido>" }

2. Usuario incorrecto
   Request body:
   { "username": "wronguser", "password": "password123" }
   HTTP 401 Unauthorized
   Response:
   {
   "statusCode": 401,
   "message": "Invalid username or password",
   "error": "Unauthorized"
   }

3. Password incorrecto
   Request body:
   { "username": "testuser", "password": "wrongpass" }
   HTTP 401 Unauthorized
   Response:
   {
   "statusCode": 401,
   "message": "Invalid username or password",
   "error": "Unauthorized"
   }

4. Username vacío
   Request body:
   { "username": "", "password": "password123" }
   HTTP 400 Bad Request
   Response:
   ["username should not be empty"]

5. Password < 6 caracteres
   Request body:
   { "username": "testuser", "password": "123" }
   HTTP 400 Bad Request
   Response:
   ["password must be longer than or equal to 6 characters"]

## Casos de prueba – POST /recharges/buy (Nivel 1)

1. Recarga correcta
   Request body:
   { "amount": 5000, "phoneNumber": "3101234567" }
   HTTP 201 Created
   Response:
   {
   "id": "<uuid>",
   "phoneNumber": "3101234567",
   "amount": 5000,
   "userId": "testuser",
   "createdAt": "<ISO date>"
   }

2. Monto fuera de rango
   Request body:
   { "amount": 500000, "phoneNumber": "3101234567" }
   HTTP 400 Bad Request
   Response:
   ["amount must be between 1000 and 100000"]

3. Monto no numérico
   Request body:
   { "amount": "cinco mil", "phoneNumber": "3101234567" }
   HTTP 400 Bad Request
   Response:
   ["amount must be a number"]

4. Número de teléfono inválido
   Request body:
   { "amount": 5000, "phoneNumber": "1234567890" }
   HTTP 400 Bad Request
   Response:
   ["phoneNumber must be a 10-digit number starting with 3"]

5. Body vacío
   Request body:
   {}
   HTTP 400 Bad Request
   Response:
   ["amount should not be empty", "phoneNumber should not be empty"]

## Decisiones técnicas

* DTOs + ValidationPipe global: centraliza validaciones y mantiene los servicios limpios
* SRP:

  * UserService: valida credenciales
  * AuthService: genera JWT y maneja errores de autenticación
  * RechargesService: lógica de negocio y validación de reglas de recarga
* JWT Guard: protege endpoints de recargas
* Preparación DDD: carpeta domain/ lista para lógica de dominio futura

## Notas

* Nivel 0 enfocado en autenticación y estructura inicial
* Nivel 1 enfocado en lógica de negocio de recargas y validación de entradas
