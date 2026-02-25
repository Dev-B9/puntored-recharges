import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

// Validador custom reutilizable para la longitud mínima de password.
// Nota: en Nivel 0 no se está usando; queda listo para futuros niveles.
@ValidatorConstraint({ name: 'PasswordLength', async: false })
export class PasswordLengthValidator implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    // No valida longitud cuando el campo está ausente o vacío
    if (value === undefined || value === null || value === '') {
      return true;
    }

    // Si NO es string, se delega el error a @IsString en el DTO
    if (typeof value !== 'string') {
      return true;
    }

    // Si es string, exige longitud mínima de 6 caracteres
    return value.length >= 6;
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must be longer than or equal to 6 characters`;
  }
}

