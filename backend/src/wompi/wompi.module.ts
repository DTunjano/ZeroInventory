import { Module } from '@nestjs/common';
import { WompiController } from './adapters/wompi.controller';
import { WompiUseCase } from './application/wompi.use-case';
import { WompiGateway, WompiRepository } from './domain/wompi.types';
import { SandboxWompiGateway } from './infrastructure/wompi.gateway';
import { TypeOrmWompiRepository } from './infrastructure/wompi.repository';
@Module({
  controllers: [WompiController],
  providers: [
    WompiUseCase,
    { provide: WompiGateway, useClass: SandboxWompiGateway },
    { provide: WompiRepository, useClass: TypeOrmWompiRepository },
  ],
})
export class WompiModule {}
