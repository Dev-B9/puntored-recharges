import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

const MIN = 1000;
const MAX = 100000;

/**
 * Valida rango del monto solo cuando el valor ya es un número entero válido.
 * Si no es número o no es entero, retorna true para no sumar error de rango
 * (solo se muestra el error de tipo/entero).
 */
@ValidatorConstraint({ name: 'AmountRange', async: false })
export class AmountRangeValidator implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (value === undefined || value === null) {
      return true;
    }
    const n = Number(value);
    if (Number.isNaN(n) || !Number.isInteger(n)) {
      return true;
    }
    return n >= MIN && n <= MAX;
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must be between ${MIN} and ${MAX}`;
  }
}
