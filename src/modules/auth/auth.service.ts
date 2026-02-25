import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { UserService } from './user.service';

// Servicio responsable de la lógica de autenticación (generar JWT)
@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  // Intenta autenticar al usuario y devuelve un access_token JWT
  async login({ username, password }: LoginDto): Promise<{ access_token: string }> {
    // Valida las credenciales contra el usuario hardcodeado
    const user = this.userService.validateCredentials(username, password);

    // Si no coincide, devuelve 401 Unauthorized
    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    // Payload mínimo del JWT según la prueba técnica
    const payload = { sub: user.sub, username: user.username };

    // Firma asíncronamente el token
    const accessToken = await this.jwtService.signAsync(payload);

    // Respuesta esperada: { access_token: '...' }
    return { access_token: accessToken };
  }
}

