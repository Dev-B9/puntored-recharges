import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RechargesController } from './recharges.controller';
import { RechargesService } from './recharges.service';
import { Transaction } from './domain/transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction])],
  controllers: [RechargesController],
  providers: [RechargesService],
})
export class RechargesModule {}

