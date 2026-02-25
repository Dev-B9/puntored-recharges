import { IsNotEmpty, IsString, Validate } from 'class-validator';
import { PasswordLengthValidator } from '../password-length.validator';

// DTO que representa el cuerpo de la petición para POST /auth/login
export class LoginDto {
  // Nombre de usuario obligatorio y de tipo string
  @IsNotEmpty()
  @IsString()
  username!: string;

  // Password obligatorio, de tipo string y con longitud mínima validada
  // mediante el validador custom PasswordLengthValidator
  @IsNotEmpty()
  @IsString()
  @Validate(PasswordLengthValidator)
  password!: string;
}