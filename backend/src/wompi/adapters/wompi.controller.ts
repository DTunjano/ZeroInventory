import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Req,
} from '@nestjs/common';
import { IsString, Matches, MaxLength } from 'class-validator';
import { Public } from '../../auth/adapters/decorators/public.decorator';
import { Roles } from '../../auth/adapters/decorators/roles.decorator';
import { WompiUseCase } from '../application/wompi.use-case';
class ReconcileDTO {
  @IsString()
  @MaxLength(100)
  @Matches(/^[A-Za-z0-9_-]+$/)
  transactionId!: string;
}
@Controller('payments/wompi')
export class WompiController {
  constructor(private readonly wompi: WompiUseCase) {}
  @Public() @Get('availability') availability() {
    return this.wompi.availability();
  }
  @Roles('CUSTOMER')
  @Post('orders/:id/checkout')
  @HttpCode(200)
  checkout(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: { sub: number } },
  ) {
    return this.wompi.checkout(id, req.user.sub);
  }
  @Roles('CUSTOMER')
  @Post('orders/:id/reconcile')
  @HttpCode(200)
  reconcile(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: ReconcileDTO,
    @Req() req: { user: { sub: number } },
  ) {
    return this.wompi.reconcile(id, req.user.sub, body.transactionId);
  }
  @Public()
  @Post('events')
  @HttpCode(200)
  events(@Body() body: unknown) {
    return this.wompi.webhook(body);
  }
}
