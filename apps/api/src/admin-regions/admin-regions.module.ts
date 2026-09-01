import { Module } from '@nestjs/common';
import { AdminRegionsService } from './admin-regions.service';
import { AdminRegionsController } from './admin-regions.controller';

@Module({
  controllers: [AdminRegionsController],
  providers: [AdminRegionsService],
  exports: [AdminRegionsService],
})
export class AdminRegionsModule {}
