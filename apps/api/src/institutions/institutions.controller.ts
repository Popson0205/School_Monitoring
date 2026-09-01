import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtPayload } from '../auth/jwt.strategy';
import { InstitutionsService } from './institutions.service';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { UpdateInstitutionDto } from './dto/update-institution.dto';

@UseGuards(JwtAuthGuard)
@Controller('institutions')
export class InstitutionsController {
  constructor(private readonly institutionsService: InstitutionsService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateInstitutionDto) {
    return this.institutionsService.create(user.tenantId, dto);
  }

  @Get()
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('regionId') regionId?: string,
    @Query('type') type?: string,
  ) {
    return this.institutionsService.findAll(user.tenantId, { regionId, type });
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.institutionsService.findOne(user.tenantId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateInstitutionDto,
  ) {
    return this.institutionsService.update(user.tenantId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.institutionsService.remove(user.tenantId, id);
  }
}
