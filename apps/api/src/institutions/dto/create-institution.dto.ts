import { IsEnum, IsLatitude, IsLongitude, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { InstitutionType, OwnershipType } from '@prisma/client';

export class CreateInstitutionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(InstitutionType)
  type: InstitutionType;

  @IsEnum(OwnershipType)
  ownership: OwnershipType;

  @IsLatitude()
  lat: number;

  @IsLongitude()
  lng: number;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsUUID()
  regionId?: string;
}
