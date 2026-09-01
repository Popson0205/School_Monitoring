import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { SecurityIncidentType, SecuritySeverity } from '@prisma/client';

export class CreateSecurityIncidentDto {
  @IsUUID()
  @IsNotEmpty()
  institutionId: string;

  @IsEnum(SecurityIncidentType)
  type: SecurityIncidentType;

  @IsEnum(SecuritySeverity)
  severity: SecuritySeverity;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  occurredAt: string;
}
