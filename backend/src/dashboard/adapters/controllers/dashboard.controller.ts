import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { GetAdminDashboardUseCase } from '../../application/use-cases/get-admin-dashboard.use-case'
import { JwtAuthGuard } from '../../../auth/adapters/guards/jwt-auth.guard'
import { RolesGuard } from '../../../auth/adapters/guards/roles.guard'
import { Roles } from '../../../auth/adapters/decorators/roles.decorator'
import { RolNombreEnum } from '../../../rol/domain/entity/rol.entity'

@ApiTags('Admin Dashboard')
@Controller('admin/dashboard')
export class DashboardController {
  constructor(private readonly getAdminDashboardUseCase: GetAdminDashboardUseCase) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolNombreEnum.ADMIN)
  async getOverview() {
    return this.getAdminDashboardUseCase.ejecutar()
  }
}