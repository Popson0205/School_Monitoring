import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtPayload } from '../auth/jwt.strategy';
import { InterventionsService } from './interventions.service';
import { CreateInterventionDto } from './dto/create-intervention.dto';
import { UpdateInterventionStatusDto } from './dto/update-intervention-status.dto';

@UseGuards(JwtAuthGuard)
@Controller('interventions')
export class InterventionsController {
  constructor(private readonly interventionsService: InterventionsService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateInterventionDto) {
    return this.interventionsService.create(user.tenantId, user.sub, dto);
  }

  @Get()
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('status') status?: string,
    @Query('institutionId') institutionId?: string,
  ) {
    return this.interventionsService.findAll(user.tenantId, { status, institutionId });
  }

  @Patch(':id/status')
  updateStatus(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateInterventionStatusDto,
  ) {
    return this.interventionsService.updateStatus(user.tenantId, id, dto.status);
  }
}
