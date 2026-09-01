import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtPayload } from '../auth/jwt.strategy';
import { DashboardService } from './dashboard.service';

@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  summary(@CurrentUser() user: JwtPayload) {
    return this.dashboardService.summary(user.tenantId);
  }

  @Get('priority')
  priority(
    @CurrentUser() user: JwtPayload,
    @Query('regionId') regionId?: string,
    @Query('limit') limit?: string,
  ) {
    return this.dashboardService.priorityRanking(user.tenantId, {
      regionId,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }
}
