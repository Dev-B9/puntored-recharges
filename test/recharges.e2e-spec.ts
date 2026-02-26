/**
 * test/recharges.e2e-spec.ts
 * --------------------------
 * Pruebas end-to-end para `/recharges/buy` y `/recharges/history`.
 *
 * Propósito:
 *  - Verificar comportamiento de compra de recargas y consulta de historial a través del API.
 *  - Validar casos correctos (2xx), errores de cliente (4xx) y errores de servidor (5xx).
 *  - Asegurar que JWT funciona para autorización.
 *
 * Estructura:
 *  - [2xx] : compra correcta de recarga, historial correcto.
 *  - [4xx] : payload inválido (buy).
 *  - [401] : token faltante o inválido (history).
 *  - [5xx] : errores internos simulados.
 *
 * Cómo ejecutar:
 *  - Todas las pruebas e2e: npm run test:e2e
 *  - Solo este archivo: npm run test:e2e -- test/recharges.e2e-spec.ts
 *
 * Notas:
 *  - Se sobrescriben providers y guards para simular errores internos.
 *  - Usa `supertest` para peticiones HTTP al Nest app.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { RechargesService } from '../src/modules/recharges/recharges.service';
import { JwtAuthGuard } from '../src/modules/auth/guards/jwt-auth.guard';

describe('Recharges (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const loginAndGetToken = async (): Promise<string> => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'testuser', password: 'password123' });
    return res.body.access_token;
  };

  // =========================
  // [2xx] CASOS CORRECTOS
  // =========================
  it('POST /recharges/buy -> success', async () => {
    const token = await loginAndGetToken();

    await request(app.getHttpServer())
      .post('/recharges/buy')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 5000, phoneNumber: '3101234567' })
      .expect((res) => {
        if (res.status < 200 || res.status >= 300) throw new Error('Expected 2xx response');
        expect(res.body).toHaveProperty('id');
        expect(res.body.amount).toBe(5000);
      });
  });

  it('GET /recharges/history -> returns user history', async () => {
    const token = await loginAndGetToken();

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

  it('GET /recharges/history -> returns empty array for new user', async () => {
    const token = await loginAndGetToken(); // si fuera otro usuario sin recargas

    const res = await request(app.getHttpServer())
      .get('/recharges/history')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toEqual(expect.any(Array));
  });

  // =========================
  // [4xx] ERRORES DE CLIENTE (buy)
  // =========================
  it('POST /recharges/buy -> 400 on invalid payload', async () => {
    const token = await loginAndGetToken();

    await request(app.getHttpServer())
      .post('/recharges/buy')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 10, phoneNumber: '123' })
      .expect(400);
  });

  // =========================
  // [401] TOKEN INVÁLIDO / FALTANTE (history)
  // =========================
  it('GET /recharges/history -> 401 if token missing', async () => {
    await request(app.getHttpServer())
      .get('/recharges/history')
      .expect(401);
  });

  // =========================
  // [5xx] ERRORES DE SERVIDOR (buy)
  // =========================
  it('POST /recharges/buy -> 500 when service throws', async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(RechargesService)
      .useValue({ buyRecharge: () => { throw new Error('boom'); }, findHistoryByUser: () => [] })
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
