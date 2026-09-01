import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtPayload } from '../auth/jwt.strategy';
import { EnrollmentService } from './enrollment.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';

@UseGuards(JwtAuthGuard)
@Controller('enrollment')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateEnrollmentDto) {
    return this.enrollmentService.create(user.tenantId, dto);
  }

  @Get('institution/:institutionId')
  findForInstitution(
    @CurrentUser() user: JwtPayload,
    @Param('institutionId') institutionId: string,
  ) {
    return this.enrollmentService.findForInstitution(user.tenantId, institutionId);
  }
}
