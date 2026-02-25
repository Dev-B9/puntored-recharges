import { IsDefined, IsNotEmpty, IsString, Validate } from 'class-validator';
import { PasswordLengthValidator } from '../validators/password-length.validator';

// DTO que representa el cuerpo de la petición para POST /auth/login
export class LoginDto {
  // Nombre de usuario obligatorio y de tipo string
  @IsNotEmpty({ message: 'username should not be empty' })
  @IsString({ message: 'username must be a string' })
  @IsDefined({ message: 'username is required' })
  username!: string;

  // Password obligatorio, de tipo string y con longitud mínima validada
  // mediante el validador custom PasswordLengthValidator
  @IsNotEmpty({ message: 'password should not be empty' })
  @IsString({ message: 'password must be a string' })
  @Validate(PasswordLengthValidator)
  @IsDefined({ message: 'password is required' })
  password!: string;
}