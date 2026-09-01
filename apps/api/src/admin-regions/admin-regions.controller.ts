import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtPayload } from '../auth/jwt.strategy';
import { AdminRegionsService } from './admin-regions.service';
import { CreateAdminRegionDto } from './dto/create-admin-region.dto';

@UseGuards(JwtAuthGuard)
@Controller('admin-regions')
export class AdminRegionsController {
  constructor(private readonly adminRegionsService: AdminRegionsService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateAdminRegionDto) {
    return this.adminRegionsService.create(user.tenantId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.adminRegionsService.findTree(user.tenantId);
  }
}
