/**
 * test/recharges-validators.e2e-spec.ts
 * --------------------------------------
 * Pruebas end-to-end para validaciones de recargas.
 *
 * Propósito:
 *  - Verificar que los custom validators funcionan correctamente:
 *      - AmountRangeValidator
 *      - PhoneNumberFormatValidator
 *  - Asegurar que payload válido pasa y payload inválido falla con 400.
 *  - Validar respuestas 401 para peticiones sin token.
 *
 * Estructura:
 *  - [2xx] : payload correcto
 *  - [4xx] : amount fuera de rango o phoneNumber inválido
 *  - [401] : sin autorización
 *
 * Cómo ejecutar:
 *  - Todos los tests e2e: npm run test:e2e
 *  - Solo este archivo: npm run test:e2e -- test/recharges-validators.e2e-spec.ts
 *
 * Notas:
 *  - Se obtiene token mediante login antes de probar endpoints protegidos.
 *  - Se usa `supertest` para simular peticiones HTTP.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Recharges validators (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const loginAndGetToken = async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'testuser', password: 'password123' });
    return res.body.access_token;
  };

  // =========================
  // CASOS CORRECTOS (2xx)
  // =========================
  it('allows valid payload (2xx)', async () => {
    const token = await loginAndGetToken();

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
  it('rejects amount out of range with 400', async () => {
    const token = await loginAndGetToken();

    await request(app.getHttpServer())
      .post('/recharges/buy')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 10, phoneNumber: '3101234567' })
      .expect(400);
  });

  it('rejects invalid phone with 400', async () => {
    const token = await loginAndGetToken();

    await request(app.getHttpServer())
      .post('/recharges/buy')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 5000, phoneNumber: '212345' })
      .expect(400);
  });

  // =========================
  // SIN AUTORIZACIÓN (401)
  // =========================
  it('returns 401 when unauthorized', async () => {
    await request(app.getHttpServer())
      .post('/recharges/buy')
      .send({ amount: 5000, phoneNumber: '3101234567' })
      .expect(401);
  });
});
