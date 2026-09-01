import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { InterventionType, InterventionStatus, InterventionPriority } from '@prisma/client';

class ResourceItemDto {
  @IsString()
  @IsNotEmpty()
  item: string;

  @IsNumber()
  @Min(0)
  quantity: number;
}

export class CreateInterventionDto {
  @IsUUID()
  @IsNotEmpty()
  institutionId: string;

  @IsEnum(InterventionType)
  type: InterventionType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(InterventionStatus)
  status?: InterventionStatus;

  @IsOptional()
  @IsEnum(InterventionPriority)
  priority?: InterventionPriority;

  @IsOptional()
  @IsNumber()
  @Min(0)
  budget?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResourceItemDto)
  resources?: ResourceItemDto[];

  @IsOptional()
  @IsDateString()
  plannedDate?: string;
}
