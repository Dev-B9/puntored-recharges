/**
 * Archivo: src/modules/auth/auth.service.spec.ts
 * ------------------------------------------------
 * Resumen: Pruebas unitarias para `AuthService`.
 *
 * Propósito:
 *  - Verificar la lógica de autenticación sin levantar la app completa.
 *
 * Categorías que cubre:
 *  - [2xx] Login exitoso y generación de JWT.
 *  - [4xx] Credenciales inválidas / campos vacíos.
 *  - [5xx] Errores internos al generar token JWT.
 *
 * Ejecución:
 *  - Todos los tests: `npm test`
 *  - Solo este archivo: `npx jest src/modules/auth/auth.service.spec.ts --runInBand`
 *
 * Notas:
 *  - Usa mocks para `jwtService` y `userService`.
 */

import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

/**
 * Unit tests para AuthService
 * Nivel 3: Calidad
 * 
 * Cubre:
 * - Casos felices (2xx): login exitoso
 * - Errores de cliente (4xx): credenciales inválidas, campos vacíos
 * - Errores de servidor (5xx): fallo interno de JWT
 */
describe('AuthService', () => {
  let service: AuthService;

  // Mocks de dependencias
  const mockJwtService = { signAsync: jest.fn().mockResolvedValue('signed-token') } as any;
  const mockUserService = { validateCredentials: jest.fn() } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(mockJwtService, mockUserService);
  });

  // =========================
  // CASOS CORRECTOS (2xx)
  // =========================
  it('returns access_token when credentials are valid', async () => {
    // Mock de usuario válido
    mockUserService.validateCredentials.mockReturnValue({ username: 'testuser', sub: 1 });

    const res = await service.login({ username: 'testuser', password: 'password123' } as any);

    // Validar que se llamó correctamente al UserService
    expect(mockUserService.validateCredentials).toHaveBeenCalledWith('testuser', 'password123');
    // Validar que JWT se generó
    expect(mockJwtService.signAsync).toHaveBeenCalled();
    // Validar formato de respuesta
    expect(res).toEqual({ access_token: 'signed-token' });
  });

  // =========================
  // ERRORES DE CLIENTE (4xx)
  // =========================
  it('throws UnauthorizedException when credentials are invalid', async () => {
    mockUserService.validateCredentials.mockReturnValue(null);

    await expect(
      service.login({ username: 'bad', password: 'bad' } as any),
    ).rejects.toThrow(UnauthorizedException);

    // JWT no debe ser llamado si credenciales inválidas
    expect(mockJwtService.signAsync).not.toHaveBeenCalled();
  });

  it('throws UnauthorizedException when username or password is empty', async () => {
    // Username vacío
    await expect(
      service.login({ username: '', password: 'password123' } as any),
    ).rejects.toThrow(UnauthorizedException);

    // Password vacío
    await expect(
      service.login({ username: 'testuser', password: '' } as any),
    ).rejects.toThrow(UnauthorizedException);
  });

  // =========================
  // ERRORES DE SERVIDOR (5xx)
  // =========================
  it('propagates error if jwtService.signAsync fails', async () => {
    mockUserService.validateCredentials.mockReturnValue({ username: 'testuser', sub: 1 });
    mockJwtService.signAsync.mockRejectedValueOnce(new Error('JWT internal error'));

    await expect(
      service.login({ username: 'testuser', password: 'password123' } as any),
    ).rejects.toThrow('JWT internal error');
  });
});
