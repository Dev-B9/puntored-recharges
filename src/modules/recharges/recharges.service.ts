import { BadRequestException, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { BuyRechargeDto } from './dto/buy-recharge.dto';

@Injectable()
export class RechargesService {
  buyRecharge(dto: BuyRechargeDto, user: any) {
    // Validaciones de negocio (defensa adicional además del DTO)
    if (dto.amount < 1000 || dto.amount > 100000) {
      throw new BadRequestException('Invalid amount');
    }

    if (!/^3\d{9}$/.test(dto.phoneNumber)) {
      throw new BadRequestException('Invalid phoneNumber');
    }

    return {
      id: uuidv4(),
      phoneNumber: dto.phoneNumber,
      amount: dto.amount,
      userId: user?.username,
      createdAt: new Date().toISOString(),
    };
  }
}

