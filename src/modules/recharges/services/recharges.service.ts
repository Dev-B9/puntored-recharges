import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BuyRechargeDto } from '../dto/buy-recharge.dto';
import { Transaction } from '../domain/transaction.entity';

@Injectable()
export class RechargesService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  // Crea una recarga válida y la persiste como Transaction
  async buyRecharge(dto: BuyRechargeDto, user: any): Promise<Transaction> {
    // Validaciones de negocio (defensa adicional además del DTO)
    if (dto.amount < 1000 || dto.amount > 100000) {
      throw new BadRequestException('Invalid amount');
    }

    if (!/^3\d{9}$/.test(dto.phoneNumber)) {
      throw new BadRequestException('Invalid phoneNumber');
    }

    let transaction: Transaction;
    try {
      transaction = this.transactionRepository.create({
        amount: dto.amount,
        phoneNumber: dto.phoneNumber,
        userId: user?.username,
      });
    } catch (err) {
      throw new InternalServerErrorException('Failed to create transaction');
    }

    try {
      return await this.transactionRepository.save(transaction);
    } catch (err) {
      throw new InternalServerErrorException('Failed to save transaction');
    }
  }

  // Devuelve el historial de recargas del usuario autenticado
  findHistoryByUser(user: any): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: { userId: user?.username },
      order: { createdAt: 'DESC' },
    });
  }
}

