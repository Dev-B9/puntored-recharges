/**
 * test/auth.e2e-spec.ts
 * ---------------------
 * Pruebas end-to-end para `POST /auth/login`.
 *
 * Propósito: documentar y verificar el contrato HTTP y el comportamiento
 * de validación del endpoint de autenticación. El archivo está
 * organizado para identificar claramente dónde comienzan las pruebas
 * de éxito (2xx) y dónde comienzan las validaciones/errores de cliente (4xx).
 *
 * Estructura y marcadores en este archivo:
 *  - [2xx]  : escenarios de éxito (se espera `access_token`).
 *  - [4xx]  : errores de validación y fallos de autenticación.
 *
 * Cómo ejecutar:
 *  - Todas las pruebas e2e: `npm run test:e2e`
 *  - Solo este archivo: `npm run test:e2e -- test/auth.e2e-spec.ts`
 *
 * Notas:
 *  - Las validaciones se aplican mediante `ValidationPipe` global
 *    configurado en `beforeAll` (whitelist, forbidNonWhitelisted,
 *    transform, stopAtFirstError).
 *  - Las aserciones aceptan mensajes producidos por los validadores
 *    del DTO (p.ej. `is required` o `should not be empty`).
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { AuthService } from '../src/modules/auth/auth.service';

describe('AuthController (e2e) - POST /auth/login', () => {
  let app: INestApplication;
  let authService: AuthService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        stopAtFirstError: true,
      }),
    );
    await app.init();

    authService = moduleRef.get<AuthService>(AuthService);
  });

  afterAll(async () => {
    await app.close();
  });

  // [2xx] Éxito: credenciales válidas deben devolver un access_token
  it('login correcto → 2xx and returns access_token', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'testuser', password: 'password123' });

    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(300);
    expect(response.body).toHaveProperty('access_token');
  });

  // [4xx] Errores de cliente: validaciones y fallos de autenticación.
  // Las pruebas siguientes comprueban que la API devuelve códigos 4xx
  // y los mensajes de validación generados por los validadores del DTO
  // y por la `ValidationPipe`.

  it('usuario incorrecto → 401 Unauthorized', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'wronguser', password: 'password123' });

    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(response.body.message).toBe('Invalid username or password');
  });

  it('password incorrecto → 401 Unauthorized', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'testuser', password: 'wrongpass' });

    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('body vacío → 400 Bad Request', async () => {
    const response = await request(app.getHttpServer()).post('/auth/login').send({});

    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    // Aceptar tanto 'is required' (@IsDefined) como 'should not be empty' (@IsNotEmpty)
    // porque class-validator puede emitir cualquiera de los dos según el caso.
    expect(response.body.message).toEqual(
      expect.arrayContaining([
        expect.stringContaining('username is required'),
        expect.stringContaining('password is required'),
      ]),
    );
  });

  it('password vacío → 400 Bad Request', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'testuser', password: '' });

    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    expect(response.body.message).toEqual(expect.arrayContaining([expect.stringContaining('password should not be empty')]));
  });

  it('username vacío → 400 Bad Request', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: '', password: 'password123' });

    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    expect(response.body.message).toEqual(expect.arrayContaining([expect.stringContaining('username should not be empty')]));
  });

  it('tipos incorrectos → 400 Bad Request', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: ['testuser'], password: { key: 'value' } });

    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    expect(response.body.message).toEqual(
      expect.arrayContaining([
        expect.stringContaining('username must be a string'),
        expect.stringContaining('password must be a string'),
      ]),
    );
  });

  it('propiedades extra → 400 Bad Request', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'testuser', password: 'password123', email: 'hack@evil.com' });

    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    expect(response.body.message).toEqual(expect.arrayContaining([expect.stringContaining('property email should not exist')]));
  });

  it('campos nulos → 400 Bad Request', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: null, password: null });

    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    expect(response.body.message).toEqual(
      expect.arrayContaining([
        expect.stringContaining('username is required'),
        expect.stringContaining('password is required'),
      ]),
    );
  });

  it("intento de inyección SQL → 401 Unauthorized", async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: "testuser'; DROP TABLE users; --", password: 'password123' });

    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(response.body.message).toBe('Invalid username or password');
  });
});