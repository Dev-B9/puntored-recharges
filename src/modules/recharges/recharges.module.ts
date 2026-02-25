import { Module } from '@nestjs/common';
import { RechargesController } from './recharges.controller';
import { RechargesService } from './recharges.service';

@Module({
  controllers: [RechargesController],
  providers: [RechargesService],
})
export class RechargesModule {}

