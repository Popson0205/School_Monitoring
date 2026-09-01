import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { AdminRegionsModule } from '../admin-regions/admin-regions.module';

@Module({
  imports: [AdminRegionsModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
