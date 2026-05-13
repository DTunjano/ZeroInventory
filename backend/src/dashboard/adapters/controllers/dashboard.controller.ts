import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { JwtAuthGuard } from '../../../auth/adapters/guards/jwt-auth.guard'
import { RolesGuard } from '../../../auth/adapters/guards/roles.guard'
import { Roles } from '../../../auth/adapters/decorators/roles.decorator'
import { RolNombreEnum } from '../../../rol/domain/entity/rol.entity'
import { GetAdminDashboardUseCase } from '../../application/use-cases/get-admin-dashboard.use-case'

@ApiTags('Admin Dashboard')
@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RolNombreEnum.ADMIN)
export class DashboardController {
  constructor(private readonly getAdminDashboardUseCase: GetAdminDashboardUseCase) {}

  @Get()
  async getOverview() {
    return this.getAdminDashboardUseCase.ejecutar()
  }
}