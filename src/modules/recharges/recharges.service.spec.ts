/**
 * src/modules/recharges/recharges.service.spec.ts
 * ------------------------------------------------
 * Unit tests para RechargesService
 * Nivel 3: Calidad
 * 
 * Propósito:
 *  - Verificar la lógica de negocio de recargas.
 *  - Asegurar validación de montos y phoneNumber.
 *  - Cubrir casos de éxito (2xx), errores de cliente (4xx) y errores de servidor (5xx).
 * 
 * Estructura:
 *  - [2xx] : compra correcta de recarga, historial correcto.
 *  - [4xx] : validaciones de montos y phoneNumber.
 *  - [5xx] : errores internos simulados (p. ej., fallo en save o create)
 */

import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { RechargesService } from './recharges.service';

describe('RechargesService', () => {
  let service: RechargesService;

  const mockRepository: any = {
    create: jest.fn((obj) => ({ id: Date.now(), ...obj })),
    save: jest.fn(async (t) => ({ id: 1, ...t })),
    find: jest.fn().mockResolvedValue([]),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new RechargesService(mockRepository);
  });

  // =========================
  // CASOS CORRECTOS (2xx)
  // =========================
  it('creates and saves a valid recharge', async () => {
    const dto = { amount: 5000, phoneNumber: '3101234567' } as any;
    const user = { username: 'testuser' } as any;

    const res = await service.buyRecharge(dto, user);

    expect(mockRepository.create).toHaveBeenCalledWith({
      amount: dto.amount,
      phoneNumber: dto.phoneNumber,
      userId: user.username,
    });
    expect(mockRepository.save).toHaveBeenCalled();
    expect(res).toHaveProperty('id');
    expect(res.amount).toBe(dto.amount);
  });

  it('returns history from repository', async () => {
    const txn = { id: 1, amount: 5000, phoneNumber: '3101234567', userId: 'testuser' };
    mockRepository.find.mockResolvedValueOnce([txn]);

    const res = await service.findHistoryByUser({ username: 'testuser' } as any);
    expect(mockRepository.find).toHaveBeenCalled();
    expect(res).toEqual([txn]);
  });

  // =========================
  // ERRORES DE CLIENTE (4xx)
  // =========================
  it('throws BadRequestException for amount below minimum', async () => {
    const dto = { amount: 999, phoneNumber: '3101234567' } as any;
    const user = { username: 'testuser' } as any;

    await expect(service.buyRecharge(dto, user)).rejects.toThrow(BadRequestException);
  });

  it('throws BadRequestException for amount above maximum', async () => {
    const dto = { amount: 200000, phoneNumber: '3101234567' } as any;
    const user = { username: 'testuser' } as any;

    await expect(service.buyRecharge(dto, user)).rejects.toThrow(BadRequestException);
  });

  it('throws BadRequestException for invalid phone number', async () => {
    const dto = { amount: 5000, phoneNumber: '212345' } as any;
    const user = { username: 'testuser' } as any;

    await expect(service.buyRecharge(dto, user)).rejects.toThrow(BadRequestException);
  });

  // =========================
  // ERRORES DE SERVIDOR (5xx)
  // =========================
  it('throws InternalServerErrorException if repository.save fails', async () => {
    const dto = { amount: 5000, phoneNumber: '3101234567' } as any;
    const user = { username: 'testuser' } as any;

    mockRepository.save.mockRejectedValueOnce(new Error('DB failure'));

    await expect(service.buyRecharge(dto, user)).rejects.toThrow(InternalServerErrorException);
  });

  it('throws InternalServerErrorException if repository.create fails', async () => {
    const dto = { amount: 5000, phoneNumber: '3101234567' } as any;
    const user = { username: 'testuser' } as any;

    mockRepository.create.mockImplementationOnce(() => {
      throw new Error('DB create failure');
    });

    await expect(service.buyRecharge(dto, user)).rejects.toThrow(InternalServerErrorException);
  });
});
