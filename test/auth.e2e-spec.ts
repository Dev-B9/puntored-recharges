/**
 * Archivo: test/auth.e2e-spec.ts
 * ------------------------------------------------
 * Resumen: Pruebas end-to-end del endpoint POST /auth/login.
 *
 * Propósito:
 *  - Verificar contrato HTTP y validaciones del endpoint de login.
 *
 * Categorías que cubre:
 *  - [2xx] Éxitos: login válido devuelve `access_token`.
 *  - [4xx] Errores de cliente: validaciones DTO y credenciales inválidas.
 *
 * Ejecución:
 *  - Todas las e2e: `npm run test:e2e`
 *  - Solo este archivo: `npm run test:e2e -- test/auth.e2e-spec.ts`
 *
 * Notas:
 *  - Usa `ValidationPipe` global para validar cuerpos.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AuthController (e2e) - POST /auth/login', () => {
  let app: INestApplication;

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
  });

  afterAll(async () => {
    await app.close();
  });

  // ========================
  // [2xx] Success cases
  // ========================
  it('POST /auth/login -> 2xx returns access_token', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'testuser', password: 'password123' });

    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(300);
    expect(response.body).toHaveProperty('access_token');
  });

  // ========================
  // [4xx] Client errors
  // ========================
  it('POST /auth/login -> 401 Unauthorized for wrong username', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'wronguser', password: 'password123' });

    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(response.body.message).toBe('Invalid username or password');
  });

  it('POST /auth/login -> 401 Unauthorized for wrong password', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'testuser', password: 'wrongpass' });

    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(response.body.message).toBe('Invalid username or password');
  });

  it('POST /auth/login -> 400 Bad Request when body is empty', async () => {
    const response = await request(app.getHttpServer()).post('/auth/login').send({});
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    expect(response.body.message).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/username (is required|should not be empty)/),
        expect.stringMatching(/password (is required|should not be empty)/),
      ]),
    );
  });

  it('POST /auth/login -> 400 Bad Request when password is empty', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'testuser', password: '' });

    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    expect(response.body.message).toEqual(
      expect.arrayContaining([expect.stringMatching(/password should not be empty/)]),
    );
  });

  it('POST /auth/login -> 400 Bad Request when username is empty', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: '', password: 'password123' });

    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    expect(response.body.message).toEqual(
      expect.arrayContaining([expect.stringMatching(/username should not be empty/)]),
    );
  });

  it('POST /auth/login -> 400 Bad Request for wrong types', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: ['testuser'], password: { key: 'value' } });

    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    expect(response.body.message).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/username must be a string/),
        expect.stringMatching(/password must be a string/),
      ]),
    );
  });

  it('POST /auth/login -> 400 Bad Request for extra properties', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'testuser', password: 'password123', email: 'hack@evil.com' });

    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    expect(response.body.message).toEqual(
      expect.arrayContaining([expect.stringMatching(/property email should not exist/)]),
    );
  });

  it('POST /auth/login -> 400 Bad Request for null fields', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: null, password: null });

    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    expect(response.body.message).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/username (is required|should not be empty)/),
        expect.stringMatching(/password (is required|should not be empty)/),
      ]),
    );
  });

  it("POST /auth/login -> 401 Unauthorized on SQL injection attempt", async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: "testuser'; DROP TABLE users; --", password: 'password123' });

    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(response.body.message).toBe('Invalid username or password');
  });
});
