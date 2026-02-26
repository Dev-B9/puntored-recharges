import { Injectable } from '@nestjs/common';

// Representa el usuario autenticable en Nivel 0 (usuario único hardcodeado)
export interface User {
  username: string;
  password: string;
  sub: number;
}

// Servicio encargado exclusivamente de validar credenciales
@Injectable()
export class UserService {
  // Usuario en memoria, definido por la prueba técnica
  private readonly user: User = {
    username: 'testuser',
    password: 'password123',
    sub: 1,
  };

  // Devuelve el usuario si las credenciales coinciden; en caso contrario, null
  validateCredentials(username: string, password: string): User | null {
    const isValid =
      username === this.user.username && password === this.user.password;

    return isValid ? this.user : null;
  }
}

