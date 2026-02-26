import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'; ;
import { BuyRechargeDto } from '../dto/buy-recharge.dto';
import { RechargesService } from '../services/recharges.service';

@Controller('recharges')
export class RechargesController {
  constructor(private readonly rechargesService: RechargesService) {}

  // POST /recharges/buy
  // Protegido por JWT (Authorization: Bearer <token>)
  @UseGuards(JwtAuthGuard)
  @Post('buy')
  buy(@Body() dto: BuyRechargeDto, @Req() req: Request) {
    return this.rechargesService.buyRecharge(dto, (req as any).user);
  }

  // GET /recharges/history
  // Devuelve solo las transacciones del usuario autenticado
  @UseGuards(JwtAuthGuard)
  @Get('history')
  history(@Req() req: Request) {
    return this.rechargesService.findHistoryByUser((req as any).user);
  }
}

