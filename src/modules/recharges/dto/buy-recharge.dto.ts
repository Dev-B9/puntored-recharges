import { Type } from 'class-transformer';
import { IsDefined, IsInt, IsNotEmpty, IsString, Validate } from 'class-validator';
import { AmountRangeValidator } from '../validators/amount-range.validator';
import { PhoneNumberFormatValidator } from '../validators/phone-number-format.validator';

// DTO para POST /recharges/buy
export class BuyRechargeDto {
  // Monto entero entre 1.000 y 100.000 (rango validado por validador custom)
  @Type(() => Number)
  @IsInt()
  @Validate(AmountRangeValidator)
  @IsDefined({ message: 'amount is required' })
  amount!: number;

  // Número móvil: obligatorio, string, 10 dígitos empezando por 3 (formato por validador custom)
  @IsNotEmpty()
  @IsString()
  @Validate(PhoneNumberFormatValidator)
  @IsDefined({ message: 'phoneNumber is required' })
  phoneNumber!: string;
}
