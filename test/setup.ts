import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

export async function initTestApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = moduleRef.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      stopAtFirstError: true,
    }),
  );
  // Silence logger to reduce noise in CI/test output
  app.useLogger(false as any);
  await app.init();
  return app;
}

export const loginAndGetToken = async (app: INestApplication): Promise<string> => {
  const res = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ username: 'testuser', password: 'password123' });
  return res.body.access_token;
};
