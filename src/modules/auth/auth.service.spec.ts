import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  const mockJwtService = { signAsync: jest.fn().mockResolvedValue('signed-token') } as any;
  const mockUserService = { validateCredentials: jest.fn() } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(mockJwtService, mockUserService);
  });

  it('returns access_token when credentials valid', async () => {
    mockUserService.validateCredentials.mockReturnValue({ username: 'testuser', sub: 1 });

    const res = await service.login({ username: 'testuser', password: 'password123' } as any);

    expect(mockUserService.validateCredentials).toHaveBeenCalledWith('testuser', 'password123');
    expect(mockJwtService.signAsync).toHaveBeenCalled();
    expect(res).toEqual({ access_token: 'signed-token' });
  });

  it('throws UnauthorizedException when credentials invalid', async () => {
    mockUserService.validateCredentials.mockReturnValue(null);

    await expect(
      service.login({ username: 'bad', password: 'bad' } as any),
    ).rejects.toThrow(UnauthorizedException);
  });
});
