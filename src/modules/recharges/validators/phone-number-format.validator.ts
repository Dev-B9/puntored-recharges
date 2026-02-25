import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

const PHONE_REGEX = /^3\d{9}$/;

/**
 * Valida formato del número (10 dígitos, empieza por 3) solo cuando
 * el valor es un string no vacío. Si está vacío o no es string,
 * retorna true para no sumar error de formato (solo IsNotEmpty/IsString).
 */
@ValidatorConstraint({ name: 'PhoneNumberFormat', async: false })
export class PhoneNumberFormatValidator implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (value === undefined || value === null || value === '') {
      return true;
    }
    if (typeof value !== 'string') {
      return true;
    }
    return PHONE_REGEX.test(value);
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must be a 10-digit number starting with 3`;
  }
}
