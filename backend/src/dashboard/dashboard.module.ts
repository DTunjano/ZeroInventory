import { Module } from '@nestjs/common'

import { DashboardController } from './adapters/controllers/dashboard.controller'
import { GetAdminDashboardUseCase } from './application/use-cases/get-admin-dashboard.use-case'

@Module({
  controllers: [DashboardController],
  providers: [GetAdminDashboardUseCase],
})
export class DashboardModule {}