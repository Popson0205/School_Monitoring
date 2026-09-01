import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtPayload } from '../auth/jwt.strategy';
import { FacilitiesService } from './facilities.service';
import { CreateFacilityDto } from './dto/create-facility.dto';

@UseGuards(JwtAuthGuard)
@Controller('facilities')
export class FacilitiesController {
  constructor(private readonly facilitiesService: FacilitiesService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateFacilityDto) {
    return this.facilitiesService.create(user.tenantId, dto);
  }

  @Get('institution/:institutionId')
  findForInstitution(
    @CurrentUser() user: JwtPayload,
    @Param('institutionId') institutionId: string,
  ) {
    return this.facilitiesService.findForInstitution(user.tenantId, institutionId);
  }
}
