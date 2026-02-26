/**
 * Archivo: test/recharges-validators.e2e-spec.ts
 * ------------------------------------------------
 * Resumen: Pruebas e2e para validar `AmountRangeValidator` y
 * `PhoneNumberFormatValidator` a través del endpoint `POST /recharges/buy`.
 *
 * Propósito:
 *  - Asegurar que los validadores custom rechazan/aceptan payloads
 *    según las reglas de negocio.
 *
 * Categorías que cubre:
 *  - [2xx] Payload correcto pasa.
 *  - [4xx] Payload inválido (monto fuera de rango, teléfono con formato inválido).
 *  - [401] Sin autorización cuando falta token.
 *
 * Ejecución:
 *  - Todas las e2e: `npm run test:e2e`
 *  - Solo este archivo: `npm run test:e2e -- test/recharges-validators.e2e-spec.ts`
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { initTestApp, loginAndGetToken } from './setup';

describe('Recharges validators (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await initTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  // login helper is provided by test/setup

  // =========================
  // CASOS CORRECTOS (2xx)
  // =========================
  it('POST /recharges/buy -> 2xx accepts valid payload', async () => {
    const token = await loginAndGetToken(app);

    await request(app.getHttpServer())
      .post('/recharges/buy')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 5000, phoneNumber: '3101234567' })
      .expect((res) => {
        if (res.status < 200 || res.status >= 300) throw new Error('Expected 2xx');
      });
  });

  // =========================
  // ERRORES DE CLIENTE (4xx)
  // =========================
  it('POST /recharges/buy -> 400 rejects amount out of range', async () => {
    const token = await loginAndGetToken(app);

    await request(app.getHttpServer())
      .post('/recharges/buy')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 10, phoneNumber: '3101234567' })
      .expect(400);
  });

  it('POST /recharges/buy -> 400 rejects invalid phone', async () => {
    const token = await loginAndGetToken(app);

    await request(app.getHttpServer())
      .post('/recharges/buy')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 5000, phoneNumber: '212345' })
      .expect(400);
  });

  // =========================
  // SIN AUTORIZACIÓN (401)
  // =========================
  it('POST /recharges/buy -> 401 when unauthorized', async () => {
    await request(app.getHttpServer())
      .post('/recharges/buy')
      .send({ amount: 5000, phoneNumber: '3101234567' })
      .expect(401);
  });
});
