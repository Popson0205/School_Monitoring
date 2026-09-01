import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtPayload } from '../auth/jwt.strategy';
import { SecurityIncidentsService } from './security-incidents.service';
import { CreateSecurityIncidentDto } from './dto/create-security-incident.dto';
import { UpdateIncidentStatusDto } from './dto/update-incident-status.dto';

@UseGuards(JwtAuthGuard)
@Controller('security-incidents')
export class SecurityIncidentsController {
  constructor(private readonly securityIncidentsService: SecurityIncidentsService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateSecurityIncidentDto) {
    return this.securityIncidentsService.create(user.tenantId, user.sub, dto);
  }

  @Get()
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('status') status?: string,
    @Query('severity') severity?: string,
  ) {
    return this.securityIncidentsService.findAll(user.tenantId, { status, severity });
  }

  @Patch(':id/status')
  updateStatus(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateIncidentStatusDto,
  ) {
    return this.securityIncidentsService.updateStatus(
      user.tenantId,
      id,
      dto.status,
      dto.responseNotes,
    );
  }
}
