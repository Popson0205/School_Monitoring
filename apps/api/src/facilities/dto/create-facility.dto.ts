import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { FacilityCategory, FacilityCondition } from '@prisma/client';

export class CreateFacilityDto {
  @IsUUID()
  @IsNotEmpty()
  institutionId: string;

  @IsEnum(FacilityCategory)
  category: FacilityCategory;

  @IsEnum(FacilityCondition)
  condition: FacilityCondition;

  @IsOptional()
  @IsString()
  notes?: string;
}
