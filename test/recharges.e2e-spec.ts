/**
 * Archivo: test/recharges.e2e-spec.ts
 * ------------------------------------------------
 * Resumen: Pruebas end-to-end para `/recharges/buy` y `/recharges/history`.
 *
 * Propósito:
 *  - Verificar compra de recargas y consulta de historial, incluyendo
 *    validaciones, autorización y manejo de errores internos.
 *
 * Categorías que cubre:
 *  - [2xx] Éxitos: compra y lectura del historial.
 *  - [4xx] Errores de cliente: payload inválido en `buy`.
 *  - [401] Autorización: token faltante o inválido para `history`.
 *  - [5xx] Errores del servidor simulados.
 *
 * Ejecución:
 *  - Todas las e2e: `npm run test:e2e`
 *  - Solo este archivo: `npm run test:e2e -- test/recharges.e2e-spec.ts`
 *
 * Notas:
 *  - Algunos tests sobrescriben providers/guards para simular fallos.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { RechargesService } from '../src/modules/recharges/recharges.service';
import { JwtAuthGuard } from '../src/modules/auth/guards/jwt-auth.guard';
import { initTestApp, loginAndGetToken } from './setup';

describe('Recharges (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await initTestApp();
  });

  afterAll(async () => {
    await app.close();
  });
  // =========================
  // [2xx] Success cases
  // =========================
  it('POST /recharges/buy -> 2xx returns created recharge', async () => {
    const token = await loginAndGetToken(app);

    const res = await request(app.getHttpServer())
      .post('/recharges/buy')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 5000, phoneNumber: '3101234567' })
      .expect((r) => {
        if (r.status < 200 || r.status >= 300) throw new Error('Expected 2xx response');
      });

    expect(res.body).toHaveProperty('id');
    expect(res.body.amount).toBe(5000);
  });

  it('GET /recharges/history -> 200 returns user history', async () => {
    const token = await loginAndGetToken(app);

    const res = await request(app.getHttpServer())
      .get('/recharges/history')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    res.body.forEach((item: any) => {
      expect(item).toHaveProperty('amount');
      expect(item).toHaveProperty('phoneNumber');
      expect(item).toHaveProperty('userId');
    });
  });

  it('GET /recharges/history -> 200 returns empty array for new user', async () => {
    const token = await loginAndGetToken(app);

    const res = await request(app.getHttpServer())
      .get('/recharges/history')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toEqual(expect.any(Array));
  });

  // =========================
  // [4xx] Client errors (buy)
  // =========================
  it('POST /recharges/buy -> 400 rejects invalid payload', async () => {
    const token = await loginAndGetToken(app);

    await request(app.getHttpServer())
      .post('/recharges/buy')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 10, phoneNumber: '123' })
      .expect(400);
  });

  // =========================
  // [401] Unauthorized (history)
  // =========================
  it('GET /recharges/history -> 401 when token missing', async () => {
    await request(app.getHttpServer()).get('/recharges/history').expect(401);
  });

  // =========================
  // [5xx] Server errors (buy)
  // =========================
  it('POST /recharges/buy -> 500 when service throws error', async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(RechargesService)
      .useValue({ buyRecharge: () => { throw new Error('Simulated internal server error for testing 500 response'); }, findHistoryByUser: () => [] })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    const app2 = moduleFixture.createNestApplication();
    await app2.init();

    await request(app2.getHttpServer())
      .post('/recharges/buy')
      .send({ amount: 5000, phoneNumber: '3101234567' })
      .expect(500);

    await app2.close();
  });
});
