import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RechargesController } from './controllers/recharges.controller';
import { RechargesService } from './services/recharges.service';
import { Transaction } from './domain/transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction])],
  controllers: [RechargesController],
  providers: [RechargesService],
})
export class RechargesModule {}

